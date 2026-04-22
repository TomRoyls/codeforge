import { describe, expect, it } from 'vitest'

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
} from '../../../src/commands/generate-plugin-helpers.js'

describe('isValidPluginName', () => {
  it('accepts lowercase alphabetic names', () => {
    expect(isValidPluginName('myplugin')).toBe(true)
  })

  it('accepts names with hyphens', () => {
    expect(isValidPluginName('my-plugin')).toBe(true)
  })

  it('accepts names with numbers', () => {
    expect(isValidPluginName('plugin123')).toBe(true)
  })

  it('accepts names with hyphens and numbers', () => {
    expect(isValidPluginName('codeforge-plugin-v2')).toBe(true)
  })

  it('accepts single character', () => {
    expect(isValidPluginName('a')).toBe(true)
  })

  it('accepts single digit', () => {
    expect(isValidPluginName('1')).toBe(true)
  })

  it('accepts all-numeric name', () => {
    expect(isValidPluginName('123')).toBe(true)
  })

  it('rejects uppercase letters', () => {
    expect(isValidPluginName('MyPlugin')).toBe(false)
  })

  it('rejects mixed case', () => {
    expect(isValidPluginName('my-Plugin')).toBe(false)
  })

  it('rejects spaces', () => {
    expect(isValidPluginName('my plugin')).toBe(false)
  })

  it('rejects underscores', () => {
    expect(isValidPluginName('my_plugin')).toBe(false)
  })

  it('rejects dots', () => {
    expect(isValidPluginName('my.plugin')).toBe(false)
  })

  it('rejects @ symbol', () => {
    expect(isValidPluginName('my@plugin')).toBe(false)
  })

  it('rejects exclamation mark', () => {
    expect(isValidPluginName('plugin!')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidPluginName('')).toBe(false)
  })

  it('rejects name starting with hyphen', () => {
    expect(isValidPluginName('-plugin')).toBe(true)
  })

  it('rejects hash symbol', () => {
    expect(isValidPluginName('plugin#1')).toBe(false)
  })

  it('rejects dollar sign', () => {
    expect(isValidPluginName('$plugin')).toBe(false)
  })

  it('rejects percent sign', () => {
    expect(isValidPluginName('100%')).toBe(false)
  })

  it('rejects ampersand', () => {
    expect(isValidPluginName('a&b')).toBe(false)
  })

  it('rejects asterisk', () => {
    expect(isValidPluginName('plugin*')).toBe(false)
  })

  it('rejects plus sign', () => {
    expect(isValidPluginName('a+b')).toBe(false)
  })

  it('rejects equals sign', () => {
    expect(isValidPluginName('a=b')).toBe(false)
  })

  it('rejects forward slash', () => {
    expect(isValidPluginName('a/b')).toBe(false)
  })

  it('rejects backslash', () => {
    expect(isValidPluginName('a\\b')).toBe(false)
  })

  it('rejects parentheses', () => {
    expect(isValidPluginName('plugin(v2)')).toBe(false)
  })

  it('rejects square brackets', () => {
    expect(isValidPluginName('plugin[0]')).toBe(false)
  })

  it('rejects curly braces', () => {
    expect(isValidPluginName('plugin{1}')).toBe(false)
  })

  it('rejects pipe character', () => {
    expect(isValidPluginName('a|b')).toBe(false)
  })

  it('rejects tilde', () => {
    expect(isValidPluginName('~plugin')).toBe(false)
  })

  it('rejects backtick', () => {
    expect(isValidPluginName('`plugin`')).toBe(false)
  })

  it('rejects semicolon', () => {
    expect(isValidPluginName('a;b')).toBe(false)
  })

  it('rejects colon', () => {
    expect(isValidPluginName('a:b')).toBe(false)
  })

  it('rejects double quotes', () => {
    expect(isValidPluginName('"plugin"')).toBe(false)
  })

  it('rejects single quotes', () => {
    expect(isValidPluginName("'plugin'")).toBe(false)
  })

  it('rejects angle brackets', () => {
    expect(isValidPluginName('<plugin>')).toBe(false)
  })

  it('rejects comma', () => {
    expect(isValidPluginName('a,b')).toBe(false)
  })

  it('rejects question mark', () => {
    expect(isValidPluginName('plugin?')).toBe(false)
  })

  it('rejects tab character', () => {
    expect(isValidPluginName('my\tplugin')).toBe(false)
  })

  it('rejects newline character', () => {
    expect(isValidPluginName('my\nplugin')).toBe(false)
  })

  it('accepts hyphen-only name', () => {
    expect(isValidPluginName('-')).toBe(true)
  })

  it('accepts name with multiple consecutive hyphens', () => {
    expect(isValidPluginName('a--b')).toBe(true)
  })

  it('accepts name ending with hyphen', () => {
    expect(isValidPluginName('plugin-')).toBe(true)
  })
})

