import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import chalk from 'chalk'

import {
  checkConfigExists,
  checkConfigValid,
  checkFileCount,
  checkFilePatterns,
  checkMemory,
  checkNodeVersion,
  checkPackageJson,
  checkRulesValid,
  checkTsConfig,
  checkTypeScript,
  colorMessage,
  displayResults,
  fileExists,
  getStatusSymbol,
  type DoctorResult,
} from '../../../src/commands/doctor-helpers.js'
import { discoverConfig } from '../../../src/config/discovery.js'
import { parseConfigFile } from '../../../src/config/parser.js'
import { discoverFiles } from '../../../src/core/file-discovery.js'
import { getRuleIds } from '../../../src/rules/index.js'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('node:fs/promises', () => ({
  stat: vi.fn(),
  readFile: vi.fn(),
}))

vi.mock('node:os', () => ({
  totalmem: vi.fn(() => 8 * 1024 * 1024 * 1024), // 8GB
}))

vi.mock('../../../src/config/discovery.js', () => ({
  discoverConfig: vi.fn(),
}))

vi.mock('../../../src/config/parser.js', () => ({
  parseConfigFile: vi.fn(),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(() => []),
}))

vi.mock('../../../src/rules/index.js', () => ({
  getRuleIds: vi.fn(() => ['rule-a', 'rule-b']),
}))

// ============================================================================
// Helpers
// ============================================================================

const makeDoctorResult = (): DoctorResult => ({
  checks: [],
  errors: 0,
  passed: true,
  warnings: 0,
})

const cwd = '/project'

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// colorMessage
// ============================================================================

describe('colorMessage', () => {
  test('returns red-colored message for error status', () => {
    const result = colorMessage('error', 'something failed')
    expect(result).toBe(chalk.red('something failed'))
  })

  test('returns plain message for ok status', () => {
    const result = colorMessage('ok', 'all good')
    expect(result).toBe('all good')
  })

  test('returns yellow-colored message for warning status', () => {
    const result = colorMessage('warning', 'be careful')
    expect(result).toBe(chalk.yellow('be careful'))
  })

  test('preserves the original message content for error', () => {
    const result = colorMessage('error', 'my error text')
    expect(result).toContain('my error text')
  })

  test('preserves the original message content for ok', () => {
    const result = colorMessage('ok', 'my ok text')
    expect(result).toBe('my ok text')
  })

  test('preserves the original message content for warning', () => {
    const result = colorMessage('warning', 'my warning text')
    expect(result).toContain('my warning text')
  })

  test('handles empty string message for ok', () => {
    const result = colorMessage('ok', '')
    expect(result).toBe('')
  })

  test('handles empty string message for error', () => {
    const result = colorMessage('error', '')
    expect(result).toContain('')
  })

  test('handles special characters in error message', () => {
    const result = colorMessage('error', 'error with <html> & "quotes"')
    expect(result).toContain('<html>')
    expect(result).toContain('&')
    expect(result).toContain('"quotes"')
  })

  test('handles multiline message for error status', () => {
    const result = colorMessage('error', 'line1\nline2\nline3')
    expect(result).toContain('line1')
    expect(result).toContain('line2')
    expect(result).toContain('line3')
  })

  test('handles multiline message for warning status', () => {
    const result = colorMessage('warning', 'warn1\nwarn2')
    expect(result).toContain('warn1')
    expect(result).toContain('warn2')
  })

  test('handles very long message for ok status', () => {
    const longMsg = 'a'.repeat(1000)
    const result = colorMessage('ok', longMsg)
    expect(result).toBe(longMsg)
  })

  test('ok status does not modify the message content', () => {
    const msg = 'exact content here'
    const result = colorMessage('ok', msg)
    expect(result).toBe(msg)
  })

  test('error status wraps message with chalk.red', () => {
    const msg = 'wrapped error'
    const result = colorMessage('error', msg)
    expect(result).toBe(chalk.red(msg))
  })

  test('warning status wraps message with chalk.yellow', () => {
    const msg = 'wrapped warning'
    const result = colorMessage('warning', msg)
    expect(result).toBe(chalk.yellow(msg))
  })
})

// ============================================================================
// getStatusSymbol
// ============================================================================

