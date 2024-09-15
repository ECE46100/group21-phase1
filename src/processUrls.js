"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processURLs = processURLs;
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const simple_git_1 = __importDefault(require("simple-git"));
const axios_1 = __importDefault(require("axios"));
/**
 * @function readURLFile
 * @description Reads a file line by line and extracts the URLs.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<string[]>} - A promise that resolves to an array of URLs.
 */
async function readURLFile(filePath) {
    var _a, e_1, _b, _c;
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const urls = [];
    try {
        for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = await rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
            _c = rl_1_1.value;
            _d = false;
            const line = _c;
            if (line.trim()) {
                urls.push(line);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = rl_1.return)) await _b.call(rl_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return urls;
}
/**
 * @function classifyAndConvertURL
 * @description Classifies an URL as either GitHub or npm, and if npm, converts it to a GitHub URL if possible.
 * @param {string} url - The URL to classify.
 * @returns {Promise<string | null>} - A promise that resolves to a GitHub URL if found, or null if not.
 */
async function classifyAndConvertURL(url) {
    var _a;
    if (url.includes('github.com')) {
        return url;
    }
    else if (url.includes('npmjs.com')) {
        /* Extract package name from npm URL */
        const packageName = url.split('/').pop();
        try {
            /* Try to fetch GitHub URL from npm package info */
            const response = await axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
            const repositoryUrl = (_a = response.data.repository) === null || _a === void 0 ? void 0 : _a.url;
            if (repositoryUrl && repositoryUrl.includes('github.com')) {
                /* Convert git+https://github.com/ to https://github.com/ */
                const githubUrl = repositoryUrl.replace(/^git\+/, '');
                handleOutput(`npm converted to GitHub Url : ${githubUrl}`, '');
                return githubUrl;
            }
            else {
                handleOutput('', `No GitHub repository found for npm package: ${packageName}`);
            }
        }
        catch (error) {
            handleOutput('', `Failed to retrieve npm package data: ${packageName}\n, Error message: ${error}`);
        }
    }
    handleOutput('', `Unknown URL type: ${url}`);
    return null;
}
/**
 * @function cloneRepo
 * @description Clones a GitHub repository.
 * @param {string} repoUrl - The URL of the GitHub repository.
 * @param {string} targetDir - The directory where the repo should be cloned.
 * @returns {Promise<void>}
 */
async function cloneRepo(repoUrl, targetDir) {
    const git = (0, simple_git_1.default)();
    try {
        await git.clone(repoUrl, targetDir);
        handleOutput(`Cloned ${repoUrl} successfully.\n`, '');
    }
    catch (error) {
        handleOutput('', `Failed to clone ${repoUrl}. ${error}`);
    }
}
/**
 * @function processURLs
 * @description Processes the URLs from a file, classifying and converting npm URLs to GitHub, and cloning repos.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<void>}
*/
async function processURLs(filePath) {
    try {
        const urls = await readURLFile(filePath);
        for (const url of urls) {
            const githubUrl = await classifyAndConvertURL(url);
            if (githubUrl) {
                var splitArray = githubUrl.split('/');
                const packageName = splitArray.pop();
                const ownerName = splitArray.pop();
                handleOutput(`Cloning GitHub repo: ${githubUrl}`, '');
                await cloneRepo(githubUrl, `./cloned_repos/${ownerName}/${packageName}`);
            }
            else {
                new Error('URL is null.');
            }
        }
    }
    catch (error) {
        handleOutput('', `Error processing the URL file, error message : ${error}`);
    }
}
/**
 * @function handleOutput
 * @description Handles the output of the result, error message, or log file. At least one of the message/errorMessage must be specified.
 * @param {string} message - Optional message to log.
 * @param {string} errorMessage - Optional error message to log.
 * @param {number} endpoint - Display endpoint for output (0: console, 1: log file).
 */
async function handleOutput(message = '', errorMessage = '', endpoint = 0) {
    switch (endpoint) {
        case 0: {
            if (message != '')
                console.log(message);
            if (errorMessage != '')
                console.error(errorMessage);
            break;
        }
        case 1: {
            break;
        }
        default: {
            if (message != '')
                console.log(message);
            if (errorMessage != '')
                console.error(new Error(errorMessage));
            break;
        }
    }
}
/* Entry point */
const filePath = process.argv[2];
if (!filePath) {
    handleOutput('', 'Error: Please provide the URL file path as an argument.');
    process.exit(1);
}
processURLs(filePath);
