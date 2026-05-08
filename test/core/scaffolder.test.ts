import { describe, it, expect } from 'vitest'
import { TemplateProcessor } from '../../src/core/scaffolder/template-processor.js'
import { Scaffolder } from '../../src/core/scaffolder/scaffolder.js'
import type { ScaffoldTemplate } from '../../src/core/scaffolder/types.js'
import { DEFAULT_SCAFFOLD_CONFIG } from '../../src/core/scaffolder/types.js'

describe('TemplateProcessor', () => {
  const processor = new TemplateProcessor()

  describe('process', () => {
    it('should replace a single variable', () => {
      expect(processor.process('Hello {{name}}!', { name: 'World' })).toBe('Hello World!')
    })

    it('should replace multiple variables', () => {
      expect(
        processor.process('{{greeting}} {{name}}', { greeting: 'Hello', name: 'World' }),
      ).toBe('Hello World')
    })

    it('should use default value when variable not provided', () => {
      expect(processor.process('Hello {{name:World}}!', {})).toBe('Hello World!')
    })

    it('should prefer provided value over default', () => {
      expect(processor.process('Hello {{name:World}}!', { name: 'CodeForge' })).toBe('Hello CodeForge!')
    })

    it('should leave placeholder when no value and no default', () => {
      expect(processor.process('Hello {{name}}!', {})).toBe('Hello {{name}}!')
    })

    it('should handle empty template string', () => {
      expect(processor.process('', {})).toBe('')
    })

    it('should handle template with no variables', () => {
      expect(processor.process('plain text', {})).toBe('plain text')
    })

    it('should handle special characters in replacement value', () => {
      expect(processor.process('{{content}}', { content: '<b>bold</b>' })).toBe('<b>bold</b>')
    })

    it('should replace same variable multiple times', () => {
      expect(processor.process('{{name}} and {{name}}', { name: 'test' })).toBe('test and test')
    })

    it('should handle adjacent placeholders', () => {
      expect(processor.process('{{a}}{{b}}', { a: 'X', b: 'Y' })).toBe('XY')
    })

    it('should handle default value with special characters', () => {
      expect(processor.process('{{val:default-value}}', {})).toBe('default-value')
    })

    it('should handle empty string as provided value', () => {
      expect(processor.process('Hello {{name}}!', { name: '' })).toBe('Hello !')
    })

    it('should handle default value with colons', () => {
      expect(processor.process('{{val:default:with:colons}}', {})).toBe('default:with:colons')
    })

    it('should handle mixed provided and default variables', () => {
      expect(
        processor.process('{{a}} {{b:default}} {{c}}', { a: 'X', c: 'Z' }),
      ).toBe('X default Z')
    })
  })

  describe('processPath', () => {
    it('should replace variables in path', () => {
      expect(processor.processPath('src/{{name}}.ts', { name: 'utils' })).toBe('src/utils.ts')
    })

    it('should replace multiple variables in path', () => {
      expect(
        processor.processPath('{{dir}}/{{name}}.ts', { dir: 'src', name: 'index' }),
      ).toBe('src/index.ts')
    })

    it('should use defaults in path', () => {
      expect(processor.processPath('src/{{name:default}}.ts', {})).toBe('src/default.ts')
    })

    it('should handle path with no variables', () => {
      expect(processor.processPath('src/index.ts', {})).toBe('src/index.ts')
    })

    it('should handle nested directory path', () => {
      expect(
        processor.processPath('src/core/{{module}}/{{name}}.ts', { module: 'utils', name: 'helper' }),
      ).toBe('src/core/utils/helper.ts')
    })
  })

  describe('validateVariables', () => {
    const makeTemplate = (vars: Array<{ name: string; required: boolean; defaultValue?: string }>): ScaffoldTemplate => ({
      name: 'test',
      description: 'test template',
      variables: vars.map((v) => ({
        name: v.name,
        description: `${v.name} variable`,
        required: v.required,
        defaultValue: v.defaultValue,
      })),
      files: [],
    })

    it('should return empty when all required variables are provided', () => {
      const tmpl = makeTemplate([{ name: 'a', required: true }])
      expect(processor.validateVariables(tmpl, { a: 'value' })).toEqual([])
    })

    it('should return missing required variable names', () => {
      const tmpl = makeTemplate([{ name: 'a', required: true }, { name: 'b', required: true }])
      expect(processor.validateVariables(tmpl, { a: 'value' })).toEqual(['b'])
    })

    it('should return multiple missing variable names', () => {
      const tmpl = makeTemplate([
        { name: 'a', required: true },
        { name: 'b', required: true },
        { name: 'c', required: true },
      ])
      expect(processor.validateVariables(tmpl, {})).toEqual(['a', 'b', 'c'])
    })

    it('should not require optional variables', () => {
      const tmpl = makeTemplate([{ name: 'a', required: true }, { name: 'b', required: false }])
      expect(processor.validateVariables(tmpl, { a: 'value' })).toEqual([])
    })

    it('should return empty for template with no variables', () => {
      const tmpl = makeTemplate([])
      expect(processor.validateVariables(tmpl, {})).toEqual([])
    })

    it('should handle all optional variables', () => {
      const tmpl = makeTemplate([{ name: 'a', required: false }, { name: 'b', required: false }])
      expect(processor.validateVariables(tmpl, {})).toEqual([])
    })
  })

  describe('extractVariables', () => {
    it('should extract single variable', () => {
      expect(processor.extractVariables('{{name}}')).toEqual(['name'])
    })

    it('should extract multiple variables', () => {
      const vars = processor.extractVariables('{{a}} and {{b}}')
      expect(vars).toContain('a')
      expect(vars).toContain('b')
    })

    it('should extract variables with default values', () => {
      const vars = processor.extractVariables('{{name:default}}')
      expect(vars).toEqual(['name'])
    })

    it('should deduplicate variables', () => {
      const vars = processor.extractVariables('{{name}} {{name}}')
      expect(vars).toEqual(['name'])
    })

    it('should return empty for template with no variables', () => {
      expect(processor.extractVariables('plain text')).toEqual([])
    })

    it('should extract from complex template', () => {
      const tmpl = 'Hello {{name}}, your {{role:admin}} access is {{status}}'
      const vars = processor.extractVariables(tmpl)
      expect(vars).toContain('name')
      expect(vars).toContain('role')
      expect(vars).toContain('status')
      expect(vars).toHaveLength(3)
    })
  })
})

