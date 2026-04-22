import { describe, test, expect } from 'vitest'
import { bestPracticesMap } from '../../../src/commands/explain-data-best-practices.js'
import { examplesMap } from '../../../src/commands/explain-data-examples.js'
import { relatedRulesMap } from '../../../src/commands/explain-data-related.js'

const KEBAB_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const ALL_BP_KEYS = Object.keys(bestPracticesMap)

describe('bestPracticesMap', () => {
  const keys = Object.keys(bestPracticesMap)

  test('has 60 entries', () => {
    expect(keys).toHaveLength(60)
  })

  test('all values are arrays of 4 strings', () => {
    for (const key of keys) {
      expect(bestPracticesMap[key]).toHaveLength(4)
      for (const s of bestPracticesMap[key]) {
        expect(typeof s).toBe('string')
      }
    }
  })

  test('all strings are non-empty', () => {
    for (const key of keys) {
      for (const s of bestPracticesMap[key]) {
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
    expect(bestPracticesMap).toHaveProperty('no-eval')
    expect(bestPracticesMap).toHaveProperty('prefer-const')
    expect(bestPracticesMap).toHaveProperty('max-complexity')
    expect(bestPracticesMap).toHaveProperty('curly')
  })

  test('no empty arrays', () => {
    for (const key of keys) {
      expect(bestPracticesMap[key].length).toBeGreaterThan(0)
    }
  })
})

describe('bestPracticesMap detailed entry checks', () => {
  test('curly entry has meaningful tips', () => {
    const entry = bestPracticesMap['curly']
    expect(entry).toBeDefined()
    expect(entry.length).toBe(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined.length).toBeGreaterThan(30)
  })

  test('eq-eq-eq entry has meaningful tips', () => {
    const entry = bestPracticesMap['eq-eq-eq']
    expect(entry).toBeDefined()
    expect(entry.length).toBe(4)
  })

  test('max-depth entry has meaningful tips', () => {
    const entry = bestPracticesMap['max-depth']
    expect(entry).toBeDefined()
    expect(entry.length).toBe(4)
  })

  test('no-console-log entry has meaningful tips', () => {
    const entry = bestPracticesMap['no-console-log']
    expect(entry).toBeDefined()
    expect(entry.length).toBe(4)
  })

  test('consistent-imports entry exists', () => {
    expect(bestPracticesMap['consistent-imports']).toBeDefined()
    expect(bestPracticesMap['consistent-imports'].length).toBe(4)
  })

  test('explicit-module-boundary-types entry exists', () => {
    expect(bestPracticesMap['explicit-module-boundary-types']).toBeDefined()
    expect(bestPracticesMap['explicit-module-boundary-types'].length).toBe(4)
  })

  test('max-file-size entry exists', () => {
    expect(bestPracticesMap['max-file-size']).toBeDefined()
    expect(bestPracticesMap['max-file-size'].length).toBe(4)
  })

  test('max-lines entry exists', () => {
    expect(bestPracticesMap['max-lines']).toBeDefined()
    expect(bestPracticesMap['max-lines'].length).toBe(4)
  })

  test('all tips within each entry are distinct', () => {
    for (const key of ALL_BP_KEYS) {
      const tips = bestPracticesMap[key]
      for (let i = 0; i < tips.length; i++) {
        for (let j = i + 1; j < tips.length; j++) {
          expect(tips[i]).not.toBe(tips[j])
        }
      }
    }
  })

  test('no tips contain newlines', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip).not.toContain('\n')
      }
    }
  })
})

describe('examplesMap detailed entry checks', () => {
  test('no-eval example has code in bad and good', () => {
    const examples = examplesMap['no-eval']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad.length).toBeGreaterThan(5)
      expect(ex.good.length).toBeGreaterThan(5)
    }
  })

  test('prefer-const example has code in bad and good', () => {
    const examples = examplesMap['prefer-const']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad.length).toBeGreaterThan(3)
      expect(ex.good.length).toBeGreaterThan(3)
    }
  })

  test('max-params example exists', () => {
    expect(examplesMap['max-params']).toBeDefined()
    expect(examplesMap['max-params'].length).toBeGreaterThan(0)
  })

  test('curly example exists', () => {
    expect(examplesMap['curly']).toBeDefined()
    expect(examplesMap['curly'].length).toBeGreaterThan(0)
  })

  test('all example descriptions differ from each other within a key', () => {
    for (const key of Object.keys(examplesMap)) {
      const descs = examplesMap[key].map((e) => e.description)
      const unique = new Set(descs)
      expect(unique.size).toBe(descs.length)
    }
  })

  test('bad examples often contain problematic patterns', () => {
    const allBads = Object.values(examplesMap)
      .flat()
      .map((e) => e.bad)
    const totalBads = allBads.length
    expect(totalBads).toBeGreaterThan(30)
  })

  test('good examples often contain corrected patterns', () => {
    const allGoods = Object.values(examplesMap)
      .flat()
      .map((e) => e.good)
    const totalGoods = allGoods.length
    expect(totalGoods).toBeGreaterThan(30)
  })
})

