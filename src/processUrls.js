"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processURLs = processURLs;
var fs = require("fs");
var readline = require("readline");
var simple_git_1 = require("simple-git");
var axios_1 = require("axios");
/**
 * @function readURLFile
 * @description Reads a file line by line and extracts the URLs.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<string[]>} - A promise that resolves to an array of URLs.
 */
function readURLFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStream, rl, urls, _a, rl_1, rl_1_1, line, e_1_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fileStream = fs.createReadStream(filePath);
                    rl = readline.createInterface({
                        input: fileStream,
                        crlfDelay: Infinity
                    });
                    urls = [];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, rl_1 = __asyncValues(rl);
                    _e.label = 2;
                case 2: return [4 /*yield*/, rl_1.next()];
                case 3:
                    if (!(rl_1_1 = _e.sent(), _b = rl_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = rl_1_1.value;
                    _a = false;
                    line = _d;
                    if (line.trim()) {
                        urls.push(line);
                    }
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = rl_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(rl_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, urls];
            }
        });
    });
}
/**
 * @function classifyAndConvertURL
 * @description Classifies an URL as either GitHub or npm, and if npm, converts it to a GitHub URL if possible.
 * @param {string} url - The URL to classify.
 * @returns {Promise<string | null>} - A promise that resolves to a GitHub URL if found, or null if not.
 */
function classifyAndConvertURL(url) {
    return __awaiter(this, void 0, void 0, function () {
        var packageName, response, repositoryUrl, githubUrl, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!url.includes('github.com')) return [3 /*break*/, 1];
                    return [2 /*return*/, url];
                case 1:
                    if (!url.includes('npmjs.com')) return [3 /*break*/, 5];
                    packageName = url.split('/').pop();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.get("https://registry.npmjs.org/".concat(packageName))];
                case 3:
                    response = _b.sent();
                    repositoryUrl = (_a = response.data.repository) === null || _a === void 0 ? void 0 : _a.url;
                    if (repositoryUrl && repositoryUrl.includes('github.com')) {
                        githubUrl = repositoryUrl.replace(/^git\+/, '');
                        handleOutput("Found GitHub Url : ".concat(githubUrl), '');
                        return [2 /*return*/, githubUrl];
                    }
                    else {
                        handleOutput('', "No GitHub repository found for npm package: ".concat(packageName));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    handleOutput('', "Failed to retrieve npm package data: ".concat(packageName, "\n, Error message: ").concat(error_1));
                    return [3 /*break*/, 5];
                case 5:
                    handleOutput('', "Unknown URL type: ".concat(url));
                    return [2 /*return*/, null];
            }
        });
    });
}
/**
 * @function cloneRepo
 * @description Clones a GitHub repository.
 * @param {string} repoUrl - The URL of the GitHub repository.
 * @param {string} targetDir - The directory where the repo should be cloned.
 */
function cloneRepo(repoUrl, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var git, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = (0, simple_git_1.default)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, git.clone(repoUrl, targetDir)];
                case 2:
                    _a.sent();
                    handleOutput("Cloned ".concat(repoUrl, " successfully."), '');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    handleOutput('', "Failed to clone ".concat(repoUrl, ":"));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * @function processURLs
 * @description Processes the URLs from a file, classifying and converting npm URLs to GitHub, and cloning repos.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<void>}
*/
function processURLs(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var urls, _i, urls_1, url, githubUrl, splitArray, packageName, ownerName, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, readURLFile(filePath)];
                case 1:
                    urls = _a.sent();
                    _i = 0, urls_1 = urls;
                    _a.label = 2;
                case 2:
                    if (!(_i < urls_1.length)) return [3 /*break*/, 7];
                    url = urls_1[_i];
                    return [4 /*yield*/, classifyAndConvertURL(url)];
                case 3:
                    githubUrl = _a.sent();
                    if (!githubUrl) return [3 /*break*/, 5];
                    splitArray = githubUrl.split('/');
                    packageName = splitArray.pop();
                    ownerName = splitArray.pop();
                    handleOutput("Cloning GitHub repo: ".concat(githubUrl), '');
                    return [4 /*yield*/, cloneRepo(githubUrl, "./cloned_repos/".concat(ownerName, " ").concat(packageName))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    new Error('URL is null.');
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_3 = _a.sent();
                    handleOutput('', "Error processing the URL file, error message : ".concat(error_3));
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * @function handleOutput
 * @description Handles the output of the result, error message, or log file.
 * @param {string} message - The message to log.
 * @param {number} endpoint - Display endpoint for output (0: console, 1: log file).
 * @param {Error} errorMessage - Optional error message to log.
 */
function handleOutput() {
    return __awaiter(this, arguments, void 0, function (message, errorMessage, endpoint) {
        if (message === void 0) { message = ''; }
        if (errorMessage === void 0) { errorMessage = ''; }
        if (endpoint === void 0) { endpoint = 0; }
        return __generator(this, function (_a) {
            switch (endpoint) {
                case 0: {
                    if (message != '')
                        console.log(message);
                    if (errorMessage != '') {
                        console.error(new Error(errorMessage));
                        // console.log(errorMessage + '\n');
                    }
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
            return [2 /*return*/];
        });
    });
}
/* Entry point */
if (require.main == module) {
    var filePath = process.argv[2];
    if (!filePath) {
        handleOutput('', 'Error: Please provide the URL file path as an argument.');
        process.exit(1);
    }
    processURLs(filePath);
}
