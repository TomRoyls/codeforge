import { describe, it, expect } from 'vitest'

import {
  parseJSDoc,
  parseParameters,
  extractFunctions,
  extractClasses,
  extractInterfaces,
  extractTypes,
  extractConstants,
  computeApiDocsStats,
  buildApiDocsResult,
  type ApiModule,
  type ApiDocsResult,
} from '../src/commands/api-docs-helpers.js'

import {
  formatApiDocsTable,
  formatApiDocsMarkdown,
  formatApiDocsJson,
  formatApiDocsHtml,
} from '../src/commands/api-docs-format-helpers.js'

import ApiDocs from '../src/commands/api-docs.js'

// ─── parseJSDoc ─────────────────────────────────────────

describe('parseJSDoc', () => {
  it('should extract description', () => {
    const result = parseJSDoc('/** Adds two numbers. */')
    expect(result.description).toBe('Adds two numbers.')
  })

  it('should extract @param', () => {
    const result = parseJSDoc('/** Add.\n * @param a first number\n * @param b second\n */')
    expect(result.params).toHaveLength(2)
    expect(result.params[0].name).toBe('a')
  })

  it('should extract @returns', () => {
    const result = parseJSDoc('/** Add.\n * @returns the sum\n */')
    expect(result.returns).toBe('the sum')
  })

  it('should extract @example', () => {
    const result = parseJSDoc('/** Add.\n * @example\n * add(1, 2)\n */')
    expect(result.examples).toHaveLength(1)
    expect(result.examples[0]).toContain('add(1, 2)')
  })

  it('should detect @deprecated', () => {
    const result = parseJSDoc('/** Old fn.\n * @deprecated use newFn\n */')
    expect(result.deprecated).toBe(true)
  })

  it('should extract @since', () => {
    const result = parseJSDoc('/** Fn.\n * @since 1.0.0\n */')
    expect(result.since).toBe('1.0.0')
  })

  it('should extract @see', () => {
    const result = parseJSDoc('/** Fn.\n * @see otherFn\n */')
    expect(result.see).toContain('otherFn')
  })

  it('should handle empty comment', () => {
    const result = parseJSDoc('')
    expect(result.description).toBe('')
    expect(result.params).toHaveLength(0)
  })

  it('should extract typed @param', () => {
    const result = parseJSDoc('/** Fn.\n * @param {number} a the value\n */')
    expect(result.params[0].type).toBe('number')
    expect(result.params[0].description).toBe('the value')
  })
})

// ─── parseParameters ────────────────────────────────────

describe('parseParameters', () => {
  it('should parse single param', () => {
    const params = parseParameters('(a: number)')
    expect(params).toHaveLength(1)
    expect(params[0].name).toBe('a')
    expect(params[0].type).toBe('number')
  })

  it('should detect optional params', () => {
    const params = parseParameters('(a: number, b?: string)')
    expect(params[0].optional).toBe(false)
    expect(params[1].optional).toBe(true)
  })

  it('should detect default values', () => {
    const params = parseParameters('(a: number = 10)')
    expect(params[0].default_value).toBe('10')
  })

  it('should handle empty params', () => {
    expect(parseParameters('()')).toHaveLength(0)
  })

  it('should handle multiple params', () => {
    const params = parseParameters('(a: string, b: number, c: boolean)')
    expect(params).toHaveLength(3)
  })

  it('should handle complex types', () => {
    const params = parseParameters('(fn: (x: number) => void)')
    expect(params).toHaveLength(1)
    expect(params[0].name).toBe('fn')
  })
})

// ─── extractFunctions ───────────────────────────────────

