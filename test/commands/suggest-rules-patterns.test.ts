import { describe, expect, it } from 'vitest'

import type { PatternDetector, RuleSuggestion, SuggestedRule } from '../../src/commands/suggest-rules-patterns.js'

import {
  PATTERN_DETECTORS,
  addSuggestion,
  analyzeFile,
  findMatches,
} from '../../src/commands/suggest-rules-patterns.js'

// ─── Helpers ───

const makeSuggestedRule = (
  overrides: Partial<SuggestedRule> = {},
): SuggestedRule => ({
  confidence: 'high',
  impact: 'medium',
  reason: 'test reason',
  ruleId: 'test-rule',
  ...overrides,
})

const getRuleCategory = (ruleId: string): string => {
  const map: Record<string, string> = {
    'no-console': 'patterns',
    'no-explicit-any': 'type-safety',
    'prefer-const': 'patterns',
    'eq-eq-eq': 'correctness',
    'no-eval': 'security',
    'no-magic-numbers': 'complexity',
    'max-depth': 'complexity',
    'max-lines-per-function': 'complexity',
    'no-duplicate-code': 'patterns',
    'no-async-without-await': 'performance',
    'prefer-nullish-coalescing': 'patterns',
    'no-unsafe-type-assertion': 'type-safety',
  }
  return map[ruleId] ?? 'patterns'
}

// ─── PATTERN_DETECTORS ───

describe('PATTERN_DETECTORS', () => {
  it('is an array', () => {
    expect(Array.isArray(PATTERN_DETECTORS)).toBe(true)
  })

  it('contains at least 10 detectors', () => {
    expect(PATTERN_DETECTORS.length).toBeGreaterThanOrEqual(10)
  })

  it('each detector has a non-empty name', () => {
    for (const detector of PATTERN_DETECTORS) {
      expect(detector.name).toBeTruthy()
      expect(typeof detector.name).toBe('string')
    }
  })

  it('each detector has a patterns array', () => {
    for (const detector of PATTERN_DETECTORS) {
      expect(Array.isArray(detector.patterns)).toBe(true)
    }
  })

  it('each detector has a non-empty suggestedRules array', () => {
    for (const detector of PATTERN_DETECTORS) {
      expect(detector.suggestedRules.length).toBeGreaterThan(0)
    }
  })

  it('each suggested rule has valid confidence values', () => {
    const validConfidences = ['high', 'low', 'medium']
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(validConfidences).toContain(rule.confidence)
      }
    }
  })

  it('each suggested rule has valid impact values', () => {
    const validImpacts = ['high', 'low', 'medium']
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(validImpacts).toContain(rule.impact)
      }
    }
  })

  it('each suggested rule has a non-empty ruleId', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(rule.ruleId).toBeTruthy()
        expect(typeof rule.ruleId).toBe('string')
      }
    }
  })

  it('each suggested rule has a non-empty reason', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(rule.reason).toBeTruthy()
        expect(typeof rule.reason).toBe('string')
      }
    }
  })

  it('patterns contain strings or RegExp instances', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const pattern of detector.patterns) {
        expect(
          typeof pattern === 'string' || pattern instanceof RegExp,
        ).toBe(true)
      }
    }
  })

  it('includes a console logs detector', () => {
    const consoleDetector = PATTERN_DETECTORS.find(
      (d) => d.name === 'Console logs',
    )
    expect(consoleDetector).toBeDefined()
    expect(consoleDetector!.patterns).toContain('console.log')
    expect(consoleDetector!.suggestedRules[0].ruleId).toBe('no-console')
  })

  it('includes an any type usage detector', () => {
    const anyDetector = PATTERN_DETECTORS.find(
      (d) => d.name === 'Any type usage',
    )
    expect(anyDetector).toBeDefined()
    expect(anyDetector!.patterns).toContain(': any')
    expect(anyDetector!.suggestedRules[0].ruleId).toBe('no-explicit-any')
  })

  it('includes an eval usage detector', () => {
    const evalDetector = PATTERN_DETECTORS.find(
      (d) => d.name === 'Eval usage',
    )
    expect(evalDetector).toBeDefined()
    expect(evalDetector!.patterns).toContain('eval(')
    expect(evalDetector!.suggestedRules[0].ruleId).toBe('no-eval')
  })

  it('has a detector with empty patterns array (long functions)', () => {
    const longFunctionsDetector = PATTERN_DETECTORS.find(
      (d) => d.name === 'Long functions',
    )
    expect(longFunctionsDetector).toBeDefined()
    expect(longFunctionsDetector!.patterns).toEqual([])
  })
})

