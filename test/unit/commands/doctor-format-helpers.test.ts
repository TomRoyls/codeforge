import { describe, expect, test } from 'vitest'
import chalk from 'chalk'

import {
  colorMessage,
  displayResults,
  getStatusSymbol,
} from '../../../src/commands/doctor-format-helpers.js'
import type { DoctorResult } from '../../../src/commands/doctor-helpers.js'

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
    expect(result).toBe(chalk.red(''))
  })

  test('handles empty string message for warning', () => {
    const result = colorMessage('warning', '')
    expect(result).toBe(chalk.yellow(''))
  })

  test('handles whitespace-only message for ok', () => {
    const result = colorMessage('ok', '   ')
    expect(result).toBe('   ')
  })

  test('handles whitespace-only message for error', () => {
    const result = colorMessage('error', '   ')
    expect(result).toContain('   ')
  })

  test('handles whitespace-only message for warning', () => {
    const result = colorMessage('warning', '   ')
    expect(result).toContain('   ')
  })

  test('handles message with newlines', () => {
    const result = colorMessage('ok', 'line1\nline2\nline3')
    expect(result).toBe('line1\nline2\nline3')
  })

  test('handles message with newlines for error', () => {
    const result = colorMessage('error', 'line1\nline2')
    expect(result).toContain('line1\nline2')
  })

  test('handles message with special characters', () => {
    const result = colorMessage('ok', 'path/to/file.ts <template> "quotes"')
    expect(result).toBe('path/to/file.ts <template> "quotes"')
  })

  test('handles message with unicode characters', () => {
    const result = colorMessage('ok', '日本語 ñ é ü')
    expect(result).toBe('日本語 ñ é ü')
  })

  test('handles very long message', () => {
    const longMessage = 'a'.repeat(500)
    const result = colorMessage('ok', longMessage)
    expect(result).toBe(longMessage)
  })

  test('handles message with emoji for ok', () => {
    const result = colorMessage('ok', '🎉 Success!')
    expect(result).toBe('🎉 Success!')
  })

  test('handles message with emoji for error', () => {
    const result = colorMessage('error', '🔥 Failure!')
    expect(result).toContain('🔥 Failure!')
  })

  test('handles message with emoji for warning', () => {
    const result = colorMessage('warning', '⚠️ Caution!')
    expect(result).toContain('⚠️ Caution!')
  })

  test('ok status returns plain string unmodified', () => {
    const msg = 'unchanged'
    const result = colorMessage('ok', msg)
    expect(result).toBe(msg)
  })

  test('error status wraps message in red', () => {
    const result = colorMessage('error', 'wrapped')
    expect(result).toBe(chalk.red('wrapped'))
  })

  test('warning status wraps message in yellow', () => {
    const result = colorMessage('warning', 'wrapped')
    expect(result).toBe(chalk.yellow('wrapped'))
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

  test('error symbol is exactly chalk.red of ✗', () => {
    const result = getStatusSymbol('error')
    expect(result).toBe(chalk.red('✗'))
  })

  test('ok symbol is exactly chalk.green of ✓', () => {
    const result = getStatusSymbol('ok')
    expect(result).toBe(chalk.green('✓'))
  })

  test('warning symbol is exactly chalk.yellow of ⚠', () => {
    const result = getStatusSymbol('warning')
    expect(result).toBe(chalk.yellow('⚠'))
  })

  test('all three status symbols are different', () => {
    const error = getStatusSymbol('error')
    const ok = getStatusSymbol('ok')
    const warning = getStatusSymbol('warning')
    expect(error).not.toBe(ok)
    expect(error).not.toBe(warning)
    expect(ok).not.toBe(warning)
  })

  test('each symbol is a non-empty string', () => {
    expect(getStatusSymbol('error').length).toBeGreaterThan(0)
    expect(getStatusSymbol('ok').length).toBeGreaterThan(0)
    expect(getStatusSymbol('warning').length).toBeGreaterThan(0)
  })

  test('error symbol contains the cross mark character', () => {
    expect(getStatusSymbol('error')).toContain('✗')
  })

  test('ok symbol contains the check mark character', () => {
    expect(getStatusSymbol('ok')).toContain('✓')
  })

  test('warning symbol contains the warning sign character', () => {
    expect(getStatusSymbol('warning')).toContain('⚠')
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
    expect(lines).toHaveLength(3)
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
    expect(lines).toHaveLength(3)
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

  test('error summary uses chalk.red', () => {
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

  test('success summary uses chalk.green', () => {
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

  test('handles empty checks array', () => {
    const results: DoctorResult = {
      checks: [],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(2)
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
    expect(lines).toHaveLength(5)
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

  test('returns string array', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Test', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(Array.isArray(lines)).toBe(true)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('shows verbose details for multiple checks', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Check A', status: 'ok', details: 'Detail A' },
        { message: 'Check B', status: 'warning', details: 'Detail B' },
      ],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, true)
    expect(lines[0]).toContain('Check A')
    expect(lines[1]).toContain('Detail A')
    expect(lines[2]).toContain('Check B')
    expect(lines[3]).toContain('Detail B')
  })

  test('warning summary uses chalk.yellow for singular', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.yellow('All checks passed! (1 warning)'))
  })

  test('warning summary uses chalk.yellow for plural', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 5,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.yellow('All checks passed! (5 warnings)'))
  })

  test('error summary with multiple errors and zero warnings', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Fail', status: 'error' }],
      errors: 7,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.red('Found 7 error(s), 0 warning(s)'))
  })

  test('error summary with errors and warnings both non-zero', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Fail', status: 'error' }],
      errors: 2,
      passed: false,
      warnings: 4,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('2 error')
    expect(summary).toContain('4 warning')
  })

  test('check line format is symbol space message', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Test message', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✓')
    expect(lines[0]).toContain('Test message')
  })

  test('check line contains space between symbol and message', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Msg', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const symbol = getStatusSymbol('ok')
    expect(lines[0]).toBe(`${symbol} Msg`)
  })

  test('verbose with check that has undefined details', () => {
    const results: DoctorResult = {
      checks: [{ message: 'No details', status: 'ok', details: undefined }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // Should have: check line, blank line, summary = 3 lines
    expect(lines).toHaveLength(3)
  })

  test('verbose with check that has empty string details', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Empty details', status: 'ok', details: '' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // Empty string is falsy, so details should not be shown
    expect(lines).toHaveLength(3)
  })

  test('details line is indented with two spaces', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'ok', details: 'info' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toBe(chalk.gray('  info'))
  })

  test('handles many checks correctly', () => {
    const checks = Array.from({ length: 20 }, (_, i) => ({
      message: `Check ${i + 1}`,
      status: 'ok' as const,
    }))
    const results: DoctorResult = {
      checks,
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    // 20 check lines + 1 blank + 1 summary = 22
    expect(lines).toHaveLength(22)
    expect(lines[0]).toContain('Check 1')
    expect(lines[19]).toContain('Check 20')
  })

  test('all checks ok produces all check marks', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'ok' },
        { message: 'B', status: 'ok' },
        { message: 'C', status: 'ok' },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✓')
    expect(lines[1]).toContain('✓')
    expect(lines[2]).toContain('✓')
  })

  test('all checks error produces all cross marks', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'error' },
        { message: 'B', status: 'error' },
      ],
      errors: 2,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✗')
    expect(lines[1]).toContain('✗')
  })

  test('all checks warning produces all warning marks', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'warning' },
        { message: 'B', status: 'warning' },
      ],
      errors: 0,
      passed: true,
      warnings: 2,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('⚠')
    expect(lines[1]).toContain('⚠')
  })

  test('mixed verbose: some checks with details, some without', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Has detail', status: 'ok', details: 'extra' },
        { message: 'No detail', status: 'ok' },
        { message: 'Another detail', status: 'error', details: 'more' },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // Has detail line, no detail line, another detail line
    expect(lines[0]).toContain('Has detail')
    expect(lines[1]).toContain('extra')
    expect(lines[2]).toContain('No detail')
    expect(lines[3]).toContain('Another detail')
    expect(lines[4]).toContain('more')
  })

  test('non-verbose ignores all details', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'ok', details: 'detail-a' },
        { message: 'B', status: 'warning', details: 'detail-b' },
      ],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    // 2 check lines + 1 blank + 1 summary = 4
    expect(lines).toHaveLength(4)
    expect(lines[0]).toContain('A')
    expect(lines[1]).toContain('B')
  })

  test('check ordering is preserved', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'First', status: 'ok' },
        { message: 'Second', status: 'warning' },
        { message: 'Third', status: 'error' },
      ],
      errors: 1,
      passed: false,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('First')
    expect(lines[1]).toContain('Second')
    expect(lines[2]).toContain('Third')
  })

  test('error summary text format "Found X error(s), Y warning(s)"', () => {
    const results: DoctorResult = {
      checks: [{ message: 'X', status: 'error' }],
      errors: 5,
      passed: false,
      warnings: 3,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('Found')
    expect(summary).toContain('error(s)')
    expect(summary).toContain('warning(s)')
  })

  test('success summary does not contain error or warning text', () => {
    const results: DoctorResult = {
      checks: [{ message: 'OK', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).not.toContain('error')
    expect(summary).not.toContain('warning')
  })

  test('blank line appears at correct index for single check', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    // lines: [check_line, '', summary]
    expect(lines[0]).toContain('Check')
    expect(lines[1]).toBe('')
    expect(lines[2]).toContain('All checks passed')
  })

  test('blank line appears at correct index for multiple checks', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'ok' },
        { message: 'B', status: 'ok' },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[2]).toBe('')
    expect(lines[3]).toContain('All checks passed')
  })

  test('blank line appears after detail lines in verbose mode', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'ok', details: 'info' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // lines: [check, detail, '', summary]
    expect(lines[0]).toContain('Check')
    expect(lines[1]).toContain('info')
    expect(lines[2]).toBe('')
    expect(lines[3]).toContain('All checks passed')
  })

  test('warning summary text format for 1 warning', () => {
    const results: DoctorResult = {
      checks: [{ message: 'W', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('All checks passed!')
    expect(summary).toContain('1 warning')
    expect(summary).not.toContain('1 warnings')
  })

  test('warning summary text format for 2 warnings', () => {
    const results: DoctorResult = {
      checks: [{ message: 'W', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 2,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('2 warnings')
  })

  test('displayResults returns correct line count for empty checks', () => {
    const results: DoctorResult = {
      checks: [],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(2)
  })

  test('displayResults verbose with empty checks still shows summary', () => {
    const results: DoctorResult = {
      checks: [],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[lines.length - 1]).toContain('All checks passed')
  })

  test('error summary is always the last line when errors > 0', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'error' },
        { message: 'B', status: 'error', details: 'detail' },
      ],
      errors: 2,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    const lastLine = lines[lines.length - 1]
    expect(lastLine).toContain('error')
  })

  test('passed true with errors > 0 still shows error summary', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Fail', status: 'error' }],
      errors: 1,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('error')
  })

  test('passed false with no errors shows success summary', () => {
    const results: DoctorResult = {
      checks: [{ message: 'OK', status: 'ok' }],
      errors: 0,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('All checks passed')
  })

  test('details for error check in verbose mode', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Bad config',
          status: 'error',
          details: 'config.json is malformed',
        },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[0]).toContain('Bad config')
    expect(lines[1]).toContain('config.json is malformed')
  })

  test('details for warning check in verbose mode', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Slow perf',
          status: 'warning',
          details: 'Consider increasing memory',
        },
      ],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, true)
    expect(lines[0]).toContain('Slow perf')
    expect(lines[1]).toContain('Consider increasing memory')
  })

  test('details for ok check in verbose mode', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Node version',
          status: 'ok',
          details: 'v20.0.0',
        },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[0]).toContain('Node version')
    expect(lines[1]).toContain('v20.0.0')
  })

  test('error check line uses red cross symbol', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Err', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✗')
  })

  test('warning check line uses yellow warning symbol', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('⚠')
  })

  test('ok check line uses green check symbol', () => {
    const results: DoctorResult = {
      checks: [{ message: 'OK', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('✓')
  })

  test('error message is colored red in check line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Failure msg', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const expectedMsg = colorMessage('error', 'Failure msg')
    expect(lines[0]).toContain('Failure msg')
    expect(lines[0]).toContain(expectedMsg.slice(-20))
  })

  test('warning message is colored yellow in check line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Caution msg', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('Caution msg')
  })

  test('ok message is plain in check line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Plain msg', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('Plain msg')
  })

  test('handles single error with single warning correctly', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Err', status: 'error' },
        { message: 'Warn', status: 'warning' },
      ],
      errors: 1,
      passed: false,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('1 error')
    expect(summary).toContain('1 warning')
  })

  test('handles large number of errors in summary', () => {
    const results: DoctorResult = {
      checks: [{ message: 'X', status: 'error' }],
      errors: 100,
      passed: false,
      warnings: 50,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('100')
    expect(summary).toContain('50')
  })

  test('verbose mode with multiple checks each having details', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'ok', details: 'DA' },
        { message: 'B', status: 'warning', details: 'DB' },
        { message: 'C', status: 'error', details: 'DC' },
      ],
      errors: 1,
      passed: false,
      warnings: 1,
    }
    const lines = displayResults(results, true)
    // A, DA, B, DB, C, DC, '', summary = 8 lines
    expect(lines).toHaveLength(8)
    expect(lines[0]).toContain('A')
    expect(lines[1]).toContain('DA')
    expect(lines[2]).toContain('B')
    expect(lines[3]).toContain('DB')
    expect(lines[4]).toContain('C')
    expect(lines[5]).toContain('DC')
  })

  test('verbose mode line count matches for 3 checks all with details', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'X', status: 'ok', details: 'DX' },
        { message: 'Y', status: 'ok', details: 'DY' },
        { message: 'Z', status: 'ok', details: 'DZ' },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // 3 check lines + 3 detail lines + 1 blank + 1 summary = 8
    expect(lines).toHaveLength(8)
  })

  test('non-verbose line count matches for 3 checks', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'X', status: 'ok' },
        { message: 'Y', status: 'ok' },
        { message: 'Z', status: 'ok' },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    // 3 check lines + 1 blank + 1 summary = 5
    expect(lines).toHaveLength(5)
  })

  test('ok status with details in verbose mode includes detail line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Config valid', status: 'ok', details: 'Using default config' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines).toHaveLength(4)
    expect(lines[1]).toContain('Using default config')
  })

  test('ok status without details in verbose mode skips detail line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Config valid', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines).toHaveLength(3)
  })

  test('summary shows warning count with plural when warnings > 1', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Check A', status: 'warning' },
        { message: 'Check B', status: 'warning' },
        { message: 'Check C', status: 'warning' },
      ],
      errors: 0,
      passed: false,
      warnings: 3,
    }
    const lines = displayResults(results, false)
    const summaryLine = lines[lines.length - 1]
    expect(summaryLine).toContain('3 warning')
    expect(summaryLine).toContain('warnings')
  })

  test('summary shows singular warning when warnings === 1', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check A', status: 'warning' }],
      errors: 0,
      passed: false,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const summaryLine = lines[lines.length - 1]
    expect(summaryLine).toContain('1 warning')
    expect(summaryLine).not.toContain('warnings')
  })

  test('mix of statuses with verbose produces correct line count', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'ok', details: 'DA' },
        { message: 'B', status: 'error' },
        { message: 'C', status: 'warning', details: 'DC' },
      ],
      errors: 1,
      passed: false,
      warnings: 1,
    }
    const lines = displayResults(results, true)
    expect(lines).toHaveLength(7)
  })
})

