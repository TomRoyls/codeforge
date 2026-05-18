import { beforeEach, describe, expect, it, vi } from 'vitest'

import Exports from '../../src/commands/exports.js'
import {
  type ExportInfo,
  type TypeSummary,
} from '../../src/commands/exports-helpers.js'
import {
  formatConsole,
  formatJson,
  formatMarkdown,
  formatOutput,
  getTypeColor,
} from '../../src/commands/exports-format-helpers.js'

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
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    text: '',
  }),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    initialize = vi.fn().mockResolvedValue(undefined)
    dispose = vi.fn()
    parseFile = vi.fn()
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/commands/exports-helpers.js', () => ({
  extractExports: vi.fn().mockReturnValue([]),
  extractImports: vi.fn().mockReturnValue(new Map()),
  formatOutput: vi.fn().mockReturnValue('formatted output'),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface ExportsPrivate {
  collectExports: (
    files: Array<{ absolutePath: string; path: string }>,
    spinner: { text: string },
    verbose: boolean,
  ) => Promise<{
    exports: ExportInfo[]
    totalFiles: number
    typeSummary: TypeSummary
    unusedExports: ExportInfo[]
  }>
  log: (...args: unknown[]) => void
  parser: null | {
    dispose: () => void
    initialize: () => Promise<void>
    parseFile: ReturnType<typeof vi.fn>
  }
}

function createExportsInstance(): { command: Exports; logs: string[]; p: ExportsPrivate } {
  const logs: string[] = []
  const command = new Exports([], {} as never)
  const p = command as unknown as ExportsPrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, logs, p }
}

function makeExport(
  overrides: Partial<ExportInfo> = {},
): ExportInfo {
  return {
    file: 'src/index.ts',
    isDefault: false,
    isExported: true,
    line: 1,
    name: 'myExport',
    type: 'function',
    usageCount: 0,
    ...overrides,
  }
}

function makeFormatOptions(
  overrides: Record<string, unknown> = {},
) {
  return {
    format: 'console' as const,
    showUnused: false,
    totalFiles: 1,
    typeSummary: { class: 0, const: 0, function: 1, interface: 0, type: 0 },
    unusedExports: [],
    ...overrides,
  }
}

// ─── Static properties ───

describe('Exports command static properties', () => {
  it('has correct description', () => {
    expect(Exports.description).toBe('Analyze and list exports from TypeScript/JavaScript files')
  })

  it('has examples defined', () => {
    expect(Exports.examples).toBeDefined()
    expect(Exports.examples!.length).toBeGreaterThan(0)
  })

  it('defines path arg as optional string', () => {
    const pathArg = Exports.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.description).toBe('Path to analyze (file or directory)')
    expect(pathArg.required).toBe(false)
  })

  it('path arg defaults to "."', () => {
    const pathArg = Exports.args!.path as Record<string, unknown>
    expect(pathArg.default).toBe('.')
  })

  it('has format flag with char f defaulting to console', () => {
    const formatFlag = Exports.flags!.format as Record<string, unknown>
    expect(formatFlag).toBeDefined()
    expect(formatFlag.char).toBe('f')
    expect(formatFlag.default).toBe('console')
    expect(formatFlag.options).toEqual(['console', 'json', 'markdown'])
  })

  it('has type flag with char t for filtering exports', () => {
    const typeFlag = Exports.flags!.type as Record<string, unknown>
    expect(typeFlag).toBeDefined()
    expect(typeFlag.char).toBe('t')
    expect(typeFlag.options).toEqual(['class', 'const', 'function', 'interface', 'type'])
  })

  it('has unused flag with char u defaulting to false', () => {
    const unusedFlag = Exports.flags!.unused as Record<string, unknown>
    expect(unusedFlag).toBeDefined()
    expect(unusedFlag.char).toBe('u')
    expect(unusedFlag.default).toBe(false)
  })

  it('has verbose flag with char v defaulting to false', () => {
    const verboseFlag = Exports.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })

  it('has output flag with char o', () => {
    const outputFlag = Exports.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
  })

  it('has ignore flag with char i and multiple option', () => {
    const ignoreFlag = Exports.flags!.ignore as Record<string, unknown>
    expect(ignoreFlag).toBeDefined()
    expect(ignoreFlag.char).toBe('i')
    expect(ignoreFlag.multiple).toBe(true)
  })

  it('has ext flag for file extension filtering', () => {
    const extFlag = Exports.flags!.ext as Record<string, unknown>
    expect(extFlag).toBeDefined()
    expect(extFlag.default).toBe('')
  })

  it('defines at least 5 examples', () => {
    expect(Exports.examples!.length).toBeGreaterThanOrEqual(5)
  })
})