describe('Scaffolder', () => {
  describe('constructor', () => {
    it('should use default config', () => {
      const scaffolder = new Scaffolder()
      const config = scaffolder.getConfig()
      expect(config.outputDir).toBe('.')
      expect(config.overwrite).toBe(false)
      expect(config.variables).toEqual({})
    })

    it('should accept partial config', () => {
      const scaffolder = new Scaffolder({ outputDir: './out', overwrite: true })
      const config = scaffolder.getConfig()
      expect(config.outputDir).toBe('./out')
      expect(config.overwrite).toBe(true)
      expect(config.variables).toEqual({})
    })

    it('should start with empty templates', () => {
      const scaffolder = new Scaffolder()
      expect(scaffolder.listTemplates()).toEqual([])
    })

    it('should create processor instance', () => {
      const scaffolder = new Scaffolder()
      expect(scaffolder.getProcessor()).toBeInstanceOf(TemplateProcessor)
    })
  })

  describe('registerTemplate', () => {
    it('should register a template', () => {
      const scaffolder = new Scaffolder()
      const tmpl: ScaffoldTemplate = {
        name: 'test',
        description: 'A test template',
        variables: [],
        files: [],
      }
      scaffolder.registerTemplate(tmpl)
      expect(scaffolder.getTemplate('test')).toBe(tmpl)
    })

    it('should register multiple templates', () => {
      const scaffolder = new Scaffolder()
      const a: ScaffoldTemplate = { name: 'a', description: 'A', variables: [], files: [] }
      const b: ScaffoldTemplate = { name: 'b', description: 'B', variables: [], files: [] }
      scaffolder.registerTemplate(a)
      scaffolder.registerTemplate(b)
      expect(scaffolder.listTemplates()).toEqual(['a', 'b'])
    })

    it('should overwrite template with same name', () => {
      const scaffolder = new Scaffolder()
      const v1: ScaffoldTemplate = { name: 'test', description: 'v1', variables: [], files: [] }
      const v2: ScaffoldTemplate = { name: 'test', description: 'v2', variables: [], files: [] }
      scaffolder.registerTemplate(v1)
      scaffolder.registerTemplate(v2)
      expect(scaffolder.getTemplate('test')!.description).toBe('v2')
    })

    it('should allow retrieval after registration', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({ name: 'demo', description: 'Demo', variables: [], files: [] })
      expect(scaffolder.getTemplate('demo')).toBeDefined()
    })
  })

  describe('getTemplate', () => {
    it('should return template by name', () => {
      const scaffolder = new Scaffolder()
      const tmpl: ScaffoldTemplate = { name: 'my-template', description: 'My template', variables: [], files: [] }
      scaffolder.registerTemplate(tmpl)
      expect(scaffolder.getTemplate('my-template')).toBe(tmpl)
    })

    it('should return undefined for unknown template', () => {
      const scaffolder = new Scaffolder()
      expect(scaffolder.getTemplate('unknown')).toBeUndefined()
    })

    it('should return correct template when multiple registered', () => {
      const scaffolder = new Scaffolder()
      const a: ScaffoldTemplate = { name: 'a', description: 'A', variables: [], files: [] }
      const b: ScaffoldTemplate = { name: 'b', description: 'B', variables: [], files: [] }
      scaffolder.registerTemplate(a)
      scaffolder.registerTemplate(b)
      expect(scaffolder.getTemplate('a')).toBe(a)
      expect(scaffolder.getTemplate('b')).toBe(b)
    })
  })

  describe('listTemplates', () => {
    it('should return empty array initially', () => {
      const scaffolder = new Scaffolder()
      expect(scaffolder.listTemplates()).toEqual([])
    })

    it('should return all registered template names', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({ name: 'a', description: 'A', variables: [], files: [] })
      scaffolder.registerTemplate({ name: 'b', description: 'B', variables: [], files: [] })
      scaffolder.registerTemplate({ name: 'c', description: 'C', variables: [], files: [] })
      expect(scaffolder.listTemplates()).toEqual(['a', 'b', 'c'])
    })

    it('should maintain insertion order', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({ name: 'z', description: 'Z', variables: [], files: [] })
      scaffolder.registerTemplate({ name: 'a', description: 'A', variables: [], files: [] })
      scaffolder.registerTemplate({ name: 'm', description: 'M', variables: [], files: [] })
      expect(scaffolder.listTemplates()).toEqual(['z', 'a', 'm'])
    })
  })

  describe('scaffold', () => {
    it('should scaffold a basic template with no variables', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'simple',
        description: 'Simple template',
        variables: [],
        files: [{ path: 'output.txt', content: 'hello world', executable: false }],
      })
      const result = scaffolder.scaffold('simple')
      expect(result.filesCreated).toEqual(['output.txt'])
      expect(result.filesSkipped).toEqual([])
    })

    it('should scaffold with provided variables', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'greet',
        description: 'Greeting',
        variables: [{ name: 'name', description: 'Name', required: true }],
        files: [{ path: 'greeting.txt', content: 'Hello {{name}}', executable: false }],
      })
      const result = scaffolder.scaffold('greet', { name: 'World' })
      expect(result.filesCreated).toEqual(['greeting.txt'])
      expect(result.variables.name).toBe('World')
    })

    it('should throw for missing required variables', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'req',
        description: 'Required',
        variables: [{ name: 'name', description: 'Name', required: true }],
        files: [],
      })
      expect(() => scaffolder.scaffold('req')).toThrow('Missing required variables: name')
    })

    it('should use default values for optional variables', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'opt',
        description: 'Optional',
        variables: [
          { name: 'name', description: 'Name', required: true },
          { name: 'greeting', description: 'Greeting', defaultValue: 'Hello', required: false },
        ],
        files: [{ path: 'out.txt', content: '{{greeting}} {{name}}', executable: false }],
      })
      const result = scaffolder.scaffold('opt', { name: 'World' })
      expect(result.variables.greeting).toBe('Hello')
      expect(result.variables.name).toBe('World')
    })

    it('should return processed file paths', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'path',
        description: 'Path test',
        variables: [{ name: 'module', description: 'Module', required: true }],
        files: [{ path: 'src/{{module}}.ts', content: '', executable: false }],
      })
      const result = scaffolder.scaffold('path', { module: 'utils' })
      expect(result.filesCreated).toContain('src/utils.ts')
    })

    it('should return resolved variables', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'vars',
        description: 'Vars test',
        variables: [
          { name: 'a', description: 'A', required: true },
          { name: 'b', description: 'B', defaultValue: 'defaultB', required: false },
        ],
        files: [],
      })
      const result = scaffolder.scaffold('vars', { a: 'valueA' })
      expect(result.variables).toEqual({ a: 'valueA', b: 'defaultB' })
    })

    it('should scaffold template with multiple files', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'multi',
        description: 'Multi file',
        variables: [{ name: 'name', description: 'Name', required: true }],
        files: [
          { path: '{{name}}.ts', content: 'export class {{name}} {}', executable: false },
          { path: '{{name}}.test.ts', content: 'import { {{name}} }', executable: false },
        ],
      })
      const result = scaffolder.scaffold('multi', { name: 'Foo' })
      expect(result.filesCreated).toEqual(['Foo.ts', 'Foo.test.ts'])
    })

    it('should merge config variables with provided variables', () => {
      const scaffolder = new Scaffolder({ variables: { name: 'ConfigName' } })
      scaffolder.registerTemplate({
        name: 'merge',
        description: 'Merge test',
        variables: [{ name: 'name', description: 'Name', required: true }],
        files: [],
      })
      const result = scaffolder.scaffold('merge')
      expect(result.variables.name).toBe('ConfigName')
    })

    it('should let provided variables override config variables', () => {
      const scaffolder = new Scaffolder({ variables: { name: 'ConfigName' } })
      scaffolder.registerTemplate({
        name: 'override',
        description: 'Override test',
        variables: [{ name: 'name', description: 'Name', required: true }],
        files: [],
      })
      const result = scaffolder.scaffold('override', { name: 'ProvidedName' })
      expect(result.variables.name).toBe('ProvidedName')
    })

    it('should throw for unknown template', () => {
      const scaffolder = new Scaffolder()
      expect(() => scaffolder.scaffold('nonexistent')).toThrow('Template not found: nonexistent')
    })

    it('should handle template with all optional variables', () => {
      const scaffolder = new Scaffolder()
      scaffolder.registerTemplate({
        name: 'allopt',
        description: 'All optional',
        variables: [
          { name: 'a', description: 'A', defaultValue: 'defA', required: false },
          { name: 'b', description: 'B', defaultValue: 'defB', required: false },
        ],
        files: [],
      })
      const result = scaffolder.scaffold('allopt')
      expect(result.variables).toEqual({ a: 'defA', b: 'defB' })
    })
  })

  describe('scaffold - overwrite behavior', () => {
    it('should skip duplicate file paths when overwrite is false', () => {
      const scaffolder = new Scaffolder({ overwrite: false })
      scaffolder.registerTemplate({
        name: 'dup',
        description: 'Duplicate paths',
        variables: [{ name: 'name', description: 'Name', required: true }],
        files: [
          { path: '{{name}}.ts', content: 'a', executable: false },
          { path: '{{name}}.ts', content: 'b', executable: false },
        ],
      })
      const result = scaffolder.scaffold('dup', { name: 'test' })
      expect(result.filesCreated).toEqual(['test.ts'])
      expect(result.filesSkipped).toEqual(['test.ts'])
    })

    it('should include duplicate file paths when overwrite is true', () => {
      const scaffolder = new Scaffolder({ overwrite: true })
      scaffolder.registerTemplate({
        name: 'dup',
        description: 'Duplicate paths',
        variables: [{ name: 'name', description: 'Name', required: true }],
        files: [
          { path: '{{name}}.ts', content: 'a', executable: false },
          { path: '{{name}}.ts', content: 'b', executable: false },
        ],
      })
      const result = scaffolder.scaffold('dup', { name: 'test' })
      expect(result.filesCreated).toEqual(['test.ts', 'test.ts'])
      expect(result.filesSkipped).toEqual([])
    })
  })

  describe('addBuiltinTemplates', () => {
    it('should register three templates', () => {
      const scaffolder = new Scaffolder()
      scaffolder.addBuiltinTemplates()
      expect(scaffolder.listTemplates()).toHaveLength(3)
    })

    it('should register typescript-module', () => {
      const scaffolder = new Scaffolder()
      scaffolder.addBuiltinTemplates()
      expect(scaffolder.getTemplate('typescript-module')).toBeDefined()
    })

    it('should register test-file', () => {
      const scaffolder = new Scaffolder()
      scaffolder.addBuiltinTemplates()
      expect(scaffolder.getTemplate('test-file')).toBeDefined()
    })

    it('should register config-json', () => {
      const scaffolder = new Scaffolder()
      scaffolder.addBuiltinTemplates()
      expect(scaffolder.getTemplate('config-json')).toBeDefined()
    })
  })

  describe('getConfig', () => {
    it('should return config', () => {
      const scaffolder = new Scaffolder({ outputDir: './dist' })
      expect(scaffolder.getConfig().outputDir).toBe('./dist')
    })

    it('should return a copy of config', () => {
      const scaffolder = new Scaffolder()
      const config = scaffolder.getConfig()
      config.overwrite = true
      expect(scaffolder.getConfig().overwrite).toBe(false)
    })

    it('should return default config when none provided', () => {
      const scaffolder = new Scaffolder()
      const config = scaffolder.getConfig()
      expect(config.outputDir).toBe(DEFAULT_SCAFFOLD_CONFIG.outputDir)
      expect(config.overwrite).toBe(DEFAULT_SCAFFOLD_CONFIG.overwrite)
    })
  })

  describe('getProcessor', () => {
    it('should return TemplateProcessor instance', () => {
      const scaffolder = new Scaffolder()
      expect(scaffolder.getProcessor()).toBeInstanceOf(TemplateProcessor)
    })

    it('should return the same processor instance on multiple calls', () => {
      const scaffolder = new Scaffolder()
      const p1 = scaffolder.getProcessor()
      const p2 = scaffolder.getProcessor()
      expect(p1).toBe(p2)
    })
  })
})