// ============================================================================
// colorMessage edge cases
// ============================================================================

describe('colorMessage edge cases', () => {
  test('handles tab characters in message for ok', () => {
    const result = colorMessage('ok', 'col1\tcol2\tcol3')
    expect(result).toBe('col1\tcol2\tcol3')
  })

  test('handles tab characters in message for error', () => {
    const result = colorMessage('error', 'col1\tcol2')
    expect(result).toContain('col1\tcol2')
  })

  test('handles tab characters in message for warning', () => {
    const result = colorMessage('warning', 'col1\tcol2')
    expect(result).toContain('col1\tcol2')
  })

  test('handles carriage return in message for ok', () => {
    const result = colorMessage('ok', 'line1\r\nline2')
    expect(result).toBe('line1\r\nline2')
  })

  test('handles carriage return in message for error', () => {
    const result = colorMessage('error', 'line1\r\nline2')
    expect(result).toContain('line1\r\nline2')
  })

  test('handles message with mixed special characters for ok', () => {
    const msg = 'path/to/file.ts:10:5 - error TS1234: "string" & <generic>'
    const result = colorMessage('ok', msg)
    expect(result).toBe(msg)
  })

  test('handles message with backslashes for ok', () => {
    const msg = 'C:\\Users\\test\\file.ts'
    const result = colorMessage('ok', msg)
    expect(result).toBe(msg)
  })

  test('handles message with backslashes for error', () => {
    const msg = 'C:\\Users\\test\\file.ts'
    const result = colorMessage('error', msg)
    expect(result).toContain(msg)
  })

  test('handles single character message for ok', () => {
    const result = colorMessage('ok', 'X')
    expect(result).toBe('X')
  })

  test('handles single character message for error', () => {
    const result = colorMessage('error', 'X')
    expect(result).toBe(chalk.red('X'))
  })

  test('handles single character message for warning', () => {
    const result = colorMessage('warning', 'X')
    expect(result).toBe(chalk.yellow('X'))
  })

  test('preserves message content for error with ANSI-like sequences', () => {
    const msg = '\x1b[31mraw\x1b[0m'
    const result = colorMessage('error', msg)
    expect(result).toContain(msg)
  })

  test('preserves message content for ok with ANSI-like sequences', () => {
    const msg = '\x1b[32mraw\x1b[0m'
    const result = colorMessage('ok', msg)
    expect(result).toBe(msg)
  })

  test('handles message with null-like text for ok', () => {
    const result = colorMessage('ok', '\\0\\0\\0')
    expect(result).toBe('\\0\\0\\0')
  })

  test('handles very long message for error', () => {
    const longMsg = 'e'.repeat(1000)
    const result = colorMessage('error', longMsg)
    expect(result).toContain(longMsg)
  })

  test('handles very long message for warning', () => {
    const longMsg = 'w'.repeat(1000)
    const result = colorMessage('warning', longMsg)
    expect(result).toContain(longMsg)
  })
})

