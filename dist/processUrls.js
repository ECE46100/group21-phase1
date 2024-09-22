"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.processURLs = processURLs;
var fs = _interopRequireWildcard(require("fs"));
var readline = _interopRequireWildcard(require("readline"));
var _simpleGit = _interopRequireDefault(require("simple-git"));
var _axios = _interopRequireDefault(require("axios"));
var _url = require("url");
var _util = require("./util");
var _metrics = _interopRequireDefault(require("./metrics"));
var winston = _interopRequireWildcard(require("winston"));
var dotenv = _interopRequireWildcard(require("dotenv"));
var _process$env$LOG_LEVE;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(r) { var n = this.s["return"]; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, "throw": function _throw(r) { var n = this.s["return"]; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
dotenv.config();
var log_levels = ['warn', 'info', 'debug'];
var LOG_LEVEL = parseInt((_process$env$LOG_LEVE = process.env.LOG_LEVEL) !== null && _process$env$LOG_LEVE !== void 0 ? _process$env$LOG_LEVE : '0', 10);
var LOG_FILE = process.env.LOG_FILE;
winston.configure({
  level: log_levels[LOG_LEVEL],
  transports: [new winston.transports.File({
    filename: LOG_FILE,
    options: {
      flags: 'w'
    }
  })]
});
winston.remove(winston.transports.Console);

/**
 * @function readURLFile
 * @description Reads a file line by line and extracts the URLs.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<string[]>} - A promise that resolves to an array of URLs.
 */
function readURLFile(_x) {
  return _readURLFile.apply(this, arguments);
}
/**
 * @function classifyAndConvertURL
 * @description Classifies an URL as either GitHub or npm, and if npm, converts it to a GitHub URL if possible.
 * @param {string} urlString - The URL to classify.
 * @returns {Promise<URL | null>} - A promise that resolves to a GitHub URL if found, or null if not.
 */
function _readURLFile() {
  _readURLFile = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(filePath) {
    var fileStream, rl, urls, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, line;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          fileStream = fs.createReadStream(filePath);
          rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
          });
          urls = [];
          _iteratorAbruptCompletion = false;
          _didIteratorError = false;
          _context.prev = 5;
          _iterator = _asyncIterator(rl);
        case 7:
          _context.next = 9;
          return _iterator.next();
        case 9:
          if (!(_iteratorAbruptCompletion = !(_step = _context.sent).done)) {
            _context.next = 15;
            break;
          }
          line = _step.value;
          if (line.trim()) {
            urls.push(line);
          }
        case 12:
          _iteratorAbruptCompletion = false;
          _context.next = 7;
          break;
        case 15:
          _context.next = 21;
          break;
        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](5);
          _didIteratorError = true;
          _iteratorError = _context.t0;
        case 21:
          _context.prev = 21;
          _context.prev = 22;
          if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
            _context.next = 26;
            break;
          }
          _context.next = 26;
          return _iterator["return"]();
        case 26:
          _context.prev = 26;
          if (!_didIteratorError) {
            _context.next = 29;
            break;
          }
          throw _iteratorError;
        case 29:
          return _context.finish(26);
        case 30:
          return _context.finish(21);
        case 31:
          return _context.abrupt("return", urls);
        case 32:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[5, 17, 21, 31], [22,, 26, 30]]);
  }));
  return _readURLFile.apply(this, arguments);
}
function classifyAndConvertURL(_x2) {
  return _classifyAndConvertURL.apply(this, arguments);
}
/**
 * @function cloneRepo
 * @description Clones a GitHub repository.
 * @param {string} githubUrl - The string url of the GitHub repository. It cannot clone from URL object.
 * @param {string} targetDir - The directory where the repo should be cloned.
 * @returns {Promise<void>}
 */
