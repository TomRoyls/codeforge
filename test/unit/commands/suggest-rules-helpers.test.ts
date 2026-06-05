import { describe, test, expect } from 'vitest'

import {
  addSuggestion,
  analyzeFile,
  displaySuggestions,
  filterSuggestions,
  findMatches,
  formatConfidenceColor,
  formatImpactColor,
  PATTERN_DETECTORS,
  sortSuggestions,
  type PatternDetector,
  type RuleSuggestion,
  type SuggestedRule,
} from '../../../src/commands/suggest-rules-helpers.js'

const mockGetRuleCategory = (ruleId: string): string => {
  const categories: Record<string, string> = {
    'no-console': 'patterns',
    'no-explicit-any': 'patterns',
    'prefer-const': 'patterns',
    'eq-eq-eq': 'patterns',
    'no-eval': 'security',
    'no-magic-numbers': 'patterns',
    'max-depth': 'complexity',
    'no-async-without-await': 'patterns',
    'prefer-nullish-coalescing': 'patterns',
    'no-unsafe-type-assertion': 'patterns',
    'no-duplicate-code': 'patterns',
    'max-lines-per-function': 'complexity',
  }
  return categories[ruleId] ?? 'patterns'
}

function makeSuggestion(overrides: Partial<RuleSuggestion> = {}): RuleSuggestion {
  return {
    category: 'patterns',
    confidence: 'high',
    estimatedViolations: 5,
    impact: 'high',
    reason: 'Test reason',
    ruleId: 'test-rule',
    ...overrides,
  }
}

function makeSuggestedRule(overrides: Partial<SuggestedRule> = {}): SuggestedRule {
  return {
    confidence: 'high',
    impact: 'high',
    reason: 'Test reason',
    ruleId: 'test-rule',
    ...overrides,
  }
}

function makeDetector(overrides: Partial<PatternDetector> = {}): PatternDetector {
  return {
    name: 'Test detector',
    patterns: ['test-pattern'],
    suggestedRules: [makeSuggestedRule()],
    ...overrides,
  }
}

describe('findMatches', () => {
  describe('string patterns', () => {
    test('returns 0 for no matches', () => {
      expect(findMatches('hello world', 'xyz')).toBe(0)
    })

    test('returns 1 for single match', () => {
      expect(findMatches('console.log("test")', 'console.log')).toBe(1)
    })

    test('returns correct count for multiple matches', () => {
      expect(findMatches('console.log("a"); console.log("b");', 'console.log')).toBe(2)
    })

    test('counts overlapping pattern occurrences correctly', () => {
      expect(findMatches('aaa', 'aa')).toBe(2)
    })

    test('returns 0 for empty content', () => {
      expect(findMatches('', 'test')).toBe(0)
    })

    test('matches at beginning of string', () => {
      expect(findMatches('test hello', 'test')).toBe(1)
    })

    test('matches at end of string', () => {
      expect(findMatches('hello test', 'test')).toBe(1)
    })

    test('counts exact string not partial', () => {
      expect(findMatches(': any thing', ': any')).toBe(1)
    })

    test('finds multiple var declarations', () => {
      expect(findMatches('var x = 1; var y = 2; var z = 3;', 'var ')).toBe(3)
    })

    test('finds loose equality operators', () => {
      expect(findMatches('if (a == b) {}', ' == ')).toBe(1)
    })

    test('finds eval pattern', () => {
      expect(findMatches('eval("code")', 'eval(')).toBe(1)
    })

    test('finds new Function pattern', () => {
      expect(findMatches('new Function("return x")', 'new Function(')).toBe(1)
    })

    test('finds loose inequality operator', () => {
      expect(findMatches('if (a != null) {}', ' != ')).toBe(1)
    })

    test('is case sensitive for string patterns', () => {
      expect(findMatches('Console.Log("test")', 'console.log')).toBe(0)
    })

    test('finds multiple console variants', () => {
      expect(findMatches('console.warn("a")', 'console.warn')).toBe(1)
    })

    test('returns 0 for non-matching pattern in non-empty content', () => {
      expect(findMatches('hello world foo bar', 'baz')).toBe(0)
    })

    test('finds pattern repeated many times', () => {
      expect(findMatches('abc abc abc abc abc', 'abc')).toBe(5)
    })

    test('finds single char pattern', () => {
      expect(findMatches('a b a c a', 'a')).toBe(3)
    })

    test('finds as any pattern', () => {
      expect(findMatches('const x = y as any;', 'as any')).toBe(1)
    })

    test('finds angle bracket any pattern', () => {
      expect(findMatches('const x =<any>y;', '<any>')).toBe(1)
    })
  })

  describe('regex patterns', () => {
    test('returns 0 for no regex match', () => {
      expect(findMatches('hello world', /\d+/)).toBe(0)
    })

    test('returns count for regex matches', () => {
      expect(findMatches('abc 123 def 456', /\d+/)).toBe(2)
    })

    test('works with global regex', () => {
      expect(findMatches('a1a2a3', /a\d/g)).toBe(3)
    })

    test('works with non-global regex by creating global copy', () => {
      expect(findMatches('test123 test456', /test\d{3}/)).toBe(2)
    })

    test('returns 0 for empty content with regex', () => {
      expect(findMatches('', /test/)).toBe(0)
    })

    test('magic numbers regex pattern', () => {
      expect(findMatches('const x = 42; const y = 100;', /\b\d{2,}\b/)).toBe(2)
    })

    test('nested conditionals regex', () => {
      const code = 'if (a) { if (b) {} }'
      expect(findMatches(code, /if\s*\([^)]*\)\s*\{[^}]*if\s*\(/)).toBe(1)
    })

    test('async without await regex', () => {
      const code = 'async function test(x) { return x; }'
      expect(findMatches(code, /async\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/)).toBe(1)
    })

    test('null checks regex', () => {
      expect(findMatches('x === null', /===\s*null/)).toBe(1)
    })

    test('undefined checks regex', () => {
      expect(findMatches('x !== undefined', /!==\s*undefined/)).toBe(1)
    })

    test('TODO/FIXME comment regex', () => {
      expect(findMatches('// TODO: fix this', /\/\/\s*(TODO|FIXME|HACK|XXX)/i)).toBe(1)
    })

    test('block comment FIXME regex', () => {
      expect(findMatches('/* FIXME: broken */', /\/\*[\s\S]*?(TODO|FIXME|HACK|XXX)/i)).toBe(1)
    })

    test('non-global regex gets global flag applied', () => {
      const nonGlobal = /test/
      expect(findMatches('test test test', nonGlobal)).toBe(3)
    })

    test('complex regex with character classes', () => {
      expect(findMatches('abc123def456', /[a-z]+/)).toBe(2)
    })
  })
})