describe('extractFunctions', () => {
  it('should extract exported function', () => {
    const code = 'export function add(a: number, b: number): number { return a + b }\n'
    const fns = extractFunctions(code, 'math.ts')
    expect(fns).toHaveLength(1)
    expect(fns[0].name).toBe('add')
  })

  it('should extract async function', () => {
    const code = 'export async function fetchData(url: string): Promise<void> {}\n'
    const fns = extractFunctions(code, 'api.ts')
    expect(fns).toHaveLength(1)
    expect(fns[0].name).toBe('fetchData')
  })

  it('should extract return type', () => {
    const code = 'export function getLen(s: string): number { return s.length }\n'
    const fns = extractFunctions(code, 'util.ts')
    expect(fns[0].returnType).toContain('number')
  })

  it('should ignore non-exported functions', () => {
    const code = 'function internal() {}\n'
    const fns = extractFunctions(code, 'a.ts')
    expect(fns).toHaveLength(0)
  })

  it('should extract JSDoc description', () => {
    const code = '/**\n * Adds numbers.\n */\nexport function add(a: number): number { return a }\n'
    const fns = extractFunctions(code, 'math.ts')
    expect(fns[0].description).toContain('Adds numbers')
  })

  it('should extract parameters', () => {
    const code = 'export function mul(a: number, b: number): number { return a * b }\n'
    const fns = extractFunctions(code, 'math.ts')
    expect(fns[0].parameters.length).toBeGreaterThanOrEqual(1)
    expect(fns[0].parameters[0].name).toBe('a')
  })
})

// ─── extractClasses ─────────────────────────────────────

describe('extractClasses', () => {
  it('should extract exported class', () => {
    const code = 'export class Calculator {}\n'
    const classes = extractClasses(code, 'calc.ts')
    expect(classes).toHaveLength(1)
    expect(classes[0].name).toBe('Calculator')
  })

  it('should detect extends', () => {
    const code = 'export class Child extends Parent {}\n'
    const classes = extractClasses(code, 'a.ts')
    expect(classes[0].extends).toBe('Parent')
  })

  it('should detect implements', () => {
    const code = 'export class Service implements Runnable {}\n'
    const classes = extractClasses(code, 'a.ts')
    expect(classes[0].implements).toContain('Runnable')
  })

  it('should extract methods', () => {
    const code = 'export class Foo {\n  bar(x: number): string { return "hi" }\n}\n'
    const classes = extractClasses(code, 'a.ts')
    expect(classes[0].methods.length).toBeGreaterThan(0)
  })

  it('should extract JSDoc', () => {
    const code = '/**\n * A calculator.\n */\nexport class Calculator {}\n'
    const classes = extractClasses(code, 'calc.ts')
    expect(classes[0].description).toContain('calculator')
  })

  it('should ignore non-exported classes', () => {
    const code = 'class Internal {}\n'
    expect(extractClasses(code, 'a.ts')).toHaveLength(0)
  })
})

// ─── extractInterfaces ──────────────────────────────────

describe('extractInterfaces', () => {
  it('should extract exported interface', () => {
    const code = 'export interface User {\n  name: string\n  age: number\n}\n'
    const ifaces = extractInterfaces(code, 'types.ts')
    expect(ifaces).toHaveLength(1)
    expect(ifaces[0].name).toBe('User')
  })

  it('should extract properties', () => {
    const code = 'export interface Config {\n  port: number\n  host: string\n}\n'
    const ifaces = extractInterfaces(code, 'types.ts')
    expect(ifaces[0].properties).toHaveLength(2)
  })

  it('should detect extends', () => {
    const code = 'export interface Admin extends User {\n  role: string\n}\n'
    const ifaces = extractInterfaces(code, 'types.ts')
    expect(ifaces[0].extends).toContain('User')
  })

  it('should extract readonly properties', () => {
    const code = 'export interface Config {\n  readonly id: string\n}\n'
    const ifaces = extractInterfaces(code, 'types.ts')
    expect(ifaces[0].properties[0].readonly).toBe(true)
  })

  it('should extract JSDoc', () => {
    const code = '/**\n * User object.\n */\nexport interface User { name: string }\n'
    const ifaces = extractInterfaces(code, 'types.ts')
    expect(ifaces[0].description).toContain('User object')
  })
})