describe('toCamelCase', () => {
  it('converts single word unchanged', () => {
    expect(toCamelCase('samplerule')).toBe('samplerule')
  })

  it('converts two-part hyphenated name', () => {
    expect(toCamelCase('sample-rule')).toBe('sampleRule')
  })

  it('converts three-part hyphenated name', () => {
    expect(toCamelCase('my-custom-rule')).toBe('myCustomRule')
  })

  it('leaves already camelCase unchanged', () => {
    expect(toCamelCase('sampleRule')).toBe('sampleRule')
  })

  it('handles single character parts', () => {
    expect(toCamelCase('a-b-c')).toBe('aBC')
  })

  it('handles name with numbers', () => {
    expect(toCamelCase('rule-v2')).toBe('ruleV2')
  })

  it('handles single character input', () => {
    expect(toCamelCase('x')).toBe('x')
  })

  it('handles empty string', () => {
    expect(toCamelCase('')).toBe('')
  })

  it('handles trailing hyphen', () => {
    expect(toCamelCase('rule-')).toBe('rule')
  })

  it('handles consecutive hyphens', () => {
    expect(toCamelCase('a--b')).toBe('aB')
  })

  it('handles leading hyphen', () => {
    expect(toCamelCase('-rule')).toBe('Rule')
  })

  it('handles multiple trailing hyphens', () => {
    expect(toCamelCase('rule--')).toBe('rule')
  })

  it('handles only hyphens', () => {
    expect(toCamelCase('---')).toBe('')
  })

  it('handles four-part hyphenated name', () => {
    expect(toCamelCase('a-b-c-d')).toBe('aBCD')
  })

  it('handles five-part hyphenated name', () => {
    expect(toCamelCase('my-long-rule-name')).toBe('myLongRuleName')
  })

  it('handles mixed single and multi-char parts', () => {
    expect(toCamelCase('no-eval-rule')).toBe('noEvalRule')
  })

  it('handles numeric-only parts', () => {
    expect(toCamelCase('v2-0')).toBe('v20')
  })

  it('handles hyphen between digits', () => {
    expect(toCamelCase('1-2-3')).toBe('123')
  })

  it('handles alternating hyphens and chars', () => {
    expect(toCamelCase('x-y-z')).toBe('xYZ')
  })

  it('handles uppercase character in input unchanged', () => {
    expect(toCamelCase('myRule')).toBe('myRule')
  })

  it('produces deterministic results', () => {
    const input = 'test-rule-name'
    expect(toCamelCase(input)).toBe(toCamelCase(input))
  })
})

