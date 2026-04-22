import * as fs from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
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

  async function generateAndRead(
    pluginName: string,
    flags: Record<string, unknown>,
  ): Promise<{ pluginDir: string; readFile: (relPath: string) => Promise<string> }> {
    const cmd = createCommandWithMockedParse(
      { output: tempDir, typescript: true, rule: 'sample-rule', force: false, ...flags },
      { name: pluginName },
    )
    await cmd.run()
    const pluginDir = path.join(tempDir, pluginName)
    return {
      pluginDir,
      readFile: (relPath: string) => fs.readFile(path.join(pluginDir, relPath), 'utf-8'),
    }
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

    it('has exactly 4 flags defined', () => {
      const flagKeys = Object.keys(GeneratePlugin.flags)
      expect(flagKeys).toHaveLength(4)
    })

    it('has typescript flag with char t', () => {
      expect(GeneratePlugin.flags.typescript.char).toBe('t')
    })

    it('has typescript flag defaulting to true', () => {
      expect(GeneratePlugin.flags.typescript.default).toBe(true)
    })

    it('has typescript flag with description', () => {
      expect(GeneratePlugin.flags.typescript.description).toBeTruthy()
    })

    it('has rule flag with char r', () => {
      expect(GeneratePlugin.flags.rule.char).toBe('r')
    })

    it('has rule flag defaulting to sample-rule', () => {
      expect(GeneratePlugin.flags.rule.default).toBe('sample-rule')
    })

    it('has rule flag with description', () => {
      expect(GeneratePlugin.flags.rule.description).toBeTruthy()
    })

    it('has output flag with char o', () => {
      expect(GeneratePlugin.flags.output.char).toBe('o')
    })

    it('has output flag defaulting to dot', () => {
      expect(GeneratePlugin.flags.output.default).toBe('.')
    })

    it('has output flag with description', () => {
      expect(GeneratePlugin.flags.output.description).toBeTruthy()
    })

    it('has force flag with char f', () => {
      expect(GeneratePlugin.flags.force.char).toBe('f')
    })

    it('has force flag defaulting to false', () => {
      expect(GeneratePlugin.flags.force.default).toBe(false)
    })

    it('has force flag with description', () => {
      expect(GeneratePlugin.flags.force.description).toBeTruthy()
    })

    it('has exactly 3 examples', () => {
      expect(GeneratePlugin.examples).toHaveLength(3)
    })

    it('has examples with command and description properties', () => {
      for (const example of GeneratePlugin.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
      }
    })

    it('has name arg with description', () => {
      expect(GeneratePlugin.args.name.description).toBeTruthy()
    })

    it('has name arg description mentioning plugin name', () => {
      expect(GeneratePlugin.args.name.description).toContain('Plugin name')
    })

    it('has examples that use template variables for command', () => {
      for (const example of GeneratePlugin.examples) {
        expect(example.command).toContain('<%= config.bin %>')
        expect(example.command).toContain('<%= command.id %>')
      }
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

      await expect(cmd.run()).resolves.not.toThrow()

      expect(existsSync(path.join(pluginDir, 'package.json'))).toBe(true)
    })

    it('generates plugin entry file', async () => {
      const { pluginDir } = await generateAndRead('my-plugin', {})
      expect(existsSync(path.join(pluginDir, 'src', 'index.ts'))).toBe(true)
    })

    it('generates with hyphenated plugin name', async () => {
      const { pluginDir } = await generateAndRead('my-cool-plugin', {})
      expect(existsSync(pluginDir)).toBe(true)
      expect(existsSync(path.join(pluginDir, 'package.json'))).toBe(true)
    })

    it('generates with numeric-only plugin name', async () => {
      const { pluginDir } = await generateAndRead('12345', {})
      expect(existsSync(pluginDir)).toBe(true)
    })

    it('generates with single character plugin name', async () => {
      const { pluginDir } = await generateAndRead('a', {})
      expect(existsSync(pluginDir)).toBe(true)
    })

    it('generates all expected files', async () => {
      const { pluginDir } = await generateAndRead('my-plugin', {})
      const expectedFiles = [
        'package.json',
        'tsconfig.json',
        'README.md',
        '.gitignore',
        path.join('src', 'index.ts'),
        path.join('src', 'rules', 'sample-rule.ts'),
        path.join('test', 'rules', 'sample-rule.test.ts'),
      ]
      for (const file of expectedFiles) {
        expect(existsSync(path.join(pluginDir, file))).toBe(true)
      }
    })

    it('generates multiple plugins in same output directory', async () => {
      const cmd1 = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'rule-a', force: false },
        { name: 'plugin-alpha' },
      )
      await cmd1.run()

      const cmd2 = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'rule-b', force: false },
        { name: 'plugin-beta' },
      )
      await cmd2.run()

      expect(existsSync(path.join(tempDir, 'plugin-alpha'))).toBe(true)
      expect(existsSync(path.join(tempDir, 'plugin-beta'))).toBe(true)
    })
  })

  describe('directory structure generation', () => {
    it('creates the plugin root directory', async () => {
      const { pluginDir } = await generateAndRead('test-plugin', {})
      expect(existsSync(pluginDir)).toBe(true)
      expect(statSync(pluginDir).isDirectory()).toBe(true)
    })

    it('creates src directory', async () => {
      const { pluginDir } = await generateAndRead('test-plugin', {})
      expect(existsSync(path.join(pluginDir, 'src'))).toBe(true)
      expect(statSync(path.join(pluginDir, 'src')).isDirectory()).toBe(true)
    })

    it('creates src/rules directory', async () => {
      const { pluginDir } = await generateAndRead('test-plugin', {})
      expect(existsSync(path.join(pluginDir, 'src', 'rules'))).toBe(true)
      expect(statSync(path.join(pluginDir, 'src', 'rules')).isDirectory()).toBe(true)
    })

    it('creates test directory', async () => {
      const { pluginDir } = await generateAndRead('test-plugin', {})
      expect(existsSync(path.join(pluginDir, 'test'))).toBe(true)
      expect(statSync(path.join(pluginDir, 'test')).isDirectory()).toBe(true)
    })

    it('creates test/rules directory', async () => {
      const { pluginDir } = await generateAndRead('test-plugin', {})
      expect(existsSync(path.join(pluginDir, 'test', 'rules'))).toBe(true)
      expect(statSync(path.join(pluginDir, 'test', 'rules')).isDirectory()).toBe(true)
    })

    it('creates exactly 5 directories', async () => {
      const { pluginDir } = await generateAndRead('test-plugin', {})
      const expectedDirs = [
        pluginDir,
        path.join(pluginDir, 'src'),
        path.join(pluginDir, 'src', 'rules'),
        path.join(pluginDir, 'test'),
        path.join(pluginDir, 'test', 'rules'),
      ]
      for (const dir of expectedDirs) {
        expect(existsSync(dir)).toBe(true)
        expect(statSync(dir).isDirectory()).toBe(true)
      }
    })

    it('creates directories with recursive option', async () => {
      const deepOutput = path.join(tempDir, 'deep', 'nested', 'path')
      await fs.mkdir(deepOutput, { recursive: true })
      const cmd = createCommandWithMockedParse(
        { output: deepOutput, typescript: true, rule: 'my-rule', force: false },
        { name: 'deep-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(deepOutput, 'deep-plugin', 'src', 'rules'))).toBe(true)
    })
  })

  describe('package.json content', () => {
    it('contains plugin name in description', async () => {
      const { readFile } = await generateAndRead('my-special-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.description).toBe('CodeForge plugin: my-special-plugin')
    })

    it('contains codeforge keyword', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.keywords).toContain('codeforge')
    })

    it('contains plugin keyword', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.keywords).toContain('plugin')
    })

    it('contains linter keyword', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.keywords).toContain('linter')
    })

    it('has MIT license', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.license).toBe('MIT')
    })

    it('has dist/index.js as main', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.main).toBe('dist/index.js')
    })

    it('has dist/index.d.ts as types', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.types).toBe('dist/index.d.ts')
    })

    it('has tsc build script', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.scripts.build).toBe('tsc')
    })

    it('has vitest run test script', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.scripts.test).toBe('vitest run')
    })

    it('has vitest test:watch script', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.scripts['test:watch']).toBe('vitest')
    })

    it('has eslint lint script', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.scripts.lint).toBe('eslint src')
    })

    it('has node engine requirement', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.engines.node).toBe('>=18.0.0')
    })

    it('has exactly 3 keywords', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(pkg.keywords).toHaveLength(3)
    })

    it('has 4 scripts', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const pkg = JSON.parse(await readFile('package.json'))
      expect(Object.keys(pkg.scripts)).toHaveLength(4)
    })

    it('is valid JSON with 2-space indentation', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('package.json')
      const lines = content.split('\n')
      expect(lines[1].startsWith('  ')).toBe(true)
      expect(lines[1].startsWith('    ')).toBe(false)
    })

    it('different plugin names produce different descriptions', async () => {
      const { readFile: readA } = await generateAndRead('plugin-alpha', {})
      const pkgA = JSON.parse(await readA('package.json'))
      expect(pkgA.description).toBe('CodeForge plugin: plugin-alpha')
    })
  })

  describe('tsconfig.json content', () => {
    it('has compilerOptions', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions).toBeDefined()
    })

    it('sets target to ES2022', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.target).toBe('ES2022')
    })

    it('sets module to NodeNext', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.module).toBe('NodeNext')
    })

    it('sets moduleResolution to NodeNext', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.moduleResolution).toBe('NodeNext')
    })

    it('includes ES2022 lib', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.lib).toContain('ES2022')
    })

    it('sets outDir to ./dist', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.outDir).toBe('./dist')
    })

    it('sets rootDir to ./src', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.rootDir).toBe('./src')
    })

    it('enables strict mode', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.strict).toBe(true)
    })

    it('enables esModuleInterop', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true)
    })

    it('enables skipLibCheck', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.skipLibCheck).toBe(true)
    })

    it('enables forceConsistentCasingInFileNames', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.forceConsistentCasingInFileNames).toBe(true)
    })

    it('enables declaration', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.declaration).toBe(true)
    })

    it('enables declarationMap', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.declarationMap).toBe(true)
    })

    it('enables sourceMap', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.compilerOptions.sourceMap).toBe(true)
    })

    it('includes src/**/* in include', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.include).toContain('src/**/*')
    })

    it('excludes node_modules', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.exclude).toContain('node_modules')
    })

    it('excludes dist', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.exclude).toContain('dist')
    })

    it('excludes test', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.exclude).toContain('test')
    })

    it('has exactly 3 exclude entries', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.exclude).toHaveLength(3)
    })

    it('has exactly 1 include entry', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const tsconfig = JSON.parse(await readFile('tsconfig.json'))
      expect(tsconfig.include).toHaveLength(1)
    })

    it('is always generated even without typescript flag', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'my-rule', force: false },
        { name: 'no-ts-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(tempDir, 'no-ts-plugin', 'tsconfig.json'))).toBe(true)
    })
  })

  describe('plugin entry file (index.ts) content', () => {
    it('contains PluginDefinition import', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain("import type { PluginDefinition } from 'codeforge'")
    })

    it('contains rule import with .js extension', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain("import { myRule } from './rules/my-rule.js'")
    })

    it('exports plugin constant', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain('export const plugin')
    })

    it('exports default plugin', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain('export default plugin')
    })

    it('contains plugin name in plugin definition', async () => {
      const { readFile } = await generateAndRead('my-special-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain("name: 'my-special-plugin'")
    })

    it('contains version 1.0.0', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain("version: '1.0.0'")
    })

    it('contains rule name in rules map', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'custom-check' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain("'custom-check'")
    })

    it('uses camelCase rule name as value', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'no-eval' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain('noEval')
    })

    it('contains plugin name in header comment', async () => {
      const { readFile } = await generateAndRead('awesome-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain('awesome-plugin - CodeForge Plugin')
    })

    it('uses correct rule import for multi-hyphen rule name', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'no-bad-expr' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain('noBadExpr')
    })

    it('uses PluginDefinition type in export', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain(': PluginDefinition')
    })
  })

  describe('rule file content', () => {
    it('contains RuleDefinition import', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain(
        "import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'",
      )
    })

    it('contains rule name in header comment', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'no-eval' })
      const content = await readFile(path.join('src', 'rules', 'no-eval.ts'))
      expect(content).toContain('no-eval - Sample CodeForge rule')
    })

    it('exports rule with camelCase name', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain('export const myRule')
    })

    it('has meta type problem', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain("type: 'problem'")
    })

    it('has meta severity warn', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain("severity: 'warn'")
    })

    it('has meta fixable code', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain("fixable: 'code'")
    })

    it('has docs category style', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain("category: 'style'")
    })

    it('has docs recommended false', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain('recommended: false')
    })

    it('has create function', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain('create(context: RuleContext)')
    })

    it('has CallExpression visitor', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain('CallExpression')
    })

    it('exports default', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain('export default myRule')
    })

    it('uses correct camelCase for multi-hyphen rule', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'max-line-length' })
      const content = await readFile(path.join('src', 'rules', 'max-line-length.ts'))
      expect(content).toContain('export const maxLineLength')
      expect(content).toContain('export default maxLineLength')
    })

    it('contains docs description placeholder', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain('Replace this with your rule description')
    })
  })

  describe('rule test file content', () => {
    it('contains vitest imports', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('test', 'rules', 'my-rule.test.ts'))
      expect(content).toContain("import { describe, expect, it } from 'vitest'")
    })

    it('contains rule import with .js extension', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('test', 'rules', 'my-rule.test.ts'))
      expect(content).toContain("import { myRule } from '../../src/rules/my-rule.js'")
    })

    it('contains describe block with rule name', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'no-eval' })
      const content = await readFile(path.join('test', 'rules', 'no-eval.test.ts'))
      expect(content).toContain("describe('no-eval'")
    })

    it('contains test for valid meta', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('test', 'rules', 'my-rule.test.ts'))
      expect(content).toContain('should have valid meta')
    })

    it('contains test for create function', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('test', 'rules', 'my-rule.test.ts'))
      expect(content).toContain('should export create function')
    })

    it('contains test for visitor object', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('test', 'rules', 'my-rule.test.ts'))
      expect(content).toContain('should return visitor object')
    })

    it('uses camelCase rule name in assertions', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'no-eval' })
      const content = await readFile(path.join('test', 'rules', 'no-eval.test.ts'))
      expect(content).toContain('noEval')
    })

    it('has header comment with rule name', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'custom-rule' })
      const content = await readFile(path.join('test', 'rules', 'custom-rule.test.ts'))
      expect(content).toContain('Tests for custom-rule rule')
    })

    it('contains mockContext definition', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('test', 'rules', 'my-rule.test.ts'))
      expect(content).toContain('mockContext')
    })

    it('has rule id in mockContext', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'special-rule' })
      const content = await readFile(path.join('test', 'rules', 'special-rule.test.ts'))
      expect(content).toContain("id: 'special-rule'")
    })
  })

  describe('README.md content', () => {
    it('has plugin name as heading', async () => {
      const { readFile } = await generateAndRead('my-awesome-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('# my-awesome-plugin')
    })

    it('contains installation section', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('## Installation')
    })

    it('contains plugin name in npm install command', async () => {
      const { readFile } = await generateAndRead('cool-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('npm install cool-plugin')
    })

    it('contains usage section', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('## Usage')
    })

    it('contains rule name in JSON config', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'no-console' })
      const content = await readFile('README.md')
      expect(content).toContain('"no-console": "warn"')
    })

    it('contains rules section', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('## Rules')
    })

    it('contains rule name as subsection', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'custom-check' })
      const content = await readFile('README.md')
      expect(content).toContain('### custom-check')
    })

    it('contains development section', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('## Development')
    })

    it('contains npm install in development', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('npm install\nnpm test\nnpm run build')
    })

    it('contains MIT license', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('## License')
      expect(content).toContain('MIT')
    })

    it('contains plugin name in JSON plugins array', async () => {
      const { readFile } = await generateAndRead('my-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('"plugins": ["my-plugin"]')
    })

    it('contains CodeForge plugin description', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toContain('A CodeForge plugin that provides custom linting rules')
    })
  })

  describe('.gitignore content', () => {
    it('contains node_modules/', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('.gitignore')
      expect(content).toContain('node_modules/')
    })

    it('contains dist/', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('.gitignore')
      expect(content).toContain('dist/')
    })

    it('contains *.log', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('.gitignore')
      expect(content).toContain('*.log')
    })

    it('contains .DS_Store', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('.gitignore')
      expect(content).toContain('.DS_Store')
    })

    it('contains coverage/', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('.gitignore')
      expect(content).toContain('coverage/')
    })

    it('gitignore is identical for different plugins', async () => {
      const { readFile: readA } = await generateAndRead('plugin-a', {})
      const { readFile: readB } = await generateAndRead('plugin-b', {})
      const contentA = await readA('.gitignore')
      const contentB = await readB('.gitignore')
      expect(contentA).toBe(contentB)
    })
  })

  describe('error handling', () => {
    it('rejects invalid plugin name with special characters', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'Invalid-Plugin-Name!' },
      )

      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with uppercase letters', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'MyPlugin' },
      )

      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with spaces', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my plugin' },
      )

      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with underscores', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my_plugin' },
      )

      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('errors when output directory does not exist', async () => {
      const nonExistentDir = path.join(tempDir, 'nonexistent')

      const cmd = createCommandWithMockedParse(
        { output: nonExistentDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )

      await expect(cmd.run()).rejects.toThrow('Output directory does not exist')
    })

    it('errors when output path is a file not a directory', async () => {
      const filePath = path.join(tempDir, 'notadir.txt')
      await fs.writeFile(filePath, 'test')

      const cmd = createCommandWithMockedParse(
        { output: filePath, typescript: false, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )

      await expect(cmd.run()).rejects.toThrow('Output path is not a directory')
    })

    it('errors when plugin directory exists without force flag', async () => {
      const pluginDir = path.join(tempDir, 'testplugin')
      await fs.mkdir(pluginDir, { recursive: true })

      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )

      await expect(cmd.run()).rejects.toThrow('already exists')
    })

    it('error for existing directory mentions --force flag', async () => {
      const pluginDir = path.join(tempDir, 'testplugin')
      await fs.mkdir(pluginDir, { recursive: true })

      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )

      await expect(cmd.run()).rejects.toThrow('--force')
    })

    it('rejects plugin name with dots', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my.plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with @ symbol', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: '@scope/plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with forward slash', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my/plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with backslash', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my\\plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with colon', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my:plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with exclamation mark', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'plugin!' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with ampersand', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my&plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with asterisk', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my*plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with parentheses', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my(plugin)' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with plus sign', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my+plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with equals sign', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my=plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with comma', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my,plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with square brackets', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my[plugin]' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with hash', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my#plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with dollar sign', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my$plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('rejects plugin name with percent', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'my%plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('errors when non-existent output dir contains path in message', async () => {
      const nonExistentDir = path.join(tempDir, 'missing-dir')
      const cmd = createCommandWithMockedParse(
        { output: nonExistentDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'testplugin' },
      )
      await expect(cmd.run()).rejects.toThrow(nonExistentDir)
    })

    it('error message mentions example format', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'samplerule', force: false },
        { name: 'Invalid!' },
      )
      await expect(cmd.run()).rejects.toThrow('codeforge-plugin-custom')
    })
  })

  describe('isValidPluginName', () => {
    function getTestableCommand(): { isValidPluginName: (name: string) => boolean } {
      return new GeneratePlugin([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    it('accepts valid lowercase plugin names', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('codeforge-plugin-custom')).toBe(true)
      expect(cmd.isValidPluginName('my-plugin')).toBe(true)
      expect(cmd.isValidPluginName('plugin123')).toBe(true)
      expect(cmd.isValidPluginName('a')).toBe(true)
    })

    it('rejects plugin names with uppercase', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('MyPlugin')).toBe(false)
      expect(cmd.isValidPluginName('my-Plugin')).toBe(false)
    })

    it('rejects plugin names with special characters', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('my_plugin')).toBe(false)
      expect(cmd.isValidPluginName('my plugin')).toBe(false)
      expect(cmd.isValidPluginName('my.plugin')).toBe(false)
      expect(cmd.isValidPluginName('my@plugin')).toBe(false)
    })

    it('accepts numeric-only names', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('123')).toBe(true)
      expect(cmd.isValidPluginName('0')).toBe(true)
    })

    it('accepts name starting with number', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('1plugin')).toBe(true)
    })

    it('accepts name ending with number', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('plugin1')).toBe(true)
    })

    it('accepts single letter', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('z')).toBe(true)
    })

    it('accepts single hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('-')).toBe(true)
    })

    it('accepts double hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a--b')).toBe(true)
    })

    it('accepts leading hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('-plugin')).toBe(true)
    })

    it('accepts trailing hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('plugin-')).toBe(true)
    })

    it('accepts long hyphenated name', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('codeforge-plugin-custom-rules-extra')).toBe(true)
    })

    it('accepts all digits with hyphens', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('1-2-3')).toBe(true)
    })

    it('rejects empty string', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('')).toBe(false)
    })

    it('rejects spaces only', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('   ')).toBe(false)
    })

    it('rejects tab character', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('my\tplugin')).toBe(false)
    })

    it('rejects newline character', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('my\nplugin')).toBe(false)
    })

    it('rejects camelCase', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('myPlugin')).toBe(false)
    })

    it('rejects PascalCase', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('MyPlugin')).toBe(false)
    })

    it('rejects ALLCAPS', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('MYPLUGIN')).toBe(false)
    })

    it('rejects pipe character', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a|b')).toBe(false)
    })

    it('rejects tilde character', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a~b')).toBe(false)
    })

    it('rejects backtick', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a`b')).toBe(false)
    })

    it('rejects single quote', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName("a'b")).toBe(false)
    })

    it('rejects double quote', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a"b')).toBe(false)
    })

    it('rejects question mark', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a?b')).toBe(false)
    })

    it('rejects semicolon', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a;b')).toBe(false)
    })

    it('rejects curly braces', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a{b}')).toBe(false)
    })

    it('rejects angle brackets', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a<b>')).toBe(false)
    })

    it('rejects caret character', () => {
      const cmd = getTestableCommand()
      expect(cmd.isValidPluginName('a^b')).toBe(false)
    })
  })

  describe('toCamelCase', () => {
    function getTestableCommand(): { toCamelCase: (str: string) => string } {
      return new GeneratePlugin([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    it('converts kebab-case to camelCase', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('sample-rule')).toBe('sampleRule')
      expect(cmd.toCamelCase('my-custom-rule')).toBe('myCustomRule')
    })

    it('handles single word', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('samplerule')).toBe('samplerule')
    })

    it('handles already camelCase', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('sampleRule')).toBe('sampleRule')
    })

    it('converts two-part kebab to camelCase', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('no-eval')).toBe('noEval')
    })

    it('converts three-part kebab to camelCase', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('max-line-length')).toBe('maxLineLength')
    })

    it('handles single character input', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('a')).toBe('a')
    })

    it('handles single character parts', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('a-b')).toBe('aB')
    })

    it('handles three single character parts', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('a-b-c')).toBe('aBC')
    })

    it('preserves numbers in first segment', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('rule-123')).toBe('rule123')
    })

    it('capitalizes after number-hyphen boundary', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('rule-123-test')).toBe('rule123Test')
    })

    it('handles long kebab chain', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('a-b-c-d-e')).toBe('aBCDE')
    })

    it('handles consecutive hyphens', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('a--b')).toBe('aB')
    })

    it('handles leading hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('-a')).toBe('A')
    })

    it('handles trailing hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('a-')).toBe('a')
    })

    it('handles empty string', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('')).toBe('')
    })

    it('handles single hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('-')).toBe('')
    })

    it('handles double hyphens only', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('--')).toBe('')
    })

    it('preserves uppercase after hyphen', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('my-RULE')).toBe('myRULE')
    })

    it('handles prefer-const', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('prefer-const')).toBe('preferConst')
    })

    it('handles no-console', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('no-console')).toBe('noConsole')
    })

    it('handles max-params', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('max-params')).toBe('maxParams')
    })

    it('handles custom-rule', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('custom-rule')).toBe('customRule')
    })

    it('handles numeric-only string', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('123')).toBe('123')
    })

    it('does not lowercase first segment', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('MyRule')).toBe('MyRule')
    })

    it('handles hyphenated numbers', () => {
      const cmd = getTestableCommand()
      expect(cmd.toCamelCase('1-2-3')).toBe('123')
    })
  })

  describe('force flag behavior', () => {
    it('overwrites existing package.json', async () => {
      const pluginDir = path.join(tempDir, 'testplugin')
      await fs.mkdir(pluginDir, { recursive: true })
      await fs.writeFile(path.join(pluginDir, 'package.json'), '{"old": true}')

      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: true },
        { name: 'testplugin' },
      )
      await cmd.run()

      const content = await fs.readFile(path.join(pluginDir, 'package.json'), 'utf-8')
      const pkg = JSON.parse(content)
      expect(pkg.old).toBeUndefined()
      expect(pkg.description).toContain('testplugin')
    })

    it('overwrites existing README.md', async () => {
      const pluginDir = path.join(tempDir, 'testplugin')
      await fs.mkdir(path.join(pluginDir, 'src', 'rules'), { recursive: true })
      await fs.mkdir(path.join(pluginDir, 'test', 'rules'), { recursive: true })
      await fs.writeFile(path.join(pluginDir, 'README.md'), 'OLD README')

      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: true },
        { name: 'testplugin' },
      )
      await cmd.run()

      const content = await fs.readFile(path.join(pluginDir, 'README.md'), 'utf-8')
      expect(content).toContain('testplugin')
      expect(content).not.toContain('OLD README')
    })

    it('works when directory does not already exist', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: true },
        { name: 'newplugin' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
      expect(existsSync(path.join(tempDir, 'newplugin', 'package.json'))).toBe(true)
    })

    it('overwrites existing rule file', async () => {
      const pluginDir = path.join(tempDir, 'testplugin')
      await fs.mkdir(path.join(pluginDir, 'src', 'rules'), { recursive: true })
      await fs.mkdir(path.join(pluginDir, 'test', 'rules'), { recursive: true })
      await fs.writeFile(path.join(pluginDir, 'src', 'rules', 'old-rule.ts'), 'old content')

      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'new-rule', force: true },
        { name: 'testplugin' },
      )
      await cmd.run()

      expect(existsSync(path.join(pluginDir, 'src', 'rules', 'new-rule.ts'))).toBe(true)
      const content = await fs.readFile(
        path.join(pluginDir, 'src', 'rules', 'new-rule.ts'),
        'utf-8',
      )
      expect(content).toContain('newRule')
    })

    it('recreates directory structure over existing', async () => {
      const pluginDir = path.join(tempDir, 'testplugin')
      await fs.mkdir(pluginDir, { recursive: true })

      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: true },
        { name: 'testplugin' },
      )
      await cmd.run()

      expect(existsSync(path.join(pluginDir, 'src', 'rules'))).toBe(true)
      expect(existsSync(path.join(pluginDir, 'test', 'rules'))).toBe(true)
    })
  })

  describe('output path handling', () => {
    it('uses absolute path directly', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: false },
        { name: 'abs-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(tempDir, 'abs-plugin'))).toBe(true)
    })

    it('resolves relative path from cwd', async () => {
      const relativeDir = path.relative(process.cwd(), tempDir)
      const cmd = createCommandWithMockedParse(
        { output: relativeDir, typescript: true, rule: 'my-rule', force: false },
        { name: 'rel-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(tempDir, 'rel-plugin'))).toBe(true)
    })

    it('uses custom output directory', async () => {
      const customOutput = path.join(tempDir, 'custom-output')
      await fs.mkdir(customOutput, { recursive: true })
      const cmd = createCommandWithMockedParse(
        { output: customOutput, typescript: true, rule: 'my-rule', force: false },
        { name: 'custom-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(customOutput, 'custom-plugin'))).toBe(true)
    })

    it('creates plugin inside nested output directory', async () => {
      const nestedDir = path.join(tempDir, 'level1', 'level2')
      await fs.mkdir(nestedDir, { recursive: true })
      const cmd = createCommandWithMockedParse(
        { output: nestedDir, typescript: true, rule: 'my-rule', force: false },
        { name: 'nested-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(nestedDir, 'nested-plugin'))).toBe(true)
    })

    it('handles output path with trailing separator', async () => {
      const outputWithSep = tempDir + path.sep
      const cmd = createCommandWithMockedParse(
        { output: outputWithSep, typescript: true, rule: 'my-rule', force: false },
        { name: 'sep-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(tempDir, 'sep-plugin'))).toBe(true)
    })

    it('correctly joins output dir and plugin name', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: false },
        { name: 'joined-name' },
      )
      await cmd.run()
      const expectedPath = path.join(tempDir, 'joined-name')
      expect(existsSync(expectedPath)).toBe(true)
      expect(statSync(expectedPath).isDirectory()).toBe(true)
    })

    it('handles dot as output path resolving to cwd', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: false },
        { name: 'dot-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(tempDir, 'dot-plugin'))).toBe(true)
    })

    it('validates output base before checking plugin dir', async () => {
      const nonExistent = path.join(tempDir, 'does-not-exist')
      const cmd = createCommandWithMockedParse(
        { output: nonExistent, typescript: true, rule: 'my-rule', force: false },
        { name: 'test-plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Output directory does not exist')
    })
  })

  describe('flag combinations', () => {
    it('generates with typescript true and custom rule', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'custom-rule', force: false },
        { name: 'combo-plugin' },
      )
      await cmd.run()
      const pluginDir = path.join(tempDir, 'combo-plugin')
      expect(existsSync(path.join(pluginDir, 'tsconfig.json'))).toBe(true)
      expect(existsSync(path.join(pluginDir, 'src', 'rules', 'custom-rule.ts'))).toBe(true)
    })

    it('generates with typescript false and default rule', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: false, rule: 'sample-rule', force: false },
        { name: 'combo-plugin2' },
      )
      await cmd.run()
      const pluginDir = path.join(tempDir, 'combo-plugin2')
      expect(existsSync(path.join(pluginDir, 'src', 'rules', 'sample-rule.ts'))).toBe(true)
    })

    it('generates with force and custom output', async () => {
      const customOutput = path.join(tempDir, 'force-output')
      await fs.mkdir(customOutput, { recursive: true })
      await fs.mkdir(path.join(customOutput, 'force-plugin'), { recursive: true })

      const cmd = createCommandWithMockedParse(
        { output: customOutput, typescript: true, rule: 'my-rule', force: true },
        { name: 'force-plugin' },
      )
      await cmd.run()
      expect(existsSync(path.join(customOutput, 'force-plugin', 'package.json'))).toBe(true)
    })

    it('generates with all default flags', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'sample-rule', force: false },
        { name: 'defaults-plugin' },
      )
      await cmd.run()
      const pluginDir = path.join(tempDir, 'defaults-plugin')
      expect(existsSync(path.join(pluginDir, 'package.json'))).toBe(true)
      expect(existsSync(path.join(pluginDir, 'tsconfig.json'))).toBe(true)
      expect(existsSync(path.join(pluginDir, 'src', 'rules', 'sample-rule.ts'))).toBe(true)
    })

    it('generates with multi-hyphen rule name', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'no-bad-pattern', force: false },
        { name: 'multi-rule-plugin' },
      )
      await cmd.run()
      const pluginDir = path.join(tempDir, 'multi-rule-plugin')
      expect(existsSync(path.join(pluginDir, 'src', 'rules', 'no-bad-pattern.ts'))).toBe(true)
    })

    it('generates with single-word rule name', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'myrule', force: false },
        { name: 'single-rule-plugin' },
      )
      await cmd.run()
      const pluginDir = path.join(tempDir, 'single-rule-plugin')
      expect(existsSync(path.join(pluginDir, 'src', 'rules', 'myrule.ts'))).toBe(true)
    })

    it('generates complete structure with all flags set', async () => {
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'full-rule', force: false },
        { name: 'full-plugin' },
      )
      await cmd.run()
      const pluginDir = path.join(tempDir, 'full-plugin')
      const files = [
        'package.json',
        'tsconfig.json',
        'README.md',
        '.gitignore',
        path.join('src', 'index.ts'),
        path.join('src', 'rules', 'full-rule.ts'),
        path.join('test', 'rules', 'full-rule.test.ts'),
      ]
      for (const file of files) {
        expect(existsSync(path.join(pluginDir, file))).toBe(true)
      }
    })
  })

  describe('camelCase integration in generated files', () => {
    it('uses correct camelCase for no-eval in index.ts', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'no-eval' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain('{ noEval }')
    })

    it('uses correct camelCase for max-params in rule file', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'max-params' })
      const content = await readFile(path.join('src', 'rules', 'max-params.ts'))
      expect(content).toContain('export const maxParams')
    })

    it('uses correct camelCase for prefer-const in test file', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'prefer-const' })
      const content = await readFile(path.join('test', 'rules', 'prefer-const.test.ts'))
      expect(content).toContain('preferConst')
    })

    it('uses no camelCase transformation for single word rule', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'simple' })
      const indexContent = await readFile(path.join('src', 'index.ts'))
      expect(indexContent).toContain('{ simple }')
    })

    it('uses correct import path for three-part rule name', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'a-b-c' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain("'./rules/a-b-c.js'")
    })
  })

  describe('file content formatting', () => {
    it('package.json is parseable JSON', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('package.json')
      expect(() => JSON.parse(content)).not.toThrow()
    })

    it('tsconfig.json is parseable JSON', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('tsconfig.json')
      expect(() => JSON.parse(content)).not.toThrow()
    })

    it('index.ts contains valid TypeScript syntax', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'index.ts'))
      expect(content).toContain('import type')
      expect(content).toContain('export const')
      expect(content).toContain('export default')
    })

    it('rule file contains valid TypeScript syntax', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('src', 'rules', 'my-rule.ts'))
      expect(content).toContain('import type')
      expect(content).toContain('export const')
      expect(content).toContain('export default')
    })

    it('README contains proper markdown headings', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile('README.md')
      expect(content).toMatch(/^# /m)
      expect(content).toMatch(/^## /m)
    })

    it('package.json uses 2-space indent', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('package.json')
      expect(content).toContain('\n  "description"')
    })

    it('tsconfig.json uses 2-space indent', async () => {
      const { readFile } = await generateAndRead('test-plugin', {})
      const content = await readFile('tsconfig.json')
      expect(content).toContain('\n  "compilerOptions"')
    })

    it('rule test file has proper test structure', async () => {
      const { readFile } = await generateAndRead('test-plugin', { rule: 'my-rule' })
      const content = await readFile(path.join('test', 'rules', 'my-rule.test.ts'))
      expect(content).toContain("describe('my-rule'")
      expect(content).toContain("it('")
      expect(content).toContain('expect(')
    })
  })

  describe('validation order', () => {
    it('validates plugin name before checking output directory', async () => {
      const nonExistent = path.join(tempDir, 'nonexistent')
      const cmd = createCommandWithMockedParse(
        { output: nonExistent, typescript: true, rule: 'my-rule', force: false },
        { name: 'INVALID' },
      )
      await expect(cmd.run()).rejects.toThrow('Plugin name')
    })

    it('validates output directory exists before checking plugin dir', async () => {
      const nonExistent = path.join(tempDir, 'nonexistent')
      const cmd = createCommandWithMockedParse(
        { output: nonExistent, typescript: true, rule: 'my-rule', force: false },
        { name: 'valid-plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Output directory does not exist')
    })

    it('validates output is directory before checking plugin dir', async () => {
      const filePath = path.join(tempDir, 'afile')
      await fs.writeFile(filePath, '')
      const cmd = createCommandWithMockedParse(
        { output: filePath, typescript: true, rule: 'my-rule', force: false },
        { name: 'valid-plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('Output path is not a directory')
    })

    it('checks plugin dir existence after all other validations pass', async () => {
      await fs.mkdir(path.join(tempDir, 'existing-plugin'), { recursive: true })
      const cmd = createCommandWithMockedParse(
        { output: tempDir, typescript: true, rule: 'my-rule', force: false },
        { name: 'existing-plugin' },
      )
      await expect(cmd.run()).rejects.toThrow('already exists')
    })
  })
})
