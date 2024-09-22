import  { License } from './metrics';

describe('metrics.ts', () => {
    describe('license', () => {
        test('should return score 1 for a repo with a valid license', async () => {
            const score = await License('https://github.com/hasansultan92/watch.js', '');
            expect(score).toBe(1);
        })
        test('should return score 0 for a repo with a valid license', async () => {
            const score = await License('https://github.com/ryanve/unlicensed', '');
            expect(score).toBe(0);
        })
    })
})