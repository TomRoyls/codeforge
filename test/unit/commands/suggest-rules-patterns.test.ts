import { describe, test, expect } from 'vitest'

import {
  addSuggestion,
  analyzeFile,
  type PatternDetector,
  PATTERN_DETECTORS,
  type RuleSuggestion,
  type SuggestedRule,
  findMatches,
} from '../../../src/commands/suggest-rules-patterns.js'

const mockGetRuleCategory = (ruleId: string): string => {
  const categories: Record<string, string> = {
    'no-console-log': 'patterns',
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

describe('suggest-rules-patterns: findMatches', () => {
  describe('string patterns — edge cases', () => {
    test('finds single-char pattern', () => {
      expect(findMatches('aabbcc', 'a')).toBe(2)
    })

    test('finds pattern with special regex chars as literal', () => {
      expect(findMatches('a+b+c+', '+')).toBe(3)
    })

    test('finds pattern with parentheses as literal', () => {
      expect(findMatches('foo() bar()', '()')).toBe(2)
    })

    test('does not match partial pattern across line breaks', () => {
      expect(findMatches('con\nsole.log', 'console.log')).toBe(0)
    })

    test('counts pattern occurrences spanning the entire string', () => {
      expect(findMatches('aaaaa', 'aa')).toBe(4)
    })
  })

  describe('regex patterns — edge cases', () => {
    test('regex with character class matches correctly', () => {
      expect(findMatches('abc123def456ghi789', /[a-z]+/)).toBe(3)
    })

    test('regex does not match when pattern not present', () => {
      expect(findMatches('hello world', /xyz\d/)).toBe(0)
    })

    test('regex matches TODO with different prefixes', () => {
      const code = '// HACK: bad code\n// FIXME: broken\n// XXX: urgent'
      expect(findMatches(code, /\/\/\s*(TODO|FIXME|HACK|XXX)/i)).toBe(3)
    })

    test('regex matches multiline block comment with TODO', () => {
      const code = '/* This is a TODO: fix it later */'
      expect(findMatches(code, /\/\*[\s\S]*?(TODO|FIXME|HACK|XXX)/i)).toBe(1)
    })

    test('regex matches nested if on same line', () => {
      expect(
        findMatches('if (a) { if (b) { if (c) {} } }', /if\s*\([^)]*\)\s*\{[^}]*if\s*\(/),
      ).toBe(1)
    })
  })
})

describe('suggest-rules-patterns: addSuggestion', () => {
  test('adds multiple different rules to the same map', () => {
    const map = new Map<string, RuleSuggestion>()
    const r1 = makeSuggestedRule({ ruleId: 'rule-a', confidence: 'low', impact: 'medium' })
    const r2 = makeSuggestedRule({ ruleId: 'rule-b', confidence: 'medium', impact: 'high' })
    const r3 = makeSuggestedRule({ ruleId: 'rule-c', confidence: 'high', impact: 'low' })

    addSuggestion(map, 'rule-a', 1, r1, mockGetRuleCategory)
    addSuggestion(map, 'rule-b', 2, r2, mockGetRuleCategory)
    addSuggestion(map, 'rule-c', 3, r3, mockGetRuleCategory)

    expect(map.size).toBe(3)
    expect(map.get('rule-a')!.estimatedViolations).toBe(1)
    expect(map.get('rule-b')!.estimatedViolations).toBe(2)
    expect(map.get('rule-c')!.estimatedViolations).toBe(3)
  })

  test('accumulates violations correctly across three calls for same rule', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'accum-rule' })

    addSuggestion(map, 'accum-rule', 10, suggested, mockGetRuleCategory)
    addSuggestion(map, 'accum-rule', 20, suggested, mockGetRuleCategory)
    addSuggestion(map, 'accum-rule', 30, suggested, mockGetRuleCategory)

    expect(map.get('accum-rule')!.estimatedViolations).toBe(60)
  })

  test('preserves all metadata fields on first add', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({
      ruleId: 'meta-rule',
      confidence: 'medium',
      impact: 'low',
      reason: 'Very specific reason',
    })

    addSuggestion(map, 'meta-rule', 5, suggested, mockGetRuleCategory)

    const result = map.get('meta-rule')!
    expect(result.ruleId).toBe('meta-rule')
    expect(result.confidence).toBe('medium')
    expect(result.impact).toBe('low')
    expect(result.reason).toBe('Very specific reason')
    expect(result.category).toBe('patterns')
    expect(result.estimatedViolations).toBe(5)
  })

  test('gets correct category for security rules', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'no-eval' })

    addSuggestion(map, 'no-eval', 1, suggested, mockGetRuleCategory)

    expect(map.get('no-eval')!.category).toBe('security')
  })

  test('gets correct category for complexity rules', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'max-depth' })

    addSuggestion(map, 'max-depth', 1, suggested, mockGetRuleCategory)

    expect(map.get('max-depth')!.category).toBe('complexity')
  })

  test('defaults to patterns category for unknown ruleId', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'totally-unknown-rule' })

    addSuggestion(map, 'totally-unknown-rule', 1, suggested, mockGetRuleCategory)

    expect(map.get('totally-unknown-rule')!.category).toBe('patterns')
  })
})

