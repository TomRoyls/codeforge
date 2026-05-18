import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/commands/ci-helpers.js', () => ({
  displayNextSteps: vi.fn(),
  generateGitHubActionsContent: vi.fn().mockReturnValue('github-actions-yaml'),
  generateGitLabCiContent: vi.fn().mockReturnValue('gitlab-ci-yaml'),
  resolveCiOptions: vi.fn(),
  validateOutputDir: vi.fn().mockReturnValue({ valid: true }),
}))

import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'

import Ci from '../../src/commands/ci.js'

import {
  displayNextSteps,
  generateGitHubActionsContent,
  generateGitLabCiContent,
  resolveCiOptions,
  validateOutputDir,
} from '../../src/commands/ci-helpers.js'
import type { CiOptions } from '../../src/commands/ci-helpers.js'

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createMockCommand(overrides: Record<string, unknown> = {}): Ci {
  const cmd = Object.create(Ci.prototype) as Ci
  Object.assign(cmd, {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return cmd
}

const defaultOptions: CiOptions = {
  force: false,
  output: '.',
  platform: 'all',
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Command metadata ───

describe('Ci command metadata', () => {
  it('has a description', () => {
    expect(Ci.description).toBeTruthy()
    expect(Ci.description).toContain('CI/CD')
  })

  it('defines examples', () => {
    expect(Ci.examples).toBeDefined()
    expect(Ci.examples.length).toBeGreaterThan(0)
  })

  it('defines force flag with short char', () => {
    expect(Ci.flags.force).toBeDefined()
    expect(Ci.flags.force.char).toBe('f')
  })

  it('defines output flag with short char', () => {
    expect(Ci.flags.output).toBeDefined()
    expect(Ci.flags.output.char).toBe('o')
  })

  it('defines platform flag with short char and options', () => {
    expect(Ci.flags.platform).toBeDefined()
    expect(Ci.flags.platform.char).toBe('p')
    expect(Ci.flags.platform.options).toEqual(['github', 'gitlab', 'all'])
  })
})

// ─── generateGitHubActionsContent delegation ───

describe('generateGitHubActionsContent', () => {
  it('delegates to helper function', () => {
    const cmd = createMockCommand()
    const result = cmd.generateGitHubActionsContent()
    expect(generateGitHubActionsContent).toHaveBeenCalled()
    expect(result).toBe('github-actions-yaml')
  })
})

// ─── generateGitLabCiContent delegation ───

describe('generateGitLabCiContent', () => {
  it('delegates to helper function', () => {
    const cmd = createMockCommand()
    const result = cmd.generateGitLabCiContent()
    expect(generateGitLabCiContent).toHaveBeenCalled()
    expect(result).toBe('gitlab-ci-yaml')
  })
})

// ─── run() - platform=all generates both files ───

describe('run() with platform=all', () => {
  it('generates both GitHub Actions and GitLab CI files', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'all', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue(defaultOptions)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledTimes(2)
    const writePaths = vi.mocked(fsPromises.writeFile).mock.calls.map((c) => c[0] as string)
    expect(writePaths.some((p) => p.includes('codeforge.yml'))).toBe(true)
    expect(writePaths.some((p) => p.includes('.gitlab-ci.yml'))).toBe(true)
  })

  it('logs success messages for both files', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'all', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue(defaultOptions)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => stripAnsi(c[0]))
    expect(logCalls.some((m) => m.includes('codeforge.yml'))).toBe(true)
    expect(logCalls.some((m) => m.includes('.gitlab-ci.yml'))).toBe(true)
  })
})

// ─── run() - platform=github generates only GitHub Actions ───

describe('run() with platform=github', () => {
  it('generates only GitHub Actions workflow', async () => {
    const cmd = createMockCommand()
    const githubOptions: CiOptions = { force: false, output: '.', platform: 'github' }
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue(githubOptions)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledTimes(1)
    const writePath = vi.mocked(fsPromises.writeFile).mock.calls[0]![0] as string
    expect(writePath).toContain('codeforge.yml')
  })

  it('does not generate GitLab CI file', async () => {
    const cmd = createMockCommand()
    const githubOptions: CiOptions = { force: false, output: '.', platform: 'github' }
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue(githubOptions)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const writePaths = vi.mocked(fsPromises.writeFile).mock.calls.map((c) => c[0] as string)
    expect(writePaths.every((p) => !p.includes('.gitlab-ci.yml'))).toBe(true)
  })
})

// ─── run() - platform=gitlab generates only GitLab CI ───

describe('run() with platform=gitlab', () => {
  it('generates only GitLab CI configuration', async () => {
    const cmd = createMockCommand()
    const gitlabOptions: CiOptions = { force: false, output: '.', platform: 'gitlab' }
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue(gitlabOptions)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledTimes(1)
    const writePath = vi.mocked(fsPromises.writeFile).mock.calls[0]![0] as string
    expect(writePath).toContain('.gitlab-ci.yml')
  })

  it('does not generate GitHub Actions file', async () => {
    const cmd = createMockCommand()
    const gitlabOptions: CiOptions = { force: false, output: '.', platform: 'gitlab' }
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue(gitlabOptions)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const writePaths = vi.mocked(fsPromises.writeFile).mock.calls.map((c) => c[0] as string)
    expect(writePaths.every((p) => !p.includes('codeforge.yml'))).toBe(true)
  })
})

