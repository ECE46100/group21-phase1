/**
 * computeMetrics is the only externally accessible function from this file. It facilitates running
 * multiple metrics in parallel. To add a metric calculation, create a function definition that follows the 
 * typing (type metricFunction) and add the function name to the metrics array. Metric functions must be 
 * asynchronous (return promises). metricSample shows how to make a synchoronous function asynchronous.
 */

// import { spawn } from 'child_process';
// import * as fs from 'fs';
import * as threading from 'worker_threads';
import { cpus } from 'os';
import axios from 'axios';
import { handleOutput, getOwnerAndPackageName } from './util';
import * as dotenv from 'dotenv';
dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

/**
 * @type metricFunction
 * @description Type for metric calculating functions, should only return the result of the calculation.
 */
type metricFunction = (packageUrl: string, packagePath: string) => Promise<number>;
const metrics: metricFunction[] = [busFactor, maintainerActiveness];

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
        const cores = cpus().length;
        const maxWorkers = Math.min(cores, 2 * metrics.length);
        const metricThreads: threading.Worker[] = [];
        const results: metricPair[] = [];
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
                        NetScore_Latency: results.reduce((acc, curr) => acc + curr[`${Object.keys(curr)[0]}_Latency`], 0) / metrics.length,
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
        const totalIssues = await countIssue(owner, packageName, 'all');
        const openIssues = await countIssue(owner, packageName, 'open');

        if (totalIssues === 0) {
            return 1; /* No issue at all, the score here can be changed later */
        }

        score = 1 - (openIssues / totalIssues);
    } catch (error) {
        throw new Error(`Error calculating maintaine activeness\nError message : ${error}`)
    }

    return score;
};

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
        console.error(`Error calculating activeContributorsMetric: ${error}`);
        return 0;
    }
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
            childPort.hereIsYourPort.close();
        });
    });
    
}

export default computeMetrics;