describe('getStatusSymbol', () => {
  test('returns red ✗ for error status', () => {
    const result = getStatusSymbol('error')
    expect(result).toBe(chalk.red('✗'))
  })

  test('returns green ✓ for ok status', () => {
    const result = getStatusSymbol('ok')
    expect(result).toBe(chalk.green('✓'))
  })

  test('returns yellow ⚠ for warning status', () => {
    const result = getStatusSymbol('warning')
    expect(result).toBe(chalk.yellow('⚠'))
  })

  test('error symbol contains ✗ character', () => {
    const result = getStatusSymbol('error')
    expect(result).toContain('✗')
  })

  test('ok symbol contains ✓ character', () => {
    const result = getStatusSymbol('ok')
    expect(result).toContain('✓')
  })

  test('warning symbol contains ⚠ character', () => {
    const result = getStatusSymbol('warning')
    expect(result).toContain('⚠')
  })

  test('returns string type for error status', () => {
    const result = getStatusSymbol('error')
    expect(typeof result).toBe('string')
  })

  test('returns string type for ok status', () => {
    const result = getStatusSymbol('ok')
    expect(typeof result).toBe('string')
  })

  test('returns string type for warning status', () => {
    const result = getStatusSymbol('warning')
    expect(typeof result).toBe('string')
  })

  test('returns non-empty string for all statuses', () => {
    expect(getStatusSymbol('ok').length).toBeGreaterThan(0)
    expect(getStatusSymbol('error').length).toBeGreaterThan(0)
    expect(getStatusSymbol('warning').length).toBeGreaterThan(0)
  })

  test('all three status symbols are distinct', () => {
    const ok = getStatusSymbol('ok')
    const err = getStatusSymbol('error')
    const warn = getStatusSymbol('warning')
    expect(ok).not.toBe(err)
    expect(ok).not.toBe(warn)
    expect(err).not.toBe(warn)
  })

  test('ok symbol is wrapped by chalk.green', () => {
    const result = getStatusSymbol('ok')
    expect(result).toBe(chalk.green('✓'))
  })
})

// ============================================================================
// displayResults
// ============================================================================

