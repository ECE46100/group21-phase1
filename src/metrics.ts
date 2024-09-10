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

/**
 * @type metricFunction
 * @description Type for metric calculating functions, should only return the result of the calculation.
 */
type metricFunction = (packageUrl: string, packagePath: string) => Promise<number>;
const metrics: metricFunction[] = [metricSample, metricSample_1];

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
async function metricsRunner(metricFn: metricFunction, packagePath: string, packageUrl: string): Promise<number[]> {
    /* start the timer */
    const startTime = Date.now();
    const score: number = await metricFn(packagePath, packageUrl);
    /* stop the timer */
    const latency = (Date.now() - startTime) / 1000;

    return [score, latency];
}

/**
 * @function metricSample
 * @description This function is used to sample a metric.
 * @returns {number} score - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
 */
function metricSample(): Promise<number> {
    const score = 0.5;
    return new Promise((resolve) => { resolve(score); });
};

function metricSample_1(): Promise<number> {
    const score = 1;
    return new Promise((resolve) => { setTimeout(() => { resolve(score); }, 1000); });
}


if (!threading.isMainThread) {
    const { metricIndex, url, path } = threading.workerData as { metricIndex: number, url: string, path: string };
    const metric = metrics[metricIndex];
    threading.parentPort?.once('message', (childPort: {hereIsYourPort: threading.MessagePort}) => {
        metricsRunner(metric, path, url).then((metricResult) => {
            childPort.hereIsYourPort.postMessage({ metricName: metric.name, result: metricResult });
            childPort.hereIsYourPort.close();
        }).catch((error: unknown) => {
            console.error(error);
            childPort.hereIsYourPort.close();
        });
    });
    
}

export default computeMetrics;
