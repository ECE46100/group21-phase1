import fs from 'fs';
import path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { dependencyAnalysis } from './metrics';
import winston from 'winston';

jest.mock('fs');
jest.mock('child_process');
jest.mock('winston', () => ({
    log: jest.fn(),
    configure: jest.fn(),
    remove: jest.fn(),
    transports: {
        File: jest.fn().mockImplementation(() => ({
            log: jest.fn(),
        })),
        Console: jest.fn(),
    },
}));

describe('Dependency Analysis', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should reject if package.json cannot be read', async () => {
        (fs.readFile as unknown as jest.Mock).mockImplementation((_, __, callback) => {
            callback(new Error('File not found'));
        });

        await expect(dependencyAnalysis('packagePath')).rejects.toThrow('Error reading package.json: Error: File not found');
    });

    test('should replace links in dependencies and devDependencies', async () => {
        const mockPackageJson = {
            dependencies: {
                'some-package': 'link:../some-package',
            },
            devDependencies: {
                'some-dev-package': 'link:../some-dev-package',
            },
        };

        (fs.readFile as unknown as jest.Mock).mockImplementation((_, __, callback) => {
            callback(null, JSON.stringify(mockPackageJson));
        });

        (fs.writeFile as unknown as jest.Mock).mockImplementation((_, __, callback) => {
            callback(null);
        });

        (spawn as unknown as jest.Mock).mockImplementation((command: string, args: string[], options?: any): ChildProcessWithoutNullStreams => {
            if (command === 'npm' && args.includes('install')) {
                return {
                    on: (event: string, cb: (code: number) => void) => {
                        if (event === 'close') cb(0);
                    },
                } as unknown as ChildProcessWithoutNullStreams;
            } else if (command === 'npm' && args.includes('audit')) {
                return {
                    stdout: {
                        on: (event: string, cb: (data: any) => void) => {
                            if (event === 'data') cb(JSON.stringify({
                                metadata: {
                                    vulnerabilities: {
                                        low: 0,
                                        moderate: 0,
                                        high: 0,
                                        critical: 0,
                                    },
                                },
                            }));
                        },
                    },
                    on: (event: string, cb: (code: number) => void) => {
                        if (event === 'close') cb(0);
                    },
                } as unknown as ChildProcessWithoutNullStreams;
            }
            return {} as ChildProcessWithoutNullStreams;
        });

        const score = await dependencyAnalysis('packagePath');

        expect(fs.writeFile).toHaveBeenCalledWith(
            path.join('packagePath', 'package.json'),
            JSON.stringify({
                dependencies: {
                    'some-package': 'file:../some-package',
                },
                devDependencies: {
                    'some-dev-package': 'file:../some-dev-package',
                },
            }),
            expect.any(Function)
        );

        expect(score).toBe(1); // Adjust based on your scoring logic
    });
});
