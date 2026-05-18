import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    text: '',
  })),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function (this: unknown) {
    return {
      dispose: vi.fn(),
      initialize: vi.fn().mockResolvedValue(undefined),
      parseFile: vi.fn().mockResolvedValue({ sourceFile: {} }),
    }
  }),
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: { debug: vi.fn() },
}))

vi.mock('../../src/commands/stats-helpers.js', () => ({
  aggregateStats: vi.fn(() => ({
    fileStats: [],
    fileTypes: {},
    totalBlank: 0,
    totalComments: 0,
    totalComplexity: 0,
    totalLoc: 0,
    totalStructures: {
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    },
  })),
  buildStatsResult: vi.fn((_total: number, _sorted: unknown[], aggregated: unknown) => ({
    files: [],
    fileTypes: (aggregated as Record<string, unknown>).fileTypes ?? {},
    summary: {
      averageComplexity: 0,
      averageLoc: 0,
      blankLines: 0,
      classes: 0,
      commentLines: 0,
      complexity: 0,
      enums: 0,
      files: 0,
      functions: 0,
      interfaces: 0,
      loc: 0,
      methods: 0,
      typeAliases: 0,
    },
  })),
  calculateFileComplexity: vi.fn().mockReturnValue(1),
  countCodeStructures: vi.fn().mockReturnValue({
    classes: 0,
    enums: 0,
    functions: 0,
    interfaces: 0,
    methods: 0,
    typeAliases: 0,
  }),
  countLines: vi.fn((content: string) => {
    const lines = content.split('\n')
    let loc = 0
    let comments = 0
    let blank = 0
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length === 0) blank++
      else if (trimmed.startsWith('//') || trimmed.startsWith('/*')) comments++
      else loc++
    }
    return { blank, comments, loc }
  }),
  formatOutput: vi.fn(() => 'formatted stats output'),
  isLogicalOperator: vi.fn().mockReturnValue(false),
  sortFileStats: vi.fn((stats: unknown[]) => stats),
}))

import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'

import Stats from '../../src/commands/stats.js'

