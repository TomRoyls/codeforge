export interface TestCase {
  name: string
  fn: () => void
  skip: boolean
  timeout: number
}

export interface TestSuite {
  name: string
  tests: TestCase[]
  beforeEach: (() => void) | undefined
  afterEach: (() => void) | undefined
  beforeAll: (() => void) | undefined
  afterAll: (() => void) | undefined
}

export interface TestResult {
  name: string
  suite: string
  passed: boolean
  error: string
  duration: number
  skipped: boolean
}

export interface SuiteResult {
  suite: string
  results: TestResult[]
  passed: number
  failed: number
  skipped: number
  duration: number
}

export interface RunResult {
  suites: SuiteResult[]
  totalPassed: number
  totalFailed: number
  totalSkipped: number
  totalDuration: number
  startTime: number
}

export interface RunnerConfig {
  stopOnFailure: boolean
  verbose: boolean
}

export const DEFAULT_RUNNER_CONFIG: RunnerConfig = {
  stopOnFailure: false,
  verbose: false,
}