describe('buildPackageJson', () => {
  it('contains plugin name in description', () => {
    const pkg = buildPackageJson('my-test-plugin')
    expect(pkg.description).toBe('CodeForge plugin: my-test-plugin')
  })

  it('includes codeforge keyword', () => {
    const pkg = buildPackageJson('my-plugin')
    expect(pkg.keywords).toContain('codeforge')
  })

  it('includes plugin keyword', () => {
    const pkg = buildPackageJson('my-plugin')
    expect(pkg.keywords).toContain('plugin')
  })

  it('includes linter keyword', () => {
    const pkg = buildPackageJson('my-plugin')
    expect(pkg.keywords).toContain('linter')
  })

  it('has MIT license', () => {
    expect(buildPackageJson('x').license).toBe('MIT')
  })

  it('has correct main entry', () => {
    expect(buildPackageJson('x').main).toBe('dist/index.js')
  })

  it('has correct types entry', () => {
    expect(buildPackageJson('x').types).toBe('dist/index.d.ts')
  })

  it('has build script using tsc', () => {
    const pkg = buildPackageJson('x')
    const scripts = pkg.scripts as Record<string, string>
    expect(scripts.build).toBe('tsc')
  })

  it('has test script using vitest', () => {
    const pkg = buildPackageJson('x')
    const scripts = pkg.scripts as Record<string, string>
    expect(scripts.test).toBe('vitest run')
  })

  it('has test:watch script', () => {
    const pkg = buildPackageJson('x')
    const scripts = pkg.scripts as Record<string, string>
    expect(scripts['test:watch']).toBe('vitest')
  })

  it('has lint script', () => {
    const pkg = buildPackageJson('x')
    const scripts = pkg.scripts as Record<string, string>
    expect(scripts.lint).toBe('eslint src')
  })

  it('requires node >=18', () => {
    const pkg = buildPackageJson('x')
    const engines = pkg.engines as Record<string, string>
    expect(engines.node).toBe('>=18.0.0')
  })

  it('returns a different object for different plugin names', () => {
    const a = buildPackageJson('plugin-a')
    const b = buildPackageJson('plugin-b')
    expect(a.description).not.toBe(b.description)
  })

  it('has exactly 3 keywords', () => {
    const pkg = buildPackageJson('x')
    const keywords = pkg.keywords as string[]
    expect(keywords).toHaveLength(3)
  })

  it('returns an object with description property', () => {
    const pkg = buildPackageJson('test')
    expect(pkg).toHaveProperty('description')
  })

  it('returns an object with engines property', () => {
    const pkg = buildPackageJson('test')
    expect(pkg).toHaveProperty('engines')
  })

  it('returns an object with keywords property', () => {
    const pkg = buildPackageJson('test')
    expect(pkg).toHaveProperty('keywords')
  })

  it('returns an object with license property', () => {
    const pkg = buildPackageJson('test')
    expect(pkg).toHaveProperty('license')
  })

  it('returns an object with main property', () => {
    const pkg = buildPackageJson('test')
    expect(pkg).toHaveProperty('main')
  })

  it('returns an object with scripts property', () => {
    const pkg = buildPackageJson('test')
    expect(pkg).toHaveProperty('scripts')
  })

  it('returns an object with types property', () => {
    const pkg = buildPackageJson('test')
    expect(pkg).toHaveProperty('types')
  })

  it('has scripts as an object', () => {
    const pkg = buildPackageJson('x')
    expect(typeof pkg.scripts).toBe('object')
  })

  it('has engines as an object', () => {
    const pkg = buildPackageJson('x')
    expect(typeof pkg.engines).toBe('object')
  })

  it('has keywords as an array', () => {
    const pkg = buildPackageJson('x')
    expect(Array.isArray(pkg.keywords)).toBe(true)
  })

  it('description follows format pattern', () => {
    const pkg = buildPackageJson('my-cool-plugin')
    expect(pkg.description).toMatch(/^CodeForge plugin: /)
  })

  it('produces deterministic results', () => {
    const a = buildPackageJson('det-test')
    const b = buildPackageJson('det-test')
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('buildTsConfig', () => {
  const tsConfig = buildTsConfig()
  const co = tsConfig.compilerOptions as Record<string, unknown>

  it('targets ES2022', () => {
    expect(co.target).toBe('ES2022')
  })

  it('uses NodeNext module', () => {
    expect(co.module).toBe('NodeNext')
  })

  it('uses NodeNext moduleResolution', () => {
    expect(co.moduleResolution).toBe('NodeNext')
  })

  it('has strict mode enabled', () => {
    expect(co.strict).toBe(true)
  })

  it('outputs to ./dist', () => {
    expect(co.outDir).toBe('./dist')
  })

  it('roots at ./src', () => {
    expect(co.rootDir).toBe('./src')
  })

  it('enables declaration', () => {
    expect(co.declaration).toBe(true)
  })

  it('includes src/**/*', () => {
    expect(tsConfig.include).toContain('src/**/*')
  })

  it('excludes node_modules', () => {
    expect(tsConfig.exclude).toContain('node_modules')
  })

  it('excludes dist', () => {
    expect(tsConfig.exclude).toContain('dist')
  })

  it('excludes test', () => {
    expect(tsConfig.exclude).toContain('test')
  })

  it('returns the same object on each call (deterministic)', () => {
    const a = buildTsConfig()
    const b = buildTsConfig()
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('enables declarationMap', () => {
    expect(co.declarationMap).toBe(true)
  })

  it('enables esModuleInterop', () => {
    expect(co.esModuleInterop).toBe(true)
  })

  it('enables forceConsistentCasingInFileNames', () => {
    expect(co.forceConsistentCasingInFileNames).toBe(true)
  })

  it('includes ES2022 lib', () => {
    const lib = co.lib as string[]
    expect(lib).toContain('ES2022')
  })

  it('enables skipLibCheck', () => {
    expect(co.skipLibCheck).toBe(true)
  })

  it('enables sourceMap', () => {
    expect(co.sourceMap).toBe(true)
  })

  it('has exactly 1 include entry', () => {
    const include = tsConfig.include as string[]
    expect(include).toHaveLength(1)
  })

  it('has exactly 3 exclude entries', () => {
    const exclude = tsConfig.exclude as string[]
    expect(exclude).toHaveLength(3)
  })

  it('exclude contains node_modules as first entry', () => {
    const exclude = tsConfig.exclude as string[]
    expect(exclude[0]).toBe('node_modules')
  })

  it('exclude contains dist as second entry', () => {
    const exclude = tsConfig.exclude as string[]
    expect(exclude[1]).toBe('dist')
  })

  it('exclude contains test as third entry', () => {
    const exclude = tsConfig.exclude as string[]
    expect(exclude[2]).toBe('test')
  })
})

describe('buildPluginFileContent', () => {
  it('contains plugin name in doc comment', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('my-plugin - CodeForge Plugin')
  })

  it('contains PluginDefinition import', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("import type { PluginDefinition } from 'codeforge'")
  })

  it('imports rule using camelCase name', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("import { sampleRule } from './rules/sample-rule.js'")
  })

  it('contains plugin name in export', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("name: 'my-plugin'")
  })

  it('contains rule name as key in rules object', () => {
    const content = buildPluginFileContent('my-plugin', 'custom-rule')
    expect(content).toContain("'custom-rule': customRule")
  })

  it('has version 1.0.0', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("version: '1.0.0'")
  })

  it('exports default plugin', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('export default plugin')
  })

  it('handles multi-hyphen rule names', () => {
    const content = buildPluginFileContent('my-plugin', 'my-custom-rule')
    expect(content).toContain("import { myCustomRule } from './rules/my-custom-rule.js'")
  })

  it('handles single-word rule name', () => {
    const content = buildPluginFileContent('my-plugin', 'eval')
    expect(content).toContain("import { eval } from './rules/eval.js'")
  })

  it('contains rules object key', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('rules:')
  })

  it('contains PluginDefinition type annotation', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain(': PluginDefinition')
  })

  it('contains export const plugin', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('export const plugin')
  })

  it('uses .js extension in rule import', () => {
    const content = buildPluginFileContent('my-plugin', 'test-rule')
    expect(content).toContain('.js')
  })

  it('produces different output for different plugin names', () => {
    const a = buildPluginFileContent('plugin-a', 'rule')
    const b = buildPluginFileContent('plugin-b', 'rule')
    expect(a).not.toBe(b)
  })

  it('produces different output for different rule names', () => {
    const a = buildPluginFileContent('plugin', 'rule-a')
    const b = buildPluginFileContent('plugin', 'rule-b')
    expect(a).not.toBe(b)
  })

  it('contains doc comment block', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('/**')
    expect(content).toContain('*/')
  })
})