describe('addSuggestion', () => {
  test('adds new suggestion to empty map', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule()

    addSuggestion(map, 'test-rule', 3, suggested, mockGetRuleCategory)

    expect(map.size).toBe(1)
    expect(map.get('test-rule')!.estimatedViolations).toBe(3)
    expect(map.get('test-rule')!.ruleId).toBe('test-rule')
  })

  test('accumulates violations for same rule', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule()

    addSuggestion(map, 'test-rule', 3, suggested, mockGetRuleCategory)
    addSuggestion(map, 'test-rule', 5, suggested, mockGetRuleCategory)

    expect(map.size).toBe(1)
    expect(map.get('test-rule')!.estimatedViolations).toBe(8)
  })

  test('tracks different rules separately', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested1 = makeSuggestedRule({ ruleId: 'rule-a' })
    const suggested2 = makeSuggestedRule({ ruleId: 'rule-b' })

    addSuggestion(map, 'rule-a', 2, suggested1, mockGetRuleCategory)
    addSuggestion(map, 'rule-b', 4, suggested2, mockGetRuleCategory)

    expect(map.size).toBe(2)
    expect(map.get('rule-a')!.estimatedViolations).toBe(2)
    expect(map.get('rule-b')!.estimatedViolations).toBe(4)
  })

  test('sets category from getRuleCategoryFn', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'no-eval' })

    addSuggestion(map, 'no-eval', 1, suggested, mockGetRuleCategory)

    expect(map.get('no-eval')!.category).toBe('security')
  })

  test('preserves suggestion metadata', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({
      confidence: 'medium',
      impact: 'low',
      reason: 'Custom reason',
      ruleId: 'custom-rule',
    })

    addSuggestion(map, 'custom-rule', 1, suggested, mockGetRuleCategory)

    const result = map.get('custom-rule')!
    expect(result.confidence).toBe('medium')
    expect(result.impact).toBe('low')
    expect(result.reason).toBe('Custom reason')
  })

  test('overwrites previous rule metadata on duplicate ruleId', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested1 = makeSuggestedRule({ confidence: 'high', impact: 'high' })
    const suggested2 = makeSuggestedRule({ confidence: 'low', impact: 'low' })

    addSuggestion(map, 'test-rule', 1, suggested1, mockGetRuleCategory)
    addSuggestion(map, 'test-rule', 2, suggested2, mockGetRuleCategory)

    const result = map.get('test-rule')!
    expect(result.confidence).toBe('low')
    expect(result.impact).toBe('low')
    expect(result.estimatedViolations).toBe(3)
  })

  test('handles zero matches', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule()

    addSuggestion(map, 'test-rule', 0, suggested, mockGetRuleCategory)

    expect(map.get('test-rule')!.estimatedViolations).toBe(0)
  })

  test('accumulates across three calls', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule()

    addSuggestion(map, 'test-rule', 1, suggested, mockGetRuleCategory)
    addSuggestion(map, 'test-rule', 2, suggested, mockGetRuleCategory)
    addSuggestion(map, 'test-rule', 3, suggested, mockGetRuleCategory)

    expect(map.get('test-rule')!.estimatedViolations).toBe(6)
  })

  test('defaults category to patterns for unknown rules', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'totally-unknown-rule' })

    addSuggestion(map, 'totally-unknown-rule', 1, suggested, mockGetRuleCategory)

    expect(map.get('totally-unknown-rule')!.category).toBe('patterns')
  })
})

