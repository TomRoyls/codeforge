import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('complexity module', () => {
  it('exports the Complexity class as default', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Complexity class has static description', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default.description).toContain('cyclomatic')
    expect(mod.default.description).toContain('cognitive complexity')
  })

  it('Complexity class has static flags defined', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.ext).toBeDefined()
    expect(mod.default.flags.format).toBeDefined()
    expect(mod.default.flags.ignore).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
    expect(mod.default.flags['sort-by']).toBeDefined()
    expect(mod.default.flags.threshold).toBeDefined()
    expect(mod.default.flags.top).toBeDefined()
  })

  it('Complexity class has static args defined', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('Complexity class has static examples', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Complexity static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default.flags.format.default).toBe('table')
    expect(mod.default.flags['sort-by'].default).toBe('complexity')
    expect(mod.default.flags.threshold.default).toBe(0)
    expect(mod.default.flags.top.default).toBe(20)
  })

  it('has format flag with correct options', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default.flags.format.options).toEqual(['json', 'markdown', 'table'])
  })

  it('has sort-by flag with correct options', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default.flags['sort-by'].options).toEqual(['complexity', 'file', 'name'])
  })

  it('has args with correct default', async () => {
    const mod = await import('../src/commands/complexity.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/complexity.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
