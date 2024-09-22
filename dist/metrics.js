"use strict";
/*
    computeMetrics is the only externally accessible function from this file. It facilitates running
    multiple metrics in parallel. To add a metric calculation, create a function definition that follows the
    typing (type metricFunction) and add the function name to the metrics array. Metric functions must be
    asynchronous (return promises). metricSample shows how to make a synchronous function asynchronous.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.license_thru_files = void 0;
exports.computeMetrics = computeMetrics;
exports.correctness = correctness;
exports.linting = linting;
exports.dependencyAnalysis = dependencyAnalysis;
exports.rampUpTime = rampUpTime;
exports.license = license;
exports.busFactor = busFactor;
exports.maintainerActiveness = maintainerActiveness;
const threading = __importStar(require("worker_threads"));
const path = __importStar(require("path"));
const os_1 = require("os");
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const util_1 = require("./util");
const dotenv = __importStar(require("dotenv"));
const eslint_1 = require("eslint");
const fs = __importStar(require("fs"));
const winston = __importStar(require("winston"));
const license_test_1 = require("./license_test");
Object.defineProperty(exports, "license_thru_files", { enumerable: true, get: function () { return license_test_1.license_thru_files; } });
dotenv.config();
const GITHUB_TOKEN = (_a = process.env.GITHUB_TOKEN) !== null && _a !== void 0 ? _a : '';
const ESLINT_CONFIG = path.join(process.cwd(), 'src', 'eslint_package.config.mjs');
const log_levels = ['warn', 'info', 'debug'];
const LOG_LEVEL = parseInt((_b = process.env.LOG_LEVEL) !== null && _b !== void 0 ? _b : '0', 10);
const LOG_FILE = process.env.LOG_FILE;
winston.configure({
    level: log_levels[LOG_LEVEL],
    transports: [
        new winston.transports.File({ filename: LOG_FILE })
    ]
});
winston.remove(winston.transports.Console);
const metrics = [
    busFactor,
    maintainerActiveness,
    rampUpTime,
    correctness,
    license,
];
const weights = { busFactor: 0.25, license: 0.25, maintainerActiveness: 0.2, correctness: 0.1, rampUpTime: 0.2 };
;
/**
 * @function computeMetrics
 * @description This function is used to compute the metrics of a package.
 * @returns {packageResult} - A map describing the package, including the scores and latencies of the metrics.
 */