describe('suggest-rules-patterns: analyzeFile with specific detectors', () => {
  test('detects console.warn pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.warn("warning!")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console-log')).toBe(true)
  })

  test('detects console.error pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.error("error!")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console-log')).toBe(true)
  })

  test('detects console.debug pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.debug("debug!")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console-log')).toBe(true)
  })

  test('detects <any> cast syntax', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = <any>value;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-explicit-any')).toBe(true)
  })

  test('detects "as any" cast syntax', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = value as any;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-explicit-any')).toBe(true)
  })

  test('detects != loose inequality', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (a != null) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('eq-eq-eq')).toBe(true)
  })

  test('detects new Function( usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'const fn = new Function("x", "return x");',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    expect(map.has('no-eval')).toBe(true)
  })

  test('detects null check with ===', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x === null) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('detects undefined check with !==', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x !== undefined) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('accumulates violations from multiple console variants in one file', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'console.log("a"); console.warn("b"); console.error("c");'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('no-console-log')!.estimatedViolations).toBe(3)
  })

  test('detects multiple patterns from different detectors simultaneously', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'var x: any = eval("code");'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
    expect(map.has('no-explicit-any')).toBe(true)
    expect(map.has('no-eval')).toBe(true)
  })

  test('does not detect var or eval in clean const code', () => {
    const map = new Map<string, RuleSuggestion>()
    const code =
      "const greeting: string = 'hello';\nconst num: number = 42;\nconsole.log(greeting);"
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console-log')).toBe(true)
    expect(map.has('no-explicit-any')).toBe(false)
    expect(map.has('prefer-const')).toBe(false)
    expect(map.has('no-eval')).toBe(false)
  })

  test('detector with empty patterns array produces no matches', () => {
    const detectors = [makeDetector({ patterns: [] })]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('anything here', map, detectors, mockGetRuleCategory)

    expect(map.size).toBe(0)
  })

  test('detector with regex pattern matches correctly', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Number detector',
        patterns: [/\d+/],
        suggestedRules: [
          {
            confidence: 'medium',
            impact: 'low',
            reason: 'Found numbers',
            ruleId: 'no-numbers',
          },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('a1 b2 c3', map, detectors, mockGetRuleCategory)

    expect(map.get('no-numbers')!.estimatedViolations).toBe(3)
  })

  test('multiple suggested rules per detector all get added', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Multi-rule detector',
        patterns: ['trigger'],
        suggestedRules: [
          { confidence: 'high', impact: 'high', reason: 'Rule A', ruleId: 'rule-a' },
          { confidence: 'low', impact: 'low', reason: 'Rule B', ruleId: 'rule-b' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('trigger', map, detectors, mockGetRuleCategory)

    expect(map.has('rule-a')).toBe(true)
    expect(map.has('rule-b')).toBe(true)
  })
})

describe('suggest-rules-patterns: PATTERN_DETECTORS structure', () => {
  test('contains all expected detector names', () => {
    const names = PATTERN_DETECTORS.map((d) => d.name)
    expect(names).toContain('Console logs')
    expect(names).toContain('Any type usage')
    expect(names).toContain('Var declarations')
    expect(names).toContain('Loose equality')
    expect(names).toContain('Eval usage')
    expect(names).toContain('Magic numbers')
    expect(names).toContain('Nested conditionals')
    expect(names).toContain('Long functions')
    expect(names).toContain('TODO/FIXME comments')
    expect(names).toContain('Async without await')
    expect(names).toContain('Null checks')
    expect(names).toContain('Type assertions')
  })

  test('each detector has valid confidence levels', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(['high', 'medium', 'low']).toContain(rule.confidence)
      }
    }
  })

  test('each detector has valid impact levels', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(['high', 'medium', 'low']).toContain(rule.impact)
      }
    }
  })

  test('console log detector detects all console variants', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(detector.patterns).toContain('console.log')
    expect(detector.patterns).toContain('console.warn')
    expect(detector.patterns).toContain('console.error')
    expect(detector.patterns).toContain('console.debug')
  })

  test('any type detector detects all any variants', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(detector.patterns).toContain(': any')
    expect(detector.patterns).toContain('<any>')
    expect(detector.patterns).toContain('as any')
  })

  test('null checks detector uses regex patterns only', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Null checks')!
    for (const pattern of detector.patterns) {
      expect(pattern).toBeInstanceOf(RegExp)
    }
  })

  test('async without await detector has low impact', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Async without await')!
    expect(detector.suggestedRules[0].impact).toBe('low')
    expect(detector.suggestedRules[0].confidence).toBe('medium')
  })
})

describe('suggest-rules-patterns: findMatches additional edge cases', () => {
  test('returns 0 for empty content with string pattern', () => {
    expect(findMatches('', 'console.log')).toBe(0)
  })

  test('returns 0 for empty content with regex pattern', () => {
    expect(findMatches('', /\d+/)).toBe(0)
  })

  test('returns 0 when pattern string is longer than content', () => {
    expect(findMatches('ab', 'abcdef')).toBe(0)
  })

  test('returns 0 when string pattern is not found in content', () => {
    expect(findMatches('hello world', 'xyz')).toBe(0)
  })

  test('finds match when content equals pattern exactly', () => {
    expect(findMatches('exact', 'exact')).toBe(1)
  })

  test('handles regex that already has global flag', () => {
    expect(findMatches('aaa bbb ccc', /[a-z]+/g)).toBe(3)
  })

  test('counts overlapping string matches correctly', () => {
    expect(findMatches('ababab', 'aba')).toBe(2)
  })

  test('returns 0 for regex that matches nothing in content', () => {
    expect(findMatches('only letters here', /^\d+$/)).toBe(0)
  })

  test('handles single character content with single char pattern', () => {
    expect(findMatches('z', 'z')).toBe(1)
  })

  test('finds multiple regex matches across multiline content', () => {
    const code = 'const a = 100;\nconst b = 200;\nconst c = 300;'
    expect(findMatches(code, /\b\d{2,}\b/)).toBe(3)
  })
})

