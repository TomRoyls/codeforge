import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/commands/generate-plugin-helpers.js', () => ({
  buildGitignoreContent: vi.fn().mockReturnValue('node_modules/\ndist/\n'),
  buildPackageJson: vi.fn().mockReturnValue({ name: 'test-plugin', version: '1.0.0' }),
  buildPluginFileContent: vi.fn().mockReturnValue('// plugin content'),
  buildReadmeContent: vi.fn().mockReturnValue('# test-plugin'),
  buildRuleFileContent: vi.fn().mockReturnValue('// rule content'),
  buildRuleTestContent: vi.fn().mockReturnValue('// test content'),
  buildTsConfig: vi.fn().mockReturnValue({ compilerOptions: {} }),
  getDirectoryPaths: vi.fn().mockReturnValue(['/out/test-plugin', '/out/test-plugin/src', '/out/test-plugin/src/rules', '/out/test-plugin/test', '/out/test-plugin/test/rules']),
  isValidPluginName: vi.fn(),
  toCamelCase: vi.fn(),
}))

import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'

import GeneratePlugin from '../../src/commands/generate-plugin.js'

import {
  buildGitignoreContent,
  buildPackageJson,
  buildPluginFileContent,
  buildReadmeContent,
  buildRuleFileContent,
  buildRuleTestContent,
  buildTsConfig,
  getDirectoryPaths,
  isValidPluginName,
  toCamelCase,
} from '../../src/commands/generate-plugin-helpers.js'

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

function createMockCommand(overrides: Record<string, unknown> = {}): GeneratePlugin {
  const cmd = Object.create(GeneratePlugin.prototype) as GeneratePlugin
  Object.assign(cmd, {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return cmd
}

const defaultArgs = { name: 'my-plugin' }
const defaultFlags = {
  force: false,
  output: '.',
  rule: 'sample-rule',
  typescript: true,
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Command metadata ───

describe('GeneratePlugin command metadata', () => {
  it('has a description', () => {
    expect(GeneratePlugin.description).toBeTruthy()
  })

  it('defines the name arg as required', () => {
    expect(GeneratePlugin.args.name.required).toBe(true)
  })

  it('defines flags with correct defaults', () => {
    expect(GeneratePlugin.flags.typescript.default).toBe(true)
    expect(GeneratePlugin.flags.rule.default).toBe('sample-rule')
    expect(GeneratePlugin.flags.output.default).toBe('.')
    expect(GeneratePlugin.flags.force.default).toBe(false)
  })
})

// ─── Name validation ───

describe('run() name validation', () => {
  it('rejects invalid plugin name', async () => {
    const errorFn = vi.fn().mockImplementation(() => {
      throw new Error('exit')
    })
    const cmd = createMockCommand({ error: errorFn })
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(false)

    await expect(cmd.run()).rejects.toThrow('exit')

    expect(errorFn).toHaveBeenCalledWith(
      expect.stringContaining('Plugin name must be lowercase'),
    )
  })

  it('accepts valid plugin name', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats)

    await cmd.run()

    expect(cmd.error).not.toHaveBeenCalledWith(
      expect.stringContaining('Plugin name must be lowercase'),
    )
  })

  it('delegates isValidPluginName to helper', () => {
    vi.mocked(isValidPluginName).mockReturnValue(true)
    const cmd = createMockCommand()
    expect(cmd.isValidPluginName('my-plugin')).toBe(true)
    expect(isValidPluginName).toHaveBeenCalledWith('my-plugin')
  })

  it('delegates toCamelCase to helper', () => {
    vi.mocked(toCamelCase).mockReturnValue('myRule')
    const cmd = createMockCommand()
    expect(cmd.toCamelCase('my-rule')).toBe('myRule')
    expect(toCamelCase).toHaveBeenCalledWith('my-rule')
  })
})

// ─── Output directory validation ───

describe('run() output directory validation', () => {
  it('errors when output base directory does not exist', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('Output directory does not exist'),
    )
  })

  it('errors when output path is not a directory', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as fs.Stats)

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('Output path is not a directory'),
    )
  })

  it('errors when plugin directory already exists without --force', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    // First call for outputBase, second for outputDir
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true)  // outputBase exists
      .mockReturnValueOnce(true)  // outputDir exists
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats)

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('already exists'),
    )
  })
})

