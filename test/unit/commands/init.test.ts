import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import * as readline from 'node:readline'

let mockReadlineAnswer: string = ''

vi.mock('node:readline', () => ({
  default: {
    createInterface: vi.fn(() => ({
      question: (_prompt: string, callback: (answer: string) => void) => {
        callback(mockReadlineAnswer)
      },
      close: vi.fn(),
    })),
  },
}))

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
      expect(Init.flags.dir).toBeDefined()
      expect(Init.flags.format).toBeDefined()
      expect(Init.flags.force).toBeDefined()
      expect(Init.flags.interactive).toBeDefined()
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

    test('interactive flag has default false', () => {
      expect(Init.flags.interactive.default).toBe(false)
    })

    test('interactive flag has char i', () => {
      expect(Init.flags.interactive.char).toBe('i')
    })

    test('minimal flag has default false', () => {
      expect(Init.flags.minimal.default).toBe(false)
    })

    test('typescript flag has default true', () => {
      expect(Init.flags.typescript.default).toBe(true)
    })

    test('dir flag has default .', () => {
      expect(Init.flags.dir.default).toBe('.')
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
        flags: {
          dir: '.',
          ...flags,
        },
      })
      return command
    }

    test('creates JSON config file by default', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        interactive: false,
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
        interactive: false,
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
        interactive: false,
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
        interactive: false,
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
        interactive: false,
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
        interactive: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Next steps')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('interactive flag does not prompt when minimal is true', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        interactive: true,
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

    test('overwrites existing config when force is true', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{"old": true}', 'utf-8')

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: true,
        interactive: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const content = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(content)
      expect(config.old).toBeUndefined()
      expect(config.files).toBeDefined()

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('prompts user when config exists and force is false', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{"old": true}', 'utf-8')

      mockReadlineAnswer = 'n'

      const cmd = createCommandWithMockedParse({
        format: 'json',
        force: false,
        interactive: false,
        minimal: true,
        typescript: true,
      })
      await cmd.run()

      const content = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(content)
      expect(config.old).toBe(true)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    describe('Private methods', () => {
      describe('getRuleInfos', () => {
        test('returns array of rule infos', () => {
          const cmd = new Init([], {} as never)
          const result = (cmd as any).getRuleInfos()

          expect(Array.isArray(result)).toBe(true)
          expect(result.length).toBeGreaterThan(0)
        })

        test('each rule info has required properties', () => {
          const cmd = new Init([], {} as never)
          const result = (cmd as any).getRuleInfos()

          result.forEach((rule: any) => {
            expect(rule).toHaveProperty('id')
            expect(rule).toHaveProperty('description')
            expect(rule).toHaveProperty('category')
            expect(rule).toHaveProperty('recommended')
            expect(typeof rule.id).toBe('string')
            expect(typeof rule.description).toBe('string')
            expect(typeof rule.category).toBe('string')
            expect(typeof rule.recommended).toBe('boolean')
          })
        })

        test('includes all mocked rules', () => {
          const cmd = new Init([], {} as never)
          const result = (cmd as any).getRuleInfos()

          const ruleIds = result.map((r: any) => r.id)
          expect(ruleIds).toContain('max-complexity')
          expect(ruleIds).toContain('max-params')
          expect(ruleIds).toContain('no-await-in-loop')
        })

        test('correctly identifies recommended rules', () => {
          const cmd = new Init([], {} as never)
          const result = (cmd as any).getRuleInfos()

          const maxComplexity = result.find((r: any) => r.id === 'max-complexity')
          const maxParams = result.find((r: any) => r.id === 'max-params')
          const noAwaitInLoop = result.find((r: any) => r.id === 'no-await-in-loop')

          expect(maxComplexity?.recommended).toBe(true)
          expect(maxParams?.recommended).toBe(true)
          expect(noAwaitInLoop?.recommended).toBe(false)
        })

        test('correctly assigns categories', () => {
          const cmd = new Init([], {} as never)
          const result = (cmd as any).getRuleInfos()

          const maxComplexity = result.find((r: any) => r.id === 'max-complexity')
          const maxParams = result.find((r: any) => r.id === 'max-params')
          const noAwaitInLoop = result.find((r: any) => r.id === 'no-await-in-loop')

          expect(maxComplexity?.category).toBe('complexity')
          expect(maxParams?.category).toBe('complexity')
          expect(noAwaitInLoop?.category).toBe('performance')
        })
      })

      describe('generateJsContent', () => {
        test('generates valid JS export', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
            ignore: ['node_modules/**'],
          }

          const result = (cmd as any).generateJsContent(config)

          expect(result).toContain('export default')
          expect(result).toContain("/** @type {import('codeforge').CodeForgeConfig} */")
          expect(result).toContain('**/*.ts')
          expect(result).toContain('node_modules/**')
        })

        test('includes type definition comment', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
          }

          const result = (cmd as any).generateJsContent(config)

          expect(result).toMatch(/\/\*\* @type \{import\('codeforge'\)\.CodeForgeConfig\} \*\//)
        })

        test('formats config with proper indentation', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts', '**/*.tsx'],
            ignore: ['node_modules/**', 'dist/**'],
            rules: { 'max-complexity': 'error' },
          }

          const result = (cmd as any).generateJsContent(config)

          expect(result).toContain('  "files": [')
          expect(result).toContain('  "ignore": [')
          expect(result).toContain('  "rules": {')
        })

        test('handles config without rules', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.js'],
            ignore: ['node_modules/**'],
          }

          const result = (cmd as any).generateJsContent(config)

          expect(result).not.toContain('"rules"')
        })
      })

      describe('generateJsonContent', () => {
        test('generates valid JSON', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
            ignore: ['node_modules/**'],
          }

          const result = (cmd as any).generateJsonContent(config)

          expect(() => JSON.parse(result)).not.toThrow()
          const parsed = JSON.parse(result)
          expect(parsed.files).toEqual(['**/*.ts'])
          expect(parsed.ignore).toEqual(['node_modules/**'])
        })

        test('formats JSON with 2 space indentation', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
          }

          const result = (cmd as any).generateJsonContent(config)

          expect(result).toContain('  "files"')
        })

        test('includes rules in output', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
            ignore: ['node_modules/**'],
            rules: { 'max-complexity': 'error' },
          }

          const result = (cmd as any).generateJsonContent(config)

          const parsed = JSON.parse(result)
          expect(parsed.rules).toBeDefined()
          expect(parsed.rules['max-complexity']).toBe('error')
        })
      })

      describe('detectExistingConfig', () => {
        test('returns null when no config file exists', () => {
          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toBeNull()
        })

        test('returns path when .codeforgerc.json exists', async () => {
          await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}', 'utf-8')

          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toBe(path.join(tempDir, '.codeforgerc.json'))
        })

        test('returns path when codeforge.config.js exists', async () => {
          await fs.writeFile(
            path.join(tempDir, 'codeforge.config.js'),
            'export default {};',
            'utf-8',
          )

          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toBe(path.join(tempDir, 'codeforge.config.js'))
        })

        test('returns path when .codeforgerc exists', async () => {
          await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}', 'utf-8')

          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toBe(path.join(tempDir, '.codeforgerc'))
        })

        test('returns first config found when multiple exist', async () => {
          await fs.writeFile(
            path.join(tempDir, 'codeforge.config.js'),
            'export default {};',
            'utf-8',
          )
          await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}', 'utf-8')

          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).not.toBeNull()
          expect(
            ['.codeforgerc', '.codeforgerc.json', '.codeforge.json', 'codeforge.config.js'].some(
              (name) => result?.endsWith(name),
            ),
          ).toBe(true)
        })
      })

      describe('generateConfig', () => {
        test('includes JS file patterns when typescript is false', () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: false,
          }

          const config = (cmd as any).generateConfig(options)

          expect(config.files).toContain('**/*.js')
          expect(config.files).toContain('**/*.jsx')
          expect(config.files).toContain('**/*.ts')
          expect(config.files).toContain('**/*.tsx')
        })

        test('only includes TS file patterns when typescript is true', () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }

          const config = (cmd as any).generateConfig(options)

          expect(config.files).toContain('**/*.ts')
          expect(config.files).toContain('**/*.tsx')
          expect(config.files).not.toContain('**/*.js')
          expect(config.files).not.toContain('**/*.jsx')
        })

        test('includes only selected rules when provided', () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }

          const config = (cmd as any).generateConfig(options, [
            'max-complexity',
            'no-await-in-loop',
          ])

          expect(config.rules).toBeDefined()
          expect(config.rules['max-complexity']).toBe('error')
          expect(config.rules['no-await-in-loop']).toBe('error')
          expect(config.rules['max-params']).toBeUndefined()
        })

        test('includes recommended rules when selectedRules is undefined', () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }

          const config = (cmd as any).generateConfig(options)

          expect(config.rules).toBeDefined()
          expect(config.rules['max-complexity']).toBe('error')
          expect(config.rules['max-params']).toBe('error')
          expect(config.rules['no-await-in-loop']).toBeUndefined()
        })

        test('has no rules when selectedRules is empty array', () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }

          const config = (cmd as any).generateConfig(options, [])

          expect(config.rules).toBeUndefined()
        })

        test('returns minimal config when minimal is true', () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }

          const config = (cmd as any).generateConfig(options)

          expect(config.rules).toBeUndefined()
          expect(config.files).toBeDefined()
          expect(config.ignore).toBeDefined()
        })
      })

      describe('confirmOverwrite', () => {
        test('returns true when user answers "y"', async () => {
          mockReadlineAnswer = 'y'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(true)
        })

        test('returns false when user answers "n"', async () => {
          mockReadlineAnswer = 'n'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(false)
        })

        test('returns true when user answers "yes"', async () => {
          mockReadlineAnswer = 'yes'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(true)
        })

        test('returns false when user answers with empty string', async () => {
          mockReadlineAnswer = ''
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(false)
        })
      })

      describe('promptForRules', () => {
        test('returns recommended rules when user enters "all"', async () => {
          mockReadlineAnswer = 'all'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
          expect(result).toContain('max-params')
          expect(result).not.toContain('no-await-in-loop')
        })

        test('returns empty array when user enters "none"', async () => {
          mockReadlineAnswer = 'none'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toEqual([])
        })

        test('returns empty array when user enters empty string', async () => {
          mockReadlineAnswer = ''
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toEqual([])
        })

        test('returns valid rule IDs when user enters valid rules', async () => {
          mockReadlineAnswer = 'max-complexity, max-params'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
          expect(result).toContain('max-params')
          expect(result.length).toBe(2)
        })

        test('logs warning and returns only valid rules when user enters invalid IDs', async () => {
          mockReadlineAnswer = 'max-complexity, invalid-rule'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
          expect(result).not.toContain('invalid-rule')
          expect(result.length).toBe(1)
        })

        test('returns only valid rules when user enters mix of valid and invalid IDs', async () => {
          mockReadlineAnswer = 'max-complexity, max-params, invalid-1, invalid-2'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
          expect(result).toContain('max-params')
          expect(result).not.toContain('invalid-1')
          expect(result).not.toContain('invalid-2')
          expect(result.length).toBe(2)
        })
      })
    })
  })
})