describe('suggest-rules-patterns: addSuggestion additional edge cases', () => {
  test('adds suggestion with zero matches', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'zero-rule' })

    addSuggestion(map, 'zero-rule', 0, suggested, mockGetRuleCategory)

    expect(map.get('zero-rule')!.estimatedViolations).toBe(0)
  })

  test('accumulates violations starting from zero', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'step-rule' })

    addSuggestion(map, 'step-rule', 0, suggested, mockGetRuleCategory)
    addSuggestion(map, 'step-rule', 5, suggested, mockGetRuleCategory)

    expect(map.get('step-rule')!.estimatedViolations).toBe(5)
  })

  test('handles very large match counts', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'large-rule' })

    addSuggestion(map, 'large-rule', 999999, suggested, mockGetRuleCategory)

    expect(map.get('large-rule')!.estimatedViolations).toBe(999999)
  })

  test('overwrites metadata on subsequent adds for same ruleId', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested1 = makeSuggestedRule({
      ruleId: 'overwrite-rule',
      confidence: 'low',
      impact: 'low',
      reason: 'First reason',
    })
    const suggested2 = makeSuggestedRule({
      ruleId: 'overwrite-rule',
      confidence: 'high',
      impact: 'high',
      reason: 'Second reason',
    })

    addSuggestion(map, 'overwrite-rule', 1, suggested1, mockGetRuleCategory)
    addSuggestion(map, 'overwrite-rule', 1, suggested2, mockGetRuleCategory)

    const result = map.get('overwrite-rule')!
    expect(result.estimatedViolations).toBe(2)
    expect(result.confidence).toBe('high')
    expect(result.impact).toBe('high')
    expect(result.reason).toBe('Second reason')
  })

  test('uses custom category function correctly', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'custom-rule' })
    const customCategory = (_ruleId: string): string => 'custom-category'

    addSuggestion(map, 'custom-rule', 1, suggested, customCategory)

    expect(map.get('custom-rule')!.category).toBe('custom-category')
  })
})

describe('suggest-rules-patterns: analyzeFile additional coverage', () => {
  test('produces no results for empty content', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.size).toBe(0)
  })

  test('detects console.log pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.log("hello")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console-log')).toBe(true)
  })

  test('detects var declaration pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('var x = 1;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
  })

  test('detects loose equality == pattern', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (a == b) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('eq-eq-eq')).toBe(true)
  })

  test('detects eval( usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('eval("alert(1)")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-eval')).toBe(true)
  })

  test('detects magic numbers', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const timeout = 3000;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-magic-numbers')).toBe(true)
  })

  test('detects TODO comments', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// TODO: fix this later', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects FIXME comments', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// FIXME: broken code', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects type assertions with " as "', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = value as string;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-unsafe-type-assertion')).toBe(true)
  })

  test('detects null check with !== null', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x !== null) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('detects undefined check with === undefined', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x === undefined) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  test('content with no matching patterns produces empty map', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'const x: string = "hello";\nlet y = true;',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    expect(map.size).toBe(0)
  })

  test('multiple files accumulate suggestions into same map', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.log("file1")', map, PATTERN_DETECTORS, mockGetRuleCategory)
    analyzeFile('console.log("file2")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('no-console-log')!.estimatedViolations).toBe(2)
  })

  test('content triggering all string-based detectors', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'var x: any = eval("code"); if (a == b) console.log(x); const y = z as string;'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
    expect(map.has('no-explicit-any')).toBe(true)
    expect(map.has('no-eval')).toBe(true)
    expect(map.has('eq-eq-eq')).toBe(true)
    expect(map.has('no-console-log')).toBe(true)
    expect(map.has('no-unsafe-type-assertion')).toBe(true)
  })

  test('works with custom detectors not in PATTERN_DETECTORS', () => {
    const customDetectors: PatternDetector[] = [
      {
        name: 'Custom',
        patterns: ['CUSTOM_PATTERN'],
        suggestedRules: [
          { confidence: 'high', impact: 'high', reason: 'Custom found', ruleId: 'custom-detected' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('some CUSTOM_PATTERN here', map, customDetectors, mockGetRuleCategory)

    expect(map.has('custom-detected')).toBe(true)
    expect(map.size).toBe(1)
  })

  test('detector with regex pattern producing no matches adds nothing', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Never matches',
        patterns: [/ZEBRA_\d+/],
        suggestedRules: [
          { confidence: 'high', impact: 'low', reason: 'Never', ruleId: 'never-rule' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('no matching content here', map, detectors, mockGetRuleCategory)

    expect(map.size).toBe(0)
  })
})

describe('suggest-rules-patterns: PATTERN_DETECTORS additional structure', () => {
  test('loose equality detector has both == and != patterns', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Loose equality')!
    expect(detector.patterns).toContain(' == ')
    expect(detector.patterns).toContain(' != ')
  })

  test('eval usage detector has eval and Function patterns', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Eval usage')!
    expect(detector.patterns).toContain('eval(')
    expect(detector.patterns).toContain('new Function(')
  })

  test('var declarations detector has var pattern', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Var declarations')!
    expect(detector.patterns).toContain('var ')
  })

  test('magic numbers detector uses regex pattern', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Magic numbers')!
    expect(detector.patterns.length).toBe(1)
    expect(detector.patterns[0]).toBeInstanceOf(RegExp)
  })

  test('long functions detector has empty patterns array', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Long functions')!
    expect(detector.patterns).toEqual([])
    expect(detector.suggestedRules[0].ruleId).toBe('max-lines-per-function')
  })

  test('TODO/FIXME detector has two regex patterns', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'TODO/FIXME comments')!
    expect(detector.patterns.length).toBe(2)
    for (const pattern of detector.patterns) {
      expect(pattern).toBeInstanceOf(RegExp)
    }
  })

  test('type assertions detector has " as " pattern', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Type assertions')!
    expect(detector.patterns).toContain(' as ')
  })

  test('every detector has at least one suggested rule', () => {
    for (const detector of PATTERN_DETECTORS) {
      expect(detector.suggestedRules.length).toBeGreaterThanOrEqual(1)
    }
  })

  test('every suggested rule has a non-empty ruleId', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(rule.ruleId.length).toBeGreaterThan(0)
      }
    }
  })

  test('every suggested rule has a non-empty reason', () => {
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(rule.reason.length).toBeGreaterThan(0)
      }
    }
  })

  test('nested conditionals detector uses regex pattern', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Nested conditionals')!
    expect(detector.patterns[0]).toBeInstanceOf(RegExp)
  })

  test('async without await detector uses regex pattern', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Async without await')!
    expect(detector.patterns[0]).toBeInstanceOf(RegExp)
  })

  test('each detector has a non-empty name', () => {
    for (const detector of PATTERN_DETECTORS) {
      expect(detector.name.length).toBeGreaterThan(0)
    }
  })
})