describe('analyzeFile', () => {
  test('detects console.log pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.log("test");', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console')).toBe(true)
    expect(map.get('no-console')!.estimatedViolations).toBeGreaterThan(0)
  })

  test('detects any type pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x: any = 1;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-explicit-any')).toBe(true)
  })

  test('detects var declarations', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('var x = 1;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
  })

  test('detects loose equality', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (a == b) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('eq-eq-eq')).toBe(true)
  })

  test('detects eval usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('eval("code");', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-eval')).toBe(true)
  })

  test('detects new Function usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('new Function("return x");', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-eval')).toBe(true)
  })

  test('detects console.warn usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.warn("warning");', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console')).toBe(true)
  })

  test('detects console.error usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.error("error");', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console')).toBe(true)
  })

  test('detects loose inequality operator', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (a != b) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('eq-eq-eq')).toBe(true)
  })

  test('detects nullish coalescing opportunity with null check', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x === null) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('detects type assertions', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = y as string;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-unsafe-type-assertion')).toBe(true)
  })

  test('detects magic numbers', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = 42;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-magic-numbers')).toBe(true)
  })

  test('produces empty map for clean code', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = "hello";', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.size).toBe(0)
  })

  test('produces empty map for empty content', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.size).toBe(0)
  })

  test('works with custom detectors', () => {
    const customDetectors: PatternDetector[] = [
      {
        name: 'Custom',
        patterns: ['custom-pattern'],
        suggestedRules: [
          {
            confidence: 'high',
            impact: 'medium',
            reason: 'Found custom pattern',
            ruleId: 'no-custom',
          },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('custom-pattern here', map, customDetectors, mockGetRuleCategory)

    expect(map.has('no-custom')).toBe(true)
  })

  test('works with empty detectors array', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.log("test");', map, [], mockGetRuleCategory)

    expect(map.size).toBe(0)
  })

  test('accumulates across multiple detectors for same rule', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Detector 1',
        patterns: ['foo'],
        suggestedRules: [makeSuggestedRule({ ruleId: 'my-rule' })],
      },
      {
        name: 'Detector 2',
        patterns: ['bar'],
        suggestedRules: [makeSuggestedRule({ ruleId: 'my-rule' })],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('foo bar', map, detectors, mockGetRuleCategory)

    expect(map.get('my-rule')!.estimatedViolations).toBe(2)
  })

  test('detects TODO comment', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// TODO: implement this', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects FIXME comment', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// FIXME: broken code', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects undefined check', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x !== undefined) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('detects multiple patterns from same detector', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'console.log("a"); console.error("b");',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    const entry = map.get('no-console')!
    expect(entry).toBeDefined()
    expect(entry.estimatedViolations).toBe(2)
  })
})

describe('filterSuggestions', () => {
  test('returns all suggestions when impact is empty string', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'medium' }),
      makeSuggestion({ impact: 'low' }),
    ]

    expect(filterSuggestions(suggestions, '')).toEqual(suggestions)
  })

  test('filters to high impact only', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'medium' }),
      makeSuggestion({ impact: 'low' }),
    ]

    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('high')
  })

  test('filters to medium impact only', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'medium' }),
      makeSuggestion({ impact: 'low' }),
    ]

    const result = filterSuggestions(suggestions, 'medium')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('medium')
  })

  test('filters to low impact only', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'medium' }),
      makeSuggestion({ impact: 'low' }),
    ]

    const result = filterSuggestions(suggestions, 'low')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('low')
  })

  test('returns empty when no suggestions match filter', () => {
    const suggestions = [makeSuggestion({ impact: 'medium' })]
    expect(filterSuggestions(suggestions, 'high')).toEqual([])
  })

  test('handles empty suggestions array', () => {
    expect(filterSuggestions([], 'high')).toEqual([])
  })

  test('handles empty suggestions with empty impact', () => {
    expect(filterSuggestions([], '')).toEqual([])
  })

  test('returns all when all match the filter', () => {
    const suggestions = [makeSuggestion({ impact: 'high' }), makeSuggestion({ impact: 'high' })]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(2)
  })
})

