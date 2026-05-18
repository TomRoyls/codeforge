import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('create-rule module', () => {
  it('exports the CreateRule class as default', async () => {
    const mod = await import('../src/commands/create-rule.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('CreateRule class has static description', async () => {
    const mod = await import('../src/commands/create-rule.js')
    expect(mod.default.description).toBe('Generate a new CodeForge lint rule scaffold')
  })

  it('CreateRule class has static flags defined', async () => {
    const mod = await import('../src/commands/create-rule.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.category).toBeDefined()
    expect(mod.default.flags.description).toBeDefined()
    expect(mod.default.flags.fixable).toBeDefined()
    expect(mod.default.flags.force).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
    expect(mod.default.flags.severity).toBeDefined()
    expect(mod.default.flags.typescript).toBeDefined()
  })

  it('CreateRule class has static args defined', async () => {
    const mod = await import('../src/commands/create-rule.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.name).toBeDefined()
    expect(mod.default.args.name.required).toBe(true)
  })

  it('CreateRule class has static examples', async () => {
    const mod = await import('../src/commands/create-rule.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Public Method Wrappers ────────────────────────────
describe('CreateRule public helper methods', () => {
  it('exposes isValidRuleName as instance method', async () => {
    const mod = await import('../src/commands/create-rule.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.isValidRuleName).toBe('function')
  })

  it('exposes isValidCategory as instance method', async () => {
    const mod = await import('../src/commands/create-rule.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.isValidCategory).toBe('function')
  })
})

// ─── Static Configuration ──────────────────────────────
describe('CreateRule static configuration', () => {
  it('has category flag with correct options', async () => {
    const mod = await import('../src/commands/create-rule.js')
    const options = mod.default.flags.category.options
    expect(options).toContain('complexity')
    expect(options).toContain('patterns')
    expect(options).toContain('security')
    expect(options).toContain('dependencies')
    expect(options).toContain('performance')
  })

  it('has severity flag with correct options', async () => {
    const mod = await import('../src/commands/create-rule.js')
    const options = mod.default.flags.severity.options
    expect(options).toContain('error')
    expect(options).toContain('warning')
    expect(options).toContain('info')
  })

  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/create-rule.js')
    expect(mod.default.flags.fixable.default).toBe(false)
    expect(mod.default.flags.force.default).toBe(false)
    expect(mod.default.flags.severity.default).toBe('warning')
    expect(mod.default.flags.typescript.default).toBe(false)
  })

  it('category flag is required', async () => {
    const mod = await import('../src/commands/create-rule.js')
    expect(mod.default.flags.category.required).toBe(true)
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/create-rule.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