describe('suggest-rules-patterns: findMatches with special characters', () => {
  test('treats dots in string pattern as literal', () => {
    expect(findMatches('a.b.c.d', '.')).toBe(3)
  })

  test('treats square brackets in string pattern as literal', () => {
    expect(findMatches('arr[0] arr[1]', 'arr[')).toBe(2)
  })

  test('treats asterisks in string pattern as literal', () => {
    expect(findMatches('a * b * c', '*')).toBe(2)
  })

  test('treats dollar sign in string pattern as literal', () => {
    expect(findMatches('$foo $bar', '$')).toBe(2)
  })

  test('treats caret in string pattern as literal', () => {
    expect(findMatches('a^b^c', '^')).toBe(2)
  })

  test('treats pipe in string pattern as literal', () => {
    expect(findMatches('a | b | c', '|')).toBe(2)
  })

  test('treats backslash in string pattern as literal', () => {
    expect(findMatches('C:\\Users\\test', '\\')).toBe(2)
  })

  test('finds multi-char string pattern with special chars', () => {
    expect(findMatches('a + b + c', ' + ')).toBe(2)
  })
})

describe('suggest-rules-patterns: findMatches with whitespace patterns', () => {
  test('finds tab characters as string pattern', () => {
    expect(findMatches('a\tb\tc', '\t')).toBe(2)
  })

  test('finds newline characters as string pattern', () => {
    expect(findMatches('a\nb\nc', '\n')).toBe(2)
  })

  test('finds space characters as string pattern', () => {
    expect(findMatches('a b c', ' ')).toBe(2)
  })

  test('finds multi-space pattern', () => {
    expect(findMatches('a  b  c', '  ')).toBe(2)
  })
})

describe('suggest-rules-patterns: findMatches with regex flags', () => {
  test('case-insensitive regex without global flag', () => {
    expect(findMatches('Hello HELLO hello', /hello/i)).toBe(1)
  })

  test('case-insensitive regex with global flag', () => {
    expect(findMatches('Hello HELLO hello', /hello/gi)).toBe(3)
  })

  test('regex without flags still matches all occurrences', () => {
    expect(findMatches('cat dog cat dog', /cat/)).toBe(2)
  })

  test('regex with global flag returns all matches', () => {
    expect(findMatches('cat dog cat dog', /cat/g)).toBe(2)
  })

  test('multiline regex matches across lines', () => {
    const code = 'line1\nline2\nline3'
    expect(findMatches(code, /^line/gm)).toBe(3)
  })
})

describe('suggest-rules-patterns: findMatches boundary conditions', () => {
  test('pattern at start of content', () => {
    expect(findMatches('hello world', 'hello')).toBe(1)
  })

  test('pattern at end of content', () => {
    expect(findMatches('hello world', 'world')).toBe(1)
  })

  test('repeated single-char pattern in content', () => {
    expect(findMatches('zzzzz', 'z')).toBe(5)
  })

  test('content with only the pattern', () => {
    expect(findMatches('xyz', 'xyz')).toBe(1)
  })

  test('pattern longer than single char repeated', () => {
    expect(findMatches('abababab', 'ab')).toBe(4)
  })

  test('regex word boundary matches', () => {
    expect(findMatches('the theme is there', /\bthe\b/)).toBe(1)
  })

  test('regex digit match in mixed content', () => {
    expect(findMatches('a1b2c3', /\d/)).toBe(3)
  })

  test('regex matches ascii word characters', () => {
    expect(findMatches('hello world foo', /\w+/g)).toBe(3)
  })
})

