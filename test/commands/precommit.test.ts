import { afterEach, describe, expect, it, vi } from 'vitest'

const mockExistsSync = vi.fn().mockReturnValue(false)

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  chmod: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/commands/precommit-helpers.js', () => ({
  DEFAULT_COMMAND: 'codeforge analyze --staged',
  displayPostInstallMessage: vi.fn(),
  generateHookContent: vi.fn(() => '#!/usr/bin/env sh\necho test\n'),
  generatePrecommitFrameworkConfig: vi.fn(() => 'repos:\n  - repo: local\n'),
  getGitHookPath: vi.fn(() => '/project/.git/hooks/pre-commit'),
  getHookDir: vi.fn(() => '/project/.git/hooks'),
  getHuskyHookPath: vi.fn(() => '/project/.husky/pre-commit'),
  getPrecommitFrameworkConfigPath: vi.fn(() => '/project/.pre-commit-config.yaml'),
  isGitRepository: vi.fn(() => true),
  resolvePrecommitOptions: vi.fn((flags: Record<string, unknown>) => ({
    command: (flags.command as string) ?? 'codeforge analyze --staged',
    force: (flags.force as boolean) ?? false,
    installer: (flags.installer as string) ?? 'git',
  })),
}))

import * as fs from 'node:fs/promises'

import Precommit from '../../src/commands/precommit.js'

import {
  displayPostInstallMessage,
  generateHookContent,
  generatePrecommitFrameworkConfig,
  getGitHookPath,
  getHookDir,
  getHuskyHookPath,
  getPrecommitFrameworkConfigPath,
  isGitRepository,
  resolvePrecommitOptions,
} from '../../src/commands/precommit-helpers.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createPrecommitCommand(overrides: Record<string, unknown> = {}): { command: Precommit; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Precommit.prototype) as Precommit
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

describe('Precommit command static properties', () => {
  it('has correct description', () => {
    expect(Precommit.description).toBe('Set up git pre-commit hooks to run CodeForge')
  })

  it('has command flag with char c', () => {
    const commandFlag = Precommit.flags!.command as Record<string, unknown>
    expect(commandFlag).toBeDefined()
    expect(commandFlag.char).toBe('c')
  })

  it('has force flag with char f', () => {
    const forceFlag = Precommit.flags!.force as Record<string, unknown>
    expect(forceFlag).toBeDefined()
    expect(forceFlag.char).toBe('f')
    expect(forceFlag.default).toBe(false)
  })

  it('has installer flag with options', () => {
    const installerFlag = Precommit.flags!.installer as Record<string, unknown>
    expect(installerFlag).toBeDefined()
    expect(installerFlag.options).toEqual(['git', 'husky', 'pre-commit-framework'])
  })

  it('defines at least 2 examples', () => {
    expect(Precommit.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Precommit.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── Delegate methods ───

describe('Precommit delegate methods', () => {
  it('generateHookContent delegates to helper', () => {
    const { command } = createPrecommitCommand()
    const opts = { command: 'npm test', force: false, installer: 'git' as const }
    command.generateHookContent(opts)
    expect(generateHookContent).toHaveBeenCalledWith(opts)
  })

  it('getGitHookPath delegates to helper', () => {
    const { command } = createPrecommitCommand()
    command.getGitHookPath()
    expect(getGitHookPath).toHaveBeenCalledWith(process.cwd())
  })

  it('getHuskyHookPath delegates to helper', () => {
    const { command } = createPrecommitCommand()
    command.getHuskyHookPath()
    expect(getHuskyHookPath).toHaveBeenCalledWith(process.cwd())
  })

  it('getPrecommitFrameworkConfigPath delegates to helper', () => {
    const { command } = createPrecommitCommand()
    command.getPrecommitFrameworkConfigPath()
    expect(getPrecommitFrameworkConfigPath).toHaveBeenCalledWith(process.cwd())
  })

  it('isGitRepository delegates to helper', () => {
    mockExistsSync.mockReturnValue(true)
    const { command } = createPrecommitCommand()
    command.isGitRepository()
    expect(isGitRepository).toHaveBeenCalledWith(process.cwd(), expect.any(Function))
  })
})

// ─── run() - not a git repository ───

describe('Precommit run() - not a git repo', () => {
  it('errors when not in a git repository', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: {} })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'git' })
    isGitRepository.mockReturnValue(false)

    await command.run()

    expect(command.error).toHaveBeenCalledWith(
      expect.stringContaining('Not a git repository'),
    )
  })
})

// ─── run() - hook already exists ───

describe('Precommit run() - hook exists', () => {
  beforeEach(() => {
    isGitRepository.mockReturnValue(true)
  })

  it('errors when hook exists without --force', async () => {
    mockExistsSync.mockReturnValue(true)
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: {} })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'git' })
    getGitHookPath.mockReturnValue('/project/.git/hooks/pre-commit')

    await command.run()

    expect(command.error).toHaveBeenCalledWith(
      expect.stringContaining('already exists'),
    )
  })

  it('overwrites when hook exists with --force', async () => {
    mockExistsSync.mockReturnValue(true)
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { force: true } })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: true, installer: 'git' })
    getGitHookPath.mockReturnValue('/project/.git/hooks/pre-commit')

    await command.run()

    expect(fs.writeFile).toHaveBeenCalled()
    expect(command.error).not.toHaveBeenCalled()
  })
})

