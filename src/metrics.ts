/*
    computeMetrics is the only externally accessible function from this file. It facilitates running
    multiple metrics in parallel. To add a metric calculation, create a function definition that follows the 
    typing (type metricFunction) and add the function name to the metrics array. Metric functions must be 
    asynchronous (return promises). metricSample shows how to make a synchronous function asynchronous.
*/

import * as threading from 'worker_threads';
import * as path from 'path';
import { cpus } from 'os';
import { spawn } from 'child_process';
import axios from 'axios';
import { handleOutput, getOwnerAndPackageName } from './util';
import * as dotenv from 'dotenv';
import { ESLint } from 'eslint';
import * as fs from 'fs';
import * as winston from 'winston';

dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const ESLINT_CONFIG = path.join(process.cwd(), 'src', 'eslint_package.config.mjs');

const log_levels = ['warn', 'info', 'debug'];
const LOG_LEVEL: number = parseInt(process.env.LOG_LEVEL ?? '0', 10);
const LOG_FILE = process.env.LOG_FILE;

winston.configure({
    level: log_levels[LOG_LEVEL],
    transports: [
        new winston.transports.File({ filename: LOG_FILE })
    ]
});
winston.remove(winston.transports.Console);

/**
 * @type metricFunction
 * @description Type for metric calculating functions, should only return the result of the calculation.
 */
type metricFunction = (packageUrl: string, packagePath: string) => Promise<number>;
const metrics: metricFunction[] = [
    busFactor,
    maintainerActiveness,
    correctness
];

const weights: Record<string, number> = { busFactor: 0.3, maintainerActiveness: 0.3, correctness: 0.4 };

/**
 * @interface metricPair
 * @description Type for a metric result, one for the score and one for the latency.
 */
interface metricPair {
    [key: string]: number;
    [key: `${string}_Latency`]: number;
};

/**
 * @type packageResult
 * @description Type for the result of the metrics computation.
 */
type packageResult = {
    URL: string;
    NetScore: number;
    NetScore_Latency: number;
} | metricPair;

/**
 * @function computeMetrics
 * @description This function is used to compute the metrics of a package.
 * @returns {packageResult} - A map describing the package, including the scores and latencies of the metrics.
 */
async function computeMetrics(packageUrl: string, packagePath: string): Promise<packageResult> {
    return new Promise((resolve, reject) => {
        /* Get the number of cores available - picked two metrics per core */
        const cores = cpus().length;
        const maxWorkers = Math.min(cores, 2 * metrics.length);
        const metricThreads: threading.Worker[] = [];
        const results: metricPair[] = [];
        const netScoreStart = Date.now();
        let completed = 0;
        let started = 0;

        function startNewWorker(metricIndex: number) {
            if (metricIndex >= metrics.length) {
                return;
            }

            const newWorker = new threading.Worker(__filename, {
                workerData: {
                    metricIndex: metricIndex, url: packageUrl, path: packagePath
                },
            });

            const subChannel = new threading.MessageChannel();
            newWorker.postMessage({ hereIsYourPort: subChannel.port1 }, [subChannel.port1]);

            subChannel.port2.on('message', (message: { metricName: string, result: [number, number] }) => {
                results.push({
                    [message.metricName]: message.result[0],
                    [`${message.metricName}_Latency`]: message.result[1]
                });
                completed++;

                if (completed === metrics.length) {
                    const netScore = results.reduce((acc, curr) => {
                        const metricName: string = Object.keys(curr)[0];
                        const metricScore = Math.max(0, curr[metricName]);
                        const metricWeight = weights[metricName];
                        return acc + metricScore * metricWeight;
                    }, 0);
                    const finalResult: packageResult = {
                        URL: packageUrl,
                        NetScore: netScore,
                        NetScore_Latency: (Date.now() - netScoreStart) / 1000,
                        ...results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
                    };
                    const terminationPromises = metricThreads.map(worker => worker.terminate());
                    
                    Promise.all(terminationPromises).then(() => {
                        resolve(finalResult);
                    }).catch((error: unknown) => { console.log(error) });
                } else {
                    startNewWorker(started++);
                }
            });

            newWorker.on('error', (err) => {
                reject(err);
            });

            metricThreads.push(newWorker);
            started++;
        }

        for (let i = 0; i < maxWorkers; i++) {
            startNewWorker(i);
        }
    });
}

/**
 * @function metricsRunner
 * @param metricFunction - The function to run to collect a given metric.
 * @returns {number[]} - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
 */
