"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.license = license;
var threading = _interopRequireWildcard(require("worker_threads"));
var path = _interopRequireWildcard(require("path"));
var _os = require("os");
var _child_process = require("child_process");
var _axios = _interopRequireDefault(require("axios"));
var _util = require("./util");
var dotenv = _interopRequireWildcard(require("dotenv"));
var _eslint = require("eslint");
var fs = _interopRequireWildcard(require("fs"));
var winston = _interopRequireWildcard(require("winston"));
var _process$env$GITHUB_T, _process$env$LOG_LEVE;
/*
    computeMetrics is the only externally accessible function from this file. It facilitates running
    multiple metrics in parallel. To add a metric calculation, create a function definition that follows the 
    typing (type metricFunction) and add the function name to the metrics array. Metric functions must be 
    asynchronous (return promises). metricSample shows how to make a synchronous function asynchronous.
*/
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
dotenv.config();
var GITHUB_TOKEN = (_process$env$GITHUB_T = process.env.GITHUB_TOKEN) !== null && _process$env$GITHUB_T !== void 0 ? _process$env$GITHUB_T : '';
var ESLINT_CONFIG = path.join(process.cwd(), 'src', 'eslint_package.config.mjs');
var log_levels = ['warn', 'info', 'debug'];
var LOG_LEVEL = parseInt((_process$env$LOG_LEVE = process.env.LOG_LEVEL) !== null && _process$env$LOG_LEVE !== void 0 ? _process$env$LOG_LEVE : '0', 10);
var LOG_FILE = process.env.LOG_FILE;
winston.configure({
  level: log_levels[LOG_LEVEL],
  transports: [new winston.transports.File({
    filename: LOG_FILE
  })]
});
winston.remove(winston.transports.Console);

/**
 * @type metricFunction
 * @description Type for metric calculating functions, should only return the result of the calculation.
 */

var metrics = [busFactor, maintainerActiveness, correctness];
var weights = {
  busFactor: 0.3,
  maintainerActiveness: 0.3,
  correctness: 0.4
};

/**
 * @interface metricPair
 * @description Type for a metric result, one for the score and one for the latency.
 */

;

/**
 * @type packageResult
 * @description Type for the result of the metrics computation.
 */
/**
 * @function computeMetrics
 * @description This function is used to compute the metrics of a package.
 * @returns {packageResult} - A map describing the package, including the scores and latencies of the metrics.
 */
function computeMetrics(_x, _x2) {
  return _computeMetrics.apply(this, arguments);
}
/**
 * @function metricsRunner
 * @param metricFunction - The function to run to collect a given metric.
 * @returns {number[]} - A pair of numbers representing the score ([0, 1]) and the latency in seconds.
 */
