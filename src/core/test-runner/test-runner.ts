import type { RunnerConfig, RunResult, SuiteResult, TestResult, TestSuite } from './types.js'
import { DEFAULT_RUNNER_CONFIG } from './types.js'

export type { TestCase, TestSuite, TestResult, SuiteResult, RunResult, RunnerConfig } from './types.js'
export { DEFAULT_RUNNER_CONFIG } from './types.js'

export class TestRunner {
  private suites: TestSuite[] = []
  private config: RunnerConfig
  private lastResult: RunResult | null = null

  constructor(config?: Partial<RunnerConfig>) {
    this.config = { ...DEFAULT_RUNNER_CONFIG, ...config }
  }

  addSuite(suite: TestSuite): void {
    this.suites.push(suite)
  }

  run(): RunResult {
    const startTime = Date.now()
    const suiteResults: SuiteResult[] = []
    let totalPassed = 0
    let totalFailed = 0
    let totalSkipped = 0

    for (const suite of this.suites) {
      const result = this.runSuite(suite)
      suiteResults.push(result)
      totalPassed += result.passed
      totalFailed += result.failed
      totalSkipped += result.skipped

      if (this.config.stopOnFailure && result.failed > 0) {
        break
      }
    }

    const totalDuration = Date.now() - startTime
    this.lastResult = {
      suites: suiteResults,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      startTime,
    }
    return this.lastResult
  }

  runSuite(suite: TestSuite): SuiteResult {
    const suiteStart = Date.now()
    const results: TestResult[] = []
    let passed = 0
    let failed = 0
    let skipped = 0

    let beforeAllFailed = false
    if (suite.beforeAll) {
      try {
        suite.beforeAll()
      } catch {
        beforeAllFailed = true
        for (const test of suite.tests) {
          results.push({
            name: test.name,
            suite: suite.name,
            passed: false,
            error: 'beforeAll hook failed',
            duration: 0,
            skipped: false,
          })
          failed++
        }
      }
    }

    if (!beforeAllFailed) {
      for (const test of suite.tests) {
        if (test.skip) {
          results.push({
            name: test.name,
            suite: suite.name,
            passed: false,
            error: '',
            duration: 0,
            skipped: true,
          })
          skipped++
          continue
        }

        if (suite.beforeEach) {
          try {
            suite.beforeEach()
          } catch (err) {
            results.push({
              name: test.name,
              suite: suite.name,
              passed: false,
              error: err instanceof Error ? err.message : String(err),
              duration: 0,
              skipped: false,
            })
            failed++
            if (this.config.stopOnFailure) break
            continue
          }
        }

        const testStart = Date.now()
        let testError = ''
        let testPassed = true
        try {
          test.fn()
        } catch (err) {
          testPassed = false
          testError = err instanceof Error ? err.message : String(err)
        }
        const testDuration = Date.now() - testStart

        if (suite.afterEach) {
          try {
            suite.afterEach()
          } catch {
          }
        }

        results.push({
          name: test.name,
          suite: suite.name,
          passed: testPassed,
          error: testError,
          duration: testDuration,
          skipped: false,
        })

        if (testPassed) {
          passed++
        } else {
          failed++
          if (this.config.stopOnFailure) break
        }
      }
    }

    if (suite.afterAll) {
      try {
        suite.afterAll()
      } catch {
      }
    }

    return {
      suite: suite.name,
      results,
      passed,
      failed,
      skipped,
      duration: Date.now() - suiteStart,
    }
  }

  getResults(): RunResult | null {
    return this.lastResult
  }

  getFailed(): TestResult[] {
    if (!this.lastResult) return []
    const failed: TestResult[] = []
    for (const suite of this.lastResult.suites) {
      for (const result of suite.results) {
        if (!result.passed && !result.skipped) {
          failed.push(result)
        }
      }
    }
    return failed
  }

  getPassed(): TestResult[] {
    if (!this.lastResult) return []
    const passed: TestResult[] = []
    for (const suite of this.lastResult.suites) {
      for (const result of suite.results) {
        if (result.passed) {
          passed.push(result)
        }
      }
    }
    return passed
  }

  getSkipped(): TestResult[] {
    if (!this.lastResult) return []
    const skipped: TestResult[] = []
    for (const suite of this.lastResult.suites) {
      for (const result of suite.results) {
        if (result.skipped) {
          skipped.push(result)
        }
      }
    }
    return skipped
  }

  getSuites(): TestSuite[] {
    return [...this.suites]
  }

  clear(): void {
    this.suites = []
    this.lastResult = null
  }

  hasFailures(): boolean {
    if (!this.lastResult) return false
    return this.lastResult.totalFailed > 0
  }

  getStatistics(): { suites: number; tests: number; passed: number; failed: number; skipped: number; duration: number } {
    const suites = this.suites.length
    const tests = this.suites.reduce((sum, s) => sum + s.tests.length, 0)
    const passed = this.lastResult?.totalPassed ?? 0
    const failed = this.lastResult?.totalFailed ?? 0
    const skipped = this.lastResult?.totalSkipped ?? 0
    const duration = this.lastResult?.totalDuration ?? 0
    return { suites, tests, passed, failed, skipped, duration }
  }

  reset(): void {
    this.suites = []
    this.lastResult = null
  }
}
