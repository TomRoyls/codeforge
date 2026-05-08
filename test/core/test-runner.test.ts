import { describe, it, expect } from 'vitest'
import { TestRunner } from '../../src/core/test-runner/test-runner.js'
import type { TestSuite, TestCase } from '../../src/core/test-runner/types.js'

function makeTest(overrides: Partial<TestCase> = {}): TestCase {
  return {
    name: overrides.name ?? 'default test',
    fn: overrides.fn ?? (() => {}),
    skip: overrides.skip ?? false,
    timeout: overrides.timeout ?? 5000,
  }
}

function makeSuite(overrides: Partial<TestSuite> = {}): TestSuite {
  return {
    name: overrides.name ?? 'default suite',
    tests: overrides.tests ?? [makeTest()],
    beforeEach: overrides.beforeEach ?? undefined,
    afterEach: overrides.afterEach ?? undefined,
    beforeAll: overrides.beforeAll ?? undefined,
    afterAll: overrides.afterAll ?? undefined,
  }
}

describe('TestRunner - Suite Management', () => {
  it('should add a suite', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'suite1' }))
    expect(runner.getSuites()).toHaveLength(1)
  })

  it('should add multiple suites', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'suite1' }))
    runner.addSuite(makeSuite({ name: 'suite2' }))
    runner.addSuite(makeSuite({ name: 'suite3' }))
    expect(runner.getSuites()).toHaveLength(3)
  })

  it('should return suite names', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'alpha' }))
    runner.addSuite(makeSuite({ name: 'beta' }))
    const suites = runner.getSuites()
    expect(suites[0]!.name).toBe('alpha')
    expect(suites[1]!.name).toBe('beta')
  })

  it('should clear all suites and results', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite())
    runner.run()
    runner.clear()
    expect(runner.getSuites()).toHaveLength(0)
    expect(runner.getResults()).toBeNull()
  })

  it('should return a copy of suites', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'original' }))
    const suites = runner.getSuites()
    suites.push(makeSuite({ name: 'added' }))
    expect(runner.getSuites()).toHaveLength(1)
  })

  it('should handle empty suite with no tests', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'empty', tests: [] }))
    const result = runner.run()
    expect(result.suites).toHaveLength(1)
    expect(result.suites[0]!.results).toHaveLength(0)
    expect(result.suites[0]!.passed).toBe(0)
    expect(result.suites[0]!.failed).toBe(0)
    expect(result.suites[0]!.skipped).toBe(0)
  })
})

describe('TestRunner - Test Execution', () => {
  it('should run a passing test', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'pass suite',
      tests: [makeTest({ name: 'pass test', fn: () => {} })],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(1)
    expect(result.totalFailed).toBe(0)
  })

  it('should run a failing test that throws Error', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'fail suite',
      tests: [makeTest({ name: 'fail test', fn: () => { throw new Error('boom') } })],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(0)
    expect(result.totalFailed).toBe(1)
  })

  it('should skip a test marked as skip', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'skip suite',
      tests: [makeTest({ name: 'skipped', skip: true })],
    }))
    const result = runner.run()
    expect(result.totalSkipped).toBe(1)
    expect(result.totalPassed).toBe(0)
    expect(result.totalFailed).toBe(0)
  })

  it('should run multiple tests in a suite', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'multi suite',
      tests: [
        makeTest({ name: 'test1', fn: () => {} }),
        makeTest({ name: 'test2', fn: () => {} }),
        makeTest({ name: 'test3', fn: () => { throw new Error('fail') } }),
      ],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(2)
    expect(result.totalFailed).toBe(1)
  })

  it('should handle test that throws non-Error string', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'string throw suite',
      tests: [makeTest({ name: 'string throw', fn: () => { throw 'string error' } })],
    }))
    const result = runner.run()
    expect(result.totalFailed).toBe(1)
    const failed = runner.getFailed()
    expect(failed[0]!.error).toBe('string error')
  })

  it('should handle test that throws a number', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'num throw suite',
      tests: [makeTest({ name: 'num throw', fn: () => { throw 42 } })],
    }))
    const result = runner.run()
    expect(result.totalFailed).toBe(1)
    const failed = runner.getFailed()
    expect(failed[0]!.error).toBe('42')
  })
})

