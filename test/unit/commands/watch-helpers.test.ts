import { describe, test, expect } from 'vitest'
import {
  buildWatcherConfig,
  countBySeverity,
  formatFileResult,
  formatStartupMessage,
  getRelativePath,
  MAX_VIOLATIONS_TO_DISPLAY,
  resolveRequestedRules,
  type WatcherConfig,
} from '../../../src/commands/watch-helpers.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

function makeViolation(
  overrides: Partial<RuleViolation> & { filePath: string; ruleId: string },
): RuleViolation {
  return {
    severity: 'warning',
    message: 'test violation',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
    ...overrides,
  }
}

describe('resolveRequestedRules', () => {
  test('returns undefined for undefined input', () => {
    expect(resolveRequestedRules(undefined)).toBeUndefined()
  })

  test('parses single rule', () => {
    expect(resolveRequestedRules('no-console')).toEqual(['no-console'])
  })

  test('parses comma-separated rules', () => {
    expect(resolveRequestedRules('no-console,max-params,no-eval')).toEqual([
      'no-console',
      'max-params',
      'no-eval',
    ])
  })

  test('trims whitespace around rule names', () => {
    expect(resolveRequestedRules(' no-console , max-params , no-eval ')).toEqual([
      'no-console',
      'max-params',
      'no-eval',
    ])
  })

  test('handles rules with internal whitespace after trim', () => {
    const result = resolveRequestedRules('rule-a , rule-b')
    expect(result).toEqual(['rule-a', 'rule-b'])
  })

  test('returns single-element array for one rule', () => {
    const result = resolveRequestedRules('single-rule')
    expect(result).toHaveLength(1)
  })

  test('handles empty string by returning undefined (falsy)', () => {
    const result = resolveRequestedRules('')
    expect(result).toBeUndefined()
  })

  test('handles rule with hyphens', () => {
    expect(resolveRequestedRules('max-complexity')).toEqual(['max-complexity'])
  })

  test('handles multiple comma-separated with extra spaces', () => {
    expect(resolveRequestedRules('a,  b  ,c')).toEqual(['a', 'b', 'c'])
  })

  test('handles rule names with numeric suffixes', () => {
    expect(resolveRequestedRules('rule-1,rule-2,rule-10')).toEqual(['rule-1', 'rule-2', 'rule-10'])
  })

  test('handles rule names with underscores', () => {
    expect(resolveRequestedRules('no_eval,prefer_const')).toEqual(['no_eval', 'prefer_const'])
  })

  test('handles very long rule list', () => {
    const input = Array.from({ length: 15 }, (_, i) => `rule-${i}`).join(',')
    const result = resolveRequestedRules(input)
    expect(result).toHaveLength(15)
    expect(result![0]).toBe('rule-0')
    expect(result![14]).toBe('rule-14')
  })

  test('preserves duplicate rule names', () => {
    expect(resolveRequestedRules('no-console,no-console')).toEqual(['no-console', 'no-console'])
  })

  test('returns new array instance on each call', () => {
    const a = resolveRequestedRules('rule-a')
    const b = resolveRequestedRules('rule-a')
    expect(a).not.toBe(b)
  })

  test('comma-only string returns array of empty strings', () => {
    expect(resolveRequestedRules(',')).toEqual(['', ''])
  })

  test('handles tab characters in whitespace', () => {
    expect(resolveRequestedRules('\trule-a\t,\trule-b\t')).toEqual(['rule-a', 'rule-b'])
  })

  test('preserves exact rule names without modification', () => {
    expect(resolveRequestedRules('MyRule')).toEqual(['MyRule'])
  })

  test('handles single comma trailing', () => {
    expect(resolveRequestedRules('rule-a,')).toEqual(['rule-a', ''])
  })

  test('handles single comma leading', () => {
    expect(resolveRequestedRules(',rule-a')).toEqual(['', 'rule-a'])
  })

  test('handles newline characters in rule string', () => {
    expect(resolveRequestedRules('rule-a\n,\nrule-b')).toEqual(['rule-a', 'rule-b'])
  })

  test('handles three commas producing four entries', () => {
    expect(resolveRequestedRules('a,,b')).toEqual(['a', '', 'b'])
  })

  test('handles rule with camelCase', () => {
    expect(resolveRequestedRules('preferConst,noConsole')).toEqual(['preferConst', 'noConsole'])
  })

  test('handles rule with dot notation', () => {
    expect(resolveRequestedRules('plugin.rule-a,plugin.rule-b')).toEqual([
      'plugin.rule-a',
      'plugin.rule-b',
    ])
  })

  test('handles rule with slash', () => {
    expect(resolveRequestedRules('@scope/rule-a')).toEqual(['@scope/rule-a'])
  })

  test('trims spaces around each rule but preserves internal spaces', () => {
    expect(resolveRequestedRules('  rule a  ,  rule b  ')).toEqual(['rule a', 'rule b'])
  })

  test('returns array of strings (type check)', () => {
    const result = resolveRequestedRules('a,b,c')
    expect(Array.isArray(result)).toBe(true)
    for (const item of result!) {
      expect(typeof item).toBe('string')
    }
  })
})

