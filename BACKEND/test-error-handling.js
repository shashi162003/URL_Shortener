/**
 * Test script to verify error handling implementation
 * Run this with: node test-error-handling.js
 */

import dotenv from "dotenv";
import { generateNanoId } from "./src/utils/helper.js";
import { saveShortUrl, getShortUrl } from "./src/dao/shortUrl.dao.js";
import { createShortUrlServiceWithoutUserId, createShortUrlServiceWithUserId } from "./src/services/ShortUrl.service.js";
import { BadRequestError, ConflictError, NotFoundError } from "./src/utils/errorHandler.js";

dotenv.config();

// Test colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`)
};

// Test helper function
async function runTest(testName, testFn) {
    try {
        log.info(`Running test: ${testName}`);
        await testFn();
        log.success(`Test passed: ${testName}`);
        return true;
    } catch (error) {
        log.error(`Test failed: ${testName} - ${error.message}`);
        return false;
    }
}

// Test generateNanoId function
async function testGenerateNanoId() {
    const tests = [
        {
            name: "Valid length",
            test: () => {
                const id = generateNanoId(7);
                if (!id || id.length !== 7) throw new Error("Invalid ID generated");
            }
        },
        {
            name: "Invalid length (0)",
            test: () => {
                try {
                    generateNanoId(0);
                    throw new Error("Should have thrown error for length 0");
                } catch (error) {
                    if (!error.message.includes("positive number")) throw error;
                }
            }
        },
        {
            name: "Invalid length (negative)",
            test: () => {
                try {
                    generateNanoId(-5);
                    throw new Error("Should have thrown error for negative length");
                } catch (error) {
                    if (!error.message.includes("positive number")) throw error;
                }
            }
        },
        {
            name: "Invalid length (too large)",
            test: () => {
                try {
                    generateNanoId(100);
                    throw new Error("Should have thrown error for length > 50");
                } catch (error) {
                    if (!error.message.includes("cannot exceed 50")) throw error;
                }
            }
        },
        {
            name: "Invalid type (string)",
            test: () => {
                try {
                    generateNanoId("7");
                    throw new Error("Should have thrown error for string input");
                } catch (error) {
                    if (!error.message.includes("positive number")) throw error;
                }
            }
        }
    ];

    let passed = 0;
    for (const test of tests) {
        if (await runTest(`generateNanoId - ${test.name}`, test.test)) {
            passed++;
        }
    }
    
    log.info(`generateNanoId tests: ${passed}/${tests.length} passed`);
    return passed === tests.length;
}

// Test service layer error handling
async function testServiceLayer() {
    const tests = [
        {
            name: "Valid URL without user ID",
            test: async () => {
                // This will fail without database connection, but should validate inputs
                try {
                    await createShortUrlServiceWithoutUserId("https://example.com");
                } catch (error) {
                    // Expected to fail due to no DB connection, but should not be validation error
                    if (error instanceof BadRequestError) throw error;
                }
            }
        },
        {
            name: "Empty URL",
            test: async () => {
                try {
                    await createShortUrlServiceWithoutUserId("");
                    throw new Error("Should have thrown BadRequestError");
                } catch (error) {
                    if (!(error instanceof BadRequestError)) throw new Error("Expected BadRequestError");
                }
            }
        },
        {
            name: "Null URL",
            test: async () => {
                try {
                    await createShortUrlServiceWithoutUserId(null);
                    throw new Error("Should have thrown BadRequestError");
                } catch (error) {
                    if (!(error instanceof BadRequestError)) throw new Error("Expected BadRequestError");
                }
            }
        },
        {
            name: "Invalid URL type",
            test: async () => {
                try {
                    await createShortUrlServiceWithoutUserId(123);
                    throw new Error("Should have thrown BadRequestError");
                } catch (error) {
                    if (!(error instanceof BadRequestError)) throw new Error("Expected BadRequestError");
                }
            }
        },
        {
            name: "Valid URL with valid user ID",
            test: async () => {
                try {
                    await createShortUrlServiceWithUserId("https://example.com", "user123");
                } catch (error) {
                    // Expected to fail due to no DB connection, but should not be validation error
                    if (error instanceof BadRequestError) throw error;
                }
            }
        },
        {
            name: "Valid URL with empty user ID",
            test: async () => {
                try {
                    await createShortUrlServiceWithUserId("https://example.com", "");
                    throw new Error("Should have thrown BadRequestError");
                } catch (error) {
                    if (!(error instanceof BadRequestError)) throw new Error("Expected BadRequestError");
                }
            }
        }
    ];

    let passed = 0;
    for (const test of tests) {
        if (await runTest(`Service Layer - ${test.name}`, test.test)) {
            passed++;
        }
    }
    
    log.info(`Service layer tests: ${passed}/${tests.length} passed`);
    return passed === tests.length;
}

// Test error classes
async function testErrorClasses() {
    const tests = [
        {
            name: "BadRequestError",
            test: () => {
                const error = new BadRequestError("Test message");
                if (error.statusCode !== 400) throw new Error("Wrong status code");
                if (error.message !== "Test message") throw new Error("Wrong message");
            }
        },
        {
            name: "ConflictError",
            test: () => {
                const error = new ConflictError("Test conflict");
                if (error.statusCode !== 409) throw new Error("Wrong status code");
                if (error.message !== "Test conflict") throw new Error("Wrong message");
            }
        },
        {
            name: "NotFoundError",
            test: () => {
                const error = new NotFoundError("Test not found");
                if (error.statusCode !== 404) throw new Error("Wrong status code");
                if (error.message !== "Test not found") throw new Error("Wrong message");
            }
        }
    ];

    let passed = 0;
    for (const test of tests) {
        if (await runTest(`Error Classes - ${test.name}`, test.test)) {
            passed++;
        }
    }
    
    log.info(`Error classes tests: ${passed}/${tests.length} passed`);
    return passed === tests.length;
}

// Main test runner
async function runAllTests() {
    log.info("Starting error handling tests...\n");
    
    const results = [];
    
    results.push(await testGenerateNanoId());
    results.push(await testServiceLayer());
    results.push(await testErrorClasses());
    
    const totalPassed = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log("\n" + "=".repeat(50));
    if (totalPassed === totalTests) {
        log.success(`All tests passed! (${totalPassed}/${totalTests})`);
    } else {
        log.error(`Some tests failed. (${totalPassed}/${totalTests})`);
    }
    console.log("=".repeat(50));
    
    return totalPassed === totalTests;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            log.error(`Test runner failed: ${error.message}`);
            process.exit(1);
        });
}

export { runAllTests };
