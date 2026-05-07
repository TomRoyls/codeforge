/**
 * Test-only rule helpers.
 *
 * These re-export from rules/index.js for test convenience.
 * Tests can eagerly load all rules — the lazy-loading optimization
 * only matters for CLI startup time, not test execution.
 *
 * IMPORTANT: This module should ONLY be imported by test files.
 * Production code must use lazy-loader or categories.ts instead.
 */

// Re-export the eager-loaded rule registry for tests that need synchronous access
export { allRules, getRule, getRuleIds } from '../../src/rules/index.js'

// Re-export getRuleCategory from the lightweight categories module
export { getRuleCategory, type RuleCategory } from '../../src/rules/categories.js'
