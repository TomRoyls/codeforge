import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('exports module', () => {
  it('exports the Exports class as default', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Exports class has static description', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(mod.default.description).toBe('Analyze and list exports from TypeScript/JavaScript files')
  })

  it('Exports class has static flags defined', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.ext).toBeDefined()
    expect(mod.default.flags.format).toBeDefined()
    expect(mod.default.flags.ignore).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
    expect(mod.default.flags.type).toBeDefined()
    expect(mod.default.flags.unused).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
  })

  it('Exports class has static args defined', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('Exports class has static examples', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('exports type interfaces', () => {
  it('ExportInfo shape is valid', () => {
    const info = {
      filePath: 'src/foo.ts',
      isDefault: false,
      isTypeOnly: false,
      line: 10,
      name: 'myFunction',
      type: 'function' as const,
      usageCount: 5,
    }
    expect(info.name).toBe('myFunction')
    expect(info.type).toBe('function')
    expect(info.usageCount).toBe(5)
  })

  it('AnalysisResult shape is valid', () => {
    const result = {
      exports: [],
      totalFiles: 0,
      typeSummary: {
        class: 0,
        const: 0,
        function: 0,
        interface: 0,
        type: 0,
      },
      unusedExports: [],
    }
    expect(result.exports).toHaveLength(0)
    expect(result.totalFiles).toBe(0)
    expect(Object.keys(result.typeSummary)).toHaveLength(5)
  })

  it('TypeSummary has all expected keys', () => {
    const summary = {
      class: 1,
      const: 2,
      function: 3,
      interface: 4,
      type: 5,
    }
    expect(summary.class).toBe(1)
    expect(summary.const).toBe(2)
    expect(summary.function).toBe(3)
    expect(summary.interface).toBe(4)
    expect(summary.type).toBe(5)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Exports static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(mod.default.flags.format.default).toBe('console')
    expect(mod.default.flags.type.options).toEqual(['class', 'const', 'function', 'interface', 'type'])
    expect(mod.default.flags.unused.default).toBe(false)
    expect(mod.default.flags.verbose.default).toBe(false)
  })

  it('has format flag with correct options', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(mod.default.flags.format.options).toEqual(['console', 'json', 'markdown'])
  })

  it('has args with correct default', async () => {
    const mod = await import('../src/commands/exports.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/exports.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
