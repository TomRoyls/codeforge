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

vi.mock('../../../src/rules/lazy-loader.js', () => {
  const mockRules = {
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
  }
  return {
    lazyRuleLoader: {
      getRuleIds: vi.fn(() => Object.keys(mockRules)),
      loadAllRules: vi.fn(() => Promise.resolve(mockRules)),
      loadRules: vi.fn((ruleIds: string[]) => {
        const filtered: Record<string, unknown> = {}
        for (const id of ruleIds) {
          if (mockRules[id as keyof typeof mockRules]) filtered[id] = mockRules[id as keyof typeof mockRules]
        }
        return Promise.resolve(filtered)
      }),
    },
  }
})

vi.mock('../../../src/rules/categories.js', () => ({
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
        test('returns array of rule infos', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()

          expect(Array.isArray(result)).toBe(true)
          expect(result.length).toBeGreaterThan(0)
        })

        test('each rule info has required properties', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()

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

        test('includes all mocked rules', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()

          const ruleIds = result.map((r: any) => r.id)
          expect(ruleIds).toContain('max-complexity')
          expect(ruleIds).toContain('max-params')
          expect(ruleIds).toContain('no-await-in-loop')
        })

        test('correctly identifies recommended rules', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()

          const maxComplexity = result.find((r: any) => r.id === 'max-complexity')
          const maxParams = result.find((r: any) => r.id === 'max-params')
          const noAwaitInLoop = result.find((r: any) => r.id === 'no-await-in-loop')

          expect(maxComplexity?.recommended).toBe(true)
          expect(maxParams?.recommended).toBe(true)
          expect(noAwaitInLoop?.recommended).toBe(false)
        })

        test('correctly assigns categories', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()

          const maxComplexity = result.find((r: any) => r.id === 'max-complexity')
          const maxParams = result.find((r: any) => r.id === 'max-params')
          const noAwaitInLoop = result.find((r: any) => r.id === 'no-await-in-loop')

          expect(maxComplexity?.category).toBe('complexity')
          expect(maxParams?.category).toBe('complexity')
          expect(noAwaitInLoop?.category).toBe('performance')
        })

        test('returns exactly 3 rules matching mock data', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()
          expect(result.length).toBe(3)
        })

        test('each rule description is a non-empty string', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()
          for (const rule of result) {
            expect(rule.description.length).toBeGreaterThan(0)
          }
        })

        test('max-complexity has correct description', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()
          const mc = result.find((r: any) => r.id === 'max-complexity')
          expect(mc.description).toBe('Enforce a maximum cyclomatic complexity threshold')
        })

        test('max-params has correct description', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()
          const mp = result.find((r: any) => r.id === 'max-params')
          expect(mp.description).toBe('Enforce maximum number of parameters')
        })

        test('no-await-in-loop has correct description', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()
          const nal = result.find((r: any) => r.id === 'no-await-in-loop')
          expect(nal.description).toBe('Disallow await inside loops')
        })

        test('returns consistent results on multiple calls', async () => {
          const cmd = new Init([], {} as never)
const result1 = await (cmd as any).getRuleInfos()
        const result2 = await (cmd as any).getRuleInfos()
          expect(result1.length).toBe(result2.length)
          expect(result1.map((r: any) => r.id).sort()).toEqual(result2.map((r: any) => r.id).sort())
        })

        test('rule ids are unique', async () => {
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).getRuleInfos()
          const ids = result.map((r: any) => r.id)
          expect(new Set(ids).size).toBe(ids.length)
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

        test('ends with semicolon after JSON', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsContent(config)
          const trimmed = result.trim()
          expect(trimmed[trimmed.length - 1]).toBe(';')
        })

        test('type comment appears before export default', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsContent(config)
          const typeIndex = result.indexOf('/** @type')
          const exportIndex = result.indexOf('export default')
          expect(typeIndex).toBeLessThan(exportIndex)
        })

        test('preserves all file patterns in output', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
            ignore: ['node_modules/**'],
          }
          const result = (cmd as any).generateJsContent(config)
          expect(result).toContain('**/*.ts')
          expect(result).toContain('**/*.tsx')
          expect(result).toContain('**/*.js')
          expect(result).toContain('**/*.jsx')
        })

        test('preserves all ignore patterns in output', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
            ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
          }
          const result = (cmd as any).generateJsContent(config)
          expect(result).toContain('node_modules/**')
          expect(result).toContain('dist/**')
          expect(result).toContain('coverage/**')
        })

        test('handles empty files array', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: [] }
          const result = (cmd as any).generateJsContent(config)
          expect(result).toContain('export default')
          expect(result).toContain('"files"')
        })

        test('handles empty ignore array', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'], ignore: [] }
          const result = (cmd as any).generateJsContent(config)
          expect(result).toContain('export default')
          expect(result).toContain('"ignore"')
        })

        test('handles config with only files', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsContent(config)
          expect(result).toContain('export default')
          expect(result).toContain('"files"')
        })

        test('preserves rule severities as error', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
            rules: { 'max-complexity': 'error', 'max-params': 'error' },
          }
          const result = (cmd as any).generateJsContent(config)
          expect(result).toContain('"max-complexity": "error"')
          expect(result).toContain('"max-params": "error"')
        })

        test('output is a string', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsContent(config)
          expect(typeof result).toBe('string')
        })

        test('output contains valid JSON between export default and semicolon', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'], ignore: ['dist/**'] }
          const result = (cmd as any).generateJsContent(config)
          const jsonPart = result
            .replace("/** @type {import('codeforge').CodeForgeConfig} */\nexport default ", '')
            .replace(/;\n$/, '')
          expect(() => JSON.parse(jsonPart)).not.toThrow()
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

        test('preserves all files patterns', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
          }
          const result = (cmd as any).generateJsonContent(config)
          const parsed = JSON.parse(result)
          expect(parsed.files).toHaveLength(4)
        })

        test('preserves all ignore patterns', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
            ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
          }
          const result = (cmd as any).generateJsonContent(config)
          const parsed = JSON.parse(result)
          expect(parsed.ignore).toHaveLength(3)
        })

        test('output does not contain trailing newline extra whitespace', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsonContent(config)
          expect(result.trim().length).toBe(result.length)
        })

        test('handles config with only files key', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsonContent(config)
          const parsed = JSON.parse(result)
          expect(Object.keys(parsed)).toEqual(['files'])
        })

        test('handles config with empty rules object', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'], rules: {} }
          const result = (cmd as any).generateJsonContent(config)
          const parsed = JSON.parse(result)
          expect(parsed.rules).toEqual({})
        })

        test('multiple rules are all serialized', () => {
          const cmd = new Init([], {} as never)
          const config: any = {
            files: ['**/*.ts'],
            rules: {
              'max-complexity': 'error',
              'max-params': 'error',
              'no-await-in-loop': 'error',
            },
          }
          const result = (cmd as any).generateJsonContent(config)
          const parsed = JSON.parse(result)
          expect(Object.keys(parsed.rules)).toHaveLength(3)
        })

        test('output is a string', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsonContent(config)
          expect(typeof result).toBe('string')
        })

        test('does not contain export default', () => {
          const cmd = new Init([], {} as never)
          const config: any = { files: ['**/*.ts'] }
          const result = (cmd as any).generateJsonContent(config)
          expect(result).not.toContain('export default')
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

        test('returns path when .codeforge.json exists', async () => {
          await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}', 'utf-8')
          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toBe(path.join(tempDir, '.codeforge.json'))
        })

        test('checks files in CONFIG_FILE_NAMES order', async () => {
          await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}', 'utf-8')
          await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}', 'utf-8')
          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toBe(path.join(tempDir, '.codeforgerc'))
        })

        test('returns null for empty directory with other files', async () => {
          await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
          await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toBeNull()
        })

        test('returns full absolute path', async () => {
          await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{}', 'utf-8')
          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(tempDir)
          expect(result).toContain(tempDir)
        })

        test('detects config in subdirectory', async () => {
          const subDir = path.join(tempDir, 'subdir')
          await fs.mkdir(subDir, { recursive: true })
          await fs.writeFile(path.join(subDir, '.codeforgerc.json'), '{}', 'utf-8')
          const cmd = new Init([], {} as never)
          const result = (cmd as any).detectExistingConfig(subDir)
          expect(result).toBe(path.join(subDir, '.codeforgerc.json'))
        })
      })

      describe('generateConfig', () => {
        test('includes JS file patterns when typescript is false', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: false,
          }

          const config = await (cmd as any).generateConfig(options)

          expect(config.files).toContain('**/*.js')
          expect(config.files).toContain('**/*.jsx')
          expect(config.files).toContain('**/*.ts')
          expect(config.files).toContain('**/*.tsx')
        })

        test('only includes TS file patterns when typescript is true', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }

          const config = await (cmd as any).generateConfig(options)

          expect(config.files).toContain('**/*.ts')
          expect(config.files).toContain('**/*.tsx')
          expect(config.files).not.toContain('**/*.js')
          expect(config.files).not.toContain('**/*.jsx')
        })

        test('includes only selected rules when provided', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }

          const config = await (cmd as any).generateConfig(options, [
            'max-complexity',
            'no-await-in-loop',
          ])

          expect(config.rules).toBeDefined()
          expect(config.rules['max-complexity']).toBe('error')
          expect(config.rules['no-await-in-loop']).toBe('error')
          expect(config.rules['max-params']).toBeUndefined()
        })

        test('includes recommended rules when selectedRules is undefined', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }

          const config = await (cmd as any).generateConfig(options)

          expect(config.rules).toBeDefined()
          expect(config.rules['max-complexity']).toBe('error')
          expect(config.rules['max-params']).toBe('error')
          expect(config.rules['no-await-in-loop']).toBeUndefined()
        })

        test('has no rules when selectedRules is empty array', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }

          const config = await (cmd as any).generateConfig(options, [])

          expect(config.rules).toBeUndefined()
        })

        test('returns minimal config when minimal is true', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }

          const config = await (cmd as any).generateConfig(options)

          expect(config.rules).toBeUndefined()
          expect(config.files).toBeDefined()
          expect(config.ignore).toBeDefined()
        })

        test('always includes files property', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.files).toBeDefined()
          expect(Array.isArray(config.files)).toBe(true)
          expect(config.files.length).toBeGreaterThan(0)
        })

        test('always includes ignore property', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.ignore).toBeDefined()
          expect(Array.isArray(config.ignore)).toBe(true)
          expect(config.ignore.length).toBeGreaterThan(0)
        })

        test('ignore includes node_modules', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.ignore).toContain('node_modules/**')
        })

        test('ignore includes dist', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.ignore).toContain('dist/**')
        })

        test('ignore includes coverage', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.ignore).toContain('coverage/**')
        })

        test('typescript=false minimal=true has no rules', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: false,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.rules).toBeUndefined()
          expect(config.files).toHaveLength(4)
        })

        test('minimal=true ignores selectedRules argument', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options, ['max-complexity'])
          expect(config.rules).toBeUndefined()
        })

        test('non-minimal with single rule selection', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options, ['no-await-in-loop'])
          expect(Object.keys(config.rules)).toHaveLength(1)
          expect(config.rules['no-await-in-loop']).toBe('error')
        })

        test('non-minimal without selectedRules includes recommended', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options)
          const recommendedCount = Object.keys(config.rules).length
          expect(recommendedCount).toBe(2)
        })

        test('all selected rules have error severity', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: false,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options, [
            'max-complexity',
            'max-params',
            'no-await-in-loop',
          ])
          for (const severity of Object.values(config.rules)) {
            expect(severity).toBe('error')
          }
        })

        test('typescript=false files array has exactly 4 entries', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: false,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.files).toHaveLength(4)
        })

        test('typescript=true files array has exactly 2 entries', async () => {
          const cmd = new Init([], {} as never)
          const options: any = {
            force: false,
            format: 'json',
            interactive: false,
            minimal: true,
            typescript: true,
          }
          const config = await (cmd as any).generateConfig(options)
          expect(config.files).toHaveLength(2)
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

        test('returns true when user answers "Y" (uppercase)', async () => {
          mockReadlineAnswer = 'Y'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(true)
        })

        test('returns true when user answers "YES" (uppercase)', async () => {
          mockReadlineAnswer = 'YES'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(true)
        })

        test('returns true when user answers "Yes" (mixed case)', async () => {
          mockReadlineAnswer = 'Yes'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(true)
        })

        test('returns false when user answers "no"', async () => {
          mockReadlineAnswer = 'no'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(false)
        })

        test('returns false when user answers random text', async () => {
          mockReadlineAnswer = 'maybe'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(false)
        })

        test('returns false when user answers "N"', async () => {
          mockReadlineAnswer = 'N'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).confirmOverwrite('/some/path')
          expect(result).toBe(false)
        })

        test('returns true when user answers "y" with whitespace', async () => {
          mockReadlineAnswer = ' y '
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

        test('returns recommended rules when user enters "ALL" (uppercase)', async () => {
          mockReadlineAnswer = 'ALL'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
          expect(result).toContain('max-params')
        })

        test('returns recommended rules when user enters "All" (mixed case)', async () => {
          mockReadlineAnswer = 'All'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
        })

        test('returns empty when user enters "NONE" (uppercase)', async () => {
          mockReadlineAnswer = 'NONE'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toEqual([])
        })

        test('returns empty when user enters "None" (mixed case)', async () => {
          mockReadlineAnswer = 'None'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toEqual([])
        })

        test('handles single rule selection', async () => {
          mockReadlineAnswer = 'max-complexity'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toEqual(['max-complexity'])
        })

        test('handles rules with extra spaces around commas', async () => {
          mockReadlineAnswer = '  max-complexity  ,  max-params  '
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
          expect(result).toContain('max-params')
          expect(result.length).toBe(2)
        })

        test('handles rule IDs in uppercase (case-insensitive match)', async () => {
          mockReadlineAnswer = 'MAX-COMPLEXITY'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toContain('max-complexity')
        })

        test('returns all 3 rules when all specified', async () => {
          mockReadlineAnswer = 'max-complexity, max-params, no-await-in-loop'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toHaveLength(3)
        })

        test('returns empty array for all invalid rules', async () => {
          mockReadlineAnswer = 'invalid1, invalid2, invalid3'
          const cmd = new Init([], {} as never)
          const result = await (cmd as any).promptForRules()
          expect(result).toEqual([])
        })

        test('logs warning message for invalid rules', async () => {
          mockReadlineAnswer = 'invalid-rule'
          const cmd = new Init([], {} as never)
          await (cmd as any).promptForRules()
          const output = mockConsoleLog.mock.calls.map((c: any) => c[0]).join('\n')
          expect(output).toContain('Unknown rules ignored')
        })

        test('logs info about rules before prompting', async () => {
          mockReadlineAnswer = 'all'
          const cmd = new Init([], {} as never)
          await (cmd as any).promptForRules()
          const output = mockConsoleLog.mock.calls.map((c: any) => c[0]).join('\n')
          expect(output).toContain('Select rules to enable')
        })
      })
    })

    describe('Flag combinations in run()', () => {
      test('creates config with typescript=false format=json', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: false,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.files).toContain('**/*.js')
        expect(config.files).toContain('**/*.jsx')
        cwdSpy.mockRestore()
      })

      test('creates config with typescript=false format=js', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: false,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, 'codeforge.config.js'), 'utf-8')
        expect(content).toContain('**/*.js')
        expect(content).toContain('**/*.jsx')
        cwdSpy.mockRestore()
      })

      test('creates full config with rules in js format', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, 'codeforge.config.js'), 'utf-8')
        expect(content).toContain('max-complexity')
        expect(content).toContain('max-params')
        cwdSpy.mockRestore()
      })

      test('creates full config with rules in json format', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('interactive + non-minimal prompts for rules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'all'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules).toBeDefined()
        expect(config.rules['max-complexity']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('interactive + non-minimal with specific rule selection', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'max-params'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['max-complexity']).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('interactive + non-minimal with none selection', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'none'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('non-interactive non-minimal defaults to recommended rules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('force overwrites existing config without prompting', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{"old": "data", "keep": false}', 'utf-8')

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
        expect(config.keep).toBeUndefined()
        expect(config.files).toBeDefined()
        cwdSpy.mockRestore()
      })

      test('user confirms overwrite when config exists', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{"old": true}', 'utf-8')
        mockReadlineAnswer = 'y'

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
        expect(config.old).toBeUndefined()
        expect(config.files).toBeDefined()
        cwdSpy.mockRestore()
      })
    })

    describe('dir flag behavior', () => {
      test('creates config in specified directory', async () => {
        const subDir = path.join(tempDir, 'my-project')
        await fs.mkdir(subDir, { recursive: true })

        const cmd = createCommandWithMockedParse({
          dir: subDir,
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()

        const configPath = path.join(subDir, '.codeforgerc.json')
        const exists = await fs
          .access(configPath)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('creates JS config in specified directory', async () => {
        const subDir = path.join(tempDir, 'my-js-project')
        await fs.mkdir(subDir, { recursive: true })

        const cmd = createCommandWithMockedParse({
          dir: subDir,
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()

        const configPath = path.join(subDir, 'codeforge.config.js')
        const exists = await fs
          .access(configPath)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('creates config in nested non-existent directory', async () => {
        const nestedDir = path.join(tempDir, 'deep', 'nested', 'dir')

        const cmd = createCommandWithMockedParse({
          dir: nestedDir,
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()

        const configPath = path.join(nestedDir, '.codeforgerc.json')
        const exists = await fs
          .access(configPath)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })
    })

    describe('Output messages', () => {
      test('outputs file name in success message', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('.codeforgerc.json')
        cwdSpy.mockRestore()
      })

      test('outputs js file name when format is js', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('codeforge.config.js')
        cwdSpy.mockRestore()
      })

      test('outputs files list in configuration section', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Files:')
        expect(output).toContain('**/*.ts')
        cwdSpy.mockRestore()
      })

      test('outputs ignore list in configuration section', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Ignore:')
        expect(output).toContain('node_modules/**')
        cwdSpy.mockRestore()
      })

      test('outputs rule count when rules are present', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Rules:')
        expect(output).toContain('2 enabled')
        cwdSpy.mockRestore()
      })

      test('does not output rule count when no rules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).not.toContain('Rules:')
        cwdSpy.mockRestore()
      })

      test('outputs step 1 in next steps', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1. Review and customize the configuration')
        cwdSpy.mockRestore()
      })

      test('outputs step 2 in next steps', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('2. Run `codeforge analyze`')
        cwdSpy.mockRestore()
      })

      test('outputs step 3 in next steps', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('3. Use `codeforge rules`')
        cwdSpy.mockRestore()
      })

      test('outputs "Configuration not created" when user declines overwrite', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{"old": true}', 'utf-8')
        mockReadlineAnswer = 'n'

        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('not created')
        cwdSpy.mockRestore()
      })
    })

    describe('Examples validation', () => {
      test('each example has a command property', () => {
        for (const example of Init.examples) {
          expect(example).toHaveProperty('command')
          expect(typeof example.command).toBe('string')
        }
      })

      test('each example has a description property', () => {
        for (const example of Init.examples) {
          expect(example).toHaveProperty('description')
          expect(typeof example.description).toBe('string')
        }
      })

      test('all example commands reference the command id template', () => {
        for (const example of Init.examples) {
          expect(example.command).toContain('<%= command.id %>')
        }
      })

      test('has example for default usage', () => {
        const hasDefault = Init.examples.some((e: any) => !e.command.includes('--'))
        expect(hasDefault).toBe(true)
      })

      test('has example for interactive flag', () => {
        const hasInteractive = Init.examples.some((e: any) => e.command.includes('--interactive'))
        expect(hasInteractive).toBe(true)
      })

      test('has example for minimal flag', () => {
        const hasMinimal = Init.examples.some((e: any) => e.command.includes('--minimal'))
        expect(hasMinimal).toBe(true)
      })

      test('has example for format flag', () => {
        const hasFormat = Init.examples.some((e: any) => e.command.includes('--format'))
        expect(hasFormat).toBe(true)
      })

      test('has example for force flag', () => {
        const hasForce = Init.examples.some((e: any) => e.command.includes('--force'))
        expect(hasForce).toBe(true)
      })

      test('has example for dir flag', () => {
        const hasDir = Init.examples.some((e: any) => e.command.includes('--dir'))
        expect(hasDir).toBe(true)
      })

      test('has at least 5 examples', () => {
        expect(Init.examples.length).toBeGreaterThanOrEqual(5)
      })
    })

    describe('Edge cases', () => {
      test('run method can be called on fresh instance', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await expect(cmd.run()).resolves.toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('createCommandWithMockedParse returns valid command', () => {
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        expect(cmd).toBeDefined()
        expect(cmd).toBeInstanceOf(Init)
      })

      test('multiple runs create identical configs', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

        const cmd1 = createCommandWithMockedParse({
          format: 'json',
          force: true,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd1.run()
        const content1 = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')

        const cmd2 = createCommandWithMockedParse({
          format: 'json',
          force: true,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd2.run()
        const content2 = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')

        expect(content1).toBe(content2)
        cwdSpy.mockRestore()
      })

      test('config file is valid JSON parseable', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        expect(() => JSON.parse(content)).not.toThrow()
        cwdSpy.mockRestore()
      })

      test('js config file ends with semicolon and newline', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, 'codeforge.config.js'), 'utf-8')
        expect(content.trim()).toContain('export default')
        cwdSpy.mockRestore()
      })

      test('force=true skips overwrite confirmation', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await fs.writeFile(path.join(tempDir, '.codeforgerc.json'), '{"keep": true}', 'utf-8')

        mockReadlineAnswer = 'n'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: true,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.keep).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('creates config when existing file is .codeforgerc (no extension)', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{"old": true}', 'utf-8')
        mockReadlineAnswer = 'y'

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
        cwdSpy.mockRestore()
      })

      test('creates config when existing file is .codeforge.json', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{"old": true}', 'utf-8')
        mockReadlineAnswer = 'y'

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
        cwdSpy.mockRestore()
      })

      test('creates config when existing file is codeforge.config.js', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await fs.writeFile(path.join(tempDir, 'codeforge.config.js'), 'export default {};', 'utf-8')
        mockReadlineAnswer = 'y'

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
        cwdSpy.mockRestore()
      })
    })

    describe('Flag descriptions', () => {
      test('dir flag has description', () => {
        expect(Init.flags.dir.description).toBeDefined()
        expect(Init.flags.dir.description.length).toBeGreaterThan(0)
      })

      test('force flag has description', () => {
        expect(Init.flags.force.description).toBeDefined()
        expect(Init.flags.force.description.length).toBeGreaterThan(0)
      })

      test('format flag has description', () => {
        expect(Init.flags.format.description).toBeDefined()
        expect(Init.flags.format.description.length).toBeGreaterThan(0)
      })

      test('interactive flag has description', () => {
        expect(Init.flags.interactive.description).toBeDefined()
        expect(Init.flags.interactive.description.length).toBeGreaterThan(0)
      })

      test('minimal flag has description', () => {
        expect(Init.flags.minimal.description).toBeDefined()
        expect(Init.flags.minimal.description.length).toBeGreaterThan(0)
      })

      test('typescript flag has description', () => {
        expect(Init.flags.typescript.description).toBeDefined()
        expect(Init.flags.typescript.description.length).toBeGreaterThan(0)
      })

      test('minimal flag does not have a char', () => {
        expect(Init.flags.minimal.char).toBeUndefined()
      })

      test('dir flag does not have a char', () => {
        expect(Init.flags.dir.char).toBeUndefined()
      })
    })

    describe('Config file content validation', () => {
      test('json config has correct files for typescript', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
        cwdSpy.mockRestore()
      })

      test('json config has correct ignore patterns', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.ignore).toContain('node_modules/**')
        expect(config.ignore).toContain('dist/**')
        expect(config.ignore).toContain('coverage/**')
        cwdSpy.mockRestore()
      })

      test('js config has correct files for non-typescript', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: false,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, 'codeforge.config.js'), 'utf-8')
        expect(content).toContain('**/*.ts')
        expect(content).toContain('**/*.tsx')
        expect(content).toContain('**/*.js')
        expect(content).toContain('**/*.jsx')
        cwdSpy.mockRestore()
      })

      test('json full config has rules with error severity', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        const ruleValues = Object.values(config.rules)
        for (const val of ruleValues) {
          expect(val).toBe('error')
        }
        cwdSpy.mockRestore()
      })

      test('json config does not have plugins field', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.plugins).toBeUndefined()
        cwdSpy.mockRestore()
      })
    })

    describe('Overwrite behavior', () => {
      test('does not overwrite when force=false and user declines', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{"preserved": true}', 'utf-8')
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
        expect(config.preserved).toBe(true)
        cwdSpy.mockRestore()
      })

      test('overwrites when force=true regardless of existing config', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{"willBeGone": true}', 'utf-8')

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
        expect(config.willBeGone).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('overwrites when user answers yes to prompt', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{"old": true}', 'utf-8')
        mockReadlineAnswer = 'yes'

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
        expect(config.old).toBeUndefined()
        expect(config.files).toBeDefined()
        cwdSpy.mockRestore()
      })

      test('no prompt when no existing config', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'n'

        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const exists = await fs
          .access(path.join(tempDir, '.codeforgerc.json'))
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
        cwdSpy.mockRestore()
      })
    })

    describe('Interactive mode behavior', () => {
      test('interactive=true minimal=true does not prompt', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'should-not-be-used'

        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('interactive=true minimal=false prompts and uses selected rules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'max-complexity, no-await-in-loop'

        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('error')
        expect(config.rules['max-params']).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('interactive=false minimal=false uses recommended rules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('interactive=true minimal=false with "all" gives recommended', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'all'

        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('interactive=true minimal=false with empty input gives no rules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = ''

        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules).toBeUndefined()
        cwdSpy.mockRestore()
      })
    })

    describe('Additional flag combination tests', () => {
      test('all flags default: format=json force=false interactive=false minimal=false typescript=true', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
        expect(config.ignore).toContain('node_modules/**')
        expect(config.rules['max-complexity']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('all flags off: minimal=true typescript=false format=json', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: false,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.files).toHaveLength(4)
        expect(config.rules).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('format=js minimal=false produces rules in js output', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, 'codeforge.config.js'), 'utf-8')
        expect(content).toContain('"max-complexity": "error"')
        expect(content).toContain('"max-params": "error"')
        cwdSpy.mockRestore()
      })

      test('format=js typescript=false includes js patterns', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: false,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, 'codeforge.config.js'), 'utf-8')
        expect(content).toContain('**/*.js')
        cwdSpy.mockRestore()
      })

      test('interactive=true minimal=false typescript=false with rule selection', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'max-complexity'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: false,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.files).toContain('**/*.js')
        expect(config.rules['max-complexity']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('force=true with existing codeforge.config.js overwrites with json', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const jsPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(jsPath, 'export default {};', 'utf-8')
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: true,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const jsonPath = path.join(tempDir, '.codeforgerc.json')
        const exists = await fs
          .access(jsonPath)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
        cwdSpy.mockRestore()
      })

      test('creates .codeforgerc.json not codeforge.config.js when format=json', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const jsonExists = await fs
          .access(path.join(tempDir, '.codeforgerc.json'))
          .then(() => true)
          .catch(() => false)
        const jsExists = await fs
          .access(path.join(tempDir, 'codeforge.config.js'))
          .then(() => true)
          .catch(() => false)
        expect(jsonExists).toBe(true)
        expect(jsExists).toBe(false)
        cwdSpy.mockRestore()
      })

      test('creates codeforge.config.js not .codeforgerc.json when format=js', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const jsonExists = await fs
          .access(path.join(tempDir, '.codeforgerc.json'))
          .then(() => true)
          .catch(() => false)
        const jsExists = await fs
          .access(path.join(tempDir, 'codeforge.config.js'))
          .then(() => true)
          .catch(() => false)
        expect(jsonExists).toBe(false)
        expect(jsExists).toBe(true)
        cwdSpy.mockRestore()
      })

      test('interactive=true minimal=false with none produces no rules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'none'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('dir flag with absolute path', async () => {
        const subDir = path.join(tempDir, 'absolute-test')
        await fs.mkdir(subDir, { recursive: true })
        const cmd = createCommandWithMockedParse({
          dir: subDir,
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const exists = await fs
          .access(path.join(subDir, '.codeforgerc.json'))
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('dir flag creates parent directories', async () => {
        const deepDir = path.join(tempDir, 'a', 'b', 'c')
        const cmd = createCommandWithMockedParse({
          dir: deepDir,
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const exists = await fs
          .access(path.join(deepDir, '.codeforgerc.json'))
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('successive runs with force=true produce same content', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd1 = createCommandWithMockedParse({
          format: 'json',
          force: true,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd1.run()
        const content1 = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')

        vi.clearAllMocks()
        const cmd2 = createCommandWithMockedParse({
          format: 'json',
          force: true,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd2.run()
        const content2 = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        expect(content1).toBe(content2)
        cwdSpy.mockRestore()
      })

      test('js format contains type annotation for CodeForgeConfig', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'js',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, 'codeforge.config.js'), 'utf-8')
        expect(content).toContain("@type {import('codeforge').CodeForgeConfig}")
        cwdSpy.mockRestore()
      })

      test('non-minimal config with all rules selected explicitly', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'max-complexity, max-params, no-await-in-loop'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(Object.keys(config.rules)).toHaveLength(3)
        cwdSpy.mockRestore()
      })

      test('json output has no trailing comma', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        expect(() => JSON.parse(content)).not.toThrow()
        cwdSpy.mockRestore()
      })

      test('typescript=true config has exactly ts and tsx patterns', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
        cwdSpy.mockRestore()
      })

      test('config ignore matches DEFAULT_CONFIG ignore', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.ignore).toEqual(['node_modules/**', 'dist/**', 'coverage/**'])
        cwdSpy.mockRestore()
      })

      test('promptForRules with trailing comma in input', async () => {
        mockReadlineAnswer = 'max-complexity,'
        const cmd = new Init([], {} as never)
        const result = await (cmd as any).promptForRules()
        expect(result).toContain('max-complexity')
        expect(result.length).toBe(1)
      })

      test('promptForRules with leading comma in input', async () => {
        mockReadlineAnswer = ',max-params'
        const cmd = new Init([], {} as never)
        const result = await (cmd as any).promptForRules()
        expect(result).toContain('max-params')
        expect(result.length).toBe(1)
      })

      test('promptForRules with multiple consecutive commas', async () => {
        mockReadlineAnswer = 'max-complexity,,max-params'
        const cmd = new Init([], {} as never)
        const result = await (cmd as any).promptForRules()
        expect(result).toContain('max-complexity')
        expect(result).toContain('max-params')
        expect(result.length).toBe(2)
      })
    })

    describe('Profile flag', () => {
      test('profile flag is defined', () => {
        expect(Init.flags.profile).toBeDefined()
      })

      test('profile flag has char p', () => {
        expect(Init.flags.profile.char).toBe('p')
      })

      test('profile flag has correct options', () => {
        expect(Init.flags.profile.options).toContain('lenient')
        expect(Init.flags.profile.options).toContain('moderate')
        expect(Init.flags.profile.options).toContain('strict')
      })

      test('profile flag has default undefined', () => {
        expect(Init.flags.profile.default).toBeUndefined()
      })

      test('profile flag has description', () => {
        expect(Init.flags.profile.description).toBeDefined()
        expect(Init.flags.profile.description.length).toBeGreaterThan(0)
      })

      test('non-interactive with --profile strict creates config with strict profile', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          profile: 'strict',
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('non-interactive with --profile moderate creates config with moderate profile', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          profile: 'moderate',
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('warning')
        cwdSpy.mockRestore()
      })

      test('non-interactive with --profile lenient creates config with lenient profile', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          profile: 'lenient',
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('warning')
        expect(config.rules['max-params']).toBe('warning')
        expect(config.rules['no-await-in-loop']).toBe('info')
        cwdSpy.mockRestore()
      })

      test('non-interactive --profile strict --minimal=true creates config with profile overriding minimal', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: true,
          profile: 'strict',
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('non-interactive --profile strict --minimal=false creates full config with profile', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: false,
          minimal: false,
          profile: 'strict',
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('interactive with profile set skips wizard and uses profile', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'should-not-be-used'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          profile: 'strict',
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('interactive without profile and user picks lenient', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'lenient'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('warning')
        expect(config.rules['max-params']).toBe('warning')
        expect(config.rules['no-await-in-loop']).toBe('info')
        cwdSpy.mockRestore()
      })

      test('interactive without profile and user picks strict', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'strict'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('error')
        cwdSpy.mockRestore()
      })

      test('interactive without profile and user picks custom falls through to promptForRules', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'all'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBeUndefined()
        cwdSpy.mockRestore()
      })

      test('interactive without profile and user picks moderate', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'moderate'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: false,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules['max-complexity']).toBe('error')
        expect(config.rules['max-params']).toBe('error')
        expect(config.rules['no-await-in-loop']).toBe('warning')
        cwdSpy.mockRestore()
      })

      test('interactive minimal=true skips profile prompt', async () => {
        const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        mockReadlineAnswer = 'strict'
        const cmd = createCommandWithMockedParse({
          format: 'json',
          force: false,
          interactive: true,
          minimal: true,
          typescript: true,
        })
        await cmd.run()
        const content = await fs.readFile(path.join(tempDir, '.codeforgerc.json'), 'utf-8')
        const config = JSON.parse(content)
        expect(config.rules).toBeUndefined()
        cwdSpy.mockRestore()
      })
    })
  })
})