// ─── Example structures ───

describe('Exports examples structure', () => {
  it('each example has command and description', () => {
    for (const example of Exports.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── collectExports ───

describe('collectExports', () => {
  let instance: ReturnType<typeof createExportsInstance>

  beforeEach(async () => {
    instance = createExportsInstance()

    const { Parser } = await import('../../src/core/parser.js')
    const parser = new Parser()
    instance.p.parser = parser as ExportsPrivate['parser']

    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractExports).mockReset()
    vi.mocked(extractImports).mockReset()
  })

  it('returns empty result for no files', async () => {
    const result = await instance.p.collectExports([], { text: '' }, false)

    expect(result.exports).toEqual([])
    expect(result.totalFiles).toBe(0)
    expect(result.unusedExports).toEqual([])
  })

  it('collects exports from a single file', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    const fileExport = makeExport({ name: 'hello', type: 'function', file: 'a.ts' })
    vi.mocked(extractExports).mockReturnValue([fileExport])

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.exports).toHaveLength(1)
    expect(result.exports[0]!.name).toBe('hello')
  })

  it('aggregates exports across multiple files', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports)
      .mockReturnValueOnce([makeExport({ name: 'fnA', type: 'function', file: 'a.ts' })])
      .mockReturnValueOnce([makeExport({ name: 'ClassB', type: 'class', file: 'b.ts' })])

    const result = await instance.p.collectExports(
      [
        { absolutePath: '/abs/a.ts', path: 'a.ts' },
        { absolutePath: '/abs/b.ts', path: 'b.ts' },
      ],
      { text: '' },
      false,
    )

    expect(result.exports).toHaveLength(2)
    expect(result.totalFiles).toBe(2)
  })

  it('computes correct typeSummary', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([
      makeExport({ name: 'fn', type: 'function' }),
      makeExport({ name: 'fn2', type: 'function' }),
      makeExport({ name: 'Cls', type: 'class' }),
      makeExport({ name: 'IFace', type: 'interface' }),
      makeExport({ name: 'T', type: 'type' }),
      makeExport({ name: 'c', type: 'const' }),
    ])

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.typeSummary.function).toBe(2)
    expect(result.typeSummary.class).toBe(1)
    expect(result.typeSummary.interface).toBe(1)
    expect(result.typeSummary.type).toBe(1)
    expect(result.typeSummary.const).toBe(1)
  })

  it('sets usageCount from import data', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([
      makeExport({ name: 'used' }),
      makeExport({ name: 'unused' }),
    ])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports).mockReturnValue(new Map([['used', 3]]))

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.exports[0]!.usageCount).toBe(3)
    expect(result.exports[1]!.usageCount).toBe(0)
  })

  it('aggregates imports across multiple files', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports)
      .mockReturnValueOnce([makeExport({ name: 'foo' })])
      .mockReturnValueOnce([makeExport({ name: 'bar' })])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports)
      .mockReturnValueOnce(new Map([['foo', 1]]))
      .mockReturnValueOnce(new Map([['foo', 2]]))

    const result = await instance.p.collectExports(
      [
        { absolutePath: '/abs/a.ts', path: 'a.ts' },
        { absolutePath: '/abs/b.ts', path: 'b.ts' },
      ],
      { text: '' },
      false,
    )

    expect(result.exports[0]!.usageCount).toBe(3)
  })

  it('identifies unused exports (usageCount === 0)', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([
      makeExport({ name: 'used' }),
      makeExport({ name: 'orphan' }),
    ])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports).mockReturnValue(new Map([['used', 1]]))

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.unusedExports).toHaveLength(1)
    expect(result.unusedExports[0]!.name).toBe('orphan')
  })

  it('handles parse errors gracefully', async () => {
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockRejectedValue(new Error('Parse failed'))
    instance.p.parser = parser as ExportsPrivate['parser']

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/bad.ts', path: 'bad.ts' }],
      { text: '' },
      false,
    )

    expect(result.exports).toEqual([])
    expect(result.totalFiles).toBe(1)
  })

  it('logs parse errors in verbose mode', async () => {
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockRejectedValue(new Error('bad parse'))
    instance.p.parser = parser as ExportsPrivate['parser']

    await instance.p.collectExports(
      [{ absolutePath: '/abs/bad.ts', path: 'bad.ts' }],
      { text: '' },
      true,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Failed to analyze bad.ts')
    expect(output).toContain('bad parse')
  })

  it('skips undefined file entries in sparse arrays', async () => {
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn()
    instance.p.parser = parser as ExportsPrivate['parser']

    const files: Array<{ absolutePath: string; path: string }> = []
    files[0] = { absolutePath: '/abs/a.ts', path: 'a.ts' }
    files[2] = { absolutePath: '/abs/c.ts', path: 'c.ts' }

    const result = await instance.p.collectExports(files, { text: '' }, false)

    expect(result.totalFiles).toBe(3)
  })

  it('updates spinner text per file in verbose mode', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports).mockReturnValue(new Map())

    const spinner = { text: '' }
    await instance.p.collectExports(
      [
        { absolutePath: '/abs/a.ts', path: 'a.ts' },
        { absolutePath: '/abs/b.ts', path: 'b.ts' },
      ],
      spinner,
      true,
    )

    expect(spinner.text).toContain('b.ts')
    expect(spinner.text).toContain('2/2')
  })

  it('handles non-Error thrown from parseFile in verbose mode', async () => {
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockRejectedValue('string error')
    instance.p.parser = parser as ExportsPrivate['parser']

    await instance.p.collectExports(
      [{ absolutePath: '/abs/bad.ts', path: 'bad.ts' }],
      { text: '' },
      true,
    )

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Unknown error')
  })

  it('returns all exports as unused when no imports found', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([
      makeExport({ name: 'a' }),
      makeExport({ name: 'b' }),
      makeExport({ name: 'c' }),
    ])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports).mockReturnValue(new Map())

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.unusedExports).toHaveLength(3)
  })

  it('returns empty unusedExports when all exports are used', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([
      makeExport({ name: 'used1' }),
      makeExport({ name: 'used2' }),
    ])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports).mockReturnValue(new Map([['used1', 1], ['used2', 2]]))

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.unusedExports).toHaveLength(0)
  })

  it('typeSummary starts at zero for all types', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports).mockReturnValue(new Map())

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.typeSummary).toEqual({
      class: 0,
      const: 0,
      function: 0,
      interface: 0,
      type: 0,
    })
  })

  it('sets isDefault flag from extracted exports', async () => {
    const { extractExports } = await import('../../src/commands/exports-helpers.js')
    const { Parser } = await import('../../src/core/parser.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
    instance.p.parser = parser as ExportsPrivate['parser']

    vi.mocked(extractExports).mockReturnValue([
      makeExport({ name: 'defaultExport', isDefault: true }),
      makeExport({ name: 'namedExport', isDefault: false }),
    ])
    const { extractImports } = await import('../../src/commands/exports-helpers.js')
    vi.mocked(extractImports).mockReturnValue(new Map())

    const result = await instance.p.collectExports(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      { text: '' },
      false,
    )

    expect(result.exports[0]!.isDefault).toBe(true)
    expect(result.exports[1]!.isDefault).toBe(false)
  })
})