describe('Built-in templates - typescript-module', () => {
  const scaffolder = new Scaffolder()
  scaffolder.addBuiltinTemplates()
  const template = scaffolder.getTemplate('typescript-module')!

  it('should have correct name', () => {
    expect(template.name).toBe('typescript-module')
  })

  it('should have a description', () => {
    expect(template.description).toBeTruthy()
  })

  it('should have moduleName as required variable', () => {
    const modVar = template.variables.find((v) => v.name === 'moduleName')
    expect(modVar).toBeDefined()
    expect(modVar!.required).toBe(true)
  })

  it('should have description with default value', () => {
    const descVar = template.variables.find((v) => v.name === 'description')
    expect(descVar).toBeDefined()
    expect(descVar!.defaultValue).toBe('A TypeScript module')
  })

  it('should have author with default value', () => {
    const authorVar = template.variables.find((v) => v.name === 'author')
    expect(authorVar).toBeDefined()
    expect(authorVar!.defaultValue).toBe('CodeForge')
  })

  it('should generate content with replaced variables', () => {
    const processor = scaffolder.getProcessor()
    const content = processor.process(template.files[0]!.content, {
      moduleName: 'MyModule',
      description: 'My custom module',
      author: 'TestAuthor',
    })
    expect(content).toContain('export class MyModule')
    expect(content).toContain('export interface IMyModule')
    expect(content).toContain('My custom module')
    expect(content).toContain('TestAuthor')
  })

  it('should generate file in src directory', () => {
    const result = scaffolder.scaffold('typescript-module', { moduleName: 'TestMod' })
    expect(result.filesCreated[0]).toBe('src/TestMod.ts')
  })
})

