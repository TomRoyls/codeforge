import { describe, it, expect, beforeEach } from 'vitest'
import { SuggestionEngine } from '../../src/core/suggestion-engine/suggestion-engine.js'
import type {
  Suggestion,
  SuggestionCategory,
  SuggestionContext,
  SuggestionRule,
  SuggestionPriority,
  SuggestionConfig,
} from '../../src/core/suggestion-engine/types.js'
import { DEFAULT_SUGGESTION_CONFIG } from '../../src/core/suggestion-engine/types.js'

function makeRule(overrides: Partial<SuggestionRule> = {}): SuggestionRule {
  return {
    id: overrides.id ?? 'test-rule',
    description: overrides.description ?? 'Test rule',
    category: overrides.category ?? 'style',
    priority: overrides.priority ?? 'medium',
    pattern: overrides.pattern,
    contextCondition: overrides.contextCondition,
    suggest: overrides.suggest ?? (() => null),
  }
}

function makeContext(overrides: Partial<SuggestionContext> = {}): SuggestionContext {
  return {
    code: overrides.code ?? 'const x = 1',
    fileName: overrides.fileName,
    language: overrides.language,
    ast: overrides.ast,
    metadata: overrides.metadata,
  }
}

function makeSuggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    id: overrides.id ?? 'sug-1',
    ruleId: overrides.ruleId ?? 'test-rule',
    message: overrides.message ?? 'Test suggestion',
    category: overrides.category ?? 'style',
    priority: overrides.priority ?? 'medium',
    confidence: overrides.confidence ?? 0.8,
    line: overrides.line ?? 1,
    column: overrides.column ?? 1,
    fix: overrides.fix,
  }
}

