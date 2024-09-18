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
const url_1 = require("url");
const util_1 = require("./util");
const metrics_1 = __importDefault(require("./metrics"));
var util_1 = require("./util");
var metrics_1 = require("./metrics");
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
 * @param {string} urlString - The URL to classify.
 * @returns {Promise<URL | null>} - A promise that resolves to a GitHub URL if found, or null if not.
 */
async function classifyAndConvertURL(urlString) {
    var _a;
    try {
        const parsedUrl = new url_1.URL(urlString);
        if (parsedUrl.hostname === 'github.com') {
            return parsedUrl;
        }
        else if (parsedUrl.hostname === 'www.npmjs.com') {
            const packageName = parsedUrl.pathname.split('/').pop();
            if (!packageName) {
                (0, util_1.handleOutput)('', `Invalid npm URL: ${urlString}`);
                return null;
            }
            try {
                const response = await axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
                const repoUrl = (_a = response.data.repository) === null || _a === void 0 ? void 0 : _a.url;
                if (repoUrl && repoUrl.includes('github.com')) {
                    const githubUrl = new url_1.URL(repoUrl.replace(/^git\+/, '').replace(/\.git$/, '').replace('ssh://git@github.com/', 'https://github.com/'));
                    githubUrl.pathname += '.git';
                    (0, util_1.handleOutput)(`npm converted to GitHub URL: ${githubUrl.toString()}`, '');
                    return githubUrl;
                }
                else {
                    (0, util_1.handleOutput)('', `No GitHub repository found for npm package: ${packageName}`);
                }
            }
            catch (error) {
                (0, util_1.handleOutput)('', `Failed to retrieve npm package data: ${packageName}\nError message: ${error}`);
            }
        }
        else {
            (0, util_1.handleOutput)('', `Unknown URL type: ${urlString}, neither GitHub nor npm`);
        }
    }
    catch (error) {
        (0, util_1.handleOutput)('', `Failed to parse the URL: ${urlString}\nError message : ${error}`);
    }
    return null;
}
/**
 * @function cloneRepo
 * @description Clones a GitHub repository.
 * @param {string} githubUrl - The string url of the GitHub repository. It cannot clone from URL object.
 * @param {string} targetDir - The directory where the repo should be cloned.
 * @returns {Promise<void>}
 */
async function cloneRepo(githubUrl, targetDir) {
    const git = (0, simple_git_1.default)();
    await (0, util_1.handleOutput)(`Cloning GitHub repo: ${githubUrl}`, '');
    try {
        await git.clone(githubUrl, targetDir);
        await (0, util_1.handleOutput)(`Cloned ${githubUrl} successfully.\n`, '');
    }
    catch (error) {
        throw new Error(`Failed to clone ${githubUrl}\nError message : ${error}`);
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
        let i = 1;
        for (const url of urls) {
            await (0, util_1.handleOutput)(`Processing URLs (${(i++).toString()}/${(urls.length).toString()}) --> ${url}`, '');
            const githubUrl = await classifyAndConvertURL(url);
            if (githubUrl) {
                const pathSegments = githubUrl.pathname.split('/').filter(Boolean);
                if (pathSegments.length != 2)
                    throw new Error(`Not a repo url : ${pathSegments.toString()}`);
                const owner = pathSegments[0];
                const packageName = pathSegments[1].replace('.git', '');
                try {
                    await cloneRepo(githubUrl.toString(), `./cloned_repos/${owner} ${packageName}`);
                    await (0, metrics_1.default)(githubUrl.toString(), `./cloned_repos/${owner} ${packageName}`)
                        .then(async (result) => {
                        /* First tell TS that resultOgj (made from result) can be indexed with a string */
                        const resultObj = result;
                        let formatResult = 'Metrics Results :\n';
                        for (const key in resultObj) {
                            if (typeof resultObj[key] === 'number' && resultObj[key] % 1 !== 0) {
                                /* Truncate floating number after 3 decimal points  */
                                formatResult += ` + ${key} : ${resultObj[key].toFixed(3)}\n`;
                            }
                            else {
                                formatResult += ` + ${key} : ${resultObj[key]}\n`;
                            }
                        }
                        await (0, util_1.handleOutput)(formatResult, '');
                    })
                        .catch(async (error) => {
                        await (0, util_1.handleOutput)('', `Error computing metrics\nError message : ${error}`);
                    });
                }
                catch (error) {
                    await (0, util_1.handleOutput)('', `Error handling url ${githubUrl}\nError message : ${error}`);
                }
                await (0, util_1.handleOutput)('-'.repeat(80), '');
            }
            else {
                throw new Error('GitHub URL is null.');
            }
        }
    }
    catch (error) {
        await (0, util_1.handleOutput)('', `Error processing the URL file\nError message : ${error}`);
        await (0, util_1.handleOutput)('-'.repeat(50), '');
    }
}
/* Entry point */
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        (0, util_1.handleOutput)('', 'No file path given. Please provide a URL file path as an argument.');
        process.exit(1);
    }
    processURLs(filePath);
}
exports.default = processURLs;
