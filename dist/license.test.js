"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_1 = require("./metrics");
describe('metrics.ts', () => {
    describe('license', () => {
        test('should return score 1 for a repo with a valid license using GitHub license REST API', async () => {
            const score = await (0, metrics_1.license)('https://github.com/hasansultan92/watch.js', '');
            expect(score).toBe(1);
        });
        test('should return score 1 for a repo with a valid license using package.json', async () => {
            const score = await (0, metrics_1.license)('https://github.com/prathameshnetake/libvlc', '');
            expect(score).toBe(1);
        });
        test('should return score 0 for a repo with a valid license', async () => {
            const score = await (0, metrics_1.license)('https://github.com/ryanve/unlicensed', '');
            expect(score).toBe(0);
        });
    });
    describe('license_thru_files', () => {
        test('should return score 1 for a repo with a valid license using GitHub license REST API', async () => {
            const score = await (0, metrics_1.license_thru_files)('hasansultan92', 'watch.js', '');
            expect(score).toBe(score);
        });
    });
});
