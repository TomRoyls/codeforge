import { describe, it, expect } from 'vitest'
import { SourceAnalyzer } from '../../src/core/test-gen/source-analyzer.js'
import { TestScaffolder } from '../../src/core/test-gen/test-scaffolder.js'
import { TestGenerator } from '../../src/core/test-gen/test-generator.js'
import { DEFAULT_TEST_CONFIG } from '../../src/core/test-gen/types.js'
import type { AnalyzedFunction, AnalyzedClass, TestConfig } from '../../src/core/test-gen/types.js'

describe('SourceAnalyzer', () => {
  const analyzer = new SourceAnalyzer()

  describe('analyzeFunction', () => {
    it('should analyze a basic function', () => {
      const source = 'function add(a: number, b: number): number { return a + b }'
      const result = analyzer.analyzeFunction(source, 'add')
      expect(result).not.toBeNull()
      expect(result!.name).toBe('add')
      expect(result!.params).toHaveLength(2)
      expect(result!.returnType).toBe('number')
      expect(result!.isAsync).toBe(false)
    })

    it('should analyze an exported function', () => {
      const source = 'export function greet(name: string): string { return `Hello ${name}` }'
      const result = analyzer.analyzeFunction(source, 'greet')
      expect(result).not.toBeNull()
      expect(result!.isExported).toBe(true)
    })

    it('should analyze an async function', () => {
      const source = 'async function fetchData(url: string): Promise<string> { return fetch(url) }'
      const result = analyzer.analyzeFunction(source, 'fetchData')
      expect(result).not.toBeNull()
      expect(result!.isAsync).toBe(true)
      expect(result!.returnType).toBe('Promise<string>')
    })

    it('should analyze a function with no params', () => {
      const source = 'function getValue(): number { return 42 }'
      const result = analyzer.analyzeFunction(source, 'getValue')
      expect(result).not.toBeNull()
      expect(result!.params).toHaveLength(0)
    })

    it('should analyze a function with optional params', () => {
      const source = 'function greet(name: string, greeting?: string): string { return greeting + name }'
      const result = analyzer.analyzeFunction(source, 'greet')
      expect(result).not.toBeNull()
      expect(result!.params).toHaveLength(2)
      expect(result!.params[1]!.optional).toBe(true)
    })

    it('should analyze a function with default params', () => {
      const source = 'function greet(name: string, greeting: string = "hello"): string { return greeting + name }'
      const result = analyzer.analyzeFunction(source, 'greet')
      expect(result).not.toBeNull()
      expect(result!.params[1]!.defaultValue).toBe('"hello"')
    })

    it('should return null for non-existent function', () => {
      const source = 'function add(a: number, b: number): number { return a + b }'
      const result = analyzer.analyzeFunction(source, 'subtract')
      expect(result).toBeNull()
    })

    it('should analyze an arrow function', () => {
      const source = 'const multiply = (a: number, b: number): number => a * b'
      const result = analyzer.analyzeFunction(source, 'multiply')
      expect(result).not.toBeNull()
      expect(result!.name).toBe('multiply')
      expect(result!.params).toHaveLength(2)
    })

    it('should analyze an exported arrow function', () => {
      const source = 'export const divide = (a: number, b: number): number => a / b'
      const result = analyzer.analyzeFunction(source, 'divide')
      expect(result).not.toBeNull()
      expect(result!.isExported).toBe(true)
    })

    it('should detect external calls', () => {
      const source = 'function loadData(url: string): string { fetch(url); return "done" }'
      const result = analyzer.analyzeFunction(source, 'loadData')
      expect(result).not.toBeNull()
      expect(result!.callsExternal).toBe(true)
    })

    it('should detect no external calls for pure functions', () => {
      const source = 'function add(a: number, b: number): number { return a + b }'
      const result = analyzer.analyzeFunction(source, 'add')
      expect(result).not.toBeNull()
      expect(result!.callsExternal).toBe(false)
    })

    it('should detect process usage as external', () => {
      const source = 'function getEnv(key: string): string { return process.env[key] ?? "" }'
      const result = analyzer.analyzeFunction(source, 'getEnv')
      expect(result).not.toBeNull()
      expect(result!.callsExternal).toBe(true)
    })
  })

  describe('analyzeClass', () => {
    it('should analyze a basic class', () => {
      const source = 'class Calculator { add(a: number, b: number): number { return a + b } }'
      const result = analyzer.analyzeClass(source, 'Calculator')
      expect(result).not.toBeNull()
      expect(result!.name).toBe('Calculator')
      expect(result!.methods).toHaveLength(1)
    })

    it('should analyze an exported class', () => {
      const source = 'export class Service { run(): void {} }'
      const result = analyzer.analyzeClass(source, 'Service')
      expect(result).not.toBeNull()
      expect(result!.isExported).toBe(true)
    })

    it('should analyze an abstract class', () => {
      const source = 'export abstract class Base { abstract doWork(): void }'
      const result = analyzer.analyzeClass(source, 'Base')
      expect(result).not.toBeNull()
      expect(result!.isAbstract).toBe(true)
    })

    it('should analyze a class with constructor', () => {
      const source = 'class User { constructor(public name: string, private age: number) {} getName(): string { return this.name } }'
      const result = analyzer.analyzeClass(source, 'User')
      expect(result).not.toBeNull()
      expect(result!.constructor).not.toBeNull()
      expect(result!.constructor!.params).toHaveLength(2)
      expect(result!.methods).toHaveLength(1)
    })

    it('should analyze class properties', () => {
      const source = 'class Config { public name: string; private value: number; constructor() {} }'
      const result = analyzer.analyzeClass(source, 'Config')
      expect(result).not.toBeNull()
      expect(result!.properties.length).toBeGreaterThanOrEqual(1)
    })

    it('should return null for non-existent class', () => {
      const source = 'class Foo {}'
      const result = analyzer.analyzeClass(source, 'Bar')
      expect(result).toBeNull()
    })

    it('should analyze class with async methods', () => {
      const source = 'class Api { async fetch(): Promise<string> { return "data" } }'
      const result = analyzer.analyzeClass(source, 'Api')
      expect(result).not.toBeNull()
      expect(result!.methods).toHaveLength(1)
      expect(result!.methods[0]!.isAsync).toBe(true)
    })

    it('should analyze class extending another class', () => {
      const source = 'class Child extends Parent { doStuff(): void {} }'
      const result = analyzer.analyzeClass(source, 'Child')
      expect(result).not.toBeNull()
      expect(result!.name).toBe('Child')
    })
  })

  describe('analyzeModule', () => {
    it('should analyze a module with functions', () => {
      const source = 'export function add(a: number, b: number): number { return a + b }\nexport function subtract(a: number, b: number): number { return a - b }'
      const result = analyzer.analyzeModule(source)
      expect(result.functions).toHaveLength(2)
      expect(result.exports).toContain('add')
      expect(result.exports).toContain('subtract')
    })

    it('should analyze a module with classes', () => {
      const source = 'export class Calculator { add(a: number, b: number): number { return a + b } }'
      const result = analyzer.analyzeModule(source)
      expect(result.classes).toHaveLength(1)
      expect(result.exports).toContain('Calculator')
    })

    it('should analyze a mixed module', () => {
      const source = 'export function helper(): void {}\nexport class Service { run(): void {} }'
      const result = analyzer.analyzeModule(source)
      expect(result.functions).toHaveLength(1)
      expect(result.classes).toHaveLength(1)
      expect(result.exports).toHaveLength(2)
    })

    it('should return empty for empty module', () => {
      const result = analyzer.analyzeModule('')
      expect(result.functions).toHaveLength(0)
      expect(result.classes).toHaveLength(0)
      expect(result.exports).toHaveLength(0)
    })

    it('should detect exported constants', () => {
      const source = 'export const VERSION = "1.0.0"'
      const result = analyzer.analyzeModule(source)
      expect(result.exports).toContain('VERSION')
    })
  })

  describe('extractParams', () => {
    it('should extract typed params', () => {
      const params = analyzer.extractParams('a: number, b: string')
      expect(params).toHaveLength(2)
      expect(params[0]!.name).toBe('a')
      expect(params[0]!.type).toBe('number')
      expect(params[1]!.name).toBe('b')
      expect(params[1]!.type).toBe('string')
    })

    it('should extract optional params', () => {
      const params = analyzer.extractParams('name?: string')
      expect(params).toHaveLength(1)
      expect(params[0]!.optional).toBe(true)
    })

    it('should extract params with defaults', () => {
      const params = analyzer.extractParams('count: number = 10')
      expect(params).toHaveLength(1)
      expect(params[0]!.defaultValue).toBe('10')
    })

    it('should return empty for empty string', () => {
      const params = analyzer.extractParams('')
      expect(params).toHaveLength(0)
    })

    it('should handle generic types', () => {
      const params = analyzer.extractParams('items: Array<string>')
      expect(params).toHaveLength(1)
      expect(params[0]!.type).toBe('Array<string>')
    })

    it('should handle rest params', () => {
      const params = analyzer.extractParams('...args: number[]')
      expect(params).toHaveLength(1)
      expect(params[0]!.name).toBe('args')
    })

    it('should handle union types', () => {
      const params = analyzer.extractParams('value: string | number')
      expect(params).toHaveLength(1)
      expect(params[0]!.type).toBe('string | number')
    })
  })

  describe('detectReturnType', () => {
    it('should return the type string', () => {
      expect(analyzer.detectReturnType('number')).toBe('number')
    })

    it('should return void for empty string', () => {
      expect(analyzer.detectReturnType('')).toBe('void')
    })

    it('should handle complex types', () => {
      expect(analyzer.detectReturnType('Promise<string>')).toBe('Promise<string>')
    })

    it('should trim whitespace', () => {
      expect(analyzer.detectReturnType('  string  ')).toBe('string')
    })
  })

  describe('isPureFunction', () => {
    it('should return true for simple pure function', () => {
      const fn: AnalyzedFunction = {
        name: 'add',
        params: [],
        returnType: 'number',
        isAsync: false,
        isExported: false,
        complexity: 1,
        callsExternal: false,
        source: 'return a + b',
      }
      expect(analyzer.isPureFunction(fn)).toBe(true)
    })

    it('should return false for async function', () => {
      const fn: AnalyzedFunction = {
        name: 'fetchData',
        params: [],
        returnType: 'Promise<string>',
        isAsync: true,
        isExported: false,
        complexity: 1,
        callsExternal: false,
        source: 'return fetch(url)',
      }
      expect(analyzer.isPureFunction(fn)).toBe(false)
    })

    it('should return false for function with external calls', () => {
      const fn: AnalyzedFunction = {
        name: 'load',
        params: [],
        returnType: 'string',
        isAsync: false,
        isExported: false,
        complexity: 1,
        callsExternal: true,
        source: 'return fs.readFileSync(path)',
      }
      expect(analyzer.isPureFunction(fn)).toBe(false)
    })

    it('should return false for highly complex function', () => {
      const fn: AnalyzedFunction = {
        name: 'complex',
        params: [],
        returnType: 'void',
        isAsync: false,
        isExported: false,
        complexity: 15,
        callsExternal: false,
        source: 'many if else branches',
      }
      expect(analyzer.isPureFunction(fn)).toBe(false)
    })
  })

  describe('getComplexity', () => {
    it('should return 1 for empty source', () => {
      expect(analyzer.getComplexity('')).toBe(1)
    })

    it('should count if statements', () => {
      expect(analyzer.getComplexity('if (x) {}')).toBe(2)
    })

    it('should count else if statements', () => {
      expect(analyzer.getComplexity('if (x) {} else if (y) {}')).toBe(3)
    })

    it('should count for loops', () => {
      expect(analyzer.getComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
    })

    it('should count while loops', () => {
      expect(analyzer.getComplexity('while (true) {}')).toBe(2)
    })

    it('should count catch blocks', () => {
      expect(analyzer.getComplexity('try {} catch (e) {}')).toBe(2)
    })

    it('should count ternary operators', () => {
      expect(analyzer.getComplexity('x ? 1 : 0')).toBe(2)
    })

    it('should count logical operators', () => {
      expect(analyzer.getComplexity('a && b')).toBe(2)
      expect(analyzer.getComplexity('a || b')).toBe(2)
    })

    it('should count nullish coalescing', () => {
      expect(analyzer.getComplexity('a ?? b')).toBe(2)
    })

    it('should handle complex code', () => {
      const code = 'if (a) {} else if (b) {} for (let i = 0; i < n; i++) {} x ? 1 : 0'
      const complexity = analyzer.getComplexity(code)
      expect(complexity).toBe(5)
    })
  })
})

describe('TestScaffolder', () => {
  const scaffolder = new TestScaffolder()

  const defaultConfig: TestConfig = {
    framework: 'vitest',
    style: 'describe-it',
    includeEdgeCases: true,
    includeErrorCases: true,
    includeBoundaryCases: true,
    maxTestsPerFunction: 20,
  }

  const minimalConfig: TestConfig = {
    framework: 'vitest',
    style: 'describe-it',
    includeEdgeCases: false,
    includeErrorCases: false,
    includeBoundaryCases: false,
    maxTestsPerFunction: 5,
  }

  const sampleFunction: AnalyzedFunction = {
    name: 'add',
    params: [
      { name: 'a', type: 'number', optional: false },
      { name: 'b', type: 'number', optional: false },
    ],
    returnType: 'number',
    isAsync: false,
    isExported: true,
    complexity: 1,
    callsExternal: false,
    source: 'return a + b',
  }

  const sampleStringFunction: AnalyzedFunction = {
    name: 'greet',
    params: [
      { name: 'name', type: 'string', optional: false },
      { name: 'greeting', type: 'string', optional: true },
    ],
    returnType: 'string',
    isAsync: false,
    isExported: true,
    complexity: 1,
    callsExternal: false,
    source: 'return greeting + name',
  }

  const sampleArrayFunction: AnalyzedFunction = {
    name: 'getFirst',
    params: [
      { name: 'items', type: 'string[]', optional: false },
    ],
    returnType: 'string',
    isAsync: false,
    isExported: true,
    complexity: 2,
    callsExternal: false,
    source: 'if (items.length > 0) return items[0]; return ""',
  }

  const sampleExternalFunction: AnalyzedFunction = {
    name: 'loadData',
    params: [
      { name: 'url', type: 'string', optional: false },
    ],
    returnType: 'Promise<string>',
    isAsync: true,
    isExported: true,
    complexity: 1,
    callsExternal: true,
    source: 'return fetch(url)',
  }

  describe('scaffoldFunctionTest', () => {
    it('should scaffold a basic function test suite', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, defaultConfig)
      expect(suite.targetName).toBe('add')
      expect(suite.targetType).toBe('function')
      expect(suite.tests.length).toBeGreaterThan(0)
      expect(suite.imports).toContain('add')
    })

    it('should include happy-path tests', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, defaultConfig)
      const happyPaths = suite.tests.filter((t) => t.type === 'happy-path')
      expect(happyPaths.length).toBeGreaterThan(0)
    })

    it('should include edge case tests when configured', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, defaultConfig)
      const edgeCases = suite.tests.filter((t) => t.type === 'edge-case')
      expect(edgeCases.length).toBeGreaterThan(0)
    })

    it('should include error case tests when configured', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, defaultConfig)
      const errorCases = suite.tests.filter((t) => t.type === 'error-case')
      expect(errorCases.length).toBeGreaterThan(0)
    })

    it('should include boundary tests when configured', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, defaultConfig)
      const boundary = suite.tests.filter((t) => t.type === 'boundary')
      expect(boundary.length).toBeGreaterThan(0)
    })

    it('should skip edge cases when not configured', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, minimalConfig)
      const edgeCases = suite.tests.filter((t) => t.type === 'edge-case')
      expect(edgeCases).toHaveLength(0)
    })

    it('should skip error cases when not configured', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, minimalConfig)
      const errorCases = suite.tests.filter((t) => t.type === 'error-case')
      expect(errorCases).toHaveLength(0)
    })

    it('should skip boundary tests when not configured', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, minimalConfig)
      const boundary = suite.tests.filter((t) => t.type === 'boundary')
      expect(boundary).toHaveLength(0)
    })

    it('should respect maxTestsPerFunction limit', () => {
      const limitedConfig = { ...defaultConfig, maxTestsPerFunction: 2 }
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, limitedConfig)
      expect(suite.tests.length).toBeLessThanOrEqual(2)
    })

    it('should generate mocks for external function calls', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleExternalFunction, defaultConfig)
      expect(suite.mocks.length).toBeGreaterThan(0)
    })

    it('should not generate mocks for pure functions', () => {
      const suite = scaffolder.scaffoldFunctionTest(sampleFunction, defaultConfig)
      expect(suite.mocks).toHaveLength(0)
    })
  })

  describe('scaffoldClassTest', () => {
    const sampleClass: AnalyzedClass = {
      name: 'Calculator',
      methods: [
        {
          name: 'add',
          params: [
            { name: 'a', type: 'number', optional: false },
            { name: 'b', type: 'number', optional: false },
          ],
          returnType: 'number',
          isAsync: false,
          isExported: false,
          complexity: 1,
          callsExternal: false,
          source: 'return a + b',
        },
      ],
      properties: [
        { name: 'value', type: 'number', optional: false },
      ],
      constructor: {
        name: 'constructor',
        params: [
          { name: 'initialValue', type: 'number', optional: false },
        ],
        returnType: 'void',
        isAsync: false,
        isExported: false,
        complexity: 1,
        callsExternal: false,
        source: 'this.value = initialValue',
      },
      isExported: true,
      isAbstract: false,
    }

    it('should scaffold a class test suite', () => {
      const suite = scaffolder.scaffoldClassTest(sampleClass, defaultConfig)
      expect(suite.targetName).toBe('Calculator')
      expect(suite.targetType).toBe('class')
      expect(suite.tests.length).toBeGreaterThan(0)
    })

    it('should include constructor test', () => {
      const suite = scaffolder.scaffoldClassTest(sampleClass, defaultConfig)
      const ctorTests = suite.tests.filter((t) => t.name.includes('constructor'))
      expect(ctorTests.length).toBeGreaterThan(0)
    })

    it('should include method tests', () => {
      const suite = scaffolder.scaffoldClassTest(sampleClass, defaultConfig)
      const methodTests = suite.tests.filter((t) => t.name.includes('Calculator.add'))
      expect(methodTests.length).toBeGreaterThan(0)
    })

    it('should handle class without constructor', () => {
      const noCtorClass: AnalyzedClass = {
        ...sampleClass,
        constructor: null,
      }
      const suite = scaffolder.scaffoldClassTest(noCtorClass, defaultConfig)
      expect(suite.tests.length).toBeGreaterThan(0)
    })

    it('should generate mocks for classes with external method calls', () => {
      const externalClass: AnalyzedClass = {
        ...sampleClass,
        methods: [
          {
            name: 'fetch',
            params: [],
            returnType: 'Promise<string>',
            isAsync: true,
            isExported: false,
            complexity: 1,
            callsExternal: true,
            source: 'return fetch(url)',
          },
        ],
      }
      const suite = scaffolder.scaffoldClassTest(externalClass, defaultConfig)
      expect(suite.mocks.length).toBeGreaterThan(0)
    })
  })

  describe('generateHappyPathTests', () => {
    it('should generate at least one happy path test', () => {
      const tests = scaffolder.generateHappyPathTests(sampleFunction)
      expect(tests.length).toBeGreaterThanOrEqual(1)
      expect(tests[0]!.type).toBe('happy-path')
    })

    it('should handle function with no params', () => {
      const noParamFn: AnalyzedFunction = {
        name: 'getValue',
        params: [],
        returnType: 'number',
        isAsync: false,
        isExported: true,
        complexity: 1,
        callsExternal: false,
        source: 'return 42',
      }
      const tests = scaffolder.generateHappyPathTests(noParamFn)
      expect(tests).toHaveLength(1)
      expect(tests[0]!.inputs).toHaveLength(0)
    })

    it('should generate tests with correct input count', () => {
      const tests = scaffolder.generateHappyPathTests(sampleFunction)
      for (const test of tests) {
        expect(test.inputs).toHaveLength(2)
      }
    })
  })

  describe('generateEdgeCaseTests', () => {
    it('should generate edge cases for numeric params', () => {
      const tests = scaffolder.generateEdgeCaseTests(sampleFunction)
      const zeroTests = tests.filter((t) => t.description.includes('zero'))
      expect(zeroTests.length).toBeGreaterThan(0)
    })

    it('should generate edge cases for string params', () => {
      const tests = scaffolder.generateEdgeCaseTests(sampleStringFunction)
      const emptyTests = tests.filter((t) => t.description.includes('empty string'))
      expect(emptyTests.length).toBeGreaterThan(0)
    })

    it('should generate edge cases for optional params', () => {
      const tests = scaffolder.generateEdgeCaseTests(sampleStringFunction)
      const optionalTests = tests.filter((t) => t.description.includes('optional'))
      expect(optionalTests.length).toBeGreaterThan(0)
    })

    it('should generate edge cases for array params', () => {
      const tests = scaffolder.generateEdgeCaseTests(sampleArrayFunction)
      const emptyArrayTests = tests.filter((t) => t.description.includes('empty array'))
      expect(emptyArrayTests.length).toBeGreaterThan(0)
    })

    it('should return empty for function with no params', () => {
      const noParamFn: AnalyzedFunction = {
        name: 'noop',
        params: [],
        returnType: 'void',
        isAsync: false,
        isExported: false,
        complexity: 1,
        callsExternal: false,
        source: '',
      }
      const tests = scaffolder.generateEdgeCaseTests(noParamFn)
      expect(tests).toHaveLength(0)
    })
  })

  describe('generateErrorCaseTests', () => {
    it('should generate error cases for required params', () => {
      const tests = scaffolder.generateErrorCaseTests(sampleFunction)
      expect(tests.length).toBeGreaterThan(0)
      for (const test of tests) {
        expect(test.type).toBe('error-case')
      }
    })

    it('should generate test with no arguments', () => {
      const tests = scaffolder.generateErrorCaseTests(sampleFunction)
      const noArgsTest = tests.find((t) => t.description.includes('missing arguments'))
      expect(noArgsTest).toBeDefined()
    })

    it('should set expectedOutput to error', () => {
      const tests = scaffolder.generateErrorCaseTests(sampleFunction)
      const nullTests = tests.filter((t) => t.expectedOutput === 'error')
      expect(nullTests.length).toBeGreaterThan(0)
    })
  })

  describe('generateBoundaryTests', () => {
    it('should generate boundary tests for numeric params', () => {
      const tests = scaffolder.generateBoundaryTests(sampleFunction)
      const maxTests = tests.filter((t) => t.description.includes('MAX_SAFE_INTEGER'))
      expect(maxTests.length).toBeGreaterThan(0)
    })

    it('should generate boundary tests for string params', () => {
      const tests = scaffolder.generateBoundaryTests(sampleStringFunction)
      const longTests = tests.filter((t) => t.description.includes('very long'))
      expect(longTests.length).toBeGreaterThan(0)
    })

    it('should generate boundary tests for array params', () => {
      const tests = scaffolder.generateBoundaryTests(sampleArrayFunction)
      const largeTests = tests.filter((t) => t.description.includes('large array'))
      expect(largeTests.length).toBeGreaterThan(0)
    })
  })

  describe('generateMockCode', () => {
    it('should generate mock for object params', () => {
      const params = [{ name: 'service', type: 'IService', optional: false }]
      const code = scaffolder.generateMockCode(params)
      expect(code).toContain('mockService')
    })

    it('should handle primitive params gracefully', () => {
      const params = [{ name: 'count', type: 'number', optional: false }]
      const code = scaffolder.generateMockCode(params)
      expect(code).toContain('No mocks needed')
    })

    it('should handle empty params', () => {
      const code = scaffolder.generateMockCode([])
      expect(code).toContain('No mocks needed')
    })
  })
})