describe('TestRunner - Hooks', () => {
  it('should call beforeEach before each test', () => {
    const order: string[] = []
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'hook suite',
      tests: [
        makeTest({ name: 't1', fn: () => { order.push('test1') } }),
        makeTest({ name: 't2', fn: () => { order.push('test2') } }),
      ],
      beforeEach: () => { order.push('beforeEach') },
    }))
    runner.run()
    expect(order).toEqual(['beforeEach', 'test1', 'beforeEach', 'test2'])
  })

  it('should call afterEach after each test', () => {
    const order: string[] = []
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'hook suite',
      tests: [
        makeTest({ name: 't1', fn: () => { order.push('test1') } }),
        makeTest({ name: 't2', fn: () => { order.push('test2') } }),
      ],
      afterEach: () => { order.push('afterEach') },
    }))
    runner.run()
    expect(order).toEqual(['test1', 'afterEach', 'test2', 'afterEach'])
  })

  it('should call beforeAll once before all tests', () => {
    const order: string[] = []
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'hook suite',
      tests: [
        makeTest({ name: 't1', fn: () => { order.push('test1') } }),
        makeTest({ name: 't2', fn: () => { order.push('test2') } }),
      ],
      beforeAll: () => { order.push('beforeAll') },
    }))
    runner.run()
    expect(order[0]).toBe('beforeAll')
    expect(order.filter(x => x === 'beforeAll')).toHaveLength(1)
  })

  it('should call afterAll once after all tests', () => {
    const order: string[] = []
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'hook suite',
      tests: [
        makeTest({ name: 't1', fn: () => { order.push('test1') } }),
        makeTest({ name: 't2', fn: () => { order.push('test2') } }),
      ],
      afterAll: () => { order.push('afterAll') },
    }))
    runner.run()
    expect(order[order.length - 1]).toBe('afterAll')
    expect(order.filter(x => x === 'afterAll')).toHaveLength(1)
  })

  it('should call hooks in correct order for a single test', () => {
    const order: string[] = []
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'hook suite',
      tests: [makeTest({ name: 't1', fn: () => { order.push('test') } })],
      beforeAll: () => { order.push('beforeAll') },
      beforeEach: () => { order.push('beforeEach') },
      afterEach: () => { order.push('afterEach') },
      afterAll: () => { order.push('afterAll') },
    }))
    runner.run()
    expect(order).toEqual(['beforeAll', 'beforeEach', 'test', 'afterEach', 'afterAll'])
  })
})

describe('TestRunner - Hook Failures', () => {
  it('should mark test as failed when beforeEach throws', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'befoeach fail',
      tests: [makeTest({ name: 't1', fn: () => {} })],
      beforeEach: () => { throw new Error('beforeEach boom') },
    }))
    const result = runner.run()
    expect(result.totalFailed).toBe(1)
    expect(result.totalPassed).toBe(0)
    expect(runner.getFailed()[0]!.error).toBe('beforeEach boom')
  })

  it('should not affect test result when afterEach throws', () => {
    let testRan = false
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'aftereach fail',
      tests: [makeTest({ name: 't1', fn: () => { testRan = true } })],
      afterEach: () => { throw new Error('afterEach boom') },
    }))
    const result = runner.run()
    expect(testRan).toBe(true)
    expect(result.totalPassed).toBe(1)
    expect(result.totalFailed).toBe(0)
  })

  it('should mark all tests as failed when beforeAll throws', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'beforeall fail',
      tests: [
        makeTest({ name: 't1', fn: () => {} }),
        makeTest({ name: 't2', fn: () => {} }),
        makeTest({ name: 't3', fn: () => {} }),
      ],
      beforeAll: () => { throw new Error('beforeAll boom') },
    }))
    const result = runner.run()
    expect(result.totalFailed).toBe(3)
    expect(result.totalPassed).toBe(0)
    const failed = runner.getFailed()
    expect(failed[0]!.error).toBe('beforeAll hook failed')
  })

  it('should continue running after afterEach throws for subsequent tests', () => {
    let count = 0
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'aftereach continue',
      tests: [
        makeTest({ name: 't1', fn: () => { count++ } }),
        makeTest({ name: 't2', fn: () => { count++ } }),
      ],
      afterEach: () => { throw new Error('afterEach') },
    }))
    runner.run()
    expect(count).toBe(2)
  })
})