function _computeMetrics() {
  _computeMetrics = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(packageUrl, packagePath) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", new Promise(function (resolve, reject) {
            /* Get the number of cores available - picked two metrics per core */
            var cores = (0, _os.cpus)().length;
            var maxWorkers = Math.min(cores, 2 * metrics.length);
            var metricThreads = [];
            var results = [];
            var netScoreStart = Date.now();
            var completed = 0;
            var started = 0;
            function startNewWorker(metricIndex) {
              if (metricIndex >= metrics.length) {
                return;
              }
              var newWorker = new threading.Worker(__filename, {
                workerData: {
                  metricIndex: metricIndex,
                  url: packageUrl,
                  path: packagePath
                }
              });
              var subChannel = new threading.MessageChannel();
              newWorker.postMessage({
                hereIsYourPort: subChannel.port1
              }, [subChannel.port1]);
              subChannel.port2.on('message', function (message) {
                results.push(_defineProperty(_defineProperty({}, message.metricName, message.result[0]), "".concat(message.metricName, "_Latency"), message.result[1]));
                completed++;
                if (completed === metrics.length) {
                  var netScore = results.reduce(function (acc, curr) {
                    var metricName = Object.keys(curr)[0];
                    var metricScore = Math.max(0, curr[metricName]);
                    var metricWeight = weights[metricName];
                    return acc + metricScore * metricWeight;
                  }, 0);
                  var finalResult = _objectSpread({
                    URL: packageUrl,
                    NetScore: netScore,
                    NetScore_Latency: (Date.now() - netScoreStart) / 1000
                  }, results.reduce(function (acc, curr) {
                    return _objectSpread(_objectSpread({}, acc), curr);
                  }, {}));
                  var terminationPromises = metricThreads.map(function (worker) {
                    return worker.terminate();
                  });
                  Promise.all(terminationPromises).then(function () {
                    resolve(finalResult);
                  })["catch"](function (error) {
                    console.log(error);
                  });
                } else {
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
          }));
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _computeMetrics.apply(this, arguments);
}
function metricsRunner(_x3, _x4, _x5) {
  return _metricsRunner.apply(this, arguments);
}
/**
 * @function countIssue
 * @description A function that returns #issues in 'state'(ex: closed) from given repo information using GH API
 * @param {string} owner - the owner of the repo, we use this to construct the endpoint for API call
 * @param {string} packageName - package's name, used to construct API as well
 * @param {string} status - the status of the kinf of issue we want to get, like 'closed'
 * @returns {number} count - the number of issue in the status specified
 */
function _metricsRunner() {
  _metricsRunner = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(metricFn, packageUrl, packagePath) {
    var startTime, score, latency;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          /* start the timer */
          startTime = Date.now();
          _context2.next = 3;
          return metricFn(packageUrl, packagePath);
        case 3:
          score = _context2.sent;
          /* stop the timer */
          latency = (Date.now() - startTime) / 1000;
          return _context2.abrupt("return", [score, latency]);
        case 6:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _metricsRunner.apply(this, arguments);
}
function countIssue(_x6, _x7, _x8) {
  return _countIssue.apply(this, arguments);
}
/**
 * @function maintainerActiveness
 * @description A metric that uses GH API to get (1- #openIssue/#allIssue) as maintainerActiveness score.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {number} score - The score for maintainerActiveness, calculated as (1- #openIssue/#allIssue), 
 *                           if no issue was found it returns 1.
 */
function _countIssue() {
  _countIssue = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(owner, repo, state) {
    var _url, response, linkHeader, lastPageMatch;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _url = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/issues?state=").concat(state);
          _context3.next = 4;
          return _axios["default"].get(_url, {
            headers: {
              Authorization: "token ".concat(GITHUB_TOKEN)
            },
            params: {
              per_page: 1 /* Avoid fetching full data by looking at only the "Link" header for pagination */
            }
          });
        case 4:
          response = _context3.sent;
          linkHeader = response.headers.link;
          if (!linkHeader) {
            _context3.next = 10;
            break;
          }
          /* Parse the "last" page from the pagination links */
          lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
          if (!lastPageMatch) {
            _context3.next = 10;
            break;
          }
          return _context3.abrupt("return", parseInt(lastPageMatch[1], 10));
        case 10:
          return _context3.abrupt("return", response.data.length);
        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          console.error("Error fetching ".concat(state, " issues for ").concat(owner, "/").concat(repo, ":"), _context3.t0);
          return _context3.abrupt("return", 0);
        case 17:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 13]]);
  }));
  return _countIssue.apply(this, arguments);
}
function maintainerActiveness(_x9, _x10) {
  return _maintainerActiveness.apply(this, arguments);
}
/**
 * @function busFactor
 * @description A metric that calculates the number of contributors with 5+ commits in the last year.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {Promise<number>} - The score for busFactor, calculated as max(1, (#contributors who made 5+ commits last year / 10))
 */