describe('displayResults', () => {
  test('formats a single ok check', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Config found', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✓')
    expect(lines[0]).toContain('Config found')
  })

  test('formats a single error check', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Config invalid', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✗')
    expect(lines[0]).toContain('Config invalid')
  })

  test('formats a single warning check', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Low memory', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('⚠')
    expect(lines[0]).toContain('Low memory')
  })

  test('includes details line when verbose is true and details exist', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Config invalid',
          status: 'error',
          details: 'Missing required field',
        },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[0]).toContain('Config invalid')
    expect(lines[1]).toContain('Missing required field')
  })

  test('excludes details line when verbose is false', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Config invalid',
          status: 'error',
          details: 'Missing required field',
        },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(3) // check line + blank + summary
    expect(lines[0]).toContain('Config invalid')
  })

  test('excludes details line when verbose is true but no details', () => {
    const results: DoctorResult = {
      checks: [{ message: 'All good', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines).toHaveLength(3) // check line + blank + summary
  })

  test('adds blank line before summary', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check 1', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[1]).toBe('')
  })

  test('shows error summary when errors > 0', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Fail', status: 'error' }],
      errors: 3,
      passed: false,
      warnings: 2,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('3')
    expect(summary).toContain('error')
    expect(summary).toContain('2')
    expect(summary).toContain('warning')
  })

  test('shows warning summary when warnings > 0 and errors = 0', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Heads up', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('All checks passed')
    expect(summary).toContain('1')
    expect(summary).toContain('warning')
  })

  test('shows success summary when no errors and no warnings', () => {
    const results: DoctorResult = {
      checks: [{ message: 'All good', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('All checks passed')
    expect(summary).not.toContain('warning')
  })

  test('handles empty checks array', () => {
    const results: DoctorResult = {
      checks: [],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(2) // blank + summary
    expect(lines[0]).toBe('')
  })

  test('formats multiple checks with mixed statuses', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Check 1', status: 'ok' },
        { message: 'Check 2', status: 'warning' },
        { message: 'Check 3', status: 'error' },
      ],
      errors: 1,
      passed: false,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(5) // 3 checks + blank + summary
    expect(lines[0]).toContain('✓')
    expect(lines[1]).toContain('⚠')
    expect(lines[2]).toContain('✗')
  })

  test('pluralizes warnings correctly (singular)', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('1 warning')
    expect(summary).not.toContain('1 warnings')
  })

  test('pluralizes warnings correctly (plural)', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 3,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('3 warnings')
  })

  test('details line is gray colored', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Check',
          status: 'ok',
          details: 'extra info',
        },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toBe(chalk.gray('  extra info'))
  })

  test('formats check with status symbol prefix', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check passed', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✓')
    expect(lines[0]).toContain('Check passed')
  })

  test('shows multiple details when verbose and multiple checks have details', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Check 1', status: 'error', details: 'Detail 1' },
        { message: 'Check 2', status: 'ok', details: 'Detail 2' },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines).toContain(chalk.gray('  Detail 1'))
    expect(lines).toContain(chalk.gray('  Detail 2'))
  })

  test('error summary includes both error and warning counts', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Error', status: 'error' },
        { message: 'Warning', status: 'warning' },
      ],
      errors: 2,
      passed: false,
      warnings: 5,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('2 error')
    expect(summary).toContain('5 warning')
  })

  test('success summary is green colored', () => {
    const results: DoctorResult = {
      checks: [{ message: 'All good', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.green('All checks passed!'))
  })

  test('verbose with no details shows same number of lines as non-verbose', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Simple check', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const verboseLines = displayResults(results, true)
    const nonVerboseLines = displayResults(results, false)
    expect(verboseLines).toHaveLength(nonVerboseLines.length)
  })

  test('handles single check with details in verbose mode', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'warning', details: 'some detail' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, true)
    expect(lines).toHaveLength(4) // check + detail + blank + summary
  })

  test('error summary is red colored', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Fail', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.red('Found 1 error(s), 0 warning(s)'))
  })

  test('warning summary is yellow colored', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 2,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.yellow('All checks passed! (2 warnings)'))
  })

  test('handles many checks correctly', () => {
    const checks = Array.from({ length: 10 }, (_, i) => ({
      message: `Check ${i}`,
      status: 'ok' as const,
    }))
    const results: DoctorResult = {
      checks,
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(12) // 10 checks + blank + summary
  })

  test('formats only error checks without warnings', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Error 1', status: 'error' },
        { message: 'Error 2', status: 'error' },
      ],
      errors: 2,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('2 error')
    expect(summary).toContain('0 warning')
  })

  test('error count 1 warning count 0 exact format', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Single error', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.red('Found 1 error(s), 0 warning(s)'))
  })

  test('verbose mode with error details', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'error', details: 'fix hint' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines).toHaveLength(4) // check + detail + blank + summary
    expect(lines[1]).toBe(chalk.gray('  fix hint'))
  })

  test('line format has symbol and message separated by space', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Test message', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toMatch(/✓\s+Test message/)
  })

  test('handles checks with same status', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Check A', status: 'ok' },
        { message: 'Check B', status: 'ok' },
        { message: 'Check C', status: 'ok' },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(5) // 3 checks + blank + summary
    for (let i = 0; i < 3; i++) {
      expect(lines[i]).toContain('✓')
    }
  })

  test('large number of warnings pluralization', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 10,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('10 warnings')
    expect(summary).not.toContain('10 warning)')
  })

  test('mixed verbose with some having details and some not', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'With detail', status: 'ok', details: 'extra' },
        { message: 'No detail', status: 'warning' },
      ],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, true)
    expect(lines).toHaveLength(5) // check1 + detail1 + check2 + blank + summary
  })
})

// ============================================================================
// fileExists
// ============================================================================

describe('fileExists', () => {
  test('returns true for existing file', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const result = await fileExists('/path/to/file.ts')
    expect(result).toBe(true)
  })

  test('returns false for non-existing file', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const result = await fileExists('/nonexistent/file.ts')
    expect(result).toBe(false)
  })

  test('returns false for directory (isFile returns false)', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as never)
    const result = await fileExists('/path/to/dir')
    expect(result).toBe(false)
  })

  test('returns false on stat error', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('permission denied'))
    const result = await fileExists('/no-access')
    expect(result).toBe(false)
  })

  test('calls fs.stat with the given path', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    await fileExists('/specific/path.ts')
    expect(fs.stat).toHaveBeenCalledWith('/specific/path.ts')
  })

  test('handles empty path string', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const result = await fileExists('')
    expect(result).toBe(false)
  })

  test('handles path with spaces', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const result = await fileExists('/path/with spaces/file.ts')
    expect(result).toBe(true)
    expect(fs.stat).toHaveBeenCalledWith('/path/with spaces/file.ts')
  })

  test('handles path with unicode characters', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const result = await fileExists('/путь/文件.ts')
    expect(result).toBe(true)
  })

  test('returns boolean type', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const result = await fileExists('/path/to/file.ts')
    expect(typeof result).toBe('boolean')
  })

  test('handles deep nested path', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const result = await fileExists('/a/b/c/d/e/f/g/h/i/j/file.ts')
    expect(result).toBe(true)
  })

  test('handles path with special characters', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const result = await fileExists('/path/[brackets]/file (1).ts')
    expect(result).toBe(true)
  })
})