describe('sortSuggestions', () => {
  test('sorts by impact: high > medium > low', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('medium')
    expect(sorted[2].impact).toBe('low')
  })

  test('sorts by confidence when impact diff is exactly 1', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].confidence).toBe('high')
    expect(sorted[1].confidence).toBe('low')
  })

  test('sorts by violations when confidence diff is exactly 1', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'medium', estimatedViolations: 3 }),
      makeSuggestion({ impact: 'medium', confidence: 'low', estimatedViolations: 10 }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].estimatedViolations).toBe(10)
    expect(sorted[1].estimatedViolations).toBe(3)
  })

  test('returns impactDiff when diff is not 1', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('low')
  })

  test('returns 0 for equal impact without checking confidence', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted).toHaveLength(2)
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('high')
  })

  test('handles empty array', () => {
    expect(sortSuggestions([])).toEqual([])
  })

  test('handles single element', () => {
    const single = [makeSuggestion()]
    expect(sortSuggestions(single)).toHaveLength(1)
  })

  test('does not lose elements', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', ruleId: 'a' }),
      makeSuggestion({ impact: 'low', ruleId: 'b' }),
      makeSuggestion({ impact: 'medium', ruleId: 'c' }),
    ]
    expect(sortSuggestions(suggestions)).toHaveLength(3)
  })

  test('sorts complex mixed set', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'medium', estimatedViolations: 5 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 3 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 8 }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].impact).toBe('high')
    expect(sorted[sorted.length - 1].impact).toBe('low')
    expect(sorted.length).toBe(4)
  })

  test('sorts equal items stably', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 5, ruleId: 'a' }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 5, ruleId: 'b' }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted).toHaveLength(2)
    expect(sorted.map((s) => s.ruleId)).toEqual(['a', 'b'])
  })

  test('equal items stay in original order when impact and confidence are same', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 3,
        ruleId: 'a',
      }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 7,
        ruleId: 'b',
      }),
    ]

    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].ruleId).toBe('a')
    expect(sorted[1].ruleId).toBe('b')
  })
})

describe('formatImpactColor', () => {
  test('returns chalk.red for high impact', () => {
    const fn = formatImpactColor('high')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('returns chalk.yellow for medium impact', () => {
    const fn = formatImpactColor('medium')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('returns chalk.green for low impact', () => {
    const fn = formatImpactColor('low')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('returns chalk.green for unknown impact', () => {
    const fn = formatImpactColor('unknown')
    expect(typeof fn).toBe('function')
  })

  test('high and medium return different functions', () => {
    expect(formatImpactColor('high')).not.toBe(formatImpactColor('medium'))
  })

  test('medium and low return different functions', () => {
    expect(formatImpactColor('medium')).not.toBe(formatImpactColor('low'))
  })
})

describe('formatConfidenceColor', () => {
  test('returns chalk.green for high confidence', () => {
    const fn = formatConfidenceColor('high')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('returns chalk.yellow for medium confidence', () => {
    const fn = formatConfidenceColor('medium')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('returns chalk.red for low confidence', () => {
    const fn = formatConfidenceColor('low')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  test('returns chalk.red for unknown confidence', () => {
    const fn = formatConfidenceColor('unknown')
    expect(typeof fn).toBe('function')
  })

  test('high and medium return different functions', () => {
    expect(formatConfidenceColor('high')).not.toBe(formatConfidenceColor('medium'))
  })

  test('medium and low return different functions', () => {
    expect(formatConfidenceColor('medium')).not.toBe(formatConfidenceColor('low'))
  })
})

describe('displaySuggestions', () => {
  test('shows "No rule suggestions found" for empty array', () => {
    const lines: string[] = []
    displaySuggestions([], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).toContain('No rule suggestions found')
  })

  test('shows "Rule Suggestions" header for non-empty array', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('Rule Suggestions')
  })

  test('displays rule ID', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'my-rule' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('my-rule')
  })

  test('displays impact level', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ impact: 'high' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('HIGH')
  })

  test('displays confidence level', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'medium' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('MEDIUM')
  })

  test('displays violation count', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 7 })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('7 violations')
  })

  test('shows category in verbose mode', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ category: 'security' })], true, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('Category: security')
  })

  test('shows reason in verbose mode', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ reason: 'Test reason text' })], true, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('Reason: Test reason text')
  })

  test('shows enable command in verbose mode', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'no-eval' })], true, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('Enable with: codeforge analyze --rules no-eval')
  })

  test('hides verbose details when not verbose', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ category: 'security' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).not.toContain('Category:')
  })

  test('shows total count', () => {
    const lines: string[] = []
    const suggestions = [makeSuggestion(), makeSuggestion({ ruleId: 'rule-2' })]
    displaySuggestions(suggestions, false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('Total: 2 rule suggestions')
  })

  test('handles multiple suggestions', () => {
    const lines: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'rule-a' }), makeSuggestion({ ruleId: 'rule-b' })]
    displaySuggestions(suggestions, false, (msg) => {
      lines.push(msg ?? '')
    })
    const output = lines.join('\n')
    expect(output).toContain('rule-a')
    expect(output).toContain('rule-b')
  })

  test('calls logFn for each line', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], true, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.length).toBeGreaterThan(3)
  })
})