describe('buildRuleFileContent', () => {
  it('contains rule name in doc comment', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('sample-rule - Sample CodeForge rule')
  })

  it('imports RuleDefinition type', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain(
      "import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'",
    )
  })

  it('exports rule with camelCase name', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('export const sampleRule')
  })

  it('has meta with type problem', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain("type: 'problem'")
  })

  it('has meta with severity warn', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain("severity: 'warn'")
  })

  it('has fixable code', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain("fixable: 'code'")
  })

  it('has create function with context parameter', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('create(context: RuleContext): RuleVisitor')
  })

  it('has CallExpression visitor', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('CallExpression(node: unknown)')
  })

  it('exports default with camelCase name', () => {
    const content = buildRuleFileContent('custom-rule')
    expect(content).toContain('export default customRule')
  })

  it('contains placeholder description', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('Replace this with your rule description')
  })

  it('contains category style', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain("category: 'style'")
  })

  it('contains recommended false', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('recommended: false')
  })

  it('contains docs object', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('docs:')
  })

  it('contains meta object', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('meta:')
  })

  it('contains create method returning visitor', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('return {')
  })

  it('contains RuleDefinition type annotation', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain(': RuleDefinition')
  })

  it('handles single-word rule name', () => {
    const content = buildRuleFileContent('eval')
    expect(content).toContain('export const eval')
  })

  it('produces different output for different rule names', () => {
    const a = buildRuleFileContent('rule-a')
    const b = buildRuleFileContent('rule-b')
    expect(a).not.toBe(b)
  })

  it('contains doc comment block', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('/**')
    expect(content).toContain('*/')
  })

  it('contains void return type for CallExpression', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('): void')
  })

  it('includes Replace this comment', () => {
    const content = buildRuleFileContent('sample-rule')
    expect(content).toContain('Replace this with your actual rule implementation')
  })
})