// ============================================================================
// checkNodeVersion
// ============================================================================

describe('checkNodeVersion', () => {
  test('pushes ok for Node version >= 20', async () => {
    const originalVersion = process.version
    const major = Number.parseInt(originalVersion.slice(1).split('.')[0] ?? '0', 10)

    const results = makeDoctorResult()
    await checkNodeVersion(results)

    if (major >= 20) {
      expect(results.checks).toHaveLength(1)
      expect(results.checks[0]!.status).toBe('ok')
      expect(results.checks[0]!.message).toContain('Node.js version:')
    }
  })

  test('includes Node version in message', async () => {
    const results = makeDoctorResult()
    await checkNodeVersion(results)
    expect(results.checks[0]!.message).toContain(process.version)
  })

  test('pushes error for Node version < 20', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v18.17.0',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks).toHaveLength(1)
      expect(results.checks[0]!.status).toBe('error')
      expect(results.checks[0]!.message).toContain('requires >= 20.0.0')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('includes upgrade details for old Node version', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v16.0.0',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.details).toContain('upgrade')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('no details for current Node version >= 20', async () => {
    const major = Number.parseInt(process.version.slice(1).split('.')[0] ?? '0', 10)
    if (major >= 20) {
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.details).toBeUndefined()
    }
  })

  test('pushes ok for exactly Node v20.0.0', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v20.0.0',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.status).toBe('ok')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('pushes error for Node v19.9.9', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v19.9.9',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.status).toBe('error')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('pushes ok for Node v22.5.3', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v22.5.3',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.status).toBe('ok')
      expect(results.checks[0]!.message).toContain('v22.5.3')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('pushes error for very old Node v10.0.0', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v10.0.0',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.status).toBe('error')
      expect(results.checks[0]!.message).toContain('v10.0.0')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('pushes ok for Node v99.0.0', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v99.0.0',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.status).toBe('ok')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('error message includes version number', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v14.0.0',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.message).toContain('v14.0.0')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('upgrade details include version 20 reference', async () => {
    const originalVersion = process.version
    try {
      Object.defineProperty(process, 'version', {
        value: 'v12.0.0',
        configurable: true,
      })
      const results = makeDoctorResult()
      await checkNodeVersion(results)
      expect(results.checks[0]!.details).toContain('20')
    } finally {
      Object.defineProperty(process, 'version', {
        value: originalVersion,
        configurable: true,
      })
    }
  })

  test('pushes exactly one check', async () => {
    const results = makeDoctorResult()
    await checkNodeVersion(results)
    expect(results.checks).toHaveLength(1)
  })
})

// ============================================================================
// checkMemory
// ============================================================================

describe('checkMemory', () => {
  test('pushes ok when memory >= 512MB', async () => {
    vi.mocked(os.totalmem).mockReturnValue(8 * 1024 * 1024 * 1024) // 8GB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('pushes warning when memory < 512MB', async () => {
    vi.mocked(os.totalmem).mockReturnValue(256 * 1024 * 1024) // 256MB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
  })

  test('message includes memory in GB', async () => {
    vi.mocked(os.totalmem).mockReturnValue(16 * 1024 * 1024 * 1024) // 16GB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.message).toContain('GB')
    expect(results.checks[0]!.message).toContain('16')
  })

  test('low memory message includes "(low)" label', async () => {
    vi.mocked(os.totalmem).mockReturnValue(128 * 1024 * 1024) // 128MB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.message).toContain('(low)')
  })

  test('low memory includes details about more memory', async () => {
    vi.mocked(os.totalmem).mockReturnValue(100 * 1024 * 1024) // 100MB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.details).toContain('memory')
  })

  test('exactly 512MB is ok', async () => {
    vi.mocked(os.totalmem).mockReturnValue(512 * 1024 * 1024) // exactly 512MB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('rounds memory GB to one decimal place', async () => {
    vi.mocked(os.totalmem).mockReturnValue(8.5 * 1024 * 1024 * 1024) // 8.5GB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.message).toContain('8.5')
  })

  test('just above 512MB threshold is ok', async () => {
    vi.mocked(os.totalmem).mockReturnValue(513 * 1024 * 1024) // 513MB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('just below 512MB threshold is warning', async () => {
    vi.mocked(os.totalmem).mockReturnValue(511 * 1024 * 1024) // 511MB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.status).toBe('warning')
  })

  test('message includes "Memory available:" prefix', async () => {
    vi.mocked(os.totalmem).mockReturnValue(8 * 1024 * 1024 * 1024)
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.message).toContain('Memory available:')
  })

  test('zero memory gives warning', async () => {
    vi.mocked(os.totalmem).mockReturnValue(0)
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('(low)')
  })

  test('very large memory gives ok', async () => {
    vi.mocked(os.totalmem).mockReturnValue(128 * 1024 * 1024 * 1024) // 128GB
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('128')
  })

  test('pushes exactly one check', async () => {
    vi.mocked(os.totalmem).mockReturnValue(8 * 1024 * 1024 * 1024)
    const results = makeDoctorResult()
    await checkMemory(results)
    expect(results.checks).toHaveLength(1)
  })
})

