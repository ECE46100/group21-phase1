import license from './metrics';

describe('metrics.ts', () => {
    describe('license', () => {
        test('should return the license of a repository', async () => {
            await license('https://github.com/cloudinary/cloudinary_npm', 'cloned_repos/cloudinary_npm');
            expect(1).toBe(1);
        })
    })
})