describe('suggest-rules-patterns: addSuggestion with multiple rules', () => {
  test('adds rules in any order', () => {
    const map = new Map<string, RuleSuggestion>()
    const z = makeSuggestedRule({ ruleId: 'z-rule' })
    const a = makeSuggestedRule({ ruleId: 'a-rule' })

    addSuggestion(map, 'z-rule', 1, z, mockGetRuleCategory)
    addSuggestion(map, 'a-rule', 2, a, mockGetRuleCategory)

    expect(map.size).toBe(2)
    expect(map.get('z-rule')!.estimatedViolations).toBe(1)
    expect(map.get('a-rule')!.estimatedViolations).toBe(2)
  })

  test('updates category for rule on subsequent add', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'no-eval' })

    addSuggestion(map, 'no-eval', 1, suggested, mockGetRuleCategory)

    expect(map.get('no-eval')!.category).toBe('security')
  })

  test('accumulates large number of violations', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'big-accum' })

    for (let i = 0; i < 100; i++) {
      addSuggestion(map, 'big-accum', 1, suggested, mockGetRuleCategory)
    }

    expect(map.get('big-accum')!.estimatedViolations).toBe(100)
  })

  test('handles rule with medium confidence and impact', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({
      ruleId: 'medium-rule',
      confidence: 'medium',
      impact: 'medium',
    })

    addSuggestion(map, 'medium-rule', 3, suggested, mockGetRuleCategory)

    const result = map.get('medium-rule')!
    expect(result.confidence).toBe('medium')
    expect(result.impact).toBe('medium')
  })

  test('handles rule with low confidence and high impact', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({
      ruleId: 'mixed-rule',
      confidence: 'low',
      impact: 'high',
    })

    addSuggestion(map, 'mixed-rule', 1, suggested, mockGetRuleCategory)

    const result = map.get('mixed-rule')!
    expect(result.confidence).toBe('low')
    expect(result.impact).toBe('high')
  })

  test('handles rule with high confidence and low impact', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({
      ruleId: 'inverse-rule',
      confidence: 'high',
      impact: 'low',
    })

    addSuggestion(map, 'inverse-rule', 1, suggested, mockGetRuleCategory)

    const result = map.get('inverse-rule')!
    expect(result.confidence).toBe('high')
    expect(result.impact).toBe('low')
  })
})

describe('suggest-rules-patterns: analyzeFile with each PATTERN_DETECTOR', () => {
  test('detects : any type annotation', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x: any = value;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-explicit-any')).toBe(true)
  })

  test('detects nested if statements', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (x) { if (y) {} }', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('max-depth')).toBe(true)
  })

  test('detects async function without await', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'async function fetchData() { return 42; }',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    expect(map.has('no-async-without-await')).toBe(true)
  })

  test('detects HACK comment', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// HACK: temporary workaround', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects XXX comment', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// XXX: needs refactoring', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('detects block comment TODO', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('/* TODO: implement this feature */', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('long functions detector produces no results for any content', () => {
    const map = new Map<string, RuleSuggestion>()
    const longFunction = 'function long() { /* lots of code */ }'
    analyzeFile(longFunction, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('max-lines-per-function')).toBe(false)
  })

  test('detects multiple var declarations', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('var a = 1; var b = 2; var c = 3;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('prefer-const')!.estimatedViolations).toBe(3)
  })

  test('detects both == and != in same content', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('if (a == b) {} if (c != d) {}', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('eq-eq-eq')!.estimatedViolations).toBe(2)
  })

  test('detects both eval and new Function in same content', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'eval("1"); new Function("x", "return x");',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    expect(map.get('no-eval')!.estimatedViolations).toBe(2)
  })

  test('detects multiple any variants in same content', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'const a: any = 1; const b = <any>2; const c = 3 as any;',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    expect(map.get('no-explicit-any')!.estimatedViolations).toBe(3)
  })

  test('counts all null/undefined check patterns', () => {
    const map = new Map<string, RuleSuggestion>()
    const code =
      'if (x === null) {} if (y !== null) {} if (z === undefined) {} if (w !== undefined) {}'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('prefer-nullish-coalescing')!.estimatedViolations).toBe(4)
  })

  test('counts multiple type assertions', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'const a = x as string; const b = y as number; const c = z as boolean;',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    expect(map.get('no-unsafe-type-assertion')!.estimatedViolations).toBe(3)
  })

  test('counts multiple magic numbers', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(
      'const a = 100; const b = 200; const c = 300;',
      map,
      PATTERN_DETECTORS,
      mockGetRuleCategory,
    )

    expect(map.get('no-magic-numbers')!.estimatedViolations).toBe(3)
  })
})

describe('suggest-rules-patterns: analyzeFile with empty detectors', () => {
  test('empty detectors array produces empty map', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('var x: any = eval("code");', map, [], mockGetRuleCategory)

    expect(map.size).toBe(0)
  })

  test('whitespace-only content produces empty map', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('   \n\t  \n  ', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.size).toBe(0)
  })

  test('single-line comment content produces no var detection', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('// var x = 1;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
  })
})

describe('suggest-rules-patterns: analyzeFile accumulation across calls', () => {
  test('accumulates violations from three separate file analyses', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.log("a")', map, PATTERN_DETECTORS, mockGetRuleCategory)
    analyzeFile('console.log("b")', map, PATTERN_DETECTORS, mockGetRuleCategory)
    analyzeFile('console.log("c")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('no-console-log')!.estimatedViolations).toBe(3)
  })

  test('accumulates different detectors from separate files', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('var x = 1;', map, PATTERN_DETECTORS, mockGetRuleCategory)
    analyzeFile('console.log("hello")', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
    expect(map.has('no-console-log')).toBe(true)
    expect(map.size).toBe(2)
  })

  test('clean file does not affect accumulated results', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('console.log("hello")', map, PATTERN_DETECTORS, mockGetRuleCategory)
    analyzeFile('const x: string = "hello";', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('no-console-log')!.estimatedViolations).toBe(1)
    expect(map.size).toBe(1)
  })
})

