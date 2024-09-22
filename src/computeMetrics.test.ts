import { computeMetrics } from './metrics';

describe('Compute Metrics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should compute metrics and return the correct result', async () => {
        const packageUrl = 'http://example.com/package';
        const packagePath = '/path/to/package';

        const result = await computeMetrics(packageUrl, packagePath);

        expect(result).toHaveProperty('URL', packageUrl);
        expect(result).toHaveProperty('NetScore');
        expect(result).toHaveProperty('NetScore_Latency');
        expect(result).toHaveProperty('BusFactor');
        expect(result).toHaveProperty('ResponsiveMaintainer');
        expect(result).toHaveProperty('RampUp');
        expect(result).toHaveProperty('Correctness');
        expect(result).toHaveProperty('License');
    });

    test('should compute net score based on metric weights', async () => {
        const packageUrl = 'http://example.com/package';
        const packagePath = '/path/to/package';
        
        const expectedNetScore = 0.25;
        
        const result = await computeMetrics(packageUrl, packagePath);
        expect(result.NetScore).toBeCloseTo(expectedNetScore, 2);
    });

});
