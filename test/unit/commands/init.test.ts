import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'max-complexity': {
      meta: {
        name: 'max-complexity',
        description: 'Enforce a maximum cyclomatic complexity threshold',
        category: 'complexity',
        recommended: true,
      },
      defaultOptions: { max: 10 },
      create: vi.fn(),
    },
    'max-params': {
      meta: {
        name: 'max-params',
        description: 'Enforce maximum number of parameters',
        category: 'complexity',
        recommended: true,
      },
      defaultOptions: { max: 4 },
      create: vi.fn(),
    },
    'no-await-in-loop': {
      meta: {
        name: 'no-await-in-loop',
        description: 'Disallow await inside loops',
        category: 'performance',
        recommended: false,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
  },
  getRuleCategory: vi.fn((ruleId: string) => {
    if (ruleId.startsWith('max-')) return 'complexity'
    return 'performance'
  }),
}))

describe('Init Command', () => {
  let Init: typeof import('../../../src/commands/init.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Init = (await import('../../../src/commands/init.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-init-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Init.description).toBe('Initialize a new CodeForge configuration file')
    })

    test('has examples defined', () => {
      expect(Init.examples).toBeDefined()
      expect(Init.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Init.flags).toBeDefined()
      expect(Init.flags.format).toBeDefined()
      expect(Init.flags.force).toBeDefined()
      expect(Init.flags.minimal).toBeDefined()
      expect(Init.flags.typescript).toBeDefined()
    })

    test('format flag has correct options', () => {
      expect(Init.flags.format.options).toContain('json')
      expect(Init.flags.format.options).toContain('js')
    })

    test('format flag has default value json', () => {
      expect(Init.flags.format.default).toBe('json')
    })

    test('force flag has default false', () => {
      expect(Init.flags.force.default).toBe(false)
    })

    test('minimal flag has default false', () => {
      expect(Init.flags.minimal.default).toBe(false)
    })

    test('typescript flag has default true', () => {
      expect(Init.flags.typescript.default).toBe(true)
    })
  })

  describe('Flag characters', () => {
    test('format flag has char F', () => {
      expect(Init.flags.format.char).toBe('F')
    })

    test('force flag has char f', () => {
      expect(Init.flags.force.char).toBe('f')
    })

    test('typescript flag has char t', () => {
      expect(Init.flags.typescript.char).toBe('t')
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Init([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      return command
    }

    test('creates JSON config file by default', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const configPath = path.join(tempDir, '.codeforgerc.json')
      const exists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      const content = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(content)
      expect(config.files).toContain('**/*.ts')
      expect(config.ignore).toContain('node_modules/**')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('creates JS config file when format is js', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'js',
        force: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const configPath = path.join(tempDir, 'codeforge.config.js')
      const exists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      const content = await fs.readFile(configPath, 'utf-8')
      expect(content).toContain('export default')
      expect(content).toContain('@type {import')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('creates minimal config without rules', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const configPath = path.join(tempDir, '.codeforgerc.json')
      const content = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(content)
      expect(config.rules).toBeUndefined()

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('creates full config with recommended rules', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        minimal: false,
        typescript: true,
      })
      await cmd.run()

      const configPath = path.join(tempDir, '.codeforgerc.json')
      const content = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(content)
      expect(config.rules).toBeDefined()
      expect(config.rules['max-complexity']).toBe('error')
      expect(config.rules['max-params']).toBe('error')
      expect(config.rules['no-await-in-loop']).toBeUndefined()

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs success message', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Created')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs next steps', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Next steps')

      vi.spyOn(process, 'cwd').mockRestore()
    })
  })
})
