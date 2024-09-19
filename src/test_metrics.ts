import computeMetrics from './metrics';

console.log('Running test_metrics.ts');
computeMetrics('https://www.react.com', 'cloned_repos/cloudinary cloudinary_npm').then((result) => {
    console.log('Metrics computed:');
    console.log(result);
}).catch((error: unknown) => {
    console.error('Error computing metrics:');
    console.error(error);
});