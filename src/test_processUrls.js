"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processUrls_1 = require("./processUrls");
const filePath = 'input.txt';
console.log('Running processURLs');
try {
    (0, processUrls_1.processURLs)(filePath);
}
catch (error) {
    console.error('Error running test_processUrls.ts', error);
}