describe('PATTERN_DETECTORS', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(PATTERN_DETECTORS)).toBe(true)
    expect(PATTERN_DETECTORS.length).toBeGreaterThan(0)
  })

  test('each detector has required properties', () => {
    for (const detector of PATTERN_DETECTORS) {
      expect(detector.name).toBeTruthy()
      expect(Array.isArray(detector.patterns)).toBe(true)
      expect(Array.isArray(detector.suggestedRules)).toBe(true)
      expect(detector.suggestedRules.length).toBeGreaterThan(0)
    }
  })

  test('each suggested rule has required properties', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(['high', 'medium', 'low']).toContain(rule.confidence)
        expect(['high', 'medium', 'low']).toContain(rule.impact)
        expect(rule.reason).toBeTruthy()
        expect(rule.ruleId).toBeTruthy()
      }
    }
  })

  test('includes console log detector', () => {
    const consoleDetector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')
    expect(consoleDetector).toBeDefined()
    expect(consoleDetector!.suggestedRules[0].ruleId).toBe('no-console')
  })

  test('includes eval detector', () => {
    const evalDetector = PATTERN_DETECTORS.find((d) => d.name === 'Eval usage')
    expect(evalDetector).toBeDefined()
    expect(evalDetector!.suggestedRules[0].ruleId).toBe('no-eval')
  })

  test('includes any type detector', () => {
    const anyDetector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')
    expect(anyDetector).toBeDefined()
    expect(anyDetector!.suggestedRules[0].ruleId).toBe('no-explicit-any')
  })

  test('long functions detector has empty patterns', () => {
    const longFnDetector = PATTERN_DETECTORS.find((d) => d.name === 'Long functions')
    expect(longFnDetector).toBeDefined()
    expect(longFnDetector!.patterns).toEqual([])
  })

  test('has 12 detectors', () => {
    expect(PATTERN_DETECTORS).toHaveLength(12)
  })

  test('includes loose equality detector', () => {
    const eqDetector = PATTERN_DETECTORS.find((d) => d.name === 'Loose equality')
    expect(eqDetector).toBeDefined()
    expect(eqDetector!.suggestedRules[0].ruleId).toBe('eq-eq-eq')
  })

  test('var declarations detector has correct rule ID', () => {
    const varDetector = PATTERN_DETECTORS.find((d) => d.name === 'Var declarations')
    expect(varDetector).toBeDefined()
    expect(varDetector!.suggestedRules[0].ruleId).toBe('prefer-const')
  })

  test('null checks detector targets prefer-nullish-coalescing', () => {
    const nullDetector = PATTERN_DETECTORS.find((d) => d.name === 'Null checks')
    expect(nullDetector).toBeDefined()
    expect(nullDetector!.suggestedRules[0].ruleId).toBe('prefer-nullish-coalescing')
  })

  test('magic numbers detector uses regex patterns', () => {
    const magicDetector = PATTERN_DETECTORS.find((d) => d.name === 'Magic numbers')
    expect(magicDetector).toBeDefined()
    expect(magicDetector!.patterns[0]).toBeInstanceOf(RegExp)
  })

  test('each detector has at least one pattern except long functions', () => {
    for (const detector of PATTERN_DETECTORS) {
      if (detector.name === 'Long functions') continue
      expect(detector.patterns.length).toBeGreaterThan(0)
    }
  })

  test('console log detector includes console.debug pattern', () => {
    const consoleDetector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(consoleDetector.patterns).toContain('console.debug')
  })

  test('any type detector includes angle bracket pattern', () => {
    const anyDetector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(anyDetector.patterns).toContain('<any>')
  })

  test('any type detector includes colon any pattern', () => {
    const anyDetector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(anyDetector.patterns).toContain(': any')
  })

  test('any type detector includes as any pattern', () => {
    const anyDetector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(anyDetector.patterns).toContain('as any')
  })

  test('eval detector includes eval( pattern', () => {
    const evalDetector = PATTERN_DETECTORS.find((d) => d.name === 'Eval usage')!
    expect(evalDetector.patterns).toContain('eval(')
  })

  test('eval detector includes new Function( pattern', () => {
    const evalDetector = PATTERN_DETECTORS.find((d) => d.name === 'Eval usage')!
    expect(evalDetector.patterns).toContain('new Function(')
  })

  test('loose equality detector includes == pattern', () => {
    const eqDetector = PATTERN_DETECTORS.find((d) => d.name === 'Loose equality')!
    expect(eqDetector.patterns).toContain(' == ')
  })

  test('loose equality detector includes != pattern', () => {
    const eqDetector = PATTERN_DETECTORS.find((d) => d.name === 'Loose equality')!
    expect(eqDetector.patterns).toContain(' != ')
  })

  test('nested conditionals detector uses regex', () => {
    const nestedDetector = PATTERN_DETECTORS.find((d) => d.name === 'Nested conditionals')!
    expect(nestedDetector!.patterns[0]).toBeInstanceOf(RegExp)
  })

  test('TODO/FIXME detector has two regex patterns', () => {
    const todoDetector = PATTERN_DETECTORS.find((d) => d.name === 'TODO/FIXME comments')!
    expect(todoDetector!.patterns).toHaveLength(2)
    expect(todoDetector!.patterns[0]).toBeInstanceOf(RegExp)
    expect(todoDetector!.patterns[1]).toBeInstanceOf(RegExp)
  })

  test('async without await detector uses regex', () => {
    const asyncDetector = PATTERN_DETECTORS.find((d) => d.name === 'Async without await')!
    expect(asyncDetector!.patterns[0]).toBeInstanceOf(RegExp)
  })

  test('null checks detector has four patterns', () => {
    const nullDetector = PATTERN_DETECTORS.find((d) => d.name === 'Null checks')!
    expect(nullDetector!.patterns).toHaveLength(4)
  })

  test('type assertions detector has as string pattern', () => {
    const assertDetector = PATTERN_DETECTORS.find((d) => d.name === 'Type assertions')!
    expect(assertDetector!.patterns).toContain(' as ')
  })

  test('console logs detector has confidence high', () => {
    const consoleDetector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(consoleDetector!.suggestedRules[0].confidence).toBe('high')
  })

  test('console logs detector has impact medium', () => {
    const consoleDetector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(consoleDetector!.suggestedRules[0].impact).toBe('medium')
  })

  test('any type detector has impact high', () => {
    const anyDetector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(anyDetector!.suggestedRules[0].impact).toBe('high')
  })

  test('var declarations detector has confidence high', () => {
    const varDetector = PATTERN_DETECTORS.find((d) => d.name === 'Var declarations')!
    expect(varDetector!.suggestedRules[0].confidence).toBe('high')
  })

  test('nested conditionals detector targets max-depth rule', () => {
    const nestedDetector = PATTERN_DETECTORS.find((d) => d.name === 'Nested conditionals')!
    expect(nestedDetector!.suggestedRules[0].ruleId).toBe('max-depth')
  })

  test('long functions detector targets max-lines-per-function', () => {
    const longFnDetector = PATTERN_DETECTORS.find((d) => d.name === 'Long functions')!
    expect(longFnDetector!.suggestedRules[0].ruleId).toBe('max-lines-per-function')
  })

  test('async without await detector targets correct rule', () => {
    const asyncDetector = PATTERN_DETECTORS.find((d) => d.name === 'Async without await')!
    expect(asyncDetector!.suggestedRules[0].ruleId).toBe('no-async-without-await')
  })

  test('type assertions detector targets correct rule', () => {
    const assertDetector = PATTERN_DETECTORS.find((d) => d.name === 'Type assertions')!
    expect(assertDetector!.suggestedRules[0].ruleId).toBe('no-unsafe-type-assertion')
  })

  test('console logs detector has four patterns', () => {
    const consoleDetector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(consoleDetector!.patterns).toHaveLength(4)
  })

  test('var declarations detector has single pattern', () => {
    const varDetector = PATTERN_DETECTORS.find((d) => d.name === 'Var declarations')!
    expect(varDetector!.patterns).toHaveLength(1)
  })
})