// ─── extractTypes ───────────────────────────────────────

describe('extractTypes', () => {
  it('should extract type alias', () => {
    const code = "export type Status = 'ok' | 'error';\n"
    const types = extractTypes(code, 'types.ts')
    expect(types).toHaveLength(1)
    expect(types[0].name).toBe('Status')
  })

  it('should capture definition', () => {
    const code = 'export type ID = string;\n'
    const types = extractTypes(code, 'types.ts')
    expect(types[0].definition).toContain('string')
  })

  it('should extract JSDoc', () => {
    const code = '/**\n * Status type.\n */\nexport type Status = string;\n'
    const types = extractTypes(code, 'types.ts')
    expect(types[0].description).toContain('Status type')
  })

  it('should ignore non-exported types', () => {
    const code = 'type Internal = number;\n'
    expect(extractTypes(code, 'a.ts')).toHaveLength(0)
  })
})

// ─── extractConstants ───────────────────────────────────

describe('extractConstants', () => {
  it('should extract exported const', () => {
    const code = 'export const MAX_SIZE = 100\n'
    const consts = extractConstants(code, 'config.ts')
    expect(consts).toHaveLength(1)
    expect(consts[0].name).toBe('MAX_SIZE')
  })

  it('should capture value', () => {
    const code = 'export const PI = 3.14\n'
    const consts = extractConstants(code, 'math.ts')
    expect(consts[0].value).toBe('3.14')
  })

  it('should capture type annotation', () => {
    const code = 'export const name: string = "codeforge"\n'
    const consts = extractConstants(code, 'a.ts')
    expect(consts[0].type).toContain('string')
  })

  it('should extract JSDoc', () => {
    const code = '/**\n * Max size.\n */\nexport const MAX = 100\n'
    const consts = extractConstants(code, 'config.ts')
    expect(consts[0].description).toContain('Max size')
  })
})

// ─── computeApiDocsStats ────────────────────────────────

describe('computeApiDocsStats', () => {
  it('should handle empty modules', () => {
    const stats = computeApiDocsStats([])
    expect(stats.totalModules).toBe(0)
    expect(stats.documentationCoverage).toBe(100)
  })

  it('should count functions', () => {
    const mods: ApiModule[] = [{
      classes: [], constants: [], description: '', file: 'a.ts', functions: [
        { deprecated: false, description: '', examples: [], exportType: 'named' as const, file: 'a.ts', line: 1, name: 'fn', parameters: [], returnType: 'void', see: [], since: '', signature: 'fn()' },
      ], interfaces: [], path: 'a.ts', types: [],
    }]
    const stats = computeApiDocsStats(mods)
    expect(stats.totalFunctions).toBe(1)
  })

  it('should count documented vs undocumented', () => {
    const mods: ApiModule[] = [{
      classes: [], constants: [], description: '', file: 'a.ts', functions: [
        { deprecated: false, description: 'has doc', examples: [], exportType: 'named' as const, file: 'a.ts', line: 1, name: 'fn1', parameters: [], returnType: 'void', see: [], since: '', signature: 'fn1()' },
        { deprecated: false, description: '', examples: [], exportType: 'named' as const, file: 'a.ts', line: 5, name: 'fn2', parameters: [], returnType: 'void', see: [], since: '', signature: 'fn2()' },
      ], interfaces: [], path: 'a.ts', types: [],
    }]
    const stats = computeApiDocsStats(mods)
    expect(stats.documentedItems).toBe(1)
    expect(stats.undocumentedItems).toBe(1)
    expect(stats.documentationCoverage).toBe(50)
  })

  it('should count classes and interfaces', () => {
    const mods: ApiModule[] = [{
      classes: [
        { deprecated: false, description: '', examples: [], exportType: 'named' as const, extends: '', file: 'a.ts', implements: [], line: 1, methods: [], name: 'Cls', properties: [], see: [], since: '' },
      ],
      constants: [],
      description: '',
      file: 'a.ts',
      functions: [],
      interfaces: [
        { description: 'iface', extends: [], file: 'a.ts', line: 5, name: 'Iface', properties: [] },
      ],
      path: 'a.ts',
      types: [],
    }]
    const stats = computeApiDocsStats(mods)
    expect(stats.totalClasses).toBe(1)
    expect(stats.totalInterfaces).toBe(1)
  })
})