async function computeMetrics(packageUrl, packagePath) {
    return new Promise((resolve, reject) => {
        /* Get the number of cores available - picked two metrics per core */
        const cores = (0, os_1.cpus)().length;
        const maxWorkers = Math.min(cores, 2 * metrics.length);
        const metricThreads = [];
        const results = [];
        const netScoreStart = Date.now();
        let completed = 0;
        let started = 0;
        function startNewWorker(metricIndex) {
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
            subChannel.port2.on('message', (message) => {
                results.push({
                    [message.metricName]: message.result[0],
                    [`${message.metricName}_Latency`]: message.result[1]
                });
                completed++;
                if (completed === metrics.length) {
                    const netScore = results.reduce((acc, curr) => {
                        const metricName = Object.keys(curr)[0];
                        const metricScore = Math.max(0, curr[metricName]);
                        const metricWeight = weights[metricName];
                        return acc + metricScore * metricWeight;
                    }, 0);
                    const finalResult = Object.assign({ URL: packageUrl, NetScore: netScore, NetScore_Latency: (Date.now() - netScoreStart) / 1000 }, results.reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)), {}));
                    const terminationPromises = metricThreads.map(worker => worker.terminate());
                    Promise.all(terminationPromises).then(() => {
                        resolve(finalResult);
                    }).catch((error) => { console.log(error); });
                }
                else {
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
async function metricsRunner(metricFn, packageUrl, packagePath) {
    /* start the timer */
    const startTime = Date.now();
    const score = await metricFn(packageUrl, packagePath);
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
async function countIssue(owner, repo, state) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}`;
        const response = await axios_1.default.get(url, {
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
    }
    catch (error) {
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
async function maintainerActiveness(packageUrl, packagePath) {
    let score = 0;
    const [owner, packageName] = (0, util_1.getOwnerAndPackageName)(packageUrl);
    try {
        if (GITHUB_TOKEN == '')
            throw new Error('No GitHub token specified');
        const totalIssues = await countIssue(owner, packageName, 'all');
        const openIssues = await countIssue(owner, packageName, 'open');
        if (totalIssues === 0) {
            return 1; /* No issue at all, the score here can be changed later */
        }
        score = 1 - (openIssues / totalIssues);
    }
    catch (error) {
        throw new Error(`Error calculating maintaine activeness\nError message : ${error}`);
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
async function busFactor(packageUrl, packagePath) {
    const [owner, packageName] = (0, util_1.getOwnerAndPackageName)(packageUrl);
    try {
        if (GITHUB_TOKEN == '')
            throw new Error('No GitHub token specified');
        /* Trace back at most a year from today */
        const since = new Date();
        since.setFullYear(since.getFullYear() - 1);
        const url = `https://api.github.com/repos/${owner}/${packageName}/commits`;
        const response = await axios_1.default.get(url, {
            params: {
                since: since.toISOString(),
                per_page: 100, /* This is just a rough guess */
            },
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            }
        });
        const commits = response.data;
        if (!commits || commits.length === 0)
            return 0; /* No contributors found in the last year */
        /* Map to keep track of each contributor's commit count */
        const contributorCommits = {};
        /* Count commits per author */
        commits.forEach((commit) => {
            var _a;
            const author = (_a = commit.author) === null || _a === void 0 ? void 0 : _a.login;
            if (author) {
                contributorCommits[author] = (contributorCommits[author] || 0) + 1;
            }
        });
        /* Filter contributors with 5+ commits */
        const activeContributors = Object.values(contributorCommits).filter(commitCount => commitCount >= 5).length;
        const score = activeContributors >= 10 ? 1 : activeContributors / 10;
        return score;
    }
    catch (error) {
        console.error(`Error calculating activeContributorsMetric: ${error}`);
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
async function correctness(packageUrl, packagePath) {
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
async function dependencyAnalysis(packagePath) {
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
                const install = (0, child_process_1.spawn)('npm', ['install', '--package-lock-only', '--legacy-peer-deps'], { cwd: packagePath });
                install.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Error running npm install: ${code}`));
                    }
                    const audit = (0, child_process_1.spawn)('npm', ['audit', '--json'], { cwd: packagePath });
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
                            const vulnerabilities = [];
                            for (let i = 0; i < levels.length; i++) {
                                vulnerabilities[i] = vulnerabilitiesJson[levels[i]] || 0;
                            }
                            winston.log('debug', `Vulnerabilities: ${vulnerabilities}`);
                            const auditScore = 1 - vulnerabilities.reduce((acc, curr, idx) => acc + (curr * (0.02 + idx / 50)), 0);
                            resolve(Math.max(auditScore, 0));
                        }
                        catch (error) {
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
async function linting(packagePath) {
    return new Promise((resolve, reject) => {
        /* Create a new ESLint instance - see eslint_package.config.mjs for linter configuration */
        const eslint = new eslint_1.ESLint({
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
            resolve(Math.max(lintScore, 0));
        }).catch((error) => {
            reject(new Error(`${error}`));
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
async function rampUpTime(packageUrl, packagePath) {
    /* Analyze README, can either make readmeScore 0 if there's error or simply throw an error and skip the rampUpTime function */
    const readmePath = findReadmeFile(packagePath);
    let readmeScore = 0;
    if (readmePath) {
        try {
            const readmeContent = fs.readFileSync(readmePath, 'utf-8');
            readmeScore = readmeContent.length > 1500 ? 1 : (readmeContent.length > 1000 ? 0.75 : (readmeContent.length > 500 ? 0.5 : 0.25));
        }
        catch (error) {
            //console.error("Error reading README file", error);
            readmeScore = 0;
        }
    }
    else {
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
 * @description Recursively searches for a README file in the repository, skipping symbolic links.
 * @param {string} dir - The directory to start the search from.
 * @returns {string | null} - The path to the README file, or null if not found.
 */
function findReadmeFile(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.lstatSync(fullPath);
        if (stat.isSymbolicLink()) {
            // Skip symbolic links to avoid loops
            //console.warn(`Skipping symbolic link: ${fullPath}`);
            continue;
        }
        if (stat.isDirectory()) {
            const found = findReadmeFile(fullPath);
            if (found)
                return found;
        }
        else if (file.toLowerCase().startsWith('readme')) {
            return fullPath;
        }
    }
    return null;
}
/**
 * @function getAllCodeFiles
 * @description Recursively finds all relevant code files in a directory (e.g., .js, .ts files), skipping symlinks.
 * @param {string} dir - The directory to search for code files.
 * @returns {string[]} - A list of file paths.
 */
function getAllCodeFiles(dir) {
    let codeFiles = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.lstatSync(fullPath);
        if (stat.isSymbolicLink()) {
            //console.warn(`Skipping symbolic link: ${fullPath}`);
            continue;
        }
        if (stat.isDirectory()) {
            codeFiles = codeFiles.concat(getAllCodeFiles(fullPath)); // Recursive search in subdirectories
        }
        else if (file.endsWith('.ts') || file.endsWith('.js')) {
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
function analyzeCodeComments(files) {
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
 * @returns {Promise<number>} - The score for license, calculated as int(isCompatible(license, LGPLv2.1))
 */
async function license(packageUrl, packagePath) {
    var _a, _b, _c;
    let score = 0;
    const [owner, packageName] = (0, util_1.getOwnerAndPackageName)(packageUrl);
    try {
        if (GITHUB_TOKEN == '')
            throw new Error('No GitHub token specified');
        const url = `https://api.github.com/repos/${owner}/${packageName}/license`;
        const response = await axios_1.default.get(url, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${GITHUB_TOKEN}`,
            }
        });
        if (((_a = response.data.license) === null || _a === void 0 ? void 0 : _a.spdx_id) == 'LGPL-2.1' || ((_b = response.data.license) === null || _b === void 0 ? void 0 : _b.spdx_id) == 'LGPL-2.1-only' || ((_c = response.data.license) === null || _c === void 0 ? void 0 : _c.spdx_id) == 'MIT') {
            score = 1;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            await (0, license_test_1.license_thru_files)(owner, packageName, 'package.json');
            console.error(`Error calculating licenseMetric: ${error.message}`);
        }
        else {
            console.error('Error calculating licenseMetric:', error);
        }
        return score;
    }
    return score;
}
/**
 * @function license_thru_files
 * @description
 * @param {string} packageUrl -
 * @param {string} packagePath -
 * @returns {Promise<number>} -
 */
/*async function license_thru_files(owner: string, packageName: string, filepath: string): Promise<number> {
    const score = 0;
    try {
        const url = `https://api.github.com/repos/${owner}/${packageName}/contents/${filepath}`;
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${GITHUB_TOKEN}`,
            }
        });
        console.log(response.data);
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
}*/
if (!threading.isMainThread) {
    const { metricIndex, url, path } = threading.workerData;
    const metric = metrics[metricIndex];
    (_c = threading.parentPort) === null || _c === void 0 ? void 0 : _c.once('message', (childPort) => {
        metricsRunner(metric, url, path).then((metricResult) => {
            childPort.hereIsYourPort.postMessage({ metricName: metric.name, result: metricResult });
            childPort.hereIsYourPort.close();
        }).catch((error) => {
            childPort.hereIsYourPort.postMessage({ metricName: metric.name, result: [-1, -1] });
            childPort.hereIsYourPort.close();
        });
    });
}
