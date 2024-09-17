"use strict";
/**
 * computeMetrics is the only externally accessible function from this file. It facilitates running
 * multiple metrics in parallel. To add a metric calculation, create a function definition that follows the
 * typing (type metricFunction) and add the function name to the metrics array. Metric functions must be
 * asynchronous (return promises). metricSample shows how to make a synchoronous function asynchronous.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
// import { spawn } from 'child_process';
// import * as fs from 'fs';
var threading = require("worker_threads");
var os_1 = require("os");
var axios_1 = require("axios");
var util_1 = require("./util");
var dotenv = require("dotenv");
dotenv.config();
var GITHUB_TOKEN = (_a = process.env.GITHUB_TOKEN) !== null && _a !== void 0 ? _a : '';
var metrics = [busFactor, maintainerActiveness];
;
/**
 * @function computeMetrics
 * @description This function is used to compute the metrics of a package.
 * @returns {packageResult} - A map describing the package, including the scores and latencies of the metrics.
 */
function computeMetrics(packageUrl, packagePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var cores = (0, os_1.cpus)().length;
                    var maxWorkers = Math.min(cores, 2 * metrics.length);
                    var metricThreads = [];
                    var results = [];
                    var completed = 0;
                    var started = 0;
                    function startNewWorker(metricIndex) {
                        if (metricIndex >= metrics.length) {
                            return;
                        }
                        var newWorker = new threading.Worker(__filename, {
                            workerData: {
                                metricIndex: metricIndex, url: packageUrl, path: packagePath
                            },
                        });
                        var subChannel = new threading.MessageChannel();
                        newWorker.postMessage({ hereIsYourPort: subChannel.port1 }, [subChannel.port1]);
                        subChannel.port2.on('message', function (message) {
                            var _a;
                            results.push((_a = {},
                                _a[message.metricName] = message.result[0],
                                _a["".concat(message.metricName, "_Latency")] = message.result[1],
                                _a));
                            completed++;
                            if (completed === metrics.length) {
                                var finalResult_1 = __assign({ URL: packageUrl, NetScore: results.reduce(function (acc, curr) { return acc + curr[Object.keys(curr)[0]]; }, 0) / metrics.length, NetScore_Latency: results.reduce(function (acc, curr) { return acc + curr["".concat(Object.keys(curr)[0], "_Latency")]; }, 0) / metrics.length }, results.reduce(function (acc, curr) { return (__assign(__assign({}, acc), curr)); }, {}));
                                var terminationPromises = metricThreads.map(function (worker) { return worker.terminate(); });
                                Promise.all(terminationPromises).then(function () {
                                    resolve(finalResult_1);
                                }).catch(function (error) { console.log(error); });
                            }
                            else {
                                startNewWorker(started++);
                            }
                        });
                        newWorker.on('error', function (err) {
                            reject(err);
                        });
                        metricThreads.push(newWorker);
                        started++;
                    }
                    for (var i = 0; i < maxWorkers; i++) {
                        startNewWorker(i);
                    }
                })];
        });
    });
}
/**
 * @function metricsRunner
 * @param metricFunction - The function to run to collect a given metric.
 * @returns {number[]} - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
 */
function metricsRunner(metricFn, packageUrl, packagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, score, latency;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    return [4 /*yield*/, metricFn(packageUrl, packagePath)];
                case 1:
                    score = _a.sent();
                    latency = (Date.now() - startTime) / 1000;
                    return [2 /*return*/, [score, latency]];
            }
        });
    });
}
/**
 * @function countIssue
 * @description A function that returns #issues in 'state'(ex: closed) from given repo information using GH API
 * @param {string} owner - the owner of the repo, we use this to construct the endpoint for API call
 * @param {string} packageName - package's name, used to construct API as well
 * @param {string} status - the status of the kinf of issue we want to get, like 'closed'
 * @returns {number} count - the number of issue in the status specified
 */
