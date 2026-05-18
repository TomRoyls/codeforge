import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', () => ({
  access: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}))

vi.mock('../../src/commands/ignore-helpers.js', () => ({
  addPatternToContent: vi.fn((content: string, pattern: string) =>
    content.trim() === '' ? pattern : `${content}\n${pattern}`,
  ),
  extractPatterns: vi.fn((content: string) =>
    content
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l !== '' && !l.startsWith('#')),
  ),
  formatAddResult: vi.fn((_pattern: string, _filePath: string, logFn: (msg: string) => void) => {
    logFn(`✓ Added pattern "${_pattern}" to ${_filePath}`)
  }),
  formatDuplicateWarning: vi.fn((_pattern: string, logFn: (msg: string) => void) => {
    logFn(`Pattern "${_pattern}" already exists in ignore file`)
  }),
  formatNoFileMessage: vi.fn((_filePath: string, logFn: (msg: string) => void) => {
    logFn(`No ignore file found at ${_filePath}`)
  }),
  formatPatternList: vi.fn((patterns: string[], _filePath: string, logFn: (msg: string) => void) => {
    logFn('Ignore Patterns')
    for (const p of patterns) {
      logFn(`  ${p}`)
    }
    logFn(`${patterns.length} patterns found`)
  }),
  formatRemoveResult: vi.fn((_pattern: string, _filePath: string, logFn: (msg: string) => void) => {
    logFn(`✓ Removed pattern "${_pattern}" from ${_filePath}`)
  }),
  isDuplicatePattern: vi.fn((lines: string[], pattern: string) =>
    lines.some((l: string) => l.trim() === pattern.trim()),
  ),
  removePatternFromContent: vi.fn((content: string, pattern: string) => {
    const lines = content.split('\n')
    const idx = lines.findIndex((l: string) => l.trim() === pattern.trim())
    if (idx === -1) return { content, found: false }
    lines.splice(idx, 1)
    return { content: lines.join('\n'), found: true }
  }),
  resolveIgnoreOptions: vi.fn(
    (args: Record<string, unknown>, flags: Record<string, unknown>) => ({
      action: args.action as string,
      file: flags.file as string,
      pattern: args.pattern as string | undefined,
    }),
  ),
}))

import * as fs from 'node:fs/promises'

import Ignore from '../../src/commands/ignore.js'

import {
  addPatternToContent,
  formatAddResult,
  formatDuplicateWarning,
  formatNoFileMessage,
  formatPatternList,
  formatRemoveResult,
  isDuplicatePattern,
  removePatternFromContent,
  resolveIgnoreOptions,
} from '../../src/commands/ignore-helpers.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createIgnoreCommand(overrides: Record<string, unknown> = {}): { command: Ignore; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Ignore.prototype) as Ignore
  Object.assign(command, {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    error: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return { command, logs }
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Static properties ───

describe('Ignore command static properties', () => {
  it('has correct description', () => {
    expect(Ignore.description).toBe('Manage ignore patterns for CodeForge analysis')
  })

  it('defines action arg with options and default list', () => {
    const actionArg = Ignore.args!.action as Record<string, unknown>
    expect(actionArg).toBeDefined()
    expect(actionArg.default).toBe('list')
    expect(actionArg.options).toEqual(['add', 'list', 'remove'])
  })

  it('defines pattern arg as optional string', () => {
    const patternArg = Ignore.args!.pattern as Record<string, unknown>
    expect(patternArg).toBeDefined()
    expect(patternArg.required).toBe(false)
  })

  it('has file flag with char f and default .codeforgeignore', () => {
    const fileFlag = Ignore.flags!.file as Record<string, unknown>
    expect(fileFlag).toBeDefined()
    expect(fileFlag.char).toBe('f')
    expect(fileFlag.default).toBe('.codeforgeignore')
  })

  it('defines at least 3 examples', () => {
    expect(Ignore.examples!.length).toBeGreaterThanOrEqual(3)
  })

  it('each example has command and description strings', () => {
    for (const example of Ignore.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── run() - list action (default) ───

describe('Ignore run() - list action', () => {
  it('calls resolveIgnoreOptions with parsed args and flags', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'list' },
      flags: { file: '.codeforgeignore' },
    })

    await command.run()

    expect(resolveIgnoreOptions).toHaveBeenCalledWith(
      { action: 'list' },
      { file: '.codeforgeignore' },
    )
  })

  it('shows no file message when file does not exist', async () => {
    const { command, logs } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'list' },
      flags: { file: '.codeforgeignore' },
    })
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))

    await command.run()

    expect(formatNoFileMessage).toHaveBeenCalledWith(
      '.codeforgeignore',
      expect.any(Function),
    )
  })

  it('lists patterns when file exists', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'list' },
      flags: { file: '.codeforgeignore' },
    })
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('node_modules/**\ndist/**')

    await command.run()

    expect(formatPatternList).toHaveBeenCalledWith(
      ['node_modules/**', 'dist/**'],
      '.codeforgeignore',
      expect.any(Function),
    )
  })

  it('defaults to list when no action provided', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'list' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'list', file: '.codeforgeignore' })
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))

    await command.run()

    expect(formatNoFileMessage).toHaveBeenCalled()
  })
})