describe('findMatches additional edge cases', () => {
  test('handles pattern equal to content for string', () => {
    expect(findMatches('hello', 'hello')).toBe(1)
  })

  test('handles pattern longer than content for string', () => {
    expect(findMatches('hi', 'hello world')).toBe(0)
  })

  test('finds matches across newlines for string pattern', () => {
    expect(findMatches('hello\nworld\nhello', 'hello')).toBe(2)
  })

  test('finds matches with tab characters', () => {
    expect(findMatches('\ttest\ttest\t', 'test')).toBe(2)
  })

  test('handles special regex chars as string pattern', () => {
    expect(findMatches('a.b+c*', '.')).toBe(1)
  })

  test('handles regex with word boundary', () => {
    expect(findMatches('test testing tested', /\btest\b/)).toBe(1)
  })

  test('handles regex with lookahead', () => {
    expect(findMatches('abc1 def2 ghi3', /[a-z]+(?=\d)/)).toBe(3)
  })

  test('handles regex match at single position', () => {
    expect(findMatches('hello', /^hello$/)).toBe(1)
  })

  test('handles unicode content with string pattern', () => {
    expect(findMatches('café café', 'café')).toBe(2)
  })

  test('returns 0 for regex with no matches in long content', () => {
    const longContent = 'a'.repeat(1000)
    expect(findMatches(longContent, /\d/)).toBe(0)
  })

  test('counts correctly with whitespace-only content', () => {
    expect(findMatches('   ', ' ')).toBe(3)
  })

  test('handles regex with alternation', () => {
    expect(findMatches('cat dog bat', /cat|dog/)).toBe(2)
  })

  test('handles empty regex pattern', () => {
    expect(findMatches('abc', new RegExp(''))).toBeGreaterThan(0)
  })
})

