export interface AnalyzedParam {
  name: string
  type: string
  optional: boolean
  defaultValue?: string
}

export interface AnalyzedFunction {
  name: string
  params: AnalyzedParam[]
  returnType: string
  isAsync: boolean
  isExported: boolean
  complexity: number
  callsExternal: boolean
  source: string
}

export interface AnalyzedClass {
  name: string
  methods: AnalyzedFunction[]
  properties: AnalyzedParam[]
  constructor: AnalyzedFunction | null
  isExported: boolean
  isAbstract: boolean
}

export interface TestCase {
  name: string
  description: string
  inputs: unknown[]
  expectedOutput: unknown
  setup?: string
  teardown?: string
  type: 'happy-path' | 'edge-case' | 'error-case' | 'boundary'
}

export interface TestSuite {
  targetName: string
  targetType: 'function' | 'class' | 'module'
  tests: TestCase[]
  imports: string[]
  fixtures: string[]
  mocks: string[]
}

export interface TestConfig {
  framework: 'vitest' | 'jest'
  style: 'describe-it' | 'test-each'
  includeEdgeCases: boolean
  includeErrorCases: boolean
  includeBoundaryCases: boolean
  maxTestsPerFunction: number
}

export interface GeneratedTest {
  source: string
  testCount: number
  suiteNames: string[]
}

export const DEFAULT_TEST_CONFIG: TestConfig = {
  framework: 'vitest',
  style: 'describe-it',
  includeEdgeCases: true,
  includeErrorCases: true,
  includeBoundaryCases: true,
  maxTestsPerFunction: 20,
}