describe('TestRunner - Results', () => {
  it('should produce correct TestResult structure', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'struct suite',
      tests: [makeTest({ name: 'struct test', fn: () => {} })],
    }))
    runner.run()
    const passed = runner.getPassed()
    expect(passed).toHaveLength(1)
    const result = passed[0]!
    expect(result.name).toBe('struct test')
    expect(result.suite).toBe('struct suite')
    expect(result.passed).toBe(true)
    expect(result.error).toBe('')
    expect(result.duration).toBeGreaterThanOrEqual(0)
    expect(result.skipped).toBe(false)
  })

  it('should produce correct SuiteResult counts', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'count suite',
      tests: [
        makeTest({ name: 'pass', fn: () => {} }),
        makeTest({ name: 'fail', fn: () => { throw new Error('x') } }),
        makeTest({ name: 'skip', skip: true }),
      ],
    }))
    const result = runner.run()
    const suiteResult = result.suites[0]!
    expect(suiteResult.suite).toBe('count suite')
    expect(suiteResult.passed).toBe(1)
    expect(suiteResult.failed).toBe(1)
    expect(suiteResult.skipped).toBe(1)
    expect(suiteResult.results).toHaveLength(3)
    expect(suiteResult.duration).toBeGreaterThanOrEqual(0)
  })

  it('should produce correct RunResult totals', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'suite1',
      tests: [
        makeTest({ name: 'p1', fn: () => {} }),
        makeTest({ name: 'f1', fn: () => { throw new Error('x') } }),
      ],
    }))
    runner.addSuite(makeSuite({
      name: 'suite2',
      tests: [
        makeTest({ name: 'p2', fn: () => {} }),
        makeTest({ name: 's1', skip: true }),
      ],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(2)
    expect(result.totalFailed).toBe(1)
    expect(result.totalSkipped).toBe(1)
    expect(result.suites).toHaveLength(2)
    expect(result.totalDuration).toBeGreaterThanOrEqual(0)
    expect(result.startTime).toBeGreaterThan(0)
  })

  it('should record error message for failed test', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'err suite',
      tests: [makeTest({ name: 'err test', fn: () => { throw new Error('custom error msg') } })],
    }))
    runner.run()
    const failed = runner.getFailed()
    expect(failed[0]!.error).toBe('custom error msg')
  })

  it('should record empty string error for passing test', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'no err suite',
      tests: [makeTest({ name: 'no err test', fn: () => {} })],
    }))
    runner.run()
    const passed = runner.getPassed()
    expect(passed[0]!.error).toBe('')
  })
})