// ============================================================================
// getStatusSymbol consistency
// ============================================================================

describe('getStatusSymbol consistency', () => {
  test('returns same value on repeated calls for error', () => {
    const first = getStatusSymbol('error')
    const second = getStatusSymbol('error')
    expect(first).toBe(second)
  })

  test('returns same value on repeated calls for ok', () => {
    const first = getStatusSymbol('ok')
    const second = getStatusSymbol('ok')
    expect(first).toBe(second)
  })

  test('returns same value on repeated calls for warning', () => {
    const first = getStatusSymbol('warning')
    const second = getStatusSymbol('warning')
    expect(first).toBe(second)
  })
})

// ============================================================================
// displayResults boundary and edge cases
// ============================================================================

describe('displayResults boundary conditions', () => {
  test('error summary with exactly 1 error and 0 warnings exact match', () => {
    const results: DoctorResult = {
      checks: [{ message: 'E', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.red('Found 1 error(s), 0 warning(s)'))
  })

  test('error summary with 0 warnings does not pluralize warning', () => {
    const results: DoctorResult = {
      checks: [{ message: 'E', status: 'error' }],
      errors: 2,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('0 warning(s)')
  })

  test('warning summary with exactly 2 warnings uses plural form', () => {
    const results: DoctorResult = {
      checks: [{ message: 'W', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 2,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.yellow('All checks passed! (2 warnings)'))
  })

  test('verbose with details containing newlines shows full detail', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Multi',
          status: 'ok',
          details: 'line1\nline2\nline3',
        },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toContain('line1\nline2\nline3')
  })

  test('verbose with details containing special characters preserves them', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Special',
          status: 'ok',
          details: 'path: /foo/bar <tag> "quoted"',
        },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toContain('path: /foo/bar <tag> "quoted"')
  })

  test('verbose with details for error status uses gray color', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Err',
          status: 'error',
          details: 'Stack trace info',
        },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toBe(chalk.gray('  Stack trace info'))
  })

  test('verbose with details for warning status uses gray color', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Warn',
          status: 'warning',
          details: 'Advisory info',
        },
      ],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toBe(chalk.gray('  Advisory info'))
  })

  test('verbose with details containing whitespace-only shows gray line', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'WS',
          status: 'ok',
          details: '   ',
        },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // Whitespace-only details is truthy, so it should appear
    expect(lines[1]).toBe(chalk.gray('     '))
  })

  test('error summary takes priority over warning summary', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'E', status: 'error' },
        { message: 'W', status: 'warning' },
      ],
      errors: 1,
      passed: false,
      warnings: 5,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('Found')
    expect(summary).toContain('error')
    // Should NOT show "All checks passed" when errors > 0
    expect(summary).not.toContain('All checks passed')
  })

  test('displayResults with single ok check verbose false exact output', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Test', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toEqual([`${getStatusSymbol('ok')} Test`, '', chalk.green('All checks passed!')])
  })

  test('displayResults with single error check verbose false exact output', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Fail', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toEqual([
      `${getStatusSymbol('error')} ${colorMessage('error', 'Fail')}`,
      '',
      chalk.red('Found 1 error(s), 0 warning(s)'),
    ])
  })

  test('displayResults with single warning check verbose false exact output', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Caution', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines).toEqual([
      `${getStatusSymbol('warning')} ${colorMessage('warning', 'Caution')}`,
      '',
      chalk.yellow('All checks passed! (1 warning)'),
    ])
  })

  test('handles checks with very long messages', () => {
    const longMsg = 'A very long diagnostic message '.repeat(20).trim()
    const results: DoctorResult = {
      checks: [{ message: longMsg, status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain(longMsg)
  })

  test('handles error check with very long detail in verbose mode', () => {
    const longDetail = 'Detail line '.repeat(50).trim()
    const results: DoctorResult = {
      checks: [
        {
          message: 'Error',
          status: 'error',
          details: longDetail,
        },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toContain(longDetail)
  })

  test('passed field does not affect summary selection', () => {
    // passed=true but errors>0 should still show error summary
    const results: DoctorResult = {
      checks: [{ message: 'X', status: 'error' }],
      errors: 5,
      passed: true,
      warnings: 3,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('5 error')
    expect(summary).toContain('3 warning')
  })

  test('error check message colored red in output line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'ColorTest', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const expected = `${getStatusSymbol('error')} ${colorMessage('error', 'ColorTest')}`
    expect(lines[0]).toBe(expected)
  })

  test('warning check message colored yellow in output line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'ColorTest', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const expected = `${getStatusSymbol('warning')} ${colorMessage('warning', 'ColorTest')}`
    expect(lines[0]).toBe(expected)
  })

  test('ok check message plain in output line', () => {
    const results: DoctorResult = {
      checks: [{ message: 'ColorTest', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const expected = `${getStatusSymbol('ok')} ${colorMessage('ok', 'ColorTest')}`
    expect(lines[0]).toBe(expected)
  })

  test('displayResults with 50 checks produces correct line count', () => {
    const checks = Array.from({ length: 50 }, (_, i) => ({
      message: `Check ${i + 1}`,
      status: 'ok' as const,
    }))
    const results: DoctorResult = {
      checks,
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    // 50 check lines + 1 blank + 1 summary = 52
    expect(lines).toHaveLength(52)
  })

  test('displayResults with 100 checks produces correct line count', () => {
    const checks = Array.from({ length: 100 }, (_, i) => ({
      message: `Check ${i + 1}`,
      status: 'ok' as const,
    }))
    const results: DoctorResult = {
      checks,
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    // 100 check lines + 1 blank + 1 summary = 102
    expect(lines).toHaveLength(102)
  })

  test('verbose with 5 checks each having details correct line count', () => {
    const checks = Array.from({ length: 5 }, (_, i) => ({
      message: `Check ${i + 1}`,
      status: 'ok' as const,
      details: `Detail ${i + 1}`,
    }))
    const results: DoctorResult = {
      checks,
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // 5 check + 5 detail + 1 blank + 1 summary = 12
    expect(lines).toHaveLength(12)
  })

  test('verbose with alternating checks with and without details', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'A', status: 'ok', details: 'DA' },
        { message: 'B', status: 'ok' },
        { message: 'C', status: 'ok', details: 'DC' },
        { message: 'D', status: 'ok' },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    // A, DA, B, C, DC, D, '', summary = 8
    expect(lines).toHaveLength(8)
    expect(lines[0]).toContain('A')
    expect(lines[1]).toContain('DA')
    expect(lines[2]).toContain('B')
    expect(lines[3]).toContain('C')
    expect(lines[4]).toContain('DC')
    expect(lines[5]).toContain('D')
  })

  test('error summary always uses error(s) format not errors', () => {
    const results: DoctorResult = {
      checks: [{ message: 'E', status: 'error' }],
      errors: 3,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('error(s)')
    expect(summary).not.toContain('errors')
  })

  test('error summary always uses warning(s) format not warnings', () => {
    const results: DoctorResult = {
      checks: [{ message: 'E', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 2,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('warning(s)')
    // Note: 'warnings' might appear in other context, but the format is always (s)
  })

  test('displayResults with only error checks verbose shows all details', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'E1', status: 'error', details: 'D1' },
        { message: 'E2', status: 'error', details: 'D2' },
        { message: 'E3', status: 'error', details: 'D3' },
      ],
      errors: 3,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[0]).toContain('E1')
    expect(lines[1]).toContain('D1')
    expect(lines[2]).toContain('E2')
    expect(lines[3]).toContain('D2')
    expect(lines[4]).toContain('E3')
    expect(lines[5]).toContain('D3')
  })

  test('displayResults non-verbose with 10 mixed checks correct count', () => {
    const checks = Array.from({ length: 10 }, (_, i) => ({
      message: `Check ${i + 1}`,
      status: (i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'ok') as
        | 'error'
        | 'warning'
        | 'ok',
    }))
    const results: DoctorResult = {
      checks,
      errors: 4,
      passed: false,
      warnings: 3,
    }
    const lines = displayResults(results, false)
    // 10 checks + 1 blank + 1 summary = 12
    expect(lines).toHaveLength(12)
  })

  test('displayResults verbose with check having multi-line detail text', () => {
    const results: DoctorResult = {
      checks: [
        {
          message: 'Multi-detail',
          status: 'error',
          details: 'Line 1\nLine 2\nLine 3\nLine 4',
        },
      ],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toContain('Line 1\nLine 2\nLine 3\nLine 4')
  })

  test('displayResults summary is never empty', () => {
    const cases: Array<{ results: DoctorResult; verbose: boolean }> = [
      {
        results: { checks: [], errors: 0, passed: true, warnings: 0 },
        verbose: false,
      },
      {
        results: { checks: [{ message: 'A', status: 'ok' }], errors: 0, passed: true, warnings: 0 },
        verbose: false,
      },
      {
        results: {
          checks: [{ message: 'B', status: 'warning' }],
          errors: 0,
          passed: true,
          warnings: 1,
        },
        verbose: false,
      },
      {
        results: {
          checks: [{ message: 'C', status: 'error' }],
          errors: 1,
          passed: false,
          warnings: 0,
        },
        verbose: false,
      },
    ]
    for (const { results, verbose } of cases) {
      const lines = displayResults(results, verbose)
      const summary = lines[lines.length - 1]
      expect(summary.length).toBeGreaterThan(0)
    }
  })

  test('displayResults blank separator line is always empty string', () => {
    const cases: Array<{ results: DoctorResult; verbose: boolean; blankIndex: number }> = [
      {
        results: { checks: [{ message: 'A', status: 'ok' }], errors: 0, passed: true, warnings: 0 },
        verbose: false,
        blankIndex: 1,
      },
      {
        results: { checks: [{ message: 'A', status: 'ok' }], errors: 0, passed: true, warnings: 0 },
        verbose: true,
        blankIndex: 1,
      },
    ]
    for (const { results, verbose, blankIndex } of cases) {
      const lines = displayResults(results, verbose)
      expect(lines[blankIndex]).toBe('')
    }
  })

  test('check line for error status contains both symbol and colored message', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Test Error', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toBe(`${getStatusSymbol('error')} ${colorMessage('error', 'Test Error')}`)
  })

  test('check line for warning status contains both symbol and colored message', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Test Warning', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toBe(
      `${getStatusSymbol('warning')} ${colorMessage('warning', 'Test Warning')}`,
    )
  })

  test('check line for ok status contains both symbol and plain message', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Test OK', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toBe(`${getStatusSymbol('ok')} ${colorMessage('ok', 'Test OK')}`)
  })

  test('error summary with zero errors shows success or warning', () => {
    const results: DoctorResult = {
      checks: [{ message: 'OK', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).not.toContain('Found')
  })

  test('displayResults verbose false with 5 error checks each having details ignores details', () => {
    const results: DoctorResult = {
      checks: Array.from({ length: 5 }, (_, i) => ({
        message: `E${i}`,
        status: 'error' as const,
        details: `D${i}`,
      })),
      errors: 5,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    // 5 checks + 1 blank + 1 summary = 7
    expect(lines).toHaveLength(7)
  })

  test('displayResults preserves order: ok then warning then error', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'First', status: 'ok' },
        { message: 'Second', status: 'warning' },
        { message: 'Third', status: 'error' },
        { message: 'Fourth', status: 'ok' },
      ],
      errors: 1,
      passed: false,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toContain('First')
    expect(lines[1]).toContain('Second')
    expect(lines[2]).toContain('Third')
    expect(lines[3]).toContain('Fourth')
  })

  test('displayResults detail line starts with two spaces', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'ok', details: 'Info' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    const detailLine = lines[1]
    // chalk.gray('  Info') - the raw text starts with two spaces
    expect(detailLine).toContain('  Info')
  })

  test('displayResults with passed false and warnings only shows success summary', () => {
    const results: DoctorResult = {
      checks: [{ message: 'W', status: 'warning' }],
      errors: 0,
      passed: false,
      warnings: 2,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toContain('All checks passed')
    expect(summary).toContain('2 warnings')
  })

  test('displayResults summary color is green for clean results', () => {
    const results: DoctorResult = {
      checks: [{ message: 'OK', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.green('All checks passed!'))
  })

  test('displayResults summary color is yellow when only warnings exist', () => {
    const results: DoctorResult = {
      checks: [{ message: 'W', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.yellow('All checks passed! (1 warning)'))
  })

  test('displayResults summary color is red when errors exist', () => {
    const results: DoctorResult = {
      checks: [{ message: 'E', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.red('Found 1 error(s), 0 warning(s)'))
  })

  test('displayResults check line format for error is symbol + space + colored msg', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Fail msg', status: 'error' }],
      errors: 1,
      passed: false,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toBe(`${getStatusSymbol('error')} ${chalk.red('Fail msg')}`)
  })

  test('displayResults check line format for warning is symbol + space + colored msg', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Warn msg', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 1,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toBe(`${getStatusSymbol('warning')} ${chalk.yellow('Warn msg')}`)
  })

  test('displayResults check line format for ok is symbol + space + plain msg', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Ok msg', status: 'ok' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines[0]).toBe(`${chalk.green('✓')} Ok msg`)
  })

  test('displayResults verbose detail preserves whitespace in detail text', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'ok', details: '  indented text  ' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toBe(chalk.gray('    indented text  '))
  })

  test('displayResults error summary exact format for 10 errors and 20 warnings', () => {
    const results: DoctorResult = {
      checks: [{ message: 'E', status: 'error' }],
      errors: 10,
      passed: false,
      warnings: 20,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.red('Found 10 error(s), 20 warning(s)'))
  })

  test('displayResults warning summary exact format for 10 warnings', () => {
    const results: DoctorResult = {
      checks: [{ message: 'W', status: 'warning' }],
      errors: 0,
      passed: true,
      warnings: 10,
    }
    const lines = displayResults(results, false)
    const summary = lines[lines.length - 1]
    expect(summary).toBe(chalk.yellow('All checks passed! (10 warnings)'))
  })

  test('displayResults with duplicate check messages preserves all', () => {
    const results: DoctorResult = {
      checks: [
        { message: 'Same', status: 'ok' },
        { message: 'Same', status: 'ok' },
        { message: 'Same', status: 'ok' },
      ],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, false)
    expect(lines).toHaveLength(5) // 3 checks + blank + summary
    expect(lines[0]).toContain('Same')
    expect(lines[1]).toContain('Same')
    expect(lines[2]).toContain('Same')
  })

  test('displayResults verbose detail for unicode content', () => {
    const results: DoctorResult = {
      checks: [{ message: 'チェック', status: 'ok', details: '詳細情報' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toContain('詳細情報')
  })

  test('displayResults verbose detail for emoji content', () => {
    const results: DoctorResult = {
      checks: [{ message: 'Check', status: 'ok', details: '🎉 🚀 ✅' }],
      errors: 0,
      passed: true,
      warnings: 0,
    }
    const lines = displayResults(results, true)
    expect(lines[1]).toContain('🎉 🚀 ✅')
  })
})

// ============================================================================
// Additional colorMessage tests
// ============================================================================

describe('colorMessage additional coverage', () => {
  test('ok status does not modify message with double quotes', () => {
    const result = colorMessage('ok', '"quoted"')
    expect(result).toBe('"quoted"')
  })

  test('error status preserves double quotes in message', () => {
    const result = colorMessage('error', '"quoted"')
    expect(result).toContain('"quoted"')
  })

  test('warning status preserves double quotes in message', () => {
    const result = colorMessage('warning', '"quoted"')
    expect(result).toContain('"quoted"')
  })

  test('ok status handles message with dollar signs', () => {
    const result = colorMessage('ok', '$HOME/$USER')
    expect(result).toBe('$HOME/$USER')
  })

  test('error status handles message with dollar signs', () => {
    const result = colorMessage('error', '$HOME/$USER')
    expect(result).toContain('$HOME/$USER')
  })

  test('ok status handles message with curly braces', () => {
    const result = colorMessage('ok', '{key: value}')
    expect(result).toBe('{key: value}')
  })

  test('error status handles message with percent signs', () => {
    const result = colorMessage('error', '100% done')
    expect(result).toContain('100% done')
  })

  test('warning status handles message with at symbols', () => {
    const result = colorMessage('warning', 'user@host')
    expect(result).toContain('user@host')
  })

  test('ok status handles multiline with CRLF', () => {
    const msg = 'line1\r\nline2\r\nline3'
    const result = colorMessage('ok', msg)
    expect(result).toBe(msg)
  })

  test('ok status handles message with hash symbols', () => {
    const result = colorMessage('ok', '# comment')
    expect(result).toBe('# comment')
  })

  test('error status handles message with hash symbols', () => {
    const result = colorMessage('error', '# comment')
    expect(result).toContain('# comment')
  })

  test('ok status handles message with equals signs', () => {
    const result = colorMessage('ok', 'key=value')
    expect(result).toBe('key=value')
  })

  test('warning status handles message with semicolons', () => {
    const result = colorMessage('warning', 'a;b;c')
    expect(result).toContain('a;b;c')
  })
})

// ============================================================================
// Additional getStatusSymbol tests
// ============================================================================

describe('getStatusSymbol additional coverage', () => {
  test('error symbol is distinct from ok symbol string value', () => {
    const errorSym = getStatusSymbol('error')
    const okSym = getStatusSymbol('ok')
    expect(errorSym).not.toBe(okSym)
  })

  test('warning symbol is distinct from error symbol string value', () => {
    const warningSym = getStatusSymbol('warning')
    const errorSym = getStatusSymbol('error')
    expect(warningSym).not.toBe(errorSym)
  })

  test('ok symbol is distinct from warning symbol string value', () => {
    const okSym = getStatusSymbol('ok')
    const warningSym = getStatusSymbol('warning')
    expect(okSym).not.toBe(warningSym)
  })

  test('error symbol contains the ✗ character and is non-empty', () => {
    const result = getStatusSymbol('error')
    expect(result).toContain('✗')
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('ok symbol contains the ✓ character and is non-empty', () => {
    const result = getStatusSymbol('ok')
    expect(result).toContain('✓')
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('warning symbol contains the ⚠ character and is non-empty', () => {
    const result = getStatusSymbol('warning')
    expect(result).toContain('⚠')
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('calling getStatusSymbol many times returns consistent results', () => {
    const results = Array.from({ length: 20 }, () => getStatusSymbol('ok'))
    const first = results[0]
    for (const r of results) {
      expect(r).toBe(first)
    }
  })

  test('calling getStatusSymbol many times for error returns consistent results', () => {
    const results = Array.from({ length: 20 }, () => getStatusSymbol('error'))
    const first = results[0]
    for (const r of results) {
      expect(r).toBe(first)
    }
  })

  test('calling getStatusSymbol many times for warning returns consistent results', () => {
    const results = Array.from({ length: 20 }, () => getStatusSymbol('warning'))
    const first = results[0]
    for (const r of results) {
      expect(r).toBe(first)
    }
  })

  test('error symbol is a string primitive', () => {
    const result = getStatusSymbol('error')
    expect(typeof result).toBe('string')
  })

  test('ok symbol is a string primitive', () => {
    const result = getStatusSymbol('ok')
    expect(typeof result).toBe('string')
  })

  test('warning symbol is a string primitive', () => {
    const result = getStatusSymbol('warning')
    expect(typeof result).toBe('string')
  })
})

// ============================================================================
// displayResults structural invariants
// ============================================================================

describe('displayResults structural invariants', () => {
  test('output always ends with a non-blank summary line', () => {
    const cases: DoctorResult[] = [
      { checks: [], errors: 0, passed: true, warnings: 0 },
      { checks: [{ message: 'A', status: 'ok' }], errors: 0, passed: true, warnings: 0 },
      { checks: [{ message: 'B', status: 'warning' }], errors: 0, passed: true, warnings: 1 },
      { checks: [{ message: 'C', status: 'error' }], errors: 1, passed: false, warnings: 0 },
    ]
    for (const results of cases) {
      const lines = displayResults(results, false)
      expect(lines[lines.length - 1]).not.toBe('')
    }
  })

  test('second-to-last line is always blank separator', () => {
    const cases: DoctorResult[] = [
      { checks: [], errors: 0, passed: true, warnings: 0 },
      { checks: [{ message: 'A', status: 'ok' }], errors: 0, passed: true, warnings: 0 },
      { checks: [{ message: 'B', status: 'error' }], errors: 1, passed: false, warnings: 0 },
    ]
    for (const results of cases) {
      const lines = displayResults(results, false)
      expect(lines[lines.length - 2]).toBe('')
    }
  })

  test('displayResults does not mutate input checks array', () => {
    const checks = [
      { message: 'A', status: 'ok' as const },
      { message: 'B', status: 'warning' as const },
    ]
    const results: DoctorResult = {
      checks,
      errors: 0,
      passed: true,
      warnings: 1,
    }
    displayResults(results, false)
    expect(results.checks).toBe(checks)
    expect(results.checks).toHaveLength(2)
    expect(results.checks[0].message).toBe('A')
    expect(results.checks[1].message).toBe('B')
  })

  test('displayResults does not mutate errors or warnings counts', () => {
    const results: DoctorResult = {
      checks: [{ message: 'E', status: 'error' }],
      errors: 5,
      passed: false,
      warnings: 3,
    }
    displayResults(results, false)
    expect(results.errors).toBe(5)
    expect(results.warnings).toBe(3)
    expect(results.passed).toBe(false)
  })
})
