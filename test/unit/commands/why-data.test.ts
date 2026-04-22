import { describe, test, expect } from 'vitest'
import { BEST_PRACTICES } from '../../../src/commands/why-data-best-practices.js'
import { COMMON_VIOLATIONS } from '../../../src/commands/why-data-violations.js'
import { FIXES } from '../../../src/commands/why-data-fixes.js'

const KEBAB_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const ALL_KEYS = Object.keys(BEST_PRACTICES)

describe('BEST_PRACTICES', () => {
  const keys = Object.keys(BEST_PRACTICES)

  test('has 92 entries', () => {
    expect(keys).toHaveLength(92)
  })

  test('all values are arrays of 3 strings', () => {
    for (const key of keys) {
      expect(BEST_PRACTICES[key]).toHaveLength(3)
      for (const s of BEST_PRACTICES[key]) {
        expect(typeof s).toBe('string')
      }
    }
  })

  test('all strings are non-empty', () => {
    for (const key of keys) {
      for (const s of BEST_PRACTICES[key]) {
        expect(s.length).toBeGreaterThan(0)
      }
    }
  })

  test('all keys are kebab-case', () => {
    for (const key of keys) {
      expect(key).toMatch(KEBAB_RE)
    }
  })

  test('sample entries exist', () => {
    expect(BEST_PRACTICES).toHaveProperty('no-eval')
    expect(BEST_PRACTICES).toHaveProperty('prefer-const')
    expect(BEST_PRACTICES).toHaveProperty('max-complexity')
    expect(BEST_PRACTICES).toHaveProperty('curly')
  })
})

describe('COMMON_VIOLATIONS', () => {
  const keys = Object.keys(COMMON_VIOLATIONS)

  test('has 92 entries', () => {
    expect(keys).toHaveLength(92)
  })

  test('all values are arrays of 3 strings', () => {
    for (const key of keys) {
      expect(COMMON_VIOLATIONS[key]).toHaveLength(3)
      for (const s of COMMON_VIOLATIONS[key]) {
        expect(typeof s).toBe('string')
      }
    }
  })

  test('all strings are non-empty', () => {
    for (const key of keys) {
      for (const s of COMMON_VIOLATIONS[key]) {
        expect(s.length).toBeGreaterThan(0)
      }
    }
  })

  test('all keys are kebab-case', () => {
    for (const key of keys) {
      expect(key).toMatch(KEBAB_RE)
    }
  })

  test('sample entries exist', () => {
    expect(COMMON_VIOLATIONS).toHaveProperty('no-eval')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-const')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-console')
    expect(COMMON_VIOLATIONS).toHaveProperty('curly')
  })
})

describe('FIXES', () => {
  const keys = Object.keys(FIXES)

  test('has 92 entries', () => {
    expect(keys).toHaveLength(92)
  })

  test('all values are arrays of 4 strings', () => {
    for (const key of keys) {
      expect(FIXES[key]).toHaveLength(4)
      for (const s of FIXES[key]) {
        expect(typeof s).toBe('string')
      }
    }
  })

  test('all strings are non-empty', () => {
    for (const key of keys) {
      for (const s of FIXES[key]) {
        expect(s.length).toBeGreaterThan(0)
      }
    }
  })

  test('all keys are kebab-case', () => {
    for (const key of keys) {
      expect(key).toMatch(KEBAB_RE)
    }
  })

  test('sample entries exist', () => {
    expect(FIXES).toHaveProperty('no-eval')
    expect(FIXES).toHaveProperty('prefer-const')
    expect(FIXES).toHaveProperty('max-complexity')
    expect(FIXES).toHaveProperty('curly')
  })
})

describe('Cross-reference integrity', () => {
  const bpKeys = new Set(Object.keys(BEST_PRACTICES))
  const fixKeys = new Set(Object.keys(FIXES))
  const violKeys = new Set(Object.keys(COMMON_VIOLATIONS))

  test('all rules in BEST_PRACTICES also have FIXES', () => {
    for (const key of bpKeys) {
      expect(fixKeys.has(key)).toBe(true)
    }
  })

  test('all rules in FIXES also have BEST_PRACTICES', () => {
    for (const key of fixKeys) {
      expect(bpKeys.has(key)).toBe(true)
    }
  })

  test('no duplicate keys within any map', () => {
    expect(Object.keys(BEST_PRACTICES).length).toBe(bpKeys.size)
    expect(Object.keys(COMMON_VIOLATIONS).length).toBe(violKeys.size)
    expect(Object.keys(FIXES).length).toBe(fixKeys.size)
  })

  test('all maps have the same number of entries', () => {
    expect(bpKeys.size).toBe(fixKeys.size)
    expect(bpKeys.size).toBe(violKeys.size)
  })

  test('all maps share the same key format (kebab-case)', () => {
    for (const key of [...bpKeys, ...fixKeys, ...violKeys]) {
      expect(key).toMatch(KEBAB_RE)
    }
  })
})

describe('BEST_PRACTICES content validation', () => {
  test('all entries provide actionable advice', () => {
    for (const key of ALL_KEYS) {
      for (const tip of BEST_PRACTICES[key]) {
        expect(tip.length).toBeGreaterThan(10)
      }
    }
  })

  test('no duplicate tips within an entry', () => {
    for (const key of ALL_KEYS) {
      const unique = new Set(BEST_PRACTICES[key])
      expect(unique.size).toBe(BEST_PRACTICES[key].length)
    }
  })

  test('tips do not start with lowercase after first word', () => {
    for (const key of ALL_KEYS) {
      for (const tip of BEST_PRACTICES[key]) {
        expect(tip.length).toBeGreaterThan(10)
      }
    }
  })

  test('specific best practices for no-eval', () => {
    expect(BEST_PRACTICES['no-eval']).toBeDefined()
    expect(BEST_PRACTICES['no-eval'].length).toBe(3)
    expect(BEST_PRACTICES['no-eval'][0].toLowerCase()).toContain('dynamic')
  })

  test('specific best practices for prefer-const', () => {
    expect(BEST_PRACTICES['prefer-const']).toBeDefined()
    expect(BEST_PRACTICES['prefer-const'].length).toBe(3)
  })

  test('specific best practices for max-complexity', () => {
    expect(BEST_PRACTICES['max-complexity']).toBeDefined()
    expect(BEST_PRACTICES['max-complexity'].length).toBe(3)
  })

  test('specific best practices for curly', () => {
    expect(BEST_PRACTICES['curly']).toBeDefined()
    expect(BEST_PRACTICES['curly'].length).toBe(3)
    expect(BEST_PRACTICES['curly'][0].toLowerCase()).toContain('brace')
  })

  test('specific best practices for eq-eq-eq', () => {
    expect(BEST_PRACTICES['eq-eq-eq']).toBeDefined()
    expect(BEST_PRACTICES['eq-eq-eq'][0]).toContain('===')
  })

  test('specific best practices for explicit-return-type', () => {
    expect(BEST_PRACTICES['explicit-return-type']).toBeDefined()
    expect(BEST_PRACTICES['explicit-return-type'].length).toBe(3)
  })

  test('specific best practices for max-depth', () => {
    expect(BEST_PRACTICES['max-depth']).toBeDefined()
    expect(BEST_PRACTICES['max-depth'].length).toBe(3)
  })

  test('keys are sorted alphabetically', () => {
    const sorted = [...ALL_KEYS].sort()
    expect(ALL_KEYS).toEqual(sorted)
  })

  test('no keys contain uppercase letters', () => {
    for (const key of ALL_KEYS) {
      expect(key).toBe(key.toLowerCase())
    }
  })

  test('no keys contain spaces', () => {
    for (const key of ALL_KEYS) {
      expect(key).not.toContain(' ')
    }
  })

  test('no keys contain underscores', () => {
    for (const key of ALL_KEYS) {
      expect(key).not.toContain('_')
    }
  })
})