// ─── buildApiDocsResult ─────────────────────────────────

describe('buildApiDocsResult', () => {
  it('should return empty result for no files', async () => {
    const result = await buildApiDocsResult([], async () => '', { extensions: null, ignorePatterns: [] })
    expect(result.modules).toHaveLength(0)
    expect(result.stats.totalModules).toBe(0)
  })

  it('should extract from provided content', async () => {
    const files = ['test.ts']
    const reader = async () => 'export function hello(name: string): string { return name }\n'
    const result = await buildApiDocsResult(files, reader, { extensions: null, ignorePatterns: [] })
    expect(result.modules).toHaveLength(1)
    expect(result.modules[0].functions).toHaveLength(1)
  })

  it('should filter by extension', async () => {
    const files = ['a.ts', 'b.js', 'c.css']
    const reader = async () => 'export function fn() {}\n'
    const result = await buildApiDocsResult(files, reader, { extensions: ['.ts'], ignorePatterns: [] })
    expect(result.modules).toHaveLength(1)
  })

  it('should skip unreadable files', async () => {
    const files = ['missing.ts']
    const reader = async () => { throw new Error('not found') }
    const result = await buildApiDocsResult(files, reader, { extensions: null, ignorePatterns: [] })
    expect(result.modules).toHaveLength(0)
  })

  it('should compute stats', async () => {
    const files = ['a.ts']
    const reader = async () => '/** Doc. */\nexport function fn() {}\nexport interface I {}\n'
    const result = await buildApiDocsResult(files, reader, { extensions: null, ignorePatterns: [] })
    expect(result.stats.totalFunctions).toBe(1)
    expect(result.stats.totalInterfaces).toBe(1)
  })
})

// ─── formatApiDocsTable ─────────────────────────────────

describe('formatApiDocsTable', () => {
  function makeResult(): ApiDocsResult {
    return {
      modules: [{
        classes: [],
        constants: [],
        description: 'Test module',
        file: 'test.ts',
        functions: [
          { deprecated: false, description: 'A function', examples: [], exportType: 'named' as const, file: 'test.ts', line: 1, name: 'hello', parameters: [{ default_value: null, description: '', name: 'name', optional: false, type: 'string' }], returnType: 'string', see: [], since: '', signature: 'function hello(name: string): string' },
        ],
        interfaces: [],
        path: 'test.ts',
        types: [],
      }],
      stats: { documentedItems: 1, documentationCoverage: 100, totalClasses: 0, totalConstants: 0, totalFunctions: 1, totalInterfaces: 0, totalModules: 1, totalTypes: 0, undocumentedItems: 0 },
    }
  }

  it('should contain API Documentation header', () => {
    expect(formatApiDocsTable(makeResult(), false)).toContain('API Documentation')
  })

  it('should show function names', () => {
    expect(formatApiDocsTable(makeResult(), false)).toContain('hello')
  })

  it('should show stats', () => {
    expect(formatApiDocsTable(makeResult(), false)).toContain('Coverage')
  })

  it('should show params in verbose mode', () => {
    expect(formatApiDocsTable(makeResult(), true)).toContain('name')
  })
})

// ─── formatApiDocsMarkdown ──────────────────────────────