// ─── findMatches ───

describe('findMatches', () => {
  it('returns 0 when string pattern is not found', () => {
    expect(findMatches('hello world', 'not-found')).toBe(0)
  })

  it('returns 0 for empty content with string pattern', () => {
    expect(findMatches('', 'console.log')).toBe(0)
  })

  it('counts a single occurrence of a string pattern', () => {
    expect(findMatches('console.log("hello")', 'console.log')).toBe(1)
  })

  it('counts multiple non-overlapping occurrences of a string pattern', () => {
    const content = 'console.log("a") console.log("b") console.log("c")'
    expect(findMatches(content, 'console.log')).toBe(3)
  })

  it('counts overlapping string patterns correctly', () => {
    expect(findMatches('aaa', 'aa')).toBe(2)
  })

  it('finds pattern at the beginning of content', () => {
    expect(findMatches('console.log at start', 'console.log')).toBe(1)
  })

  it('finds pattern at the end of content', () => {
    expect(findMatches('end has console.log', 'console.log')).toBe(1)
  })

  it('returns 0 when regex pattern has no matches', () => {
    expect(findMatches('hello world', /\d+/)).toBe(0)
  })

  it('returns 0 for empty content with regex pattern', () => {
    expect(findMatches('', /\d+/)).toBe(0)
  })

  it('counts regex matches correctly', () => {
    expect(findMatches('abc123def456ghi789', /\d{3}/)).toBe(3)
  })

  it('handles a non-global regex by adding the g flag', () => {
    const nonGlobal = /\d+/
    expect(findMatches('a1 b2 c3', nonGlobal)).toBe(3)
  })

  it('preserves the global flag if already present', () => {
    const globalRegex = /\d+/g
    expect(findMatches('a1 b2 c3', globalRegex)).toBe(3)
  })

  it('handles regex with special character classes', () => {
    expect(findMatches('var x = 1', /var\s+\w+/)).toBe(1)
  })

  it('returns 1 for a single-character string match', () => {
    expect(findMatches('a', 'a')).toBe(1)
  })

  it('counts multiple identical string patterns across lines', () => {
    const content = `line1 console.log
line2 console.log
line3 console.log`
    expect(findMatches(content, 'console.log')).toBe(3)
  })
})

// ─── addSuggestion ───