describe('TestRunner - Filtering', () => {
  it('getFailed should return only failed results', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'filter suite',
      tests: [
        makeTest({ name: 'pass', fn: () => {} }),
        makeTest({ name: 'fail1', fn: () => { throw new Error('a') } }),
        makeTest({ name: 'fail2', fn: () => { throw new Error('b') } }),
        makeTest({ name: 'skip', skip: true }),
      ],
    }))
    runner.run()
    const failed = runner.getFailed()
    expect(failed).toHaveLength(2)
    expect(failed.every(r => !r.passed && !r.skipped)).toBe(true)
  })

  it('getPassed should return only passed results', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'filter suite',
      tests: [
        makeTest({ name: 'pass1', fn: () => {} }),
        makeTest({ name: 'pass2', fn: () => {} }),
        makeTest({ name: 'fail', fn: () => { throw new Error('x') } }),
      ],
    }))
    runner.run()
    const passed = runner.getPassed()
    expect(passed).toHaveLength(2)
    expect(passed.every(r => r.passed)).toBe(true)
  })

  it('getSkipped should return only skipped results', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'filter suite',
      tests: [
        makeTest({ name: 'skip1', skip: true }),
        makeTest({ name: 'skip2', skip: true }),
        makeTest({ name: 'pass', fn: () => {} }),
      ],
    }))
    runner.run()
    const skipped = runner.getSkipped()
    expect(skipped).toHaveLength(2)
    expect(skipped.every(r => r.skipped)).toBe(true)
  })

  it('should filter across multiple suites', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 's1',
      tests: [
        makeTest({ name: 'p1', fn: () => {} }),
        makeTest({ name: 'f1', fn: () => { throw new Error('x') } }),
      ],
    }))
    runner.addSuite(makeSuite({
      name: 's2',
      tests: [
        makeTest({ name: 'f2', fn: () => { throw new Error('x') } }),
        makeTest({ name: 'sk1', skip: true }),
      ],
    }))
    runner.run()
    expect(runner.getPassed()).toHaveLength(1)
    expect(runner.getFailed()).toHaveLength(2)
    expect(runner.getSkipped()).toHaveLength(1)
  })

  it('should return empty arrays before run', () => {
    const runner = new TestRunner()
    expect(runner.getPassed()).toHaveLength(0)
    expect(runner.getFailed()).toHaveLength(0)
    expect(runner.getSkipped()).toHaveLength(0)
  })
})

describe('TestRunner - Config', () => {
  it('should stop on first failure with stopOnFailure true', () => {
    let thirdRan = false
    const runner = new TestRunner({ stopOnFailure: true })
    runner.addSuite(makeSuite({
      name: 'stop suite',
      tests: [
        makeTest({ name: 't1', fn: () => {} }),
        makeTest({ name: 't2', fn: () => { throw new Error('stop') } }),
        makeTest({ name: 't3', fn: () => { thirdRan = true } }),
      ],
    }))
    const result = runner.run()
    expect(thirdRan).toBe(false)
    expect(result.totalPassed).toBe(1)
    expect(result.totalFailed).toBe(1)
  })

  it('should continue after failure with stopOnFailure false', () => {
    const runner = new TestRunner({ stopOnFailure: false })
    runner.addSuite(makeSuite({
      name: 'continue suite',
      tests: [
        makeTest({ name: 't1', fn: () => { throw new Error('x') } }),
        makeTest({ name: 't2', fn: () => {} }),
        makeTest({ name: 't3', fn: () => {} }),
      ],
    }))
    const result = runner.run()
    expect(result.totalFailed).toBe(1)
    expect(result.totalPassed).toBe(2)
  })

  it('should stop on first suite failure with stopOnFailure', () => {
    const runner = new TestRunner({ stopOnFailure: true })
    runner.addSuite(makeSuite({
      name: 'suite1',
      tests: [makeTest({ name: 'f1', fn: () => { throw new Error('x') } })],
    }))
    runner.addSuite(makeSuite({
      name: 'suite2',
      tests: [makeTest({ name: 'p1', fn: () => {} })],
    }))
    const result = runner.run()
    expect(result.suites).toHaveLength(1)
    expect(result.totalFailed).toBe(1)
  })

  it('should use default config when no config provided', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'default config',
      tests: [
        makeTest({ name: 't1', fn: () => { throw new Error('x') } }),
        makeTest({ name: 't2', fn: () => {} }),
      ],
    }))
    const result = runner.run()
    expect(result.totalFailed).toBe(1)
    expect(result.totalPassed).toBe(1)
  })
})

