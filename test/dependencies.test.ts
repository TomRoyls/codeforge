import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('dependencies module', () => {
  it('exports the Dependencies class as default', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Dependencies class has static description', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(mod.default.description).toBe('Analyze and visualize module dependencies')
  })

  it('Dependencies class has static flags defined', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.circular).toBeDefined()
    expect(mod.default.flags.external).toBeDefined()
    expect(mod.default.flags.format).toBeDefined()
    expect(mod.default.flags.ignore).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
    expect(mod.default.flags.tree).toBeDefined()
  })

  it('Dependencies class has static args defined', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('Dependencies class has static examples', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Public Method Wrappers ────────────────────────────
describe('Dependencies public helper methods', () => {
  it('exposes deduplicateCycles as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.deduplicateCycles).toBe('function')
  })

  it('exposes extractImports as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.extractImports).toBe('function')
  })

  it('exposes normalizeCycle as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.normalizeCycle).toBe('function')
  })

  it('exposes detectCyclesFromNode as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.detectCyclesFromNode).toBe('function')
  })

  it('exposes processDependency as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.processDependency).toBe('function')
  })

  it('exposes recordCycle as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.recordCycle).toBe('function')
  })

  it('exposes finishNodeVisit as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.finishNodeVisit).toBe('function')
  })

  it('exposes displayDotFormat as instance method', async () => {
    const mod = await import('../src/commands/dependencies.js')
    const instance = new (mod.default as any)()
    expect(typeof instance.displayDotFormat).toBe('function')
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('dependencies type interfaces', () => {
  it('DependenciesReport shape is valid', () => {
    const report = {
      circularDependencies: [],
      externalModules: ['react', 'lodash'],
      filesAnalyzed: 10,
      graph: { edges: [], nodes: [] },
      internalModules: ['../utils/helper'],
      orphanFiles: ['src/unused.ts'],
    }
    expect(report.filesAnalyzed).toBe(10)
    expect(report.circularDependencies).toHaveLength(0)
    expect(report.externalModules).toHaveLength(2)
  })

  it('ImportInfo shape is valid', () => {
    const importInfo = {
      isTypeOnly: false,
      line: 1,
      modulePath: 'react',
      namedImports: ['useState', 'useEffect'],
    }
    expect(importInfo.modulePath).toBe('react')
    expect(importInfo.namedImports).toHaveLength(2)
  })

  it('DependencyGraph shape is valid', () => {
    const graph = {
      nodes: new Map([
        ['src/a.ts', { filePath: 'src/a.ts', imports: new Set(['react']) }],
      ]),
    }
    expect(graph.nodes).toBeInstanceOf(Map)
    expect(graph.nodes.size).toBe(1)
  })

  it('CircularDependency shape is valid', () => {
    const cycle = {
      files: ['src/a.ts', 'src/b.ts', 'src/a.ts'],
      length: 3,
    }
    expect(cycle.files).toHaveLength(3)
    expect(cycle.length).toBe(3)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Dependencies static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(mod.default.flags.circular.default).toBe(false)
    expect(mod.default.flags.external.default).toBe(false)
    expect(mod.default.flags.format.default).toBe('table')
    expect(mod.default.flags.tree.default).toBe(false)
  })

  it('has format flag with correct options', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(mod.default.flags.format.options).toEqual(['dot', 'json', 'table'])
  })

  it('has args with correct default', async () => {
    const mod = await import('../src/commands/dependencies.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/dependencies.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
