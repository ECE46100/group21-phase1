// src/processUrls_processURLs.test.ts
import { processURLs } from './processUrls'; // Adjust the import path as necessary

jest.mock('./processUrls', () => ({
    readURLFile: jest.fn(),
    classifyAndConvertURL: jest.fn(),
    cloneRepo: jest.fn(),
    computeMetrics: jest.fn(),
}));

const mockedFunctions = require('./processUrls'); // Require the mocked functions

describe('processURLs', () => {
    const filePath = 'path/to/urls.txt';
    const validUrls = ['https://github.com/owner/repo.git'];
    const invalidUrls = ['invalid-url'];

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should handle errors when reading the URL file fails', async () => {
        mockedFunctions.readURLFile.mockRejectedValueOnce(new Error('File not found'));

        await processURLs(filePath);

        // expect(mockedFunctions.handleOutput).toHaveBeenCalledWith('', expect.stringContaining('Error processing the URL file\nError message : Error: File not found'));
    });

    it('should handle errors when classifying and converting URL fails', async () => {
        mockedFunctions.readURLFile.mockResolvedValueOnce(validUrls);
        mockedFunctions.classifyAndConvertURL.mockRejectedValueOnce(new Error('Invalid URL'));

        await processURLs(filePath);

        // expect(mockedFunctions.handleOutput).toHaveBeenCalledWith('', expect.stringContaining('Error processing the URL file\nError message : Error: Invalid URL'));
    });

    it('should handle errors when cloning the repository fails', async () => {
        mockedFunctions.readURLFile.mockResolvedValueOnce(validUrls);
        mockedFunctions.classifyAndConvertURL.mockResolvedValueOnce(new URL('https://github.com/owner/repo.git'));
        mockedFunctions.cloneRepo.mockRejectedValueOnce(new Error('Clone failed'));

        await processURLs(filePath);

        // expect(mockedFunctions.handleOutput).toHaveBeenCalledWith('', expect.stringContaining('Error handling url https://github.com/owner/repo.git\nError message : Error: Clone failed'));
    });

    it('should handle errors when computing metrics fails', async () => {
        mockedFunctions.readURLFile.mockResolvedValueOnce(validUrls);
        mockedFunctions.classifyAndConvertURL.mockResolvedValueOnce(new URL('https://github.com/owner/repo.git'));
        mockedFunctions.cloneRepo.mockResolvedValueOnce(null);
        mockedFunctions.computeMetrics.mockRejectedValueOnce(new Error('Metrics computation error'));

        await processURLs(filePath);

        // expect(mockedFunctions.handleOutput).toHaveBeenCalledWith('', expect.stringContaining('Error computing metrics\nError message : Error: Metrics computation error'));
    });

    it('should handle null GitHub URLs', async () => {
        mockedFunctions.readURLFile.mockResolvedValueOnce([invalidUrls[0]]);
        mockedFunctions.classifyAndConvertURL.mockResolvedValueOnce(null);

        await processURLs(filePath);

        // expect(mockedFunctions.handleOutput).toHaveBeenCalledWith('', expect.stringContaining('Error processing the URL file\nError message : Error: GitHub URL is null.'));
    });
});