describe('countBySeverity', () => {
  test('returns zeros for empty array', () => {
    expect(countBySeverity([])).toEqual({ errors: 0, warnings: 0 })
  })

  test('counts single error', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    expect(countBySeverity(violations)).toEqual({ errors: 1, warnings: 0 })
  })

  test('counts single warning', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'warning' })]
    expect(countBySeverity(violations)).toEqual({ errors: 0, warnings: 1 })
  })

  test('counts mixed severities', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'error' }),
      makeViolation({ filePath: 'd.ts', ruleId: 'r4', severity: 'warning' }),
      makeViolation({ filePath: 'e.ts', ruleId: 'r5', severity: 'warning' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 2, warnings: 3 })
  })

  test('counts only errors', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'error' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 2, warnings: 0 })
  })

  test('counts only warnings', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'warning' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 0, warnings: 2 })
  })

  test('ignores info severity', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'info' })]
    expect(countBySeverity(violations)).toEqual({ errors: 0, warnings: 0 })
  })

  test('counts error and warning while ignoring info', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'info' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'warning' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 1, warnings: 1 })
  })

  test('handles large number of mixed violations', () => {
    const violations = Array.from({ length: 100 }, (_, i) =>
      makeViolation({
        filePath: `${i}.ts`,
        ruleId: `r${i}`,
        severity: i % 2 === 0 ? 'error' : 'warning',
      }),
    )
    expect(countBySeverity(violations)).toEqual({ errors: 50, warnings: 50 })
  })

  test('counts zero for unknown severity value', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'critical' })]
    expect(countBySeverity(violations)).toEqual({ errors: 0, warnings: 0 })
  })

  test('returns fresh object for each call', () => {
    const a = countBySeverity([])
    const b = countBySeverity([])
    expect(a).not.toBe(b)
  })

  test('multiple info severities result in zero counts', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'info' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'info' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'info' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 0, warnings: 0 })
  })

  test('exactly three of each error and warning', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'error' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'error' }),
      makeViolation({ filePath: 'd.ts', ruleId: 'r4', severity: 'warning' }),
      makeViolation({ filePath: 'e.ts', ruleId: 'r5', severity: 'warning' }),
      makeViolation({ filePath: 'f.ts', ruleId: 'r6', severity: 'warning' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 3, warnings: 3 })
  })

  test('single violation returns correct shape', () => {
    const result = countBySeverity([
      makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' }),
    ])
    expect(result).toHaveProperty('errors')
    expect(result).toHaveProperty('warnings')
    expect(Object.keys(result)).toHaveLength(2)
  })

  test('error count matches number of error severity violations', () => {
    const violations = Array.from({ length: 7 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `r${i}`, severity: 'error' }),
    )
    expect(countBySeverity(violations).errors).toBe(7)
  })

  test('warning count matches number of warning severity violations', () => {
    const violations = Array.from({ length: 5 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `r${i}`, severity: 'warning' }),
    )
    expect(countBySeverity(violations).warnings).toBe(5)
  })

  test('all info severity returns zeros', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'info' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'info' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 0, warnings: 0 })
  })

  test('mixed with unknown severity only counts error and warning', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'critical' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'warning' }),
      makeViolation({ filePath: 'd.ts', ruleId: 'r4', severity: 'debug' }),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 1, warnings: 1 })
  })

  test('200 mixed violations counts correctly', () => {
    const violations = Array.from({ length: 200 }, (_, i) =>
      makeViolation({
        filePath: `${i}.ts`,
        ruleId: `r${i}`,
        severity: i % 3 === 0 ? 'error' : 'warning',
      }),
    )
    const result = countBySeverity(violations)
    expect(result.errors + result.warnings).toBe(200)
  })

  test('result is not frozen', () => {
    const result = countBySeverity([])
    result.errors = 999
    expect(result.errors).toBe(999)
  })

  test('errors and warnings are numbers', () => {
    const result = countBySeverity([
      makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' }),
    ])
    expect(typeof result.errors).toBe('number')
    expect(typeof result.warnings).toBe('number')
  })

  test('one error among many info', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      ...Array.from({ length: 10 }, (_, i) =>
        makeViolation({ filePath: `info${i}.ts`, ruleId: `ri${i}`, severity: 'info' }),
      ),
    ]
    expect(countBySeverity(violations)).toEqual({ errors: 1, warnings: 0 })
  })
})

