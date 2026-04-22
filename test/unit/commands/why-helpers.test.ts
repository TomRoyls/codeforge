import { describe, test, expect } from 'vitest'
import {
  BEST_PRACTICES,
  COMMON_VIOLATIONS,
  FIXES,
  getBestPractices,
  getCommonViolations,
  getFixes,
  analyzeViolation,
  formatBestPractices,
  formatCommonViolations,
  formatFixes,
  formatViolationAnalysis,
  displayWhyOutput,
  type RuleMeta,
} from '../../../src/commands/why-helpers.js'

function collectLog(fn: (logFn: (msg: string) => void) => void): string[] {
  const lines: string[] = []
  fn((msg) => lines.push(msg))
  return lines
}

describe('BEST_PRACTICES', () => {
  test('has entries for max-depth', () => {
    expect(BEST_PRACTICES['max-depth']).toBeDefined()
    expect(BEST_PRACTICES['max-depth'].length).toBeGreaterThan(0)
  })

  test('has entries for max-lines', () => {
    expect(BEST_PRACTICES['max-lines']).toBeDefined()
    expect(BEST_PRACTICES['max-lines'].length).toBeGreaterThan(0)
  })

  test('has entries for max-params', () => {
    expect(BEST_PRACTICES['max-params']).toBeDefined()
    expect(BEST_PRACTICES['max-params'].length).toBeGreaterThan(0)
  })

  test('has entries for no-console', () => {
    expect(BEST_PRACTICES['no-console']).toBeDefined()
    expect(BEST_PRACTICES['no-console'].length).toBeGreaterThan(0)
  })

  test('each entry is an array of non-empty strings', () => {
    for (const [key, practices] of Object.entries(BEST_PRACTICES)) {
      for (const practice of practices) {
        expect(typeof practice).toBe('string')
        expect(practice.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('COMMON_VIOLATIONS', () => {
  test('has entries for max-depth', () => {
    expect(COMMON_VIOLATIONS['max-depth']).toBeDefined()
    expect(COMMON_VIOLATIONS['max-depth'].length).toBeGreaterThan(0)
  })

  test('has entries for max-lines', () => {
    expect(COMMON_VIOLATIONS['max-lines']).toBeDefined()
    expect(COMMON_VIOLATIONS['max-lines'].length).toBeGreaterThan(0)
  })

  test('has entries for max-params', () => {
    expect(COMMON_VIOLATIONS['max-params']).toBeDefined()
    expect(COMMON_VIOLATIONS['max-params'].length).toBeGreaterThan(0)
  })

  test('has entries for no-console', () => {
    expect(COMMON_VIOLATIONS['no-console']).toBeDefined()
    expect(COMMON_VIOLATIONS['no-console'].length).toBeGreaterThan(0)
  })

  test('each entry is an array of non-empty strings', () => {
    for (const [key, violations] of Object.entries(COMMON_VIOLATIONS)) {
      for (const violation of violations) {
        expect(typeof violation).toBe('string')
        expect(violation.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('FIXES', () => {
  test('has entries for max-depth', () => {
    expect(FIXES['max-depth']).toBeDefined()
    expect(FIXES['max-depth'].length).toBeGreaterThan(0)
  })

  test('has entries for max-lines', () => {
    expect(FIXES['max-lines']).toBeDefined()
    expect(FIXES['max-lines'].length).toBeGreaterThan(0)
  })

  test('has entries for max-params', () => {
    expect(FIXES['max-params']).toBeDefined()
    expect(FIXES['max-params'].length).toBeGreaterThan(0)
  })

  test('has entries for no-console', () => {
    expect(FIXES['no-console']).toBeDefined()
    expect(FIXES['no-console'].length).toBeGreaterThan(0)
  })

  test('each entry is an array of non-empty strings', () => {
    for (const [key, fixes] of Object.entries(FIXES)) {
      for (const fix of fixes) {
        expect(typeof fix).toBe('string')
        expect(fix.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('getBestPractices', () => {
  test('returns practices for max-depth', () => {
    const result = getBestPractices('max-depth')
    expect(result).toBe(BEST_PRACTICES['max-depth'])
  })

  test('returns practices for max-lines', () => {
    const result = getBestPractices('max-lines')
    expect(result).toBe(BEST_PRACTICES['max-lines'])
  })

  test('returns practices for max-params', () => {
    const result = getBestPractices('max-params')
    expect(result).toBe(BEST_PRACTICES['max-params'])
  })

  test('returns practices for no-console', () => {
    const result = getBestPractices('no-console')
    expect(result).toBe(BEST_PRACTICES['no-console'])
  })

  test('returns generic fallback for unknown rule', () => {
    const result = getBestPractices('unknown-rule')
    expect(result).toEqual(['Follow general code quality guidelines'])
  })
})

describe('getCommonViolations', () => {
  test('returns violations for max-depth', () => {
    const result = getCommonViolations('max-depth')
    expect(result).toBe(COMMON_VIOLATIONS['max-depth'])
  })

  test('returns violations for max-lines', () => {
    const result = getCommonViolations('max-lines')
    expect(result).toBe(COMMON_VIOLATIONS['max-lines'])
  })

  test('returns violations for max-params', () => {
    const result = getCommonViolations('max-params')
    expect(result).toBe(COMMON_VIOLATIONS['max-params'])
  })

  test('returns violations for no-console', () => {
    const result = getCommonViolations('no-console')
    expect(result).toBe(COMMON_VIOLATIONS['no-console'])
  })

  test('returns generic fallback for unknown rule', () => {
    const result = getCommonViolations('unknown-rule')
    expect(result).toEqual(['Various violations may occur depending on usage'])
  })
})

describe('getFixes', () => {
  test('returns fixes for max-depth', () => {
    const result = getFixes('max-depth')
    expect(result).toBe(FIXES['max-depth'])
  })

  test('returns fixes for max-lines', () => {
    const result = getFixes('max-lines')
    expect(result).toBe(FIXES['max-lines'])
  })

  test('returns fixes for max-params', () => {
    const result = getFixes('max-params')
    expect(result).toBe(FIXES['max-params'])
  })

  test('returns fixes for no-console', () => {
    const result = getFixes('no-console')
    expect(result).toBe(FIXES['no-console'])
  })

  test('returns generic fallback for unknown rule', () => {
    const result = getFixes('unknown-rule')
    expect(result).toEqual(['Check the rule documentation for specific fixes'])
  })
})

describe('analyzeViolation', () => {
  test('returns suggestions for parameter-related violations', () => {
    const result = analyzeViolation('max-params', 'Too many parameters')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  test('returns suggestions for nested violations', () => {
    const result = analyzeViolation('max-depth', 'Code is nested too deep')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  test('returns suggestions for depth keyword', () => {
    const result = analyzeViolation('max-depth', 'depth exceeded')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some((s) => s.includes('helper function'))).toBe(true)
  })

  test('returns suggestions for long-related violations', () => {
    const result = analyzeViolation('max-lines', 'File is too long')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })

  test('returns suggestions for line keyword', () => {
    const result = analyzeViolation('max-lines', 'line limit exceeded')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })

  test('returns fallback for unrecognized violation text', () => {
    const result = analyzeViolation('some-rule', 'something random')
    expect(result).toEqual([
      'Review the rule documentation for specific guidance on this violation',
    ])
  })

  test('returns combined suggestions when multiple keywords match', () => {
    const result = analyzeViolation('max-params', 'parameter depth is too long')
    expect(result.length).toBeGreaterThanOrEqual(4)
  })

  test('ruleId parameter is accepted but not used for matching', () => {
    const result = analyzeViolation('any-rule', 'Too many parameters')
    expect(result.length).toBeGreaterThanOrEqual(2)
  })
})

describe('formatBestPractices', () => {
  test('logs each practice with bullet point', () => {
    const lines = collectLog((logFn) => formatBestPractices('max-params', logFn))
    expect(lines.length).toBe(BEST_PRACTICES['max-params'].length)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
  })

  test('logs generic fallback for unknown rule', () => {
    const lines = collectLog((logFn) => formatBestPractices('unknown-rule', logFn))
    expect(lines).toEqual(['  • Follow general code quality guidelines'])
  })

  test('logs all max-depth practices', () => {
    const lines = collectLog((logFn) => formatBestPractices('max-depth', logFn))
    expect(lines.length).toBe(3)
  })
})

describe('formatCommonViolations', () => {
  test('logs each violation with bullet point', () => {
    const lines = collectLog((logFn) => formatCommonViolations('max-depth', logFn))
    expect(lines.length).toBe(COMMON_VIOLATIONS['max-depth'].length)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
  })

  test('logs generic fallback for unknown rule', () => {
    const lines = collectLog((logFn) => formatCommonViolations('unknown-rule', logFn))
    expect(lines).toEqual(['  • Various violations may occur depending on usage'])
  })

  test('logs all max-params violations', () => {
    const lines = collectLog((logFn) => formatCommonViolations('max-params', logFn))
    expect(lines.length).toBe(3)
  })
})

describe('formatFixes', () => {
  test('logs each fix with bullet point', () => {
    const lines = collectLog((logFn) => formatFixes('max-lines', logFn))
    expect(lines.length).toBe(FIXES['max-lines'].length)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
  })

  test('logs generic fallback for unknown rule', () => {
    const lines = collectLog((logFn) => formatFixes('unknown-rule', logFn))
    expect(lines).toEqual(['  • Check the rule documentation for specific fixes'])
  })

  test('logs all no-console fixes', () => {
    const lines = collectLog((logFn) => formatFixes('no-console', logFn))
    expect(lines.length).toBe(4)
  })
})

describe('formatViolationAnalysis', () => {
  test('logs each suggestion with bullet point', () => {
    const lines = collectLog((logFn) =>
      formatViolationAnalysis('max-params', 'Too many parameters', logFn),
    )
    expect(lines.length).toBeGreaterThanOrEqual(2)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
  })

  test('logs fallback for unrecognized violation', () => {
    const lines = collectLog((logFn) => formatViolationAnalysis('any', 'random text', logFn))
    expect(lines).toEqual([
      '  • Review the rule documentation for specific guidance on this violation',
    ])
  })
})

describe('displayWhyOutput', () => {
  test('displays rule id header', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('max-params')
    expect(output).toContain('Rule:')
  })

  test('displays common violations section', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Common violations')
  })

  test('displays how to fix section', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('How to fix')
  })

  test('displays best practices section', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Best practices')
  })

  test('displays description when ruleMeta has one', () => {
    const meta: RuleMeta = { description: 'A test rule description' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test-rule', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Description')
    expect(output).toContain('A test rule description')
  })

  test('skips description when ruleMeta has none', () => {
    const meta: RuleMeta = {}
    const lines = collectLog((logFn) =>
      displayWhyOutput('test-rule', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Description:')
  })

  test('displays violation analysis when violation is provided', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, 'Too many parameters', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Your specific violation')
    expect(output).toContain('Too many parameters')
  })

  test('skips violation section when no violation provided', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Your specific violation')
  })

  test('displays explain command suggestion with bin name', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'mycli', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('mycli explain max-params')
    expect(output).toContain('more details')
  })

  test('calls logFn multiple times', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    expect(lines.length).toBeGreaterThan(5)
  })
})

describe('getBestPractices – expanded rules', () => {
  test('no-eval returns array of 3 non-empty strings', () => {
    const result = getBestPractices('no-eval')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-await-in-loop returns array of 3 non-empty strings', () => {
    const result = getBestPractices('no-await-in-loop')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('curly returns array of 3 non-empty strings', () => {
    const result = getBestPractices('curly')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('eq-eq-eq returns array of 3 non-empty strings', () => {
    const result = getBestPractices('eq-eq-eq')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('prefer-const returns array of 3 non-empty strings', () => {
    const result = getBestPractices('prefer-const')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-circular-deps returns array of 3 non-empty strings', () => {
    const result = getBestPractices('no-circular-deps')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('max-complexity returns array of 3 non-empty strings', () => {
    const result = getBestPractices('max-complexity')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-empty returns array of 3 non-empty strings', () => {
    const result = getBestPractices('no-empty')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-debugger returns array of 3 non-empty strings', () => {
    const result = getBestPractices('no-debugger')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-explicit-any returns array of 3 non-empty strings', () => {
    const result = getBestPractices('no-explicit-any')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })
})

describe('getCommonViolations – expanded rules', () => {
  test('no-eval returns array of 3 non-empty strings containing eval keywords', () => {
    const result = getCommonViolations('no-eval')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('eval') || s.includes('JSON'))).toBe(true)
  })

  test('no-await-in-loop returns array of 3 non-empty strings containing async keywords', () => {
    const result = getCommonViolations('no-await-in-loop')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('await') || s.includes('Promise'))).toBe(true)
  })

  test('curly returns array of 3 non-empty strings containing brace keywords', () => {
    const result = getCommonViolations('curly')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('brace') || s.includes('braces'))).toBe(true)
  })

  test('eq-eq-eq returns array of 3 non-empty strings containing equality keywords', () => {
    const result = getCommonViolations('eq-eq-eq')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('==') || s.includes('coercion'))).toBe(true)
  })

  test('prefer-const returns array of 3 non-empty strings containing let keywords', () => {
    const result = getCommonViolations('prefer-const')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('let') || s.includes('const'))).toBe(true)
  })

  test('no-circular-deps returns array of 3 non-empty strings containing import keywords', () => {
    const result = getCommonViolations('no-circular-deps')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('import') || s.includes('circular'))).toBe(true)
  })

  test('max-complexity returns array of 3 non-empty strings containing complexity keywords', () => {
    const result = getCommonViolations('max-complexity')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('complex') || s.includes('switch'))).toBe(true)
  })

  test('no-empty returns array of 3 non-empty strings containing block keywords', () => {
    const result = getCommonViolations('no-empty')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('empty') || s.includes('Empty'))).toBe(true)
  })

  test('no-debugger returns array of 3 non-empty strings containing debugger keywords', () => {
    const result = getCommonViolations('no-debugger')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('debugger') || s.includes('Debugger'))).toBe(true)
  })

  test('no-explicit-any returns array of 3 non-empty strings containing type keywords', () => {
    const result = getCommonViolations('no-explicit-any')
    expect(result).toHaveLength(3)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
    expect(result.some((s) => s.includes('any') || s.includes('type'))).toBe(true)
  })
})

describe('getFixes – expanded rules', () => {
  test('no-eval returns array of 4 non-empty strings', () => {
    const result = getFixes('no-eval')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-await-in-loop returns array of 4 non-empty strings', () => {
    const result = getFixes('no-await-in-loop')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('curly returns array of 4 non-empty strings', () => {
    const result = getFixes('curly')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('eq-eq-eq returns array of 4 non-empty strings', () => {
    const result = getFixes('eq-eq-eq')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('prefer-const returns array of 4 non-empty strings', () => {
    const result = getFixes('prefer-const')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-circular-deps returns array of 4 non-empty strings', () => {
    const result = getFixes('no-circular-deps')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('max-complexity returns array of 4 non-empty strings', () => {
    const result = getFixes('max-complexity')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-empty returns array of 4 non-empty strings', () => {
    const result = getFixes('no-empty')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-debugger returns array of 4 non-empty strings', () => {
    const result = getFixes('no-debugger')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })

  test('no-explicit-any returns array of 4 non-empty strings', () => {
    const result = getFixes('no-explicit-any')
    expect(result).toHaveLength(4)
    for (const s of result) {
      expect(s.length).toBeGreaterThan(0)
    }
  })
})

describe('analyzeViolation – edge cases', () => {
  test('returns fallback for empty string violation', () => {
    const result = analyzeViolation('any-rule', '')
    expect(result).toEqual([
      'Review the rule documentation for specific guidance on this violation',
    ])
  })

  test('returns suggestions containing deduplicated for long keyword', () => {
    const result = analyzeViolation('max-lines', 'function is long')
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })

  test('returns combined suggestions for nested and long keywords', () => {
    const result = analyzeViolation('some-rule', 'nested too long')
    expect(result.length).toBeGreaterThanOrEqual(4)
    expect(result.some((s) => s.includes('early'))).toBe(true)
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })
})

describe('formatViolationAnalysis – additional coverage', () => {
  test('logs nested-related suggestions with bullet points', () => {
    const lines = collectLog((logFn) =>
      formatViolationAnalysis('max-depth', 'Code is nested too deep', logFn),
    )
    expect(lines.length).toBeGreaterThanOrEqual(2)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
    expect(lines.some((l) => l.includes('early'))).toBe(true)
  })
})

describe('displayWhyOutput – additional coverage', () => {
  test('skips violation section when violation is empty string', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, '', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Your specific violation')
  })

  test('skips description when ruleMeta has name only', () => {
    const meta: RuleMeta = { name: 'test-rule-name' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test-rule', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Description:')
  })

  test('displays both description and violation when both are provided', () => {
    const meta: RuleMeta = { description: 'Prevents excessive params' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', meta, 'Too many parameters', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Description')
    expect(output).toContain('Prevents excessive params')
    expect(output).toContain('Your specific violation')
    expect(output).toContain('Too many parameters')
  })

  test('always displays Category line', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Category:')
  })

  test('sections appear in correct order', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    const violationsIdx = output.indexOf('Common violations')
    const fixesIdx = output.indexOf('How to fix')
    const practicesIdx = output.indexOf('Best practices')
    const explainIdx = output.indexOf('more details')
    expect(violationsIdx).toBeLessThan(fixesIdx)
    expect(fixesIdx).toBeLessThan(practicesIdx)
    expect(practicesIdx).toBeLessThan(explainIdx)
  })
})

describe('getBestPractices – fallback and boundary', () => {
  test('returns fallback for empty string rule id', () => {
    const result = getBestPractices('')
    expect(result).toEqual(['Follow general code quality guidelines'])
  })

  test('returns fallback for rule id with special characters', () => {
    const result = getBestPractices('rule/with@special#chars')
    expect(result).toEqual(['Follow general code quality guidelines'])
  })

  test('returns fallback for whitespace-only rule id', () => {
    const result = getBestPractices('   ')
    expect(result).toEqual(['Follow general code quality guidelines'])
  })
})

describe('getCommonViolations – fallback and boundary', () => {
  test('returns fallback for empty string rule id', () => {
    const result = getCommonViolations('')
    expect(result).toEqual(['Various violations may occur depending on usage'])
  })

  test('returns fallback for rule id with special characters', () => {
    const result = getCommonViolations('rule/with@special#chars')
    expect(result).toEqual(['Various violations may occur depending on usage'])
  })

  test('returns fallback for whitespace-only rule id', () => {
    const result = getCommonViolations('   ')
    expect(result).toEqual(['Various violations may occur depending on usage'])
  })
})

describe('getFixes – fallback and boundary', () => {
  test('returns fallback for empty string rule id', () => {
    const result = getFixes('')
    expect(result).toEqual(['Check the rule documentation for specific fixes'])
  })

  test('returns fallback for rule id with special characters', () => {
    const result = getFixes('rule/with@special#chars')
    expect(result).toEqual(['Check the rule documentation for specific fixes'])
  })

  test('returns fallback for whitespace-only rule id', () => {
    const result = getFixes('   ')
    expect(result).toEqual(['Check the rule documentation for specific fixes'])
  })
})

describe('analyzeViolation – expanded coverage', () => {
  test('does not match Parameters (capitalized) for parameter keyword', () => {
    const result = analyzeViolation('max-params', 'Parameters exceed limit')
    expect(result).toEqual([
      'Review the rule documentation for specific guidance on this violation',
    ])
  })

  test('returns all three keyword groups when violation contains parameter, nested, and long', () => {
    const result = analyzeViolation('test-rule', 'parameter is nested and long')
    expect(result.length).toBeGreaterThanOrEqual(6)
    expect(result.some((s) => s.includes('options object'))).toBe(true)
    expect(result.some((s) => s.includes('early'))).toBe(true)
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })

  test('returns nested suggestions only when violation contains only nested', () => {
    const result = analyzeViolation('max-depth', 'nested logic here')
    expect(result.length).toBe(2)
    expect(result.every((s) => !s.includes('options object'))).toBe(true)
    expect(result.every((s) => !s.includes('deduplicated'))).toBe(true)
  })

  test('returns depth suggestions without nested keyword match', () => {
    const result = analyzeViolation('max-depth', 'depth of function is high')
    expect(result.some((s) => s.includes('helper function'))).toBe(true)
  })

  test('returns long suggestions without line keyword match', () => {
    const result = analyzeViolation('max-lines', 'this file is too long for comfort')
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })

  test('returns line suggestions without long keyword match', () => {
    const result = analyzeViolation('max-lines', 'line count exceeds maximum')
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })

  test('returns exactly 2 suggestions for single keyword match', () => {
    const result = analyzeViolation('any-rule', 'too many parameter arguments')
    expect(result).toHaveLength(2)
  })
})

describe('formatBestPractices – additional coverage', () => {
  test('logs all no-console practices', () => {
    const lines = collectLog((logFn) => formatBestPractices('no-console', logFn))
    expect(lines.length).toBe(BEST_PRACTICES['no-console'].length)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
  })

  test('logs all max-lines practices', () => {
    const lines = collectLog((logFn) => formatBestPractices('max-lines', logFn))
    expect(lines.length).toBe(BEST_PRACTICES['max-lines'].length)
  })

  test('logs all max-params practices', () => {
    const lines = collectLog((logFn) => formatBestPractices('max-params', logFn))
    expect(lines.length).toBe(BEST_PRACTICES['max-params'].length)
  })

  test('logs exactly one line for unknown rule', () => {
    const lines = collectLog((logFn) => formatBestPractices('totally-unknown', logFn))
    expect(lines).toHaveLength(1)
  })
})

describe('formatCommonViolations – additional coverage', () => {
  test('logs all no-console violations', () => {
    const lines = collectLog((logFn) => formatCommonViolations('no-console', logFn))
    expect(lines.length).toBe(COMMON_VIOLATIONS['no-console'].length)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
  })

  test('logs all max-lines violations', () => {
    const lines = collectLog((logFn) => formatCommonViolations('max-lines', logFn))
    expect(lines.length).toBe(COMMON_VIOLATIONS['max-lines'].length)
  })

  test('logs exactly one line for unknown rule', () => {
    const lines = collectLog((logFn) => formatCommonViolations('totally-unknown', logFn))
    expect(lines).toHaveLength(1)
  })
})

describe('formatFixes – additional coverage', () => {
  test('logs all max-depth fixes', () => {
    const lines = collectLog((logFn) => formatFixes('max-depth', logFn))
    expect(lines.length).toBe(FIXES['max-depth'].length)
    for (const line of lines) {
      expect(line).toMatch(/^  • /)
    }
  })

  test('logs all max-params fixes', () => {
    const lines = collectLog((logFn) => formatFixes('max-params', logFn))
    expect(lines.length).toBe(FIXES['max-params'].length)
  })

  test('logs exactly one line for unknown rule', () => {
    const lines = collectLog((logFn) => formatFixes('totally-unknown', logFn))
    expect(lines).toHaveLength(1)
  })
})

describe('displayWhyOutput – violation with specific keywords', () => {
  test('displays violation analysis with nested keyword', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-depth', undefined, 'Code is nested too deep', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('early')
  })

  test('displays violation quoted in output', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-lines', undefined, 'line count is too high', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('"line count is too high"')
  })

  test('sections appear in correct order with violation present', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, 'Too many parameters', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    const descIdx = output.indexOf('Common violations')
    const fixesIdx = output.indexOf('How to fix')
    const violationIdx = output.indexOf('Your specific violation')
    const practicesIdx = output.indexOf('Best practices')
    expect(descIdx).toBeLessThan(fixesIdx)
    expect(fixesIdx).toBeLessThan(violationIdx)
    expect(violationIdx).toBeLessThan(practicesIdx)
  })

  test('displays explain hint with custom bin name', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('no-console', undefined, undefined, 'my-tool', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('my-tool explain no-console')
  })

  test('ruleMeta with both name and description uses description', () => {
    const meta: RuleMeta = { name: 'my-rule', description: 'Detailed rule info' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test-rule', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Description')
    expect(output).toContain('Detailed rule info')
  })

  test('ruleMeta with empty description string skips description', () => {
    const meta: RuleMeta = { description: '' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test-rule', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Description:')
  })

  test('includes blank lines between sections', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const blankCount = lines.filter((l) => l === '').length
    expect(blankCount).toBeGreaterThanOrEqual(4)
  })
})

describe('data integrity – expanded rules', () => {
  test('BEST_PRACTICES has at least 14 rule entries', () => {
    const keys = Object.keys(BEST_PRACTICES)
    expect(keys.length).toBeGreaterThanOrEqual(14)
  })

  test('COMMON_VIOLATIONS has at least 14 rule entries', () => {
    const keys = Object.keys(COMMON_VIOLATIONS)
    expect(keys.length).toBeGreaterThanOrEqual(14)
  })

  test('FIXES has at least 14 rule entries', () => {
    const keys = Object.keys(FIXES)
    expect(keys.length).toBeGreaterThanOrEqual(14)
  })

  test('all BEST_PRACTICES arrays have length 3', () => {
    for (const [key, practices] of Object.entries(BEST_PRACTICES)) {
      expect(practices).toHaveLength(3)
    }
  })

  test('all COMMON_VIOLATIONS arrays have length 3', () => {
    for (const [key, violations] of Object.entries(COMMON_VIOLATIONS)) {
      expect(violations).toHaveLength(3)
    }
  })

  test('all FIXES arrays have length 4', () => {
    for (const [key, fixes] of Object.entries(FIXES)) {
      expect(fixes).toHaveLength(4)
    }
  })
})

describe('analyzeViolation – case sensitivity', () => {
  test('matches parameter regardless of position in string', () => {
    const result = analyzeViolation('any', 'function has parameter issue')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  test('matches nested regardless of position in string', () => {
    const result = analyzeViolation('any', 'code has nested if')
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  test('matches long regardless of position in string', () => {
    const result = analyzeViolation('any', 'file is long')
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })

  test('matches line regardless of position in string', () => {
    const result = analyzeViolation('any', 'check the line count')
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })

  test('matches depth regardless of position in string', () => {
    const result = analyzeViolation('any', 'depth is too high')
    expect(result.some((s) => s.includes('helper function'))).toBe(true)
  })
})

describe('analyzeViolation – multiple occurrences', () => {
  test('returns single set of suggestions when parameter appears multiple times', () => {
    const result = analyzeViolation('any', 'parameter parameter parameter')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  test('returns single set of suggestions when nested appears multiple times', () => {
    const result = analyzeViolation('any', 'nested nested nested')
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  test('does not duplicate suggestions for parameter+long combination', () => {
    const result = analyzeViolation('any', 'parameter long parameter long')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })
})

describe('analyzeViolation – partial word matches', () => {
  test('matches parameter as part of larger word', () => {
    const result = analyzeViolation('any', 'function has parameters')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  test('matches nested as part of larger word', () => {
    const result = analyzeViolation('any', 'nestedness in code')
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  test('matches long as part of larger word', () => {
    const result = analyzeViolation('any', 'longer than expected')
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })

  test('matches line as part of larger word', () => {
    const result = analyzeViolation('any', 'linear complexity')
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })

  test('matches depth as part of larger word', () => {
    const result = analyzeViolation('any', 'depthness issue')
    expect(result.some((s) => s.includes('helper function'))).toBe(true)
  })
})

describe('analyzeViolation – special characters', () => {
  test('handles violation with special characters', () => {
    const result = analyzeViolation('any', 'parameter issue! @#$')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  test('handles violation with newlines', () => {
    const result = analyzeViolation('any', 'too\nnested\nlong')
    expect(result.some((s) => s.includes('early'))).toBe(true)
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })

  test('handles violation with tabs', () => {
    const result = analyzeViolation('any', 'nested\tlong')
    expect(result.some((s) => s.includes('early'))).toBe(true)
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })
})

describe('analyzeViolation – boundary conditions', () => {
  test('handles single character violation', () => {
    const result = analyzeViolation('any', 'p')
    expect(result).toEqual([
      'Review the rule documentation for specific guidance on this violation',
    ])
  })

  test('handles very long violation string', () => {
    const longString = 'a'.repeat(10000) + ' parameter ' + 'b'.repeat(10000)
    const result = analyzeViolation('any', longString)
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  test('handles unicode characters in violation', () => {
    const result = analyzeViolation('any', 'parameter issue with émojis 🎉')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })
})

describe('formatBestPractices – boundary conditions', () => {
  test('handles logFn that throws', () => {
    const errorLogFn = (msg: string) => {
      if (msg.includes('test')) throw new Error('Test error')
    }
    expect(() => formatBestPractices('max-params', errorLogFn)).not.toThrow()
  })

  test('handles multiple consecutive calls', () => {
    const lines1 = collectLog((logFn) => formatBestPractices('max-params', logFn))
    const lines2 = collectLog((logFn) => formatBestPractices('max-params', logFn))
    expect(lines1).toEqual(lines2)
  })
})

describe('formatCommonViolations – boundary conditions', () => {
  test('handles logFn that throws', () => {
    const errorLogFn = (msg: string) => {
      if (msg.includes('test')) throw new Error('Test error')
    }
    expect(() => formatCommonViolations('max-params', errorLogFn)).not.toThrow()
  })

  test('handles multiple consecutive calls', () => {
    const lines1 = collectLog((logFn) => formatCommonViolations('max-params', logFn))
    const lines2 = collectLog((logFn) => formatCommonViolations('max-params', logFn))
    expect(lines1).toEqual(lines2)
  })
})

describe('formatFixes – boundary conditions', () => {
  test('handles logFn that throws', () => {
    const errorLogFn = (msg: string) => {
      if (msg.includes('test')) throw new Error('Test error')
    }
    expect(() => formatFixes('max-params', errorLogFn)).not.toThrow()
  })

  test('handles multiple consecutive calls', () => {
    const lines1 = collectLog((logFn) => formatFixes('max-params', logFn))
    const lines2 = collectLog((logFn) => formatFixes('max-params', logFn))
    expect(lines1).toEqual(lines2)
  })
})

describe('formatViolationAnalysis – boundary conditions', () => {
  test('handles logFn that throws', () => {
    const errorLogFn = (msg: string) => {
      if (msg.includes('early')) throw new Error('Test error')
    }
    expect(() => formatViolationAnalysis('max-depth', 'nested', errorLogFn)).toThrow()
  })

  test('handles violation with only whitespace', () => {
    const lines = collectLog((logFn) => formatViolationAnalysis('any', '   ', logFn))
    expect(lines).toEqual([
      '  • Review the rule documentation for specific guidance on this violation',
    ])
  })
})

describe('displayWhyOutput – RuleMeta edge cases', () => {
  test('handles RuleMeta with undefined name', () => {
    const meta: RuleMeta = { name: undefined, description: 'test' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Description')
  })

  test('handles RuleMeta with undefined description', () => {
    const meta: RuleMeta = { name: 'test', description: undefined }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Description:')
  })

  test('handles RuleMeta with null-like values', () => {
    const meta: RuleMeta = { name: '', description: '' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).not.toContain('Description:')
  })

  test('handles RuleMeta with very long description', () => {
    const meta: RuleMeta = { description: 'A'.repeat(1000) }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('A'.repeat(1000))
  })
})

describe('displayWhyOutput – violation edge cases', () => {
  test('handles violation with special characters', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, 'Special @#$ %^&*', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Special @#$ %^&*')
  })

  test('handles violation with newlines', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, 'Line 1\nLine 2\nLine 3', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Line 1')
    expect(output).toContain('Line 2')
    expect(output).toContain('Line 3')
  })

  test('handles very long violation message', () => {
    const longViolation = 'X'.repeat(500)
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, longViolation, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain(longViolation)
  })

  test('handles violation with unicode characters', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, 'Error: 🚫 禁止', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('🚫')
    expect(output).toContain('禁止')
  })
})

describe('displayWhyOutput – ruleId edge cases', () => {
  test('handles ruleId with special characters', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('rule/with@special#chars', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('rule/with@special#chars')
  })

  test('handles ruleId with spaces', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('rule with spaces', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('rule with spaces')
  })

  test('handles empty string ruleId', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Rule:')
  })
})

describe('displayWhyOutput – binName edge cases', () => {
  test('handles binName with special characters', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'my-cli@1.0', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('my-cli@1.0 explain test')
  })

  test('handles binName with spaces', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'my cli', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('my cli explain test')
  })

  test('handles empty binName', () => {
    const lines = collectLog((logFn) => displayWhyOutput('test', undefined, undefined, '', logFn))
    const output = lines.join('\n')
    expect(output).toContain('explain test')
  })

  test('handles very long binName', () => {
    const longBinName = 'a'.repeat(200)
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, longBinName, logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain(longBinName)
  })
})

describe('displayWhyOutput – logFn edge cases', () => {
  test('handles logFn that throws', () => {
    let callCount = 0
    const errorLogFn = (msg: string) => {
      callCount++
      if (msg.includes('Common')) throw new Error('Test error')
    }
    expect(() => displayWhyOutput('test', undefined, undefined, 'codeforge', errorLogFn)).toThrow()
    expect(callCount).toBeGreaterThan(0)
  })

  test('handles logFn that mutates message', () => {
    const mutatingLogFn = (msg: string) => {
      return msg.toUpperCase()
    }
    expect(() =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', mutatingLogFn),
    ).not.toThrow()
  })
})

describe('displayWhyOutput – output structure', () => {
  test('always starts with empty line', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    expect(lines[0]).toBe('')
  })

  test('ends with explain command hint', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const lastLine = lines[lines.length - 1]
    expect(lastLine).toContain('explain test')
    expect(lastLine).toContain('more details')
  })

  test('has consistent bullet point formatting', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const bulletLines = lines.filter((l) => l.startsWith('  •'))
    expect(bulletLines.length).toBeGreaterThan(0)
    expect(bulletLines.every((l) => l.startsWith('  • '))).toBe(true)
  })
})

describe('getBestPractices – consistency checks', () => {
  test('returns same result for same ruleId', () => {
    const result1 = getBestPractices('max-params')
    const result2 = getBestPractices('max-params')
    expect(result1).toEqual(result2)
  })

  test('returns different results for different ruleIds', () => {
    const result1 = getBestPractices('max-params')
    const result2 = getBestPractices('max-lines')
    expect(result1).not.toEqual(result2)
  })
})

describe('getCommonViolations – consistency checks', () => {
  test('returns same result for same ruleId', () => {
    const result1 = getCommonViolations('max-params')
    const result2 = getCommonViolations('max-params')
    expect(result1).toEqual(result2)
  })

  test('returns different results for different ruleIds', () => {
    const result1 = getCommonViolations('max-params')
    const result2 = getCommonViolations('max-lines')
    expect(result1).not.toEqual(result2)
  })
})

describe('getFixes – consistency checks', () => {
  test('returns same result for same ruleId', () => {
    const result1 = getFixes('max-params')
    const result2 = getFixes('max-params')
    expect(result1).toEqual(result2)
  })

  test('returns different results for different ruleIds', () => {
    const result1 = getFixes('max-params')
    const result2 = getFixes('max-lines')
    expect(result1).not.toEqual(result2)
  })
})

describe('analyzeViolation – consistency checks', () => {
  test('returns same result for same inputs', () => {
    const result1 = analyzeViolation('test', 'parameter issue')
    const result2 = analyzeViolation('test', 'parameter issue')
    expect(result1).toEqual(result2)
  })

  test('ignores ruleId parameter for result', () => {
    const result1 = analyzeViolation('rule1', 'parameter issue')
    const result2 = analyzeViolation('rule2', 'parameter issue')
    expect(result1).toEqual(result2)
  })
})

describe('displayWhyOutput – full integration', () => {
  test('displays complete output with all sections', () => {
    const meta: RuleMeta = { description: 'Test description' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test-rule', meta, 'Test violation', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Rule:')
    expect(output).toContain('Category:')
    expect(output).toContain('Description')
    expect(output).toContain('Common violations')
    expect(output).toContain('How to fix')
    expect(output).toContain('Your specific violation')
    expect(output).toContain('Best practices')
    expect(output).toContain('explain')
  })

  test('displays minimal output with no metadata', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Rule:')
    expect(output).toContain('Common violations')
    expect(output).toContain('How to fix')
    expect(output).toContain('Best practices')
    expect(output).toContain('explain')
  })
})

describe('analyzeViolation – suggestion content', () => {
  test('includes both parameter suggestions for match', () => {
    const result = analyzeViolation('any', 'too many parameters')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
    expect(result.some((s) => s.includes('default values'))).toBe(true)
  })

  test('includes both nested suggestions for match', () => {
    const result = analyzeViolation('any', 'nested too deep')
    expect(result.some((s) => s.includes('early'))).toBe(true)
    expect(result.some((s) => s.includes('helper function'))).toBe(true)
  })

  test('includes both long suggestions for match', () => {
    const result = analyzeViolation('any', 'function is long')
    expect(result.some((s) => s.includes('separate functions'))).toBe(true)
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })
})

describe('analyzeViolation – keyword overlap scenarios', () => {
  test('parameter before nested in string', () => {
    const result = analyzeViolation('any', 'parameter nested')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  test('nested before parameter in string', () => {
    const result = analyzeViolation('any', 'nested parameter')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  test('all three keywords in one violation', () => {
    const result = analyzeViolation('any', 'parameter nested depth long line')
    expect(result.length).toBeGreaterThanOrEqual(6)
  })
})

describe('format functions – consistent formatting', () => {
  test('formatBestPractices uses consistent bullet', () => {
    const lines = collectLog((logFn) => formatBestPractices('max-params', logFn))
    lines.forEach((line) => {
      expect(line).toMatch(/^  • /)
    })
  })

  test('formatCommonViolations uses consistent bullet', () => {
    const lines = collectLog((logFn) => formatCommonViolations('max-params', logFn))
    lines.forEach((line) => {
      expect(line).toMatch(/^  • /)
    })
  })

  test('formatFixes uses consistent bullet', () => {
    const lines = collectLog((logFn) => formatFixes('max-params', logFn))
    lines.forEach((line) => {
      expect(line).toMatch(/^  • /)
    })
  })

  test('formatViolationAnalysis uses consistent bullet', () => {
    const lines = collectLog((logFn) =>
      formatViolationAnalysis('max-params', 'parameter issue', logFn),
    )
    lines.forEach((line) => {
      expect(line).toMatch(/^  • /)
    })
  })
})

describe('displayWhyOutput – section separators', () => {
  test('has blank line before Common violations', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const violationsIdx = lines.findIndex((l) => l.includes('Common violations'))
    expect(lines[violationsIdx - 1]).toBe('')
  })

  test('has blank line before How to fix', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const fixesIdx = lines.findIndex((l) => l.includes('How to fix'))
    expect(lines[fixesIdx - 1]).toBe('')
  })

  test('has blank line before Best practices', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const practicesIdx = lines.findIndex((l) => l.includes('Best practices'))
    expect(lines[practicesIdx - 1]).toBe('')
  })
})

describe('analyzeViolation – more edge cases', () => {
  test('handles violation with only matched keywords', () => {
    const result = analyzeViolation('any', 'parameter')
    expect(result).toHaveLength(2)
  })

  test('handles violation with mixed case keywords', () => {
    const result = analyzeViolation('any', 'PaRaMeTeR issue')
    expect(result).toEqual([
      'Review the rule documentation for specific guidance on this violation',
    ])
  })

  test('handles parameter with surrounding text', () => {
    const result = analyzeViolation('any', 'The function has parameter problems')
    expect(result.some((s) => s.includes('options object'))).toBe(true)
  })

  test('handles nested with surrounding text', () => {
    const result = analyzeViolation('any', 'Code structure is nested too deep')
    expect(result.some((s) => s.includes('early'))).toBe(true)
  })

  test('handles long with surrounding text', () => {
    const result = analyzeViolation('any', 'This function is way too long')
    expect(result.some((s) => s.includes('modules'))).toBe(true)
  })

  test('handles line with surrounding text', () => {
    const result = analyzeViolation('any', 'line count exceeds the limit')
    expect(result.some((s) => s.includes('deduplicated'))).toBe(true)
  })

  test('handles depth with surrounding text', () => {
    const result = analyzeViolation('any', 'Call stack depth is too high')
    expect(result.some((s) => s.includes('helper function'))).toBe(true)
  })
})

describe('displayWhyOutput – text formatting', () => {
  test('formats ruleId correctly', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('max-params', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Rule: max-params')
  })

  test('formats Category header correctly', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Category:')
  })

  test('formats Description header correctly', () => {
    const meta: RuleMeta = { description: 'Test' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Description:')
  })

  test('formats Common violations header correctly', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Common violations:')
  })

  test('formats How to fix header correctly', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('How to fix:')
  })

  test('formats Your specific violation header correctly', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, 'violation', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Your specific violation:')
  })

  test('formats Best practices header correctly', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Best practices:')
  })
})

describe('displayWhyOutput – description handling', () => {
  test('indents description content', () => {
    const meta: RuleMeta = { description: 'Test description' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('  Test description')
  })

  test('handles multi-line description', () => {
    const meta: RuleMeta = { description: 'Line 1\nLine 2\nLine 3' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Line 1')
    expect(output).toContain('Line 2')
    expect(output).toContain('Line 3')
  })

  test('handles description with special formatting', () => {
    const meta: RuleMeta = { description: 'Use `const` for variables' }
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', meta, undefined, 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('Use `const` for variables')
  })
})

describe('displayWhyOutput – violation handling', () => {
  test('quotes violation message', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, 'test violation', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('"test violation"')
  })

  test('indents violation message', () => {
    const lines = collectLog((logFn) =>
      displayWhyOutput('test', undefined, 'violation', 'codeforge', logFn),
    )
    const output = lines.join('\n')
    expect(output).toContain('  "violation"')
  })

  test('handles empty string violation gracefully', () => {
    const lines = collectLog((logFn) => displayWhyOutput('test', undefined, '', 'codeforge', logFn))
    const output = lines.join('\n')
    expect(output).not.toContain('Your specific violation:')
  })
})

describe('data structure – type consistency', () => {
  test('BEST_PRACTICES values are always arrays', () => {
    for (const value of Object.values(BEST_PRACTICES)) {
      expect(Array.isArray(value)).toBe(true)
    }
  })

  test('COMMON_VIOLATIONS values are always arrays', () => {
    for (const value of Object.values(COMMON_VIOLATIONS)) {
      expect(Array.isArray(value)).toBe(true)
    }
  })

  test('FIXES values are always arrays', () => {
    for (const value of Object.values(FIXES)) {
      expect(Array.isArray(value)).toBe(true)
    }
  })

  test('all BEST_PRACTICES entries have consistent key types', () => {
    for (const key of Object.keys(BEST_PRACTICES)) {
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    }
  })

  test('all COMMON_VIOLATIONS entries have consistent key types', () => {
    for (const key of Object.keys(COMMON_VIOLATIONS)) {
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    }
  })

  test('all FIXES entries have consistent key types', () => {
    for (const key of Object.keys(FIXES)) {
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    }
  })
})
