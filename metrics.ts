import { spawn } from 'child_process';
import * as fs from 'fs';
import * as threading from 'worker_threads';

type metricFunction = () => number;

interface metricPair {
    [key: string]: number;
    [key: `${string}_Latency`]: number;
};
  
type packageResult = {
    URL: string;
    NetScore: number;
    NetScore_Latency: number;
} & metricPair;

/**
 * @class metrics
 * @description This class is used to collect metrics from an npm package.
 * @param {string} packagePath - The path to the local package repo (if there is one).
 * @param {string} packageUrl - The URL of the package to collect metrics from.
 */
class metrics {
    packagePath: string;
    packageUrl: string;
    metrics: metricFunction[];

    constructor(packagePath: string, packageUrl: string) {
        this.packagePath = packagePath;
        this.packageUrl = packageUrl;
        this.metrics = [];
    }

    /**
     * @function computeMetrics
     * @description This function is used to compute the metrics of a package.
     * @returns { packageResult } - A map describing the package, including the scores and latencies of the metrics.
     */
    computeMetrics(): packageResult {
        /* start the timer for netscore latency */
        /* compute the number of cores */
        /* start a two worker threads for each core */
    }
    
    /**
     * @function metricsRunner
     * @param metricFunction - The function to run to collect a given metric.
     * @returns {number[]} - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
     */
    metricsRunner(metricFn: metricFunction): number[] {
        const score: number = metricFn();

        return [score, 0];
    }

    /**
     * @function metricSample
     * @description This function is used to sample a metric.
     * @returns {number} score - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
     * 
     */
    metricSample: metricFunction = (): number => {
        const score = 0.5;

        return score;
    }
}

export default metrics;
