import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('rules module', () => {
  it('exports the Rules class as default', async () => {
    const mod = await import('../src/commands/rules.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Rules class has static description', async () => {
    const mod = await import('../src/commands/rules.js')
    expect(mod.default.description).toBe('List all available rules')
  })

  it('Rules class has static flags defined', async () => {
    const mod = await import('../src/commands/rules.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.category).toBeDefined()
    expect(mod.default.flags.fixable).toBeDefined()
    expect(mod.default.flags.format).toBeDefined()
    expect(mod.default.flags.search).toBeDefined()
    expect(mod.default.flags.severity).toBeDefined()
  })

  it('Rules class has static examples', async () => {
    const mod = await import('../src/commands/rules.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Public Method Wrappers ────────────────────────────
describe('Rules public helper methods', () => {
  it('exposes getRules as instance method', async () => {
    const mod = await import('../src/commands/rules.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.getRules).toBe('function')
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Rules static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/rules.js')
    expect(mod.default.flags.fixable.default).toBe(false)
    expect(mod.default.flags.format.default).toBe('table')
  })

  it('has format flag with correct options', async () => {
    const mod = await import('../src/commands/rules.js')
    expect(mod.default.flags.format.options).toEqual(['json', 'table'])
  })

  it('has category flag with correct options', async () => {
    const mod = await import('../src/commands/rules.js')
    const options = mod.default.flags.category.options
    expect(options).toContain('complexity')
    expect(options).toContain('security')
    expect(options).toContain('patterns')
    expect(options).toContain('performance')
    expect(options).toContain('dependencies')
  })

  it('has severity flag with correct options', async () => {
    const mod = await import('../src/commands/rules.js')
    expect(mod.default.flags.severity.options).toEqual(['error', 'warning', 'info'])
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/rules.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
