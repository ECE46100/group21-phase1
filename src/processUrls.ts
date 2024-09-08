import * as fs from 'fs';
import * as readline from 'readline';
import simpleGit from 'simple-git';
import axios from 'axios';

/**
 * @function readURLFile
 * @description Reads a file line by line and extracts the URLs.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<string[]>} - A promise that resolves to an array of URLs.
 */
async function readURLFile(filePath: string): Promise<string[]> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const urls: string[] = [];
    for await (const line of rl) {
        if (line.trim()) {
            urls.push(line);
        }
    }
    return urls;
}

/**
 * @function classifyAndConvertURL
 * @description Classifies an URL as either GitHub or npm, and if npm, converts it to a GitHub URL if possible.
 * @param {string} url - The URL to classify.
 * @returns {Promise<string | null>} - A promise that resolves to a GitHub URL if found, or null if not.
 */
async function classifyAndConvertURL(url: string): Promise<string | null> {
    if (url.includes('github.com')) {
        return url;
    } 
    else if (url.includes('npmjs.com')) {
        /* Extract package name from npm URL */
        const packageName = url.split('/').pop();

        try {
            /* Try to fetch GitHub URL from npm package info */
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            const repositoryUrl = response.data.repository?.url;

            if (repositoryUrl && repositoryUrl.includes('github.com')) {
                /* Convert git+https://github.com/ to https://github.com/ */
                const githubUrl = repositoryUrl.replace(/^git\+/, '');
                handleOutput(`Found GitHub Url : ${githubUrl}`, '');
                return githubUrl;
            } 
            else {
                handleOutput('', `No GitHub repository found for npm package: ${packageName}`);
            }
        } catch (error) {
            handleOutput('', `Failed to retrieve npm package data: ${packageName}\n, Error message: ${error}`);
        }
    }
    handleOutput('', `Unknown URL type: ${url}`);
    return null;
}

/**
 * @function cloneRepo
 * @description Clones a GitHub repository.
 * @param {string} repoUrl - The URL of the GitHub repository.
 * @param {string} targetDir - The directory where the repo should be cloned.
 */
async function cloneRepo(repoUrl: string, targetDir: string) {
    const git = simpleGit();
    try {
        await git.clone(repoUrl, targetDir);
        handleOutput(`Cloned ${repoUrl} successfully.`, '');
    } catch (error) {
        handleOutput('', `Failed to clone ${repoUrl}:`);
    }
}

/**
 * @function processURLs
 * @description Processes the URLs from a file, classifying and converting npm URLs to GitHub, and cloning repos.
 * @param {string} filePath - The path to the file containing URLs.
 * @returns {Promise<void>}
*/
export async function processURLs(filePath: string): Promise<void> {
    try {
        const urls = await readURLFile(filePath);
        for (const url of urls) {
            const githubUrl = await classifyAndConvertURL(url);
            if (githubUrl)
            {
                var splitArray = githubUrl.split('/');
                const packageName = splitArray.pop();
                const ownerName = splitArray.pop();
                handleOutput(`Cloning GitHub repo: ${githubUrl}`, '');
                await cloneRepo(githubUrl, `./cloned_repos/${ownerName} ${packageName}`);
            }
            else
            {
                new Error('URL is null.');
            }
        }
    } catch (error) {
        handleOutput('', `Error processing the URL file, error message : ${error}`);
    }
}


/**
 * @function handleOutput
 * @description Handles the output of the result, error message, or log file.
 * @param {string} message - The message to log.
 * @param {number} endpoint - Display endpoint for output (0: console, 1: log file).
 * @param {Error} errorMessage - Optional error message to log.
 */
async function handleOutput(message: string = '', errorMessage: string = '', endpoint: number = 0) {
    switch(endpoint) { 
        case 0: { 
            if (message != '') console.log(message);
            if (errorMessage != '') {
                console.error(new Error(errorMessage));
                // console.log(errorMessage + '\n');
            }
            break; 
        } 
        case 1: { 
            break;   
        } 
        default: { 
            if (message != '') console.log(message);
            if (errorMessage != '') console.error(new Error(errorMessage));
            break; 
        } 
     } 
}

/* Entry point */
if (require.main == module){
    const filePath = process.argv[2];
    if (!filePath) {
        handleOutput('', 'Error: Please provide the URL file path as an argument.')
        process.exit(1);
    }

    processURLs(filePath);
}