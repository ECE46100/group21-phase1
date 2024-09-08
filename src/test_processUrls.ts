import { processURLs } from './processUrls.js';

const filePath = 'input.txt';
console.log('Running processURLs');
try{
    processURLs(filePath);
}
catch(error){
    console.error('Error running test_processUrls.ts', error);
}