// ─── Successful generation ───

describe('run() successful generation', () => {
  function setupSuccessfulRun(overrides: Record<string, unknown> = {}) {
    const cmd = createMockCommand(overrides)
    const flags = { ...defaultFlags, ...overrides }
    const args = { ...(overrides.args ?? defaultArgs) }
    vi.mocked(cmd.parse).mockResolvedValue({ args, flags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats)
    return cmd
  }

  it('creates all directories via mkdir', async () => {
    const cmd = setupSuccessfulRun()
    vi.mocked(getDirectoryPaths).mockReturnValue(['/out/p', '/out/p/src', '/out/p/src/rules'])

    await cmd.run()

    expect(fsPromises.mkdir).toHaveBeenCalledTimes(3)
    expect(fsPromises.mkdir).toHaveBeenCalledWith('/out/p', { recursive: true })
    expect(fsPromises.mkdir).toHaveBeenCalledWith('/out/p/src', { recursive: true })
    expect(fsPromises.mkdir).toHaveBeenCalledWith('/out/p/src/rules', { recursive: true })
  })

  it('generates package.json', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const pkgCall = calls.find((c) => (c[0] as string).endsWith('package.json'))
    expect(pkgCall).toBeDefined()
    expect(buildPackageJson).toHaveBeenCalledWith('my-plugin')
  })

  it('generates tsconfig.json', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const tsCall = calls.find((c) => (c[0] as string).endsWith('tsconfig.json'))
    expect(tsCall).toBeDefined()
    expect(buildTsConfig).toHaveBeenCalled()
  })

  it('generates plugin entry file at src/index.ts', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const indexCall = calls.find((c) => (c[0] as string).includes('src/index.ts'))
    expect(indexCall).toBeDefined()
    expect(buildPluginFileContent).toHaveBeenCalledWith('my-plugin', 'sample-rule')
  })

  it('generates rule file with correct name', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const ruleCall = calls.find((c) => (c[0] as string).endsWith('sample-rule.ts'))
    expect(ruleCall).toBeDefined()
    expect(buildRuleFileContent).toHaveBeenCalledWith('sample-rule')
  })

  it('generates rule test file', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const testCall = calls.find((c) => (c[0] as string).endsWith('sample-rule.test.ts'))
    expect(testCall).toBeDefined()
    expect(buildRuleTestContent).toHaveBeenCalledWith('sample-rule')
  })

  it('generates README.md', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const readmeCall = calls.find((c) => (c[0] as string).endsWith('README.md'))
    expect(readmeCall).toBeDefined()
    expect(buildReadmeContent).toHaveBeenCalledWith('my-plugin', 'sample-rule')
  })

  it('generates .gitignore', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const gitCall = calls.find((c) => (c[0] as string).endsWith('.gitignore'))
    expect(gitCall).toBeDefined()
    expect(buildGitignoreContent).toHaveBeenCalled()
  })

  it('writes exactly 7 files', async () => {
    const cmd = setupSuccessfulRun()

    await cmd.run()

    expect(fsPromises.writeFile).toHaveBeenCalledTimes(7)
  })
})

// ─── Force flag ───

describe('run() with --force flag', () => {
  it('proceeds when plugin directory exists and force is true', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, force: true },
    })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    // outputBase exists, outputDir also exists
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats)

    await cmd.run()

    // Should NOT error about directory existing
    expect(cmd.error).not.toHaveBeenCalledWith(
      expect.stringContaining('already exists'),
    )
    // Should proceed with file generation
    expect(fsPromises.writeFile).toHaveBeenCalled()
  })
})

// ─── Custom rule name ───