describe('TestRunner - Statistics', () => {
  it('should return correct statistics after run', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'stats suite',
      tests: [
        makeTest({ name: 'p1', fn: () => {} }),
        makeTest({ name: 'p2', fn: () => {} }),
        makeTest({ name: 'f1', fn: () => { throw new Error('x') } }),
        makeTest({ name: 's1', skip: true }),
      ],
    }))
    runner.run()
    const stats = runner.getStatistics()
    expect(stats.suites).toBe(1)
    expect(stats.tests).toBe(4)
    expect(stats.passed).toBe(2)
    expect(stats.failed).toBe(1)
    expect(stats.skipped).toBe(1)
    expect(stats.duration).toBeGreaterThanOrEqual(0)
  })

  it('should return zero statistics before run', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ tests: [makeTest()] }))
    const stats = runner.getStatistics()
    expect(stats.suites).toBe(1)
    expect(stats.tests).toBe(1)
    expect(stats.passed).toBe(0)
    expect(stats.failed).toBe(0)
    expect(stats.skipped).toBe(0)
    expect(stats.duration).toBe(0)
  })

  it('should count multiple suites in statistics', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 's1',
      tests: [makeTest({ name: 't1', fn: () => {} })],
    }))
    runner.addSuite(makeSuite({
      name: 's2',
      tests: [
        makeTest({ name: 't2', fn: () => {} }),
        makeTest({ name: 't3', fn: () => { throw new Error('x') } }),
      ],
    }))
    runner.run()
    const stats = runner.getStatistics()
    expect(stats.suites).toBe(2)
    expect(stats.tests).toBe(3)
    expect(stats.passed).toBe(2)
    expect(stats.failed).toBe(1)
  })

  it('should track duration in results', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'duration suite',
      tests: [makeTest({ name: 'dur test', fn: () => {} })],
    }))
    const result = runner.run()
    expect(result.totalDuration).toBeGreaterThanOrEqual(0)
    expect(result.suites[0]!.duration).toBeGreaterThanOrEqual(0)
    expect(result.suites[0]!.results[0]!.duration).toBeGreaterThanOrEqual(0)
  })
})

describe('TestRunner - State', () => {
  it('should return null before run', () => {
    const runner = new TestRunner()
    expect(runner.getResults()).toBeNull()
  })

  it('hasFailures should return false before run', () => {
    const runner = new TestRunner()
    expect(runner.hasFailures()).toBe(false)
  })

  it('hasFailures should return true after failures', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ fn: () => { throw new Error('x') } })],
    }))
    runner.run()
    expect(runner.hasFailures()).toBe(true)
  })

  it('hasFailures should return false after all pass', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ fn: () => {} })],
    }))
    runner.run()
    expect(runner.hasFailures()).toBe(false)
  })

  it('reset should clear suites and results', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite())
    runner.run()
    runner.reset()
    expect(runner.getSuites()).toHaveLength(0)
    expect(runner.getResults()).toBeNull()
    expect(runner.hasFailures()).toBe(false)
  })

  it('should allow run after reset', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'first', tests: [makeTest({ fn: () => {} })] }))
    runner.run()
    runner.reset()
    runner.addSuite(makeSuite({ name: 'second', tests: [makeTest({ fn: () => {} })] }))
    const result = runner.run()
    expect(result.totalPassed).toBe(1)
    expect(result.suites[0]!.suite).toBe('second')
  })

  it('getResults should return last run result', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'first', tests: [makeTest({ fn: () => {} })] }))
    const first = runner.run()
    const stored = runner.getResults()
    expect(stored).not.toBeNull()
    expect(stored!.totalPassed).toBe(first.totalPassed)
  })
})