async function metricsRunner(metricFn: metricFunction, packageUrl: string, packagePath: string): Promise<number[]> {
    /* start the timer */
    const startTime = Date.now();
    const score: number = await metricFn(packageUrl, packagePath);
    /* stop the timer */
    const latency = (Date.now() - startTime) / 1000;

    return [score, latency];
}

/**
 * @function countIssue
 * @description A function that returns #issues in 'state'(ex: closed) from given repo information using GH API
 * @param {string} owner - the owner of the repo, we use this to construct the endpoint for API call
 * @param {string} packageName - package's name, used to construct API as well
 * @param {string} status - the status of the kinf of issue we want to get, like 'closed'
 * @returns {number} count - the number of issue in the status specified
 */
async function countIssue(owner: string, repo: string, state: string): Promise<number> {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            },
            params: {
                per_page: 1 /* Avoid fetching full data by looking at only the "Link" header for pagination */
            }
        });
        
        const linkHeader = response.headers.link;
        if (linkHeader) {
            /* Parse the "last" page from the pagination links */
            const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
            if (lastPageMatch) {
                return parseInt(lastPageMatch[1], 10);
            }
        }
        return response.data.length;
    } catch (error) {
        console.error(`Error fetching ${state} issues for ${owner}/${repo}:`, error);
        return 0;
    }
}

/**
 * @function maintainerActiveness
 * @description A metric that uses GH API to get (1- #openIssue/#allIssue) as maintainerActiveness score.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {number} score - The score for maintainerActiveness, calculated as (1- #openIssue/#allIssue), 
 *                           if no issue was found it returns 1.
 */