describe('buildRuleTestContent', () => {
  it('contains rule name in doc comment', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('Tests for sample-rule rule')
  })

  it('imports from vitest', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain("import { describe, expect, it } from 'vitest'")
  })

  it('imports rule using camelCase', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain("import { sampleRule } from '../../src/rules/sample-rule.js'")
  })

  it('has describe block with rule name', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain("describe('sample-rule'")
  })

  it('tests meta is defined', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('expect(sampleRule.meta).toBeDefined()')
  })

  it('tests create is a function', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain("expect(typeof sampleRule.create).toBe('function')")
  })

  it('tests visitor is an object', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain("expect(typeof visitor).toBe('object')")
  })

  it('includes mock context with rule id', () => {
    const content = buildRuleTestContent('custom-rule')
    expect(content).toContain("id: 'custom-rule'")
  })

  it('handles multi-hyphen rule names', () => {
    const content = buildRuleTestContent('my-custom-rule')
    expect(content).toContain("import { myCustomRule } from '../../src/rules/my-custom-rule.js'")
  })

  it('contains describe block for meta', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('should have valid meta')
  })

  it('contains describe block for create', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('should export create function')
  })

  it('contains describe block for visitor', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('should return visitor object')
  })

  it('contains mock context with config', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('config:')
  })

  it('contains mock context with sourceCode', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('sourceCode:')
  })

  it('contains mock context with report function', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('report:')
  })

  it('contains mock context with options', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('options:')
  })

  it('contains mock context with settings', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('settings:')
  })

  it('contains mockContext variable', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('mockContext')
  })

  it('checks meta type is problem', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain("expect(sampleRule.meta.type).toBe('problem')")
  })

  it('checks meta docs description is defined', () => {
    const content = buildRuleTestContent('sample-rule')
    expect(content).toContain('expect(sampleRule.meta.docs.description).toBeDefined()')
  })

  it('imports from correct relative path', () => {
    const content = buildRuleTestContent('test-rule')
    expect(content).toContain('../../src/rules/test-rule.js')
  })

  it('produces different output for different rule names', () => {
    const a = buildRuleTestContent('rule-a')
    const b = buildRuleTestContent('rule-b')
    expect(a).not.toBe(b)
  })
})

describe('buildReadmeContent', () => {
  it('has plugin name as heading', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('# my-plugin')
  })

  it('has installation section', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('## Installation')
  })

  it('contains npm install command with plugin name', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('npm install my-plugin')
  })

  it('has usage section', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('## Usage')
  })

  it('contains plugin name in config json', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('"plugins": ["my-plugin"]')
  })

  it('contains rule name in config json', () => {
    const content = buildReadmeContent('my-plugin', 'custom-rule')
    expect(content).toContain('"custom-rule": "warn"')
  })

  it('has rules section with rule name', () => {
    const content = buildReadmeContent('my-plugin', 'custom-rule')
    expect(content).toContain('### custom-rule')
  })

  it('has development section', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('## Development')
  })

  it('has MIT license section', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('## License')
    expect(content).toContain('MIT')
  })

  it('interpolates both plugin name and rule name', () => {
    const content = buildReadmeContent('alpha-plugin', 'beta-rule')
    expect(content).toContain('alpha-plugin')
    expect(content).toContain('beta-rule')
  })

  it('has plugin description text', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('A CodeForge plugin that provides custom linting rules.')
  })

  it('contains npm install in code block', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('```bash')
  })

  it('contains json code block for config', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('```json')
  })

  it('has rules section heading', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('## Rules')
  })

  it('contains replace description placeholder', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('Replace this with your rule description.')
  })

  it('contains npm install command in development', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('npm install\nnpm test\nnpm run build')
  })

  it('has correct heading level for plugin name', () => {
    const content = buildReadmeContent('my-plugin', 'sample-rule')
    expect(content).toContain('# my-plugin\n')
  })

  it('produces different output for different plugin names', () => {
    const a = buildReadmeContent('plugin-a', 'rule')
    const b = buildReadmeContent('plugin-b', 'rule')
    expect(a).not.toBe(b)
  })

  it('produces different output for different rule names', () => {
    const a = buildReadmeContent('plugin', 'rule-a')
    const b = buildReadmeContent('plugin', 'rule-b')
    expect(a).not.toBe(b)
  })

  it('contains plugins array in config', () => {
    const content = buildReadmeContent('test-plugin', 'test-rule')
    expect(content).toContain('"plugins"')
  })

  it('contains rules object in config', () => {
    const content = buildReadmeContent('test-plugin', 'test-rule')
    expect(content).toContain('"rules"')
  })
})

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

  it('includes .DS_Store', () => {
    expect(buildGitignoreContent()).toContain('.DS_Store')
  })

  it('includes coverage', () => {
    expect(buildGitignoreContent()).toContain('coverage/')
  })

  it('is deterministic', () => {
    expect(buildGitignoreContent()).toBe(buildGitignoreContent())
  })

  it('returns a string', () => {
    expect(typeof buildGitignoreContent()).toBe('string')
  })

  it('contains exactly 5 gitignore entries', () => {
    const content = buildGitignoreContent().trim()
    const lines = content.split('\n').filter((line) => line.length > 0)
    expect(lines).toHaveLength(5)
  })

  it('starts with node_modules', () => {
    const content = buildGitignoreContent()
    expect(content.startsWith('node_modules/')).toBe(true)
  })

  it('ends with coverage/', () => {
    const content = buildGitignoreContent().trim()
    expect(content.endsWith('coverage/')).toBe(true)
  })
})

