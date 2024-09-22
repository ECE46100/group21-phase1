"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_1 = require("eslint");
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const metrics_1 = require("./metrics");
jest.mock('eslint');
jest.spyOn(winston_1.default, 'log').mockImplementation(jest.fn());
describe('Correctness Metric: Linting', () => {
    let mockESLintInstance;
    beforeEach(() => {
        mockESLintInstance = {
            lintFiles: jest.fn(),
        };
        eslint_1.ESLint.mockImplementation(() => mockESLintInstance);
        winston_1.default.log.mockClear();
    });
    test('Test 1: Successful', async () => {
        const lintResults = [
            { errorCount: 0, filePath: 'src/index.js' },
            { errorCount: 0, filePath: 'src/utils.js' },
        ];
        mockESLintInstance.lintFiles.mockResolvedValue(lintResults);
        const packagePath = path_1.default.join(__dirname, 'src');
        const score = await (0, metrics_1.linting)(packagePath);
        expect(score).toBe(1); // Adjust based on your scoring logic
    });
    test('Test 2: Error Running ESLint', async () => {
        const error = new Error('Path does not exist');
        mockESLintInstance.lintFiles.mockRejectedValue(error);
        const packagePath = path_1.default.join(__dirname, 'nonexistent');
        await expect((0, metrics_1.linting)(packagePath)).rejects.toThrow('Error: Path does not exist');
    });
});