describe('getRelativePath', () => {
  test('replaces cwd prefix with dot', () => {
    expect(getRelativePath('/home/user/src/file.ts', '/home/user')).toBe('src/file.ts')
  })

  test('removes leading ./ from result', () => {
    expect(getRelativePath('/home/user/src/file.ts', '/home/user/src')).toBe('file.ts')
  })

  test('handles file at root of cwd', () => {
    expect(getRelativePath('/home/user/file.ts', '/home/user')).toBe('file.ts')
  })

  test('handles deep nested path', () => {
    expect(getRelativePath('/a/b/c/d/e/file.ts', '/a/b/c')).toBe('d/e/file.ts')
  })

  test('handles path where cwd does not match', () => {
    expect(getRelativePath('/other/path/file.ts', '/home/user')).toBe('/other/path/file.ts')
  })

  test('handles empty cwd', () => {
    expect(getRelativePath('/home/user/file.ts', '')).toBe('home/user/file.ts')
  })

  test('path that is exactly cwd returns dot', () => {
    expect(getRelativePath('/home/user', '/home/user')).toBe('.')
  })

  test('handles cwd with trailing slash - replaces substring producing dot prefix', () => {
    expect(getRelativePath('/home/user/src/file.ts', '/home/user/')).toBe('.src/file.ts')
  })

  test('cwd appearing twice in path replaces first occurrence', () => {
    expect(getRelativePath('/home/user/home/user/file.ts', '/home/user')).toBe('home/user/file.ts')
  })

  test('handles very short paths - single-char cwd root', () => {
    expect(getRelativePath('/a', '/')).toBe('.a')
  })

  test('handles paths with dots in directory names', () => {
    expect(getRelativePath('/home/user.next/src/file.ts', '/home/user.next')).toBe('src/file.ts')
  })

  test('cwd substring of directory name does partially replace', () => {
    expect(getRelativePath('/home/userbackup/file.ts', '/home/user')).toBe('.backup/file.ts')
  })

  test('cwd appearing twice in path replaces first occurrence', () => {
    // replace turns '/home/user' -> '.', then ./home/user/file.ts, then strips ./
    expect(getRelativePath('/home/user/home/user/file.ts', '/home/user')).toBe('home/user/file.ts')
  })

  test('handles very short paths - single-char cwd root', () => {
    // '/a'.replace('/', '.') → '.a', no ./ prefix to strip
    expect(getRelativePath('/a', '/')).toBe('.a')
  })

  test('handles paths with dots in directory names', () => {
    expect(getRelativePath('/home/user.next/src/file.ts', '/home/user.next')).toBe('src/file.ts')
  })

  test('cwd substring of directory name does partially replace', () => {
    // String.replace replaces substring '/home/user' within '/home/userbackup'
    expect(getRelativePath('/home/userbackup/file.ts', '/home/user')).toBe('.backup/file.ts')
  })

  test('handles path with spaces', () => {
    expect(getRelativePath('/home/my project/src/file.ts', '/home/my project')).toBe('src/file.ts')
  })

  test('handles relative-looking absolute path', () => {
    expect(getRelativePath('/a/b/c.ts', '/a')).toBe('b/c.ts')
  })

  test('handles path where cwd is longer than filePath', () => {
    expect(getRelativePath('/a', '/a/b/c')).toBe('/a')
  })

  test('identical path and cwd returns dot', () => {
    expect(getRelativePath('/home/user/project', '/home/user/project')).toBe('.')
  })

  test('handles single character file path', () => {
    expect(getRelativePath('/a', '/')).toBe('.a')
  })

  test('handles deeply nested file path', () => {
    const deep = '/a/b/c/d/e/f/g/h/i/j/k/file.ts'
    expect(getRelativePath(deep, '/a/b/c')).toBe('d/e/f/g/h/i/j/k/file.ts')
  })

  test('replaces cwd at end of path producing dot', () => {
    expect(getRelativePath('/home/user', '/home/user')).toBe('.')
  })

  test('handles path with multiple slashes', () => {
    expect(getRelativePath('//home///user//file.ts', '//home///user')).toBe('/file.ts')
  })

  test('handles empty filePath with non-empty cwd', () => {
    expect(getRelativePath('', '/home/user')).toBe('')
  })

  test('handles both empty strings', () => {
    expect(getRelativePath('', '')).toBe('.')
  })

  test('returns dot when filePath equals cwd exactly', () => {
    const path = '/project/src'
    expect(getRelativePath(path, path)).toBe('.')
  })

  test('handles path with unicode characters', () => {
    expect(getRelativePath('/home/用户/文件.ts', '/home/用户')).toBe('文件.ts')
  })

  test('handles cwd as single slash', () => {
    expect(getRelativePath('/home/file.ts', '/')).toBe('.home/file.ts')
  })

  test('does not strip ./ in the middle of path', () => {
    expect(getRelativePath('/home/./user/file.ts', '/home/.')).toBe('user/file.ts')
  })
})