describe('Built-in templates - test-file', () => {
  const scaffolder = new Scaffolder()
  scaffolder.addBuiltinTemplates()
  const template = scaffolder.getTemplate('test-file')!

  it('should have correct name', () => {
    expect(template.name).toBe('test-file')
  })

  it('should have a description', () => {
    expect(template.description).toBeTruthy()
  })

  it('should have moduleName as required variable', () => {
    const modVar = template.variables.find((v) => v.name === 'moduleName')
    expect(modVar).toBeDefined()
    expect(modVar!.required).toBe(true)
  })

  it('should have description with default value', () => {
    const descVar = template.variables.find((v) => v.name === 'description')
    expect(descVar).toBeDefined()
    expect(descVar!.defaultValue).toBe('Test file')
  })

  it('should generate content with describe block', () => {
    const processor = scaffolder.getProcessor()
    const content = processor.process(template.files[0]!.content, {
      moduleName: 'MyModule',
      description: 'MyModule tests',
    })
    expect(content).toContain("describe('MyModule tests'")
    expect(content).toContain('import { MyModule }')
  })

  it('should generate content with it blocks', () => {
    const processor = scaffolder.getProcessor()
    const content = processor.process(template.files[0]!.content, {
      moduleName: 'MyModule',
    })
    expect(content).toContain("it('should be defined'")
    expect(content).toContain("it('should execute correctly'")
  })
})

