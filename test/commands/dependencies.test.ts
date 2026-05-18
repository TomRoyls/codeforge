import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Dependencies from '../../src/commands/dependencies.js'

// ─── Top-level mocks ───

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  }),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    initialize = vi.fn().mockResolvedValue(undefined)
    dispose = vi.fn()
    parseFile = vi.fn().mockResolvedValue({
      sourceFile: { getText: () => '' },
    })
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
  },
}))

vi.mock('../../src/commands/dependencies-helpers.js', () => ({
  deduplicateCycles: vi.fn((cycles) => cycles),
  detectCircularDependencies: vi.fn(() => []),
  detectCyclesFromNode: vi.fn(),
  displayCircularDependencies: vi.fn(),
  displayDependencyTree: vi.fn(),
  displayDotFormat: vi.fn(),
  displayExternalModules: vi.fn(),
  displayFullReport: vi.fn(),
  extractImports: vi.fn(() => []),
  findOrphanFiles: vi.fn(() => []),
  finishNodeVisit: vi.fn(),
  formatOutput: vi.fn(() => '{}'),
  graphToDotFormat: vi.fn(() => ({ edges: [], nodes: [] })),
  normalizeCycle: vi.fn((c) => [...c]),
  processDependency: vi.fn(),
  recordCycle: vi.fn(),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface DependenciesPrivate {
  analyzeDependencies: (
    files: { absolutePath: string; path: string }[],
    spinner: { text: string },
  ) => Promise<Record<string, unknown>>
  deduplicateCycles: (cycles: unknown[]) => unknown[]
  detectCyclesFromNode: (currentPath: string, context: Record<string, unknown>) => void
  displayCircularDependencies: (report: Record<string, unknown>, format: string) => void
  displayDependencyTree: (report: Record<string, unknown>) => void
  displayDotFormat: (report: Record<string, unknown>) => void
  displayExternalModules: (report: Record<string, unknown>, format: string) => void
  displayFullReport: (report: Record<string, unknown>, format: string) => void
  extractImports: (sourceCode: string, filePath: string) => unknown[]
  finishNodeVisit: (currentPath: string, path: string[], recursionStack: Set<string>) => void
  formatOutput: (
    report: Record<string, unknown>,
    flags: Record<string, unknown>,
  ) => string
  graphToDotFormat: (graph: Record<string, unknown>) => { edges: unknown[]; nodes: unknown[] }
  log: (...args: unknown[]) => void
  normalizeCycle: (cycle: readonly string[]) => string[]
  processDependency: (
    dependency: string,
    node: Record<string, unknown>,
    context: Record<string, unknown>,
  ) => void
  recordCycle: (
    dependency: string,
    node: Record<string, unknown>,
    context: Record<string, unknown>,
  ) => void
  run: () => Promise<void>
}

function createInstance(): { cmd: Dependencies; p: DependenciesPrivate; logs: string[] } {
  const logs: string[] = []
  const cmd = new Dependencies([], {} as never)
  const p = cmd as unknown as DependenciesPrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { cmd, p, logs }
}

function makeNode(
  filePath: string,
  imports: string[] = [],
): { filePath: string; importDetails: Map<string, unknown>; imports: Set<string> } {
  return {
    filePath,
    importDetails: new Map(
      imports.map((imp) => [
        imp,
        { location: { column: 1, end: 10, line: 1 }, modulePath: imp, sourceFile: filePath },
      ]),
    ),
    imports: new Set(imports),
  }
}

function makeReport(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    circularDependencies: [],
    externalModules: [],
    filesAnalyzed: 0,
    graph: { edges: [], nodes: [] },
    internalModules: [],
    orphanFiles: [],
    ...overrides,
  }
}

// ─── Static properties ───

describe('Dependencies command static properties', () => {
  it('has correct description', () => {
    expect(Dependencies.description).toBe('Analyze and visualize module dependencies')
  })

  it('has examples defined', () => {
    expect(Dependencies.examples).toBeDefined()
    expect(Dependencies.examples!.length).toBeGreaterThan(0)
  })

  it('defines path arg as optional string', () => {
    const pathArg = Dependencies.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has circular flag with char c defaulting to false', () => {
    const flag = Dependencies.flags!.circular as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('c')
    expect(flag.default).toBe(false)
  })

  it('has external flag with char e defaulting to false', () => {
    const flag = Dependencies.flags!.external as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('e')
    expect(flag.default).toBe(false)
  })

  it('has format flag with char f defaulting to table', () => {
    const flag = Dependencies.flags!.format as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('f')
    expect(flag.default).toBe('table')
  })

  it('format flag options are dot, json, table', () => {
    const flag = Dependencies.flags!.format as Record<string, unknown>
    expect(flag.options).toEqual(['dot', 'json', 'table'])
  })

  it('has ignore flag with char i and multiple option', () => {
    const flag = Dependencies.flags!.ignore as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('i')
    expect(flag.multiple).toBe(true)
  })

  it('has output flag with char o', () => {
    const flag = Dependencies.flags!.output as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('o')
  })

  it('has tree flag with char t defaulting to false', () => {
    const flag = Dependencies.flags!.tree as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('t')
    expect(flag.default).toBe(false)
  })

  it('each example has command and description', () => {
    for (const example of Dependencies.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── extractImports delegation ───

describe('extractImports', () => {
  it('delegates to extractImportsHelper', () => {
    const { p } = createInstance()
    const result = p.extractImports('import foo from "bar"', 'test.ts')
    expect(Array.isArray(result)).toBe(true)
  })
})

// ─── normalizeCycle ───

describe('normalizeCycle', () => {
  it('delegates to helper and returns string array', () => {
    const { p } = createInstance()
    const result = p.normalizeCycle(['a', 'b', 'c'])
    expect(Array.isArray(result)).toBe(true)
  })
})

// ─── deduplicateCycles ───

describe('deduplicateCycles', () => {
  it('delegates to helper', () => {
    const { p } = createInstance()
    const result = p.deduplicateCycles([])
    expect(Array.isArray(result)).toBe(true)
  })
})

// ─── finishNodeVisit ───

describe('finishNodeVisit', () => {
  it('delegates to helper without throwing', () => {
    const { p } = createInstance()
    const path = ['a', 'b']
    const stack = new Set(['a', 'b'])
    expect(() => p.finishNodeVisit('b', path, stack)).not.toThrow()
  })
})

// ─── processDependency ───

describe('processDependency', () => {
  it('delegates to helper without throwing', () => {
    const { p } = createInstance()
    const node = makeNode('a.ts')
    p.processDependency('b.ts', node, { cycles: [], path: [] })
  })
})

// ─── recordCycle ───

describe('recordCycle', () => {
  it('delegates to helper without throwing', () => {
    const { p } = createInstance()
    const node = makeNode('a.ts')
    p.recordCycle('b.ts', node, { cycles: [], path: ['a.ts'] })
  })
})

// ─── detectCyclesFromNode ───

describe('detectCyclesFromNode', () => {
  it('delegates to helper without throwing', () => {
    const { p } = createInstance()
    p.detectCyclesFromNode('a.ts', {
      cycles: [],
      graph: { nodes: new Map() },
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    })
  })
})

// ─── graphToDotFormat (private, via analyzeDependencies) ───

describe('graphToDotFormat delegation', () => {
  it('converts a graph to dot format with nodes and edges', async () => {
    const { graphToDotFormat } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(graphToDotFormat).mockReturnValueOnce({
      edges: [['a.ts', 'b.ts']],
      nodes: ['a.ts', 'b.ts'],
    })

    const { p } = createInstance()
    const result = p.graphToDotFormat({ nodes: new Map() })
    expect(result.nodes).toEqual(['a.ts', 'b.ts'])
    expect(result.edges).toEqual([['a.ts', 'b.ts']])
  })
})

// ─── formatOutput ───

describe('formatOutput', () => {
  it('delegates to helper with circular flag', async () => {
    const { formatOutput } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(formatOutput).mockReturnValueOnce('{"circular":true}')

    const { p } = createInstance()
    const report = makeReport()
    const result = p.formatOutput(report, { circular: true })
    expect(result).toBe('{"circular":true}')
  })

  it('delegates to helper with external flag', async () => {
    const { formatOutput } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(formatOutput).mockReturnValueOnce('{"external":true}')

    const { p } = createInstance()
    const result = p.formatOutput(makeReport(), { external: true })
    expect(result).toBe('{"external":true}')
  })

  it('delegates to helper with dot format', async () => {
    const { formatOutput } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(formatOutput).mockReturnValueOnce('digraph {}')

    const { p } = createInstance()
    const result = p.formatOutput(makeReport(), { format: 'dot' })
    expect(result).toBe('digraph {}')
  })
})

// ─── displayDotFormat ───

describe('displayDotFormat', () => {
  it('delegates to helper and logs output', async () => {
    const { displayDotFormat } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(displayDotFormat).mockImplementationOnce((_report, log) => {
      log('digraph dependencies {}')
    })

    const { p, logs } = createInstance()
    p.displayDotFormat(makeReport())
    expect(logs).toContain('digraph dependencies {}')
  })
})

// ─── displayCircularDependencies ───

describe('displayCircularDependencies', () => {
  it('delegates to helper for JSON format', async () => {
    const { displayCircularDependencies: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, _f, log) => {
      log('circular JSON output')
    })

    const { p, logs } = createInstance()
    p.displayCircularDependencies(makeReport(), 'json')
    expect(logs).toContain('circular JSON output')
  })

  it('delegates to helper for table format', async () => {
    const { displayCircularDependencies: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, _f, log) => {
      log('Found 1 circular dependencies:')
    })

    const { p, logs } = createInstance()
    p.displayCircularDependencies(makeReport(), 'table')
    expect(logs).toContain('Found 1 circular dependencies:')
  })
})

// ─── displayDependencyTree ───

describe('displayDependencyTree', () => {
  it('delegates to helper and logs tree output', async () => {
    const { displayDependencyTree: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, log) => {
      log('Dependency Tree')
    })

    const { p, logs } = createInstance()
    p.displayDependencyTree(makeReport())
    expect(logs).toContain('Dependency Tree')
  })
})

// ─── displayExternalModules ───

describe('displayExternalModules', () => {
  it('delegates to helper for JSON format', async () => {
    const { displayExternalModules: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, _f, log) => {
      log('External modules JSON')
    })

    const { p, logs } = createInstance()
    p.displayExternalModules(makeReport(), 'json')
    expect(logs).toContain('External modules JSON')
  })

  it('delegates to helper for table format with modules', async () => {
    const { displayExternalModules: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, _f, log) => {
      log('chalk')
      log('vitest')
    })

    const { p, logs } = createInstance()
    p.displayExternalModules(makeReport({ externalModules: ['chalk', 'vitest'] }), 'table')
    expect(logs).toContain('chalk')
    expect(logs).toContain('vitest')
  })
})

// ─── displayFullReport ───

describe('displayFullReport', () => {
  it('delegates to helper for JSON format', async () => {
    const { displayFullReport: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, _f, log) => {
      log('{"filesAnalyzed":5}')
    })

    const { p, logs } = createInstance()
    p.displayFullReport(makeReport({ filesAnalyzed: 5 }), 'json')
    expect(logs).toContain('{"filesAnalyzed":5}')
  })

  it('delegates to helper for table format', async () => {
    const { displayFullReport: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, _f, log) => {
      log('Dependency Analysis')
      log('Files analyzed: 10')
    })

    const { p, logs } = createInstance()
    p.displayFullReport(makeReport({ filesAnalyzed: 10 }), 'table')
    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Dependency Analysis')
    expect(output).toContain('Files analyzed: 10')
  })

  it('delegates to helper for dot format', async () => {
    const { displayFullReport: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(helper).mockImplementationOnce((_r, _f, log) => {
      log('digraph dependencies {')
    })

    const { p, logs } = createInstance()
    p.displayFullReport(makeReport(), 'dot')
    expect(logs).toContain('digraph dependencies {')
  })
})

// ─── analyzeDependencies (private, full integration via mock) ───

describe('analyzeDependencies', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(async () => {
    instance = createInstance()
    const { extractImports } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(extractImports).mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns report with zero files when no files provided', async () => {
    const result = await instance.p.analyzeDependencies([], { text: '' })
    expect(result.filesAnalyzed).toBe(0)
    expect(result.circularDependencies).toEqual([])
    expect(result.orphanFiles).toEqual([])
  })

  it('counts files analyzed', async () => {
    const result = await instance.p.analyzeDependencies(
      [
        { absolutePath: '/a.ts', path: 'a.ts' },
        { absolutePath: '/b.ts', path: 'b.ts' },
      ],
      { text: '' },
    )
    expect(result.filesAnalyzed).toBe(2)
  })

  it('classifies internal vs external imports', async () => {
    const { extractImports } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(extractImports).mockImplementation((_code, filePath) => {
      if (filePath === 'a.ts') {
        return [
          { location: { column: 1, end: 20, line: 1 }, modulePath: './b', sourceFile: 'a.ts' },
          { location: { column: 1, end: 20, line: 2 }, modulePath: 'chalk', sourceFile: 'a.ts' },
        ]
      }
      return []
    })

    const result = await instance.p.analyzeDependencies(
      [
        { absolutePath: '/a.ts', path: 'a.ts' },
        { absolutePath: '/b.ts', path: 'b.ts' },
      ],
      { text: '' },
    )

    expect(result.internalModules).toContain('./b')
    expect(result.externalModules).toContain('chalk')
  })

  it('sorts internal and external modules', async () => {
    const { extractImports } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(extractImports).mockImplementation((_code, filePath) => {
      if (filePath === 'a.ts') {
        return [
          { location: { column: 1, end: 20, line: 1 }, modulePath: 'zebra', sourceFile: 'a.ts' },
          { location: { column: 1, end: 20, line: 2 }, modulePath: 'alpha', sourceFile: 'a.ts' },
        ]
      }
      return []
    })

    const result = await instance.p.analyzeDependencies(
      [{ absolutePath: '/a.ts', path: 'a.ts' }],
      { text: '' },
    )

    expect(result.externalModules).toEqual(['alpha', 'zebra'])
  })

  it('continues parsing when a file fails', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const parser = new Parser()
    let callCount = 0
    parser.parseFile = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) throw new Error('Parse error')
      return {
        sourceFile: { getText: () => 'import foo from "bar"' },
      }
    })

    const result = await instance.p.analyzeDependencies(
      [
        { absolutePath: '/a.ts', path: 'a.ts' },
        { absolutePath: '/b.ts', path: 'b.ts' },
      ],
      { text: '' },
    )

    expect(result).toBeDefined()
    expect(typeof result.filesAnalyzed).toBe('number')
  })

  it('calls detectCircularDependencies on the graph', async () => {
    const { detectCircularDependencies } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(detectCircularDependencies).mockReturnValueOnce([
      { cycle: ['a.ts', 'b.ts', 'a.ts'], location: { column: 1, end: 20, line: 1 } },
    ])

    const result = await instance.p.analyzeDependencies(
      [{ absolutePath: '/a.ts', path: 'a.ts' }],
      { text: '' },
    )

    expect(result.circularDependencies).toHaveLength(1)
  })

  it('calls findOrphanFiles on the graph', async () => {
    const { findOrphanFiles } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    vi.mocked(findOrphanFiles).mockReturnValueOnce(['orphan.ts'])

    const result = await instance.p.analyzeDependencies(
      [{ absolutePath: '/a.ts', path: 'a.ts' }],
      { text: '' },
    )

    expect(result.orphanFiles).toEqual(['orphan.ts'])
  })

  it('updates spinner text during analysis', async () => {
    const spinner = { text: '' }
    await instance.p.analyzeDependencies(
      [
        { absolutePath: '/a.ts', path: 'a.ts' },
        { absolutePath: '/b.ts', path: 'b.ts' },
      ],
      spinner,
    )
    expect(spinner.text).toContain('Analyzed')
  })
})