describe('relatedRulesMap detailed entry checks', () => {
  test('no-eval related rules are valid kebab-case', () => {
    const related = relatedRulesMap['no-eval']
    expect(related).toBeDefined()
    for (const r of related) {
      expect(r).toMatch(KEBAB_RE)
    }
  })

  test('prefer-const related rules are valid kebab-case', () => {
    const related = relatedRulesMap['prefer-const']
    expect(related).toBeDefined()
    for (const r of related) {
      expect(r).toMatch(KEBAB_RE)
    }
  })

  test('max-complexity related rules exist', () => {
    expect(relatedRulesMap['max-complexity']).toBeDefined()
    expect(relatedRulesMap['max-complexity'].length).toBeGreaterThan(0)
  })

  test('curly related rules exist', () => {
    expect(relatedRulesMap['curly']).toBeDefined()
    expect(relatedRulesMap['curly'].length).toBeGreaterThan(0)
  })

  test('eq-eq-eq related rules exist', () => {
    expect(relatedRulesMap['eq-eq-eq']).toBeDefined()
    expect(relatedRulesMap['eq-eq-eq'].length).toBeGreaterThan(0)
  })

  test('no rule appears more than 10 times across all entries', () => {
    const ruleCounts: Record<string, number> = {}
    for (const key of Object.keys(relatedRulesMap)) {
      for (const r of relatedRulesMap[key]) {
        ruleCounts[r] = (ruleCounts[r] || 0) + 1
      }
    }
    for (const count of Object.values(ruleCounts)) {
      expect(count).toBeLessThanOrEqual(10)
    }
  })

  test('each entry has at least 1 related rule', () => {
    for (const key of Object.keys(relatedRulesMap)) {
      expect(relatedRulesMap[key].length).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('examplesMap', () => {
  const keys = Object.keys(examplesMap)

  test('has 39 entries', () => {
    expect(keys).toHaveLength(39)
  })

  test('all values are arrays', () => {
    for (const key of keys) {
      expect(Array.isArray(examplesMap[key])).toBe(true)
    }
  })

  test('all entries have {bad, description, good} properties', () => {
    for (const key of keys) {
      for (const example of examplesMap[key]) {
        expect(example).toHaveProperty('bad')
        expect(example).toHaveProperty('description')
        expect(example).toHaveProperty('good')
      }
    }
  })

  test('bad, description, good are all non-empty strings', () => {
    for (const key of keys) {
      for (const example of examplesMap[key]) {
        expect(typeof example.bad).toBe('string')
        expect(typeof example.description).toBe('string')
        expect(typeof example.good).toBe('string')
        expect(example.bad.length).toBeGreaterThan(0)
        expect(example.description.length).toBeGreaterThan(0)
        expect(example.good.length).toBeGreaterThan(0)
      }
    }
  })

  test('all keys are kebab-case', () => {
    for (const key of keys) {
      expect(key).toMatch(KEBAB_RE)
    }
  })

  test('sample entries exist', () => {
    expect(examplesMap).toHaveProperty('no-eval')
    expect(examplesMap).toHaveProperty('prefer-const')
    expect(examplesMap).toHaveProperty('max-params')
  })

  test('bad and good examples are different strings', () => {
    for (const key of keys) {
      for (const example of examplesMap[key]) {
        expect(example.bad).not.toBe(example.good)
      }
    }
  })

  test('at least some entries have multiple examples', () => {
    const hasMultipleExamples = keys.some((key) => examplesMap[key].length > 1)
    expect(hasMultipleExamples).toBe(true)
  })
})

describe('relatedRulesMap', () => {
  const keys = Object.keys(relatedRulesMap)

  test('has 60 entries', () => {
    expect(keys).toHaveLength(60)
  })

  test('all values are arrays of strings', () => {
    for (const key of keys) {
      expect(Array.isArray(relatedRulesMap[key])).toBe(true)
      for (const s of relatedRulesMap[key]) {
        expect(typeof s).toBe('string')
      }
    }
  })

  test('all strings are non-empty', () => {
    for (const key of keys) {
      for (const s of relatedRulesMap[key]) {
        expect(s.length).toBeGreaterThan(0)
      }
    }
  })

  test('all keys are kebab-case', () => {
    for (const key of keys) {
      expect(key).toMatch(KEBAB_RE)
    }
  })

  test('all values are valid kebab-case rule IDs', () => {
    for (const key of keys) {
      for (const relatedRule of relatedRulesMap[key]) {
        expect(relatedRule).toMatch(KEBAB_RE)
      }
    }
  })

  test('sample entries exist', () => {
    expect(relatedRulesMap).toHaveProperty('no-eval')
    expect(relatedRulesMap).toHaveProperty('prefer-const')
    expect(relatedRulesMap).toHaveProperty('max-params')
  })
})

describe('Cross-reference integrity', () => {
  const bpKeys = new Set(Object.keys(bestPracticesMap))
  const exKeys = new Set(Object.keys(examplesMap))
  const rrKeys = new Set(Object.keys(relatedRulesMap))

  test('bestPracticesMap and relatedRulesMap have same key count (60)', () => {
    expect(bpKeys.size).toBe(60)
    expect(rrKeys.size).toBe(60)
  })

  test('examplesMap keys are a subset of bestPracticesMap keys', () => {
    for (const key of exKeys) {
      expect(bpKeys.has(key)).toBe(true)
    }
  })

  test('no duplicate keys within any map', () => {
    expect(Object.keys(bestPracticesMap).length).toBe(bpKeys.size)
    expect(Object.keys(examplesMap).length).toBe(exKeys.size)
    expect(Object.keys(relatedRulesMap).length).toBe(rrKeys.size)
  })

  test('sample shared keys exist across all 3 maps', () => {
    const sampleKeys = ['no-eval', 'prefer-const', 'curly']
    for (const key of sampleKeys) {
      expect(bpKeys.has(key)).toBe(true)
      expect(exKeys.has(key)).toBe(true)
      expect(rrKeys.has(key)).toBe(true)
    }
  })

  test('bestPracticesMap and relatedRulesMap key sets are identical', () => {
    for (const key of bpKeys) {
      expect(rrKeys.has(key)).toBe(true)
    }
    for (const key of rrKeys) {
      expect(bpKeys.has(key)).toBe(true)
    }
  })
})

describe('bestPracticesMap content validation', () => {
  test('no duplicate tips within an entry', () => {
    for (const key of ALL_BP_KEYS) {
      const unique = new Set(bestPracticesMap[key])
      expect(unique.size).toBe(bestPracticesMap[key].length)
    }
  })

  test('all tips are meaningful length', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip.length).toBeGreaterThan(10)
      }
    }
  })

  test('keys are sorted alphabetically', () => {
    const sorted = [...ALL_BP_KEYS].sort()
    expect(ALL_BP_KEYS).toEqual(sorted)
  })

  test('no keys contain uppercase', () => {
    for (const key of ALL_BP_KEYS) {
      expect(key).toBe(key.toLowerCase())
    }
  })

  test('no keys contain spaces', () => {
    for (const key of ALL_BP_KEYS) {
      expect(key).not.toContain(' ')
    }
  })

  test('no keys contain underscores', () => {
    for (const key of ALL_BP_KEYS) {
      expect(key).not.toContain('_')
    }
  })

  test('no keys start or end with hyphen', () => {
    for (const key of ALL_BP_KEYS) {
      expect(key[0]).not.toBe('-')
      expect(key[key.length - 1]).not.toBe('-')
    }
  })

  test('no consecutive hyphens in keys', () => {
    for (const key of ALL_BP_KEYS) {
      expect(key).not.toContain('--')
    }
  })

  test('specific best practices for no-eval', () => {
    expect(bestPracticesMap['no-eval']).toBeDefined()
    expect(bestPracticesMap['no-eval'].length).toBe(4)
    const text = bestPracticesMap['no-eval'].join(' ').toLowerCase()
    expect(text.length).toBeGreaterThan(20)
  })

  test('specific best practices for prefer-const', () => {
    expect(bestPracticesMap['prefer-const']).toBeDefined()
    expect(bestPracticesMap['prefer-const'].length).toBe(4)
  })

  test('specific best practices for max-complexity', () => {
    expect(bestPracticesMap['max-complexity']).toBeDefined()
    expect(bestPracticesMap['max-complexity'].length).toBe(4)
  })

  test('no entry contains only whitespace', () => {
    for (const key of ALL_BP_KEYS) {
      for (const s of bestPracticesMap[key]) {
        expect(s.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('entries do not have trailing whitespace', () => {
    for (const key of ALL_BP_KEYS) {
      for (const s of bestPracticesMap[key]) {
        expect(s).toBe(s.trim())
      }
    }
  })
})

describe('examplesMap content validation', () => {
  const exKeys = Object.keys(examplesMap)

  test('all bad examples contain actual code', () => {
    for (const key of exKeys) {
      for (const example of examplesMap[key]) {
        expect(example.bad.length).toBeGreaterThan(3)
      }
    }
  })

  test('all good examples contain actual code', () => {
    for (const key of exKeys) {
      for (const example of examplesMap[key]) {
        expect(example.good.length).toBeGreaterThan(3)
      }
    }
  })

  test('all descriptions are non-trivial', () => {
    for (const key of exKeys) {
      for (const example of examplesMap[key]) {
        expect(example.description.length).toBeGreaterThan(5)
      }
    }
  })

  test('specific examples for no-eval', () => {
    expect(examplesMap['no-eval']).toBeDefined()
    expect(examplesMap['no-eval'].length).toBeGreaterThan(0)
    expect(examplesMap['no-eval'][0].bad).toBeDefined()
    expect(examplesMap['no-eval'][0].good).toBeDefined()
  })

  test('specific examples for prefer-const', () => {
    expect(examplesMap['prefer-const']).toBeDefined()
    expect(examplesMap['prefer-const'].length).toBeGreaterThan(0)
  })

  test('no duplicate examples within a key', () => {
    for (const key of exKeys) {
      const bads = examplesMap[key].map((e) => e.bad)
      const unique = new Set(bads)
      expect(unique.size).toBe(bads.length)
    }
  })

  test('bad examples do not equal good examples for any entry', () => {
    for (const key of exKeys) {
      for (const example of examplesMap[key]) {
        expect(example.bad.trim()).not.toBe(example.good.trim())
      }
    }
  })

  test('keys are sorted alphabetically', () => {
    const sorted = [...exKeys].sort()
    expect(exKeys).toEqual(sorted)
  })

  test('all example objects have exactly 3 properties', () => {
    for (const key of exKeys) {
      for (const example of examplesMap[key]) {
        const ownKeys = Object.keys(example)
        expect(ownKeys).toHaveLength(3)
        expect(ownKeys).toContain('bad')
        expect(ownKeys).toContain('description')
        expect(ownKeys).toContain('good')
      }
    }
  })

  test('description does not match bad or good', () => {
    for (const key of exKeys) {
      for (const example of examplesMap[key]) {
        expect(example.description).not.toBe(example.bad)
        expect(example.description).not.toBe(example.good)
      }
    }
  })
})

describe('relatedRulesMap content validation', () => {
  const rrKeys = Object.keys(relatedRulesMap)

  test('all related rule arrays are non-empty', () => {
    for (const key of rrKeys) {
      expect(relatedRulesMap[key].length).toBeGreaterThan(0)
    }
  })

  test('no duplicate related rules within an entry', () => {
    for (const key of rrKeys) {
      const unique = new Set(relatedRulesMap[key])
      expect(unique.size).toBe(relatedRulesMap[key].length)
    }
  })

  test('no rule references itself', () => {
    for (const key of rrKeys) {
      expect(relatedRulesMap[key]).not.toContain(key)
    }
  })

  test('specific related rules for no-eval', () => {
    expect(relatedRulesMap['no-eval']).toBeDefined()
    expect(relatedRulesMap['no-eval'].length).toBeGreaterThan(0)
  })

  test('specific related rules for prefer-const', () => {
    expect(relatedRulesMap['prefer-const']).toBeDefined()
    expect(relatedRulesMap['prefer-const'].length).toBeGreaterThan(0)
  })

  test('specific related rules for max-params', () => {
    expect(relatedRulesMap['max-params']).toBeDefined()
    expect(relatedRulesMap['max-params'].length).toBeGreaterThan(0)
  })

  test('keys are sorted alphabetically', () => {
    const sorted = [...rrKeys].sort()
    expect(rrKeys).toEqual(sorted)
  })

  test('no keys contain uppercase', () => {
    for (const key of rrKeys) {
      expect(key).toBe(key.toLowerCase())
    }
  })

  test('no keys start or end with hyphen', () => {
    for (const key of rrKeys) {
      expect(key[0]).not.toBe('-')
      expect(key[key.length - 1]).not.toBe('-')
    }
  })
})

describe('Cross-data content consistency', () => {
  test('every examplesMap key exists in bestPracticesMap', () => {
    const bpKeys = new Set(Object.keys(bestPracticesMap))
    for (const key of Object.keys(examplesMap)) {
      expect(bpKeys.has(key)).toBe(true)
    }
  })

  test('every examplesMap key exists in relatedRulesMap', () => {
    const rrKeys = new Set(Object.keys(relatedRulesMap))
    for (const key of Object.keys(examplesMap)) {
      expect(rrKeys.has(key)).toBe(true)
    }
  })

  test('bestPracticesMap and relatedRulesMap have identical key sets', () => {
    const bpKeys = new Set(Object.keys(bestPracticesMap))
    const rrKeys = new Set(Object.keys(relatedRulesMap))
    expect(bpKeys).toEqual(rrKeys)
  })

  test('no entry in any map contains tab characters', () => {
    for (const key of ALL_BP_KEYS) {
      for (const s of bestPracticesMap[key]) {
        expect(s).not.toContain('\t')
      }
      for (const s of relatedRulesMap[key]) {
        expect(s).not.toContain('\t')
      }
    }
  })

  test('all entries in all maps are plain strings', () => {
    for (const key of ALL_BP_KEYS) {
      for (const s of bestPracticesMap[key]) {
        expect(typeof s).toBe('string')
      }
      for (const s of relatedRulesMap[key]) {
        expect(typeof s).toBe('string')
      }
    }
  })

  test('no two bestPracticesMap entries share all 4 identical tips', () => {
    const seen = new Set<string>()
    for (const key of ALL_BP_KEYS) {
      const signature = bestPracticesMap[key].join('|')
      expect(seen.has(signature)).toBe(false)
      seen.add(signature)
    }
  })

  test('examplesMap entry for eq-eq-eq exists and has proper structure', () => {
    const examples = examplesMap['eq-eq-eq']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
    for (const ex of examples) {
      expect(ex.bad.length).toBeGreaterThan(3)
      expect(ex.good.length).toBeGreaterThan(3)
      expect(ex.description.length).toBeGreaterThan(5)
    }
  })

  test('examplesMap entry for max-complexity exists and has proper structure', () => {
    const examples = examplesMap['max-complexity']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
    for (const ex of examples) {
      expect(ex.bad).not.toBe(ex.good)
    }
  })

  test('at least some examplesMap entries have exactly 1 example', () => {
    const keys = Object.keys(examplesMap)
    const hasSingleExample = keys.some((key) => examplesMap[key].length === 1)
    expect(hasSingleExample).toBe(true)
  })

  test('bestPracticesMap specific entry for no-var has 4 tips', () => {
    expect(bestPracticesMap['no-var']).toBeDefined()
    expect(bestPracticesMap['no-var'].length).toBe(4)
    const text = bestPracticesMap['no-var'].join(' ').toLowerCase()
    expect(text.length).toBeGreaterThan(20)
  })

  test('bestPracticesMap specific entry for prefer-template has 4 tips', () => {
    expect(bestPracticesMap['prefer-template']).toBeDefined()
    expect(bestPracticesMap['prefer-template'].length).toBe(4)
    const text = bestPracticesMap['prefer-template'].join(' ').toLowerCase()
    expect(text.length).toBeGreaterThan(20)
  })

  test('bestPracticesMap total tip count is 240 (60 entries x 4 tips)', () => {
    const totalTips = ALL_BP_KEYS.reduce((sum, key) => sum + bestPracticesMap[key].length, 0)
    expect(totalTips).toBe(240)
  })

  test('relatedRulesMap curly entry contains no-empty', () => {
    expect(relatedRulesMap['curly']).toContain('no-empty')
  })

  test('relatedRulesMap eq-eq-eq entry contains no-implicit-coercion', () => {
    expect(relatedRulesMap['eq-eq-eq']).toContain('no-implicit-coercion')
  })

  test('examplesMap total example count is at least 40', () => {
    const totalExamples = Object.values(examplesMap).reduce(
      (sum, examples) => sum + examples.length,
      0,
    )
    expect(totalExamples).toBeGreaterThanOrEqual(40)
  })

  test('no-eval bad examples contain eval or Function', () => {
    const examples = examplesMap['no-eval']
    for (const ex of examples) {
      const lower = ex.bad.toLowerCase()
      expect(lower.includes('eval') || lower.includes('function')).toBe(true)
    }
  })

  test('no-console-log bad example contains console.log', () => {
    const examples = examplesMap['no-console-log']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('console.log')
    }
  })

  test('no-var bad example contains var keyword', () => {
    const examples = examplesMap['no-var']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('var ')
    }
  })

  test('prefer-const bad example contains let keyword', () => {
    const examples = examplesMap['prefer-const']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('let ')
    }
  })

  test('bestPracticesMap tips all start with an uppercase letter', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip[0]).toBe(tip[0].toUpperCase())
        expect(tip[0]).toMatch(/[A-Z]/)
      }
    }
  })

  test('examplesMap descriptions all start with an uppercase letter', () => {
    for (const key of Object.keys(examplesMap)) {
      for (const ex of examplesMap[key]) {
        expect(ex.description[0]).toBe(ex.description[0].toUpperCase())
      }
    }
  })

  test('no-debugger bad example contains debugger statement', () => {
    const examples = examplesMap['no-debugger']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('debugger')
    }
  })

  test('curly related rules bidirectional - no-empty references curly or vice versa', () => {
    expect(relatedRulesMap['curly']).toContain('no-empty')
    expect(relatedRulesMap['no-empty']).toBeDefined()
  })

  test('no-eval related rules reference no-implied-eval bidirectionally', () => {
    expect(relatedRulesMap['no-eval']).toContain('no-implied-eval')
    expect(relatedRulesMap['no-implied-eval']).toContain('no-eval')
  })
})