describe('TestRunner - Edge Cases', () => {
  it('should handle all passing tests', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [
        makeTest({ name: 't1', fn: () => {} }),
        makeTest({ name: 't2', fn: () => {} }),
        makeTest({ name: 't3', fn: () => {} }),
      ],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(3)
    expect(result.totalFailed).toBe(0)
    expect(result.totalSkipped).toBe(0)
  })

  it('should handle all failing tests', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [
        makeTest({ name: 't1', fn: () => { throw new Error('a') } }),
        makeTest({ name: 't2', fn: () => { throw new Error('b') } }),
        makeTest({ name: 't3', fn: () => { throw new Error('c') } }),
      ],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(0)
    expect(result.totalFailed).toBe(3)
    expect(result.totalSkipped).toBe(0)
  })

  it('should handle all skipped tests', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [
        makeTest({ name: 't1', skip: true }),
        makeTest({ name: 't2', skip: true }),
        makeTest({ name: 't3', skip: true }),
      ],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(0)
    expect(result.totalFailed).toBe(0)
    expect(result.totalSkipped).toBe(3)
  })

  it('should handle test throwing non-Error string', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'str throw', fn: () => { throw 'plain string' } })],
    }))
    runner.run()
    const failed = runner.getFailed()
    expect(failed).toHaveLength(1)
    expect(failed[0]!.error).toBe('plain string')
  })

  it('should handle suite with no tests producing valid SuiteResult', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'empty', tests: [] }))
    const result = runner.run()
    const sr = result.suites[0]!
    expect(sr.suite).toBe('empty')
    expect(sr.results).toHaveLength(0)
    expect(sr.passed).toBe(0)
    expect(sr.failed).toBe(0)
    expect(sr.skipped).toBe(0)
  })

  it('should run with no suites', () => {
    const runner = new TestRunner()
    const result = runner.run()
    expect(result.suites).toHaveLength(0)
    expect(result.totalPassed).toBe(0)
    expect(result.totalFailed).toBe(0)
    expect(result.totalSkipped).toBe(0)
  })

  it('should handle skipped test with beforeEach still not running fn', () => {
    let fnRan = false
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'skipped', skip: true, fn: () => { fnRan = true } })],
    }))
    runner.run()
    expect(fnRan).toBe(false)
  })

  it('should set startTime in RunResult', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ tests: [makeTest()] }))
    const result = runner.run()
    expect(result.startTime).toBeGreaterThan(0)
    expect(typeof result.startTime).toBe('number')
  })

  it('should handle beforeEach throwing non-Error', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 't1', fn: () => {} })],
      beforeEach: () => { throw 'hook string' },
    }))
    runner.run()
    const failed = runner.getFailed()
    expect(failed).toHaveLength(1)
    expect(failed[0]!.error).toBe('hook string')
  })

  it('should measure duration per test', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'timed', fn: () => {} })],
    }))
    runner.run()
    const passed = runner.getPassed()
    expect(passed[0]!.duration).toBeGreaterThanOrEqual(0)
  })

  it('should handle stopOnFailure with beforeEach failure', () => {
    let secondRan = false
    const runner = new TestRunner({ stopOnFailure: true })
    let callCount = 0
    runner.addSuite(makeSuite({
      tests: [
        makeTest({ name: 't1', fn: () => {} }),
        makeTest({ name: 't2', fn: () => { secondRan = true } }),
      ],
      beforeEach: () => {
        callCount++
        if (callCount === 1) throw new Error('hook fail')
      },
    }))
    runner.run()
    expect(secondRan).toBe(false)
  })
})