// ─── getTypeColor ───

describe('getTypeColor', () => {
  it('returns a function for each known type', () => {
    const types = ['class', 'const', 'function', 'interface', 'type']
    for (const t of types) {
      const colorFn = getTypeColor(t)
      expect(typeof colorFn).toBe('function')
      expect(typeof colorFn(t)).toBe('string')
    }
  })

  it('returns chalk.white for unknown types', () => {
    const colorFn = getTypeColor('unknown')
    expect(typeof colorFn).toBe('function')
    expect(colorFn('test')).toBe('test')
  })
})

// ─── formatConsole ───

describe('formatConsole', () => {
  it('includes summary header', () => {
    const output = stripAnsi(
      formatConsole([], makeFormatOptions()),
    )
    expect(output).toContain('Export Analysis')
    expect(output).toContain('Total exports: 0')
    expect(output).toContain('Files analyzed: 1')
  })

  it('includes type breakdown in summary', () => {
    const output = stripAnsi(
      formatConsole([], makeFormatOptions({
        typeSummary: { class: 2, const: 3, function: 5, interface: 1, type: 4 },
      })),
    )
    expect(output).toContain('Functions: 5')
    expect(output).toContain('Classes: 2')
    expect(output).toContain('Interfaces: 1')
    expect(output).toContain('Types: 4')
    expect(output).toContain('Constants: 3')
  })

  it('lists each export with name and file', () => {
    const exports = [
      makeExport({ name: 'myFunc', type: 'function', file: 'src/utils.ts', line: 10 }),
    ]
    const output = stripAnsi(
      formatConsole(exports, makeFormatOptions()),
    )
    expect(output).toContain('myFunc')
    expect(output).toContain('src/utils.ts:10')
  })

  it('shows signature when present', () => {
    const exports = [
      makeExport({ name: 'add', signature: '(a: number, b: number) => number' }),
    ]
    const output = stripAnsi(
      formatConsole(exports, makeFormatOptions()),
    )
    expect(output).toContain('Signature: (a: number, b: number) => number')
  })

  it('shows default marker for default exports', () => {
    const exports = [
      makeExport({ name: 'App', isDefault: true }),
    ]
    const output = stripAnsi(
      formatConsole(exports, makeFormatOptions()),
    )
    expect(output).toContain('(default)')
  })

  it('shows usage count per export', () => {
    const exports = [
      makeExport({ name: 'used', usageCount: 5 }),
    ]
    const output = stripAnsi(
      formatConsole(exports, makeFormatOptions()),
    )
    expect(output).toContain('Usage count: 5')
  })

  it('shows unused warning marker when usageCount is 0', () => {
    const exports = [
      makeExport({ name: 'unused', usageCount: 0 }),
    ]
    const output = formatConsole(exports, makeFormatOptions())
    expect(stripAnsi(output)).toContain('⚠️')
  })

  it('shows unused exports section when showUnused is true', () => {
    const unused = [makeExport({ name: 'dead', type: 'function', file: 'a.ts', line: 5 })]
    const output = stripAnsi(
      formatConsole([], makeFormatOptions({
        showUnused: true,
        unusedExports: unused,
      })),
    )
    expect(output).toContain('Potentially Unused Exports')
    expect(output).toContain('dead')
    expect(output).toContain('a.ts:5')
  })

  it('hides unused section when showUnused is false', () => {
    const output = stripAnsi(
      formatConsole([], makeFormatOptions({
        showUnused: false,
        unusedExports: [makeExport({ name: 'dead' })],
      })),
    )
    expect(output).not.toContain('Potentially Unused Exports')
  })
})

