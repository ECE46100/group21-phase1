import axios from 'axios';
import { classifyAndConvertURL } from './processUrls';
// import { handleOutput } from './outputHandler';  // Assuming handleOutput is imported from another module
import * as winston from 'winston';

// Mock axios for npm registry requests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock winston and handleOutput
jest.mock('winston', () => ({
    createLogger: jest.fn(() => ({
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    })),
    transports: {
        File: jest.fn(),
        Console: jest.fn(),
    },
    format: {
        simple: jest.fn(),
        json: jest.fn(),
    },
    configure: jest.fn(),
    remove: jest.fn(),
}));
// jest.mock('./outputHandler', () => ({
//     handleOutput: jest.fn(),
// }));

describe('classifyAndConvertURL', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the GitHub URL when given a valid GitHub URL', async () => {
        const githubUrl = 'https://github.com/example/repo';
        const result = await classifyAndConvertURL(githubUrl);

        expect(result?.toString()).toBe(githubUrl);
        // expect(handleOutput).not.toHaveBeenCalled();  // No errors should be output
    });

    it('should convert npm URL to GitHub URL if repository is available', async () => {
        const npmUrl = 'https://www.npmjs.com/package/some-package';
        const npmPackageName = 'some-package';
        const githubRepoUrl = 'https://github.com/example/repo';

        // Mock the axios response for npm registry lookup
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                repository: {
                    url: `git+${githubRepoUrl}.git`
                }
            }
        });

        const result = await classifyAndConvertURL(npmUrl);

        expect(result?.toString()).toBe(`${githubRepoUrl}.git`);
        expect(mockedAxios.get).toHaveBeenCalledWith(`https://registry.npmjs.org/${npmPackageName}`);
        // expect(handleOutput).toHaveBeenCalledWith(`npm converted to GitHub URL: ${githubRepoUrl}.git`, '');
        expect(winston.log).toHaveBeenCalledWith('info', `npm converted to GitHub URL: ${githubRepoUrl}.git`);
    });

    it('should return null and log a warning when npm package has no repository', async () => {
        const npmUrl = 'https://www.npmjs.com/package/no-repo-package';
        const npmPackageName = 'no-repo-package';

        // Mock the axios response for npm registry lookup with no repository field
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                repository: null
            }
        });

        const result = await classifyAndConvertURL(npmUrl);

        expect(result).toBeNull();
        expect(mockedAxios.get).toHaveBeenCalledWith(`https://registry.npmjs.org/${npmPackageName}`);
        // expect(handleOutput).toHaveBeenCalledWith('', `No GitHub repository found for npm package: ${npmPackageName}`);
        expect(winston.log).toHaveBeenCalledWith('warn', `No GitHub repository found for npm package: ${npmPackageName}`);
    });

    it('should return null for unknown URL types', async () => {
        const unknownUrl = 'https://unknown.com/package/some-package';

        const result = await classifyAndConvertURL(unknownUrl);

        expect(result).toBeNull();
        // expect(handleOutput).toHaveBeenCalledWith('', `Unknown URL type: ${unknownUrl}, neither GitHub nor npm`);
        expect(winston.log).toHaveBeenCalledWith('warn', `Unknown URL type: ${unknownUrl}, neither GitHub nor npm`);
    });

    it('should handle invalid URLs and return null', async () => {
        const invalidUrl = 'invalid-url';

        const result = await classifyAndConvertURL(invalidUrl);

        expect(result).toBeNull();
        // expect(handleOutput).toHaveBeenCalledWith('', `Failed to parse the URL: ${invalidUrl}\nError message : TypeError: Invalid URL`);
        expect(winston.log).toHaveBeenCalledWith('warn', `Failed to parse the URL: ${invalidUrl}\nError message : TypeError: Invalid URL`);
    });

    it('should handle axios errors when npm registry lookup fails', async () => {
        const npmUrl = 'https://www.npmjs.com/package/error-package';
        const npmPackageName = 'error-package';

        // Mock axios to simulate an error
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        const result = await classifyAndConvertURL(npmUrl);

        expect(result).toBeNull();
        expect(mockedAxios.get).toHaveBeenCalledWith(`https://registry.npmjs.org/${npmPackageName}`);
        // expect(handleOutput).toHaveBeenCalledWith('', `Failed to retrieve npm package data: ${npmPackageName}\nError message: Error: Network error`);
        expect(winston.log).toHaveBeenCalledWith('warn', `Failed to retrieve npm package data: ${npmPackageName}\nError message: Error: Network error`);
    });
});