describe('addSuggestion', () => {
  it('adds a new suggestion to an empty map', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule()

    addSuggestion(map, 'test-rule', 5, suggested, getRuleCategory)

    expect(map.size).toBe(1)
    expect(map.get('test-rule')).toEqual({
      category: 'patterns',
      confidence: 'high',
      estimatedViolations: 5,
      impact: 'medium',
      reason: 'test reason',
      ruleId: 'test-rule',
    })
  })

  it('accumulates violations for the same ruleId', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'no-console' })

    addSuggestion(map, 'no-console', 3, suggested, getRuleCategory)
    addSuggestion(map, 'no-console', 2, suggested, getRuleCategory)

    const entry = map.get('no-console')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBe(5)
    expect(map.size).toBe(1)
  })

  it('stores the correct category from getRuleCategoryFn', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'no-eval' })

    addSuggestion(map, 'no-eval', 1, suggested, getRuleCategory)

    expect(map.get('no-eval')!.category).toBe('security')
  })

  it('stores the correct confidence from the suggested rule', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ confidence: 'low' })

    addSuggestion(map, 'test-rule', 1, suggested, getRuleCategory)

    expect(map.get('test-rule')!.confidence).toBe('low')
  })

  it('stores the correct impact from the suggested rule', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ impact: 'high' })

    addSuggestion(map, 'test-rule', 1, suggested, getRuleCategory)

    expect(map.get('test-rule')!.impact).toBe('high')
  })

  it('stores the correct reason from the suggested rule', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ reason: 'custom reason here' })

    addSuggestion(map, 'test-rule', 1, suggested, getRuleCategory)

    expect(map.get('test-rule')!.reason).toBe('custom reason here')
  })

  it('handles multiple different rules in the same map', () => {
    const map = new Map<string, RuleSuggestion>()

    addSuggestion(
      map,
      'no-console',
      1,
      makeSuggestedRule({ ruleId: 'no-console' }),
      getRuleCategory,
    )
    addSuggestion(
      map,
      'no-eval',
      2,
      makeSuggestedRule({ ruleId: 'no-eval' }),
      getRuleCategory,
    )

    expect(map.size).toBe(2)
    expect(map.get('no-console')!.estimatedViolations).toBe(1)
    expect(map.get('no-eval')!.estimatedViolations).toBe(2)
  })

  it('preserves properties from the last addSuggestion call for same ruleId', () => {
    const map = new Map<string, RuleSuggestion>()

    addSuggestion(
      map,
      'test-rule',
      1,
      makeSuggestedRule({ reason: 'first reason', confidence: 'high' }),
      getRuleCategory,
    )
    addSuggestion(
      map,
      'test-rule',
      1,
      makeSuggestedRule({ reason: 'second reason', confidence: 'low' }),
      getRuleCategory,
    )

    const entry = map.get('test-rule')!
    expect(entry.estimatedViolations).toBe(2)
    expect(entry.reason).toBe('second reason')
    expect(entry.confidence).toBe('low')
  })

  it('calls getRuleCategoryFn with the ruleId', () => {
    const map = new Map<string, RuleSuggestion>()
    const calls: string[] = []
    const trackingFn = (ruleId: string): string => {
      calls.push(ruleId)
      return 'patterns'
    }

    addSuggestion(map, 'my-rule', 1, makeSuggestedRule(), trackingFn)

    expect(calls).toEqual(['my-rule'])
  })
})

// ─── analyzeFile ───