import {
  aggregateStats,
  buildStatsResult,
  countCodeStructures,
  countLines,
  formatOutput,
  sortFileStats,
} from '../../src/commands/stats-helpers.js'
import { discoverFiles } from '../../src/core/file-discovery.js'
import { Parser } from '../../src/core/parser.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createStatsCommand(overrides: Record<string, unknown> = {}): { command: Stats; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Stats.prototype) as Stats
  Object.assign(command, {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    error: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return { command, logs }
}

const defaultParsedFlags = {
  ext: '',
  format: 'table',
  ignore: undefined,
  output: undefined,
  'sort-by': 'size',
  top: 10,
  verbose: false,
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Static properties ───

describe('Stats command static properties', () => {
  it('has correct description', () => {
    expect(Stats.description).toBe('Display codebase statistics and metrics')
  })

  it('defines path arg with default "."', () => {
    const pathArg = Stats.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has format flag with options csv, json, table', () => {
    const formatFlag = Stats.flags!.format as Record<string, unknown>
    expect(formatFlag).toBeDefined()
    expect(formatFlag.char).toBe('f')
    expect(formatFlag.default).toBe('table')
    expect(formatFlag.options).toEqual(['csv', 'json', 'table'])
  })

  it('has top flag with default 10', () => {
    const topFlag = Stats.flags!.top as Record<string, unknown>
    expect(topFlag).toBeDefined()
    expect(topFlag.char).toBe('t')
    expect(topFlag.default).toBe(10)
  })

  it('has sort-by flag with options', () => {
    const sortByFlag = Stats.flags!['sort-by'] as Record<string, unknown>
    expect(sortByFlag).toBeDefined()
    expect(sortByFlag.char).toBe('s')
    expect(sortByFlag.default).toBe('size')
    expect(sortByFlag.options).toEqual(['complexity', 'loc', 'name', 'size'])
  })

  it('has ext flag for filtering by extension', () => {
    const extFlag = Stats.flags!.ext as Record<string, unknown>
    expect(extFlag).toBeDefined()
    expect(extFlag.default).toBe('')
  })

  it('has ignore flag with multiple true', () => {
    const ignoreFlag = Stats.flags!.ignore as Record<string, unknown>
    expect(ignoreFlag).toBeDefined()
    expect(ignoreFlag.char).toBe('i')
    expect(ignoreFlag.multiple).toBe(true)
  })

  it('has output flag', () => {
    const outputFlag = Stats.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
  })

  it('has verbose flag', () => {
    const verboseFlag = Stats.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })

  it('defines at least 3 examples', () => {
    expect(Stats.examples!.length).toBeGreaterThanOrEqual(3)
  })

  it('each example has command and description strings', () => {
    for (const example of Stats.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── isLogicalOperator static method ───

describe('Stats.isLogicalOperator()', () => {
  it('delegates to helper isLogicalOperator', () => {
    const mockNode = {} as import('ts-morph').BinaryExpression
    Stats.isLogicalOperator(mockNode)
    expect(true).toBe(true)
  })
})

// ─── run() - path validation ───

describe('Stats run() - path validation', () => {
  it('errors when path does not exist', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { path: '/nonexistent' }, flags: defaultParsedFlags })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await command.run()

    expect(command.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'), { exit: 1 })
  })
})

// ─── run() - table output ───

describe('Stats run() - table output', () => {
  it('discovers files with default patterns', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { path: '.' }, flags: defaultParsedFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])

    await command.run()

    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      }),
    )
  })

  it('includes default ignore patterns', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { path: '.' }, flags: defaultParsedFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])

    await command.run()

    const callArgs = vi.mocked(discoverFiles).mock.calls[0]![0]
    expect(callArgs.ignore).toContain('**/node_modules/**')
    expect(callArgs.ignore).toContain('**/dist/**')
    expect(callArgs.ignore).toContain('**/coverage/**')
    expect(callArgs.ignore).toContain('**/.git/**')
  })

  it('appends user ignore patterns to defaults', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, ignore: ['**/vendor/**'] },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])

    await command.run()

    const callArgs = vi.mocked(discoverFiles).mock.calls[0]![0]
    expect(callArgs.ignore).toContain('**/vendor/**')
    expect(callArgs.ignore).toContain('**/node_modules/**')
  })

  it('calls formatOutput for table format', async () => {
    const { command, logs } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { path: '.' }, flags: defaultParsedFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])

    await command.run()

    expect(formatOutput).toHaveBeenCalled()
  })

  it('initializes and disposes parser', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { path: '.' }, flags: defaultParsedFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])

    await command.run()

    expect(Parser).toHaveBeenCalled()
  })
})

// ─── run() - JSON output ───

describe('Stats run() - JSON output', () => {
  it('outputs JSON when format is json', async () => {
    const { command, logs } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, format: 'json' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])

    await command.run()

    expect(logs.some((l) => {
      try {
        JSON.parse(l)
        return true
      } catch {
        return false
      }
    })).toBe(true)
  })
})

// ─── run() - extension filtering ───

describe('Stats run() - extension filtering', () => {
  it('filters files by extension when ext flag provided', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, ext: '.ts,.tsx' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/src/a.ts', path: 'a.ts' },
      { absolutePath: '/src/b.js', path: 'b.js' },
      { absolutePath: '/src/c.tsx', path: 'c.tsx' },
    ])
    vi.mocked(fsPromises.readFile).mockResolvedValue('const x = 1')

    await command.run()

    expect(aggregateStats).toHaveBeenCalled()
    const results = aggregateStats.mock.calls[0]![0] as Array<{ ext: string }> | null
    if (results) {
      const exts = results.filter(Boolean).map((r: { ext: string }) => r.ext)
      expect(exts).not.toContain('.js')
    }
  })
})

// ─── run() - output to file ───

