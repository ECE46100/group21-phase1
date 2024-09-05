// import { spawn } from 'child_process';
// import * as fs from 'fs';
import * as threading from 'worker_threads';
import { cpus } from 'os';

/**
 * @type metricFunction
 * @description Type for metric calculating functions, should only return the result of the calculation.
 */
type metricFunction = () => number;
const metrics: metricFunction[] = [metricSample];

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
} & metricPair;

/**
 * @function computeMetrics
 * @description This function is used to compute the metrics of a package.
 * @returns {packageResult} - A map describing the package, including the scores and latencies of the metrics.
 */
function computeMetrics(): packageResult {
    /* start the timer for netscore latency */
    const startTime = Date.now();
    /* compute the number of cores */
    const cores = cpus.length;
    let metricThreads = Array<threading.Worker>;

    /* start two worker threads for each core */
    for (let i = 0; i < Math.min(cores, 2 * metrics.length); i++) {
        /* start a worker thread */
        const newWorker = new threading.Worker(__filename, { workerData: metrics[i % metrics.length] });
        
        /* when the worker thread finishes, add the result to the metrics array */
    }
    
    /* when a worker thread finishes start another one */
    /* when all worker threads finish, stop the timer and return */
}

/**
 * @function metricsRunner
 * @param metricFunction - The function to run to collect a given metric.
 * @returns {number[]} - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
 */
function metricsRunner(metricFn: metricFunction): number[] {
    /* start the timer */
    const score: number = metricFn();
    /* stop the timer */
    return [score, 0];
}

/**
 * @function metricSample
 * @description This function is used to sample a metric.
 * @returns {number} score - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
 */
function metricSample(): number {
    const score = 0.5;

    return score;
};

export default computeMetrics;