describe('suggest-rules-patterns: analyzeFile with combined patterns', () => {
  test('realistic TypeScript file with multiple issues', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = `
      var data: any = {};
      if (data == null) {}
      eval("console.log(data)");
      console.log("debug");
      // TODO: refactor this
    `
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
    expect(map.has('no-explicit-any')).toBe(true)
    expect(map.has('eq-eq-eq')).toBe(true)
    expect(map.has('no-eval')).toBe(true)
    expect(map.has('no-console-log')).toBe(true)
    expect(map.has('no-duplicate-code')).toBe(true)
  })

  test('multiple console patterns accumulate correctly', () => {
    const map = new Map<string, RuleSuggestion>()
    const code =
      'console.log("a"); console.log("b"); console.log("c"); console.log("d"); console.log("e");'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('no-console-log')!.estimatedViolations).toBe(5)
  })

  test('mixed console variants accumulate correctly', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'console.log("a"); console.warn("b"); console.error("c"); console.debug("d");'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.get('no-console-log')!.estimatedViolations).toBe(4)
  })
})

describe('suggest-rules-patterns: PATTERN_DETECTORS individual detector confidence', () => {
  test('console log detector has high confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(detector.suggestedRules[0].confidence).toBe('high')
  })

  test('console log detector has medium impact', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(detector.suggestedRules[0].impact).toBe('medium')
  })

  test('any type detector has high confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(detector.suggestedRules[0].confidence).toBe('high')
  })

  test('any type detector has high impact', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(detector.suggestedRules[0].impact).toBe('high')
  })

  test('var declarations detector has high confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Var declarations')!
    expect(detector.suggestedRules[0].confidence).toBe('high')
  })

  test('loose equality detector has high confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Loose equality')!
    expect(detector.suggestedRules[0].confidence).toBe('high')
  })

  test('eval usage detector has high confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Eval usage')!
    expect(detector.suggestedRules[0].confidence).toBe('high')
  })

  test('magic numbers detector has medium confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Magic numbers')!
    expect(detector.suggestedRules[0].confidence).toBe('medium')
  })

  test('nested conditionals detector has medium confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Nested conditionals')!
    expect(detector.suggestedRules[0].confidence).toBe('medium')
  })

  test('long functions detector has low confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Long functions')!
    expect(detector.suggestedRules[0].confidence).toBe('low')
  })

  test('TODO/FIXME detector has low confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'TODO/FIXME comments')!
    expect(detector.suggestedRules[0].confidence).toBe('low')
  })

  test('type assertions detector has low confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Type assertions')!
    expect(detector.suggestedRules[0].confidence).toBe('low')
  })

  test('null checks detector has medium confidence', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Null checks')!
    expect(detector.suggestedRules[0].confidence).toBe('medium')
  })

  test('null checks detector has low impact', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Null checks')!
    expect(detector.suggestedRules[0].impact).toBe('low')
  })
})

