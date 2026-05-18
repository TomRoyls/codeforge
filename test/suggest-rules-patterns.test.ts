import { describe, it, expect } from 'vitest'
import {
  findMatches,
  addSuggestion,
  analyzeFile,
  PATTERN_DETECTORS,
} from '../src/commands/suggest-rules-patterns.js'
import type { PatternDetector, RuleSuggestion } from '../src/commands/suggest-rules-patterns.js'

// ─── findMatches ──────────────────────────────────────
describe('findMatches', () => {
  it('counts string pattern occurrences', () => {
    expect(findMatches('hello hello hello', 'hello')).toBe(3)
  })

  it('returns 0 when string pattern not found', () => {
    expect(findMatches('hello world', 'xyz')).toBe(0)
  })

  it('counts regex pattern occurrences', () => {
    expect(findMatches('abc123def456', /\d{3}/)).toBe(2)
  })

  it('returns 0 when regex not found', () => {
    expect(findMatches('hello world', /\d+/)).toBe(0)
  })

  it('handles overlapping string matches', () => {
    expect(findMatches('aaa', 'aa')).toBe(2)
  })

  it('handles empty content', () => {
    expect(findMatches('', 'test')).toBe(0)
    expect(findMatches('', /\d/)).toBe(0)
  })

  it('handles regex without global flag', () => {
    expect(findMatches('abc abc', /abc/)).toBe(2)
  })

  it('handles already global regex', () => {
    const regex = /\d+/g
    expect(findMatches('1 and 2 and 3', regex)).toBe(3)
  })

  it('counts console.log string pattern', () => {
    expect(findMatches('console.log("a"); console.log("b");', 'console.log')).toBe(2)
  })

  it('counts loose equality operators', () => {
    expect(findMatches('a == b', ' == ')).toBe(1)
  })

  it('counts eval pattern', () => {
    expect(findMatches('eval("code")', 'eval(')).toBe(1)
  })
})

// ─── addSuggestion ────────────────────────────────────
describe('addSuggestion', () => {
  it('adds a new suggestion to the map', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(map, 'my-rule', 5, {
      confidence: 'high',
      impact: 'medium',
      reason: 'test',
      ruleId: 'my-rule',
    }, () => 'patterns')

    expect(map.has('my-rule')).toBe(true)
    expect(map.get('my-rule')!.estimatedViolations).toBe(5)
  })

  it('accumulates violations for same ruleId', () => {
    const map = new Map<string, RuleSuggestion>()
    const suggested = {
      confidence: 'high',
      impact: 'medium',
      reason: 'test',
      ruleId: 'my-rule',
    }

    addSuggestion(map, 'my-rule', 3, suggested, () => 'patterns')
    addSuggestion(map, 'my-rule', 7, suggested, () => 'patterns')

    expect(map.get('my-rule')!.estimatedViolations).toBe(10)
  })

  it('stores category from getRuleCategoryFn', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(map, 'no-eval', 1, {
      confidence: 'high',
      impact: 'high',
      reason: 'test',
      ruleId: 'no-eval',
    }, () => 'security')

    expect(map.get('no-eval')!.category).toBe('security')
  })

  it('stores reason from suggested rule', () => {
    const map = new Map<string, RuleSuggestion>()
    addSuggestion(map, 'rule-x', 1, {
      confidence: 'low',
      impact: 'low',
      reason: 'Custom reason text',
      ruleId: 'rule-x',
    }, () => 'patterns')

    expect(map.get('rule-x')!.reason).toBe('Custom reason text')
  })
})

// ─── analyzeFile ──────────────────────────────────────
describe('analyzeFile', () => {
  it('detects console.log patterns', () => {
    const map = new Map<string, RuleSuggestion>()
    const content = 'console.log("a"); console.log("b");'

    analyzeFile(content, map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.has('no-console-log')).toBe(true)
    expect(map.get('no-console-log')!.estimatedViolations).toBe(2)
  })

  it('detects any type usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile(': any', map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.has('no-explicit-any')).toBe(true)
  })

  it('detects var declarations', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('var x = 1; var y = 2;', map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.has('prefer-const')).toBe(true)
    expect(map.get('prefer-const')!.estimatedViolations).toBe(2)
  })

  it('detects eval usage', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('eval("code")', map, PATTERN_DETECTORS, () => 'security')
    expect(map.has('no-eval')).toBe(true)
  })

  it('detects magic numbers', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = 42; const y = 100;', map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.has('no-magic-numbers')).toBe(true)
  })

  it('detects loose equality', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('a == b', map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.has('eq-eq-eq')).toBe(true)
  })

  it('detects null checks', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('x === null; y !== undefined;', map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.has('prefer-nullish-coalescing')).toBe(true)
  })

  it('does not add suggestions for content with no patterns', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('const x = 1;', map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.size).toBe(0)
  })

  it('handles empty content', () => {
    const map = new Map<string, RuleSuggestion>()
    analyzeFile('', map, PATTERN_DETECTORS, () => 'patterns')
    expect(map.size).toBe(0)
  })

  it('works with custom detectors', () => {
    const map = new Map<string, RuleSuggestion>()
    const customDetectors: PatternDetector[] = [
      {
        name: 'Test detector',
        patterns: ['CUSTOM_PATTERN'],
        suggestedRules: [
          {
            confidence: 'high',
            impact: 'high',
            reason: 'Custom pattern found',
            ruleId: 'custom-rule',
          },
        ],
      },
    ]
    analyzeFile('CUSTOM_PATTERN here and CUSTOM_PATTERN there', map, customDetectors, () => 'testing')
    expect(map.has('custom-rule')).toBe(true)
    expect(map.get('custom-rule')!.estimatedViolations).toBe(2)
  })
})

// ─── PATTERN_DETECTORS ────────────────────────────────
describe('PATTERN_DETECTORS', () => {
  it('has at least 10 detectors', () => {
    expect(PATTERN_DETECTORS.length).toBeGreaterThanOrEqual(10)
  })

  it('each detector has required fields', () => {
    for (const detector of PATTERN_DETECTORS) {
      expect(detector.name).toBeTruthy()
      expect(Array.isArray(detector.patterns)).toBe(true)
      expect(Array.isArray(detector.suggestedRules)).toBe(true)
      expect(detector.suggestedRules.length).toBeGreaterThan(0)
    }
  })

  it('each suggested rule has valid confidence and impact', () => {
    const validLevels = ['high', 'medium', 'low']
    for (const detector of PATTERN_DETECTORS) {
      for (const rule of detector.suggestedRules) {
        expect(validLevels).toContain(rule.confidence)
        expect(validLevels).toContain(rule.impact)
        expect(rule.ruleId).toBeTruthy()
        expect(rule.reason).toBeTruthy()
      }
    }
  })

  it('contains console logs detector', () => {
    const consoleDetector = PATTERN_DETECTORS.find((d) => d.name === 'Console logs')
    expect(consoleDetector).toBeDefined()
    expect(consoleDetector!.suggestedRules[0]!.ruleId).toBe('no-console-log')
  })

  it('contains eval usage detector', () => {
    const evalDetector = PATTERN_DETECTORS.find((d) => d.name === 'Eval usage')
    expect(evalDetector).toBeDefined()
    expect(evalDetector!.suggestedRules[0]!.ruleId).toBe('no-eval')
  })
})