describe('Built-in templates - config-json', () => {
  const scaffolder = new Scaffolder()
  scaffolder.addBuiltinTemplates()
  const template = scaffolder.getTemplate('config-json')!

  it('should have correct name', () => {
    expect(template.name).toBe('config-json')
  })

  it('should have a description', () => {
    expect(template.description).toBeTruthy()
  })

  it('should have configName as required variable', () => {
    const nameVar = template.variables.find((v) => v.name === 'configName')
    expect(nameVar).toBeDefined()
    expect(nameVar!.required).toBe(true)
  })

  it('should have version with default value', () => {
    const versionVar = template.variables.find((v) => v.name === 'version')
    expect(versionVar).toBeDefined()
    expect(versionVar!.defaultValue).toBe('1.0.0')
  })

  it('should generate valid JSON template structure', () => {
    const processor = scaffolder.getProcessor()
    const content = processor.process(template.files[0]!.content, {
      configName: 'myconfig',
      version: '2.0.0',
      description: 'My config',
    })
    expect(content).toContain('"name": "myconfig"')
    expect(content).toContain('"version": "2.0.0"')
    expect(content).toContain('"description": "My config"')
  })
})

describe('Built-in templates - integration', () => {
  it('should scaffold typescript-module with variables', () => {
    const scaffolder = new Scaffolder()
    scaffolder.addBuiltinTemplates()
    const result = scaffolder.scaffold('typescript-module', { moduleName: 'Helper' })
    expect(result.filesCreated).toContain('src/Helper.ts')
    expect(result.variables.moduleName).toBe('Helper')
    expect(result.variables.description).toBe('A TypeScript module')
    expect(result.variables.author).toBe('CodeForge')
  })

  it('should scaffold test-file with variables', () => {
    const scaffolder = new Scaffolder()
    scaffolder.addBuiltinTemplates()
    const result = scaffolder.scaffold('test-file', { moduleName: 'Helper' })
    expect(result.filesCreated).toContain('test/Helper.test.ts')
    expect(result.variables.moduleName).toBe('Helper')
  })

  it('should scaffold config-json with variables', () => {
    const scaffolder = new Scaffolder()
    scaffolder.addBuiltinTemplates()
    const result = scaffolder.scaffold('config-json', { configName: 'settings' })
    expect(result.filesCreated).toContain('settings.json')
    expect(result.variables.configName).toBe('settings')
    expect(result.variables.version).toBe('1.0.0')
  })

  it('should throw when typescript-module missing required variable', () => {
    const scaffolder = new Scaffolder()
    scaffolder.addBuiltinTemplates()
    expect(() => scaffolder.scaffold('typescript-module')).toThrow('Missing required variables')
  })

  it('should throw when test-file missing required variable', () => {
    const scaffolder = new Scaffolder()
    scaffolder.addBuiltinTemplates()
    expect(() => scaffolder.scaffold('test-file')).toThrow('Missing required variables')
  })

  it('should throw when config-json missing required variable', () => {
    const scaffolder = new Scaffolder()
    scaffolder.addBuiltinTemplates()
    expect(() => scaffolder.scaffold('config-json')).toThrow('Missing required variables')
  })

  it('should process all built-in template contents correctly', () => {
    const scaffolder = new Scaffolder()
    scaffolder.addBuiltinTemplates()
    const processor = scaffolder.getProcessor()

    const tsModule = scaffolder.getTemplate('typescript-module')!
    const tsContent = processor.process(tsModule.files[0]!.content, {
      moduleName: 'Test',
      description: 'Test module',
      author: 'Tester',
    })
    expect(tsContent).not.toContain('{{')
    expect(tsContent).not.toContain('}}')

    const testFile = scaffolder.getTemplate('test-file')!
    const testContent = processor.process(testFile.files[0]!.content, {
      moduleName: 'Test',
      description: 'Test suite',
    })
    expect(testContent).not.toContain('{{')
    expect(testContent).not.toContain('}}')

    const configJson = scaffolder.getTemplate('config-json')!
    const configContent = processor.process(configJson.files[0]!.content, {
      configName: 'test',
      version: '1.0.0',
      description: 'Test config',
    })
    expect(configContent).not.toContain('{{')
    expect(configContent).not.toContain('}}')
  })
})