// ─── formatJson ───

describe('formatJson', () => {
  it('returns valid JSON', () => {
    const result = formatJson([], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed).toBeDefined()
  })

  it('includes exports array', () => {
    const exports = [makeExport({ name: 'fn' })]
    const result = formatJson(exports, makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(1)
    expect(parsed.exports[0].name).toBe('fn')
  })

  it('includes summary with type breakdown', () => {
    const result = formatJson([], makeFormatOptions({
      totalFiles: 3,
      typeSummary: { class: 1, const: 2, function: 3, interface: 4, type: 5 },
    }))
    const parsed = JSON.parse(result)
    expect(parsed.summary.total).toBe(0)
    expect(parsed.summary.files).toBe(3)
    expect(parsed.summary.exportTypes.function).toBe(3)
  })

  it('includes unused count in summary', () => {
    const unused = [makeExport({ name: 'dead' })]
    const result = formatJson([], makeFormatOptions({ unusedExports: unused }))
    const parsed = JSON.parse(result)
    expect(parsed.summary.unused).toBe(1)
  })

  it('includes unusedExports array', () => {
    const unused = [makeExport({ name: 'dead' })]
    const result = formatJson([], makeFormatOptions({ unusedExports: unused }))
    const parsed = JSON.parse(result)
    expect(parsed.unusedExports).toHaveLength(1)
  })

  it('pretty-prints with 2-space indent', () => {
    const result = formatJson([], makeFormatOptions())
    expect(result).toContain('\n')
    expect(result).toContain('  ')
  })
})

// ─── formatMarkdown ───

describe('formatMarkdown', () => {
  it('includes markdown headers', () => {
    const result = formatMarkdown([], makeFormatOptions())
    expect(result).toContain('# Export Analysis')
    expect(result).toContain('## Summary')
  })

  it('includes total exports and files in summary', () => {
    const result = formatMarkdown([], makeFormatOptions({ totalFiles: 5 }))
    expect(result).toContain('**Total Exports:** 0')
    expect(result).toContain('**Files Analyzed:** 5')
  })

  it('includes type breakdown in markdown list', () => {
    const result = formatMarkdown([], makeFormatOptions({
      typeSummary: { class: 1, const: 2, function: 3, interface: 4, type: 5 },
    }))
    expect(result).toContain('**Functions:** 3')
    expect(result).toContain('**Classes:** 1')
  })

  it('lists each export as a markdown heading', () => {
    const exports = [makeExport({ name: 'myFunc', file: 'a.ts', line: 7 })]
    const result = formatMarkdown(exports, makeFormatOptions())
    expect(result).toContain('### myFunc')
    expect(result).toContain('**File:** a.ts:7')
    expect(result).toContain('**Type:** function')
  })

  it('shows signature in code backticks', () => {
    const exports = [makeExport({ name: 'fn', signature: '(x: number) => void' })]
    const result = formatMarkdown(exports, makeFormatOptions())
    expect(result).toContain('`(x: number) => void`')
  })

  it('shows default marker in heading', () => {
    const exports = [makeExport({ name: 'App', isDefault: true })]
    const result = formatMarkdown(exports, makeFormatOptions())
    expect(result).toContain('### App (default)')
  })

  it('shows used status per export', () => {
    const used = [makeExport({ name: 'used', usageCount: 3 })]
    const result = formatMarkdown(used, makeFormatOptions())
    expect(result).toContain('✓ Used')
  })

  it('shows potentially unused status', () => {
    const unused = [makeExport({ name: 'dead', usageCount: 0 })]
    const result = formatMarkdown(unused, makeFormatOptions())
    expect(result).toContain('⚠️ Potentially Unused')
  })

  it('shows unused exports section when showUnused is true', () => {
    const unused = [makeExport({ name: 'dead', type: 'const', file: 'b.ts', line: 12 })]
    const result = formatMarkdown([], makeFormatOptions({
      showUnused: true,
      unusedExports: unused,
    }))
    expect(result).toContain('## Potentially Unused Exports')
    expect(result).toContain('### dead')
    expect(result).toContain('b.ts:12')
  })

  it('hides unused section when showUnused is false', () => {
    const result = formatMarkdown([], makeFormatOptions({
      showUnused: false,
      unusedExports: [makeExport()],
    }))
    expect(result).not.toContain('Potentially Unused Exports')
  })
})

// ─── formatOutput ───

describe('formatOutput', () => {
  it('delegates to formatConsole for console format', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'console' }))
    expect(result).toContain('Export Analysis')
  })

  it('delegates to formatJson for json format', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed).toBeDefined()
  })

  it('delegates to formatMarkdown for markdown format', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('# Export Analysis')
  })
})