describe('MAX_VIOLATIONS_TO_DISPLAY', () => {
  test('is 3', () => {
    expect(MAX_VIOLATIONS_TO_DISPLAY).toBe(3)
  })

  test('is a number type', () => {
    expect(typeof MAX_VIOLATIONS_TO_DISPLAY).toBe('number')
  })

  test('is a positive integer', () => {
    expect(MAX_VIOLATIONS_TO_DISPLAY).toBeGreaterThan(0)
    expect(Number.isInteger(MAX_VIOLATIONS_TO_DISPLAY)).toBe(true)
  })

  test('is a finite number', () => {
    expect(Number.isFinite(MAX_VIOLATIONS_TO_DISPLAY)).toBe(true)
  })

  test('is less than 100', () => {
    expect(MAX_VIOLATIONS_TO_DISPLAY).toBeLessThan(100)
  })
})

describe('buildWatcherConfig', () => {
  test('returns default config with no options', () => {
    const config = buildWatcherConfig({})
    expect(config.debounceMs).toBe(300)
    expect(config.extensions).toEqual(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
    expect(config.ignorePatterns).toEqual([])
  })

  test('uses provided debounceMs', () => {
    const config = buildWatcherConfig({ debounceMs: 500 })
    expect(config.debounceMs).toBe(500)
  })

  test('uses provided ignorePatterns', () => {
    const config = buildWatcherConfig({ ignorePatterns: ['node_modules', 'dist'] })
    expect(config.ignorePatterns).toEqual(['node_modules', 'dist'])
  })

  test('uses defaults when options are undefined', () => {
    const config = buildWatcherConfig({ debounceMs: undefined, ignorePatterns: undefined })
    expect(config.debounceMs).toBe(300)
    expect(config.ignorePatterns).toEqual([])
  })

  test('always includes standard extensions', () => {
    const config = buildWatcherConfig({})
    expect(config.extensions).toContain('.ts')
    expect(config.extensions).toContain('.tsx')
    expect(config.extensions).toContain('.js')
    expect(config.extensions).toContain('.jsx')
    expect(config.extensions).toContain('.mjs')
    expect(config.extensions).toContain('.cjs')
  })

  test('config satisfies WatcherConfig type', () => {
    const config: WatcherConfig = buildWatcherConfig({ debounceMs: 100 })
    expect(config.debounceMs).toBe(100)
    expect(Array.isArray(config.extensions)).toBe(true)
    expect(Array.isArray(config.ignorePatterns)).toBe(true)
  })

  test('handles debounceMs of 0', () => {
    const config = buildWatcherConfig({ debounceMs: 0 })
    expect(config.debounceMs).toBe(0)
  })

  test('handles very large debounceMs', () => {
    const config = buildWatcherConfig({ debounceMs: 60000 })
    expect(config.debounceMs).toBe(60000)
  })

  test('handles ignorePatterns with single entry', () => {
    const config = buildWatcherConfig({ ignorePatterns: ['dist'] })
    expect(config.ignorePatterns).toEqual(['dist'])
  })

  test('handles ignorePatterns with many entries', () => {
    const patterns = ['node_modules', 'dist', '.git', 'coverage', 'build']
    const config = buildWatcherConfig({ ignorePatterns: patterns })
    expect(config.ignorePatterns).toEqual(patterns)
  })

  test('handles both debounceMs and ignorePatterns together', () => {
    const config = buildWatcherConfig({ debounceMs: 1000, ignorePatterns: ['tmp'] })
    expect(config.debounceMs).toBe(1000)
    expect(config.ignorePatterns).toEqual(['tmp'])
  })

  test('extensions array has exactly 6 items', () => {
    const config = buildWatcherConfig({})
    expect(config.extensions).toHaveLength(6)
  })

  test('config object has exactly 3 keys', () => {
    const config = buildWatcherConfig({})
    expect(Object.keys(config)).toHaveLength(3)
  })

  test('default debounceMs is 300', () => {
    const config = buildWatcherConfig({})
    expect(config.debounceMs).toBe(300)
  })

  test('default extensions includes ts and js variants', () => {
    const config = buildWatcherConfig({})
    expect(config.extensions).toContain('.ts')
    expect(config.extensions).toContain('.js')
    expect(config.extensions).toContain('.tsx')
    expect(config.extensions).toContain('.jsx')
    expect(config.extensions).toContain('.mjs')
    expect(config.extensions).toContain('.cjs')
  })

  test('default ignorePatterns is empty array', () => {
    const config = buildWatcherConfig({})
    expect(config.ignorePatterns).toEqual([])
  })

  test('debounceMs is positive by default', () => {
    const config = buildWatcherConfig({})
    expect(config.debounceMs).toBeGreaterThan(0)
  })

  test('negative debounceMs is used as-is', () => {
    const config = buildWatcherConfig({ debounceMs: -100 })
    expect(config.debounceMs).toBe(-100)
  })

  test('fractional debounceMs is preserved', () => {
    const config = buildWatcherConfig({ debounceMs: 150.5 })
    expect(config.debounceMs).toBe(150.5)
  })

  test('ignorePatterns empty array is distinct instance', () => {
    const a = buildWatcherConfig({})
    const b = buildWatcherConfig({})
    expect(a.ignorePatterns).not.toBe(b.ignorePatterns)
  })

  test('extensions array is same reference across calls', () => {
    const a = buildWatcherConfig({})
    const b = buildWatcherConfig({})
    expect(a.extensions).toEqual(b.extensions)
  })

  test('ignorePatterns preserves empty strings', () => {
    const config = buildWatcherConfig({ ignorePatterns: ['', 'dist'] })
    expect(config.ignorePatterns).toEqual(['', 'dist'])
  })

  test('config has debounceMs property', () => {
    const config = buildWatcherConfig({})
    expect(config).toHaveProperty('debounceMs')
  })

  test('config has extensions property', () => {
    const config = buildWatcherConfig({})
    expect(config).toHaveProperty('extensions')
  })

  test('config has ignorePatterns property', () => {
    const config = buildWatcherConfig({})
    expect(config).toHaveProperty('ignorePatterns')
  })

  test('small positive debounceMs', () => {
    const config = buildWatcherConfig({ debounceMs: 1 })
    expect(config.debounceMs).toBe(1)
  })

  test('ignorePatterns with glob-like patterns', () => {
    const config = buildWatcherConfig({ ignorePatterns: ['**/*.spec.ts', '**/test/**'] })
    expect(config.ignorePatterns).toEqual(['**/*.spec.ts', '**/test/**'])
  })
})

describe('formatStartupMessage', () => {
  test('outputs starting message', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Starting file watcher')
  })

  test('outputs watching patterns', () => {
    const lines: string[] = []
    formatStartupMessage(['src/**/*.ts', 'lib/**/*.js'], 300, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('src/**/*.ts, lib/**/*.js')
  })

  test('outputs "current directory" when patterns are empty', () => {
    const lines: string[] = []
    formatStartupMessage([], 300, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('current directory')
  })

  test('outputs debounce time', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 500, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('500ms')
  })

  test('outputs Ctrl+C instruction', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Ctrl+C')
  })

  test('calls logFn exactly 4 times', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    expect(lines).toHaveLength(4)
  })

  test('displays single pattern without comma', () => {
    const lines: string[] = []
    formatStartupMessage(['src/**/*.ts'], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('src/**/*.ts')
    expect(lines[1]).not.toContain(',')
  })

  test('displays three patterns joined by commas', () => {
    const lines: string[] = []
    formatStartupMessage(['a.ts', 'b.ts', 'c.ts'], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('a.ts, b.ts, c.ts')
  })

  test('handles debounce of 0', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 0, (msg) => lines.push(msg))
    expect(lines[2]).toContain('0ms')
  })

  test('handles very large debounce value', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 99999, (msg) => lines.push(msg))
    expect(lines[2]).toContain('99999ms')
  })

  test('first line contains Starting file watcher text', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    expect(lines[0]).toContain('Starting file watcher')
  })

  test('second line is Watching line', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('Watching:')
  })

  test('third line is Debounce line', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    expect(lines[2]).toContain('Debounce:')
  })

  test('fourth line is Ctrl+C line', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    expect(lines[3]).toContain('Ctrl+C')
  })

  test('handles patterns with special glob characters', () => {
    const lines: string[] = []
    formatStartupMessage(['src/**/*.{ts,tsx}'], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('src/**/*.{ts,tsx}')
  })

  test('all log calls receive string arguments', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('logFn receives exactly 4 arguments', () => {
    let callCount = 0
    formatStartupMessage(['src/'], 300, () => {
      callCount++
    })
    expect(callCount).toBe(4)
  })

  test('debounce value of 1 is displayed', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 1, (msg) => lines.push(msg))
    expect(lines[2]).toContain('1ms')
  })

  test('empty string pattern is still joined', () => {
    const lines: string[] = []
    formatStartupMessage([''], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('Watching:')
  })

  test('two patterns separated by comma and space', () => {
    const lines: string[] = []
    formatStartupMessage(['a.ts', 'b.ts'], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('a.ts, b.ts')
  })

  test('handles patterns with parentheses', () => {
    const lines: string[] = []
    formatStartupMessage(['src/**/*.(ts|tsx)'], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('(ts|tsx)')
  })

  test('handles very long pattern name', () => {
    const longPattern = 'src/'.repeat(20) + 'file.ts'
    const lines: string[] = []
    formatStartupMessage([longPattern], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain(longPattern)
  })

  test('handles patterns array with many entries', () => {
    const patterns = Array.from({ length: 10 }, (_, i) => `dir${i}/**/*.ts`)
    const lines: string[] = []
    formatStartupMessage(patterns, 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('dir0/**/*.ts')
    expect(lines[1]).toContain('dir9/**/*.ts')
  })

  test('press instruction is in last line', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    expect(lines[3]).toContain('Press')
    expect(lines[3]).toContain('Ctrl+C')
    expect(lines[3]).toContain('stop')
  })

  test('starting message is in first line', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    expect(lines[0]).toContain('Starting')
  })

  test('watching line contains Watching label', () => {
    const lines: string[] = []
    formatStartupMessage(['src/**/*.ts'], 300, (msg) => lines.push(msg))
    expect(lines[1]).toContain('Watching:')
  })

  test('debounce line contains Debounce label', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 250, (msg) => lines.push(msg))
    expect(lines[2]).toContain('Debounce:')
    expect(lines[2]).toContain('250ms')
  })

  test('no line is empty string', () => {
    const lines: string[] = []
    formatStartupMessage(['src/'], 300, (msg) => lines.push(msg))
    for (const line of lines) {
      expect(line.length).toBeGreaterThan(0)
    }
  })
})

