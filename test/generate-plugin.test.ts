import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('generate-plugin module', () => {
  it('exports the GeneratePlugin class as default', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('GeneratePlugin class has static description', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    expect(mod.default.description).toBe('Generate a new CodeForge plugin scaffold')
  })

  it('GeneratePlugin class has static flags defined', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.typescript).toBeDefined()
    expect(mod.default.flags.rule).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
    expect(mod.default.flags.force).toBeDefined()
  })

  it('GeneratePlugin class has static args defined', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.name).toBeDefined()
    expect(mod.default.args.name.required).toBe(true)
  })

  it('GeneratePlugin class has static examples', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Public Method Wrappers ────────────────────────────
describe('GeneratePlugin public helper methods', () => {
  it('exposes isValidPluginName as instance method', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.isValidPluginName).toBe('function')
  })

  it('exposes toCamelCase as instance method', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.toCamelCase).toBe('function')
  })
})

// ─── Static Configuration ──────────────────────────────
describe('GeneratePlugin static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    expect(mod.default.flags.typescript.default).toBe(true)
    expect(mod.default.flags.rule.default).toBe('sample-rule')
    expect(mod.default.flags.output.default).toBe('.')
    expect(mod.default.flags.force.default).toBe(false)
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/generate-plugin.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