function _maintainerActiveness() {
  _maintainerActiveness = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(packageUrl, packagePath) {
    var score, _getOwnerAndPackageNa, _getOwnerAndPackageNa2, owner, packageName, totalIssues, openIssues;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          score = 0;
          _getOwnerAndPackageNa = (0, _util.getOwnerAndPackageName)(packageUrl), _getOwnerAndPackageNa2 = _slicedToArray(_getOwnerAndPackageNa, 2), owner = _getOwnerAndPackageNa2[0], packageName = _getOwnerAndPackageNa2[1];
          _context4.prev = 2;
          if (!(GITHUB_TOKEN == '')) {
            _context4.next = 5;
            break;
          }
          throw new Error('No GitHub token specified');
        case 5:
          _context4.next = 7;
          return countIssue(owner, packageName, 'all');
        case 7:
          totalIssues = _context4.sent;
          _context4.next = 10;
          return countIssue(owner, packageName, 'open');
        case 10:
          openIssues = _context4.sent;
          if (!(totalIssues === 0)) {
            _context4.next = 13;
            break;
          }
          return _context4.abrupt("return", 1);
        case 13:
          score = 1 - openIssues / totalIssues;
          _context4.next = 20;
          break;
        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](2);
          if (_context4.t0 instanceof Error) {
            console.error("Error calculating maintainerActivenessMetric: ".concat(_context4.t0.message));
          } else {
            console.error('Error calculating maintainerActivenessMetric:', _context4.t0);
          }
          return _context4.abrupt("return", 0);
        case 20:
          return _context4.abrupt("return", score);
        case 21:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[2, 16]]);
  }));
  return _maintainerActiveness.apply(this, arguments);
}
function busFactor(_x11, _x12) {
  return _busFactor.apply(this, arguments);
}
/**
 * @function correctness
 * @description A metric that calculates the "correctness" of the package through a combination of dependency analysis and linting
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {number} - The score for correctness, calculated as a weighted sum of the dependency and linting scores.
 */
function _busFactor() {
  _busFactor = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(packageUrl, packagePath) {
    var _getOwnerAndPackageNa3, _getOwnerAndPackageNa4, owner, packageName, since, _url2, response, commits, contributorCommits, activeContributors, score;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _getOwnerAndPackageNa3 = (0, _util.getOwnerAndPackageName)(packageUrl), _getOwnerAndPackageNa4 = _slicedToArray(_getOwnerAndPackageNa3, 2), owner = _getOwnerAndPackageNa4[0], packageName = _getOwnerAndPackageNa4[1];
          _context5.prev = 1;
          if (!(GITHUB_TOKEN == '')) {
            _context5.next = 4;
            break;
          }
          throw new Error('No GitHub token specified');
        case 4:
          /* Trace back at most a year from today */
          since = new Date();
          since.setFullYear(since.getFullYear() - 1);
          _url2 = "https://api.github.com/repos/".concat(owner, "/").concat(packageName, "/commits");
          _context5.next = 9;
          return _axios["default"].get(_url2, {
            params: {
              since: since.toISOString(),
              per_page: 100 /* This is just a rough guess */
            },
            headers: {
              Authorization: "token ".concat(GITHUB_TOKEN)
            }
          });
        case 9:
          response = _context5.sent;
          commits = response.data;
          if (!(!commits || commits.length === 0)) {
            _context5.next = 13;
            break;
          }
          return _context5.abrupt("return", 0);
        case 13:
          /* No contributors found in the last year */
          /* Map to keep track of each contributor's commit count */
          contributorCommits = {};
          /* Count commits per author */
          commits.forEach(function (commit) {
            var _commit$author;
            var author = (_commit$author = commit.author) === null || _commit$author === void 0 ? void 0 : _commit$author.login;
            if (author) {
              contributorCommits[author] = (contributorCommits[author] || 0) + 1;
            }
          });

          /* Filter contributors with 5+ commits */
          activeContributors = Object.values(contributorCommits).filter(function (commitCount) {
            return commitCount >= 5;
          }).length;
          score = activeContributors >= 10 ? 1 : activeContributors / 10;
          return _context5.abrupt("return", score);
        case 20:
          _context5.prev = 20;
          _context5.t0 = _context5["catch"](1);
          if (_context5.t0 instanceof Error) {
            console.error("Error calculating activeContributorsMetric: ".concat(_context5.t0.message));
          } else {
            console.error('Error calculating activeContributorsMetric:', _context5.t0);
          }
          return _context5.abrupt("return", 0);
        case 24:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[1, 20]]);
  }));
  return _busFactor.apply(this, arguments);
}
function correctness(_x13, _x14) {
  return _correctness.apply(this, arguments);
}
/**
 * @function dependencyAnalysis
 * @description Perform dependency analysis on the package, by running npm audit in each directory with a package.json file.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {number[]} - The number of dependencies with each vulnerability level (low, moderate, high, critical).
 */