function _classifyAndConvertURL() {
  _classifyAndConvertURL = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(urlString) {
    var parsedUrl, packageName, _response$data$reposi, response, repoUrl, githubUrl;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          parsedUrl = new _url.URL(urlString);
          if (!(parsedUrl.hostname === 'github.com')) {
            _context2.next = 6;
            break;
          }
          return _context2.abrupt("return", parsedUrl);
        case 6:
          if (!(parsedUrl.hostname === 'www.npmjs.com')) {
            _context2.next = 31;
            break;
          }
          packageName = parsedUrl.pathname.split('/').pop();
          if (packageName) {
            _context2.next = 11;
            break;
          }
          (0, _util.handleOutput)('', "Invalid npm URL: ".concat(urlString));
          return _context2.abrupt("return", null);
        case 11:
          _context2.prev = 11;
          _context2.next = 14;
          return _axios["default"].get("https://registry.npmjs.org/".concat(packageName));
        case 14:
          response = _context2.sent;
          repoUrl = (_response$data$reposi = response.data.repository) === null || _response$data$reposi === void 0 ? void 0 : _response$data$reposi.url;
          if (!(repoUrl && repoUrl.includes('github.com'))) {
            _context2.next = 23;
            break;
          }
          githubUrl = new _url.URL(repoUrl.replace(/^git\+/, '').replace(/\.git$/, '').replace('ssh://git@github.com/', 'https://github.com/'));
          githubUrl.pathname += '.git';
          (0, _util.handleOutput)("npm converted to GitHub URL: ".concat(githubUrl.toString()), '');
          return _context2.abrupt("return", githubUrl);
        case 23:
          (0, _util.handleOutput)('', "No GitHub repository found for npm package: ".concat(packageName));
        case 24:
          _context2.next = 29;
          break;
        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](11);
          (0, _util.handleOutput)('', "Failed to retrieve npm package data: ".concat(packageName, "\nError message: ").concat(_context2.t0));
        case 29:
          _context2.next = 32;
          break;
        case 31:
          (0, _util.handleOutput)('', "Unknown URL type: ".concat(urlString, ", neither GitHub nor npm"));
        case 32:
          _context2.next = 37;
          break;
        case 34:
          _context2.prev = 34;
          _context2.t1 = _context2["catch"](0);
          (0, _util.handleOutput)('', "Failed to parse the URL: ".concat(urlString, "\nError message : ").concat(_context2.t1));
        case 37:
          return _context2.abrupt("return", null);
        case 38:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 34], [11, 26]]);
  }));
  return _classifyAndConvertURL.apply(this, arguments);
}
function cloneRepo(_x3, _x4) {
  return _cloneRepo.apply(this, arguments);
}
/**
 * @function processURLs
 * @description Processes the URLs from a file, classifying and converting npm URLs to GitHub, and cloning repos.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<void>}
*/
function _cloneRepo() {
  _cloneRepo = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(githubUrl, targetDir) {
    var git;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          git = (0, _simpleGit["default"])();
          _context3.next = 3;
          return (0, _util.handleOutput)("Cloning GitHub repo: ".concat(githubUrl), '');
        case 3:
          _context3.prev = 3;
          _context3.next = 6;
          return git.clone(githubUrl, targetDir);
        case 6:
          _context3.next = 8;
          return (0, _util.handleOutput)("Cloned ".concat(githubUrl, " successfully.\n"), '');
        case 8:
          _context3.next = 13;
          break;
        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](3);
          throw new Error("Failed to clone ".concat(githubUrl, "\nError message : ").concat(_context3.t0));
        case 13:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[3, 10]]);
  }));
  return _cloneRepo.apply(this, arguments);
}
function processURLs(_x5) {
  return _processURLs.apply(this, arguments);
}
/* Entry point */
function _processURLs() {
  _processURLs = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(filePath) {
    var urls, i, _iterator2, _step2, url, githubUrl, pathSegments, owner, packageName;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return readURLFile(filePath);
        case 3:
          urls = _context6.sent;
          i = 1;
          _iterator2 = _createForOfIteratorHelper(urls);
          _context6.prev = 6;
          _iterator2.s();
        case 8:
          if ((_step2 = _iterator2.n()).done) {
            _context6.next = 39;
            break;
          }
          url = _step2.value;
          _context6.next = 12;
          return (0, _util.handleOutput)("Processing URLs (".concat((i++).toString(), "/").concat(urls.length.toString(), ") --> ").concat(url), '');
        case 12:
          _context6.next = 14;
          return classifyAndConvertURL(url);
        case 14:
          githubUrl = _context6.sent;
          if (!githubUrl) {
            _context6.next = 36;
            break;
          }
          pathSegments = githubUrl.pathname.split('/').filter(Boolean);
          if (!(pathSegments.length != 2)) {
            _context6.next = 19;
            break;
          }
          throw new Error("Not a repo url : ".concat(pathSegments.toString()));
        case 19:
          owner = pathSegments[0];
          packageName = pathSegments[1].replace('.git', '');
          _context6.prev = 21;
          _context6.next = 24;
          return cloneRepo(githubUrl.toString(), "./cloned_repos/".concat(owner, " ").concat(packageName));
        case 24:
          _context6.next = 26;
          return (0, _metrics["default"])(githubUrl.toString(), "./cloned_repos/".concat(owner, " ").concat(packageName)).then(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(result) {
              var resultObj, formatResult, key;
              return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    /* First tell TS that resultOgj (made from result) can be indexed with a string */
                    resultObj = result;
                    formatResult = 'Metrics Results :\n';
                    for (key in resultObj) {
                      if (typeof resultObj[key] === 'number' && resultObj[key] % 1 !== 0) {
                        /* Truncate floating number after 3 decimal points  */
                        formatResult += " + ".concat(key, " : ").concat(resultObj[key].toFixed(3), "\n");
                      } else {
                        formatResult += " + ".concat(key, " : ").concat(resultObj[key], "\n");
                      }
                    }
                    _context4.next = 5;
                    return (0, _util.handleOutput)(formatResult, '');
                  case 5:
                  case "end":
                    return _context4.stop();
                }
              }, _callee4);
            }));
            return function (_x6) {
              return _ref.apply(this, arguments);
            };
          }())["catch"](/*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(error) {
              return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                while (1) switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.next = 2;
                    return (0, _util.handleOutput)('', "Error computing metrics\nError message : ".concat(error));
                  case 2:
                  case "end":
                    return _context5.stop();
                }
              }, _callee5);
            }));
            return function (_x7) {
              return _ref2.apply(this, arguments);
            };
          }());
        case 26:
          _context6.next = 32;
          break;
        case 28:
          _context6.prev = 28;
          _context6.t0 = _context6["catch"](21);
          _context6.next = 32;
          return (0, _util.handleOutput)('', "Error handling url ".concat(githubUrl, "\nError message : ").concat(_context6.t0));
        case 32:
          _context6.next = 34;
          return (0, _util.handleOutput)('-'.repeat(80), '');
        case 34:
          _context6.next = 37;
          break;
        case 36:
          throw new Error('GitHub URL is null.');
        case 37:
          _context6.next = 8;
          break;
        case 39:
          _context6.next = 44;
          break;
        case 41:
          _context6.prev = 41;
          _context6.t1 = _context6["catch"](6);
          _iterator2.e(_context6.t1);
        case 44:
          _context6.prev = 44;
          _iterator2.f();
          return _context6.finish(44);
        case 47:
          _context6.next = 55;
          break;
        case 49:
          _context6.prev = 49;
          _context6.t2 = _context6["catch"](0);
          _context6.next = 53;
          return (0, _util.handleOutput)('', "Error processing the URL file\nError message : ".concat(_context6.t2));
        case 53:
          _context6.next = 55;
          return (0, _util.handleOutput)('-'.repeat(50), '');
        case 55:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 49], [6, 41, 44, 47], [21, 28]]);
  }));
  return _processURLs.apply(this, arguments);
}
if (require.main === module) {
  var filePath = process.argv[2];
  if (!filePath) {
    (0, _util.handleOutput)('', 'No file path given. Please provide a URL file path as an argument.');
    process.exit(1);
  }
  processURLs(filePath);
}
var _default = exports["default"] = processURLs;