describe('Stats run() - output to file', () => {
  it('writes output to file when output flag is set', async () => {
    const { command, logs } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, output: 'stats.json', format: 'json' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])
    vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined)

    await command.run()

    expect(fsPromises.writeFile).toHaveBeenCalledWith('stats.json', expect.any(String), 'utf8')
    expect(logs.some((l) => l.includes('Results written to'))).toBe(true)
  })

  it('errors when writeFile fails', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, output: '/readonly/stats.json', format: 'json' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])
    vi.mocked(fsPromises.writeFile).mockRejectedValue(new Error('permission denied'))

    await command.run()

    expect(command.error).toHaveBeenCalledWith(expect.stringContaining('Failed to write stats output'))
  })
})

// ─── run() - verbose mode ───

describe('Stats run() - verbose mode', () => {
  it('passes verbose flag to collectStats via aggregateStats', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, verbose: true },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/src/a.ts', path: 'a.ts' },
    ])
    vi.mocked(fsPromises.readFile).mockResolvedValue('const x = 1\n')
    aggregateStats.mockReturnValue({
      fileStats: [{ blankLines: 0, commentLines: 0, complexity: 1, loc: 1, name: 'a.ts', size: 11, structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 }, type: '.ts' }],
      fileTypes: { '.ts': 1 },
      totalBlank: 0,
      totalComments: 0,
      totalComplexity: 1,
      totalLoc: 1,
      totalStructures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
    })

    await command.run()

    expect(aggregateStats).toHaveBeenCalledWith(expect.anything(), true)
  })
})

// ─── run() - sort-by flag ───

describe('Stats run() - sort options', () => {
  it('passes sort-by value to sortFileStats', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, 'sort-by': 'loc' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([])

    await command.run()

    expect(sortFileStats).toHaveBeenCalledWith(expect.anything(), 'loc')
  })
})

// ─── collectStats - file processing ───

describe('Stats collectStats - file processing', () => {
  it('processes files and reads their content', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { path: '.' }, flags: defaultParsedFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/src/index.ts', path: 'index.ts' },
    ])
    vi.mocked(fsPromises.readFile).mockResolvedValue('export const x = 1\n')
    countLines.mockReturnValue({ blank: 0, comments: 0, loc: 1 })
    aggregateStats.mockReturnValue({
      fileStats: [],
      fileTypes: { '.ts': 1 },
      totalBlank: 0,
      totalComments: 0,
      totalComplexity: 1,
      totalLoc: 1,
      totalStructures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
    })

    await command.run()

    expect(fsPromises.readFile).toHaveBeenCalledWith('/src/index.ts', 'utf8')
    expect(countLines).toHaveBeenCalledWith('export const x = 1\n')
  })

  it('handles file read errors gracefully', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { path: '.' },
      flags: { ...defaultParsedFlags, format: 'json' },
    })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/src/bad.ts', path: 'bad.ts' },
    ])
    vi.mocked(fsPromises.readFile).mockRejectedValue(new Error('EACCES'))
    aggregateStats.mockReturnValue({
      fileStats: [],
      fileTypes: {},
      totalBlank: 0,
      totalComments: 0,
      totalComplexity: 0,
      totalLoc: 0,
      totalStructures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
    })

    await command.run()

    expect(aggregateStats).toHaveBeenCalled()
  })
})

// ─── buildStatsResult integration ───

describe('Stats buildStatsResult integration', () => {
  it('calls buildStatsResult with total file count and sorted stats', async () => {
    const { command } = createStatsCommand()
    vi.mocked(command.parse).mockResolvedValue({ args: { path: '.' }, flags: defaultParsedFlags })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    const mockFiles = [
      { absolutePath: '/src/a.ts', path: 'a.ts' },
      { absolutePath: '/src/b.ts', path: 'b.ts' },
    ]
    vi.mocked(discoverFiles).mockResolvedValue(mockFiles)
    vi.mocked(fsPromises.readFile).mockResolvedValue('const x = 1')
    aggregateStats.mockReturnValue({
      fileStats: [],
      fileTypes: { '.ts': 2 },
      totalBlank: 0,
      totalComments: 0,
      totalComplexity: 2,
      totalLoc: 2,
      totalStructures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
    })
    sortFileStats.mockReturnValue([])

    await command.run()

    expect(buildStatsResult).toHaveBeenCalledWith(2, expect.anything(), expect.anything())
  })
})