// ─── run() - add action ───

describe('Ignore run() - add action', () => {
  it('errors when pattern is missing for add', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'add' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'add', file: '.codeforgeignore' })

    await command.run()

    expect(command.error).toHaveBeenCalledWith(expect.stringContaining('Pattern is required'))
  })

  it('adds a new pattern to empty file', async () => {
    const { command, logs } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'add', pattern: 'node_modules/**' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'add', file: '.codeforgeignore', pattern: 'node_modules/**' })
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.readFile).mockResolvedValue('')
    isDuplicatePattern.mockReturnValue(false)

    await command.run()

    expect(addPatternToContent).toHaveBeenCalledWith('', 'node_modules/**')
    expect(fs.writeFile).toHaveBeenCalledWith('.codeforgeignore', 'node_modules/**', 'utf8')
    expect(formatAddResult).toHaveBeenCalledWith('node_modules/**', '.codeforgeignore', expect.any(Function))
  })

  it('warns when adding a duplicate pattern', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'add', pattern: 'dist/**' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'add', file: '.codeforgeignore', pattern: 'dist/**' })
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('dist/**')
    isDuplicatePattern.mockReturnValue(true)

    await command.run()

    expect(formatDuplicateWarning).toHaveBeenCalledWith('dist/**', expect.any(Function))
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  it('adds pattern to existing content', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'add', pattern: 'coverage/**' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'add', file: '.codeforgeignore', pattern: 'coverage/**' })
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('node_modules/**\ndist/**')
    isDuplicatePattern.mockReturnValue(false)
    addPatternToContent.mockReturnValue('node_modules/**\ndist/**\ncoverage/**')

    await command.run()

    expect(fs.writeFile).toHaveBeenCalledWith('.codeforgeignore', 'node_modules/**\ndist/**\ncoverage/**', 'utf8')
  })

  it('handles write error during add', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'add', pattern: 'test/**' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'add', file: '.codeforgeignore', pattern: 'test/**' })
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('')
    isDuplicatePattern.mockReturnValue(false)
    vi.mocked(fs.writeFile).mockRejectedValue(new Error('disk full'))

    await command.run()

    expect(command.error).toHaveBeenCalledWith(expect.stringContaining('Failed to add pattern'))
  })
})

// ─── run() - remove action ───

describe('Ignore run() - remove action', () => {
  it('errors when pattern is missing for remove', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'remove' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'remove', file: '.codeforgeignore' })

    await command.run()

    expect(command.error).toHaveBeenCalledWith(expect.stringContaining('Pattern is required'))
  })

  it('removes an existing pattern', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'remove', pattern: 'dist/**' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'remove', file: '.codeforgeignore', pattern: 'dist/**' })
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('node_modules/**\ndist/**')
    removePatternFromContent.mockReturnValue({ content: 'node_modules/**', found: true })
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    await command.run()

    expect(removePatternFromContent).toHaveBeenCalledWith('node_modules/**\ndist/**', 'dist/**')
    expect(fs.writeFile).toHaveBeenCalledWith('.codeforgeignore', 'node_modules/**', 'utf8')
    expect(formatRemoveResult).toHaveBeenCalledWith('dist/**', '.codeforgeignore', expect.any(Function))
  })

  it('errors when pattern not found in file', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'remove', pattern: 'nonexistent/**' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'remove', file: '.codeforgeignore', pattern: 'nonexistent/**' })
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('node_modules/**')
    removePatternFromContent.mockReturnValue({ content: 'node_modules/**', found: false })

    await command.run()

    expect(command.error).toHaveBeenCalledWith(expect.stringContaining('not found'))
  })

  it('errors when file is empty or missing', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'remove', pattern: 'anything/**' },
      flags: { file: '.codeforgeignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'remove', file: '.codeforgeignore', pattern: 'anything/**' })
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.readFile).mockResolvedValue('')

    await command.run()

    expect(command.error).toHaveBeenCalledWith(expect.stringContaining('not found'))
  })
})

// ─── Custom file flag ───

describe('Ignore run() - custom file flag', () => {
  it('uses custom file path from --file flag', async () => {
    const { command } = createIgnoreCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'list' },
      flags: { file: '.customignore' },
    })
    resolveIgnoreOptions.mockReturnValue({ action: 'list', file: '.customignore' })
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))

    await command.run()

    expect(formatNoFileMessage).toHaveBeenCalledWith('.customignore', expect.any(Function))
  })
})
