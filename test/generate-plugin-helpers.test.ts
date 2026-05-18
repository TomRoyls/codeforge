import { describe, it, expect } from 'vitest'
import {
  isValidPluginName,
  toCamelCase,
  buildPackageJson,
  buildTsConfig,
  buildPluginFileContent,
  buildRuleFileContent,
  buildRuleTestContent,
  buildReadmeContent,
  buildGitignoreContent,
  getDirectoryPaths,
} from '../src/commands/generate-plugin-helpers.js'

// ─── isValidPluginName ────────────────────────────────
describe('isValidPluginName', () => {
  it('accepts lowercase letters', () => {
    expect(isValidPluginName('myplugin')).toBe(true)
  })

  it('accepts lowercase with hyphens', () => {
    expect(isValidPluginName('my-plugin')).toBe(true)
  })

  it('accepts numbers', () => {
    expect(isValidPluginName('plugin123')).toBe(true)
  })

  it('accepts mixed lowercase, numbers, and hyphens', () => {
    expect(isValidPluginName('my-plugin-v2')).toBe(true)
  })

  it('rejects uppercase letters', () => {
    expect(isValidPluginName('MyPlugin')).toBe(false)
  })

  it('rejects underscores', () => {
    expect(isValidPluginName('my_plugin')).toBe(false)
  })

  it('rejects spaces', () => {
    expect(isValidPluginName('my plugin')).toBe(false)
  })

  it('rejects special characters', () => {
    expect(isValidPluginName('my@plugin')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidPluginName('')).toBe(false)
  })

  it('accepts leading hyphen (regex allows it)', () => {
    expect(isValidPluginName('-plugin')).toBe(true)
  })

  it('accepts trailing hyphen (regex allows it)', () => {
    expect(isValidPluginName('plugin-')).toBe(true)
  })
})

// ─── toCamelCase ────────────────────────────────────────
describe('toCamelCase', () => {
  it('returns single word unchanged', () => {
    expect(toCamelCase('hello')).toBe('hello')
  })

  it('converts two-word hyphenated to camelCase', () => {
    expect(toCamelCase('my-plugin')).toBe('myPlugin')
  })

  it('converts multi-word hyphenated to camelCase', () => {
    expect(toCamelCase('my-cool-plugin')).toBe('myCoolPlugin')
  })

  it('handles single character segments', () => {
    expect(toCamelCase('a-b-c')).toBe('aBC')
  })

  it('returns empty string for empty input', () => {
    expect(toCamelCase('')).toBe('')
  })

  it('handles already camelCase-like input without hyphens', () => {
    expect(toCamelCase('camelCase')).toBe('camelCase')
  })

  it('handles numeric segments', () => {
    expect(toCamelCase('plugin-v2')).toBe('pluginV2')
  })
})

// ─── buildPackageJson ──────────────────────────────────
describe('buildPackageJson', () => {
  it('includes description with plugin name', () => {
    const pkg = buildPackageJson('my-plugin')
    expect(pkg.description).toBe('CodeForge plugin: my-plugin')
  })

  it('includes node engine requirement', () => {
    const pkg = buildPackageJson('test')
    expect(pkg.engines).toEqual({ node: '>=18.0.0' })
  })

  it('includes codeforge keywords', () => {
    const pkg = buildPackageJson('test')
    expect(pkg.keywords).toEqual(['codeforge', 'plugin', 'linter'])
  })

  it('includes MIT license', () => {
    const pkg = buildPackageJson('test')
    expect(pkg.license).toBe('MIT')
  })

  it('includes dist entry points', () => {
    const pkg = buildPackageJson('test')
    expect(pkg.main).toBe('dist/index.js')
    expect(pkg.types).toBe('dist/index.d.ts')
  })

  it('includes scripts', () => {
    const pkg = buildPackageJson('test')
    expect(pkg.scripts).toEqual({
      build: 'tsc',
      lint: 'eslint src',
      test: 'vitest run',
      'test:watch': 'vitest',
    })
  })
})

// ─── buildTsConfig ─────────────────────────────────────
describe('buildTsConfig', () => {
  it('includes strict mode', () => {
    const config = buildTsConfig()
    expect((config.compilerOptions as Record<string, unknown>).strict).toBe(true)
  })

  it('targets ES2022', () => {
    const config = buildTsConfig()
    expect((config.compilerOptions as Record<string, unknown>).target).toBe('ES2022')
  })

  it('uses NodeNext module resolution', () => {
    const config = buildTsConfig()
    const co = config.compilerOptions as Record<string, unknown>
    expect(co.module).toBe('NodeNext')
    expect(co.moduleResolution).toBe('NodeNext')
  })

  it('includes src and excludes test/dist', () => {
    const config = buildTsConfig()
    expect(config.include).toContain('src/**/*')
    expect(config.exclude).toContain('node_modules')
    expect(config.exclude).toContain('dist')
    expect(config.exclude).toContain('test')
  })

  it('enables declaration output', () => {
    const config = buildTsConfig()
    const co = config.compilerOptions as Record<string, unknown>
    expect(co.declaration).toBe(true)
    expect(co.declarationMap).toBe(true)
  })
})