describe('formatApiDocsMarkdown', () => {
  it('should contain API Documentation header', () => {
    const r: ApiDocsResult = { modules: [], stats: { documentedItems: 0, documentationCoverage: 100, totalClasses: 0, totalConstants: 0, totalFunctions: 0, totalInterfaces: 0, totalModules: 0, totalTypes: 0, undocumentedItems: 0 } }
    expect(formatApiDocsMarkdown(r)).toContain('API Documentation')
  })

  it('should render function signatures in code blocks', () => {
    const r: ApiDocsResult = {
      modules: [{
        classes: [], constants: [], description: '', file: 'a.ts',
        functions: [{ deprecated: false, description: '', examples: [], exportType: 'named' as const, file: 'a.ts', line: 1, name: 'add', parameters: [], returnType: 'number', see: [], since: '', signature: 'function add(a: number, b: number): number' }],
        interfaces: [], path: 'a.ts', types: [],
      }],
      stats: { documentedItems: 0, documentationCoverage: 100, totalClasses: 0, totalConstants: 0, totalFunctions: 1, totalInterfaces: 0, totalModules: 1, totalTypes: 0, undocumentedItems: 1 },
    }
    const md = formatApiDocsMarkdown(r)
    expect(md).toContain('```')
    expect(md).toContain('add')
  })
})

// ─── formatApiDocsJson ──────────────────────────────────

describe('formatApiDocsJson', () => {
  it('should produce valid JSON', () => {
    const r: ApiDocsResult = { modules: [], stats: { documentedItems: 0, documentationCoverage: 100, totalClasses: 0, totalConstants: 0, totalFunctions: 0, totalInterfaces: 0, totalModules: 0, totalTypes: 0, undocumentedItems: 0 } }
    expect(() => JSON.parse(formatApiDocsJson(r))).not.toThrow()
  })

  it('should contain stats', () => {
    const r: ApiDocsResult = { modules: [], stats: { documentedItems: 5, documentationCoverage: 80, totalClasses: 2, totalConstants: 1, totalFunctions: 3, totalInterfaces: 1, totalModules: 2, totalTypes: 1, undocumentedItems: 1 } }
    const parsed = JSON.parse(formatApiDocsJson(r))
    expect(parsed.stats.totalFunctions).toBe(3)
  })
})

// ─── formatApiDocsHtml ──────────────────────────────────

describe('formatApiDocsHtml', () => {
  it('should produce valid HTML structure', () => {
    const r: ApiDocsResult = { modules: [], stats: { documentedItems: 0, documentationCoverage: 100, totalClasses: 0, totalConstants: 0, totalFunctions: 0, totalInterfaces: 0, totalModules: 0, totalTypes: 0, undocumentedItems: 0 } }
    const html = formatApiDocsHtml(r)
    expect(html).toContain('<html')
    expect(html).toContain('</html>')
    expect(html).toContain('<!DOCTYPE html>')
  })

  it('should show function names', () => {
    const r: ApiDocsResult = {
      modules: [{
        classes: [], constants: [], description: '', file: 'a.ts',
        functions: [{ deprecated: false, description: '', examples: [], exportType: 'named' as const, file: 'a.ts', line: 1, name: 'hello', parameters: [], returnType: 'void', see: [], since: '', signature: 'hello()' }],
        interfaces: [], path: 'a.ts', types: [],
      }],
      stats: { documentedItems: 0, documentationCoverage: 100, totalClasses: 0, totalConstants: 0, totalFunctions: 1, totalInterfaces: 0, totalModules: 1, totalTypes: 0, undocumentedItems: 1 },
    }
    expect(formatApiDocsHtml(r)).toContain('hello')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('ApiDocs command', () => {
  it('should have correct description', () => {
    expect(ApiDocs.description).toContain('API documentation')
  })

  it('should have path arg', () => {
    expect(ApiDocs.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(ApiDocs.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(ApiDocs.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(ApiDocs.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(ApiDocs.flags.ext).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(ApiDocs.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(ApiDocs.examples.length).toBeGreaterThan(0)
  })
})
