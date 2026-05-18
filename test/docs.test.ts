import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('docs module', () => {
  it('exports the Docs class as default', async () => {
    const mod = await import('../src/commands/docs.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Docs class has static description', async () => {
    const mod = await import('../src/commands/docs.js')
    expect(mod.default.description).toBe('Generate markdown documentation for all rules')
  })

  it('Docs class has static flags defined', async () => {
    const mod = await import('../src/commands/docs.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.category).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
    expect(mod.default.flags.single).toBeDefined()
  })

  it('Docs class has static examples', async () => {
    const mod = await import('../src/commands/docs.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Public Method Wrappers ────────────────────────────
describe('Docs public helper methods', () => {
  it('exposes generateRuleMarkdown as instance method', async () => {
    const mod = await import('../src/commands/docs.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.generateRuleMarkdown).toBe('function')
  })

  it('exposes getBadges as instance method', async () => {
    const mod = await import('../src/commands/docs.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.getBadges).toBe('function')
  })

  it('exposes groupByCategory as instance method', async () => {
    const mod = await import('../src/commands/docs.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.groupByCategory).toBe('function')
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('docs type interfaces', () => {
  it('RuleDoc shape is valid', () => {
    const rule = {
      category: 'complexity',
      description: 'Limit maximum function complexity',
      fixable: false,
      name: 'max-complexity',
      recommended: true,
      severity: 'warning',
    }
    expect(rule.name).toBe('max-complexity')
    expect(rule.category).toBe('complexity')
    expect(rule.recommended).toBe(true)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Docs static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/docs.js')
    expect(mod.default.flags.output.default).toBe('docs/rules')
    expect(mod.default.flags.single.default).toBe(false)
  })

  it('has category flag with correct options', async () => {
    const mod = await import('../src/commands/docs.js')
    const options = mod.default.flags.category.options
    expect(options).toContain('complexity')
    expect(options).toContain('security')
    expect(options).toContain('patterns')
    expect(options).toContain('performance')
    expect(options).toContain('dependencies')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/docs.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