// ─── run() - skipping existing files without force ───

describe('run() skipping existing files', () => {
  it('skips GitHub Actions when file exists and force is false', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(fsPromises.writeFile).not.toHaveBeenCalled()
    expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Skipping'))
  })

  it('skips GitLab CI when file exists and force is false', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'gitlab' })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(fsPromises.writeFile).not.toHaveBeenCalled()
    expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Skipping'))
  })

  it('mentions --force in skip message for GitHub Actions', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('--force'))
  })
})

// ─── run() - force overwrite ───

describe('run() with force flag', () => {
  it('overwrites existing GitHub Actions file when force is true', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: true, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: true, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledTimes(1)
    const writePath = vi.mocked(fsPromises.writeFile).mock.calls[0]![0] as string
    expect(writePath).toContain('codeforge.yml')
  })

  it('overwrites existing GitLab CI file when force is true', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: true, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: true, output: '.', platform: 'gitlab' })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledTimes(1)
    const writePath = vi.mocked(fsPromises.writeFile).mock.calls[0]![0] as string
    expect(writePath).toContain('.gitlab-ci.yml')
  })

  it('overwrites both files when force is true and platform is all', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'all', force: true, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: true, output: '.', platform: 'all' })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledTimes(2)
  })
})

// ─── run() - output directory handling ───

describe('run() output directory handling', () => {
  it('uses custom output directory for GitHub Actions', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: './ci-out' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: './ci-out', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const writePath = vi.mocked(fsPromises.writeFile).mock.calls[0]![0] as string
    expect(writePath).toContain('ci-out')
  })

  it('uses custom output directory for GitLab CI', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: false, output: './deploy' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: './deploy', platform: 'gitlab' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const writePath = vi.mocked(fsPromises.writeFile).mock.calls[0]![0] as string
    expect(writePath).toContain('deploy')
  })

  it('calls error when output directory is invalid', async () => {
    const cmd = createMockCommand({
      error: vi.fn((msg: string) => {
        throw new Error(msg)
      }),
    })
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'all', force: false, output: '/nonexistent' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '/nonexistent', platform: 'all' })
    vi.mocked(validateOutputDir).mockReturnValue({ valid: false, error: 'Output directory does not exist' })

    await expect(cmd.run()).rejects.toThrow('Output directory does not exist')

    expect(cmd.error).toHaveBeenCalledWith('Output directory does not exist')
    expect(fsPromises.writeFile).not.toHaveBeenCalled()
  })
})

// ─── run() - mkdir called for parent directories ───

describe('run() creates parent directories', () => {
  it('creates .github/workflows directory for GitHub Actions', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const mkdirPath = vi.mocked(fsPromises.mkdir).mock.calls[0]![0] as string
    expect(mkdirPath).toContain('.github')
  })

  it('calls mkdir with recursive option', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fsPromises.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true })
  })
})

// ─── run() - error handling ───

describe('run() error handling', () => {
  it('calls error when GitHub Actions writeFile fails', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fsPromises.writeFile).mockRejectedValue(new Error('disk full'))

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('disk full'))
  })

  it('calls error when GitLab CI writeFile fails', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'gitlab' })
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fsPromises.writeFile).mockRejectedValue(new Error('permission denied'))

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('permission denied'))
  })

  it('handles non-Error throw in GitHub Actions write', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fsPromises.writeFile).mockRejectedValue('unknown failure')

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('unknown failure'))
  })

  it('handles non-Error throw in GitLab CI write', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'gitlab' })
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fsPromises.writeFile).mockRejectedValue('string error')

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(expect.stringContaining('string error'))
  })
})

// ─── run() - displayNextSteps called ───

describe('run() calls displayNextSteps', () => {
  it('calls displayNextSteps after generating files', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(displayNextSteps).toHaveBeenCalled()
    expect(displayNextSteps).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls displayNextSteps even when files are skipped', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'all', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'all' })
    vi.mocked(fs.existsSync).mockReturnValue(true)

    await cmd.run()

    expect(displayNextSteps).toHaveBeenCalled()
  })
})

// ─── run() - resolveCiOptions and validateOutputDir delegation ───

describe('run() delegates to helpers', () => {
  it('passes flags to resolveCiOptions', async () => {
    const cmd = createMockCommand()
    const flags = { platform: 'github', force: true, output: './out' }
    vi.mocked(cmd.parse).mockResolvedValue({ flags })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: true, output: './out', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(resolveCiOptions).toHaveBeenCalledWith(flags)
  })

  it('passes resolved output dir to validateOutputDir', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(validateOutputDir).toHaveBeenCalledWith(expect.any(String))
  })
})

// ─── run() - file content ───

describe('run() writes correct content', () => {
  it('writes GitHub Actions content to file', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'github', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'github' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      'github-actions-yaml',
      'utf8',
    )
  })

  it('writes GitLab CI content to file', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ flags: { platform: 'gitlab', force: false, output: '.' } })
    vi.mocked(resolveCiOptions).mockReturnValue({ force: false, output: '.', platform: 'gitlab' })
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      'gitlab-ci-yaml',
      'utf8',
    )
  })
})
