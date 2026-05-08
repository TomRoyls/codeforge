import type { AnalyzedFunction, AnalyzedClass, TestSuite, TestConfig, GeneratedTest, TestCase } from './types.js'
import { DEFAULT_TEST_CONFIG } from './types.js'
import { SourceAnalyzer } from './source-analyzer.js'
import { TestScaffolder } from './test-scaffolder.js'

export class TestGenerator {
  private analyzer = new SourceAnalyzer()
  private scaffolder = new TestScaffolder()

  generateTest(source: string, config: TestConfig = DEFAULT_TEST_CONFIG): GeneratedTest {
    const module = this.analyzer.analyzeModule(source)
    const suiteNames: string[] = []
    let totalTests = 0
    const parts: string[] = []

    for (const fn of module.functions) {
      const generated = this.generateForFunction(fn, config)
      parts.push(generated.source)
      totalTests += generated.testCount
      suiteNames.push(...generated.suiteNames)
    }

    for (const cls of module.classes) {
      const generated = this.generateForClass(cls, config)
      parts.push(generated.source)
      totalTests += generated.testCount
      suiteNames.push(...generated.suiteNames)
    }

    const allImports: string[] = []
    for (const fn of module.functions) {
      if (fn.isExported) allImports.push(fn.name)
    }
    for (const cls of module.classes) {
      if (cls.isExported) allImports.push(cls.name)
    }

    const importBlock = this.renderImports(allImports, config.framework)
    const body = parts.join('\n\n')

    return {
      source: allImports.length > 0 ? `${importBlock}\n\n${body}` : body,
      testCount: totalTests,
      suiteNames,
    }
  }

  generateForFunction(fn: AnalyzedFunction, config: TestConfig = DEFAULT_TEST_CONFIG): GeneratedTest {
    const suite = this.scaffolder.scaffoldFunctionTest(fn, config)
    const source = this.renderTestSuite(suite, config)

    return {
      source,
      testCount: suite.tests.length,
      suiteNames: [fn.name],
    }
  }

  generateForClass(cls: AnalyzedClass, config: TestConfig = DEFAULT_TEST_CONFIG): GeneratedTest {
    const suite = this.scaffolder.scaffoldClassTest(cls, config)
    const source = this.renderTestSuite(suite, config)

    return {
      source,
      testCount: suite.tests.length,
      suiteNames: [cls.name],
    }
  }

  renderTestSuite(suite: TestSuite, config: TestConfig): string {
    const lines: string[] = []
    const importLine = this.renderImports(suite.imports, config.framework)
    lines.push(importLine)

    if (suite.mocks.length > 0) {
      lines.push('')
      for (const mock of suite.mocks) {
        lines.push(mock)
      }
    }

    lines.push('')

    if (config.style === 'describe-it') {
      lines.push(`describe('${suite.targetName}', () => {`)
      for (const test of suite.tests) {
        lines.push(this.renderTestCase(test, config.framework))
      }
      lines.push('})')
    } else {
      const testData = suite.tests.map((test) => ({
        name: test.name,
        inputs: test.inputs,
        expected: test.expectedOutput,
      }))
      lines.push(`describe('${suite.targetName}', () => {`)
      lines.push(`  test.each(${JSON.stringify(testData, null, 4)})('$name', ({ inputs, expected }) => {`)
      lines.push(`    const result = ${suite.targetName}(...inputs)`)
      lines.push(`    expect(result).toBe(expected)`)
      lines.push(`  })`)
      lines.push('})')
    }

    return lines.join('\n')
  }

  renderImports(imports: string[], framework: TestConfig['framework']): string {
    if (imports.length === 0) return ''

    const importTarget = framework === 'vitest'
      ? "{ describe, it, expect } from 'vitest'"
      : "{ describe, it, expect } from '@jest/globals'"

    const namedImports = imports.join(', ')
    return `import ${importTarget}\nimport { ${namedImports} } from './module.js'`
  }

  renderTestCase(test: TestCase, framework: TestConfig['framework']): string {
    void framework
    const indent = '  '
    const lines: string[] = []

    if (test.setup) {
      lines.push(`${indent}beforeEach(() => {`)
      lines.push(`${indent}  ${test.setup}`)
      lines.push(`${indent}})`)
      lines.push('')
    }

    const testFn = test.type === 'error-case' ? 'it' : 'it'
    lines.push(`${indent}${testFn}('${test.description}', () => {`)

    if (test.type === 'error-case' && test.expectedOutput === 'error') {
      lines.push(`${indent}  expect(() => {`)
      lines.push(`${indent}    target(${this.renderInputs(test.inputs)})`)
      lines.push(`${indent}  }).toThrow()`)
    } else {
      lines.push(`${indent}  const result = target(${this.renderInputs(test.inputs)})`)
      if (test.expectedOutput === 'any') {
        lines.push(`${indent}  expect(result).toBeDefined()`)
      } else {
        lines.push(`${indent}  expect(result).toEqual(${JSON.stringify(test.expectedOutput)})`)
      }
    }

    lines.push(`${indent}})`)

    if (test.teardown) {
      lines.push('')
      lines.push(`${indent}afterEach(() => {`)
      lines.push(`${indent}  ${test.teardown}`)
      lines.push(`${indent}})`)
    }

    return lines.join('\n')
  }

  estimateCoverage(suite: TestSuite): number {
    if (suite.tests.length === 0) return 0

    const typeWeights: Record<string, number> = {
      'happy-path': 20,
      'edge-case': 15,
      'error-case': 10,
      'boundary': 10,
    }

    let coverage = 0
    const seenTypes = new Set<string>()

    for (const test of suite.tests) {
      if (!seenTypes.has(test.type)) {
        coverage += typeWeights[test.type] ?? 10
        seenTypes.add(test.type)
      } else {
        coverage += 3
      }
    }

    return Math.min(coverage, 100)
  }

  private renderInputs(inputs: unknown[]): string {
    return inputs
      .map((input) => {
        if (input === undefined) return 'undefined'
        if (input === null) return 'null'
        return JSON.stringify(input)
      })
      .join(', ')
  }
}