// ============================================================================
// checkConfigExists
// ============================================================================

describe('checkConfigExists', () => {
  test('pushes ok when config is found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    const results = makeDoctorResult()
    await checkConfigExists(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('Config file found')
  })

  test('pushes warning when config is not found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const results = makeDoctorResult()
    await checkConfigExists(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('No config file found')
  })

  test('message shows relative path when config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    const results = makeDoctorResult()
    await checkConfigExists(results, '/project')
    expect(results.checks[0]!.message).toContain('.codeforgerc.json')
  })

  test('details show expected file names when not found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const results = makeDoctorResult()
    await checkConfigExists(results, cwd)
    expect(results.checks[0]!.details).toContain('.codeforgerc')
  })

  test('uses basename when config path equals cwd', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project')
    const results = makeDoctorResult()
    await checkConfigExists(results, '/project')
    expect(results.checks[0]!.message).toContain('project')
  })

  test('shows relative path for nested config', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/config/.codeforgerc.json')
    const results = makeDoctorResult()
    await checkConfigExists(results, '/project')
    expect(results.checks[0]!.message).toContain('config')
  })

  test('no details when config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    const results = makeDoctorResult()
    await checkConfigExists(results, cwd)
    expect(results.checks[0]!.details).toBeUndefined()
  })

  test('discoverConfig is called with cwd', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/myproj/.codeforgerc.json')
    await checkConfigExists(makeDoctorResult(), '/myproj')
    expect(discoverConfig).toHaveBeenCalledWith({ cwd: '/myproj' })
  })

  test('message starts with "Config file found" when found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    const results = makeDoctorResult()
    await checkConfigExists(results, cwd)
    expect(results.checks[0]!.message).toMatch(/^Config file found/)
  })

  test('message starts with "No config file found" when not found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const results = makeDoctorResult()
    await checkConfigExists(results, cwd)
    expect(results.checks[0]!.message).toMatch(/^No config file found/)
  })

  test('handles deeply nested config path', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/a/b/c/d/.codeforgerc.json')
    const results = makeDoctorResult()
    await checkConfigExists(results, '/project')
    expect(results.checks[0]!.message).toContain('.codeforgerc.json')
  })

  test('pushes exactly one check when config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    const results = makeDoctorResult()
    await checkConfigExists(results, cwd)
    expect(results.checks).toHaveLength(1)
  })
})

// ============================================================================
// checkConfigValid
// ============================================================================

describe('checkConfigValid', () => {
  test('pushes ok for valid config', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toBe('Config is valid')
  })

  test('pushes error for invalid config', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(new Error('Parse error: invalid JSON'))
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.message).toBe('Config is invalid')
  })

  test('skips when no config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('details include error message from parse failure', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(new Error('unexpected token'))
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks[0]!.details).toContain('unexpected token')
  })

  test('handles non-Error thrown values', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue('string error')
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.details).toContain('string error')
  })

  test('handles numeric thrown value', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(42)
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.details).toContain('42')
  })

  test('error details for Error instance use message property', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(new Error('specific parse failure'))
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks[0]!.details).toBe('specific parse failure')
  })

  test('calls parseConfigFile with discovered config path', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    await checkConfigValid(makeDoctorResult(), cwd)
    expect(parseConfigFile).toHaveBeenCalledWith('/project/.codeforgerc.json')
  })

  test('ok check has no details', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks[0]!.details).toBeUndefined()
  })

  test('handles null thrown value', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(null)
    const results = makeDoctorResult()
    await checkConfigValid(results, cwd)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.details).toBe('null')
  })
})

