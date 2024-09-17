"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metrics_1 = require("./metrics");
console.log('Running test_metrics.ts');
(0, metrics_1.default)('https://www.example.com', '/path/to/package').then(function (result) {
    console.log('Metrics computed:');
    console.log(result);
}).catch(function (error) {
    console.error('Error computing metrics:');
    console.error(error);
});
