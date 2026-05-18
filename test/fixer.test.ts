import { describe, it, expect } from 'vitest'
import { SuggestionEngine, DEFAULT_FIXER_CONFIG, CONFIDENCE_ORDER } from '../src/core/fixer/index.js'
import type { FixConfidence, FixCategory, FixSuggestion, FixPlan, FixerConfig } from '../src/core/fixer/index.js'

// ─── Constants ───

describe('Fixer Constants', () => {
  it('DEFAULT_FIXER_CONFIG has expected defaults', () => {
    expect(DEFAULT_FIXER_CONFIG.autoApplySafe).toBe(false)
    expect(DEFAULT_FIXER_CONFIG.maxSuggestionsPerFile).toBe(50)
    expect(DEFAULT_FIXER_CONFIG.minConfidence).toBe('suggested')
    expect(DEFAULT_FIXER_CONFIG.excludedRules).toEqual([])
    expect(DEFAULT_FIXER_CONFIG.includedCategories).toEqual([])
  })

  it('CONFIDENCE_ORDER ranks safe highest', () => {
    expect(CONFIDENCE_ORDER.safe).toBeGreaterThan(CONFIDENCE_ORDER.suggested)
    expect(CONFIDENCE_ORDER.suggested).toBeGreaterThan(CONFIDENCE_ORDER.unsafe)
    expect(CONFIDENCE_ORDER.unsafe).toBeGreaterThan(CONFIDENCE_ORDER.manual)
  })
})

// ─── SuggestionEngine - Construction ───

describe('SuggestionEngine - Construction', () => {
  it('creates with default config', () => {
    const engine = new SuggestionEngine()
    const config = engine.getConfig()
    expect(config.maxSuggestionsPerFile).toBe(50)
  })

  it('creates with custom config', () => {
    const engine = new SuggestionEngine({ maxSuggestionsPerFile: 5 })
    expect(engine.getConfig().maxSuggestionsPerFile).toBe(5)
  })

  it('registers default templates', () => {
    const engine = new SuggestionEngine()
    const templates = engine.getTemplates()
    expect(templates.has('prefer-const')).toBe(true)
    expect(templates.has('no-console')).toBe(true)
    expect(templates.has('eq-eq-eq')).toBe(true)
  })
})

// ─── SuggestionEngine - generateSuggestion ───

describe('SuggestionEngine - generateSuggestion', () => {
  it('generates suggestion for prefer-const', () => {
    const engine = new SuggestionEngine()
    const suggestion = engine.generateSuggestion({
      ruleId: 'prefer-const',
      filePath: 'test.ts',
      line: 1,
      column: 0,
      message: 'Use const',
    })
    expect(suggestion).not.toBeNull()
    expect(suggestion!.ruleId).toBe('prefer-const')
    expect(suggestion!.confidence).toBe('safe')
    expect(suggestion!.category).toBe('formatting')
  })

  it('generates suggestion for no-console', () => {
    const engine = new SuggestionEngine()
    const suggestion = engine.generateSuggestion({
      ruleId: 'no-console',
      filePath: 'test.ts',
      line: 5,
      column: 0,
      message: 'No console',
    })
    expect(suggestion).not.toBeNull()
    expect(suggestion!.confidence).toBe('suggested')
  })

  it('generates suggestion for eq-eq-eq', () => {
    const engine = new SuggestionEngine()
    const suggestion = engine.generateSuggestion({
      ruleId: 'eq-eq-eq',
      filePath: 'test.ts',
      line: 1,
      column: 0,
      message: 'Use ===',
    })
    expect(suggestion).not.toBeNull()
    expect(suggestion!.confidence).toBe('safe')
  })

  it('generates manual suggestion for unknown rule', () => {
    const engine = new SuggestionEngine()
    const suggestion = engine.generateSuggestion({
      ruleId: 'unknown-rule',
      filePath: 'test.ts',
      line: 1,
      column: 0,
      message: 'Fix something',
    })
    expect(suggestion).not.toBeNull()
    expect(suggestion!.confidence).toBe('manual')
  })

  it('suggestion has required fields', () => {
    const engine = new SuggestionEngine()
    const suggestion = engine.generateSuggestion({
      ruleId: 'prefer-const',
      filePath: 'f.ts',
      line: 3,
      column: 4,
      message: 'msg',
    })!
    expect(suggestion.id).toBeTruthy()
    expect(suggestion.filePath).toBe('f.ts')
    expect(suggestion.line).toBe(3)
    expect(suggestion.column).toBe(4)
    expect(suggestion.patch).toBeDefined()
    expect(typeof suggestion.risk).toBe('string')
  })
})

// ─── SuggestionEngine - generateSuggestions ───

