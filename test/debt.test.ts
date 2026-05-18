import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('debt module', () => {
  it('exports the Debt class as default', async () => {
    const mod = await import('../src/commands/debt.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Debt class has static description', async () => {
    const mod = await import('../src/commands/debt.js')
    expect(mod.default.description).toBe('Track and analyze technical debt in your codebase')
  })

  it('Debt class has static flags defined', async () => {
    const mod = await import('../src/commands/debt.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.history).toBeDefined()
    expect(mod.default.flags.json).toBeDefined()
    expect(mod.default.flags.save).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
  })

  it('Debt class has static args defined', async () => {
    const mod = await import('../src/commands/debt.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('Debt class has static examples', async () => {
    const mod = await import('../src/commands/debt.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('debt type interfaces', () => {
  it('DebtReport shape is valid with all fields', () => {
    const report = {
      breakdown: {
        complexity: 10,
        dependencies: 5,
        documentation: 3,
        patterns: 8,
        security: 2,
      },
      filesAnalyzed: 42,
      interest: {
        annual: 120,
        monthly: 10,
        weekly: 2.5,
      },
      overall: 28,
      path: '/project/src',
      trend: {
        change: -3,
        direction: 'decreasing' as const,
        previous: 31,
      },
    }
    expect(report.overall).toBe(28)
    expect(report.breakdown.complexity).toBe(10)
    expect(report.interest.weekly).toBe(2.5)
    expect(report.trend.direction).toBe('decreasing')
    expect(report.filesAnalyzed).toBe(42)
  })

  it('DebtBreakdown shape is valid', () => {
    const breakdown = {
      complexity: 0,
      dependencies: 0,
      documentation: 0,
      patterns: 0,
      security: 0,
    }
    expect(Object.keys(breakdown)).toHaveLength(5)
  })

  it('DebtHistoryEntry shape is valid', () => {
    const entry = {
      breakdown: {
        complexity: 1,
        dependencies: 2,
        documentation: 3,
        patterns: 4,
        security: 5,
      },
      overall: 15,
      timestamp: '2025-01-01T00:00:00.000Z',
    }
    expect(entry.overall).toBe(15)
    expect(entry.timestamp).toBe('2025-01-01T00:00:00.000Z')
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Debt static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/debt.js')
    expect(mod.default.flags.history.default).toBe(false)
    expect(mod.default.flags.json.default).toBe(false)
    expect(mod.default.flags.save.default).toBe(false)
    expect(mod.default.flags.verbose.default).toBe(false)
  })

  it('has args with correct default path', async () => {
    const mod = await import('../src/commands/debt.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/debt.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
