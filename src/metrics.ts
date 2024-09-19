/**
 * computeMetrics is the only externally accessible function from this file. It facilitates running
 * multiple metrics in parallel. To add a metric calculation, create a function definition that follows the 
 * typing (type metricFunction) and add the function name to the metrics array. Metric functions must be 
 * asynchronous (return promises). metricSample shows how to make a synchronous function asynchronous.
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

dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const ESLINT_CONFIG = path.join(process.cwd(), 'src', 'eslint_package.config.mjs');

/**
 * @type metricFunction
 * @description Type for metric calculating functions, should only return the result of the calculation.
 */
type metricFunction = (packageUrl: string, packagePath: string) => Promise<number>;
const metrics: metricFunction[] = [busFactor, maintainerActiveness, correctness];

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
                    const finalResult: packageResult = {
                        URL: packageUrl,
                        NetScore: results.reduce((acc, curr) => acc + curr[Object.keys(curr)[0]], 0) / metrics.length,
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
    const dependencyScore = await dependencyAnalysis(packagePath);
    const lintingScore = await linting(packagePath);
    return (lintingScore + dependencyScore) * 0.5;
}

/**
 * @function dependencyAnalysis
 * @description Perform dependency analysis on the package, by running npm audit in each directory with a package.json file.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {number[]} - The number of dependencies with each vulnerability level (low, moderate, high, critical).
 */
async function dependencyAnalysis(packagePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        /* This does "shell out" the npm audit command, however this was done because:
        *  1. The command is not based on user inputs.
        *  2. I could not find a suitable library for running npm commands.
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
                    }
                }
            }
            if (packageJson.devDependencies) {
                for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
                    if (typeof version === 'string' && version.trim().startsWith('link')) {
                        packageJson.devDependencies[dep] = 'file' + version.trim().slice(4);
                    }
                }
            }
            fs.writeFile(path.join(packagePath, 'package.json'), JSON.stringify(packageJson), (err) => {
                if (err) {
                    reject(new Error(`Error writing package.json: ${err}`));
                }
                /* Run npm audit in the package directory - force just in case their dependencies have conflicts */
                const audit = spawn('npm', ['audit', '--no-package-lock', '--force', '--json'], { cwd: packagePath });
                let jsonFromAudit = "";

                audit.stdout.on('data', (data) => {
                    jsonFromAudit += data;
                });

                audit.on('close', () => {
                    try {
                        const auditData = JSON.parse(jsonFromAudit);
                        const vulnerabilitiesJson = auditData.metadata.vulnerabilities;
                        const levels = ['low', 'moderate', 'high', 'critical'];
                        const vulnerabilities: number[] = [];
                        for (let i = 0; i < levels.length; i++) {
                            vulnerabilities[i] = vulnerabilitiesJson[levels[i]] || 0;
                        }
                        const auditScore = 1 - vulnerabilities.reduce((acc, curr, idx) => acc * (curr * (0.5 - idx / 10)), 1);
                        resolve(auditScore);
                    } catch (error) {
                        reject(new Error(`Error parsing npm audit JSON: ${error}`));
                    }
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
 * @function license
 * @description A metric that calculates if the package has a conforming LGPLv2.1 license
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {Promise<number>} - The score for busFactor, calculated as int(isCompatible(license, LGPLv2.1))
 */

export async function license(packageUrl: string, packagePath: string): Promise<number> {

    let score = 0;

    const[owner, packageName] = getOwnerAndPackageName(packageUrl);
    try {
        if (GITHUB_TOKEN == '') throw new Error('No GitHub token specified');
        score = 1;
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

export default computeMetrics;
