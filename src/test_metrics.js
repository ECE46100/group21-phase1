"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_1 = __importDefault(require("./metrics"));
console.log('Running test_metrics.ts');
(0, metrics_1.default)('https://www.react.com', 'cloned_repos/socket.io').then((result) => {
    console.log('Metrics computed:');
    console.log(result);
}).catch((error) => {
    console.error('Error computing metrics:');
    console.error(error);
});