describe('addSuggestion additional edge cases', () => {
  test('handles large match counts', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule()
    addSuggestion(map, 'test-rule', 1000, suggested, mockGetRuleCategory)
    expect(map.get('test-rule')!.estimatedViolations).toBe(1000)
  })

  test('accumulates large counts correctly', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule()
    addSuggestion(map, 'test-rule', 500, suggested, mockGetRuleCategory)
    addSuggestion(map, 'test-rule', 500, suggested, mockGetRuleCategory)
    expect(map.get('test-rule')!.estimatedViolations).toBe(1000)
  })

  test('preserves category across multiple additions', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'no-eval' })
    addSuggestion(map, 'no-eval', 1, suggested, mockGetRuleCategory)
    addSuggestion(map, 'no-eval', 2, suggested, mockGetRuleCategory)
    expect(map.get('no-eval')!.category).toBe('security')
  })

  test('handles multiple rules with different categories', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(map, 'no-eval', 1, makeSuggestedRule({ ruleId: 'no-eval' }), mockGetRuleCategory)
    addSuggestion(
      map,
      'max-depth',
      1,
      makeSuggestedRule({ ruleId: 'max-depth' }),
      mockGetRuleCategory,
    )
    expect(map.get('no-eval')!.category).toBe('security')
    expect(map.get('max-depth')!.category).toBe('complexity')
  })

  test('handles pre-populated map', () => {
    const map = new Map<string, RuleSuggestion>()
    map.set('existing-rule', makeSuggestion({ estimatedViolations: 10 }))
    const suggested = makeSuggestedRule()
    addSuggestion(map, 'new-rule', 5, suggested, mockGetRuleCategory)
    expect(map.size).toBe(2)
    expect(map.get('existing-rule')!.estimatedViolations).toBe(10)
    expect(map.get('new-rule')!.estimatedViolations).toBe(5)
  })

  test('updates reason on duplicate addition', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(
      map,
      'test-rule',
      1,
      makeSuggestedRule({ reason: 'First reason' }),
      mockGetRuleCategory,
    )
    addSuggestion(
      map,
      'test-rule',
      1,
      makeSuggestedRule({ reason: 'Second reason' }),
      mockGetRuleCategory,
    )
    expect(map.get('test-rule')!.reason).toBe('Second reason')
  })

  test('handles negative-like but zero value correctly', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(map, 'test-rule', 0, makeSuggestedRule(), mockGetRuleCategory)
    expect(map.get('test-rule')!.estimatedViolations).toBe(0)
    expect(map.get('test-rule')!.ruleId).toBe('test-rule')
  })
})

describe('analyzeFile additional edge cases', () => {
  test('detects console.debug usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.debug("debug");', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('no-console')).toBe(true)
  })

  test('detects multiple different patterns simultaneously', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'var x: any = eval("code"); console.log(x);'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('prefer-const')).toBe(true)
    expect(map.has('no-explicit-any')).toBe(true)
    expect(map.has('no-eval')).toBe(true)
    expect(map.has('no-console')).toBe(true)
  })

  test('detects HACK comment', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// HACK: temp fix', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects XXX comment', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// XXX: needs fix', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects null strict equality check', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x === null) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('detects null strict inequality check', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x !== null) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('detects undefined strict equality check', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x === undefined) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('detects nested conditionals', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (a) { if (b) {} }', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('max-depth')).toBe(true)
  })

  test('detects async function without await', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'async function getData(x) { return x; }',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )
    expect(map.has('no-async-without-await')).toBe(true)
  })

  test('detects angle bracket any type', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = <any>value;', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('no-explicit-any')).toBe(true)
  })

  test('handles content with only whitespace', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('   \n\t  \n  ', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.size).toBe(0)
  })

  test('detects as any type assertion', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = value as any;', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('no-explicit-any')).toBe(true)
  })

  test('detects type assertion via as keyword', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = y as string;', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('no-unsafe-type-assertion')).toBe(true)
  })

  test('accumulates violations from multiple pattern matches in same detector', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'console.log("a"); console.warn("b"); console.error("c");'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.get('no-console')!.estimatedViolations).toBe(3)
  })

  test('custom detector with regex pattern', () => {
    const customDetectors: PatternDetector[] = [
      {
        name: 'Custom regex',
        patterns: [/\b\d{3,}\b/],
        suggestedRules: [
          {
            confidence: 'high',
            impact: 'high',
            reason: 'Large numbers found',
            ruleId: 'no-large-numbers',
          },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = 12345; const y = 67890;', map, customDetectors, mockGetRuleCategory)
    expect(map.has('no-large-numbers')).toBe(true)
    expect(map.get('no-large-numbers')!.estimatedViolations).toBe(2)
  })

  test('does not add entries for patterns with zero matches', () => {
    const customDetectors: PatternDetector[] = [
      {
        name: 'No match detector',
        patterns: ['will-not-match-xyz'],
        suggestedRules: [makeSuggestedRule({ ruleId: 'no-match-rule' })],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('some random content', map, customDetectors, mockGetRuleCategory)
    expect(map.has('no-match-rule')).toBe(false)
  })

  test('block comment TODO detection', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('/* TODO: fix this later */', map, PATTERN_DETECTORS, mockGetRuleCategory)
    expect(map.has('no-duplicate-code')).toBe(true)
  })
})

describe('filterSuggestions additional edge cases', () => {
  test('handles single suggestion matching filter', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('high')
  })

  test('handles single suggestion not matching filter', () => {
    const suggestions = [makeSuggestion({ impact: 'low' })]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(0)
  })

  test('preserves all suggestion properties when filtering', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'high',
        confidence: 'medium',
        ruleId: 'preserved-rule',
        reason: 'preserved reason',
        estimatedViolations: 42,
        category: 'security',
      }),
    ]
    const result = filterSuggestions(suggestions, 'high')
    expect(result[0]).toEqual(suggestions[0])
  })

  test('filters from mixed impact with multiple of same', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', ruleId: 'a' }),
      makeSuggestion({ impact: 'medium', ruleId: 'b' }),
      makeSuggestion({ impact: 'high', ruleId: 'c' }),
    ]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(2)
  })

  test('does not mutate original array', () => {
    const suggestions = [makeSuggestion({ impact: 'high' }), makeSuggestion({ impact: 'low' })]
    const original = [...suggestions]
    filterSuggestions(suggestions, 'high')
    expect(suggestions).toEqual(original)
  })
})