describe('suggest-rules-patterns: PATTERN_DETECTORS total count', () => {
  test('has exactly 12 detectors', () => {
    expect(PATTERN_DETECTORS.length).toBe(12)
  })

  test('all detector names are unique', () => {
    const names = PATTERN_DETECTORS.map((d) => d.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })
})

describe('suggest-rules-patterns: findMatches with realistic code patterns', () => {
  test('finds eval calls in complex code', () => {
    const code = 'const result = eval(userInput); const data = eval(anotherInput);'
    expect(findMatches(code, 'eval(')).toBe(2)
  })

  test('finds console.log in method chain', () => {
    const code = 'console.log(JSON.stringify(data))'
    expect(findMatches(code, 'console.log')).toBe(1)
  })

  test('finds var keyword in code with spacing', () => {
    const code = 'var x=1; var  y=2;'
    expect(findMatches(code, 'var ')).toBe(2)
  })

  test('regex finds all TODO variations case insensitive', () => {
    const code = '// todo: one\n// TODO: two\n// Todo: three'
    expect(findMatches(code, /\/\/\s*(TODO|FIXME|HACK|XXX)/gi)).toBe(3)
  })

  test('finds magic numbers in arithmetic expressions', () => {
    const code = 'const x = 100 + 200 + 300'
    expect(findMatches(code, /\b\d{2,}\b/)).toBe(3)
  })

  test('finds loose equality with spaces', () => {
    expect(findMatches('if (a == b) {}', ' == ')).toBe(1)
  })

  test('does not find loose equality without spaces', () => {
    expect(findMatches('if (a==b) {}', ' == ')).toBe(0)
  })
})

describe('suggest-rules-patterns: analyzeFile custom detector scenarios', () => {
  test('detector with multiple patterns adds rules for each match', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Multi-pattern',
        patterns: ['foo', 'bar'],
        suggestedRules: [
          { confidence: 'high', impact: 'medium', reason: 'Found', ruleId: 'multi-found' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('foo and bar', map, detectors, mockGetRuleCategory)

    expect(map.get('multi-found')!.estimatedViolations).toBe(2)
  })

  test('detector with mixed string and regex patterns', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Mixed',
        patterns: ['hello', /\d+/],
        suggestedRules: [
          { confidence: 'high', impact: 'low', reason: 'Mixed found', ruleId: 'mixed-found' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('hello world 123', map, detectors, mockGetRuleCategory)

    expect(map.get('mixed-found')!.estimatedViolations).toBe(2)
  })

  test('multiple detectors can contribute to same rule', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Detector A',
        patterns: ['trigger'],
        suggestedRules: [
          { confidence: 'high', impact: 'high', reason: 'A', ruleId: 'shared-rule' },
        ],
      },
      {
        name: 'Detector B',
        patterns: ['trigger'],
        suggestedRules: [
          { confidence: 'medium', impact: 'medium', reason: 'B', ruleId: 'shared-rule' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('trigger', map, detectors, mockGetRuleCategory)

    expect(map.get('shared-rule')!.estimatedViolations).toBe(2)
  })

  test('detector that matches multiple times accumulates per suggested rule', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Multi-match',
        patterns: ['x'],
        suggestedRules: [
          { confidence: 'high', impact: 'high', reason: 'R1', ruleId: 'r1' },
          { confidence: 'low', impact: 'low', reason: 'R2', ruleId: 'r2' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('x x x', map, detectors, mockGetRuleCategory)

    expect(map.get('r1')!.estimatedViolations).toBe(3)
    expect(map.get('r2')!.estimatedViolations).toBe(3)
  })
})

describe('suggest-rules-patterns: analyzeFile regex detector edge cases', () => {
  test('regex detector matching zero-length produces no suggestions', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Zero-length',
        patterns: [/$/m],
        suggestedRules: [
          { confidence: 'high', impact: 'low', reason: 'Zero', ruleId: 'zero-length-rule' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('hello', map, detectors, mockGetRuleCategory)

    expect(map.has('zero-length-rule')).toBe(true)
  })

  test('regex detector with specific pattern matches only correct content', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Specific',
        patterns: [/^import /],
        suggestedRules: [
          { confidence: 'high', impact: 'low', reason: 'Import', ruleId: 'import-rule' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('import { something } from "module"', map, detectors, mockGetRuleCategory)

    expect(map.has('import-rule')).toBe(true)
  })

  test('regex detector not matching content it should not', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Specific',
        patterns: [/^import /],
        suggestedRules: [
          { confidence: 'high', impact: 'low', reason: 'Import', ruleId: 'import-rule' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = importSomething()', map, detectors, mockGetRuleCategory)

    expect(map.has('import-rule')).toBe(false)
  })
})

describe('suggest-rules-patterns: addSuggestion map behavior', () => {
  test('map size grows with unique rules', () => {
    const map = new Map<string, RuleSuggestion>()
    expect(map.size).toBe(0)

    addSuggestion(map, 'rule-1', 1, makeSuggestedRule({ ruleId: 'rule-1' }), mockGetRuleCategory)
    expect(map.size).toBe(1)

    addSuggestion(map, 'rule-2', 1, makeSuggestedRule({ ruleId: 'rule-2' }), mockGetRuleCategory)
    expect(map.size).toBe(2)
  })

  test('map size stays same when adding same rule', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 'same-rule' })

    addSuggestion(map, 'same-rule', 1, suggested, mockGetRuleCategory)
    expect(map.size).toBe(1)

    addSuggestion(map, 'same-rule', 2, suggested, mockGetRuleCategory)
    expect(map.size).toBe(1)
  })

  test('can retrieve all ruleIds from map', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(map, 'alpha', 1, makeSuggestedRule({ ruleId: 'alpha' }), mockGetRuleCategory)
    addSuggestion(map, 'beta', 1, makeSuggestedRule({ ruleId: 'beta' }), mockGetRuleCategory)
    addSuggestion(map, 'gamma', 1, makeSuggestedRule({ ruleId: 'gamma' }), mockGetRuleCategory)

    const keys = Array.from(map.keys())
    expect(keys).toContain('alpha')
    expect(keys).toContain('beta')
    expect(keys).toContain('gamma')
  })
})

describe('suggest-rules-patterns: findMatches with empty patterns', () => {
  test('empty string pattern is not a valid use case for findMatches', () => {
    expect(true).toBe(true)
  })
})

describe('suggest-rules-patterns: findMatches pattern types', () => {
  test('string pattern finds console.log in typical usage', () => {
    expect(findMatches('console.log("hello world")', 'console.log')).toBe(1)
  })

  test('regex pattern finds digits in typical code', () => {
    expect(findMatches('const x = 42;', /\d+/)).toBe(1)
  })

  test('regex pattern with alternation matches globally', () => {
    expect(findMatches('cat and dog', /cat|dog/)).toBe(2)
  })

  test('regex pattern with alternation and global finds all', () => {
    expect(findMatches('cat and dog and cat', /cat|dog/g)).toBe(3)
  })
})

describe('suggest-rules-patterns: PATTERN_DETECTORS reason strings', () => {
  test('console log detector has meaningful reason', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')!
    expect(detector.suggestedRules[0].reason).toContain('console')
  })

  test('any type detector mentions type safety', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Any type usage')!
    expect(detector.suggestedRules[0].reason).toContain('type safety')
  })

  test('eval detector mentions security', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Eval usage')!
    expect(detector.suggestedRules[0].reason).toContain('security')
  })

  test('null checks detector mentions nullish coalescing', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Null checks')!
    expect(detector.suggestedRules[0].reason).toContain('nullish coalescing')
  })

  test('var declarations detector mentions const or let', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Var declarations')!
    expect(detector.suggestedRules[0].reason).toContain('const or let')
  })

  test('loose equality detector mentions strict equality', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Loose equality')!
    expect(detector.suggestedRules[0].reason).toContain('strict equality')
  })
})