describe('SuggestionEngine', () => {
  let engine: SuggestionEngine

  beforeEach(() => {
    engine = new SuggestionEngine()
  })

  describe('construction', () => {
    it('should initialize with default config', () => {
      const e = new SuggestionEngine()
      expect(e.getRules()).toHaveLength(0)
    })

    it('should accept custom config', () => {
      const e = new SuggestionEngine({ minConfidence: 0.5, maxSuggestions: 10 })
      expect(e.getRules()).toHaveLength(0)
    })

    it('should initialize with empty rules map', () => {
      expect(engine.getRules()).toEqual([])
    })
  })

  describe('addRule', () => {
    it('should add a rule and return true', () => {
      const rule = makeRule({ id: 'rule-a' })
      expect(engine.addRule(rule)).toBe(true)
      expect(engine.getRules()).toHaveLength(1)
    })

    it('should reject duplicate rule id and return false', () => {
      const rule = makeRule({ id: 'rule-a' })
      engine.addRule(rule)
      expect(engine.addRule(rule)).toBe(false)
      expect(engine.getRules()).toHaveLength(1)
    })

    it('should add multiple rules with different ids', () => {
      engine.addRule(makeRule({ id: 'rule-a' }))
      engine.addRule(makeRule({ id: 'rule-b' }))
      engine.addRule(makeRule({ id: 'rule-c' }))
      expect(engine.getRules()).toHaveLength(3)
    })
  })

  describe('removeRule', () => {
    it('should remove an existing rule and return true', () => {
      engine.addRule(makeRule({ id: 'rule-a' }))
      expect(engine.removeRule('rule-a')).toBe(true)
      expect(engine.getRules()).toHaveLength(0)
    })

    it('should return false for non-existent rule', () => {
      expect(engine.removeRule('non-existent')).toBe(false)
    })

    it('should not affect other rules when removing one', () => {
      engine.addRule(makeRule({ id: 'rule-a' }))
      engine.addRule(makeRule({ id: 'rule-b' }))
      engine.removeRule('rule-a')
      expect(engine.getRules()).toHaveLength(1)
      expect(engine.getRules()[0]!.id).toBe('rule-b')
    })
  })

  describe('getRules', () => {
    it('should return all added rules', () => {
      engine.addRule(makeRule({ id: 'rule-a' }))
      engine.addRule(makeRule({ id: 'rule-b' }))
      const rules = engine.getRules()
      expect(rules).toHaveLength(2)
      expect(rules.map((r) => r.id)).toContain('rule-a')
      expect(rules.map((r) => r.id)).toContain('rule-b')
    })

    it('should return a copy not the internal map', () => {
      engine.addRule(makeRule({ id: 'rule-a' }))
      const rules = engine.getRules()
      rules.splice(0, 1)
      expect(engine.getRules()).toHaveLength(1)
    })
  })

  describe('analyze', () => {
    it('should return empty result with no rules', () => {
      const ctx = makeContext()
      const result = engine.analyze(ctx)
      expect(result.suggestions).toHaveLength(0)
      expect(result.totalMatches).toBe(0)
      expect(result.averageConfidence).toBe(0)
    })

    it('should match a rule with a pattern', () => {
      engine.addRule(makeRule({
        id: 'no-var',
        pattern: /\bvar\b/,
        suggest: (match) => {
          const idx = match?.index ?? 0
          return makeSuggestion({
            message: 'Use let or const instead of var',
            line: 1,
            column: idx + 1,
            confidence: 0.9,
          })
        },
      }))
      const result = engine.analyze(makeContext({ code: 'var x = 1' }))
      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0]!.message).toBe('Use let or const instead of var')
    })

    it('should not match when pattern does not match', () => {
      engine.addRule(makeRule({
        id: 'no-var',
        pattern: /\bvar\b/,
        suggest: (match) => {
          const idx = match?.index ?? 0
          return makeSuggestion({ message: 'found var', column: idx + 1 })
        },
      }))
      const result = engine.analyze(makeContext({ code: 'const x = 1' }))
      expect(result.suggestions).toHaveLength(0)
    })

    it('should skip rule when suggest returns null', () => {
      engine.addRule(makeRule({
        id: 'skip-rule',
        suggest: () => null,
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions).toHaveLength(0)
    })

    it('should handle suggest returning an array', () => {
      engine.addRule(makeRule({
        id: 'multi-rule',
        suggest: () => [
          makeSuggestion({ id: 's1', message: 'First' }),
          makeSuggestion({ id: 's2', message: 'Second' }),
        ],
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions).toHaveLength(2)
    })

    it('should sort suggestions by confidence descending', () => {
      engine.addRule(makeRule({
        id: 'rule-a',
        suggest: () => makeSuggestion({ id: 's1', confidence: 0.5, message: 'low' }),
      }))
      engine.addRule(makeRule({
        id: 'rule-b',
        suggest: () => makeSuggestion({ id: 's2', confidence: 0.95, message: 'high' }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions[0]!.message).toBe('high')
      expect(result.suggestions[1]!.message).toBe('low')
    })

    it('should compute averageConfidence correctly', () => {
      engine.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion({ confidence: 0.6 }),
      }))
      engine.addRule(makeRule({
        id: 'r2',
        suggest: () => makeSuggestion({ confidence: 0.8 }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.averageConfidence).toBeCloseTo(0.7)
    })

    it('should populate byCategory counts', () => {
      engine.addRule(makeRule({
        id: 'r1',
        category: 'security',
        suggest: () => makeSuggestion({ category: 'security' }),
      }))
      engine.addRule(makeRule({
        id: 'r2',
        category: 'performance',
        suggest: () => makeSuggestion({ category: 'performance' }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.byCategory.security).toBe(1)
      expect(result.byCategory.performance).toBe(1)
      expect(result.byCategory.style).toBe(0)
    })

    it('should populate byPriority counts', () => {
      engine.addRule(makeRule({
        id: 'r1',
        priority: 'critical',
        suggest: () => makeSuggestion({ priority: 'critical' }),
      }))
      engine.addRule(makeRule({
        id: 'r2',
        priority: 'low',
        suggest: () => makeSuggestion({ priority: 'low' }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.byPriority.critical).toBe(1)
      expect(result.byPriority.low).toBe(1)
      expect(result.byPriority.high).toBe(0)
    })
  })

  describe('contextCondition', () => {
    it('should skip rule when contextCondition returns false', () => {
      engine.addRule(makeRule({
        id: 'ts-only',
        contextCondition: (ctx) => ctx.language === 'typescript',
        suggest: () => makeSuggestion({ message: 'TS suggestion' }),
      }))
      const result = engine.analyze(makeContext({ language: 'javascript' }))
      expect(result.suggestions).toHaveLength(0)
    })

    it('should run rule when contextCondition returns true', () => {
      engine.addRule(makeRule({
        id: 'ts-only',
        contextCondition: (ctx) => ctx.language === 'typescript',
        suggest: () => makeSuggestion({ message: 'TS suggestion' }),
      }))
      const result = engine.analyze(makeContext({ language: 'typescript' }))
      expect(result.suggestions).toHaveLength(1)
    })

    it('should use fileName in contextCondition', () => {
      engine.addRule(makeRule({
        id: 'test-files',
        contextCondition: (ctx) => (ctx.fileName?.endsWith('.test.ts') ?? false),
        suggest: () => makeSuggestion({ message: 'Test file suggestion' }),
      }))
      const result = engine.analyze(makeContext({ fileName: 'app.test.ts' }))
      expect(result.suggestions).toHaveLength(1)
    })

    it('should use metadata in contextCondition', () => {
      engine.addRule(makeRule({
        id: 'meta-rule',
        contextCondition: (ctx) => (ctx.metadata?.framework ?? '') === 'react',
        suggest: () => makeSuggestion({ message: 'React suggestion' }),
      }))
      const result = engine.analyze(makeContext({ metadata: { framework: 'react' } }))
      expect(result.suggestions).toHaveLength(1)
    })

    it('should handle undefined contextCondition (no filter)', () => {
      engine.addRule(makeRule({
        id: 'no-condition',
        suggest: () => makeSuggestion(),
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
    })
  })

  describe('filterByCategory', () => {
    it('should filter suggestions by category', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ id: 's1', category: 'security' }),
        makeSuggestion({ id: 's2', category: 'performance' }),
        makeSuggestion({ id: 's3', category: 'security' }),
      ]
      const filtered = engine.filterByCategory(suggestions, 'security')
      expect(filtered).toHaveLength(2)
      expect(filtered.every((s) => s.category === 'security')).toBe(true)
    })

    it('should return empty array when no suggestions match category', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ category: 'security' }),
      ]
      const filtered = engine.filterByCategory(suggestions, 'style')
      expect(filtered).toHaveLength(0)
    })

    it('should return all for matching category', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ category: 'refactor' }),
        makeSuggestion({ category: 'refactor' }),
      ]
      const filtered = engine.filterByCategory(suggestions, 'refactor')
      expect(filtered).toHaveLength(2)
    })
  })

  describe('filterByPriority', () => {
    it('should filter suggestions by priority', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ id: 's1', priority: 'critical' }),
        makeSuggestion({ id: 's2', priority: 'low' }),
        makeSuggestion({ id: 's3', priority: 'critical' }),
      ]
      const filtered = engine.filterByPriority(suggestions, 'critical')
      expect(filtered).toHaveLength(2)
    })

    it('should return empty array when no suggestions match priority', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ priority: 'low' }),
      ]
      const filtered = engine.filterByPriority(suggestions, 'critical')
      expect(filtered).toHaveLength(0)
    })

    it('should filter by medium priority', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ priority: 'medium' }),
        makeSuggestion({ priority: 'high' }),
        makeSuggestion({ priority: 'medium' }),
      ]
      const filtered = engine.filterByPriority(suggestions, 'medium')
      expect(filtered).toHaveLength(2)
    })
  })

  describe('getByConfidence', () => {
    it('should filter suggestions by minimum confidence', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ id: 's1', confidence: 0.9 }),
        makeSuggestion({ id: 's2', confidence: 0.3 }),
        makeSuggestion({ id: 's3', confidence: 0.7 }),
      ]
      const filtered = engine.getByConfidence(suggestions, 0.5)
      expect(filtered).toHaveLength(2)
    })

    it('should return empty when all below threshold', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ confidence: 0.1 }),
        makeSuggestion({ confidence: 0.2 }),
      ]
      const filtered = engine.getByConfidence(suggestions, 0.5)
      expect(filtered).toHaveLength(0)
    })

    it('should include exact confidence match', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ confidence: 0.5 }),
      ]
      const filtered = engine.getByConfidence(suggestions, 0.5)
      expect(filtered).toHaveLength(1)
    })

    it('should return all when threshold is 0', () => {
      const suggestions: Suggestion[] = [
        makeSuggestion({ confidence: 0.01 }),
        makeSuggestion({ confidence: 0.99 }),
      ]
      const filtered = engine.getByConfidence(suggestions, 0)
      expect(filtered).toHaveLength(2)
    })
  })

  describe('getStatistics', () => {
    it('should return statistics from a result', () => {
      engine.addRule(makeRule({
        id: 'r1',
        category: 'security',
        priority: 'high',
        suggest: () => makeSuggestion({ confidence: 0.9 }),
      }))
      const result = engine.analyze(makeContext())
      const stats = engine.getStatistics(result)
      expect(stats.total).toBe(1)
      expect(stats.averageConfidence).toBeCloseTo(0.9)
    })

    it('should compute topCategories sorted by count', () => {
      engine.addRule(makeRule({
        id: 'r1',
        category: 'security',
        suggest: () => makeSuggestion({ category: 'security' }),
      }))
      engine.addRule(makeRule({
        id: 'r2',
        category: 'performance',
        suggest: () => makeSuggestion({ category: 'performance' }),
      }))
      engine.addRule(makeRule({
        id: 'r3',
        category: 'security',
        suggest: () => makeSuggestion({ category: 'security' }),
      }))
      const result = engine.analyze(makeContext())
      const stats = engine.getStatistics(result)
      expect(stats.topCategories[0]).toBe('security')
      expect(stats.topCategories[1]).toBe('performance')
    })

    it('should compute topPriorities sorted by count', () => {
      engine.addRule(makeRule({
        id: 'r1',
        priority: 'low',
        suggest: () => makeSuggestion({ priority: 'low' }),
      }))
      engine.addRule(makeRule({
        id: 'r2',
        priority: 'critical',
        suggest: () => makeSuggestion({ priority: 'critical' }),
      }))
      engine.addRule(makeRule({
        id: 'r3',
        priority: 'critical',
        suggest: () => makeSuggestion({ priority: 'critical' }),
      }))
      const result = engine.analyze(makeContext())
      const stats = engine.getStatistics(result)
      expect(stats.topPriorities[0]).toBe('critical')
    })

    it('should return byCategory and byPriority records', () => {
      engine.addRule(makeRule({
        id: 'r1',
        category: 'style',
        priority: 'medium',
        suggest: () => makeSuggestion({ category: 'style', priority: 'medium' }),
      }))
      const result = engine.analyze(makeContext())
      const stats = engine.getStatistics(result)
      expect(stats.byCategory.style).toBe(1)
      expect(stats.byPriority.medium).toBe(1)
    })

    it('should handle empty result statistics', () => {
      const result = engine.analyze(makeContext())
      const stats = engine.getStatistics(result)
      expect(stats.total).toBe(0)
      expect(stats.averageConfidence).toBe(0)
    })
  })

  describe('config: minConfidence', () => {
    it('should filter suggestions below minConfidence', () => {
      const e = new SuggestionEngine({ minConfidence: 0.7 })
      e.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion({ confidence: 0.5 }),
      }))
      e.addRule(makeRule({
        id: 'r2',
        suggest: () => makeSuggestion({ confidence: 0.9 }),
      }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0]!.confidence).toBe(0.9)
    })

    it('should include all when minConfidence is 0', () => {
      const e = new SuggestionEngine({ minConfidence: 0 })
      e.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion({ confidence: 0.01 }),
      }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
    })
  })

  describe('config: maxSuggestions', () => {
    it('should limit suggestions to maxSuggestions', () => {
      const e = new SuggestionEngine({ maxSuggestions: 2 })
      e.addRule(makeRule({ id: 'r1', suggest: () => makeSuggestion({ confidence: 0.9 }) }))
      e.addRule(makeRule({ id: 'r2', suggest: () => makeSuggestion({ confidence: 0.8 }) }))
      e.addRule(makeRule({ id: 'r3', suggest: () => makeSuggestion({ confidence: 0.7 }) }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(2)
    })

    it('should return all when maxSuggestions is -1', () => {
      const e = new SuggestionEngine({ maxSuggestions: -1 })
      e.addRule(makeRule({ id: 'r1', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r2', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r3', suggest: () => makeSuggestion() }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(3)
    })
  })

  describe('config: enabledCategories', () => {
    it('should only run rules in enabled categories', () => {
      const e = new SuggestionEngine({ enabledCategories: ['security'] })
      e.addRule(makeRule({ id: 'r1', category: 'security', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r2', category: 'style', suggest: () => makeSuggestion() }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
    })

    it('should run all when all categories are enabled', () => {
      const e = new SuggestionEngine({
        enabledCategories: ['performance', 'security', 'style', 'refactor', 'error-prone', 'best-practice'],
      })
      e.addRule(makeRule({ id: 'r1', category: 'security', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r2', category: 'style', suggest: () => makeSuggestion() }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(2)
    })
  })

  describe('config: enabledPriorities', () => {
    it('should only run rules in enabled priorities', () => {
      const e = new SuggestionEngine({ enabledPriorities: ['critical', 'high'] })
      e.addRule(makeRule({ id: 'r1', priority: 'critical', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r2', priority: 'low', suggest: () => makeSuggestion() }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
    })

    it('should run all when all priorities are enabled', () => {
      const e = new SuggestionEngine({
        enabledPriorities: ['low', 'medium', 'high', 'critical'],
      })
      e.addRule(makeRule({ id: 'r1', priority: 'low', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r2', priority: 'critical', suggest: () => makeSuggestion() }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(2)
    })
  })

  describe('config: includeFixes', () => {
    it('should include fix when includeFixes is true', () => {
      const e = new SuggestionEngine({ includeFixes: true })
      e.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion({ fix: 'Replace with const' }),
      }))
      const result = e.analyze(makeContext())
      expect(result.suggestions[0]!.fix).toBe('Replace with const')
    })

    it('should remove fix when includeFixes is false', () => {
      const e = new SuggestionEngine({ includeFixes: false })
      e.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion({ fix: 'Replace with const' }),
      }))
      const result = e.analyze(makeContext())
      expect(result.suggestions[0]!.fix).toBeUndefined()
    })
  })

  describe('multiple rules matching', () => {
    it('should collect suggestions from all matching rules', () => {
      engine.addRule(makeRule({
        id: 'r1',
        pattern: /\bvar\b/,
        suggest: () => makeSuggestion({ message: 'no-var' }),
      }))
      engine.addRule(makeRule({
        id: 'r2',
        pattern: /=/,
        suggest: () => makeSuggestion({ message: 'has-assign' }),
      }))
      const result = engine.analyze(makeContext({ code: 'var x = 1' }))
      expect(result.suggestions).toHaveLength(2)
    })

    it('should handle rules with no pattern (always match)', () => {
      engine.addRule(makeRule({
        id: 'always',
        suggest: () => makeSuggestion({ message: 'always fires' }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
    })

    it('should handle mixed pattern and no-pattern rules', () => {
      engine.addRule(makeRule({
        id: 'pattern-rule',
        pattern: /\bvar\b/,
        suggest: () => makeSuggestion({ message: 'pattern' }),
      }))
      engine.addRule(makeRule({
        id: 'no-pattern-rule',
        suggest: () => makeSuggestion({ message: 'no pattern' }),
      }))
      const result = engine.analyze(makeContext({ code: 'var x = 1' }))
      expect(result.suggestions).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty code string', () => {
      engine.addRule(makeRule({
        id: 'r1',
        pattern: /\bvar\b/,
        suggest: () => makeSuggestion(),
      }))
      const result = engine.analyze(makeContext({ code: '' }))
      expect(result.suggestions).toHaveLength(0)
    })

    it('should handle context with all optional fields undefined', () => {
      engine.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion(),
      }))
      const result = engine.analyze({ code: 'x' })
      expect(result.suggestions).toHaveLength(1)
    })

    it('should handle suggest returning null for pattern match', () => {
      engine.addRule(makeRule({
        id: 'r1',
        pattern: /\bvar\b/,
        suggest: () => null,
      }))
      const result = engine.analyze(makeContext({ code: 'var x = 1' }))
      expect(result.suggestions).toHaveLength(0)
    })

    it('should handle suggest returning empty array', () => {
      engine.addRule(makeRule({
        id: 'r1',
        suggest: () => [],
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions).toHaveLength(0)
    })

    it('should handle rule with contextCondition returning false and no pattern', () => {
      engine.addRule(makeRule({
        id: 'r1',
        contextCondition: () => false,
        suggest: () => makeSuggestion(),
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions).toHaveLength(0)
    })
  })

  describe('clear', () => {
    it('should remove all rules', () => {
      engine.addRule(makeRule({ id: 'r1' }))
      engine.addRule(makeRule({ id: 'r2' }))
      engine.clear()
      expect(engine.getRules()).toHaveLength(0)
    })

    it('should reset to clean state', () => {
      engine.addRule(makeRule({ id: 'r1' }))
      engine.clear()
      const result = engine.analyze(makeContext())
      expect(result.suggestions).toHaveLength(0)
      expect(result.totalMatches).toBe(0)
    })

    it('should allow adding rules after clear', () => {
      engine.addRule(makeRule({ id: 'r1' }))
      engine.clear()
      engine.addRule(makeRule({ id: 'r2' }))
      expect(engine.getRules()).toHaveLength(1)
      expect(engine.getRules()[0]!.id).toBe('r2')
    })
  })

  describe('getSuggestions', () => {
    it('should return only the suggestions array', () => {
      engine.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion({ message: 'test' }),
      }))
      const suggestions = engine.getSuggestions(makeContext())
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0]!.message).toBe('test')
    })

    it('should return empty array for no rules', () => {
      const suggestions = engine.getSuggestions(makeContext())
      expect(suggestions).toEqual([])
    })
  })

  describe('DEFAULT_SUGGESTION_CONFIG', () => {
    it('should have minConfidence of 0', () => {
      expect(DEFAULT_SUGGESTION_CONFIG.minConfidence).toBe(0)
    })

    it('should have maxSuggestions of -1', () => {
      expect(DEFAULT_SUGGESTION_CONFIG.maxSuggestions).toBe(-1)
    })

    it('should have all categories enabled', () => {
      expect(DEFAULT_SUGGESTION_CONFIG.enabledCategories).toHaveLength(6)
    })

    it('should have all priorities enabled', () => {
      expect(DEFAULT_SUGGESTION_CONFIG.enabledPriorities).toHaveLength(4)
    })

    it('should have includeFixes true', () => {
      expect(DEFAULT_SUGGESTION_CONFIG.includeFixes).toBe(true)
    })
  })

  describe('suggestion enrichment', () => {
    it('should set ruleId from the rule', () => {
      engine.addRule(makeRule({
        id: 'my-rule',
        suggest: () => makeSuggestion({ ruleId: '' }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions[0]!.ruleId).toBe('my-rule')
    })

    it('should generate id when not provided', () => {
      engine.addRule(makeRule({
        id: 'r1',
        suggest: () => ({
          ruleId: 'r1',
          message: 'auto-id',
          category: 'style' as SuggestionCategory,
          priority: 'medium' as SuggestionPriority,
          confidence: 0.8,
          line: 1,
          column: 1,
        }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions[0]!.id).toBeTruthy()
    })

    it('should preserve existing id if provided', () => {
      engine.addRule(makeRule({
        id: 'r1',
        suggest: () => makeSuggestion({ id: 'custom-id' }),
      }))
      const result = engine.analyze(makeContext())
      expect(result.suggestions[0]!.id).toBe('custom-id')
    })
  })

  describe('conflicting rules', () => {
    it('should handle two rules with same pattern producing different suggestions', () => {
      engine.addRule(makeRule({
        id: 'rule-a',
        category: 'security',
        pattern: /\beval\b/,
        suggest: () => makeSuggestion({ message: 'eval is dangerous', category: 'security' }),
      }))
      engine.addRule(makeRule({
        id: 'rule-b',
        category: 'performance',
        pattern: /\beval\b/,
        suggest: () => makeSuggestion({ message: 'eval is slow', category: 'performance' }),
      }))
      const result = engine.analyze(makeContext({ code: 'eval("code")' }))
      expect(result.suggestions).toHaveLength(2)
    })

    it('should handle category filter excluding one conflicting rule', () => {
      const e = new SuggestionEngine({ enabledCategories: ['security'] })
      e.addRule(makeRule({
        id: 'rule-a',
        category: 'security',
        pattern: /\beval\b/,
        suggest: () => makeSuggestion({ message: 'security issue', category: 'security' }),
      }))
      e.addRule(makeRule({
        id: 'rule-b',
        category: 'performance',
        pattern: /\beval\b/,
        suggest: () => makeSuggestion({ message: 'perf issue', category: 'performance' }),
      }))
      const result = e.analyze(makeContext({ code: 'eval("code")' }))
      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0]!.category).toBe('security')
    })
  })

  describe('pattern-based rule matching', () => {
    it('should pass the match result to suggest', () => {
      let capturedMatch: RegExpMatchArray | null = null
      engine.addRule(makeRule({
        id: 'capture-rule',
        pattern: /(\w+)\s*=\s*(\w+)/,
        suggest: (match) => {
          capturedMatch = match
          return makeSuggestion({ message: 'assignment' })
        },
      }))
      engine.analyze(makeContext({ code: 'x = 1' }))
      expect(capturedMatch).not.toBeNull()
      expect(capturedMatch![0]).toBe('x = 1')
    })

    it('should not call suggest when pattern does not match', () => {
      let called = false
      engine.addRule(makeRule({
        id: 'not-called',
        pattern: /\bnonexistentpattern123\b/,
        suggest: () => {
          called = true
          return null
        },
      }))
      engine.analyze(makeContext({ code: 'const x = 1' }))
      expect(called).toBe(false)
    })

    it('should handle global-style regex (first match only)', () => {
      engine.addRule(makeRule({
        id: 'first-match',
        pattern: /\bvar\b/,
        suggest: (match) => makeSuggestion({
          message: `Found var at ${match?.index ?? 0}`,
          column: (match?.index ?? 0) + 1,
        }),
      }))
      const result = engine.analyze(makeContext({ code: 'var x = 1; var y = 2;' }))
      expect(result.suggestions).toHaveLength(1)
    })
  })

  describe('all suggestion categories', () => {
    const categories: SuggestionCategory[] = ['performance', 'security', 'style', 'refactor', 'error-prone', 'best-practice']

    for (const cat of categories) {
      it(`should handle category: ${cat}`, () => {
        engine.addRule(makeRule({
          id: `rule-${cat}`,
          category: cat,
          suggest: () => makeSuggestion({ category: cat }),
        }))
        const result = engine.analyze(makeContext())
        expect(result.suggestions).toHaveLength(1)
        expect(result.suggestions[0]!.category).toBe(cat)
        expect(result.byCategory[cat]).toBe(1)
      })
    }
  })

  describe('all priority levels', () => {
    const priorities: SuggestionPriority[] = ['low', 'medium', 'high', 'critical']

    for (const pri of priorities) {
      it(`should handle priority: ${pri}`, () => {
        engine.addRule(makeRule({
          id: `rule-${pri}`,
          priority: pri,
          suggest: () => makeSuggestion({ priority: pri }),
        }))
        const result = engine.analyze(makeContext())
        expect(result.suggestions).toHaveLength(1)
        expect(result.suggestions[0]!.priority).toBe(pri)
        expect(result.byPriority[pri]).toBe(1)
      })
    }
  })

  describe('combined config filtering', () => {
    it('should apply both category and priority filters together', () => {
      const e = new SuggestionEngine({
        enabledCategories: ['security'],
        enabledPriorities: ['critical'],
      })
      e.addRule(makeRule({ id: 'r1', category: 'security', priority: 'critical', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r2', category: 'security', priority: 'low', suggest: () => makeSuggestion() }))
      e.addRule(makeRule({ id: 'r3', category: 'style', priority: 'critical', suggest: () => makeSuggestion() }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
    })

    it('should apply minConfidence with category filter', () => {
      const e = new SuggestionEngine({
        minConfidence: 0.5,
        enabledCategories: ['security'],
      })
      e.addRule(makeRule({
        id: 'r1',
        category: 'security',
        suggest: () => makeSuggestion({ confidence: 0.3 }),
      }))
      e.addRule(makeRule({
        id: 'r2',
        category: 'security',
        suggest: () => makeSuggestion({ confidence: 0.8 }),
      }))
      const result = e.analyze(makeContext())
      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0]!.confidence).toBe(0.8)
    })
  })

  describe('re-export types', () => {
    it('should re-export DEFAULT_SUGGESTION_CONFIG from main module', async () => {
      const mod = await import('../../src/core/suggestion-engine/suggestion-engine.js')
      expect(mod.DEFAULT_SUGGESTION_CONFIG).toBeDefined()
      expect(mod.DEFAULT_SUGGESTION_CONFIG.minConfidence).toBe(0)
    })
  })

  describe('complex scenarios', () => {
    it('should handle a realistic multi-rule analysis', () => {
      engine.addRule(makeRule({
        id: 'no-eval',
        category: 'security',
        priority: 'critical',
        pattern: /\beval\b/,
        suggest: (match) => makeSuggestion({
          message: 'Avoid eval() - security risk',
          category: 'security',
          priority: 'critical',
          confidence: 0.95,
          column: (match?.index ?? 0) + 1,
          fix: 'Use JSON.parse() or a dedicated parser',
        }),
      }))
      engine.addRule(makeRule({
        id: 'prefer-const',
        category: 'best-practice',
        priority: 'medium',
        pattern: /\blet\s+\w+\s*=\s*[^=]/,
        suggest: (match) => makeSuggestion({
          message: 'Use const for variables that are not reassigned',
          category: 'best-practice',
          priority: 'medium',
          confidence: 0.7,
          column: (match?.index ?? 0) + 1,
        }),
      }))
      engine.addRule(makeRule({
        id: 'no-var',
        category: 'style',
        priority: 'high',
        pattern: /\bvar\b/,
        suggest: (match) => makeSuggestion({
          message: 'Use let or const instead of var',
          category: 'style',
          priority: 'high',
          confidence: 0.85,
          column: (match?.index ?? 0) + 1,
          fix: 'Replace var with const or let',
        }),
      }))

      const result = engine.analyze(makeContext({ code: 'var x = eval("1"); let y = 2;' }))
      expect(result.suggestions).toHaveLength(3)
      expect(result.totalMatches).toBe(3)
      expect(result.byCategory.security).toBe(1)
      expect(result.byCategory.style).toBe(1)
      expect(result.byCategory['best-practice']).toBe(1)
      expect(result.suggestions[0]!.category).toBe('security')
    })

    it('should handle context-aware rule that uses metadata', () => {
      engine.addRule(makeRule({
        id: 'react-hooks',
        category: 'error-prone',
        priority: 'high',
        contextCondition: (ctx) => (ctx.metadata?.isReact ?? false) === true,
        pattern: /useEffect\(/,
        suggest: () => makeSuggestion({
          message: 'Check useEffect dependencies',
          category: 'error-prone',
          priority: 'high',
          confidence: 0.6,
        }),
      }))

      const noReact = engine.analyze(makeContext({ code: 'useEffect()', metadata: {} }))
      expect(noReact.suggestions).toHaveLength(0)

      const withReact = engine.analyze(makeContext({ code: 'useEffect()', metadata: { isReact: true } }))
      expect(withReact.suggestions).toHaveLength(1)
    })
  })
})