describe('sortSuggestions additional edge cases', () => {
  test('sorts three items with all same impact correctly', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', confidence: 'low', estimatedViolations: 1, ruleId: 'a' }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'high',
        estimatedViolations: 1,
        ruleId: 'b',
      }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 1,
        ruleId: 'c',
      }),
    ]
    const sorted = sortSuggestions(suggestions)
    expect(sorted).toHaveLength(3)
    // Same impact keeps original order when impactDiff is 0
    expect(sorted.map((s) => s.ruleId)).toEqual(['a', 'b', 'c'])
  })

  test('high impact sorts before medium regardless of violations', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 5,
        ruleId: 'b',
      }),
      makeSuggestion({
        impact: 'high',
        confidence: 'high',
        estimatedViolations: 1,
        ruleId: 'a',
      }),
    ]
    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('medium')
  })

  test('sorts many elements correctly', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 3 }),
      makeSuggestion({ impact: 'medium', confidence: 'medium', estimatedViolations: 2 }),
      makeSuggestion({ impact: 'high', confidence: 'medium', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 5 }),
    ]
    const sorted = sortSuggestions(suggestions)
    expect(sorted).toHaveLength(5)
    expect(sorted[0].impact).toBe('high')
    expect(sorted[sorted.length - 1].impact).toBe('low')
  })

  test('preserves total count after sorting', () => {
    const suggestions = Array.from({ length: 20 }, (_, i) =>
      makeSuggestion({
        impact: (['high', 'medium', 'low'] as const)[i % 3],
        confidence: (['high', 'medium', 'low'] as const)[i % 3],
        estimatedViolations: i,
        ruleId: `rule-${i}`,
      }),
    )
    const sorted = sortSuggestions(suggestions)
    expect(sorted).toHaveLength(20)
  })

  test('handles two elements with same everything', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 5, ruleId: 'a' }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 5, ruleId: 'b' }),
    ]
    const sorted = sortSuggestions(suggestions)
    expect(sorted).toHaveLength(2)
  })

  test('impact diff of 2 returns impactDiff directly', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 100 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions(suggestions)
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('low')
  })
})

describe('displaySuggestions additional edge cases', () => {
  test('displays LOW impact label', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ impact: 'low' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('LOW')
  })

  test('displays MEDIUM confidence label', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'medium' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('MEDIUM')
  })

  test('displays LOW confidence label', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'low' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('LOW')
  })

  test('displays violation count with tilde prefix', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 42 })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('~42')
  })

  test('displays total count for single suggestion', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('Total: 1 rule suggestion')
  })

  test('verbose mode shows category for each suggestion', () => {
    const lines: string[] = []
    displaySuggestions(
      [
        makeSuggestion({ category: 'security', ruleId: 'rule-a' }),
        makeSuggestion({ category: 'patterns', ruleId: 'rule-b' }),
      ],
      true,
      (msg) => {
        lines.push(msg ?? '')
      },
    )
    const output = lines.join('\n')
    expect(output).toContain('Category: security')
    expect(output).toContain('Category: patterns')
  })

  test('verbose mode shows reason for each suggestion', () => {
    const lines: string[] = []
    displaySuggestions(
      [
        makeSuggestion({ reason: 'Reason A', ruleId: 'rule-a' }),
        makeSuggestion({ reason: 'Reason B', ruleId: 'rule-b' }),
      ],
      true,
      (msg) => {
        lines.push(msg ?? '')
      },
    )
    const output = lines.join('\n')
    expect(output).toContain('Reason: Reason A')
    expect(output).toContain('Reason: Reason B')
  })

  test('non-verbose mode hides enable command', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'no-eval' })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).not.toContain('Enable with:')
  })

  test('handles suggestion with zero violations', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 0 })], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.join('\n')).toContain('~0')
  })

  test('logFn receives undefined message handling', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => {
      lines.push(msg ?? '')
    })
    expect(lines.length).toBeGreaterThan(0)
  })
})
