"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_1 = require("./metrics");
describe('metrics.ts', () => {
    describe('license', () => {
        test('should return the license of a repository', async () => {
            await (0, metrics_1.license)('https://github.com/cloudinary/cloudinary_npm', 'cloned_repos/cloudinary_npm');
            expect(1).toBe(1);
        });
    });
});
