"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metrics_1 = require("./metrics");
console.log('Running test_metrics.ts');
(0, metrics_1.default)('https://www.react.com', 'cloned_repos/react').then(function (result) {
    console.log('Metrics computed:');
    console.log(result);
}).catch(function (error) {
    console.error('Error computing metrics:');
    console.error(error);
});