// ============================================================================
// checkRulesValid
// ============================================================================

describe('checkRulesValid', () => {
  test('pushes ok when all configured rules are known', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'rule-a': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a', 'rule-b'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toBe('All rules are valid')
  })

  test('pushes error when unknown rules found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'unknown-rule': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a', 'rule-b'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.message).toContain('unknown-rule')
  })

  test('skips when no config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('details show valid rules list on unknown rule error', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'bad-rule': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a', 'rule-b'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.details).toContain('rule-a')
  })

  test('skips on parse error (already reported)', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(new Error('parse fail'))
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('pushes ok when config has no rules property', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('handles multiple unknown rules', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({
      rules: { 'bad-a': 'error', 'bad-b': 'warn', 'rule-a': 'off' },
    })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a', 'rule-b'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.message).toContain('bad-a')
    expect(results.checks[0]!.message).toContain('bad-b')
  })

  test('handles empty rules object', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: {} })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('details on error show valid rules with ellipsis', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'bad-rule': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['r1', 'r2', 'r3', 'r4', 'r5', 'r6'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.details).toContain('r1')
    expect(results.checks[0]!.details).toContain('...')
  })

  test('ok message when all configured rules match known rules', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'rule-a': 'error', 'rule-b': 'warn' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a', 'rule-b'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toBe('All rules are valid')
  })

  test('ok check has no details', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'rule-a': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.details).toBeUndefined()
  })

  test('error details include all valid rules up to max shown', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'bad-rule': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['r1', 'r2'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.details).toContain('r1')
    expect(results.checks[0]!.details).toContain('r2')
  })

  test('single unknown rule message format', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'unknown-rule': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.message).toBe('Unknown rules found: unknown-rule')
  })

  test('handles all rules being unknown', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { x: 'error', y: 'warn', z: 'off' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.message).toContain('x')
    expect(results.checks[0]!.message).toContain('y')
    expect(results.checks[0]!.message).toContain('z')
  })

  test('pushes exactly one check', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ rules: { 'rule-a': 'error' } })
    vi.mocked(getRuleIds).mockReturnValue(['rule-a'])
    const results = makeDoctorResult()
    await checkRulesValid(results, cwd)
    expect(results.checks).toHaveLength(1)
  })
})

// ============================================================================
// checkFilePatterns
// ============================================================================

describe('checkFilePatterns', () => {
  test('pushes ok for valid file patterns', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts', '**/*.tsx'] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('pushes error for invalid file patterns', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['', '**/*.ts'] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.message).toContain('Invalid file patterns')
  })

  test('pushes warning when no file patterns configured', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: [] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('No file patterns configured')
  })

  test('pushes warning when files is undefined', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({})
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
  })

  test('skips when no config found', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('skips on parse error', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(new Error('parse fail'))
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('no patterns warning has details about adding patterns', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: [] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks[0]!.details).toContain('Add file patterns')
  })

  test('pushes error for whitespace-only pattern', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['   ', '**/*.ts'] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('error')
  })

  test('pushes error for multiple invalid patterns', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['', '  '] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks[0]!.status).toBe('error')
    expect(results.checks[0]!.message).toContain('Invalid file patterns')
  })

  test('valid single pattern', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.js'] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('valid globs')
  })

  test('invalid pattern error details mention non-empty strings', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: [''] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks[0]!.details).toContain('non-empty strings')
  })

  test('handles patterns with special glob characters', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({
      files: ['**/*.ts', '!**/test/**', 'src/**/{a,b}.ts'],
    })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('single empty string pattern triggers error', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: [''] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('error')
  })

  test('pushes exactly one check for valid patterns', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    const results = makeDoctorResult()
    await checkFilePatterns(results, cwd)
    expect(results.checks).toHaveLength(1)
  })
})

// ============================================================================
// checkFileCount
// ============================================================================