// ─── run() - git installer ───

describe('Precommit run() - git installer', () => {
  beforeEach(() => {
    isGitRepository.mockReturnValue(true)
    mockExistsSync.mockReturnValue(false)
  })

  it('writes hook to .git/hooks/pre-commit', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: {} })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'git' })
    getGitHookPath.mockReturnValue('/project/.git/hooks/pre-commit')

    await command.run()

    expect(fs.writeFile).toHaveBeenCalledWith(
      '/project/.git/hooks/pre-commit',
      expect.any(String),
      'utf8',
    )
  })

  it('makes hook executable with chmod', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: {} })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'git' })
    getGitHookPath.mockReturnValue('/project/.git/hooks/pre-commit')

    await command.run()

    expect(fs.chmod).toHaveBeenCalledWith('/project/.git/hooks/pre-commit', 0o755)
  })

  it('creates hook directory with mkdir', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: {} })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'git' })
    getHookDir.mockReturnValue('/project/.git/hooks')

    await command.run()

    expect(fs.mkdir).toHaveBeenCalledWith('/project/.git/hooks', { recursive: true })
  })
})

// ─── run() - husky installer ───

describe('Precommit run() - husky installer', () => {
  beforeEach(() => {
    isGitRepository.mockReturnValue(true)
    mockExistsSync.mockReturnValue(false)
  })

  it('writes hook to .husky/pre-commit', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { installer: 'husky' } })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'husky' })
    getHuskyHookPath.mockReturnValue('/project/.husky/pre-commit')

    await command.run()

    expect(fs.writeFile).toHaveBeenCalledWith(
      '/project/.husky/pre-commit',
      expect.any(String),
      'utf8',
    )
  })

  it('makes husky hook executable', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { installer: 'husky' } })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'husky' })
    getHuskyHookPath.mockReturnValue('/project/.husky/pre-commit')

    await command.run()

    expect(fs.chmod).toHaveBeenCalled()
  })
})

// ─── run() - pre-commit-framework installer ───

describe('Precommit run() - pre-commit-framework installer', () => {
  beforeEach(() => {
    isGitRepository.mockReturnValue(true)
    mockExistsSync.mockReturnValue(false)
  })

  it('writes yaml config using generatePrecommitFrameworkConfig', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { installer: 'pre-commit-framework' } })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'pre-commit-framework' })
    getPrecommitFrameworkConfigPath.mockReturnValue('/project/.pre-commit-config.yaml')

    await command.run()

    expect(generatePrecommitFrameworkConfig).toHaveBeenCalled()
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/project/.pre-commit-config.yaml',
      expect.any(String),
      'utf8',
    )
  })

  it('does not chmod for pre-commit-framework', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { installer: 'pre-commit-framework' } })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'pre-commit-framework' })
    getPrecommitFrameworkConfigPath.mockReturnValue('/project/.pre-commit-config.yaml')

    await command.run()

    expect(fs.chmod).not.toHaveBeenCalled()
  })
})

// ─── run() - custom command ───

describe('Precommit run() - custom command', () => {
  beforeEach(() => {
    isGitRepository.mockReturnValue(true)
    mockExistsSync.mockReturnValue(false)
  })

  it('passes custom command to hook content', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { command: 'npm test' } })
    resolvePrecommitOptions.mockReturnValue({ command: 'npm test', force: false, installer: 'git' })
    getGitHookPath.mockReturnValue('/project/.git/hooks/pre-commit')

    await command.run()

    expect(generateHookContent).toHaveBeenCalledWith(
      expect.objectContaining({ command: 'npm test' }),
    )
  })
})

// ─── run() - post-install message ───

describe('Precommit run() - post-install message', () => {
  beforeEach(() => {
    isGitRepository.mockReturnValue(true)
    mockExistsSync.mockReturnValue(false)
  })

  it('calls displayPostInstallMessage after successful write', async () => {
    const { command, logs } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: {} })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'git' })
    getGitHookPath.mockReturnValue('/project/.git/hooks/pre-commit')

    await command.run()

    expect(displayPostInstallMessage).toHaveBeenCalledWith(
      { command: 'codeforge analyze --staged', force: false, installer: 'git' },
      '/project/.git/hooks/pre-commit',
      expect.any(Function),
    )
  })
})

// ─── run() - write failure ───

describe('Precommit run() - write failure', () => {
  beforeEach(() => {
    isGitRepository.mockReturnValue(true)
    mockExistsSync.mockReturnValue(false)
  })

  it('calls error when writeFile throws', async () => {
    const { command } = createPrecommitCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: {} })
    resolvePrecommitOptions.mockReturnValue({ command: 'codeforge analyze --staged', force: false, installer: 'git' })
    getGitHookPath.mockReturnValue('/project/.git/hooks/pre-commit')
    vi.mocked(fs.writeFile).mockRejectedValue(new Error('permission denied'))

    await command.run()

    expect(command.error).toHaveBeenCalledWith(
      expect.stringContaining('permission denied'),
    )
  })
})