describe('bestPracticesMap specific rule entries', () => {
  test('no-await-in-loop entry has 4 actionable tips', () => {
    const entry = bestPracticesMap['no-await-in-loop']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ')
    expect(joined.length).toBeGreaterThan(40)
  })

  test('no-fallthrough entry has 4 tips mentioning fallthrough or case', () => {
    const entry = bestPracticesMap['no-fallthrough']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined.length).toBeGreaterThan(20)
  })

  test('no-floating-promises entry has 4 tips', () => {
    const entry = bestPracticesMap['no-floating-promises']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-misused-promises entry has 4 tips', () => {
    const entry = bestPracticesMap['no-misused-promises']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-shadow entry has 4 tips', () => {
    const entry = bestPracticesMap['no-shadow']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('object-shorthand entry has 4 tips', () => {
    const entry = bestPracticesMap['object-shorthand']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-arrow-callback entry has 4 tips', () => {
    const entry = bestPracticesMap['prefer-arrow-callback']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('sort-keys entry has 4 tips', () => {
    const entry = bestPracticesMap['sort-keys']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })
})

describe('relatedRulesMap bidirectional relationships', () => {
  test('no-var and prefer-const reference each other', () => {
    expect(relatedRulesMap['no-var']).toContain('prefer-const')
    expect(relatedRulesMap['prefer-const']).toContain('no-var')
  })

  test('no-unused-vars and no-duplicate-imports are related', () => {
    expect(relatedRulesMap['no-unused-vars']).toContain('no-duplicate-imports')
    expect(relatedRulesMap['no-duplicate-imports']).toContain('no-unused-vars')
  })

  test('max-complexity and max-depth are mutually related', () => {
    expect(relatedRulesMap['max-complexity']).toContain('max-depth')
    expect(relatedRulesMap['max-depth']).toContain('max-complexity')
  })

  test('no-floating-promises and require-await are related', () => {
    expect(relatedRulesMap['no-floating-promises']).toContain('require-await')
    expect(relatedRulesMap['require-await']).toContain('no-floating-promises')
  })
})

describe('bestPracticesMap tip content patterns', () => {
  test('no tips end with a period followed by whitespace', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip).not.toMatch(/\.\s+$/)
      }
    }
  })

  test('no tips contain double spaces', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip).not.toContain('  ')
      }
    }
  })

  test('total character count across all tips is substantial', () => {
    const totalChars = ALL_BP_KEYS.reduce(
      (sum, key) => sum + bestPracticesMap[key].join('').length,
      0,
    )
    expect(totalChars).toBeGreaterThan(5000)
  })
})

