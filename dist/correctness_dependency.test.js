"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const metrics_1 = require("./metrics");
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
        fs_1.default.readFile.mockImplementation((_, __, callback) => {
            callback(new Error('File not found'));
        });
        await expect((0, metrics_1.dependencyAnalysis)('packagePath')).rejects.toThrow('Error reading package.json: Error: File not found');
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
        fs_1.default.readFile.mockImplementation((_, __, callback) => {
            callback(null, JSON.stringify(mockPackageJson));
        });
        fs_1.default.writeFile.mockImplementation((_, __, callback) => {
            callback(null);
        });
        child_process_1.spawn.mockImplementation((command, args, options) => {
            if (command === 'npm' && args.includes('install')) {
                return {
                    on: (event, cb) => {
                        if (event === 'close')
                            cb(0);
                    },
                };
            }
            else if (command === 'npm' && args.includes('audit')) {
                return {
                    stdout: {
                        on: (event, cb) => {
                            if (event === 'data')
                                cb(JSON.stringify({
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
                    on: (event, cb) => {
                        if (event === 'close')
                            cb(0);
                    },
                };
            }
            return {};
        });
        const score = await (0, metrics_1.dependencyAnalysis)('packagePath');
        expect(fs_1.default.writeFile).toHaveBeenCalledWith(path_1.default.join('packagePath', 'package.json'), JSON.stringify({
            dependencies: {
                'some-package': 'file:../some-package',
            },
            devDependencies: {
                'some-dev-package': 'file:../some-dev-package',
            },
        }), expect.any(Function));
        expect(score).toBe(1); // Adjust based on your scoring logic
    });
});