describe('TestGenerator', () => {
  const generator = new TestGenerator()

  const defaultConfig: TestConfig = {
    framework: 'vitest',
    style: 'describe-it',
    includeEdgeCases: true,
    includeErrorCases: true,
    includeBoundaryCases: true,
    maxTestsPerFunction: 20,
  }

  describe('generateTest', () => {
    it('should generate test from source string', () => {
      const source = 'export function add(a: number, b: number): number { return a + b }'
      const result = generator.generateTest(source)
      expect(result.source.length).toBeGreaterThan(0)
      expect(result.testCount).toBeGreaterThan(0)
    })

    it('should generate tests for multiple functions', () => {
      const source = 'export function add(a: number, b: number): number { return a + b }\nexport function sub(a: number, b: number): number { return a - b }'
      const result = generator.generateTest(source)
      expect(result.suiteNames).toContain('add')
      expect(result.suiteNames).toContain('sub')
    })

    it('should generate tests for classes', () => {
      const source = 'export class Calculator { add(a: number, b: number): number { return a + b } }'
      const result = generator.generateTest(source)
      expect(result.suiteNames).toContain('Calculator')
    })

    it('should handle empty source', () => {
      const result = generator.generateTest('')
      expect(result.testCount).toBe(0)
    })

    it('should use custom config', () => {
      const source = 'export function add(a: number, b: number): number { return a + b }'
      const fullResult = generator.generateTest(source, defaultConfig)
      const minimalResult = generator.generateTest(source, {
        ...defaultConfig,
        includeEdgeCases: false,
        includeErrorCases: false,
        includeBoundaryCases: false,
      })
      expect(fullResult.testCount).toBeGreaterThan(minimalResult.testCount)
    })
  })

  describe('generateForFunction', () => {
    const sampleFn: AnalyzedFunction = {
      name: 'add',
      params: [
        { name: 'a', type: 'number', optional: false },
        { name: 'b', type: 'number', optional: false },
      ],
      returnType: 'number',
      isAsync: false,
      isExported: true,
      complexity: 1,
      callsExternal: false,
      source: 'return a + b',
    }

    it('should generate test for a function', () => {
      const result = generator.generateForFunction(sampleFn)
      expect(result.source.length).toBeGreaterThan(0)
      expect(result.testCount).toBeGreaterThan(0)
      expect(result.suiteNames).toContain('add')
    })

    it('should use default config when none provided', () => {
      const result = generator.generateForFunction(sampleFn)
      expect(result.testCount).toBeGreaterThan(0)
    })
  })

  describe('generateForClass', () => {
    const sampleClass: AnalyzedClass = {
      name: 'Calculator',
      methods: [
        {
          name: 'add',
          params: [
            { name: 'a', type: 'number', optional: false },
            { name: 'b', type: 'number', optional: false },
          ],
          returnType: 'number',
          isAsync: false,
          isExported: false,
          complexity: 1,
          callsExternal: false,
          source: 'return a + b',
        },
      ],
      properties: [],
      constructor: null,
      isExported: true,
      isAbstract: false,
    }

    it('should generate test for a class', () => {
      const result = generator.generateForClass(sampleClass)
      expect(result.source.length).toBeGreaterThan(0)
      expect(result.testCount).toBeGreaterThan(0)
      expect(result.suiteNames).toContain('Calculator')
    })
  })

  describe('renderTestSuite', () => {
    it('should render describe-it style', () => {
      const suite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: [
          {
            name: 'add with valid inputs',
            description: 'should return expected result',
            inputs: [1, 2],
            expectedOutput: 3,
            type: 'happy-path',
          },
        ],
        imports: ['add'],
        fixtures: [],
        mocks: [],
      }
      const source = generator.renderTestSuite(suite, { ...defaultConfig, style: 'describe-it' })
      expect(source).toContain("describe('add'")
      expect(source).toContain("it('should return expected result'")
    })

    it('should render test-each style', () => {
      const suite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: [
          {
            name: 'add with valid inputs',
            description: 'should return expected result',
            inputs: [1, 2],
            expectedOutput: 3,
            type: 'happy-path',
          },
        ],
        imports: ['add'],
        fixtures: [],
        mocks: [],
      }
      const source = generator.renderTestSuite(suite, { ...defaultConfig, style: 'test-each' })
      expect(source).toContain('test.each')
    })

    it('should include mocks in output', () => {
      const suite: TestSuite = {
        targetName: 'fetch',
        targetType: 'function',
        tests: [],
        imports: ['fetch'],
        fixtures: [],
        mocks: ['const mockService = { valueOf: vi.fn() }'],
      }
      const source = generator.renderTestSuite(suite, defaultConfig)
      expect(source).toContain('mockService')
    })
  })

  describe('renderImports', () => {
    it('should render vitest imports', () => {
      const result = generator.renderImports(['add', 'subtract'], 'vitest')
      expect(result).toContain("from 'vitest'")
      expect(result).toContain('add')
      expect(result).toContain('subtract')
    })

    it('should render jest imports', () => {
      const result = generator.renderImports(['add'], 'jest')
      expect(result).toContain("@jest/globals")
    })

    it('should return empty for no imports', () => {
      const result = generator.renderImports([], 'vitest')
      expect(result).toBe('')
    })
  })

  describe('renderTestCase', () => {
    it('should render a happy-path test', () => {
      const test: TestCase = {
        name: 'add works',
        description: 'should add two numbers',
        inputs: [1, 2],
        expectedOutput: 3,
        type: 'happy-path',
      }
      const rendered = generator.renderTestCase(test, 'vitest')
      expect(rendered).toContain("it('should add two numbers'")
      expect(rendered).toContain('toEqual')
    })

    it('should render an error-case test', () => {
      const test: TestCase = {
        name: 'add throws',
        description: 'should throw for invalid input',
        inputs: [null],
        expectedOutput: 'error',
        type: 'error-case',
      }
      const rendered = generator.renderTestCase(test, 'vitest')
      expect(rendered).toContain('toThrow')
    })

    it('should render test with any expected output', () => {
      const test: TestCase = {
        name: 'edge case',
        description: 'should handle edge case',
        inputs: [0],
        expectedOutput: 'any',
        type: 'edge-case',
      }
      const rendered = generator.renderTestCase(test, 'vitest')
      expect(rendered).toContain('toBeDefined')
    })

    it('should render test with setup', () => {
      const test: TestCase = {
        name: 'with setup',
        description: 'should work with setup',
        inputs: [],
        expectedOutput: undefined,
        type: 'happy-path',
        setup: 'initializeMock()',
      }
      const rendered = generator.renderTestCase(test, 'vitest')
      expect(rendered).toContain('beforeEach')
      expect(rendered).toContain('initializeMock()')
    })

    it('should render test with teardown', () => {
      const test: TestCase = {
        name: 'with teardown',
        description: 'should clean up',
        inputs: [],
        expectedOutput: undefined,
        type: 'happy-path',
        teardown: 'cleanup()',
      }
      const rendered = generator.renderTestCase(test, 'vitest')
      expect(rendered).toContain('afterEach')
      expect(rendered).toContain('cleanup()')
    })

    it('should handle undefined and null inputs', () => {
      const test: TestCase = {
        name: 'null test',
        description: 'should handle null',
        inputs: [undefined, null],
        expectedOutput: 'any',
        type: 'edge-case',
      }
      const rendered = generator.renderTestCase(test, 'vitest')
      expect(rendered).toContain('undefined')
      expect(rendered).toContain('null')
    })
  })

  describe('estimateCoverage', () => {
    it('should return 0 for empty test suite', () => {
      const suite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: [],
        imports: [],
        fixtures: [],
        mocks: [],
      }
      expect(generator.estimateCoverage(suite)).toBe(0)
    })

    it('should increase coverage with more test types', () => {
      const baseSuite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: [
          { name: 't1', description: 'd', inputs: [], expectedOutput: 'any', type: 'happy-path' },
        ],
        imports: [],
        fixtures: [],
        mocks: [],
      }
      const fullSuite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: [
          { name: 't1', description: 'd', inputs: [], expectedOutput: 'any', type: 'happy-path' },
          { name: 't2', description: 'd', inputs: [], expectedOutput: 'any', type: 'edge-case' },
          { name: 't3', description: 'd', inputs: [], expectedOutput: 'any', type: 'error-case' },
          { name: 't4', description: 'd', inputs: [], expectedOutput: 'any', type: 'boundary' },
        ],
        imports: [],
        fixtures: [],
        mocks: [],
      }
      const baseCov = generator.estimateCoverage(baseSuite)
      const fullCov = generator.estimateCoverage(fullSuite)
      expect(fullCov).toBeGreaterThan(baseCov)
    })

    it('should cap coverage at 100', () => {
      const suite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: Array.from({ length: 50 }, (_, i) => ({
          name: `t${i}`,
          description: 'd',
          inputs: [],
          expectedOutput: 'any',
          type: 'happy-path' as const,
        })),
        imports: [],
        fixtures: [],
        mocks: [],
      }
      expect(generator.estimateCoverage(suite)).toBeLessThanOrEqual(100)
    })

    it('should give higher weight to first test of each type', () => {
      const singleTypeSuite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: [
          { name: 't1', description: 'd', inputs: [], expectedOutput: 'any', type: 'happy-path' },
          { name: 't2', description: 'd', inputs: [], expectedOutput: 'any', type: 'happy-path' },
        ],
        imports: [],
        fixtures: [],
        mocks: [],
      }
      const multiTypeSuite: TestSuite = {
        targetName: 'add',
        targetType: 'function',
        tests: [
          { name: 't1', description: 'd', inputs: [], expectedOutput: 'any', type: 'happy-path' },
          { name: 't2', description: 'd', inputs: [], expectedOutput: 'any', type: 'edge-case' },
        ],
        imports: [],
        fixtures: [],
        mocks: [],
      }
      expect(generator.estimateCoverage(multiTypeSuite)).toBeGreaterThan(
        generator.estimateCoverage(singleTypeSuite),
      )
    })
  })
})

describe('DEFAULT_TEST_CONFIG', () => {
  it('should have vitest as default framework', () => {
    expect(DEFAULT_TEST_CONFIG.framework).toBe('vitest')
  })

  it('should have describe-it as default style', () => {
    expect(DEFAULT_TEST_CONFIG.style).toBe('describe-it')
  })

  it('should include edge cases by default', () => {
    expect(DEFAULT_TEST_CONFIG.includeEdgeCases).toBe(true)
  })

  it('should include error cases by default', () => {
    expect(DEFAULT_TEST_CONFIG.includeErrorCases).toBe(true)
  })

  it('should include boundary cases by default', () => {
    expect(DEFAULT_TEST_CONFIG.includeBoundaryCases).toBe(true)
  })

  it('should have maxTestsPerFunction of 20', () => {
    expect(DEFAULT_TEST_CONFIG.maxTestsPerFunction).toBe(20)
  })
})