async function maintainerActiveness(packageUrl: string, packagePath: string): Promise<number> {
    let score = 0;
    const[owner, packageName] = getOwnerAndPackageName(packageUrl);
    try {
        if (GITHUB_TOKEN == '') throw new Error('No GitHub token specified');
        const totalIssues = await countIssue(owner, packageName, 'all');
        const openIssues = await countIssue(owner, packageName, 'open');

        if (totalIssues === 0) {
            return 1; /* No issue at all, the score here can be changed later */
        }

        score = 1 - (openIssues / totalIssues);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error calculating maintainerActivenessMetric: ${error.message}`);
        } else {
            console.error('Error calculating maintainerActivenessMetric:', error);
        }
        return 0;
    }

    return score;
}

/**
 * @function busFactor
 * @description A metric that calculates the number of contributors with 5+ commits in the last year.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {Promise<number>} - The score for busFactor, calculated as max(1, (#contributors who made 5+ commits last year / 10))
 */
async function busFactor(packageUrl: string, packagePath: string): Promise<number> {
    const[owner, packageName] = getOwnerAndPackageName(packageUrl);
    try {
        if (GITHUB_TOKEN == '') throw new Error('No GitHub token specified');
        /* Trace back at most a year from today */
        const since = new Date();
        since.setFullYear(since.getFullYear() - 1);
        const url = `https://api.github.com/repos/${owner}/${packageName}/commits`;
        const response = await axios.get(url, {
            params: {
                since: since.toISOString(),
                per_page: 100, /* This is just a rough guess */
            },
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            }
        });

        const commits = response.data;

        if (!commits || commits.length === 0) return 0; /* No contributors found in the last year */

        /* Map to keep track of each contributor's commit count */
        const contributorCommits: { [key: string]: number } = {};

        /* Count commits per author */
        commits.forEach((commit: any) => {
            const author = commit.author?.login;
            if (author) {
                contributorCommits[author] = (contributorCommits[author] || 0) + 1;
            }
        });

        /* Filter contributors with 5+ commits */
        const activeContributors = Object.values(contributorCommits).filter(commitCount => commitCount >= 5).length;
        const score = activeContributors >= 10 ? 1 : activeContributors / 10;

        return score;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error calculating activeContributorsMetric: ${error.message}`);
        } else {
            console.error('Error calculating activeContributorsMetric:', error);
        }
        if (error instanceof Error) {
            console.error(`Error calculating activeContributorsMetric: ${error.message}`);
        } else {
            console.error('Error calculating activeContributorsMetric:', error);
        }
        return 0;
    }
}

/**
 * @function correctness
 * @description A metric that calculates the "correctness" of the package through a combination of dependency analysis and linting
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {number} - The score for correctness, calculated as a weighted sum of the dependency and linting scores.
 */
async function correctness(packageUrl: string, packagePath: string): Promise<number> {
    winston.log('info', "Calculating correctness metric");
    const dependencyScore = await dependencyAnalysis(packagePath);
    winston.log('info', `Dependency score calculated, ${dependencyScore}`);
    const lintingScore = await linting(packagePath);
    winston.log('info', `Linting score calculated, ${lintingScore}`);
    return Math.max(0, (lintingScore + dependencyScore) * 0.5);
}

/**
 * @function dependencyAnalysis
 * @description Perform dependency analysis on the package, by running npm audit in each directory with a package.json file.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {number[]} - The number of dependencies with each vulnerability level (low, moderate, high, critical).
 */
async function dependencyAnalysis(packagePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        /* 
            This does "shell out" the npm audit command, however this was done because:
            1. The command is not based on user inputs.
            2. I could not find a suitable library for running npm commands.
        */
        fs.readFile(path.join(packagePath, 'package.json'), 'utf8', (err, data) => {
            if (err) {
                reject(new Error(`Error reading package.json: ${err}`));
            }
            const packageJson = JSON.parse(data);
            /* Replace link with file (if they exist) - yarn supports 'link' but npm does not */
            if (packageJson.dependencies) {
                for (const [dep, version] of Object.entries(packageJson.dependencies)) {
                    if (typeof version === 'string' && version.trim().startsWith('link')) {
                        packageJson.dependencies[dep] = 'file' + version.trim().slice(4);
                        winston.log('debug', `Replacing link with file for ${dep}`);
                    }
                }
            }
            if (packageJson.devDependencies) {
                for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
                    if (typeof version === 'string' && version.trim().startsWith('link')) {
                        packageJson.devDependencies[dep] = 'file' + version.trim().slice(4);
                        winston.log('debug', `Replacing link with file for ${dep}`);
                    }
                }
            }
            fs.writeFile(path.join(packagePath, 'package.json'), JSON.stringify(packageJson), (err) => {
                if (err) {
                    reject(new Error(`Error writing package.json: ${err}`));
                }
                /* 
                    Run npm audit in the package directory - use legacy just in case their dependencies have conflicts 
                    Installing first is faster (not sure why).
                */
                const install = spawn('npm', ['install', '--package-lock-only', '--legacy-peer-deps'], { cwd: packagePath });
                install.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Error running npm install: ${code}`));
                    }
                    const audit = spawn('npm', ['audit', '--json'], { cwd: packagePath });
                    let jsonFromAudit = "";

                    audit.stdout.on('data', (data) => {
                        jsonFromAudit += data;
                    });

                    audit.on('close', () => {
                        try {
                            const auditData = JSON.parse(jsonFromAudit);
                            const vulnerabilitiesJson = auditData.metadata.vulnerabilities;
                            winston.log('debug', `Vulnerabilities found: ${JSON.stringify(vulnerabilitiesJson)}`);
                            const levels = ['low', 'moderate', 'high', 'critical'];
                            const vulnerabilities: number[] = [];
                            for (let i = 0; i < levels.length; i++) {
                                vulnerabilities[i] = vulnerabilitiesJson[levels[i]] || 0;
                            }
                            winston.log('debug', `Vulnerabilities: ${vulnerabilities}`);
                            const auditScore = 1 - vulnerabilities.reduce((acc, curr, idx) => acc + (curr * (0.02 + idx / 50)), 0);
                            resolve(auditScore);
                        } catch (error) {
                            reject(new Error(`Error parsing npm audit JSON: ${error}`));
                        }
                    });
                });
            });
        });
    });
}

/**
 * @function linting
 * @description Perform linting on the package, using ESLint.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {number} - The score for linting, based on the number of linter errors.
 */
async function linting(packagePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        /* Create a new ESLint instance - see eslint_package.config.mjs for linter configuration */
        const eslint = new ESLint({
            overrideConfigFile: ESLINT_CONFIG,
            allowInlineConfig: true,
            globInputPaths: true,
            ignore: true,
        });
        /* Look for all js and ts files in the package */
        const pattern = path.join(packagePath, '**/*.{js,ts}');

        /* Run the linter and sum the error counts */
        eslint.lintFiles(pattern).then((results) => {
            winston.log('debug', `Linting results: ${JSON.stringify(results)}`);
            const errorCount = results.reduce((acc, curr) => acc + curr.errorCount, 0);
            const filesLinted = results.length;
            const lintScore = 1 - (errorCount / filesLinted / 10);
            resolve(lintScore);
        }).catch((error: unknown) => {
            reject(new Error(`Error running ESLint: ${error}`));
        });
    });
}

/**
 * @function rampUpTime
 * @description Calculates the ramp-up time based on the presence of documentation and code comments.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {Promise<number>} - The score for ramp-up time between 0 and 1.
 */