// ─── run method error path ───

describe('run method', () => {
  it('errors when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValueOnce(false)

    const instance = createInstance()
    const errorSpy = vi.fn()
    instance.cmd.error = errorSpy

    const originalParse = instance.cmd.parse
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '/nonexistent' },
      flags: {},
    })

    await instance.p.run()
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Path not found'),
      { exit: 1 },
    )

    instance.cmd.parse = originalParse
  })

  it('writes output file when --output flag is provided', async () => {
    const { writeFile } = await import('node:fs/promises')
    const { formatOutput } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    vi.mocked(formatOutput).mockReturnValueOnce('report content')
    vi.mocked(discoverFiles).mockResolvedValueOnce([])

    const instance = createInstance()
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { output: '/tmp/deps-out.json' },
    })

    await instance.p.run()

    expect(writeFile).toHaveBeenCalledWith(
      '/tmp/deps-out.json',
      'report content',
      'utf8',
    )
    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Results written to')
  })

  it('handles file write failure gracefully', async () => {
    const { writeFile } = await import('node:fs/promises')
    const { discoverFiles } = await import('../../src/core/file-discovery.js')

    vi.mocked(writeFile).mockRejectedValueOnce(new Error('disk full'))
    vi.mocked(discoverFiles).mockResolvedValueOnce([])

    const instance = createInstance()
    const errorSpy = vi.fn()
    instance.cmd.error = errorSpy
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { output: '/tmp/fail.json' },
    })

    await instance.p.run()

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to write'),
    )
  })

  it('displays tree when --tree flag is set', async () => {
    const { displayDependencyTree: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValueOnce([])
    let called = false
    vi.mocked(helper).mockImplementationOnce(() => {
      called = true
    })

    const instance = createInstance()
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { tree: true },
    })

    await instance.p.run()
    expect(called).toBe(true)
  })

  it('displays circular deps when --circular flag is set', async () => {
    const { displayCircularDependencies: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValueOnce([])
    let called = false
    vi.mocked(helper).mockImplementationOnce(() => {
      called = true
    })

    const instance = createInstance()
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { circular: true, format: 'table' },
    })

    await instance.p.run()
    expect(called).toBe(true)
  })

  it('displays external modules when --external flag is set', async () => {
    const { displayExternalModules: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValueOnce([])
    let called = false
    vi.mocked(helper).mockImplementationOnce(() => {
      called = true
    })

    const instance = createInstance()
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { external: true, format: 'table' },
    })

    await instance.p.run()
    expect(called).toBe(true)
  })

  it('displays full report when no special flags are set', async () => {
    const { displayFullReport: helper } = await import(
      '../../src/commands/dependencies-helpers.js'
    )
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValueOnce([])
    let called = false
    vi.mocked(helper).mockImplementationOnce(() => {
      called = true
    })

    const instance = createInstance()
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { format: 'table' },
    })

    await instance.p.run()
    expect(called).toBe(true)
  })

  it('merges custom ignore patterns with defaults', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValueOnce([])

    const instance = createInstance()
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: { ignore: ['**/vendor/**'] },
    })

    await instance.p.run()

    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: expect.arrayContaining(['**/vendor/**', '**/node_modules/**']),
      }),
    )
  })

  it('uses default ignore patterns when no --ignore flag', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValueOnce([])

    const instance = createInstance()
    instance.cmd.parse = vi.fn().mockResolvedValue({
      args: { path: '.' },
      flags: {},
    })

    await instance.p.run()

    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/coverage/**',
          '**/.git/**',
        ],
      }),
    )
  })
})
