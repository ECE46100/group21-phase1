"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var processUrls_1 = require("./processUrls");
console.log('Running test_processURLs.ts');
var filePath = 'src/test_input.txt';
try {
    (0, processUrls_1.default)(filePath);
}
catch (error) {
    console.error('Error running test_processUrls.ts:', error);
}