async function rampUpTime(packageUrl: string, packagePath: string): Promise<number> {
    const fs = require('fs');
    const path = require('path');
    
    /* Analyze README, can either make readmeScore 0 if there's error or simply throw an error and skip the rampUpTime function */
    const readmePath = findReadmeFile(packagePath);
    let readmeScore = 0;
    if (readmePath) {
        try {
            const readmeContent = fs.readFileSync(readmePath, 'utf-8');
            readmeScore = readmeContent.length > 1500 ? 1 : (readmeContent.length > 1000 ? 0.75 : (readmeContent.length > 500 ? 0.5 : 0.25));
        } catch (error) {
            //console.error("Error reading README file", error);
            readmeScore = 0;
        }
    } else {
        // console.warn('No README found in the repository');
        readmeScore = 0;
    }


    /* Analyze code comments */
    const codeFiles = getAllCodeFiles(packagePath); // Function to get all relevant code files
    const { commentLines, totalLines } = analyzeCodeComments(codeFiles);

    /* Calculate comment density score (assuming >10% comment lines is a good ratio) */
    const commentDensity = commentLines / totalLines;
    const commentScore = commentDensity > 0.2 ? 1 : (commentDensity > 0.15 ? 0.75 : (commentDensity > 0.1 ? 0.5 : 0.25));

    /* Combine the scores (adjust weights as necessary) */
    const rampUpScore = 0.5 * readmeScore + 0.5 * commentScore;
    return Promise.resolve(rampUpScore);
}

/**
 * @function findReadmeFile
 * @description Recursively searches for a README file in the repository.
 * @param {string} dir - The directory to start the search from.
 * @returns {string | null} - The path to the README file, or null if not found.
 */
function findReadmeFile(dir: string): string | null {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const found = findReadmeFile(fullPath);
            if (found) return found;
        } else if (file.toLowerCase().startsWith('readme')) {
            return fullPath;
        }
    }

    return null;
}

/**
 * @function getAllCodeFiles
 * @description Recursively finds all relevant code files in a directory (e.g., .js, .ts files).
 * @param {string} dir - The directory to search for code files.
 * @returns {string[]} - A list of file paths.
 */
function getAllCodeFiles(dir: string): string[] {
    const fs = require('fs');
    const path = require('path');
    let codeFiles: string[] = [];

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            codeFiles = codeFiles.concat(getAllCodeFiles(fullPath)); // Recursive search
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            codeFiles.push(fullPath);
        }
    }
    return codeFiles;
}

/**
 * @function analyzeCodeComments
 * @description Analyzes the number of comment lines and total lines of code in the given files.
 * @param {string[]} files - List of code file paths.
 * @returns {{commentLines: number, totalLines: number}} - The number of comment lines and total lines of code.
 */
function analyzeCodeComments(files: string[]): { commentLines: number, totalLines: number } {
    const fs = require('fs');
    let commentLines = 0;
    let totalLines = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        totalLines += lines.length;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
                commentLines++;
            }
        }
    }

    return { commentLines, totalLines };
}


/**
 * @function license
 * @description A metric that calculates if the package has a conforming LGPLv2.1 license
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {Promise<number>} - The score for busFactor, calculated as int(isCompatible(license, LGPLv2.1))
 */

async function license(packageUrl: string, packagePath: string): Promise<number> {

    let score = 0;

    const[owner, packageName] = getOwnerAndPackageName(packageUrl);

    try {
        if (GITHUB_TOKEN == '') throw new Error('No GitHub token specified');
        const url = `https://api.github.com/repos/${owner}/${packageName}/license`;
 
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${GITHUB_TOKEN}`,
            }
        });
        
        if (response.data.license?.spdx_id == 'LGPL-2.1' || response.data.license?.spdx_id == 'LGPL-2.1-only' || response.data.license?.spdx_id == 'MIT') {
            score = 1;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error calculating licenseMetric: ${error.message}`);
        } else {
            console.error('Error calculating licenseMetric:', error);
        }
        return 0;
    }
    return score;
}


if (!threading.isMainThread) {
    const { metricIndex, url, path } = threading.workerData as { metricIndex: number, url: string, path: string };
    const metric = metrics[metricIndex];
    threading.parentPort?.once('message', (childPort: {hereIsYourPort: threading.MessagePort}) => {
        metricsRunner(metric, url, path).then((metricResult) => {
            childPort.hereIsYourPort.postMessage({ metricName: metric.name, result: metricResult });
            childPort.hereIsYourPort.close();
        }).catch((error: unknown) => {
            console.error(error);
            childPort.hereIsYourPort.postMessage({ metricName: metric.name, result: [-1, -1] });
            childPort.hereIsYourPort.close();
        });
    });
    
}

export { computeMetrics, license, correctness, linting, dependencyAnalysis };