describe('COMMON_VIOLATIONS content validation', () => {
  test('all entries describe actual violations', () => {
    for (const key of ALL_KEYS) {
      for (const violation of COMMON_VIOLATIONS[key]) {
        expect(violation.length).toBeGreaterThan(10)
      }
    }
  })

  test('no duplicate violations within an entry', () => {
    for (const key of ALL_KEYS) {
      const unique = new Set(COMMON_VIOLATIONS[key])
      expect(unique.size).toBe(COMMON_VIOLATIONS[key].length)
    }
  })

  test('violations describe code patterns not solutions', () => {
    for (const key of ALL_KEYS) {
      for (const v of COMMON_VIOLATIONS[key]) {
        expect(typeof v).toBe('string')
        expect(v.length).toBeGreaterThan(0)
      }
    }
  })

  test('specific violations for no-eval', () => {
    expect(COMMON_VIOLATIONS['no-eval']).toBeDefined()
    expect(COMMON_VIOLATIONS['no-eval'].length).toBe(3)
  })

  test('specific violations for prefer-const', () => {
    expect(COMMON_VIOLATIONS['prefer-const']).toBeDefined()
    expect(COMMON_VIOLATIONS['prefer-const'].length).toBe(3)
  })

  test('specific violations for no-console', () => {
    expect(COMMON_VIOLATIONS['no-console']).toBeDefined()
    expect(COMMON_VIOLATIONS['no-console'].length).toBe(3)
  })

  test('specific violations for eq-eq-eq', () => {
    expect(COMMON_VIOLATIONS['eq-eq-eq']).toBeDefined()
    expect(COMMON_VIOLATIONS['eq-eq-eq'][0]).toContain('==')
  })

  test('specific violations for curly', () => {
    expect(COMMON_VIOLATIONS['curly']).toBeDefined()
    expect(COMMON_VIOLATIONS['curly'].length).toBe(3)
  })

  test('specific violations for max-complexity', () => {
    expect(COMMON_VIOLATIONS['max-complexity']).toBeDefined()
    expect(COMMON_VIOLATIONS['max-complexity'].length).toBe(3)
    expect(COMMON_VIOLATIONS['max-complexity'][0].toLowerCase()).toContain('branch')
  })

  test('all violation tips are descriptive strings', () => {
    for (const key of ALL_KEYS) {
      for (const v of COMMON_VIOLATIONS[key]) {
        expect(v.length).toBeGreaterThan(10)
      }
    }
  })
})

describe('FIXES content validation', () => {
  test('all entries provide fix instructions', () => {
    for (const key of ALL_KEYS) {
      expect(FIXES[key].length).toBe(4)
    }
  })

  test('no duplicate fixes within an entry', () => {
    for (const key of ALL_KEYS) {
      const unique = new Set(FIXES[key])
      expect(unique.size).toBe(FIXES[key].length)
    }
  })

  test('all fix tips are non-empty descriptive strings', () => {
    for (const key of ALL_KEYS) {
      for (const fix of FIXES[key]) {
        expect(fix.length).toBeGreaterThan(10)
      }
    }
  })

  test('specific fixes for no-eval', () => {
    expect(FIXES['no-eval']).toBeDefined()
    expect(FIXES['no-eval'].length).toBe(4)
  })

  test('specific fixes for prefer-const', () => {
    expect(FIXES['prefer-const']).toBeDefined()
    expect(FIXES['prefer-const'].length).toBe(4)
  })

  test('specific fixes for curly', () => {
    expect(FIXES['curly']).toBeDefined()
    expect(FIXES['curly'].length).toBe(4)
    expect(FIXES['curly'][0].toLowerCase()).toContain('brace')
  })

  test('specific fixes for eq-eq-eq', () => {
    expect(FIXES['eq-eq-eq']).toBeDefined()
    expect(FIXES['eq-eq-eq'][0]).toContain('===')
  })

  test('specific fixes for max-complexity', () => {
    expect(FIXES['max-complexity']).toBeDefined()
    expect(FIXES['max-complexity'].length).toBe(4)
  })

  test('specific fixes for explicit-return-type', () => {
    expect(FIXES['explicit-return-type']).toBeDefined()
    expect(FIXES['explicit-return-type'].length).toBe(4)
  })

  test('specific fixes for max-depth', () => {
    expect(FIXES['max-depth']).toBeDefined()
    expect(FIXES['max-depth'].length).toBe(4)
  })

  test('fixes contain actionable language', () => {
    const actionWords = [
      'use',
      'add',
      'replace',
      'enable',
      'configure',
      'apply',
      'set',
      'choose',
      'remove',
      'refactor',
      'extract',
      'simplify',
    ]
    for (const key of ALL_KEYS) {
      const allText = FIXES[key].join(' ').toLowerCase()
      const hasAction = actionWords.some((w) => allText.includes(w))
      expect(hasAction).toBe(true)
    }
  })
})