describe('TestRunner - Multiple Suites', () => {
  it('should run suites in order', () => {
    const order: string[] = []
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'first',
      tests: [makeTest({ name: 'a', fn: () => { order.push('first') } })],
    }))
    runner.addSuite(makeSuite({
      name: 'second',
      tests: [makeTest({ name: 'b', fn: () => { order.push('second') } })],
    }))
    runner.run()
    expect(order).toEqual(['first', 'second'])
  })

  it('should aggregate results across suites', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 's1',
      tests: [makeTest({ name: 'p1', fn: () => {} }), makeTest({ name: 'f1', fn: () => { throw new Error('x') } })],
    }))
    runner.addSuite(makeSuite({
      name: 's2',
      tests: [makeTest({ name: 'p2', fn: () => {} }), makeTest({ name: 'sk1', skip: true })],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(2)
    expect(result.totalFailed).toBe(1)
    expect(result.totalSkipped).toBe(1)
  })

  it('should keep suite results separate', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({ name: 'a', tests: [makeTest({ name: 'ta', fn: () => {} })] }))
    runner.addSuite(makeSuite({ name: 'b', tests: [makeTest({ name: 'tb', fn: () => { throw new Error('x') } })] }))
    const result = runner.run()
    expect(result.suites[0]!.suite).toBe('a')
    expect(result.suites[0]!.passed).toBe(1)
    expect(result.suites[1]!.suite).toBe('b')
    expect(result.suites[1]!.failed).toBe(1)
  })
})

describe('TestRunner - Skipped Test Details', () => {
  it('should preserve test name in skipped result', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'skip-detail',
      tests: [makeTest({ name: 'my-skipped-test', skip: true })],
    }))
    runner.run()
    const skipped = runner.getSkipped()
    expect(skipped[0]!.name).toBe('my-skipped-test')
  })

  it('should preserve suite name in skipped result', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'my-suite',
      tests: [makeTest({ name: 'sk', skip: true })],
    }))
    runner.run()
    const skipped = runner.getSkipped()
    expect(skipped[0]!.suite).toBe('my-suite')
  })

  it('should have zero duration for skipped test', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'sk', skip: true })],
    }))
    runner.run()
    const skipped = runner.getSkipped()
    expect(skipped[0]!.duration).toBe(0)
  })

  it('should have empty error for skipped test', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'sk', skip: true })],
    }))
    runner.run()
    const skipped = runner.getSkipped()
    expect(skipped[0]!.error).toBe('')
  })

  it('should have passed false for skipped test', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'sk', skip: true })],
    }))
    runner.run()
    const skipped = runner.getSkipped()
    expect(skipped[0]!.passed).toBe(false)
  })
})

describe('TestRunner - Hook Edge Cases', () => {
  it('should not call beforeEach for skipped tests', () => {
    let beforeCount = 0
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [
        makeTest({ name: 'normal', fn: () => {} }),
        makeTest({ name: 'skipped', skip: true }),
        makeTest({ name: 'normal2', fn: () => {} }),
      ],
      beforeEach: () => { beforeCount++ },
    }))
    runner.run()
    expect(beforeCount).toBe(2)
  })

  it('should not call afterEach for skipped tests', () => {
    let afterCount = 0
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [
        makeTest({ name: 'normal', fn: () => {} }),
        makeTest({ name: 'skipped', skip: true }),
        makeTest({ name: 'normal2', fn: () => {} }),
      ],
      afterEach: () => { afterCount++ },
    }))
    runner.run()
    expect(afterCount).toBe(2)
  })

  it('should run afterAll even when tests fail', () => {
    let afterAllRan = false
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'fail', fn: () => { throw new Error('x') } })],
      afterAll: () => { afterAllRan = true },
    }))
    runner.run()
    expect(afterAllRan).toBe(true)
  })

  it('should run afterAll even when beforeAll fails', () => {
    let afterAllRan = false
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 't1' })],
      beforeAll: () => { throw new Error('beforeAll fail') },
      afterAll: () => { afterAllRan = true },
    }))
    runner.run()
    expect(afterAllRan).toBe(true)
  })

  it('should not affect test pass when afterAll throws', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 't1', fn: () => {} })],
      afterAll: () => { throw new Error('afterAll error') },
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(1)
    expect(result.totalFailed).toBe(0)
  })
})