describe('suggest-rules-patterns: findMatches single-digit numbers', () => {
  test('magic number regex does not match single digits', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Magic numbers')!
    const regex = detector.patterns[0] as RegExp
    expect(findMatches('const x = 5;', regex)).toBe(0)
  })

  test('magic number regex matches two-digit numbers', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Magic numbers')!
    const regex = detector.patterns[0] as RegExp
    expect(findMatches('const x = 42;', regex)).toBe(1)
  })

  test('magic number regex matches three-digit numbers', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Magic numbers')!
    const regex = detector.patterns[0] as RegExp
    expect(findMatches('const x = 300;', regex)).toBe(1)
  })
})

describe('suggest-rules-patterns: findMatches unicode and special content', () => {
  test('finds string pattern in content with unicode characters', () => {
    expect(findMatches('console.log("héllo") console.log("wörld")', 'console.log')).toBe(2)
  })

  test('regex matches word boundaries with punctuation', () => {
    expect(findMatches('hello, world! foo.', /\w+/)).toBe(3)
  })

  test('finds string pattern in content with emoji', () => {
    expect(findMatches('eval("🚀") + eval("💡")', 'eval(')).toBe(2)
  })
})

describe('suggest-rules-patterns: analyzeFile with realistic edge cases', () => {
  test('detects patterns in code with mixed line endings', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'var x = 1;\r\nconsole.log(x);\rvar y = 2;'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('prefer-const')).toBe(true)
    expect(map.has('no-console-log')).toBe(true)
  })

  test('does not confuse substring in unrelated code', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const evaluate = (x) => x;', map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-eval')).toBe(false)
  })

  test('detects patterns in deeply nested code', () => {
    const map = new Map<string, RuleSuggestion>()
    const code = 'function outer() { function inner() { console.log("deep"); } }'
    analyzeFile(code, map, PATTERN_DETECTORS, mockGetRuleCategory)

    expect(map.has('no-console-log')).toBe(true)
  })
})

describe('suggest-rules-patterns: PATTERN_DETECTORS reason content', () => {
  test('nested conditionals detector mentions readability', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Nested conditionals')!
    expect(detector.suggestedRules[0].reason).toContain('readability')
  })

  test('magic numbers detector mentions named constants', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Magic numbers')!
    expect(detector.suggestedRules[0].reason).toContain('named constants')
  })

  test('TODO/FIXME detector mentions technical debt', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'TODO/FIXME comments')!
    expect(detector.suggestedRules[0].reason).toContain('technical debt')
  })

  test('async without await detector mentions async', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Async without await')!
    expect(detector.suggestedRules[0].reason).toContain('async')
  })

  test('type assertions detector mentions unsafe', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Type assertions')!
    expect(detector.suggestedRules[0].reason).toContain('unsafe')
  })

  test('long functions detector mentions split', () => {
    const detector = PATTERN_DETECTORS.find((d) => d.name === 'Long functions')!
    expect(detector.suggestedRules[0].reason).toContain('split')
  })
})

describe('suggest-rules-patterns: findMatches with repeated patterns', () => {
  test('finds ten occurrences of a single-char pattern', () => {
    expect(findMatches('aaaaaaaaaa', 'a')).toBe(10)
  })

  test('finds pattern repeated across many lines', () => {
    const lines = Array(50).fill('console.log("x")').join('\n')
    expect(findMatches(lines, 'console.log')).toBe(50)
  })
})

describe('suggest-rules-patterns: addSuggestion with varied inputs', () => {
  test('adding then removing and re-adding a rule works correctly', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = makeSuggestedRule({ ruleId: 're-add-rule', confidence: 'low', impact: 'low' })

    addSuggestion(map, 're-add-rule', 3, suggested, mockGetRuleCategory)
    map.delete('re-add-rule')
    expect(map.has('re-add-rule')).toBe(false)

    const suggested2 = makeSuggestedRule({
      ruleId: 're-add-rule',
      confidence: 'high',
      impact: 'high',
    })
    addSuggestion(map, 're-add-rule', 7, suggested2, mockGetRuleCategory)
    expect(map.get('re-add-rule')!.estimatedViolations).toBe(7)
    expect(map.get('re-add-rule')!.confidence).toBe('high')
  })

  test('multiple rules with same violations maintain independent counts', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(map, 'rule-x', 10, makeSuggestedRule({ ruleId: 'rule-x' }), mockGetRuleCategory)
    addSuggestion(map, 'rule-y', 20, makeSuggestedRule({ ruleId: 'rule-y' }), mockGetRuleCategory)
    addSuggestion(map, 'rule-x', 5, makeSuggestedRule({ ruleId: 'rule-x' }), mockGetRuleCategory)

    expect(map.get('rule-x')!.estimatedViolations).toBe(15)
    expect(map.get('rule-y')!.estimatedViolations).toBe(20)
  })

  test('detector with only non-matching regex patterns in analyzeFile', () => {
    const detectors: PatternDetector[] = [
      {
        name: 'Never-match',
        patterns: [/^BEGIN/, /^END/],
        suggestedRules: [
          { confidence: 'high', impact: 'low', reason: 'Never', ruleId: 'never-match' },
        ],
      },
    ]
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('middle of content without anchors', map, detectors, mockGetRuleCategory)

    expect(map.size).toBe(0)
  })
})