function _correctness() {
  _correctness = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(packageUrl, packagePath) {
    var dependencyScore, lintingScore;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          winston.log('info', "Calculating correctness metric");
          _context6.next = 3;
          return dependencyAnalysis(packagePath);
        case 3:
          dependencyScore = _context6.sent;
          winston.log('info', "Dependency score calculated, ".concat(dependencyScore));
          _context6.next = 7;
          return linting(packagePath);
        case 7:
          lintingScore = _context6.sent;
          winston.log('info', "Linting score calculated, ".concat(lintingScore));
          return _context6.abrupt("return", Math.max(0, (lintingScore + dependencyScore) * 0.5));
        case 10:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _correctness.apply(this, arguments);
}
function dependencyAnalysis(_x15) {
  return _dependencyAnalysis.apply(this, arguments);
}
/**
 * @function linting
 * @description Perform linting on the package, using ESLint.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {number} - The score for linting, based on the number of linter errors.
 */
function _dependencyAnalysis() {
  _dependencyAnalysis = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(packagePath) {
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          return _context7.abrupt("return", new Promise(function (resolve, reject) {
            /* 
                This does "shell out" the npm audit command, however this was done because:
                1. The command is not based on user inputs.
                2. I could not find a suitable library for running npm commands.
            */
            fs.readFile(path.join(packagePath, 'package.json'), 'utf8', function (err, data) {
              if (err) {
                reject(new Error("Error reading package.json: ".concat(err)));
              }
              var packageJson = JSON.parse(data);
              /* Replace link with file (if they exist) - yarn supports 'link' but npm does not */
              if (packageJson.dependencies) {
                for (var _i = 0, _Object$entries = Object.entries(packageJson.dependencies); _i < _Object$entries.length; _i++) {
                  var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
                    dep = _Object$entries$_i[0],
                    version = _Object$entries$_i[1];
                  if (typeof version === 'string' && version.trim().startsWith('link')) {
                    packageJson.dependencies[dep] = 'file' + version.trim().slice(4);
                    winston.log('debug', "Replacing link with file for ".concat(dep));
                  }
                }
              }
              if (packageJson.devDependencies) {
                for (var _i2 = 0, _Object$entries2 = Object.entries(packageJson.devDependencies); _i2 < _Object$entries2.length; _i2++) {
                  var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
                    _dep = _Object$entries2$_i[0],
                    _version = _Object$entries2$_i[1];
                  if (typeof _version === 'string' && _version.trim().startsWith('link')) {
                    packageJson.devDependencies[_dep] = 'file' + _version.trim().slice(4);
                    winston.log('debug', "Replacing link with file for ".concat(_dep));
                  }
                }
              }
              fs.writeFile(path.join(packagePath, 'package.json'), JSON.stringify(packageJson), function (err) {
                if (err) {
                  reject(new Error("Error writing package.json: ".concat(err)));
                }
                /* 
                    Run npm audit in the package directory - use legacy just in case their dependencies have conflicts 
                    Installing first is faster (not sure why).
                */
                var install = (0, _child_process.spawn)('npm', ['install', '--package-lock-only', '--legacy-peer-deps'], {
                  cwd: packagePath
                });
                install.on('close', function (code) {
                  if (code !== 0) {
                    reject(new Error("Error running npm install: ".concat(code)));
                  }
                  var audit = (0, _child_process.spawn)('npm', ['audit', '--json'], {
                    cwd: packagePath
                  });
                  var jsonFromAudit = "";
                  audit.stdout.on('data', function (data) {
                    jsonFromAudit += data;
                  });
                  audit.on('close', function () {
                    try {
                      var auditData = JSON.parse(jsonFromAudit);
                      var vulnerabilitiesJson = auditData.metadata.vulnerabilities;
                      winston.log('debug', "Vulnerabilities found: ".concat(JSON.stringify(vulnerabilitiesJson)));
                      var levels = ['low', 'moderate', 'high', 'critical'];
                      var vulnerabilities = [];
                      for (var i = 0; i < levels.length; i++) {
                        vulnerabilities[i] = vulnerabilitiesJson[levels[i]] || 0;
                      }
                      winston.log('debug', "Vulnerabilities: ".concat(vulnerabilities));
                      var auditScore = 1 - vulnerabilities.reduce(function (acc, curr, idx) {
                        return acc + curr * (0.02 + idx / 50);
                      }, 0);
                      resolve(auditScore);
                    } catch (error) {
                      reject(new Error("Error parsing npm audit JSON: ".concat(error)));
                    }
                  });
                });
              });
            });
          }));
        case 1:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return _dependencyAnalysis.apply(this, arguments);
}
function linting(_x16) {
  return _linting.apply(this, arguments);
}
/**
 * @function rampUpTime
 * @description Calculates the ramp-up time based on the presence of documentation and code comments.
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - The path to the cloned repository.
 * @returns {Promise<number>} - The score for ramp-up time between 0 and 1.
 */
function _linting() {
  _linting = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(packagePath) {
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          return _context8.abrupt("return", new Promise(function (resolve, reject) {
            /* Create a new ESLint instance - see eslint_package.config.mjs for linter configuration */
            var eslint = new _eslint.ESLint({
              overrideConfigFile: ESLINT_CONFIG,
              allowInlineConfig: true,
              globInputPaths: true,
              ignore: true
            });
            /* Look for all js and ts files in the package */
            var pattern = path.join(packagePath, '**/*.{js,ts}');

            /* Run the linter and sum the error counts */
            eslint.lintFiles(pattern).then(function (results) {
              winston.log('debug', "Linting results: ".concat(JSON.stringify(results)));
              var errorCount = results.reduce(function (acc, curr) {
                return acc + curr.errorCount;
              }, 0);
              var filesLinted = results.length;
              var lintScore = 1 - errorCount / filesLinted / 10;
              resolve(lintScore);
            })["catch"](function (error) {
              reject(new Error("Error running ESLint: ".concat(error)));
            });
          }));
        case 1:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return _linting.apply(this, arguments);
}
function rampUpTime(_x17, _x18) {
  return _rampUpTime.apply(this, arguments);
}
/**
 * @function findReadmeFile
 * @description Recursively searches for a README file in the repository.
 * @param {string} dir - The directory to start the search from.
 * @returns {string | null} - The path to the README file, or null if not found.
 */
function _rampUpTime() {
  _rampUpTime = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(packageUrl, packagePath) {
    var fs, path, readmePath, readmeScore, readmeContent, codeFiles, _analyzeCodeComments, commentLines, totalLines, commentDensity, commentScore, rampUpScore;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          fs = require('fs');
          path = require('path');
          /* Analyze README, can either make readmeScore 0 if there's error or simply throw an error and skip the rampUpTime function */
          readmePath = findReadmeFile(packagePath);
          readmeScore = 0;
          if (readmePath) {
            try {
              readmeContent = fs.readFileSync(readmePath, 'utf-8');
              readmeScore = readmeContent.length > 1500 ? 1 : readmeContent.length > 1000 ? 0.75 : readmeContent.length > 500 ? 0.5 : 0.25;
            } catch (error) {
              //console.error("Error reading README file", error);
              readmeScore = 0;
            }
          } else {
            // console.warn('No README found in the repository');
            readmeScore = 0;
          }

          /* Analyze code comments */
          codeFiles = getAllCodeFiles(packagePath); // Function to get all relevant code files
          _analyzeCodeComments = analyzeCodeComments(codeFiles), commentLines = _analyzeCodeComments.commentLines, totalLines = _analyzeCodeComments.totalLines;
          /* Calculate comment density score (assuming >10% comment lines is a good ratio) */
          commentDensity = commentLines / totalLines;
          commentScore = commentDensity > 0.2 ? 1 : commentDensity > 0.15 ? 0.75 : commentDensity > 0.1 ? 0.5 : 0.25;
          /* Combine the scores (adjust weights as necessary) */
          rampUpScore = 0.5 * readmeScore + 0.5 * commentScore;
          return _context9.abrupt("return", Promise.resolve(rampUpScore));
        case 11:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return _rampUpTime.apply(this, arguments);
}
function findReadmeFile(dir) {
  var files = fs.readdirSync(dir);
  var _iterator = _createForOfIteratorHelper(files),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var file = _step.value;
      var fullPath = path.join(dir, file);
      var stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        var found = findReadmeFile(fullPath);
        if (found) return found;
      } else if (file.toLowerCase().startsWith('readme')) {
        return fullPath;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return null;
}

/**
 * @function getAllCodeFiles
 * @description Recursively finds all relevant code files in a directory (e.g., .js, .ts files).
 * @param {string} dir - The directory to search for code files.
 * @returns {string[]} - A list of file paths.
 */
function getAllCodeFiles(dir) {
  var fs = require('fs');
  var path = require('path');
  var codeFiles = [];
  var files = fs.readdirSync(dir);
  var _iterator2 = _createForOfIteratorHelper(files),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var file = _step2.value;
      var fullPath = path.join(dir, file);
      var stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        codeFiles = codeFiles.concat(getAllCodeFiles(fullPath)); // Recursive search
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        codeFiles.push(fullPath);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
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
  var fs = require('fs');
  var commentLines = 0;
  var totalLines = 0;
  var _iterator3 = _createForOfIteratorHelper(files),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var file = _step3.value;
      var content = fs.readFileSync(file, 'utf-8');
      var lines = content.split('\n');
      totalLines += lines.length;
      var _iterator4 = _createForOfIteratorHelper(lines),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var line = _step4.value;
          var trimmedLine = line.trim();
          if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
            commentLines++;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  return {
    commentLines: commentLines,
    totalLines: totalLines
  };
}

/**
 * @function license
 * @description A metric that calculates if the package has a conforming LGPLv2.1 license
 * @param {string} packageUrl - The GitHub repository URL.
 * @param {string} packagePath - (Not used here, but required for type compatibility).
 * @returns {Promise<number>} - The score for busFactor, calculated as int(isCompatible(license, LGPLv2.1))
 */
function license(_x19, _x20) {
  return _license.apply(this, arguments);
}
function _license() {
  _license = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(packageUrl, packagePath) {
    var score, _getOwnerAndPackageNa5, _getOwnerAndPackageNa6, owner, packageName, _response$data$licens, _response$data$licens2, _response$data$licens3, _url3, response;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          score = 0;
          _getOwnerAndPackageNa5 = (0, _util.getOwnerAndPackageName)(packageUrl), _getOwnerAndPackageNa6 = _slicedToArray(_getOwnerAndPackageNa5, 2), owner = _getOwnerAndPackageNa6[0], packageName = _getOwnerAndPackageNa6[1];
          _context10.prev = 2;
          if (!(GITHUB_TOKEN == '')) {
            _context10.next = 5;
            break;
          }
          throw new Error('No GitHub token specified');
        case 5:
          _url3 = "https://api.github.com/repos/".concat(owner, "/").concat(packageName, "/license");
          _context10.next = 8;
          return _axios["default"].get(_url3, {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: "Bearer ".concat(GITHUB_TOKEN)
            }
          });
        case 8:
          response = _context10.sent;
          console.log(response.data);
          if (((_response$data$licens = response.data.license) === null || _response$data$licens === void 0 ? void 0 : _response$data$licens.spdx_id) == 'LGPL-2.1' || ((_response$data$licens2 = response.data.license) === null || _response$data$licens2 === void 0 ? void 0 : _response$data$licens2.spdx_id) == 'LGPL-2.1-only' || ((_response$data$licens3 = response.data.license) === null || _response$data$licens3 === void 0 ? void 0 : _response$data$licens3.spdx_id) == 'MIT') {
            score = 1;
          }
          _context10.next = 17;
          break;
        case 13:
          _context10.prev = 13;
          _context10.t0 = _context10["catch"](2);
          if (_context10.t0 instanceof Error) {
            console.error("Error calculating licenseMetric: ".concat(_context10.t0.message));
          } else {
            console.error('Error calculating licenseMetric:', _context10.t0);
          }
          return _context10.abrupt("return", 0);
        case 17:
          return _context10.abrupt("return", score);
        case 18:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[2, 13]]);
  }));
  return _license.apply(this, arguments);
}
if (!threading.isMainThread) {
  var _threading$parentPort;
  var _ref = threading.workerData,
    metricIndex = _ref.metricIndex,
    url = _ref.url,
    _path = _ref.path;
  var metric = metrics[metricIndex];
  (_threading$parentPort = threading.parentPort) === null || _threading$parentPort === void 0 || _threading$parentPort.once('message', function (childPort) {
    metricsRunner(metric, url, _path).then(function (metricResult) {
      childPort.hereIsYourPort.postMessage({
        metricName: metric.name,
        result: metricResult
      });
      childPort.hereIsYourPort.close();
    })["catch"](function (error) {
      console.error(error);
      childPort.hereIsYourPort.postMessage({
        metricName: metric.name,
        result: [-1, -1]
      });
      childPort.hereIsYourPort.close();
    });
  });
}
var _default = exports["default"] = computeMetrics;