describe('checkFileCount', () => {
  test('pushes ok for normal file count', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(discoverFiles).mockResolvedValue(['/a.ts', '/b.ts'])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('2')
  })

  test('pushes warning for large codebase (exceeds threshold)', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    const manyFiles = Array.from({ length: 1001 }, (_, i) => `/file${i}.ts`)
    vi.mocked(discoverFiles).mockResolvedValue(manyFiles)
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('Large codebase')
    expect(results.checks[0]!.message).toContain('1001')
  })

  test('pushes warning on discoverFiles error', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(discoverFiles).mockRejectedValue(new Error('disk error'))
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('Could not count files')
  })

  test('uses config patterns when available', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({
      files: ['src/**/*.ts'],
      ignore: ['**/vendor/**'],
    })
    vi.mocked(discoverFiles).mockResolvedValue(['src/a.ts'])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['src/**/*.ts'],
      }),
    )
  })

  test('uses default patterns when no config', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      }),
    )
  })

  test('uses defaults when config exists but parse fails', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockRejectedValue(new Error('bad config'))
    vi.mocked(discoverFiles).mockResolvedValue(['/a.ts'])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('large codebase details mention .codeforgeignore', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    const manyFiles = Array.from({ length: 1001 }, (_, i) => `/file${i}.ts`)
    vi.mocked(discoverFiles).mockResolvedValue(manyFiles)
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks[0]!.details).toContain('codeforgeignore')
  })

  test('handles non-Error thrown in catch block', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(discoverFiles).mockRejectedValue('string error')
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.details).toContain('Unknown error')
  })

  test('uses default ignore patterns when no config', async () => {
    vi.mocked(discoverConfig).mockResolvedValue(null)
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: expect.arrayContaining(['**/node_modules/**']),
      }),
    )
  })

  test('ignore patterns without glob prefix get **/ prefix', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({
      files: ['**/*.ts'],
      ignore: ['vendor/**'],
    })
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: expect.arrayContaining(['**/vendor/**']),
      }),
    )
  })

  test('message includes file count number', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(discoverFiles).mockResolvedValue(['/a.ts', '/b.ts', '/c.ts'])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks[0]!.message).toContain('3')
  })

  test('zero files is ok', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('0')
  })

  test('exactly at threshold is ok', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    const filesAtThreshold = Array.from({ length: 1000 }, (_, i) => `/file${i}.ts`)
    vi.mocked(discoverFiles).mockResolvedValue(filesAtThreshold)
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(results.checks[0]!.status).toBe('ok')
  })

  test('uses config ignore patterns when available', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({
      files: ['**/*.ts'],
      ignore: ['dist/**'],
    })
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: expect.arrayContaining(['**/dist/**']),
      }),
    )
  })

  test('discoverFiles called with cwd', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({ files: ['**/*.ts'] })
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkFileCount(results, '/my/project')
    expect(discoverFiles).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/my/project' }))
  })

  test('ignore patterns with existing ** prefix are not double-prefixed', async () => {
    vi.mocked(discoverConfig).mockResolvedValue('/project/.codeforgerc.json')
    vi.mocked(parseConfigFile).mockResolvedValue({
      files: ['**/*.ts'],
      ignore: ['**/dist/**', '**/build/**'],
    })
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkFileCount(results, cwd)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: expect.arrayContaining(['**/dist/**', '**/build/**']),
      }),
    )
  })
})

// ============================================================================
// checkTsConfig
// ============================================================================

describe('checkTsConfig', () => {
  test('pushes ok when tsconfig.json exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('tsconfig.json exists')
  })

  test('pushes warning when tsconfig missing but TS files detected', async () => {
    // First call for fileExists (tsconfig check) → not found
    vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue(['/project/src/app.ts'])
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('tsconfig.json not found')
    expect(results.checks[0]!.message).toContain('TypeScript files detected')
  })

  test('adds nothing when tsconfig missing and no TS files', async () => {
    vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('ignores discoverFiles errors gracefully', async () => {
    vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockRejectedValue(new Error('permission denied'))
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('warning includes suggestion to add tsconfig', async () => {
    vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue(['/src/index.ts'])
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks[0]!.details).toContain('tsconfig.json')
  })

  test('does not push check when tsconfig path is a directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as never)
    vi.mocked(discoverFiles).mockResolvedValue([])
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('detects multiple TypeScript files without tsconfig', async () => {
    vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue(['/src/a.ts', '/src/b.ts', '/src/c.ts'])
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
  })

  test('checks tsconfig.json in the provided cwd', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkTsConfig(results, '/my/project')
    expect(fs.stat).toHaveBeenCalledWith('/my/project/tsconfig.json')
  })

  test('ok message is exactly "tsconfig.json exists"', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks[0]!.message).toBe('tsconfig.json exists')
  })

  test('warning details contain suggestion text', async () => {
    vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue(['/src/app.ts'])
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks[0]!.details).toContain('Consider adding')
  })

  test('discoverFiles called with TypeScript patterns', async () => {
    vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(discoverFiles).mockResolvedValue(['/src/app.ts'])
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['**/*.ts', '**/*.tsx'],
      }),
    )
  })

  test('pushes exactly one check when tsconfig exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkTsConfig(results, cwd)
    expect(results.checks).toHaveLength(1)
  })
})

