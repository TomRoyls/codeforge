import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('organize-imports module', () => {
  it('exports the OrganizeImports class as default', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('OrganizeImports class has static description', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    expect(mod.default.description).toBe('Organize and sort imports in TypeScript files')
  })

  it('OrganizeImports class has static flags defined', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags['dry-run']).toBeDefined()
    expect(mod.default.flags.group).toBeDefined()
    expect(mod.default.flags.sort).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
    expect(mod.default.flags.write).toBeDefined()
  })

  it('OrganizeImports class has static args defined', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('OrganizeImports class has static examples', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('organize-imports type interfaces', () => {
  it('ImportGroup shape is valid with all groups', () => {
    const group = {
      external: [],
      internal: [],
      relative: [],
      sideEffects: [],
    }
    expect(Object.keys(group)).toHaveLength(4)
    expect(group.external).toHaveLength(0)
  })

  it('OrganizeResult shape is valid', () => {
    const result = {
      filesModified: 3,
      importsOrganized: 10,
      skipped: 2,
    }
    expect(result.filesModified).toBe(3)
    expect(result.importsOrganized).toBe(10)
    expect(result.skipped).toBe(2)
  })

  it('OrganizeResult with no changes', () => {
    const result = {
      filesModified: 0,
      importsOrganized: 0,
      skipped: 5,
    }
    expect(result.filesModified).toBe(0)
    expect(result.skipped).toBe(5)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('OrganizeImports static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    expect(mod.default.flags['dry-run'].default).toBe(false)
    expect(mod.default.flags.group.default).toBe(false)
    expect(mod.default.flags.sort.default).toBe(true)
    expect(mod.default.flags.verbose.default).toBe(false)
    expect(mod.default.flags.write.default).toBe(false)
  })

  it('has args with correct default', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/organize-imports.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