describe('analyzeFile', () => {
  it('does not add suggestions for content with no pattern matches', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = 1;', map, PATTERN_DETECTORS, getRuleCategory)
    expect(map.size).toBe(0)
  })

  it('does not add suggestions for empty content', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('', map, PATTERN_DETECTORS, getRuleCategory)
    expect(map.size).toBe(0)
  })

  it('detects console.log patterns', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'console.log("a"); console.log("b");',
      map,
      PATTERN_DETECTORS,
      getRuleCategory,
    )

    const entry = map.get('no-console')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBe(2)
    expect(entry!.category).toBe('patterns')
  })

  it('detects any type usage patterns', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'const x: any = 1; const y: any = 2;',
      map,
      PATTERN_DETECTORS,
      getRuleCategory,
    )

    const entry = map.get('no-explicit-any')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBeGreaterThanOrEqual(2)
  })

  it('detects var declarations', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('var x = 1; var y = 2;', map, PATTERN_DETECTORS, getRuleCategory)

    const entry = map.get('prefer-const')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBe(2)
  })

  it('detects loose equality operators', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'if (a == b) {} if (c != d) {}',
      map,
      PATTERN_DETECTORS,
      getRuleCategory,
    )

    const entry = map.get('eq-eq-eq')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBe(2)
  })

  it('detects eval usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('eval("1+1"); eval("2+2");', map, PATTERN_DETECTORS, getRuleCategory)

    const entry = map.get('no-eval')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBe(2)
  })

  it('detects new Function constructor usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'new Function("return 1")();',
      map,
      PATTERN_DETECTORS,
      getRuleCategory,
    )

    const entry = map.get('no-eval')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBeGreaterThanOrEqual(1)
  })

  it('detects magic numbers', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = 100; const y = 200;', map, PATTERN_DETECTORS, getRuleCategory)

    const entry = map.get('no-magic-numbers')
    expect(entry).toBeDefined()
    expect(entry!.estimatedViolations).toBeGreaterThanOrEqual(2)
  })

  it('detects type assertions', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = {} as MyType;', map, PATTERN_DETECTORS, getRuleCategory)

    const entry = map.get('no-unsafe-type-assertion')
    expect(entry).toBeDefined()
  })

  it('detects null checks', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'if (x === null) {} if (y !== undefined) {}',
      map,
      PATTERN_DETECTORS,
      getRuleCategory,
    )

    const entry = map.get('prefer-nullish-coalescing')
    expect(entry).toBeDefined()
  })

  it('detects TODO/FIXME comments', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      '// TODO: fix this\n// FIXME: urgent\n',
      map,
      PATTERN_DETECTORS,
      getRuleCategory,
    )

    const entry = map.get('no-duplicate-code')
    expect(entry).toBeDefined()
  })

  it('accumulates violations across multiple detectors', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'console.log("hi"); eval("1"); var x = 1;',
      map,
      PATTERN_DETECTORS,
      getRuleCategory,
    )

    expect(map.get('no-console')).toBeDefined()
    expect(map.get('no-eval')).toBeDefined()
    expect(map.get('prefer-const')).toBeDefined()
    expect(map.size).toBeGreaterThanOrEqual(3)
  })

  it('works with a custom detector list', () => {
    const customDetectors: PatternDetector[] = [
      {
        name: 'Custom',
        patterns: ['custom-pattern'],
        suggestedRules: [
          {
            confidence: 'high',
            impact: 'high',
            reason: 'Found custom pattern',
            ruleId: 'custom-rule',
          },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('custom-pattern here', map, customDetectors, getRuleCategory)

    expect(map.size).toBe(1)
    expect(map.get('custom-rule')).toBeDefined()
    expect(map.get('custom-rule')!.estimatedViolations).toBe(1)
  })

  it('does not add suggestions from detectors with empty patterns', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Empty',
        patterns: [],
        suggestedRules: [makeSuggestedRule()],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('any content', map, detectors, getRuleCategory)
    expect(map.size).toBe(0)
  })

  it('multiplies matches across all suggested rules of a detector', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Multi-rule',
        patterns: ['trigger'],
        suggestedRules: [
          makeSuggestedRule({ ruleId: 'rule-a' }),
          makeSuggestedRule({ ruleId: 'rule-b' }),
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('trigger trigger trigger', map, detectors, getRuleCategory)

    expect(map.get('rule-a')!.estimatedViolations).toBe(3)
    expect(map.get('rule-b')!.estimatedViolations).toBe(3)
  })

  it('accumulates violations when the same rule is suggested by multiple detectors', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Det-A',
        patterns: ['aaa'],
        suggestedRules: [makeSuggestedRule({ ruleId: 'shared-rule' })],
      },
      {
        name: 'Det-B',
        patterns: ['bbb'],
        suggestedRules: [makeSuggestedRule({ ruleId: 'shared-rule' })],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('aaa bbb', map, detectors, getRuleCategory)

    expect(map.get('shared-rule')!.estimatedViolations).toBe(2)
  })

  it('handles a detector with a regex pattern', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Digits',
        patterns: [/\b\d{3,}\b/],
        suggestedRules: [
          makeSuggestedRule({ ruleId: 'big-number-rule' }),
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('count: 1234 and 5678', map, detectors, getRuleCategory)

    expect(map.get('big-number-rule')!.estimatedViolations).toBe(2)
  })
})
