/**
 * @function getOwnerAndPackageName
 * @description A function that extracts owner and packageName from a valid github repo url
 * @param {string} packageUrl - The GitHub repository url(string).
 * @returns {[string, string]} - [Owner, packageName]
 */
export function getOwnerAndPackageName(packageUrl: string): [string, string]{
    const pathSegments = packageUrl.split('/').filter(Boolean);
    const owner = pathSegments[pathSegments.length-2];
    const packageName = pathSegments[pathSegments.length-1].replace('.git', '');
    return [owner, packageName];
}