describe('DEFAULT_SCAFFOLD_CONFIG', () => {
  it('should have correct default outputDir', () => {
    expect(DEFAULT_SCAFFOLD_CONFIG.outputDir).toBe('.')
  })

  it('should have overwrite disabled by default', () => {
    expect(DEFAULT_SCAFFOLD_CONFIG.overwrite).toBe(false)
  })

  it('should have empty variables by default', () => {
    expect(DEFAULT_SCAFFOLD_CONFIG.variables).toEqual({})
  })
})

describe('Edge cases', () => {
  it('should handle template with executable flag', () => {
    const scaffolder = new Scaffolder()
    scaffolder.registerTemplate({
      name: 'script',
      description: 'Script template',
      variables: [{ name: 'name', description: 'Name', required: true }],
      files: [{ path: '{{name}}.sh', content: '#!/bin/bash\n', executable: true }],
    })
    const tmpl = scaffolder.getTemplate('script')!
    expect(tmpl.files[0]!.executable).toBe(true)
  })

  it('should handle empty files array', () => {
    const scaffolder = new Scaffolder()
    scaffolder.registerTemplate({
      name: 'empty',
      description: 'Empty files',
      variables: [],
      files: [],
    })
    const result = scaffolder.scaffold('empty')
    expect(result.filesCreated).toEqual([])
    expect(result.filesSkipped).toEqual([])
  })

  it('should handle variable with empty default value', () => {
    const processor = new TemplateProcessor()
    expect(processor.process('{{name:}}', {})).toBe('')
  })

  it('should handle process returning correct types', () => {
    const processor = new TemplateProcessor()
    const result = processor.process('Hello {{name}}', { name: 'World' })
    expect(typeof result).toBe('string')
    expect(result).toBe('Hello World')
  })
})
