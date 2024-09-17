import * as fs from 'fs';
import * as readline from 'readline';
import simpleGit from 'simple-git';
import axios from 'axios';
import { URL } from 'url';

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
 * @param {string} urlString - The URL to classify.
 * @returns {Promise<URL | null>} - A promise that resolves to a GitHub URL if found, or null if not.
 */
async function classifyAndConvertURL(urlString: string): Promise<URL | null> {
    try {
        const parsedUrl = new URL(urlString);

        if (parsedUrl.hostname === 'github.com') {
            return parsedUrl;
        }
        else if (parsedUrl.hostname === 'www.npmjs.com') {
            const packageName = parsedUrl.pathname.split('/').pop();
            if (!packageName) {
                handleOutput('', `Invalid npm URL: ${urlString}`);
                return null;
            }

            try {
                const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
                const repoUrl = response.data.repository?.url;

                if (repoUrl && repoUrl.includes('github.com')) {
                    const githubUrl = new URL(repoUrl.replace(/^git\+/, '').replace(/\.git$/, '').replace('ssh://git@github.com/', 'https://github.com/'));
                    githubUrl.pathname += '.git';
                    handleOutput(`npm converted to GitHub URL: ${githubUrl.toString()}`, '');
                    return githubUrl;
                } else {
                    handleOutput('', `No GitHub repository found for npm package: ${packageName}`);
                }
            } catch (error) {
                handleOutput('', `Failed to retrieve npm package data: ${packageName}\nError message: ${error}`);
            }
        } else {
            handleOutput('', `Unknown URL type: ${urlString}, neither GitHub nor npm`);
        }
    } catch (error) {
        handleOutput('', `Failed to parse the URL: ${urlString}\nError message : ${error}`);
    }
    return null;
}

/**
 * @function cloneRepo
 * @description Clones a GitHub repository.
 * @param {string} githubUrl - The string url of the GitHub repository. It cannot clone from URL object.
 * @param {string} targetDir - The directory where the repo should be cloned.
 * @returns {Promise<void>}
 */
async function cloneRepo(githubUrl: string, targetDir: string): Promise<void>  {
    const git = simpleGit();
    try {
        await git.clone(githubUrl, targetDir);
        handleOutput(`Cloned ${githubUrl} successfully.\n`, '');
    } catch (error) {
        handleOutput('', `Failed to clone ${githubUrl}\nError message : ${error}`);
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
        let i = 1;
        for (const url of urls) {
            handleOutput(`Processing URLs (${i++}/${urls.length}) --> ${url}`, '');
            const githubUrl = await classifyAndConvertURL(url);
            if (githubUrl)
            {
                const pathSegments = githubUrl.pathname.split('/').filter(Boolean);
                if (pathSegments.length != 2) throw new Error('Not a repo url');
                const owner = pathSegments[0];
                const packageName = pathSegments[1].replace('.git', '');
                handleOutput(`Cloning GitHub repo: ${githubUrl}`, '');
                await cloneRepo(githubUrl.toString(), `./cloned_repos/${owner} ${packageName}`);
            }
            else
            {
                throw new Error('GitHub URL is null.');
            }
        }
    } catch (error) {
        handleOutput('', `Error processing the URL file\nError message : ${error}`);
    }
}

/**
 * @function handleOutput
 * @description Handles the output of the result, error message, or log file. At least one of the message/errorMessage must be specified.
 * @param {string} message - Optional message to log.
 * @param {string} errorMessage - Optional error message to log.
 * @param {number} endpoint - Display endpoint for output (0: console, 1: log file).
 */
async function handleOutput(message = '', errorMessage = '', endpoint = 0): Promise<void> {
    switch(endpoint) { 
        case 0: { 
            if (message != '') console.log(message);
            if (errorMessage != '') console.error(errorMessage);
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
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        handleOutput('', 'No file path given. Please provide a URL file path as an argument.')
        process.exit(1);
    }
    processURLs(filePath);
}

export default processURLs