"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var processUrls_js_1 = require("./processUrls.js");
var filePath = 'input.txt';
console.log('Running processURLs');
try {
    (0, processUrls_js_1.processURLs)(filePath);
}
catch (error) {
    console.error('Error running test_processUrls.ts', error);
}
