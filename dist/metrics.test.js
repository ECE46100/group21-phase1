"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_1 = __importDefault(require("./metrics"));
describe('metrics.ts', () => {
    describe('license', () => {
        test('should return the license of a repository', async () => {
            const result = await (0, metrics_1.default)('https://www.react.com', 'cloned_repos/react');
            expect(result).toBe('MIT');
        });
    });
});