describe('TestRunner - Reusability', () => {
  it('should overwrite lastResult on second run', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'first',
      tests: [makeTest({ name: 't1', fn: () => {} })],
    }))
    runner.run()
    runner.clear()
    runner.addSuite(makeSuite({
      name: 'second',
      tests: [
        makeTest({ name: 't1', fn: () => {} }),
        makeTest({ name: 't2', fn: () => { throw new Error('x') } }),
      ],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(1)
    expect(result.totalFailed).toBe(1)
    expect(result.suites).toHaveLength(1)
    expect(result.suites[0]!.suite).toBe('second')
  })

  it('should run multiple times on same runner', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'rerun',
      tests: [makeTest({ name: 't1', fn: () => {} })],
    }))
    const r1 = runner.run()
    const r2 = runner.run()
    expect(r1.totalPassed).toBe(1)
    expect(r2.totalPassed).toBe(1)
    expect(runner.getResults()).toBe(r2)
  })
})

describe('TestRunner - Test Properties', () => {
  it('should preserve test timeout property', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      tests: [makeTest({ name: 'timeout test', timeout: 10000 })],
    }))
    const suites = runner.getSuites()
    expect(suites[0]!.tests[0]!.timeout).toBe(10000)
  })

  it('should preserve test name in result', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'name-suite',
      tests: [makeTest({ name: 'specific-test-name', fn: () => {} })],
    }))
    runner.run()
    const passed = runner.getPassed()
    expect(passed[0]!.name).toBe('specific-test-name')
    expect(passed[0]!.suite).toBe('name-suite')
  })

  it('should preserve suite name in failed result', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'fail-suite',
      tests: [makeTest({ name: 'fail-test', fn: () => { throw new Error('x') } })],
    }))
    runner.run()
    const failed = runner.getFailed()
    expect(failed[0]!.suite).toBe('fail-suite')
    expect(failed[0]!.name).toBe('fail-test')
  })
})

describe('TestRunner - Constructor Defaults', () => {
  it('should accept empty config object', () => {
    const runner = new TestRunner({})
    runner.addSuite(makeSuite({ tests: [makeTest({ fn: () => {} })] }))
    const result = runner.run()
    expect(result.totalPassed).toBe(1)
  })

  it('should accept partial config', () => {
    const runner = new TestRunner({ verbose: true })
    runner.addSuite(makeSuite({ tests: [makeTest({ fn: () => {} })] }))
    const result = runner.run()
    expect(result.totalPassed).toBe(1)
  })

  it('should accept stopOnFailure true', () => {
    const runner = new TestRunner({ stopOnFailure: true })
    runner.addSuite(makeSuite({ tests: [makeTest({ fn: () => {} })] }))
    const result = runner.run()
    expect(result.totalPassed).toBe(1)
  })
})

describe('TestRunner - Mixed Scenarios', () => {
  it('should handle mixed pass/fail/skip across 3 suites', () => {
    const runner = new TestRunner()
    runner.addSuite(makeSuite({
      name: 'all-pass',
      tests: [makeTest({ name: 'p1', fn: () => {} }), makeTest({ name: 'p2', fn: () => {} })],
    }))
    runner.addSuite(makeSuite({
      name: 'mixed',
      tests: [
        makeTest({ name: 'p3', fn: () => {} }),
        makeTest({ name: 'f1', fn: () => { throw new Error('x') } }),
        makeTest({ name: 'sk1', skip: true }),
      ],
    }))
    runner.addSuite(makeSuite({
      name: 'all-skip',
      tests: [makeTest({ name: 'sk2', skip: true }), makeTest({ name: 'sk3', skip: true })],
    }))
    const result = runner.run()
    expect(result.totalPassed).toBe(3)
    expect(result.totalFailed).toBe(1)
    expect(result.totalSkipped).toBe(3)
    expect(result.suites).toHaveLength(3)
  })

  it('should handle large number of tests', () => {
    const runner = new TestRunner()
    const tests: TestCase[] = []
    for (let i = 0; i < 50; i++) {
      tests.push(makeTest({ name: `t${i}`, fn: () => {} }))
    }
    runner.addSuite(makeSuite({ name: 'large', tests }))
    const result = runner.run()
    expect(result.totalPassed).toBe(50)
    expect(result.totalFailed).toBe(0)
  })
})