function countIssue(owner, repo, state) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, linkHeader, lastPageMatch, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/issues?state=").concat(state);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: {
                                Authorization: "token ".concat(GITHUB_TOKEN)
                            },
                            params: {
                                per_page: 1 /* Avoid fetching full data by looking at only the "Link" header for pagination */
                            }
                        })];
                case 1:
                    response = _a.sent();
                    linkHeader = response.headers.link;
                    if (linkHeader) {
                        lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
                        if (lastPageMatch) {
                            return [2 /*return*/, parseInt(lastPageMatch[1], 10)];
                        }
                    }
                    return [2 /*return*/, response.data.length];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error fetching ".concat(state, " issues for ").concat(owner, "/").concat(repo, ":"), error_1);
                    return [2 /*return*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * @function maintainerActiveness
 * @description A metric that uses GH API to get (1- #openIssue/#allIssue) as maintainerActiveness score.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {number} score - The score for maintainerActiveness, calculated as (1- #openIssue/#allIssue),
 *                           if no issue was found it returns 1.
 */
function maintainerActiveness(packageUrl, packagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var score, _a, owner, packageName, totalIssues, openIssues, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    score = 0;
                    _a = (0, util_1.getOwnerAndPackageName)(packageUrl), owner = _a[0], packageName = _a[1];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    if (GITHUB_TOKEN == '')
                        throw new Error('No GitHub token specified');
                    return [4 /*yield*/, countIssue(owner, packageName, 'all')];
                case 2:
                    totalIssues = _b.sent();
                    return [4 /*yield*/, countIssue(owner, packageName, 'open')];
                case 3:
                    openIssues = _b.sent();
                    if (totalIssues === 0) {
                        return [2 /*return*/, 1]; /* No issue at all, the score here can be changed later */
                    }
                    score = 1 - (openIssues / totalIssues);
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _b.sent();
                    throw new Error("Error calculating maintaine activeness\nError message : ".concat(error_2));
                case 5: return [2 /*return*/, score];
            }
        });
    });
}
;
/**
 * @function busFactor
 * @description A metric that calculates the number of contributors with 5+ commits in the last year.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {Promise<number>} - The score for busFactor, calculated as max(1, (#contributors who made 5+ commits last year / 10))
 */
function busFactor(packageUrl, packagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, owner, packageName, since, url, response, commits, contributorCommits_1, activeContributors, score, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, util_1.getOwnerAndPackageName)(packageUrl), owner = _a[0], packageName = _a[1];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    if (GITHUB_TOKEN == '')
                        throw new Error('No GitHub token specified');
                    since = new Date();
                    since.setFullYear(since.getFullYear() - 1);
                    url = "https://api.github.com/repos/".concat(owner, "/").concat(packageName, "/commits");
                    return [4 /*yield*/, axios_1.default.get(url, {
                            params: {
                                since: since.toISOString(),
                                per_page: 100, /* This is just a rough guess */
                            },
                            headers: {
                                Authorization: "token ".concat(GITHUB_TOKEN)
                            }
                        })];
                case 2:
                    response = _b.sent();
                    commits = response.data;
                    if (!commits || commits.length === 0)
                        return [2 /*return*/, 0]; /* No contributors found in the last year */
                    contributorCommits_1 = {};
                    /* Count commits per author */
                    commits.forEach(function (commit) {
                        var _a;
                        var author = (_a = commit.author) === null || _a === void 0 ? void 0 : _a.login;
                        if (author) {
                            contributorCommits_1[author] = (contributorCommits_1[author] || 0) + 1;
                        }
                    });
                    activeContributors = Object.values(contributorCommits_1).filter(function (commitCount) { return commitCount >= 5; }).length;
                    score = activeContributors >= 10 ? 1 : activeContributors / 10;
                    return [2 /*return*/, score];
                case 3:
                    error_3 = _b.sent();
                    console.error("Error calculating activeContributorsMetric: ".concat(error_3));
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    });
}
if (!threading.isMainThread) {
    var _c = threading.workerData, metricIndex = _c.metricIndex, url_1 = _c.url, path_1 = _c.path;
    var metric_1 = metrics[metricIndex];
    (_b = threading.parentPort) === null || _b === void 0 ? void 0 : _b.once('message', function (childPort) {
        metricsRunner(metric_1, url_1, path_1).then(function (metricResult) {
            childPort.hereIsYourPort.postMessage({ metricName: metric_1.name, result: metricResult });
            childPort.hereIsYourPort.close();
        }).catch(function (error) {
            console.error(error);
            childPort.hereIsYourPort.close();
        });
    });
}
exports.default = computeMetrics;