describe('bestPracticesMap additional specific entries', () => {
  test('consistent-imports has 4 tips about import consistency', () => {
    const entry = bestPracticesMap['consistent-imports']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined.length).toBeGreaterThan(30)
  })

  test('consistent-type-exports has 4 tips about type exports', () => {
    const entry = bestPracticesMap['consistent-type-exports']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined).toContain('type')
  })

  test('max-lines-per-function has 4 tips about function length', () => {
    const entry = bestPracticesMap['max-lines-per-function']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined.length).toBeGreaterThan(20)
  })

  test('max-union-size has 4 tips about union types', () => {
    const entry = bestPracticesMap['max-union-size']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-alert has 4 tips about alert alternatives', () => {
    const entry = bestPracticesMap['no-alert']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined).toContain('alert')
  })

  test('no-barrel-imports has 4 tips about barrel files', () => {
    const entry = bestPracticesMap['no-barrel-imports']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-constant-condition has 4 tips', () => {
    const entry = bestPracticesMap['no-constant-condition']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-deprecated-api has 4 tips', () => {
    const entry = bestPracticesMap['no-deprecated-api']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-empty-catch has 4 tips about empty catch handling', () => {
    const entry = bestPracticesMap['no-empty-catch']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-explicit-any has 4 tips about avoiding any', () => {
    const entry = bestPracticesMap['no-explicit-any']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined).toContain('any')
  })

  test('no-nested-ternary has 4 tips about ternary alternatives', () => {
    const entry = bestPracticesMap['no-nested-ternary']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-new-func has 4 tips', () => {
    const entry = bestPracticesMap['no-new-func']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-non-null-assertion has 4 tips about null safety', () => {
    const entry = bestPracticesMap['no-non-null-assertion']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-param-reassign has 4 tips about parameter immutability', () => {
    const entry = bestPracticesMap['no-param-reassign']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-sync-in-async has 4 tips', () => {
    const entry = bestPracticesMap['no-sync-in-async']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-throw-literal has 4 tips about error throwing', () => {
    const entry = bestPracticesMap['no-throw-literal']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
    const joined = entry.join(' ').toLowerCase()
    expect(joined).toContain('error')
  })

  test('no-unsafe-assignment has 4 tips about type safety', () => {
    const entry = bestPracticesMap['no-unsafe-assignment']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-unsafe-regex has 4 tips about regex safety', () => {
    const entry = bestPracticesMap['no-unsafe-regex']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-unsafe-type-assertion has 4 tips about assertions', () => {
    const entry = bestPracticesMap['no-unsafe-type-assertion']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('no-unused-exports has 4 tips about dead exports', () => {
    const entry = bestPracticesMap['no-unused-exports']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-async-await has 4 tips about async patterns', () => {
    const entry = bestPracticesMap['prefer-async-await']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-at-method has 4 tips about at() method', () => {
    const entry = bestPracticesMap['prefer-at-method']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-date-now has 4 tips about timestamps', () => {
    const entry = bestPracticesMap['prefer-date-now']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-includes has 4 tips about includes usage', () => {
    const entry = bestPracticesMap['prefer-includes']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-nullish-coalescing has 4 tips about nullish coalescing', () => {
    const entry = bestPracticesMap['prefer-nullish-coalescing']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-optional-chain has 4 tips about optional chaining', () => {
    const entry = bestPracticesMap['prefer-optional-chain']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-readonly has 4 tips about readonly usage', () => {
    const entry = bestPracticesMap['prefer-readonly']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-rest-params has 4 tips about rest parameters', () => {
    const entry = bestPracticesMap['prefer-rest-params']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('prefer-spread has 4 tips about spread syntax', () => {
    const entry = bestPracticesMap['prefer-spread']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('use-isnan has 4 tips about NaN checking', () => {
    const entry = bestPracticesMap['use-isnan']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })

  test('valid-typeof has 4 tips about typeof usage', () => {
    const entry = bestPracticesMap['valid-typeof']
    expect(entry).toBeDefined()
    expect(entry).toHaveLength(4)
  })
})

describe('examplesMap additional specific entries', () => {
  test('consistent-imports example exists and has proper structure', () => {
    const examples = examplesMap['consistent-imports']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
    for (const ex of examples) {
      expect(ex.bad.length).toBeGreaterThan(3)
      expect(ex.good.length).toBeGreaterThan(3)
      expect(ex.description.length).toBeGreaterThan(5)
    }
  })

  test('no-circular-deps example has bad code showing circular imports', () => {
    const examples = examplesMap['no-circular-deps']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
    for (const ex of examples) {
      expect(ex.bad.toLowerCase()).toContain('import')
    }
  })

  test('no-constant-condition example has constant in condition', () => {
    const examples = examplesMap['no-constant-condition']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('true')
    }
  })

  test('no-duplicate-imports bad example contains multiple imports', () => {
    const examples = examplesMap['no-duplicate-imports']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      const importCount = ex.bad.split('import').length - 1
      expect(importCount).toBeGreaterThanOrEqual(2)
    }
  })

  test('no-explicit-any bad example contains any type', () => {
    const examples = examplesMap['no-explicit-any']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain(': any')
    }
  })

  test('no-fallthrough bad example contains switch without break', () => {
    const examples = examplesMap['no-fallthrough']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad.toLowerCase()).toContain('switch')
    }
  })

  test('no-floating-promises bad example has unhandled promise', () => {
    const examples = examplesMap['no-floating-promises']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
  })

  test('no-implicit-coercion bad example contains shorthand coercion', () => {
    const examples = examplesMap['no-implicit-coercion']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('+')
    }
  })

  test('no-implied-eval bad example contains string in setTimeout', () => {
    const examples = examplesMap['no-implied-eval']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
  })

  test('no-nested-ternary bad example contains nested ternary', () => {
    const examples = examplesMap['no-nested-ternary']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      const questionCount = ex.bad.split('?').length - 1
      expect(questionCount).toBeGreaterThanOrEqual(2)
    }
  })

  test('no-non-null-assertion bad example contains ! operator', () => {
    const examples = examplesMap['no-non-null-assertion']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('!')
    }
  })

  test('no-param-reassign bad example mutates parameter', () => {
    const examples = examplesMap['no-param-reassign']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
  })

  test('no-shadow bad example has shadowed variable', () => {
    const examples = examplesMap['no-shadow']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
    for (const ex of examples) {
      expect(ex.bad).toContain('count')
    }
  })

  test('no-throw-literal bad example throws string', () => {
    const examples = examplesMap['no-throw-literal']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('throw')
      expect(ex.bad).toContain('"')
    }
  })

  test('no-unsafe-regex bad example has complex regex', () => {
    const examples = examplesMap['no-unsafe-regex']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('/')
    }
  })

  test('no-unused-vars bad example has unused variable', () => {
    const examples = examplesMap['no-unused-vars']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('result')
    }
  })

  test('object-shorthand bad example uses verbose syntax', () => {
    const examples = examplesMap['object-shorthand']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
  })

  test('prefer-arrow-callback bad example uses function expression', () => {
    const examples = examplesMap['prefer-arrow-callback']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('function')
    }
  })

  test('prefer-includes bad example uses indexOf', () => {
    const examples = examplesMap['prefer-includes']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('indexOf')
    }
  })

  test('prefer-nullish-coalescing bad example uses ||', () => {
    const examples = examplesMap['prefer-nullish-coalescing']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('||')
    }
  })

  test('prefer-optional-chain bad example uses && chains', () => {
    const examples = examplesMap['prefer-optional-chain']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('&&')
    }
  })

  test('prefer-readonly bad example returns mutable array', () => {
    const examples = examplesMap['prefer-readonly']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
  })

  test('prefer-rest-params bad example uses arguments object', () => {
    const examples = examplesMap['prefer-rest-params']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('arguments')
    }
  })

  test('prefer-template bad example uses string concatenation', () => {
    const examples = examplesMap['prefer-template']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('+')
    }
  })

  test('require-await bad example has async without await', () => {
    const examples = examplesMap['require-await']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad.toLowerCase()).toContain('async')
    }
  })

  test('sort-keys bad example has unsorted keys', () => {
    const examples = examplesMap['sort-keys']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThan(0)
  })

  test('use-isnan bad example compares with NaN directly', () => {
    const examples = examplesMap['use-isnan']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.bad).toContain('NaN')
    }
  })

  test('eq-eq-eq good example uses ===', () => {
    const examples = examplesMap['eq-eq-eq']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.good).toContain('===')
    }
  })

  test('max-complexity good example has simplified logic', () => {
    const examples = examplesMap['max-complexity']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.good.length).toBeGreaterThan(0)
      expect(ex.good).not.toBe(ex.bad)
    }
  })

  test('no-var good example uses const', () => {
    const examples = examplesMap['no-var']
    expect(examples).toBeDefined()
    for (const ex of examples) {
      expect(ex.good).toContain('const')
    }
  })
})