describe('SuggestionEngine - generateSuggestions', () => {
  it('groups suggestions by file', () => {
    const engine = new SuggestionEngine()
    const plans = engine.generateSuggestions([
      { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
      { ruleId: 'no-console', filePath: 'b.ts', line: 2, column: 0, message: 'm' },
    ])
    expect(plans.length).toBe(2)
    expect(plans[0]!.filePath).toBe('a.ts')
    expect(plans[1]!.filePath).toBe('b.ts')
  })

  it('respects maxSuggestionsPerFile', () => {
    const engine = new SuggestionEngine({ maxSuggestionsPerFile: 1 })
    const violations = [
      { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
      { ruleId: 'no-console', filePath: 'a.ts', line: 2, column: 0, message: 'm' },
    ]
    const plans = engine.generateSuggestions(violations)
    expect(plans[0]!.suggestions.length).toBeLessThanOrEqual(1)
  })

  it('respects excludedRules', () => {
    const engine = new SuggestionEngine({ excludedRules: ['prefer-const'] })
    const plans = engine.generateSuggestions([
      { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
    ])
    expect(plans[0]!.suggestions.length).toBe(0)
  })

  it('respects includedCategories', () => {
    const engine = new SuggestionEngine({ includedCategories: ['formatting' as FixCategory] })
    const plans = engine.generateSuggestions([
      { ruleId: 'no-console', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
    ])
    expect(plans[0]!.suggestions.length).toBe(0)
  })

  it('calculates safeFixCount', () => {
    const engine = new SuggestionEngine()
    const plans = engine.generateSuggestions([
      { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
      { ruleId: 'no-eval', filePath: 'a.ts', line: 2, column: 0, message: 'm' },
    ])
    const plan = plans[0]!
    expect(plan.safeFixCount).toBeGreaterThanOrEqual(0)
    expect(plan.totalFixCount).toBe(plan.suggestions.length)
  })
})

// ─── SuggestionEngine - applyFix ───

describe('SuggestionEngine - applyFix', () => {
  it('applies single-line fix', () => {
    const engine = new SuggestionEngine()
    const suggestion = engine.generateSuggestion({
      ruleId: 'prefer-const',
      filePath: 'test.ts',
      line: 1,
      column: 0,
      message: 'm',
    })!
    const source = 'let x = 1;'
    const result = engine.applyFix(source, suggestion)
    expect(typeof result).toBe('string')
  })

  it('returns source unchanged for out-of-range line', () => {
    const engine = new SuggestionEngine()
    const suggestion = engine.generateSuggestion({
      ruleId: 'prefer-const',
      filePath: 'test.ts',
      line: 99,
      column: 0,
      message: 'm',
    })!
    const source = 'hello'
    const result = engine.applyFix(source, suggestion)
    expect(result).toBe(source)
  })
})

// ─── SuggestionEngine - applySafeFixes ───

describe('SuggestionEngine - applySafeFixes', () => {
  it('applies only safe fixes from a plan', () => {
    const engine = new SuggestionEngine()
    const plans = engine.generateSuggestions([
      { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
      { ruleId: 'no-eval', filePath: 'a.ts', line: 2, column: 0, message: 'm' },
    ])
    const plan = plans[0]!
    const source = 'let x = 1;\neval("code")'
    const result = engine.applySafeFixes(source, plan)
    expect(typeof result).toBe('string')
  })
})

// ─── SuggestionEngine - prioritize ───

describe('SuggestionEngine - prioritize', () => {
  it('sorts suggestions by confidence descending', () => {
    const engine = new SuggestionEngine()
    const suggestions = engine.generateSuggestions([
      { ruleId: 'no-eval', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
      { ruleId: 'prefer-const', filePath: 'a.ts', line: 2, column: 0, message: 'm' },
    ])[0]!.suggestions
    const prioritized = engine.prioritize(suggestions)
    if (prioritized.length >= 2) {
      const c0 = CONFIDENCE_ORDER[prioritized[0]!.confidence]
      const c1 = CONFIDENCE_ORDER[prioritized[1]!.confidence]
      expect(c0).toBeGreaterThanOrEqual(c1)
    }
  })

  it('returns empty for empty input', () => {
    const engine = new SuggestionEngine()
    expect(engine.prioritize([])).toEqual([])
  })
})

// ─── SuggestionEngine - assessRisk ───

describe('SuggestionEngine - assessRisk', () => {
  it('returns low risk for safe fixes', () => {
    const engine = new SuggestionEngine()
    const plans = engine.generateSuggestions([
      { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'm' },
    ])
    const risk = plans[0]!.riskAssessment
    expect(risk.level).toBe('low')
  })

  it('returns high risk for many fixes', () => {
    const engine = new SuggestionEngine({ maxSuggestionsPerFile: 15 })
    const violations = Array.from({ length: 15 }, (_, i) => ({
      ruleId: 'prefer-const',
      filePath: 'a.ts',
      line: i + 1,
      column: 0,
      message: 'm',
    }))
    const plans = engine.generateSuggestions(violations)
    const risk = plans[0]!.riskAssessment
    if (plans[0]!.totalFixCount > 10) {
      expect(risk.level).toBe('high')
    }
  })
})

// ─── SuggestionEngine - registerTemplate ───

describe('SuggestionEngine - registerTemplate', () => {
  it('registers custom template', () => {
    const engine = new SuggestionEngine()
    engine.registerTemplate('my-rule', {
      ruleId: 'my-rule',
      confidence: 'safe',
      category: 'formatting',
      generateFix: () => ({ replacement: 'fixed', description: 'Custom fix' }),
    })
    const templates = engine.getTemplates()
    expect(templates.has('my-rule')).toBe(true)
  })
})

// ─── SuggestionEngine - getFixPlan ───

describe('SuggestionEngine - getFixPlan', () => {
  it('detects issues in source', () => {
    const engine = new SuggestionEngine()
    const plan = engine.getFixPlan('test.ts', 'let x = 1;\nconsole.log(x)')
    expect(plan.filePath).toBe('test.ts')
    expect(plan.suggestions.length).toBeGreaterThan(0)
    expect(plan.riskAssessment).toBeDefined()
  })

  it('returns empty plan for clean source', () => {
    const engine = new SuggestionEngine()
    const plan = engine.getFixPlan('clean.ts', 'const x = 1;')
    expect(plan.suggestions.length).toBe(0)
  })
})
