import { afterEach, describe, expect, it, vi } from 'vitest'

const mockExistsSync = vi.fn().mockReturnValue(false)
const mockMkdir = vi.fn().mockResolvedValue(undefined)
const mockWriteFile = vi.fn().mockResolvedValue(undefined)

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}))

vi.mock('node:fs/promises', () => ({
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}))

vi.mock('../../src/commands/danger-helpers.js', () => ({
  DEFAULT_CI_COMMAND: 'codeforge analyze --format json --output codeforge-results.json',
  DEFAULT_OUTPUT_FILE: 'dangerfile.js',
  DEFAULT_RESULTS_FILE: 'codeforge-results.json',
  displayDangerNextSteps: vi.fn(),
  generateDangerfileContent: vi.fn(
    (options: Record<string, string>) =>
      `// Generated Dangerfile\nciCommand: ${options.ciCommand}\noutputFile: ${options.outputFile}\n`,
  ),
  resolveDangerOptions: vi.fn(
    (flags: Record<string, unknown>) => ({
      ciCommand: (flags['ci-command'] as string) ?? 'codeforge analyze --format json --output codeforge-results.json',
      outputFile: (flags.output as string) ?? 'dangerfile.js',
      resultsFile: 'codeforge-results.json',
    }),
  ),
  validateDangerOutputPath: vi.fn(
    (path: string) => {
      if (!path || path.trim().length === 0) return { error: 'Output path cannot be empty.', valid: false }
      const basename = path.split('/').pop() ?? ''
      if (!basename.endsWith('.js') && !basename.endsWith('.ts'))
        return { error: `Output file must be a .js or .ts file: ${path}`, valid: false }
      return { valid: true }
    },
  ),
}))

import Danger from '../../src/commands/danger.js'

import {
  displayDangerNextSteps,
  generateDangerfileContent,
  resolveDangerOptions,
  validateDangerOutputPath,
} from '../../src/commands/danger-helpers.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createDangerCommand(overrides: Record<string, unknown> = {}): { command: Danger; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Danger.prototype) as Danger
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
  mockExistsSync.mockReturnValue(false)
})

// ─── Static properties ───

describe('Danger command static properties', () => {
  it('has correct description', () => {
    expect(Danger.description).toBe('Generate a Dangerfile for Danger.js integration')
  })

  it('has force flag with char f defaulting to false', () => {
    const forceFlag = Danger.flags!.force as Record<string, unknown>
    expect(forceFlag).toBeDefined()
    expect(forceFlag.char).toBe('f')
    expect(forceFlag.default).toBe(false)
  })

  it('has output flag with char o defaulting to dangerfile.js', () => {
    const outputFlag = Danger.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
    expect(outputFlag.default).toBe('dangerfile.js')
  })

  it('has ci-command flag with char c', () => {
    const ciCommandFlag = Danger.flags!['ci-command'] as Record<string, unknown>
    expect(ciCommandFlag).toBeDefined()
    expect(ciCommandFlag.char).toBe('c')
    expect(ciCommandFlag.default).toContain('codeforge analyze')
  })

  it('defines at least 2 examples', () => {
    expect(Danger.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Danger.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── generateDangerfileContent delegation ───

describe('Danger.generateDangerfileContent()', () => {
  it('delegates to helper generateDangerfileContent', () => {
    const { command } = createDangerCommand()
    const options = { ciCommand: 'test cmd', outputFile: 'out.js', resultsFile: 'res.json' }
    command.generateDangerfileContent(options)
    expect(generateDangerfileContent).toHaveBeenCalledWith(options)
  })

  it('returns generated content string', () => {
    const { command } = createDangerCommand()
    const options = { ciCommand: 'test cmd', outputFile: 'out.js', resultsFile: 'res.json' }
    const result = command.generateDangerfileContent(options)
    expect(typeof result).toBe('string')
    expect(result).toContain('Generated Dangerfile')
  })
})

// ─── run() - success path ───

describe('Danger run() - success', () => {
  it('calls resolveDangerOptions with parsed flags', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })

    await command.run()

    expect(resolveDangerOptions).toHaveBeenCalledWith({ force: false, output: 'dangerfile.js' })
  })

  it('calls validateDangerOutputPath with resolved output', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })

    await command.run()

    expect(validateDangerOutputPath).toHaveBeenCalledWith('dangerfile.js')
  })

  it('writes generated content to file', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })

    await command.run()

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('dangerfile.js'),
      expect.any(String),
      'utf8',
    )
  })

  it('creates parent directory before writing', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'sub/dir/dangerfile.js' },
    })

    await command.run()

    expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining('sub/dir'), { recursive: true })
  })

  it('logs success message with output filename', async () => {
    const { command, logs } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })

    await command.run()

    const plain = logs.map(stripAnsi).join(' ')
    expect(plain).toContain('Created dangerfile.js')
  })

  it('calls displayDangerNextSteps', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })

    await command.run()

    expect(displayDangerNextSteps).toHaveBeenCalledWith(expect.any(Function))
  })
})

// ─── run() - validation failure ───

describe('Danger run() - validation failure', () => {
  it('errors on empty output path', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: '' },
    })

    await command.run()

    expect(command.error).toHaveBeenCalled()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('empty')
  })

  it('errors on non-js/ts extension', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.py' },
    })

    await command.run()

    expect(command.error).toHaveBeenCalled()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('.js or .ts')
  })
})

// ─── run() - file already exists ───

describe('Danger run() - file exists', () => {
  it('errors when file exists without --force', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    expect(command.error).toHaveBeenCalled()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('already exists')
    expect(errorMsg).toContain('--force')
  })

  it('overwrites when file exists with --force', async () => {
    const { command, logs } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: true, output: 'dangerfile.js' },
    })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    expect(mockWriteFile).toHaveBeenCalled()
    const plain = logs.map(stripAnsi).join(' ')
    expect(plain).toContain('Created dangerfile.js')
  })
})

// ─── run() - write failure ───

describe('Danger run() - write failure', () => {
  it('errors when writeFile throws', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })
    mockWriteFile.mockRejectedValue(new Error('disk full'))

    await command.run()

    expect(command.error).toHaveBeenCalled()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('Failed to write')
    expect(errorMsg).toContain('disk full')
  })

  it('handles non-Error thrown values', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })
    mockWriteFile.mockRejectedValue('string error')

    await command.run()

    expect(command.error).toHaveBeenCalled()
    const errorMsg = (command.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(errorMsg).toContain('string error')
  })
})

// ─── run() - custom ci-command ───

describe('Danger run() - custom ci-command', () => {
  it('passes custom ci-command through to options', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js', 'ci-command': 'custom analyze cmd' },
    })

    await command.run()

    expect(resolveDangerOptions).toHaveBeenCalledWith(
      expect.objectContaining({ 'ci-command': 'custom analyze cmd' }),
    )
  })

  it('uses default ci-command when not specified', async () => {
    const { command } = createDangerCommand()
    vi.mocked(command.parse).mockResolvedValue({
      flags: { force: false, output: 'dangerfile.js' },
    })

    await command.run()

    const resolvedOptions = resolveDangerOptions.mock.results[0]!.value
    expect(resolvedOptions.ciCommand).toContain('codeforge analyze')
  })
})
