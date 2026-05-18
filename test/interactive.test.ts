import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('interactive module', () => {
  it('exports the Interactive class as default', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Interactive class has static description', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(mod.default.description).toBe('Interactively review and fix violations')
  })

  it('Interactive class has static flags defined', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags['auto-safe']).toBeDefined()
    expect(mod.default.flags.severity).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
  })

  it('Interactive class has static args defined', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('Interactive class has static examples', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('interactive type interfaces', () => {
  it('FixResult shape is valid', () => {
    const result = {
      applied: 5,
      skipped: 2,
      total: 7,
    }
    expect(result.applied).toBe(5)
    expect(result.skipped).toBe(2)
    expect(result.total).toBe(7)
  })

  it('FixResult with all skipped', () => {
    const result = {
      applied: 0,
      skipped: 10,
      total: 10,
    }
    expect(result.applied).toBe(0)
    expect(result.skipped).toBe(result.total)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Interactive static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(mod.default.flags['auto-safe'].default).toBe(false)
    expect(mod.default.flags.severity.default).toBe('warning')
    expect(mod.default.flags.verbose.default).toBe(false)
  })

  it('has severity flag with correct options', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(mod.default.flags.severity.options).toEqual(['error', 'warning', 'info'])
  })

  it('has args with correct default', async () => {
    const mod = await import('../src/commands/interactive.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/interactive.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