// ============================================================================
// checkPackageJson
// ============================================================================

describe('checkPackageJson', () => {
  test('pushes ok when package.json exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('package.json exists')
  })

  test('pushes warning when package.json not found', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('package.json not found')
  })

  test('warning details suggest non-Node project', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks[0]!.details).toContain('Node.js')
  })

  test('pushes warning when package.json is a directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as never)
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
  })

  test('checks package.json in the provided cwd', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    await checkPackageJson(makeDoctorResult(), '/my/app')
    expect(fs.stat).toHaveBeenCalledWith('/my/app/package.json')
  })

  test('stat error results in warning', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('EACCES'))
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
  })

  test('ok message is exactly "package.json exists"', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks[0]!.message).toBe('package.json exists')
  })

  test('warning message contains "package.json not found"', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks[0]!.message).toBe('package.json not found')
  })

  test('pushes exactly one check when package.json exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks).toHaveLength(1)
  })

  test('no details when package.json exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    const results = makeDoctorResult()
    await checkPackageJson(results, cwd)
    expect(results.checks[0]!.details).toBeUndefined()
  })
})

// ============================================================================
// checkTypeScript
// ============================================================================

describe('checkTypeScript', () => {
  test('pushes ok with version when TypeScript is installed', async () => {
    // fileExists for tsconfig.json → true
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    // readFile for typescript package.json
    vi.mocked(fs.readFile).mockResolvedValue('{"version":"5.3.2"}')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('5.3.2')
    expect(results.checks[0]!.message).toContain('TypeScript version')
  })

  test('pushes warning when tsconfig found but TypeScript not installed', async () => {
    // fileExists for tsconfig.json → true
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    // readFile fails
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('TypeScript not installed')
  })

  test('adds nothing when no tsconfig.json', async () => {
    // fileExists for tsconfig.json → false
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as never)
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('warning details suggest npm install typescript', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks[0]!.details).toContain('npm install typescript')
  })

  test('handles missing version field in package.json', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{}')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('unknown')
  })

  test('handles stat error gracefully for tsconfig check', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    // stat throws → caught by fileExists → returns false → no tsconfig → no output
    expect(results.checks).toHaveLength(0)
  })

  test('handles malformed JSON in typescript package.json', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('not valid json {{{')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('warning')
    expect(results.checks[0]!.message).toContain('TypeScript not installed')
  })

  test('reads typescript package.json from node_modules', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{"version":"4.9.5"}')
    await checkTypeScript(makeDoctorResult(), cwd)
    expect(fs.readFile).toHaveBeenCalledWith(
      '/project/node_modules/typescript/package.json',
      'utf8',
    )
  })

  test('no output when tsconfig is a directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as never)
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(0)
  })

  test('version string is included with v prefix in message', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{"version":"5.4.2"}')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks[0]!.message).toContain('v5.4.2')
  })

  test('handles null version in package.json', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{"version":null}')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('unknown')
  })

  test('pushes exactly one check when tsconfig and typescript exist', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{"version":"5.0.0"}')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(1)
  })

  test('warning details contain npm install suggestion', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks[0]!.details).toContain('npm install typescript')
    expect(results.checks[0]!.details).toContain('Run')
  })

  test('reads from node_modules typescript package.json path', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{"version":"5.1.0"}')
    await checkTypeScript(makeDoctorResult(), '/custom/project')
    expect(fs.readFile).toHaveBeenCalledWith(
      '/custom/project/node_modules/typescript/package.json',
      'utf8',
    )
  })

  test('handles undefined version field as unknown', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{"name":"typescript"}')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks).toHaveLength(1)
    expect(results.checks[0]!.status).toBe('ok')
    expect(results.checks[0]!.message).toContain('unknown')
  })

  test('no details when typescript version is found', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as never)
    vi.mocked(fs.readFile).mockResolvedValue('{"version":"5.2.0"}')
    const results = makeDoctorResult()
    await checkTypeScript(results, cwd)
    expect(results.checks[0]!.details).toBeUndefined()
  })
})