describe('run() with custom rule name', () => {
  it('uses custom rule name for file generation', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, rule: 'custom-rule' },
    })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const ruleFile = calls.find((c) => (c[0] as string).includes('custom-rule.ts') && !(c[0] as string).includes('.test.'))
    expect(ruleFile).toBeDefined()
    const testFile = calls.find((c) => (c[0] as string).includes('custom-rule.test.ts'))
    expect(testFile).toBeDefined()
  })

  it('passes custom rule name to content helpers', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, rule: 'no-console' },
    })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(buildPluginFileContent).toHaveBeenCalledWith('my-plugin', 'no-console')
    expect(buildRuleFileContent).toHaveBeenCalledWith('no-console')
    expect(buildRuleTestContent).toHaveBeenCalledWith('no-console')
    expect(buildReadmeContent).toHaveBeenCalledWith('my-plugin', 'no-console')
  })
})

// ─── Output path resolution ───

describe('run() output path resolution', () => {
  it('resolves relative output path against cwd', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, output: './plugins' },
    })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const calls = vi.mocked(fsPromises.writeFile).mock.calls
    const firstWrite = calls[0]
    expect(firstWrite).toBeDefined()
    const writePath = firstWrite![0] as string
    expect(writePath).toContain('plugins')
  })

  it('uses absolute output path directly', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, output: '/tmp/plugins' },
    })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    // outputBase exists check for /tmp/plugins
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    const calls = vi.mocked(getDirectoryPaths).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    expect(calls[0]![0]).toContain('/tmp/plugins')
  })
})

// ─── Logging ───

describe('run() logging output', () => {
  function setupForLogs(): GeneratePlugin {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)
    return cmd
  }

  it('logs generation start message with plugin name', async () => {
    const cmd = setupForLogs()

    await cmd.run()

    const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => stripAnsi(c[0]))
    expect(logCalls.some((s) => s.includes('my-plugin'))).toBe(true)
  })

  it('logs next steps after generation', async () => {
    const cmd = setupForLogs()

    await cmd.run()

    const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => stripAnsi(c[0]))
    expect(logCalls.some((s) => s.includes('npm install'))).toBe(true)
    expect(logCalls.some((s) => s.includes('npm test'))).toBe(true)
  })

  it('logs plugin config suggestion', async () => {
    const cmd = setupForLogs()

    await cmd.run()

    const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => stripAnsi(c[0]))
    expect(logCalls.some((s) => s.includes('plugins:'))).toBe(true)
  })

  it('logs success message', async () => {
    const cmd = setupForLogs()

    await cmd.run()

    const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => stripAnsi(c[0]))
    expect(logCalls.some((s) => s.includes('Plugin generated successfully'))).toBe(true)
  })
})

// ─── Error handling ───

describe('run() error handling', () => {
  it('catches writeFile errors and calls this.error', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fsPromises.writeFile).mockRejectedValue(new Error('disk full'))

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('disk full'),
    )
  })

  it('catches mkdir errors and calls this.error', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fsPromises.mkdir).mockRejectedValue(new Error('permission denied'))

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('permission denied'),
    )
  })

  it('handles non-Error thrown values', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({ args: defaultArgs, flags: defaultFlags })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)
    // mkdir succeeds but writeFile throws a non-Error
    vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined)
    vi.mocked(fsPromises.writeFile).mockRejectedValue('string error')

    await cmd.run()

    expect(cmd.error).toHaveBeenCalledWith(
      expect.stringContaining('string error'),
    )
  })
})

// ─── getDirectoryPaths delegation ───

describe('getDirectoryPaths delegation', () => {
  it('passes the output directory to getDirectoryPaths', async () => {
    const cmd = createMockCommand()
    vi.mocked(cmd.parse).mockResolvedValue({
      args: defaultArgs,
      flags: { ...defaultFlags, output: '.' },
    })
    vi.mocked(isValidPluginName).mockReturnValue(true)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await cmd.run()

    expect(getDirectoryPaths).toHaveBeenCalled()
    const passedDir = vi.mocked(getDirectoryPaths).mock.calls[0]![0]
    expect(passedDir).toContain('my-plugin')
  })
})