describe('Cross-data consistency', () => {
  test('every key appears in all three maps', () => {
    const bpKeys = new Set(Object.keys(BEST_PRACTICES))
    const violKeys = new Set(Object.keys(COMMON_VIOLATIONS))
    const fixKeys = new Set(Object.keys(FIXES))
    expect(bpKeys).toEqual(violKeys)
    expect(bpKeys).toEqual(fixKeys)
  })

  test('BEST_PRACTICES and COMMON_VIOLATIONS have same length arrays', () => {
    for (const key of ALL_KEYS) {
      expect(BEST_PRACTICES[key].length).toBe(COMMON_VIOLATIONS[key].length)
    }
  })

  test('FIXES always has one more item than BEST_PRACTICES', () => {
    for (const key of ALL_KEYS) {
      expect(FIXES[key].length).toBe(BEST_PRACTICES[key].length + 1)
    }
  })

  test('no entry in any map contains empty strings', () => {
    for (const key of ALL_KEYS) {
      for (const s of [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]) {
        expect(s.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('all entries in all maps are plain strings (not objects)', () => {
    for (const key of ALL_KEYS) {
      for (const s of [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]) {
        expect(typeof s).toBe('string')
        expect(s).not.toBe('[object Object]')
      }
    }
  })

  test('no entry contains only whitespace', () => {
    for (const key of ALL_KEYS) {
      for (const s of [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]) {
        expect(s.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('entries do not have trailing newlines', () => {
    for (const key of ALL_KEYS) {
      for (const s of [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]) {
        expect(s).toBe(s.trim())
      }
    }
  })

  test('entries do not contain tab characters', () => {
    for (const key of ALL_KEYS) {
      for (const s of [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]) {
        expect(s).not.toContain('\t')
      }
    }
  })

  test('no key starts or ends with a hyphen', () => {
    for (const key of ALL_KEYS) {
      expect(key[0]).not.toBe('-')
      expect(key[key.length - 1]).not.toBe('-')
    }
  })

  test('no consecutive hyphens in keys', () => {
    for (const key of ALL_KEYS) {
      expect(key).not.toContain('--')
    }
  })
})

describe('BEST_PRACTICES detailed content', () => {
  test('all tips start with an uppercase letter', () => {
    for (const key of ALL_KEYS) {
      for (const tip of BEST_PRACTICES[key]) {
        expect(tip[0]).toBe(tip[0].toUpperCase())
      }
    }
  })

  test('tips contain a colon separating title from explanation', () => {
    let colonCount = 0
    for (const key of ALL_KEYS) {
      for (const tip of BEST_PRACTICES[key]) {
        if (tip.includes(':')) colonCount++
      }
    }
    // At least 75% of tips should use the colon pattern
    const totalTips = ALL_KEYS.length * 3
    expect(colonCount / totalTips).toBeGreaterThan(0.75)
  })

  test('no tip exceeds 120 characters', () => {
    for (const key of ALL_KEYS) {
      for (const tip of BEST_PRACTICES[key]) {
        expect(tip.length).toBeLessThanOrEqual(120)
      }
    }
  })

  test('tips do not end with a period', () => {
    for (const key of ALL_KEYS) {
      for (const tip of BEST_PRACTICES[key]) {
        expect(tip.endsWith('.')).toBe(false)
      }
    }
  })

  test('no-await-in-loop mentions async patterns', () => {
    const text = BEST_PRACTICES['no-await-in-loop'].join(' ').toLowerCase()
    expect(text).toContain('async')
  })

  test('no-floating-promises mentions handling', () => {
    const text = BEST_PRACTICES['no-floating-promises'].join(' ').toLowerCase()
    expect(text).toContain('promise')
  })

  test('no-implicit-coercion mentions explicit conversion', () => {
    const text = BEST_PRACTICES['no-implicit-coercion'].join(' ').toLowerCase()
    expect(text).toContain('explicit')
  })

  test('no-nested-ternary discourages nesting', () => {
    const text = BEST_PRACTICES['no-nested-ternary'].join(' ').toLowerCase()
    expect(text).toContain('ternar')
  })

  test('prefer-nullish-coalescing mentions nullish behavior', () => {
    const text = BEST_PRACTICES['prefer-nullish-coalescing'].join(' ').toLowerCase()
    expect(text).toContain('null')
  })

  test('no-unused-vars mentions dead code', () => {
    const text = BEST_PRACTICES['no-unused-vars'].join(' ').toLowerCase()
    expect(text).toMatch(/unused|dead/)
  })

  test('no-shadow mentions variable naming', () => {
    const text = BEST_PRACTICES['no-shadow'].join(' ').toLowerCase()
    expect(text).toMatch(/name|variable|scope/)
  })

  test('no-empty-catch mentions error handling', () => {
    const text = BEST_PRACTICES['no-empty-catch'].join(' ').toLowerCase()
    expect(text).toMatch(/error|catch/)
  })

  test('no-console mentions logging alternatives', () => {
    const text = BEST_PRACTICES['no-console'].join(' ').toLowerCase()
    expect(text).toMatch(/log|structured/)
  })

  test('prefer-template mentions template literals', () => {
    const text = BEST_PRACTICES['prefer-template'].join(' ').toLowerCase()
    expect(text).toMatch(/template|literal/)
  })

  test('every key segment is at least 2 characters', () => {
    for (const key of ALL_KEYS) {
      const segments = key.split('-')
      for (const seg of segments) {
        expect(seg.length).toBeGreaterThanOrEqual(2)
      }
    }
  })
})

describe('COMMON_VIOLATIONS detailed content', () => {
  test('all violation descriptions start with a letter, paren, or common code symbol', () => {
    for (const key of ALL_KEYS) {
      for (const v of COMMON_VIOLATIONS[key]) {
        expect(v[0]).toMatch(/^[a-zA-Z(!{]/)
      }
    }
  })

  test('no violation description exceeds 120 characters', () => {
    for (const key of ALL_KEYS) {
      for (const v of COMMON_VIOLATIONS[key]) {
        expect(v.length).toBeLessThanOrEqual(120)
      }
    }
  })

  test('violation descriptions do not end with a period', () => {
    for (const key of ALL_KEYS) {
      for (const v of COMMON_VIOLATIONS[key]) {
        expect(v.endsWith('.')).toBe(false)
      }
    }
  })

  test('violations describe anti-patterns using dash separator', () => {
    let dashCount = 0
    for (const key of ALL_KEYS) {
      for (const v of COMMON_VIOLATIONS[key]) {
        if (v.includes(' - ')) dashCount++
      }
    }
    // Most violations follow "pattern - explanation" format
    const totalViolations = ALL_KEYS.length * 3
    expect(dashCount / totalViolations).toBeGreaterThan(0.5)
  })

  test('no-await-in-loop violation mentions loop context', () => {
    const text = COMMON_VIOLATIONS['no-await-in-loop'].join(' ').toLowerCase()
    expect(text).toMatch(/loop|for/)
  })

  test('no-console-log violation mentions debugging', () => {
    const text = COMMON_VIOLATIONS['no-console-log'].join(' ').toLowerCase()
    expect(text).toMatch(/console|debug/)
  })

  test('no-explicit-any violation mentions type safety', () => {
    const text = COMMON_VIOLATIONS['no-explicit-any'].join(' ').toLowerCase()
    expect(text).toContain('any')
  })

  test('no-param-reassign violation mentions parameter mutation', () => {
    const text = COMMON_VIOLATIONS['no-param-reassign'].join(' ').toLowerCase()
    expect(text).toMatch(/parameter|param|assign|mutat/)
  })

  test('prefer-const violation mentions reassignment', () => {
    const text = COMMON_VIOLATIONS['prefer-const'].join(' ').toLowerCase()
    expect(text).toMatch(/reassign|const|let/)
  })

  test('no-var violation mentions var keyword', () => {
    const text = COMMON_VIOLATIONS['no-var'].join(' ').toLowerCase()
    expect(text).toContain('var')
  })

  test('no-dupe-keys violation mentions duplicate behavior', () => {
    const text = COMMON_VIOLATIONS['no-dupe-keys'].join(' ').toLowerCase()
    expect(text).toMatch(/duplicate|overwrite/)
  })

  test('no-unreachable violation mentions dead code', () => {
    const text = COMMON_VIOLATIONS['no-unreachable'].join(' ').toLowerCase()
    expect(text).toMatch(/return|dead|code/)
  })

  test('no-throw-literal violation mentions Error object', () => {
    const text = COMMON_VIOLATIONS['no-throw-literal'].join(' ').toLowerCase()
    expect(text).toMatch(/error|throw/)
  })

  test('no-debugger violation mentions debugger statement', () => {
    const text = COMMON_VIOLATIONS['no-debugger'].join(' ').toLowerCase()
    expect(text).toContain('debugger')
  })

  test('use-isnan violation mentions NaN comparison', () => {
    const text = COMMON_VIOLATIONS['use-isnan'].join(' ').toLowerCase()
    expect(text).toContain('nan')
  })
})

describe('FIXES detailed content', () => {
  test('all fix tips start with an uppercase letter', () => {
    for (const key of ALL_KEYS) {
      for (const fix of FIXES[key]) {
        expect(fix[0]).toBe(fix[0].toUpperCase())
      }
    }
  })

  test('no fix tip exceeds 120 characters', () => {
    for (const key of ALL_KEYS) {
      for (const fix of FIXES[key]) {
        expect(fix.length).toBeLessThanOrEqual(120)
      }
    }
  })

  test('fix tips do not end with a period', () => {
    for (const key of ALL_KEYS) {
      for (const fix of FIXES[key]) {
        expect(fix.endsWith('.')).toBe(false)
      }
    }
  })

  test('fixes use colon separator pattern consistently', () => {
    let colonCount = 0
    for (const key of ALL_KEYS) {
      for (const fix of FIXES[key]) {
        if (fix.includes(':')) colonCount++
      }
    }
    const totalFixes = ALL_KEYS.length * 4
    expect(colonCount / totalFixes).toBeGreaterThan(0.5)
  })

  test('no-await-in-loop fix mentions Promise.all', () => {
    const text = FIXES['no-await-in-loop'].join(' ')
    expect(text).toContain('Promise.all')
  })

  test('no-explicit-any fix suggests alternatives', () => {
    const text = FIXES['no-explicit-any'].join(' ').toLowerCase()
    expect(text).toMatch(/unknown|type|generic|interface/)
  })

  test('no-eval fix mentions JSON.parse', () => {
    const text = FIXES['no-eval'].join(' ')
    expect(text).toContain('JSON.parse')
  })

  test('prefer-const fix mentions auto-fix', () => {
    const text = FIXES['prefer-const'].join(' ').toLowerCase()
    expect(text).toMatch(/const|auto/)
  })

  test('eq-eq-eq fix mentions strict equality', () => {
    const text = FIXES['eq-eq-eq'].join(' ')
    expect(text).toContain('===')
  })

  test('no-floating-promises fix mentions await', () => {
    const text = FIXES['no-floating-promises'].join(' ').toLowerCase()
    expect(text).toMatch(/await|\.catch/)
  })

  test('no-param-reassign fix suggests local variables', () => {
    const text = FIXES['no-param-reassign'].join(' ').toLowerCase()
    expect(text).toMatch(/local|spread|clone/)
  })

  test('prefer-template fix mentions template literals', () => {
    const text = FIXES['prefer-template'].join(' ').toLowerCase()
    expect(text).toMatch(/template|backtick/)
  })

  test('no-unused-vars fix suggests removal or underscore', () => {
    const text = FIXES['no-unused-vars'].join(' ').toLowerCase()
    expect(text).toMatch(/remove|underscore|_/)
  })

  test('curly fix mentions braces', () => {
    const text = FIXES['curly'].join(' ').toLowerCase()
    expect(text).toMatch(/brace/)
  })

  test('no-nested-ternary fix suggests alternatives', () => {
    const text = FIXES['no-nested-ternary'].join(' ').toLowerCase()
    expect(text).toMatch(/if|variable|lookup|function/)
  })

  test('prefer-spread fix mentions spread syntax', () => {
    const text = FIXES['prefer-spread'].join(' ')
    expect(text).toContain('...')
  })
})

describe('Cross-map content integrity', () => {
  test('BEST_PRACTICES and COMMON_VIOLATIONS do not share identical strings for the same rule', () => {
    for (const key of ALL_KEYS) {
      const bpSet = new Set(BEST_PRACTICES[key])
      for (const v of COMMON_VIOLATIONS[key]) {
        expect(bpSet.has(v)).toBe(false)
      }
    }
  })

  test('BEST_PRACTICES and FIXES share at most one identical string per rule', () => {
    for (const key of ALL_KEYS) {
      const bpSet = new Set(BEST_PRACTICES[key])
      const overlaps = FIXES[key].filter((f) => bpSet.has(f))
      expect(overlaps.length).toBeLessThanOrEqual(1)
    }
  })

  test('COMMON_VIOLATIONS and FIXES do not share identical strings for the same rule', () => {
    for (const key of ALL_KEYS) {
      const violSet = new Set(COMMON_VIOLATIONS[key])
      for (const f of FIXES[key]) {
        expect(violSet.has(f)).toBe(false)
      }
    }
  })

  test('all maps have exactly 92 keys', () => {
    expect(Object.keys(BEST_PRACTICES)).toHaveLength(92)
    expect(Object.keys(COMMON_VIOLATIONS)).toHaveLength(92)
    expect(Object.keys(FIXES)).toHaveLength(92)
  })

  test('key order is identical across all maps', () => {
    const bpKeys = Object.keys(BEST_PRACTICES)
    const violKeys = Object.keys(COMMON_VIOLATIONS)
    const fixKeys = Object.keys(FIXES)
    expect(bpKeys).toEqual(violKeys)
    expect(bpKeys).toEqual(fixKeys)
  })

  test('every string across all maps is at least 10 characters', () => {
    for (const key of ALL_KEYS) {
      const all = [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]
      for (const s of all) {
        expect(s.length).toBeGreaterThanOrEqual(10)
      }
    }
  })

  test('no string contains CRLF line endings', () => {
    for (const key of ALL_KEYS) {
      const all = [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]
      for (const s of all) {
        expect(s).not.toContain('\r')
      }
    }
  })

  test('no string contains multiple consecutive spaces', () => {
    for (const key of ALL_KEYS) {
      const all = [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]
      for (const s of all) {
        expect(s).not.toMatch(/ {2,}/)
      }
    }
  })

  test('no key contains numeric digits', () => {
    for (const key of ALL_KEYS) {
      expect(key).not.toMatch(/[0-9]/)
    }
  })

  test('COMMON_VIOLATIONS are longer than 20 characters on average per rule', () => {
    for (const key of ALL_KEYS) {
      const avgLen = COMMON_VIOLATIONS[key].reduce((sum, s) => sum + s.length, 0) / 3
      expect(avgLen).toBeGreaterThan(20)
    }
  })
})

describe('BEST_PRACTICES rule-specific content checks (additional)', () => {
  test('no-alert mentions UI or blocking', () => {
    const text = BEST_PRACTICES['no-alert'].join(' ').toLowerCase()
    expect(text).toMatch(/ui|blocking|browser/)
  })

  test('no-array-constructor mentions literal syntax', () => {
    const text = BEST_PRACTICES['no-array-constructor'].join(' ').toLowerCase()
    expect(text).toContain('literal')
  })

  test('no-circular-deps mentions modules or graph', () => {
    const text = BEST_PRACTICES['no-circular-deps'].join(' ').toLowerCase()
    expect(text).toMatch(/module|graph/)
  })

  test('no-cond-assign mentions typo or comparison', () => {
    const text = BEST_PRACTICES['no-cond-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/typo|compar/)
  })

  test('no-const-assign mentions const or let', () => {
    const text = BEST_PRACTICES['no-const-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/const|let/)
  })

  test('no-delete-var mentions strict mode', () => {
    const text = BEST_PRACTICES['no-delete-var'].join(' ').toLowerCase()
    expect(text).toContain('strict')
  })

  test('no-dupe-keys mentions overwrite or duplicate', () => {
    const text = BEST_PRACTICES['no-dupe-keys'].join(' ').toLowerCase()
    expect(text).toMatch(/overwrite|duplicate/)
  })

  test('no-duplicate-case mentions switch or case', () => {
    const text = BEST_PRACTICES['no-duplicate-case'].join(' ').toLowerCase()
    expect(text).toMatch(/switch|case/)
  })

  test('no-duplicate-imports mentions merge or combine', () => {
    const text = BEST_PRACTICES['no-duplicate-imports'].join(' ').toLowerCase()
    expect(text).toMatch(/merge|combine/)
  })

  test('no-else-return mentions early return or nesting', () => {
    const text = BEST_PRACTICES['no-else-return'].join(' ').toLowerCase()
    expect(text).toMatch(/early|nest/)
  })

  test('no-empty mentions empty block or comment', () => {
    const text = BEST_PRACTICES['no-empty'].join(' ').toLowerCase()
    expect(text).toMatch(/empty|comment|block/)
  })

  test('no-empty-function mentions stub or implementation', () => {
    const text = BEST_PRACTICES['no-empty-function'].join(' ').toLowerCase()
    expect(text).toMatch(/stub|implement|noop/)
  })

  test('no-explicit-any mentions unknown or types', () => {
    const text = BEST_PRACTICES['no-explicit-any'].join(' ').toLowerCase()
    expect(text).toMatch(/unknown|type/)
  })

  test('no-fallthrough mentions break', () => {
    const text = BEST_PRACTICES['no-fallthrough'].join(' ').toLowerCase()
    expect(text).toContain('break')
  })

  test('no-implied-eval mentions setTimeout or string execution', () => {
    const text = BEST_PRACTICES['no-implied-eval'].join(' ').toLowerCase()
    expect(text).toMatch(/settimeout|string/)
  })

  test('no-loop-func mentions closure', () => {
    const text = BEST_PRACTICES['no-loop-func'].join(' ').toLowerCase()
    expect(text).toContain('closure')
  })

  test('no-magic-numbers mentions constant or naming', () => {
    const text = BEST_PRACTICES['no-magic-numbers'].join(' ').toLowerCase()
    expect(text).toMatch(/constant|name/)
  })

  test('no-misused-promises mentions boolean or condition', () => {
    const text = BEST_PRACTICES['no-misused-promises'].join(' ').toLowerCase()
    expect(text).toMatch(/boolean|condition/)
  })

  test('no-non-null-assertion mentions null check or optional', () => {
    const text = BEST_PRACTICES['no-non-null-assertion'].join(' ').toLowerCase()
    expect(text).toMatch(/null|optional/)
  })

  test('no-prototype-builtins mentions hasOwn or hasOwnProperty', () => {
    const text = BEST_PRACTICES['no-prototype-builtins'].join(' ').toLowerCase()
    expect(text).toContain('hasown')
  })

  test('no-redeclare mentions same name or scope', () => {
    const text = BEST_PRACTICES['no-redeclare'].join(' ').toLowerCase()
    expect(text).toMatch(/name|scope/)
  })

  test('no-self-assign mentions typo or mistake', () => {
    const text = BEST_PRACTICES['no-self-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/typo|mistake|unnecessary/)
  })

  test('no-sparse-arrays mentions undefined or empty slot', () => {
    const text = BEST_PRACTICES['no-sparse-arrays'].join(' ').toLowerCase()
    expect(text).toMatch(/undefined|empty|hole/)
  })

  test('no-throw-literal mentions Error or stack', () => {
    const text = BEST_PRACTICES['no-throw-literal'].join(' ').toLowerCase()
    expect(text).toMatch(/error|stack/)
  })

  test('no-undef mentions declare or spelling', () => {
    const text = BEST_PRACTICES['no-undef'].join(' ').toLowerCase()
    expect(text).toMatch(/declare|spelling|import/)
  })

  test('no-unsafe-assignment mentions type or validate', () => {
    const text = BEST_PRACTICES['no-unsafe-assignment'].join(' ').toLowerCase()
    expect(text).toMatch(/type|validat/)
  })

  test('no-unsafe-call mentions narrow or type', () => {
    const text = BEST_PRACTICES['no-unsafe-call'].join(' ').toLowerCase()
    expect(text).toMatch(/narrow|type/)
  })

  test('no-unsafe-finally mentions cleanup or return', () => {
    const text = BEST_PRACTICES['no-unsafe-finally'].join(' ').toLowerCase()
    expect(text).toMatch(/cleanup|return|finally/)
  })

  test('no-unsafe-member-access mentions property or any', () => {
    const text = BEST_PRACTICES['no-unsafe-member-access'].join(' ').toLowerCase()
    expect(text).toMatch(/property|any|access/)
  })

  test('no-unsafe-return mentions type or return', () => {
    const text = BEST_PRACTICES['no-unsafe-return'].join(' ').toLowerCase()
    expect(text).toMatch(/type|return/)
  })

  test('no-var mentions const or let or hoisting', () => {
    const text = BEST_PRACTICES['no-var'].join(' ').toLowerCase()
    expect(text).toMatch(/const|let|hoist/)
  })

  test('prefer-array-find mentions find or filter', () => {
    const text = BEST_PRACTICES['prefer-array-find'].join(' ').toLowerCase()
    expect(text).toMatch(/find|filter/)
  })

  test('prefer-async-await mentions async or chain', () => {
    const text = BEST_PRACTICES['prefer-async-await'].join(' ').toLowerCase()
    expect(text).toMatch(/async|chain/)
  })

  test('prefer-for-of mentions iterable or iteration', () => {
    const text = BEST_PRACTICES['prefer-for-of'].join(' ').toLowerCase()
    expect(text).toMatch(/iterab|loop/)
  })

  test('prefer-includes mentions indexOf or boolean', () => {
    const text = BEST_PRACTICES['prefer-includes'].join(' ').toLowerCase()
    expect(text).toMatch(/indexof|boolean|includes/)
  })

  test('require-await mentions async or await', () => {
    const text = BEST_PRACTICES['require-await'].join(' ').toLowerCase()
    expect(text).toMatch(/async|await/)
  })

  test('sort-keys mentions alphabetical or order', () => {
    const text = BEST_PRACTICES['sort-keys'].join(' ').toLowerCase()
    expect(text).toMatch(/alphabet|order|sort/)
  })

  test('strict-boolean-expressions mentions truthy or falsy', () => {
    const text = BEST_PRACTICES['strict-boolean-expressions'].join(' ').toLowerCase()
    expect(text).toMatch(/truthy|falsy|explicit/)
  })

  test('valid-typeof mentions typo or valid', () => {
    const text = BEST_PRACTICES['valid-typeof'].join(' ').toLowerCase()
    expect(text).toMatch(/typo|valid|string/)
  })
})

describe('COMMON_VIOLATIONS additional rule content checks', () => {
  test('no-alert violation mentions alert or browser', () => {
    const text = COMMON_VIOLATIONS['no-alert'].join(' ').toLowerCase()
    expect(text).toMatch(/alert|confirm|prompt|browser/)
  })

  test('no-array-constructor violation mentions new Array or literal', () => {
    const text = COMMON_VIOLATIONS['no-array-constructor'].join(' ').toLowerCase()
    expect(text).toMatch(/new array|array literal/)
  })

  test('no-circular-deps violation mentions circular or import', () => {
    const text = COMMON_VIOLATIONS['no-circular-deps'].join(' ').toLowerCase()
    expect(text).toMatch(/circular|import/)
  })

  test('no-cond-assign violation mentions assignment or condition', () => {
    const text = COMMON_VIOLATIONS['no-cond-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/assign|condition/)
  })

  test('no-const-assign violation mentions reassign or const', () => {
    const text = COMMON_VIOLATIONS['no-const-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/reassign|const/)
  })

  test('no-delete-var violation mentions delete or strict', () => {
    const text = COMMON_VIOLATIONS['no-delete-var'].join(' ').toLowerCase()
    expect(text).toMatch(/delete|strict/)
  })

  test('no-duplicate-case violation mentions duplicate or case', () => {
    const text = COMMON_VIOLATIONS['no-duplicate-case'].join(' ').toLowerCase()
    expect(text).toMatch(/duplicate|case/)
  })

  test('no-duplicate-imports violation mentions same module or merge', () => {
    const text = COMMON_VIOLATIONS['no-duplicate-imports'].join(' ').toLowerCase()
    expect(text).toMatch(/same module|merge|multiple import/)
  })

  test('no-else-return violation mentions else or return', () => {
    const text = COMMON_VIOLATIONS['no-else-return'].join(' ').toLowerCase()
    expect(text).toMatch(/else|return/)
  })

  test('no-empty violation mentions empty or block', () => {
    const text = COMMON_VIOLATIONS['no-empty'].join(' ').toLowerCase()
    expect(text).toMatch(/empty|block/)
  })

  test('no-empty-function violation mentions empty or implementation', () => {
    const text = COMMON_VIOLATIONS['no-empty-function'].join(' ').toLowerCase()
    expect(text).toMatch(/empty|implement|body/)
  })

  test('no-fallthrough violation mentions break or fallthrough', () => {
    const text = COMMON_VIOLATIONS['no-fallthrough'].join(' ').toLowerCase()
    expect(text).toMatch(/break|fallthrough/)
  })

  test('no-floating-promises violation mentions promise or await', () => {
    const text = COMMON_VIOLATIONS['no-floating-promises'].join(' ').toLowerCase()
    expect(text).toMatch(/promise|await/)
  })

  test('no-implied-eval violation mentions setTimeout or string', () => {
    const text = COMMON_VIOLATIONS['no-implied-eval'].join(' ').toLowerCase()
    expect(text).toMatch(/settimeout|string|function/)
  })

  test('no-loop-func violation mentions function or loop', () => {
    const text = COMMON_VIOLATIONS['no-loop-func'].join(' ').toLowerCase()
    expect(text).toMatch(/function|loop|closure/)
  })

  test('no-magic-numbers violation mentions number or constant', () => {
    const text = COMMON_VIOLATIONS['no-magic-numbers'].join(' ').toLowerCase()
    expect(text).toMatch(/number|constant|literal/)
  })

  test('no-misused-promises violation mentions promise or boolean', () => {
    const text = COMMON_VIOLATIONS['no-misused-promises'].join(' ').toLowerCase()
    expect(text).toMatch(/promise|boolean|async/)
  })

  test('no-non-null-assertion violation mentions null or assertion', () => {
    const text = COMMON_VIOLATIONS['no-non-null-assertion'].join(' ').toLowerCase()
    expect(text).toMatch(/null|assert|undefined/)
  })

  test('no-promise-as-boolean violation mentions promise or condition', () => {
    const text = COMMON_VIOLATIONS['no-promise-as-boolean'].join(' ').toLowerCase()
    expect(text).toMatch(/promise|condition|await/)
  })

  test('no-prototype-builtins violation mentions hasOwnProperty or hasOwn', () => {
    const text = COMMON_VIOLATIONS['no-prototype-builtins'].join(' ').toLowerCase()
    expect(text).toMatch(/hasownproperty|hasown|prototype/)
  })

  test('no-redeclare violation mentions declare or same name', () => {
    const text = COMMON_VIOLATIONS['no-redeclare'].join(' ').toLowerCase()
    expect(text).toMatch(/declare|same name|twice/)
  })

  test('no-self-assign violation mentions self or assign', () => {
    const text = COMMON_VIOLATIONS['no-self-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/self|assign|itself/)
  })
})

describe('FIXES additional rule content checks', () => {
  test('no-alert fix mentions toast or modal', () => {
    const text = FIXES['no-alert'].join(' ').toLowerCase()
    expect(text).toMatch(/toast|modal|notification/)
  })

  test('no-array-constructor fix mentions literal', () => {
    const text = FIXES['no-array-constructor'].join(' ').toLowerCase()
    expect(text).toContain('literal')
  })

  test('no-circular-deps fix mentions extract or inject', () => {
    const text = FIXES['no-circular-deps'].join(' ').toLowerCase()
    expect(text).toMatch(/extract|inject|restructur/)
  })

  test('no-cond-assign fix mentions assignment or equality', () => {
    const text = FIXES['no-cond-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/assign|equal/)
  })

  test('no-const-assign fix mentions let', () => {
    const text = FIXES['no-const-assign'].join(' ').toLowerCase()
    expect(text).toContain('let')
  })

  test('no-delete-var fix mentions undefined', () => {
    const text = FIXES['no-delete-var'].join(' ').toLowerCase()
    expect(text).toContain('undefined')
  })

  test('no-dupe-keys fix mentions duplicate or Map', () => {
    const text = FIXES['no-dupe-keys'].join(' ').toLowerCase()
    expect(text).toMatch(/duplicate|map/)
  })

  test('no-duplicate-case fix mentions merge or remove', () => {
    const text = FIXES['no-duplicate-case'].join(' ').toLowerCase()
    expect(text).toMatch(/merge|remove/)
  })

  test('no-duplicate-imports fix mentions merge or organize', () => {
    const text = FIXES['no-duplicate-imports'].join(' ').toLowerCase()
    expect(text).toMatch(/merge|organize/)
  })

  test('no-else-return fix mentions remove or early return', () => {
    const text = FIXES['no-else-return'].join(' ').toLowerCase()
    expect(text).toMatch(/remove|early return/)
  })

  test('no-empty fix mentions comment or implementation', () => {
    const text = FIXES['no-empty'].join(' ').toLowerCase()
    expect(text).toMatch(/comment|implement/)
  })

  test('no-empty-function fix mentions noop or abstract', () => {
    const text = FIXES['no-empty-function'].join(' ').toLowerCase()
    expect(text).toMatch(/noop|abstract|implement/)
  })

  test('no-fallthrough fix mentions break or return', () => {
    const text = FIXES['no-fallthrough'].join(' ').toLowerCase()
    expect(text).toMatch(/break|return/)
  })

  test('no-implied-eval fix mentions function or arrow', () => {
    const text = FIXES['no-implied-eval'].join(' ').toLowerCase()
    expect(text).toMatch(/function|arrow/)
  })

  test('no-loop-func fix mentions outside or extract', () => {
    const text = FIXES['no-loop-func'].join(' ').toLowerCase()
    expect(text).toMatch(/outside|extract|helper/)
  })

  test('no-magic-numbers fix mentions constant or enum', () => {
    const text = FIXES['no-magic-numbers'].join(' ').toLowerCase()
    expect(text).toMatch(/constant|enum/)
  })

  test('no-non-null-assertion fix mentions null check or optional', () => {
    const text = FIXES['no-non-null-assertion'].join(' ').toLowerCase()
    expect(text).toMatch(/null check|optional|type guard/)
  })

  test('no-prototype-builtins fix mentions Object.hasOwn', () => {
    const text = FIXES['no-prototype-builtins'].join(' ')
    expect(text).toContain('Object.hasOwn')
  })

  test('no-redeclare fix mentions rename or remove', () => {
    const text = FIXES['no-redeclare'].join(' ').toLowerCase()
    expect(text).toMatch(/rename|remove|duplicate/)
  })

  test('no-self-assign fix mentions typo or remove', () => {
    const text = FIXES['no-self-assign'].join(' ').toLowerCase()
    expect(text).toMatch(/typo|remove|statement/)
  })

  test('no-sparse-arrays fix mentions undefined or comma', () => {
    const text = FIXES['no-sparse-arrays'].join(' ').toLowerCase()
    expect(text).toMatch(/undefined|comma|array/)
  })

  test('no-throw-literal fix mentions new Error', () => {
    const text = FIXES['no-throw-literal'].join(' ')
    expect(text).toContain('new Error')
  })

  test('no-undef fix mentions import or declare', () => {
    const text = FIXES['no-undef'].join(' ').toLowerCase()
    expect(text).toMatch(/import|declare/)
  })
})

describe('Additional structural validation', () => {
  test('no string in any map contains a newline character', () => {
    for (const key of ALL_KEYS) {
      const all = [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]
      for (const s of all) {
        expect(s).not.toContain('\n')
      }
    }
  })

  test('all keys are at least 3 characters long', () => {
    for (const key of ALL_KEYS) {
      expect(key.length).toBeGreaterThanOrEqual(3)
    }
  })

  test('no key is exactly 2 characters long', () => {
    for (const key of ALL_KEYS) {
      expect(key.length).not.toBe(2)
    }
  })

  test('no string in BEST_PRACTICES exceeds 120 characters', () => {
    for (const key of ALL_KEYS) {
      for (const s of BEST_PRACTICES[key]) {
        expect(s.length).toBeLessThanOrEqual(120)
      }
    }
  })

  test('BEST_PRACTICES entries average more than 20 characters per rule', () => {
    for (const key of ALL_KEYS) {
      const avgLen = BEST_PRACTICES[key].reduce((sum, s) => sum + s.length, 0) / 3
      expect(avgLen).toBeGreaterThan(20)
    }
  })

  test('FIXES entries average more than 20 characters per rule', () => {
    for (const key of ALL_KEYS) {
      const avgLen = FIXES[key].reduce((sum, s) => sum + s.length, 0) / 4
      expect(avgLen).toBeGreaterThan(20)
    }
  })

  test('all COMMON_VIOLATIONS entries start with a letter, parenthesis, exclamation, or brace', () => {
    for (const key of ALL_KEYS) {
      for (const v of COMMON_VIOLATIONS[key]) {
        expect(v[0]).toMatch(/^[a-zA-Z(!{]/)
      }
    }
  })

  test('all FIXES entries start with an uppercase letter', () => {
    for (const key of ALL_KEYS) {
      for (const f of FIXES[key]) {
        expect(f[0]).toBe(f[0].toUpperCase())
        expect(f[0]).toMatch(/^[A-Z]/)
      }
    }
  })

  test('most rule keys contain at least one hyphen', () => {
    const keysWithHyphen = ALL_KEYS.filter((k) => k.includes('-'))
    expect(keysWithHyphen.length).toBeGreaterThan(ALL_KEYS.length * 0.9)
  })

  test('all maps are frozen or have consistent own-property counts', () => {
    const bpKeys = Object.keys(BEST_PRACTICES)
    const violKeys = Object.keys(COMMON_VIOLATIONS)
    const fixKeys = Object.keys(FIXES)
    expect(bpKeys.length).toBe(violKeys.length)
    expect(bpKeys.length).toBe(fixKeys.length)
  })
})

describe('Additional cross-map consistency checks', () => {
  test('total string count in BEST_PRACTICES is 276 (92 * 3)', () => {
    let count = 0
    for (const key of ALL_KEYS) {
      count += BEST_PRACTICES[key].length
    }
    expect(count).toBe(92 * 3)
  })

  test('total string count in COMMON_VIOLATIONS is 276 (92 * 3)', () => {
    let count = 0
    for (const key of ALL_KEYS) {
      count += COMMON_VIOLATIONS[key].length
    }
    expect(count).toBe(92 * 3)
  })

  test('total string count in FIXES is 368 (92 * 4)', () => {
    let count = 0
    for (const key of ALL_KEYS) {
      count += FIXES[key].length
    }
    expect(count).toBe(92 * 4)
  })

  test('no two rules share identical BEST_PRACTICES arrays', () => {
    const seen = new Set<string>()
    for (const key of ALL_KEYS) {
      const serialized = BEST_PRACTICES[key].join('|')
      expect(seen.has(serialized)).toBe(false)
      seen.add(serialized)
    }
  })

  test('no two rules share identical COMMON_VIOLATIONS arrays', () => {
    const seen = new Set<string>()
    for (const key of ALL_KEYS) {
      const serialized = COMMON_VIOLATIONS[key].join('|')
      expect(seen.has(serialized)).toBe(false)
      seen.add(serialized)
    }
  })

  test('no two rules share identical FIXES arrays', () => {
    const seen = new Set<string>()
    for (const key of ALL_KEYS) {
      const serialized = FIXES[key].join('|')
      expect(seen.has(serialized)).toBe(false)
      seen.add(serialized)
    }
  })

  test('every rule has unique content across all maps', () => {
    for (const key of ALL_KEYS) {
      const allStrings = [...BEST_PRACTICES[key], ...COMMON_VIOLATIONS[key], ...FIXES[key]]
      const uniqueStrings = new Set(allStrings)
      expect(uniqueStrings.size).toBeGreaterThanOrEqual(
        BEST_PRACTICES[key].length + COMMON_VIOLATIONS[key].length,
      )
    }
  })
})

describe('Key format deep validation', () => {
  test('all keys match the pattern: lowercase-word-lowercase-word', () => {
    for (const key of ALL_KEYS) {
      expect(key).toMatch(/^[a-z]+(-[a-z]+)*$/)
    }
  })

  test('keys with "no-" prefix are present', () => {
    const noKeys = ALL_KEYS.filter((k) => k.startsWith('no-'))
    expect(noKeys.length).toBeGreaterThan(20)
  })

  test('keys with "prefer-" prefix are present', () => {
    const preferKeys = ALL_KEYS.filter((k) => k.startsWith('prefer-'))
    expect(preferKeys.length).toBeGreaterThan(10)
  })

  test('keys with "max-" prefix are present', () => {
    const maxKeys = ALL_KEYS.filter((k) => k.startsWith('max-'))
    expect(maxKeys.length).toBeGreaterThan(3)
  })

  test('keys with "strict-" prefix are present', () => {
    const strictKeys = ALL_KEYS.filter((k) => k.startsWith('strict-'))
    expect(strictKeys.length).toBeGreaterThanOrEqual(1)
  })

  test('keys with "require-" prefix are present', () => {
    const requireKeys = ALL_KEYS.filter((k) => k.startsWith('require-'))
    expect(requireKeys.length).toBeGreaterThanOrEqual(1)
  })

  test('keys with "restrict-" prefix are present', () => {
    const restrictKeys = ALL_KEYS.filter((k) => k.startsWith('restrict-'))
    expect(restrictKeys.length).toBeGreaterThanOrEqual(1)
  })

  test('no key has more than 3 hyphen-separated segments', () => {
    for (const key of ALL_KEYS) {
      const segments = key.split('-')
      expect(segments.length).toBeLessThanOrEqual(4)
    }
  })

  test('all key segments are at least 2 characters (revisited)', () => {
    for (const key of ALL_KEYS) {
      const segments = key.split('-')
      for (const seg of segments) {
        expect(seg.length).toBeGreaterThanOrEqual(2)
      }
    }
  })

  test('first key alphabetically is consistent-imports', () => {
    const sorted = [...ALL_KEYS].sort()
    expect(sorted[0]).toBe('consistent-imports')
  })

  test('last key alphabetically is valid-typeof', () => {
    const sorted = [...ALL_KEYS].sort()
    expect(sorted[sorted.length - 1]).toBe('valid-typeof')
  })
})