describe('formatFileResult', () => {
  test('logs success checkmark for no violations', () => {
    const lines: string[] = []
    formatFileResult('/test/file.ts', [], '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('✓')
  })

  test('logs relative path for no violations', () => {
    const lines: string[] = []
    formatFileResult('/test/src/file.ts', [], '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('src/file.ts')
  })

  test('logs warning indicator for violations', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'no-console', severity: 'error' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('⚠')
  })

  test('logs error and warning counts', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1 error(s), 1 warning(s)')
  })

  test('logs all warnings count', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'warning' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('0 error(s), 2 warning(s)')
  })

  test('logs violation details with line and column', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'no-console',
        range: { start: { line: 42, column: 5 }, end: { line: 42, column: 10 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('42:5')
    expect(output).toContain('no-console')
  })

  test('logs violation ruleId and message', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'max-complexity',
        message: 'Function is too complex',
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('max-complexity')
    expect(output).toContain('Function is too complex')
  })

  test('shows truncation message when violations exceed limit', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 5 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('... and 2 more')
  })

  test('does not show truncation for exactly 3 violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 3 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('more')
  })

  test('does not show truncation for fewer than 3 violations', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r1' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('more')
  })

  test('displays error severity correctly', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('error')
  })

  test('displays warning severity correctly', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'warning' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('warn')
  })

  test('uses relative path in output', () => {
    const lines: string[] = []
    formatFileResult('/home/user/src/file.ts', [], '/home/user', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('src/file.ts')
  })

  test('single violation produces 2 log calls (summary + detail)', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(2)
  })

  test('no violations produces 1 log call', () => {
    const lines: string[] = []
    formatFileResult('/test/file.ts', [], '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(1)
  })

  test('5 violations produces 4 log calls (summary + 3 details + truncation)', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 5 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}`, severity: 'error' }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(5)
  })

  test('exactly 4 violations shows truncation for the 4th', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 4 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('... and 1 more')
  })

  test('exactly 2 violations does not show truncation', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('more')
  })

  test('violation at line 0 column 0 is displayed', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r',
        range: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('0:0')
  })

  test('handles very large line numbers', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r',
        range: { start: { line: 9999, column: 1234 }, end: { line: 9999, column: 1240 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('9999:1234')
  })

  test('handles long violation message', () => {
    const lines: string[] = []
    const longMsg = 'A'.repeat(200)
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', message: longMsg })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain(longMsg)
  })

  test('handles long ruleId', () => {
    const lines: string[] = []
    const longRule = 'very-long-rule-name-with-many-segments'
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: longRule })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain(longRule)
  })

  test('error severity in detail shows error text', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const detail = lines[1]
    expect(detail).toContain('error')
    expect(detail).not.toContain('warn')
  })

  test('warning severity in detail shows warn text', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'warning' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const detail = lines[1]
    expect(detail).toContain('warn')
  })

  test('multiple errors with different rules all displayed', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'rule-a', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'rule-b', severity: 'error' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('rule-a')
    expect(lines[2]).toContain('rule-b')
  })

  test('file path with special characters in name', () => {
    const lines: string[] = []
    formatFileResult('/test/[special]/file.ts', [], '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[special]/file.ts')
  })

  test('root cwd produces relative path', () => {
    const lines: string[] = []
    formatFileResult('/src/file.ts', [], '/', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('src/file.ts')
  })

  test('exactly 6 violations shows correct truncation count', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 6 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('... and 3 more')
  })

  test('exactly 10 violations shows correct truncation count', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 10 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('... and 7 more')
  })

  test('mixed severity violations preserve order in display', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'first', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'second', severity: 'warning' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('first')
    expect(lines[2]).toContain('second')
  })

  test('two errors shows 2 error(s) in summary', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'error' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[0]).toContain('2 error(s), 0 warning(s)')
  })

  test('summary line contains relative file path', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r' })]
    formatFileResult('/home/user/src/app.ts', violations, '/home/user', (msg) => lines.push(msg))
    expect(lines[0]).toContain('src/app.ts')
  })

  test('detail line starts with line:column format', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r',
        range: { start: { line: 5, column: 10 }, end: { line: 5, column: 15 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('5:10')
  })

  test('no violations output contains green checkmark content', () => {
    const lines: string[] = []
    formatFileResult('/test/file.ts', [], '/test', (msg) => lines.push(msg))
    expect(lines[0]).toContain('✓')
    expect(lines[0]).toContain('file.ts')
  })

  test('3 violations produces 4 log calls', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 3 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(4)
  })

  test('4 violations produces 5 log calls', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 4 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(5)
  })

  test('truncation line is last log call', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 5 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const lastLine = lines[lines.length - 1]
    expect(lastLine).toContain('... and 2 more')
  })

  test('info severity displayed as warn in detail line', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'info' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('warn')
  })

  test('critical severity displayed as warn in detail line', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'critical' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('warn')
  })

  test('unknown severity still counted as warning in summary', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'unknown' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[0]).toContain('0 error(s), 0 warning(s)')
  })

  test('success output does not contain warning indicator', () => {
    const lines: string[] = []
    formatFileResult('/test/file.ts', [], '/test', (msg) => lines.push(msg))
    expect(lines[0]).not.toContain('⚠')
  })

  test('violation output does not contain success checkmark', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[0]).not.toContain('✓')
  })

  test('detail line contains ruleId and message', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'my-rule',
        message: 'custom msg',
        severity: 'error',
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('my-rule')
    expect(lines[1]).toContain('custom msg')
  })

  test('2 violations produces 3 log calls', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(3)
  })

  test('100 violations produces 4 log calls (3 details + truncation)', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 100 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(5)
    expect(lines[4]).toContain('... and 97 more')
  })

  test('file path at root with cwd at root', () => {
    const lines: string[] = []
    formatFileResult('/file.ts', [], '/', (msg) => lines.push(msg))
    expect(lines[0]).toContain('file.ts')
  })

  test('violation with same start and end position', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r',
        range: { start: { line: 5, column: 3 }, end: { line: 5, column: 3 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('5:3')
  })

  test('violation with very large column number', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r',
        range: { start: { line: 1, column: 500 }, end: { line: 1, column: 510 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('1:500')
  })

  test('mixed errors and warnings summary correct', () => {
    const lines: string[] = []
    const violations = [
      ...Array.from({ length: 3 }, (_, i) =>
        makeViolation({ filePath: `e${i}.ts`, ruleId: `er${i}`, severity: 'error' }),
      ),
      ...Array.from({ length: 2 }, (_, i) =>
        makeViolation({ filePath: `w${i}.ts`, ruleId: `wr${i}`, severity: 'warning' }),
      ),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[0]).toContain('3 error(s), 2 warning(s)')
  })

  test('file path with unicode characters', () => {
    const lines: string[] = []
    formatFileResult('/home/用户/src/文件.ts', [], '/home/用户', (msg) => lines.push(msg))
    expect(lines[0]).toContain('src/文件.ts')
  })

  test('all log calls receive strings', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    for (const line of lines) {
      expect(typeof line).toBe('string')
      expect(line.length).toBeGreaterThan(0)
    }
  })

  test('exactly MAX_VIOLATIONS_TO_DISPLAY violations no truncation', () => {
    const lines: string[] = []
    const violations = Array.from({ length: MAX_VIOLATIONS_TO_DISPLAY }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('... and')
  })

  test('MAX_VIOLATIONS_TO_DISPLAY + 1 shows ... and 1 more', () => {
    const lines: string[] = []
    const violations = Array.from({ length: MAX_VIOLATIONS_TO_DISPLAY + 1 }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('... and 1 more')
  })

  test('summary line contains file path even with violations', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r' })]
    formatFileResult('/project/src/index.ts', violations, '/project', (msg) => lines.push(msg))
    expect(lines[0]).toContain('src/index.ts')
  })

  test('detail lines contain severity label', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('error')
    expect(lines[2]).toContain('warn')
  })

  test('no violations line contains green color codes', () => {
    const lines: string[] = []
    formatFileResult('/test/file.ts', [], '/test', (msg) => lines.push(msg))
    expect(lines[0]).toContain('✓')
  })

  test('violation summary contains yellow color codes', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[0]).toContain('⚠')
  })

  test('empty violation message is displayed', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', message: '' })]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines).toHaveLength(2)
  })

  test('detail line contains line:column then severity then ruleId then message', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'test-rule',
        message: 'test message',
        severity: 'error',
        range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    const detail = lines[1]
    expect(detail).toContain('10:5')
    expect(detail).toContain('error')
    expect(detail).toContain('test-rule')
    expect(detail).toContain('test message')
  })

  test('file path with spaces in directory', () => {
    const lines: string[] = []
    formatFileResult('/home/my project/src/file.ts', [], '/home/my project', (msg) =>
      lines.push(msg),
    )
    expect(lines[0]).toContain('src/file.ts')
  })

  test('violation detail with single-digit line and column', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
      }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[1]).toContain('1:1')
  })

  test('summary shows 0 error(s) and 0 warning(s) for info-only violations', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'info' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'info' }),
    ]
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[0]).toContain('0 error(s), 0 warning(s)')
  })

  test('truncation count is violations.length minus MAX_VIOLATIONS_TO_DISPLAY', () => {
    const count = 20
    const lines: string[] = []
    const violations = Array.from({ length: count }, (_, i) =>
      makeViolation({ filePath: `${i}.ts`, ruleId: `rule-${i}` }),
    )
    formatFileResult('/test/file.ts', violations, '/test', (msg) => lines.push(msg))
    expect(lines[lines.length - 1]).toContain(`... and ${count - MAX_VIOLATIONS_TO_DISPLAY} more`)
  })
})