// ─── buildPluginFileContent ────────────────────────────
describe('buildPluginFileContent', () => {
  it('includes plugin name in comment', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('my-plugin - CodeForge Plugin')
  })

  it('includes PluginDefinition import', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("import type { PluginDefinition } from 'codeforge'")
  })

  it('includes rule import with camelCase', () => {
    const content = buildPluginFileContent('my-plugin', 'my-rule')
    expect(content).toContain("import { myRule } from './rules/my-rule.js'")
  })

  it('exports plugin with correct name', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("name: 'my-plugin'")
    expect(content).toContain("version: '1.0.0'")
  })

  it('includes rule in rules map', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("'sample-rule': sampleRule")
  })

  it('has default export', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('export default plugin')
  })
})

// ─── buildRuleFileContent ──────────────────────────────
describe('buildRuleFileContent', () => {
  it('includes rule name in comment', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain('my-rule - Sample CodeForge rule')
  })

  it('imports rule types', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain("import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'")
  })

  it('exports rule with camelCase name', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain('export const myRule: RuleDefinition')
  })

  it('includes meta with type problem', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain("type: 'problem'")
    expect(content).toContain("severity: 'warn'")
  })

  it('includes fixable flag', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain("fixable: 'code'")
  })

  it('includes create function', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain('create(context: RuleContext)')
  })

  it('has default export', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain('export default myRule')
  })
})

// ─── buildRuleTestContent ──────────────────────────────
describe('buildRuleTestContent', () => {
  it('includes rule name in test description', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain("Tests for my-rule rule")
  })

  it('imports vitest', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain("import { describe, expect, it } from 'vitest'")
  })

  it('imports rule with camelCase name', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain("import { myRule } from '../../src/rules/my-rule.js'")
  })

  it('includes meta test', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain('should have valid meta')
  })

  it('includes create function test', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain('should export create function')
  })

  it('includes visitor test', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain('should return visitor object')
  })
})

// ─── buildReadmeContent ────────────────────────────────
describe('buildReadmeContent', () => {
  it('includes plugin name as heading', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('# my-plugin')
  })

  it('includes installation instructions', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('npm install my-plugin')
  })

  it('includes usage section with plugin config', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('"plugins": ["my-plugin"]')
    expect(content).toContain('"sample-rule": "warn"')
  })

  it('includes rules section with rule name', () => {
    const content = buildReadmeContent('my-plugin', 'my-rule')
    expect(content).toContain('### my-rule')
  })

  it('includes development instructions', () => {
    const content = buildReadmeContent('test', 'rule')
    expect(content).toContain('npm install')
    expect(content).toContain('npm test')
    expect(content).toContain('npm run build')
  })

  it('includes MIT license', () => {
    const content = buildReadmeContent('test', 'rule')
    expect(content).toContain('## License\nMIT')
  })
})

// ─── buildGitignoreContent ─────────────────────────────
describe('buildGitignoreContent', () => {
  it('includes node_modules', () => {
    expect(buildGitignoreContent()).toContain('node_modules/')
  })

  it('includes dist', () => {
    expect(buildGitignoreContent()).toContain('dist/')
  })

  it('includes log files', () => {
    expect(buildGitignoreContent()).toContain('*.log')
  })

  it('includes coverage', () => {
    expect(buildGitignoreContent()).toContain('coverage/')
  })

  it('includes .DS_Store', () => {
    expect(buildGitignoreContent()).toContain('.DS_Store')
  })

  it('is deterministic', () => {
    expect(buildGitignoreContent()).toBe(buildGitignoreContent())
  })
})

// ─── getDirectoryPaths ─────────────────────────────────
describe('getDirectoryPaths', () => {
  it('returns root directory', () => {
    const paths = getDirectoryPaths('/output')
    expect(paths).toContain('/output')
  })

  it('returns src directory', () => {
    const paths = getDirectoryPaths('/output')
    expect(paths).toContain('/output/src')
  })

  it('returns src/rules directory', () => {
    const paths = getDirectoryPaths('/output')
    expect(paths).toContain('/output/src/rules')
  })

  it('returns test directory', () => {
    const paths = getDirectoryPaths('/output')
    expect(paths).toContain('/output/test')
  })

  it('returns test/rules directory', () => {
    const paths = getDirectoryPaths('/output')
    expect(paths).toContain('/output/test/rules')
  })

  it('returns exactly 5 paths', () => {
    expect(getDirectoryPaths('.')).toHaveLength(5)
  })

  it('preserves relative paths', () => {
    const paths = getDirectoryPaths('./plugins/my-plugin')
    expect(paths[0]).toBe('./plugins/my-plugin')
    expect(paths[1]).toBe('./plugins/my-plugin/src')
  })
})
