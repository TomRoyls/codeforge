import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GeneratePlugin from '../../../src/commands/generate-plugin.js'

describe('GeneratePlugin Command', () => {
  let tempDir: string
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-plugin-'))
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
    mockConsoleLog.mockRestore()
  })

  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown>,
  ) {
    const command = new GeneratePlugin([], {} as never)
    const cmdWithMock = command as unknown as {
      parse: ReturnType<typeof vi.fn>
    }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  describe('command metadata', () => {
    it('has correct description', () => {
      expect(GeneratePlugin.description).toContain('Generate a new CodeForge plugin scaffold')
    })

    it('has all required flags', () => {
      expect(GeneratePlugin.flags).toBeDefined()
      expect(GeneratePlugin.flags.typescript).toBeDefined()
      expect(GeneratePlugin.flags.rule).toBeDefined()
      expect(GeneratePlugin.flags.output).toBeDefined()
      expect(GeneratePlugin.flags.force).toBeDefined()
    })

    it('has correct args defined', () => {
      expect(GeneratePlugin.args).toBeDefined()
      expect(GeneratePlugin.args.name).toBeDefined()
      expect(GeneratePlugin.args.name.required).toBe(true)
    })

    it('has examples defined', () => {
      expect(GeneratePlugin.examples).toBeDefined()
      expect(Array.isArray(GeneratePlugin.examples)).toBe(true)
      expect(GeneratePlugin.examples.length).toBeGreaterThan(0)
    })
  })

  describe('plugin generation', () => {
    it('generates basic plugin structure', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )
      await cmd.run()

      const pluginDir = path.join(tempDir, 'testplugin')
      expect(existsSync(pluginDir)).toBe(true)
      expect(existsSync(path.join(pluginDir, 'package.json'))).toBe(true)
      expect(existsSync(path.join(pluginDir, 'README.md'))).toBe(true)
      expect(existsSync(path.join(pluginDir, '.gitignore'))).toBe(true)
    })

    it('generates TypeScript plugin with tsconfig.json', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )
      await cmd.run()

      const pluginDir = path.join(tempDir, 'testplugin')
      expect(existsSync(path.join(pluginDir, 'tsconfig.json'))).toBe(true)
    })

    it('generates rule file with custom rule name', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'customrule', force: false },
        { name: 'testplugin' },
      )
      await cmd.run()

      const pluginDir = path.join(tempDir, 'testplugin')
      const ruleFile = path.join(pluginDir, 'src', 'rules', 'customrule.ts')
      expect(existsSync(ruleFile)).toBe(true)
    })

    it('generates test file for rule', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'customrule', force: false },
        { name: 'testplugin' },
      )
      await cmd.run()

      const pluginDir = path.join(tempDir, 'testplugin')
      const testFile = path.join(pluginDir, 'test', 'rules', 'customrule.test.ts')
      expect(existsSync(testFile)).toBe(true)
    })

    it('generates valid package.json', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )
      await cmd.run()

      const packageJsonPath = path.join(tempDir, 'testplugin', 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const pkg = JSON.parse(content)

      expect(pkg.description).toContain('testplugin')
      expect(pkg.keywords).toContain('codeforge')
      expect(pkg.keywords).toContain('plugin')
      expect(pkg.license).toBe('MIT')
    })

    it('generates valid package.json for TypeScript', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )
      await cmd.run()

      const packageJsonPath = path.join(tempDir, 'testplugin', 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const pkg = JSON.parse(content)

      expect(pkg.main).toBe('dist/index.js')
      expect(pkg.scripts.build).toBe('tsc')
      expect(pkg.scripts.test).toBe('vitest run')
    })

    it('allows generation with --force flag when directory exists', async () => {
      const pluginDir = path.join(tempDir, 'testplugin')
      await fs.mkdir(pluginDir, { recursive: true })
      await fs.writeFile(path.join(pluginDir, 'existing.txt'), 'old content')

      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: true },
        { name: 'testplugin' },
      )

      // Should not throw error when force flag is set
      await expect(cmd.run()).resolves.not.toThrow()

      // New files should be created
      expect(existsSync(path.join(pluginDir, 'package.json'))).toBe(true)
    })
  })
})