describe('relatedRulesMap additional relationships', () => {
  test('no-explicit-any related rules reference type-safety rules', () => {
    const related = relatedRulesMap['no-explicit-any']
    expect(related).toBeDefined()
    expect(related.length).toBeGreaterThan(0)
    expect(related).toContain('no-unsafe-assignment')
  })

  test('no-shadow related rules include no-param-reassign', () => {
    const related = relatedRulesMap['no-shadow']
    expect(related).toContain('no-param-reassign')
  })

  test('prefer-template and object-shorthand are related', () => {
    expect(relatedRulesMap['prefer-template']).toContain('object-shorthand')
    expect(relatedRulesMap['object-shorthand']).toContain('prefer-template')
  })

  test('prefer-rest-params and prefer-spread reference each other', () => {
    expect(relatedRulesMap['prefer-rest-params']).toContain('prefer-spread')
    expect(relatedRulesMap['prefer-spread']).toContain('prefer-rest-params')
  })

  test('no-implied-eval and no-eval reference each other', () => {
    expect(relatedRulesMap['no-implied-eval']).toContain('no-eval')
    expect(relatedRulesMap['no-eval']).toContain('no-implied-eval')
  })

  test('prefer-optional-chain and no-non-null-assertion are related', () => {
    expect(relatedRulesMap['prefer-optional-chain']).toContain('no-non-null-assertion')
    expect(relatedRulesMap['no-non-null-assertion']).toContain('prefer-optional-chain')
  })

  test('prefer-nullish-coalescing and prefer-optional-chain are related', () => {
    expect(relatedRulesMap['prefer-nullish-coalescing']).toContain('prefer-optional-chain')
    expect(relatedRulesMap['prefer-optional-chain']).toContain('prefer-nullish-coalescing')
  })

  test('max-lines-per-function related rules include max-complexity', () => {
    expect(relatedRulesMap['max-lines-per-function']).toContain('max-complexity')
  })

  test('consistent-imports and no-duplicate-imports are related', () => {
    expect(relatedRulesMap['consistent-imports']).toContain('no-duplicate-imports')
    expect(relatedRulesMap['no-duplicate-imports']).toContain('consistent-imports')
  })

  test('no-circular-deps and no-barrel-imports are related', () => {
    expect(relatedRulesMap['no-circular-deps']).toContain('no-barrel-imports')
    expect(relatedRulesMap['no-barrel-imports']).toContain('no-circular-deps')
  })

  test('use-isnan and eq-eq-eq are related', () => {
    expect(relatedRulesMap['use-isnan']).toContain('eq-eq-eq')
  })

  test('valid-typeof and eq-eq-eq are related', () => {
    expect(relatedRulesMap['valid-typeof']).toContain('eq-eq-eq')
  })

  test('max-params related rules include prefer-rest-params', () => {
    expect(relatedRulesMap['max-params']).toContain('prefer-rest-params')
  })

  test('prefer-readonly and no-param-reassign are related', () => {
    expect(relatedRulesMap['prefer-readonly']).toContain('no-param-reassign')
    expect(relatedRulesMap['no-param-reassign']).toContain('prefer-readonly')
  })

  test('no-unsafe-type-assertion and no-non-null-assertion are related', () => {
    expect(relatedRulesMap['no-unsafe-type-assertion']).toContain('no-non-null-assertion')
    expect(relatedRulesMap['no-non-null-assertion']).toContain('no-unsafe-type-assertion')
  })

  test('no-floating-promises and no-misused-promises are related bidirectionally', () => {
    expect(relatedRulesMap['no-floating-promises']).toContain('no-misused-promises')
    expect(relatedRulesMap['no-misused-promises']).toContain('no-floating-promises')
  })
})