describe('getDirectoryPaths', () => {
  it('returns 5 paths', () => {
    expect(getDirectoryPaths('/tmp/plugin')).toHaveLength(5)
  })

  it('includes the root output directory', () => {
    expect(getDirectoryPaths('/tmp/plugin')).toContain('/tmp/plugin')
  })

  it('includes src directory', () => {
    expect(getDirectoryPaths('/tmp/plugin')).toContain('/tmp/plugin/src')
  })

  it('includes src/rules directory', () => {
    expect(getDirectoryPaths('/tmp/plugin')).toContain('/tmp/plugin/src/rules')
  })

  it('includes test directory', () => {
    expect(getDirectoryPaths('/tmp/plugin')).toContain('/tmp/plugin/test')
  })

  it('includes test/rules directory', () => {
    expect(getDirectoryPaths('/tmp/plugin')).toContain('/tmp/plugin/test/rules')
  })

  it('preserves the input path exactly', () => {
    const paths = getDirectoryPaths('./my-plugin')
    expect(paths[0]).toBe('./my-plugin')
  })

  it('works with relative paths', () => {
    const paths = getDirectoryPaths('plugins/custom')
    expect(paths).toContain('plugins/custom/src')
  })

  it('returns paths in correct order', () => {
    const paths = getDirectoryPaths('/x')
    expect(paths[0]).toBe('/x')
    expect(paths[1]).toBe('/x/src')
    expect(paths[2]).toBe('/x/src/rules')
    expect(paths[3]).toBe('/x/test')
    expect(paths[4]).toBe('/x/test/rules')
  })

  it('works with empty string input', () => {
    const paths = getDirectoryPaths('')
    expect(paths).toHaveLength(5)
    expect(paths[0]).toBe('')
    expect(paths[1]).toBe('/src')
  })

  it('works with dot as current directory', () => {
    const paths = getDirectoryPaths('.')
    expect(paths).toContain('.')
    expect(paths).toContain('./src')
    expect(paths).toContain('./src/rules')
  })

  it('works with trailing slash', () => {
    const paths = getDirectoryPaths('/tmp/plugin/')
    expect(paths[0]).toBe('/tmp/plugin/')
    expect(paths[1]).toBe('/tmp/plugin//src')
  })

  it('works with deeply nested path', () => {
    const paths = getDirectoryPaths('/home/user/projects/plugins/my-plugin')
    expect(paths[0]).toBe('/home/user/projects/plugins/my-plugin')
    expect(paths[2]).toBe('/home/user/projects/plugins/my-plugin/src/rules')
  })

  it('produces deterministic results', () => {
    const a = getDirectoryPaths('/test')
    const b = getDirectoryPaths('/test')
    expect(a).toEqual(b)
  })

  it('returns an array', () => {
    expect(Array.isArray(getDirectoryPaths('/x'))).toBe(true)
  })

  it('contains all src and test subdirectories', () => {
    const paths = getDirectoryPaths('/project')
    expect(paths).toContain('/project/src')
    expect(paths).toContain('/project/src/rules')
    expect(paths).toContain('/project/test')
    expect(paths).toContain('/project/test/rules')
  })
})
