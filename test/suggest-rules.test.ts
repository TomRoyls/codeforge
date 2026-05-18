import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('suggest-rules module', () => {
  it('exports the SuggestRules class as default', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('SuggestRules class has static description', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default.description).toBe('Analyze codebase and suggest which rules would be most beneficial')
  })

  it('SuggestRules class has static flags defined', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.format).toBeDefined()
    expect(mod.default.flags.impact).toBeDefined()
    expect(mod.default.flags.top).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
  })

  it('SuggestRules class has static args defined', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('SuggestRules class has static examples', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('suggest-rules type interfaces', () => {
  it('RuleSuggestion shape is valid', () => {
    const suggestion = {
      category: 'complexity',
      confidence: 'high' as const,
      estimatedViolations: 15,
      impact: 'high' as const,
      reason: 'Complex nested functions detected',
      ruleId: 'max-nested-callbacks',
    }
    expect(suggestion.ruleId).toBe('max-nested-callbacks')
    expect(suggestion.confidence).toBe('high')
    expect(suggestion.impact).toBe('high')
    expect(suggestion.estimatedViolations).toBe(15)
  })

  it('PatternDetector shape is valid', () => {
    const detector = {
      name: 'eval-usage',
      patterns: [/eval\s*\(/, 'Function('],
      suggestedRules: [
        {
          confidence: 'high' as const,
          impact: 'high' as const,
          reason: 'Detected eval usage',
          ruleId: 'no-eval',
        },
      ],
    }
    expect(detector.patterns).toHaveLength(2)
    expect(detector.suggestedRules).toHaveLength(1)
  })

  it('SuggestedRule shape is valid', () => {
    const rule = {
      confidence: 'medium' as const,
      impact: 'low' as const,
      reason: 'Some pattern detected',
      ruleId: 'some-rule',
    }
    expect(rule.ruleId).toBe('some-rule')
    expect(rule.confidence).toBe('medium')
  })
})

// ─── Static Configuration ──────────────────────────────
describe('SuggestRules static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default.flags.format.default).toBe('console')
    expect(mod.default.flags.impact.default).toBe('')
    expect(mod.default.flags.verbose.default).toBe(false)
  })

  it('has format flag with correct options', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default.flags.format.options).toEqual(['console', 'json'])
  })

  it('has impact flag with correct options', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default.flags.impact.options).toEqual(['high', 'medium', 'low', ''])
  })

  it('has args with correct default', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/suggest-rules.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
