"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const processUrls_1 = __importDefault(require("./processUrls"));
console.log('Running test_processURLs.ts');
const filePath = 'src/test_input.txt';
try {
    (0, processUrls_1.default)(filePath);
}
catch (error) {
    console.error('Error running test_processUrls.ts:', error);
}