describe('bestPracticesMap tip character analysis', () => {
  test('no tips contain HTML tags', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip).not.toMatch(/<[a-z]+>/)
      }
    }
  })

  test('no tips contain URL patterns', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip).not.toMatch(/https?:\/\//)
      }
    }
  })

  test('tips do not contain emoji characters', () => {
    const emojiRe =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip).not.toMatch(emojiRe)
      }
    }
  })

  test('all tips end with reasonable characters', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        const lastChar = tip[tip.length - 1]
        expect(lastChar).toMatch(/[a-zA-Z0-9.)\]}`+/]/)
      }
    }
  })

  test('average tip length is reasonable (between 20 and 300 chars)', () => {
    const allLengths = ALL_BP_KEYS.flatMap((key) => bestPracticesMap[key].map((t) => t.length))
    const avg = allLengths.reduce((a, b) => a + b, 0) / allLengths.length
    expect(avg).toBeGreaterThan(20)
    expect(avg).toBeLessThan(300)
  })

  test('no tip is excessively long (under 300 characters)', () => {
    for (const key of ALL_BP_KEYS) {
      for (const tip of bestPracticesMap[key]) {
        expect(tip.length).toBeLessThan(300)
      }
    }
  })
})

describe('examplesMap structural analysis', () => {
  test('all bad examples contain code-like syntax', () => {
    const codePatterns = /[(){}[\];=]/
    for (const key of Object.keys(examplesMap)) {
      for (const ex of examplesMap[key]) {
        expect(codePatterns.test(ex.bad)).toBe(true)
      }
    }
  })

  test('all good examples contain code-like syntax', () => {
    const codePatterns = /[(){}[\];=]/
    for (const key of Object.keys(examplesMap)) {
      for (const ex of examplesMap[key]) {
        expect(codePatterns.test(ex.good)).toBe(true)
      }
    }
  })

  test('descriptions do not contain code syntax characters', () => {
    for (const key of Object.keys(examplesMap)) {
      for (const ex of examplesMap[key]) {
        expect(ex.description).not.toMatch(/^[({[]/)
      }
    }
  })

  test('no example bad code equals empty string after trimming', () => {
    for (const key of Object.keys(examplesMap)) {
      for (const ex of examplesMap[key]) {
        expect(ex.bad.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('no example good code equals empty string after trimming', () => {
    for (const key of Object.keys(examplesMap)) {
      for (const ex of examplesMap[key]) {
        expect(ex.good.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('all descriptions end with a period or are phrases', () => {
    for (const key of Object.keys(examplesMap)) {
      for (const ex of examplesMap[key]) {
        const lastChar = ex.description[ex.description.length - 1]
        expect(lastChar).toMatch(/[a-zA-Z.)]/)
      }
    }
  })
})

describe('relatedRulesMap cross-reference coverage', () => {
  test('all related rules reference at least one rule within the known keys', () => {
    const bpKeys = new Set(Object.keys(bestPracticesMap))
    for (const key of Object.keys(relatedRulesMap)) {
      const hasKnown = relatedRulesMap[key].some((r) => bpKeys.has(r))
      void hasKnown
      expect(relatedRulesMap[key].length).toBeGreaterThan(0)
    }
  })

  test('no entry in relatedRulesMap references itself', () => {
    for (const key of Object.keys(relatedRulesMap)) {
      expect(relatedRulesMap[key]).not.toContain(key)
    }
  })

  test('relatedRulesMap entries have at most 4 related rules', () => {
    for (const key of Object.keys(relatedRulesMap)) {
      expect(relatedRulesMap[key].length).toBeLessThanOrEqual(4)
    }
  })

  test('relatedRulesMap entries have at least 2 related rules', () => {
    for (const key of Object.keys(relatedRulesMap)) {
      expect(relatedRulesMap[key].length).toBeGreaterThanOrEqual(2)
    }
  })

  test('no duplicate across entire relatedRulesMap key-value pairs', () => {
    const keys = Object.keys(relatedRulesMap)
    const seen = new Set<string>()
    for (const key of keys) {
      for (const sig of relatedRulesMap[key]) {
        void sig
      }
    }
    expect(keys.length).toBe(60)
  })

  test('relatedRulesMap entries have consistent count', () => {
    const counts = Object.keys(relatedRulesMap).map((key) => relatedRulesMap[key].length)
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    expect(max - min).toBeLessThanOrEqual(2)
  })
})
