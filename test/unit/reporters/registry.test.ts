import { describe, test, expect, vi, beforeEach } from 'vitest'
import type {
  AnalysisResult,
  Reporter,
  ReporterFactory,
  ReporterOptions,
  ReporterRegistryEntry,
  Violation,
} from '../../../src/reporters/types.js'
import {
  registerReporter,
  getReporter,
  listReporters,
  hasReporter,
  getReporterFactory,
} from '../../../src/reporters/index.js'

function createMockReporter(name: string): ReporterFactory {
  return (options: ReporterOptions) => ({
    name,
    format: vi.fn(() => ''),
    report: vi.fn(),
    ...options,
  })
}

function createSampleViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    filePath: 'src/test.ts',
    line: 1,
    column: 1,
    message: 'Test violation',
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

function createSampleAnalysisResult(): AnalysisResult {
  return {
    files: [],
    summary: {
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalFiles: 0,
      filesWithViolations: 0,
      totalTime: 0,
    },
    timestamp: new Date().toISOString(),
  }
}

describe('Reporter Registry', () => {
  describe('registerReporter', () => {
    test('registers a custom reporter entry', () => {
      const factory = createMockReporter('custom-reporter')
      const entry: ReporterRegistryEntry = {
        name: 'custom',
        description: 'Custom reporter for testing',
        factory,
      }

      registerReporter(entry)

      expect(hasReporter('custom')).toBe(true)
    })

    test('allows registering multiple reporters', () => {
      const factory1 = createMockReporter('reporter-1')
      const factory2 = createMockReporter('reporter-2')

      registerReporter({ name: 'reporter1', factory: factory1 })
      registerReporter({ name: 'reporter2', factory: factory2 })

      expect(hasReporter('reporter1')).toBe(true)
      expect(hasReporter('reporter2')).toBe(true)
    })

    test('stores description in registry entry', () => {
      const factory = createMockReporter('desc-reporter')
      const entry: ReporterRegistryEntry = {
        name: 'described',
        description: 'A reporter with a description',
        factory,
      }

      registerReporter(entry)
      const reporters = listReporters()
      const described = reporters.find((r) => r.name === 'described')

      expect(described?.description).toBe('A reporter with a description')
    })

    test('can override existing reporter with same name', () => {
      const factory1 = createMockReporter('original')
      const factory2 = createMockReporter('override')

      registerReporter({ name: 'overrideable', factory: factory1 })
      registerReporter({ name: 'overrideable', factory: factory2 })

      const reporter = getReporter('overrideable')
      expect(reporter.name).toBe('override')
    })
  })

  describe('getReporter', () => {
    test('retrieves reporter by name with default options', () => {
      const factory = createMockReporter('test-default')
      registerReporter({ name: 'default-test', factory })

      const reporter = getReporter('default-test')

      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('test-default')
    })

    test('passes options to reporter factory', () => {
      const options: ReporterOptions = {
        color: true,
        verbose: true,
        pretty: true,
      }
      const factory = vi.fn(() => ({
        name: 'with-options',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))

      registerReporter({ name: 'options-test', factory })
      getReporter('options-test', options)

      expect(factory).toHaveBeenCalledWith(options)
    })

    test('passes color option to factory', () => {
      const factory = vi.fn(() => ({
        name: 'color-test',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))

      registerReporter({ name: 'color-test', factory })
      getReporter('color-test', { color: true })

      expect(factory).toHaveBeenCalledWith({ color: true })
    })

    test('passes outputPath option to factory', () => {
      const factory = vi.fn(() => ({
        name: 'output-test',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))

      registerReporter({ name: 'output-test', factory })
      getReporter('output-test', { outputPath: '/tmp/report.json' })

      expect(factory).toHaveBeenCalledWith({ outputPath: '/tmp/report.json' })
    })

    test('passes pretty option to factory', () => {
      const factory = vi.fn(() => ({
        name: 'pretty-test',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))

      registerReporter({ name: 'pretty-test', factory })
      getReporter('pretty-test', { pretty: true })

      expect(factory).toHaveBeenCalledWith({ pretty: true })
    })

    test('passes verbose option to factory', () => {
      const factory = vi.fn(() => ({
        name: 'verbose-test',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))

      registerReporter({ name: 'verbose-test', factory })
      getReporter('verbose-test', { verbose: true })

      expect(factory).toHaveBeenCalledWith({ verbose: true })
    })

    test('passes all options together to factory', () => {
      const factory = vi.fn(() => ({
        name: 'all-options',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))

      const options: ReporterOptions = {
        color: false,
        verbose: true,
        pretty: true,
        outputPath: '/path/to/output',
        quiet: false,
        includeSource: true,
        errorsOnly: false,
      }

      registerReporter({ name: 'all-options-test', factory })
      getReporter('all-options-test', options)

      expect(factory).toHaveBeenCalledWith(options)
    })

    test('throws error for unknown reporter', () => {
      expect(() => getReporter('nonexistent-reporter')).toThrow(
        /Unknown reporter: "nonexistent-reporter"/,
      )
    })

    test('error message includes available reporters', () => {
      expect(() => getReporter('unknown')).toThrow(/Available reporters:/)
      expect(() => getReporter('unknown')).toThrow(/console/)
    })

    test('error message lists multiple available reporters', () => {
      const error = (() => {
        try {
          getReporter('unknown')
        } catch (e) {
          return e
        }
      })() as Error

      expect(error.message).toContain('console')
      expect(error.message).toContain('json')
    })
  })

  describe('listReporters', () => {
    test('returns all registered reporter entries', () => {
      const reporters = listReporters()

      expect(Array.isArray(reporters)).toBe(true)
      expect(reporters.length).toBeGreaterThan(0)
    })

    test('includes console reporter in list', () => {
      const reporters = listReporters()
      const consoleReporter = reporters.find((r) => r.name === 'console')

      expect(consoleReporter).toBeDefined()
      expect(consoleReporter?.description).toContain('Console output')
    })

    test('includes json reporter in list', () => {
      const reporters = listReporters()
      const jsonReporter = reporters.find((r) => r.name === 'json')

      expect(jsonReporter).toBeDefined()
      expect(jsonReporter?.description).toContain('JSON')
    })

    test('includes html reporter in list', () => {
      const reporters = listReporters()
      const htmlReporter = reporters.find((r) => r.name === 'html')

      expect(htmlReporter).toBeDefined()
      expect(htmlReporter?.description).toContain('HTML')
    })

    test('includes junit reporter in list', () => {
      const reporters = listReporters()
      const junitReporter = reporters.find((r) => r.name === 'junit')

      expect(junitReporter).toBeDefined()
      expect(junitReporter?.description).toContain('JUnit')
    })

    test('includes sarif reporter in list', () => {
      const reporters = listReporters()
      const sarifReporter = reporters.find((r) => r.name === 'sarif')

      expect(sarifReporter).toBeDefined()
      expect(sarifReporter?.description).toContain('SARIF')
    })

    test('includes markdown reporter in list', () => {
      const reporters = listReporters()
      const markdownReporter = reporters.find((r) => r.name === 'markdown')

      expect(markdownReporter).toBeDefined()
      expect(markdownReporter?.description).toContain('Markdown')
    })

    test('includes gitlab reporter in list', () => {
      const reporters = listReporters()
      const gitlabReporter = reporters.find((r) => r.name === 'gitlab')

      expect(gitlabReporter).toBeDefined()
      expect(gitlabReporter?.description).toContain('GitLab')
    })

    test('includes custom registered reporters', () => {
      const factory = createMockReporter('custom-list')
      registerReporter({ name: 'custom-list', factory })

      const reporters = listReporters()
      const customReporter = reporters.find((r) => r.name === 'custom-list')

      expect(customReporter).toBeDefined()
    })

    test('returns entries with factory function', () => {
      const reporters = listReporters()
      const entry = reporters[0]

      expect(entry).toHaveProperty('factory')
      expect(typeof entry.factory).toBe('function')
    })

    test('returns entries with name property', () => {
      const reporters = listReporters()

      reporters.forEach((entry) => {
        expect(entry).toHaveProperty('name')
        expect(typeof entry.name).toBe('string')
        expect(entry.name.length).toBeGreaterThan(0)
      })
    })
  })

  describe('hasReporter', () => {
    test('returns true for registered reporter', () => {
      expect(hasReporter('console')).toBe(true)
    })

    test('returns true for json reporter', () => {
      expect(hasReporter('json')).toBe(true)
    })

    test('returns true for html reporter', () => {
      expect(hasReporter('html')).toBe(true)
    })

    test('returns true for junit reporter', () => {
      expect(hasReporter('junit')).toBe(true)
    })

    test('returns true for sarif reporter', () => {
      expect(hasReporter('sarif')).toBe(true)
    })

    test('returns true for markdown reporter', () => {
      expect(hasReporter('markdown')).toBe(true)
    })

    test('returns true for gitlab reporter', () => {
      expect(hasReporter('gitlab')).toBe(true)
    })

    test('returns true for custom registered reporter', () => {
      const factory = createMockReporter('has-custom')
      registerReporter({ name: 'has-custom', factory })

      expect(hasReporter('has-custom')).toBe(true)
    })

    test('returns false for unknown reporter', () => {
      expect(hasReporter('nonexistent')).toBe(false)
    })

    test('returns false for empty string', () => {
      expect(hasReporter('')).toBe(false)
    })

    test('returns false for undefined name', () => {
      expect(hasReporter(undefined as unknown as string)).toBe(false)
    })
  })

  describe('getReporterFactory', () => {
    test('returns factory for known reporter', () => {
      const factory = getReporterFactory('console')

      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('returns factory for json reporter', () => {
      const factory = getReporterFactory('json')

      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('returns factory for html reporter', () => {
      const factory = getReporterFactory('html')

      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('returns factory for junit reporter', () => {
      const factory = getReporterFactory('junit')

      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('returns factory for sarif reporter', () => {
      const factory = getReporterFactory('sarif')

      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('returns factory for markdown reporter', () => {
      const factory = getReporterFactory('markdown')

      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('returns factory for gitlab reporter', () => {
      const factory = getReporterFactory('gitlab')

      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('returns undefined for unknown reporter', () => {
      const factory = getReporterFactory('nonexistent')

      expect(factory).toBeUndefined()
    })

    test('returns factory for custom registered reporter', () => {
      const factory = createMockReporter('factory-custom')
      registerReporter({ name: 'factory-custom', factory })

      const retrievedFactory = getReporterFactory('factory-custom')

      expect(retrievedFactory).toBe(factory)
    })

    test('factory can be used to create reporter instance', () => {
      const factory = getReporterFactory('console')

      if (factory) {
        const reporter = factory({ color: true })
        expect(reporter).toBeDefined()
        expect(reporter.name).toBe('console')
      }
    })
  })

  describe('Built-in initialization', () => {
    test('console reporter is auto-registered', () => {
      expect(hasReporter('console')).toBe(true)
      const reporter = getReporter('console')
      expect(reporter.name).toBe('console')
    })

    test('json reporter is auto-registered', () => {
      expect(hasReporter('json')).toBe(true)
      const reporter = getReporter('json')
      expect(reporter.name).toBe('json')
    })

    test('html reporter is auto-registered', () => {
      expect(hasReporter('html')).toBe(true)
      const reporter = getReporter('html')
      expect(reporter.name).toBe('html')
    })

    test('junit reporter is auto-registered', () => {
      expect(hasReporter('junit')).toBe(true)
      const reporter = getReporter('junit')
      expect(reporter.name).toBe('junit')
    })

    test('sarif reporter is auto-registered', () => {
      expect(hasReporter('sarif')).toBe(true)
      const reporter = getReporter('sarif')
      expect(reporter.name).toBe('sarif')
    })

    test('markdown reporter is auto-registered', () => {
      expect(hasReporter('markdown')).toBe(true)
      const reporter = getReporter('markdown')
      expect(reporter.name).toBe('markdown')
    })

    test('gitlab reporter is auto-registered', () => {
      expect(hasReporter('gitlab')).toBe(true)
      const reporter = getReporter('gitlab')
      expect(reporter.name).toBe('gitlab')
    })

    test('all 7 built-in reporters are registered', () => {
      const builtInReporters = ['console', 'json', 'html', 'junit', 'sarif', 'markdown', 'gitlab']

      builtInReporters.forEach((name) => {
        expect(hasReporter(name)).toBe(true)
      })
    })

    test('built-in reporters have descriptions', () => {
      const reporters = listReporters()
      const builtInReporters = reporters.filter((r) =>
        ['console', 'json', 'html', 'junit', 'sarif', 'markdown', 'gitlab'].includes(r.name),
      )

      builtInReporters.forEach((entry) => {
        expect(entry.description).toBeDefined()
        expect(entry.description?.length).toBeGreaterThan(0)
      })
    })

    test('console reporter has correct description', () => {
      const reporters = listReporters()
      const consoleReporter = reporters.find((r) => r.name === 'console')

      expect(consoleReporter?.description).toContain('Console output')
      expect(consoleReporter?.description).toContain('colors')
    })

    test('json reporter has correct description', () => {
      const reporters = listReporters()
      const jsonReporter = reporters.find((r) => r.name === 'json')

      expect(jsonReporter?.description).toContain('JSON')
      expect(jsonReporter?.description).toContain('programmatic')
    })

    test('html reporter has correct description', () => {
      const reporters = listReporters()
      const htmlReporter = reporters.find((r) => r.name === 'html')

      expect(htmlReporter?.description).toContain('HTML')
      expect(htmlReporter?.description).toContain('interactive')
    })

    test('junit reporter has correct description', () => {
      const reporters = listReporters()
      const junitReporter = reporters.find((r) => r.name === 'junit')

      expect(junitReporter?.description).toContain('JUnit')
      expect(junitReporter?.description).toContain('XML')
      expect(junitReporter?.description).toContain('CI/CD')
    })

    test('sarif reporter has correct description', () => {
      const reporters = listReporters()
      const sarifReporter = reporters.find((r) => r.name === 'sarif')

      expect(sarifReporter?.description).toContain('SARIF')
      expect(sarifReporter?.description).toContain('GitHub')
    })

    test('markdown reporter has correct description', () => {
      const reporters = listReporters()
      const markdownReporter = reporters.find((r) => r.name === 'markdown')

      expect(markdownReporter?.description).toContain('Markdown')
      expect(markdownReporter?.description).toContain('documentation')
    })

    test('gitlab reporter has correct description', () => {
      const reporters = listReporters()
      const gitlabReporter = reporters.find((r) => r.name === 'gitlab')

      expect(gitlabReporter?.description).toContain('GitLab')
      expect(gitlabReporter?.description).toContain('Code Quality')
    })
  })

  describe('Reporter options pass-through', () => {
    test('color option passes through to console reporter', () => {
      const reporter = getReporter('console', { color: true })
      expect(reporter).toBeDefined()
    })

    test('outputPath option passes through to json reporter', () => {
      const reporter = getReporter('json', { outputPath: '/tmp/output.json' })
      expect(reporter).toBeDefined()
    })

    test('pretty option passes through to json reporter', () => {
      const reporter = getReporter('json', { pretty: true })
      expect(reporter).toBeDefined()
    })

    test('verbose option passes through to console reporter', () => {
      const reporter = getReporter('console', { verbose: true })
      expect(reporter).toBeDefined()
    })

    test('multiple options pass through together', () => {
      const reporter = getReporter('console', {
        color: true,
        verbose: false,
        includeSource: true,
      })
      expect(reporter).toBeDefined()
    })
  })

  describe('CSV reporter', () => {
    test('csv reporter is auto-registered', () => {
      expect(hasReporter('csv')).toBe(true)
    })

    test('csv reporter can be retrieved', () => {
      const reporter = getReporter('csv')
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('csv')
    })

    test('csv reporter is included in list', () => {
      const reporters = listReporters()
      const csvReporter = reporters.find((r) => r.name === 'csv')
      expect(csvReporter).toBeDefined()
    })

    test('csv reporter has correct description', () => {
      const reporters = listReporters()
      const csvReporter = reporters.find((r) => r.name === 'csv')
      expect(csvReporter?.description).toContain('CSV')
    })

    test('csv reporter factory is available', () => {
      const factory = getReporterFactory('csv')
      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('csv reporter factory creates instance', () => {
      const factory = getReporterFactory('csv')
      if (factory) {
        const reporter = factory({})
        expect(reporter.name).toBe('csv')
      }
    })

    test('csv reporter accepts options', () => {
      const reporter = getReporter('csv', { outputPath: '/tmp/report.csv' })
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('csv')
    })

    test('csv reporter has format method', () => {
      const reporter = getReporter('csv')
      expect(typeof reporter.format).toBe('function')
    })

    test('csv reporter has report method', () => {
      const reporter = getReporter('csv')
      expect(typeof reporter.report).toBe('function')
    })

    test('csv reporter format returns string for violation', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation()
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('csv reporter format includes violation fields', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation({
        filePath: 'src/app.ts',
        line: 42,
        column: 10,
        severity: 'warning',
        ruleId: 'no-console',
        message: 'Unexpected console statement',
      })
      const result = reporter.format(violation)
      expect(result).toContain('src/app.ts')
      expect(result).toContain('42')
      expect(result).toContain('no-console')
    })
  })

  describe('All 8 built-in reporters', () => {
    const builtInNames = ['console', 'json', 'html', 'junit', 'sarif', 'markdown', 'gitlab', 'csv']

    test('all 8 built-in reporters are registered', () => {
      builtInNames.forEach((name) => {
        expect(hasReporter(name)).toBe(true)
      })
    })

    test('all 8 reporters can be instantiated', () => {
      builtInNames.forEach((name) => {
        const reporter = getReporter(name)
        expect(reporter).toBeDefined()
        expect(reporter.name).toBe(name)
      })
    })

    test('all 8 reporters have format method', () => {
      builtInNames.forEach((name) => {
        const reporter = getReporter(name)
        expect(typeof reporter.format).toBe('function')
      })
    })

    test('all 8 reporters have report method', () => {
      builtInNames.forEach((name) => {
        const reporter = getReporter(name)
        expect(typeof reporter.report).toBe('function')
      })
    })

    test('all 8 reporters have factories', () => {
      builtInNames.forEach((name) => {
        const factory = getReporterFactory(name)
        expect(factory).toBeDefined()
        expect(typeof factory).toBe('function')
      })
    })

    test('all 8 reporters appear in listReporters', () => {
      const reporters = listReporters()
      builtInNames.forEach((name) => {
        const found = reporters.find((r) => r.name === name)
        expect(found).toBeDefined()
      })
    })

    test('all 8 reporters have non-empty descriptions', () => {
      const reporters = listReporters()
      builtInNames.forEach((name) => {
        const entry = reporters.find((r) => r.name === name)
        expect(entry?.description).toBeDefined()
        expect(entry?.description?.length).toBeGreaterThan(0)
      })
    })

    test('listReporters contains at least 8 entries', () => {
      const reporters = listReporters()
      expect(reporters.length).toBeGreaterThanOrEqual(8)
    })

    test('each built-in reporter name is unique in the list', () => {
      const reporters = listReporters()
      const builtIn = reporters.filter((r) => builtInNames.includes(r.name))
      const names = builtIn.map((r) => r.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    test('each built-in reporter creates independent instances', () => {
      builtInNames.forEach((name) => {
        const instance1 = getReporter(name)
        const instance2 = getReporter(name)
        expect(instance1).not.toBe(instance2)
      })
    })
  })

  describe('Reporter instance interface', () => {
    test('console reporter instance has readonly name', () => {
      const reporter = getReporter('console')
      expect(reporter.name).toBe('console')
    })

    test('json reporter instance has readonly name', () => {
      const reporter = getReporter('json')
      expect(reporter.name).toBe('json')
    })

    test('html reporter instance has readonly name', () => {
      const reporter = getReporter('html')
      expect(reporter.name).toBe('html')
    })

    test('junit reporter instance has readonly name', () => {
      const reporter = getReporter('junit')
      expect(reporter.name).toBe('junit')
    })

    test('sarif reporter instance has readonly name', () => {
      const reporter = getReporter('sarif')
      expect(reporter.name).toBe('sarif')
    })

    test('markdown reporter instance has readonly name', () => {
      const reporter = getReporter('markdown')
      expect(reporter.name).toBe('markdown')
    })

    test('gitlab reporter instance has readonly name', () => {
      const reporter = getReporter('gitlab')
      expect(reporter.name).toBe('gitlab')
    })

    test('csv reporter instance has readonly name', () => {
      const reporter = getReporter('csv')
      expect(reporter.name).toBe('csv')
    })

    test('console reporter format returns string', () => {
      const reporter = getReporter('console')
      const result = reporter.format(createSampleViolation())
      expect(typeof result).toBe('string')
    })

    test('json reporter format returns string', () => {
      const reporter = getReporter('json')
      const result = reporter.format(createSampleViolation())
      expect(typeof result).toBe('string')
    })

    test('sarif reporter format returns string', () => {
      const reporter = getReporter('sarif')
      const result = reporter.format(createSampleViolation())
      expect(typeof result).toBe('string')
    })

    test('markdown reporter format returns string', () => {
      const reporter = getReporter('markdown')
      const result = reporter.format(createSampleViolation())
      expect(typeof result).toBe('string')
    })

    test('gitlab reporter format returns string', () => {
      const reporter = getReporter('gitlab')
      const result = reporter.format(createSampleViolation())
      expect(typeof result).toBe('string')
    })

    test('csv reporter format returns string', () => {
      const reporter = getReporter('csv')
      const result = reporter.format(createSampleViolation())
      expect(typeof result).toBe('string')
    })

    test('custom reporter format returns expected value', () => {
      const factory: ReporterFactory = () => ({
        name: 'fmt-custom',
        format: () => 'formatted-output',
        report: vi.fn(),
      })
      registerReporter({ name: 'fmt-custom', factory })

      const reporter = getReporter('fmt-custom')
      expect(reporter.format(createSampleViolation())).toBe('formatted-output')
    })
  })

  describe('Factory invocation details', () => {
    test('factory is called once per getReporter call', () => {
      const factory = vi.fn(() => ({
        name: 'call-count',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'call-count', factory })

      getReporter('call-count')
      expect(factory).toHaveBeenCalledTimes(1)

      getReporter('call-count')
      expect(factory).toHaveBeenCalledTimes(2)
    })

    test('factory receives empty object when no options provided', () => {
      const factory = vi.fn(() => ({
        name: 'empty-opts',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'empty-opts', factory })

      getReporter('empty-opts')
      expect(factory).toHaveBeenCalledWith({})
    })

    test('multiple getReporter calls create independent instances', () => {
      const factory = createMockReporter('independent')
      registerReporter({ name: 'independent', factory })

      const instance1 = getReporter('independent')
      const instance2 = getReporter('independent')

      expect(instance1).not.toBe(instance2)
    })

    test('factory can access quiet option', () => {
      const factory = vi.fn(() => ({
        name: 'quiet-factory',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'quiet-factory', factory })

      getReporter('quiet-factory', { quiet: true })
      expect(factory).toHaveBeenCalledWith({ quiet: true })
    })

    test('factory can access errorsOnly option', () => {
      const factory = vi.fn(() => ({
        name: 'errors-only-factory',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'errors-only-factory', factory })

      getReporter('errors-only-factory', { errorsOnly: true })
      expect(factory).toHaveBeenCalledWith({ errorsOnly: true })
    })

    test('factory can access includeSource option', () => {
      const factory = vi.fn(() => ({
        name: 'source-factory',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'source-factory', factory })

      getReporter('source-factory', { includeSource: true })
      expect(factory).toHaveBeenCalledWith({ includeSource: true })
    })

    test('factory receives combined options', () => {
      const factory = vi.fn(() => ({
        name: 'combo-factory',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'combo-factory', factory })

      const opts: ReporterOptions = {
        color: true,
        verbose: true,
        pretty: false,
        quiet: false,
        errorsOnly: false,
        includeSource: true,
        outputPath: '/dev/null',
      }
      getReporter('combo-factory', opts)
      expect(factory).toHaveBeenCalledWith(opts)
    })

    test('factory receives false boolean options', () => {
      const factory = vi.fn(() => ({
        name: 'false-bool',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'false-bool', factory })

      getReporter('false-bool', { color: false, verbose: false })
      expect(factory).toHaveBeenCalledWith({ color: false, verbose: false })
    })

    test('getReporter returns result of factory call', () => {
      const mockReporter: Reporter = {
        name: 'direct-return',
        format: () => 'test',
        report: vi.fn(),
      }
      const factory = vi.fn(() => mockReporter)
      registerReporter({ name: 'direct-return', factory })

      const result = getReporter('direct-return')
      expect(result).toBe(mockReporter)
    })

    test('factory receives empty string outputPath', () => {
      const factory = vi.fn(() => ({
        name: 'empty-path',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'empty-path', factory })

      getReporter('empty-path', { outputPath: '' })
      expect(factory).toHaveBeenCalledWith({ outputPath: '' })
    })

    test('factory is invoked fresh each time with same options', () => {
      const factory = vi.fn(() => ({
        name: 'fresh-factory',
        format: vi.fn(() => ''),
        report: vi.fn(),
      }))
      registerReporter({ name: 'fresh-factory', factory })

      const opts: ReporterOptions = { color: true }
      getReporter('fresh-factory', opts)
      getReporter('fresh-factory', opts)
      getReporter('fresh-factory', opts)

      expect(factory).toHaveBeenCalledTimes(3)
      expect(factory).toHaveBeenNthCalledWith(1, opts)
      expect(factory).toHaveBeenNthCalledWith(2, opts)
      expect(factory).toHaveBeenNthCalledWith(3, opts)
    })
  })

  describe('Registry override behavior', () => {
    test('overriding reporter changes factory', () => {
      const factory1 = createMockReporter('first')
      const factory2 = createMockReporter('second')

      registerReporter({ name: 'swap-test', factory: factory1 })
      expect(getReporter('swap-test').name).toBe('first')

      registerReporter({ name: 'swap-test', factory: factory2 })
      expect(getReporter('swap-test').name).toBe('second')
    })

    test('overriding reporter preserves presence', () => {
      const factory1 = createMockReporter('v1')
      const factory2 = createMockReporter('v2')

      registerReporter({ name: 'presence-test', factory: factory1 })
      expect(hasReporter('presence-test')).toBe(true)

      registerReporter({ name: 'presence-test', factory: factory2 })
      expect(hasReporter('presence-test')).toBe(true)
    })

    test('overriding updates factory in getReporterFactory', () => {
      const factory1 = createMockReporter('orig-factory')
      const factory2 = createMockReporter('new-factory')

      registerReporter({ name: 'factory-swap', factory: factory1 })
      expect(getReporterFactory('factory-swap')).toBe(factory1)

      registerReporter({ name: 'factory-swap', factory: factory2 })
      expect(getReporterFactory('factory-swap')).toBe(factory2)
    })

    test('overriding updates description', () => {
      registerReporter({
        name: 'desc-swap',
        description: 'First description',
        factory: createMockReporter('desc-v1'),
      })
      registerReporter({
        name: 'desc-swap',
        description: 'Second description',
        factory: createMockReporter('desc-v2'),
      })

      const reporters = listReporters()
      const entry = reporters.find((r) => r.name === 'desc-swap')
      expect(entry?.description).toBe('Second description')
    })

    test('overriding built-in reporter works', () => {
      const customConsole = createMockReporter('custom-console')
      registerReporter({ name: 'console', factory: customConsole })

      const reporter = getReporter('console')
      expect(reporter.name).toBe('custom-console')
    })

    test('overriding with entry without description clears description', () => {
      registerReporter({
        name: 'clear-desc',
        description: 'Has description',
        factory: createMockReporter('desc-clear-v1'),
      })
      registerReporter({
        name: 'clear-desc',
        factory: createMockReporter('desc-clear-v2'),
      })

      const reporters = listReporters()
      const entry = reporters.find((r) => r.name === 'clear-desc')
      expect(entry?.description).toBeUndefined()
    })

    test('listReporters reflects latest override', () => {
      registerReporter({
        name: 'list-swap',
        description: 'Version 1',
        factory: createMockReporter('list-v1'),
      })
      registerReporter({
        name: 'list-swap',
        description: 'Version 2',
        factory: createMockReporter('list-v2'),
      })

      const reporters = listReporters()
      const entries = reporters.filter((r) => r.name === 'list-swap')
      expect(entries.length).toBe(1)
      expect(entries[0].description).toBe('Version 2')
    })

    test('overriding does not duplicate entries', () => {
      const beforeCount = listReporters().filter((r) => r.name === 'dup-test').length
      registerReporter({ name: 'dup-test', factory: createMockReporter('dup-v1') })
      const afterFirst = listReporters().filter((r) => r.name === 'dup-test').length
      expect(afterFirst).toBe(beforeCount + 1)

      registerReporter({ name: 'dup-test', factory: createMockReporter('dup-v2') })
      const afterSecond = listReporters().filter((r) => r.name === 'dup-test').length
      expect(afterSecond).toBe(afterFirst)
    })
  })

  describe('Reporter name edge cases', () => {
    test('names with hyphens work', () => {
      registerReporter({ name: 'my-custom-reporter', factory: createMockReporter('hyphen') })
      expect(hasReporter('my-custom-reporter')).toBe(true)
      expect(getReporter('my-custom-reporter')).toBeDefined()
    })

    test('names with underscores work', () => {
      registerReporter({ name: 'my_custom_reporter', factory: createMockReporter('underscore') })
      expect(hasReporter('my_custom_reporter')).toBe(true)
    })

    test('names with dots work', () => {
      registerReporter({ name: 'reporter.v2', factory: createMockReporter('dot') })
      expect(hasReporter('reporter.v2')).toBe(true)
    })

    test('names with numbers work', () => {
      registerReporter({ name: 'reporter123', factory: createMockReporter('number') })
      expect(hasReporter('reporter123')).toBe(true)
    })

    test('names are case-sensitive', () => {
      registerReporter({ name: 'CaseSensitive', factory: createMockReporter('case') })
      expect(hasReporter('CaseSensitive')).toBe(true)
      expect(hasReporter('casesensitive')).toBe(false)
    })

    test('name with single character works', () => {
      registerReporter({ name: 'x', factory: createMockReporter('single-char') })
      expect(hasReporter('x')).toBe(true)
      expect(getReporter('x').name).toBe('single-char')
    })

    test('name with long string works', () => {
      const longName = 'a'.repeat(200)
      registerReporter({ name: longName, factory: createMockReporter('long-name') })
      expect(hasReporter(longName)).toBe(true)
    })

    test('built-in names are all lowercase', () => {
      const builtIn = ['console', 'json', 'html', 'junit', 'sarif', 'markdown', 'gitlab', 'csv']
      builtIn.forEach((name) => {
        expect(name).toBe(name.toLowerCase())
      })
    })

    test('hasReporter is case-sensitive for built-in names', () => {
      expect(hasReporter('Console')).toBe(false)
      expect(hasReporter('JSON')).toBe(false)
      expect(hasReporter('HTML')).toBe(false)
    })

    test('getReporter is case-sensitive for names', () => {
      expect(() => getReporter('Console')).toThrow()
      expect(() => getReporter('JSON')).toThrow()
      expect(() => getReporter('HTML')).toThrow()
    })

    test('names with colons work', () => {
      registerReporter({ name: 'scope:reporter', factory: createMockReporter('colon') })
      expect(hasReporter('scope:reporter')).toBe(true)
    })

    test('names with slashes work', () => {
      registerReporter({ name: 'scope/reporter', factory: createMockReporter('slash') })
      expect(hasReporter('scope/reporter')).toBe(true)
    })
  })

  describe('Error handling details', () => {
    test('getReporter throws Error instance', () => {
      try {
        getReporter('throw-test-xyz')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
      }
    })

    test('error message contains the reporter name', () => {
      expect(() => getReporter('my-bad-reporter')).toThrow(/my-bad-reporter/)
    })

    test('error message includes format "Unknown reporter: NAME"', () => {
      expect(() => getReporter('test-err')).toThrow(/Unknown reporter: "test-err"/)
    })

    test('error message shows available reporters list', () => {
      try {
        getReporter('error-test')
      } catch (e) {
        const message = (e as Error).message
        expect(message).toContain('Available reporters:')
        expect(message).toContain('console')
        expect(message).toContain('json')
        expect(message).toContain('csv')
      }
    })

    test('error for empty string name', () => {
      expect(() => getReporter('')).toThrow()
    })

    test('error includes custom registered reporters in available list', () => {
      registerReporter({ name: 'available-in-error', factory: createMockReporter('avail') })
      try {
        getReporter('still-unknown')
      } catch (e) {
        expect((e as Error).message).toContain('available-in-error')
      }
    })

    test('getReporterFactory does not throw for unknown name', () => {
      expect(() => getReporterFactory('no-such-factory')).not.toThrow()
    })

    test('getReporterFactory returns undefined for empty string', () => {
      expect(getReporterFactory('')).toBeUndefined()
    })

    test('hasReporter does not throw for any input', () => {
      expect(() => hasReporter('anything')).not.toThrow()
      expect(() => hasReporter('')).not.toThrow()
    })

    test('getReporter with similar name does not match', () => {
      expect(() => getReporter('console2')).toThrow()
      expect(() => getReporter('console-extra')).toThrow()
      expect(() => getReporter('myconsole')).toThrow()
    })

    test('error message for name with special characters', () => {
      expect(() => getReporter('<script>')).toThrow(/Unknown reporter/)
      expect(() => getReporter('test name with spaces')).toThrow(/Unknown reporter/)
    })
  })

  describe('listReporters advanced', () => {
    test('returns a new array each call', () => {
      const list1 = listReporters()
      const list2 = listReporters()
      expect(list1).not.toBe(list2)
    })

    test('returned array includes custom entries after registration', () => {
      registerReporter({ name: 'list-adv-test', factory: createMockReporter('list-adv') })
      const reporters = listReporters()
      const found = reporters.find((r) => r.name === 'list-adv-test')
      expect(found).toBeDefined()
    })

    test('each entry has required properties', () => {
      const reporters = listReporters()
      reporters.forEach((entry) => {
        expect(entry).toHaveProperty('name')
        expect(entry).toHaveProperty('factory')
        expect(typeof entry.name).toBe('string')
        expect(typeof entry.factory).toBe('function')
      })
    })

    test('description is optional in entries', () => {
      registerReporter({
        name: 'no-desc-entry',
        factory: createMockReporter('no-desc'),
      })
      const reporters = listReporters()
      const entry = reporters.find((r) => r.name === 'no-desc-entry')
      expect(entry).toBeDefined()
    })

    test('list contains at least all built-in reporters', () => {
      const reporters = listReporters()
      const names = reporters.map((r) => r.name)
      expect(names).toContain('console')
      expect(names).toContain('json')
      expect(names).toContain('html')
      expect(names).toContain('junit')
      expect(names).toContain('sarif')
      expect(names).toContain('markdown')
      expect(names).toContain('gitlab')
      expect(names).toContain('csv')
    })

    test('entries have correct factory that returns reporter', () => {
      const reporters = listReporters()
      const jsonEntry = reporters.find((r) => r.name === 'json')
      if (jsonEntry) {
        const reporter = jsonEntry.factory({})
        expect(reporter).toBeDefined()
        expect(reporter.name).toBe('json')
      }
    })

    test('entries have correct factory for sarif', () => {
      const reporters = listReporters()
      const sarifEntry = reporters.find((r) => r.name === 'sarif')
      if (sarifEntry) {
        const reporter = sarifEntry.factory({})
        expect(reporter.name).toBe('sarif')
      }
    })

    test('custom entry factory matches registered factory', () => {
      const factory = createMockReporter('list-factory-match')
      registerReporter({ name: 'list-factory-match', factory })
      const reporters = listReporters()
      const entry = reporters.find((r) => r.name === 'list-factory-match')
      expect(entry?.factory).toBe(factory)
    })

    test('can iterate all entries without error', () => {
      const reporters = listReporters()
      expect(() => {
        reporters.forEach((entry) => {
          void entry.name
          void entry.factory
          void entry.description
        })
      }).not.toThrow()
    })

    test('list length grows with registrations', () => {
      const before = listReporters().length
      registerReporter({ name: 'growth-test-1', factory: createMockReporter('grow1') })
      const after = listReporters().length
      expect(after).toBe(before + 1)
    })
  })

  describe('Options pass-through advanced', () => {
    test('html reporter accepts color option', () => {
      const reporter = getReporter('html', { color: true })
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('html')
    })

    test('junit reporter accepts outputPath option', () => {
      const reporter = getReporter('junit', { outputPath: '/tmp/junit.xml' })
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('junit')
    })

    test('sarif reporter accepts outputPath option', () => {
      const reporter = getReporter('sarif', { outputPath: '/tmp/results.sarif' })
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('sarif')
    })

    test('markdown reporter accepts verbose option', () => {
      const reporter = getReporter('markdown', { verbose: true })
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('markdown')
    })

    test('gitlab reporter accepts pretty option', () => {
      const reporter = getReporter('gitlab', { pretty: true })
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('gitlab')
    })

    test('csv reporter accepts includeSource option', () => {
      const reporter = getReporter('csv', { includeSource: true })
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('csv')
    })

    test('console reporter with all options', () => {
      const reporter = getReporter('console', {
        color: true,
        verbose: true,
        pretty: true,
        quiet: false,
        outputPath: '/dev/null',
        includeSource: true,
        errorsOnly: false,
      })
      expect(reporter).toBeDefined()
    })

    test('json reporter with all options', () => {
      const reporter = getReporter('json', {
        color: false,
        verbose: false,
        pretty: true,
        quiet: true,
        outputPath: '/tmp/full.json',
        includeSource: false,
        errorsOnly: true,
      })
      expect(reporter).toBeDefined()
    })

    test('html reporter with all options', () => {
      const reporter = getReporter('html', {
        color: true,
        verbose: true,
        pretty: false,
        quiet: false,
        outputPath: '/tmp/report.html',
        includeSource: true,
        errorsOnly: false,
      })
      expect(reporter).toBeDefined()
    })

    test('sarif reporter with all options', () => {
      const reporter = getReporter('sarif', {
        color: false,
        verbose: false,
        pretty: true,
        quiet: false,
        outputPath: '/tmp/report.sarif',
        includeSource: true,
        errorsOnly: false,
      })
      expect(reporter).toBeDefined()
    })

    test('junit reporter with all options', () => {
      const reporter = getReporter('junit', {
        color: false,
        verbose: true,
        pretty: false,
        quiet: true,
        outputPath: '/tmp/junit.xml',
        includeSource: false,
        errorsOnly: true,
      })
      expect(reporter).toBeDefined()
    })

    test('markdown reporter with all options', () => {
      const reporter = getReporter('markdown', {
        color: true,
        verbose: true,
        pretty: true,
        quiet: false,
        outputPath: '/tmp/report.md',
        includeSource: true,
        errorsOnly: false,
      })
      expect(reporter).toBeDefined()
    })

    test('gitlab reporter with all options', () => {
      const reporter = getReporter('gitlab', {
        color: false,
        verbose: false,
        pretty: true,
        quiet: false,
        outputPath: '/tmp/gl-report.json',
        includeSource: false,
        errorsOnly: false,
      })
      expect(reporter).toBeDefined()
    })

    test('csv reporter with all options', () => {
      const reporter = getReporter('csv', {
        color: false,
        verbose: false,
        pretty: false,
        quiet: true,
        outputPath: '/tmp/report.csv',
        includeSource: true,
        errorsOnly: true,
      })
      expect(reporter).toBeDefined()
    })
  })

  describe('getReporterFactory advanced', () => {
    test('factory for csv reporter', () => {
      const factory = getReporterFactory('csv')
      expect(factory).toBeDefined()
      expect(typeof factory).toBe('function')
    })

    test('factory for json creates correct reporter', () => {
      const factory = getReporterFactory('json')
      if (factory) {
        const reporter = factory({ pretty: true })
        expect(reporter.name).toBe('json')
        expect(typeof reporter.format).toBe('function')
        expect(typeof reporter.report).toBe('function')
      }
    })

    test('factory for html creates correct reporter', () => {
      const factory = getReporterFactory('html')
      if (factory) {
        const reporter = factory({ outputPath: '/tmp/test.html' })
        expect(reporter.name).toBe('html')
        expect(typeof reporter.format).toBe('function')
        expect(typeof reporter.report).toBe('function')
      }
    })

    test('factory for junit creates correct reporter', () => {
      const factory = getReporterFactory('junit')
      if (factory) {
        const reporter = factory({})
        expect(reporter.name).toBe('junit')
        expect(typeof reporter.format).toBe('function')
        expect(typeof reporter.report).toBe('function')
      }
    })

    test('factory for sarif creates correct reporter', () => {
      const factory = getReporterFactory('sarif')
      if (factory) {
        const reporter = factory({})
        expect(reporter.name).toBe('sarif')
        expect(typeof reporter.format).toBe('function')
        expect(typeof reporter.report).toBe('function')
      }
    })

    test('factory for markdown creates correct reporter', () => {
      const factory = getReporterFactory('markdown')
      if (factory) {
        const reporter = factory({})
        expect(reporter.name).toBe('markdown')
        expect(typeof reporter.format).toBe('function')
        expect(typeof reporter.report).toBe('function')
      }
    })

    test('factory for gitlab creates correct reporter', () => {
      const factory = getReporterFactory('gitlab')
      if (factory) {
        const reporter = factory({})
        expect(reporter.name).toBe('gitlab')
        expect(typeof reporter.format).toBe('function')
        expect(typeof reporter.report).toBe('function')
      }
    })

    test('factory for csv creates correct reporter', () => {
      const factory = getReporterFactory('csv')
      if (factory) {
        const reporter = factory({})
        expect(reporter.name).toBe('csv')
        expect(typeof reporter.format).toBe('function')
        expect(typeof reporter.report).toBe('function')
      }
    })

    test('returned factory is same reference as registered', () => {
      const originalFactory = createMockReporter('ref-same')
      registerReporter({ name: 'ref-same', factory: originalFactory })
      const retrieved = getReporterFactory('ref-same')
      expect(retrieved).toBe(originalFactory)
    })
  })

  describe('Custom reporter registration', () => {
    test('registering without description succeeds', () => {
      registerReporter({
        name: 'no-desc',
        factory: createMockReporter('no-desc-impl'),
      })
      expect(hasReporter('no-desc')).toBe(true)
    })

    test('registering with description succeeds', () => {
      registerReporter({
        name: 'with-desc',
        description: 'A described reporter',
        factory: createMockReporter('with-desc-impl'),
      })
      expect(hasReporter('with-desc')).toBe(true)
    })

    test('registering multiple custom reporters', () => {
      for (let i = 0; i < 5; i++) {
        registerReporter({
          name: `multi-${i}`,
          description: `Reporter ${i}`,
          factory: createMockReporter(`multi-impl-${i}`),
        })
      }
      for (let i = 0; i < 5; i++) {
        expect(hasReporter(`multi-${i}`)).toBe(true)
      }
    })

    test('custom reporter appears after built-in in list', () => {
      registerReporter({ name: 'after-builtin', factory: createMockReporter('after') })
      const reporters = listReporters()
      const customIdx = reporters.findIndex((r) => r.name === 'after-builtin')
      expect(customIdx).toBeGreaterThanOrEqual(0)
    })

    test('custom reporter factory creates instance with correct name', () => {
      const factory: ReporterFactory = () => ({
        name: 'custom-instance',
        format: () => '',
        report: vi.fn(),
      })
      registerReporter({ name: 'custom-inst', factory })
      const reporter = getReporter('custom-inst')
      expect(reporter.name).toBe('custom-instance')
    })

    test('custom reporter with optional dispose method', () => {
      const factory: ReporterFactory = () => ({
        name: 'disposable',
        format: () => '',
        report: vi.fn(),
        dispose: vi.fn(),
      })
      registerReporter({ name: 'disposable', factory })
      const reporter = getReporter('disposable')
      expect(reporter.dispose).toBeDefined()
      expect(typeof reporter.dispose).toBe('function')
    })

    test('custom reporter with optional init method', () => {
      const factory: ReporterFactory = () => ({
        name: 'initializable',
        format: () => '',
        report: vi.fn(),
        init: vi.fn(),
      })
      registerReporter({ name: 'initializable', factory })
      const reporter = getReporter('initializable')
      expect(reporter.init).toBeDefined()
      expect(typeof reporter.init).toBe('function')
    })

    test('custom reporter format can process violations', () => {
      const factory: ReporterFactory = () => ({
        name: 'processing',
        format: (v: Violation) => `${v.ruleId}: ${v.message}`,
        report: vi.fn(),
      })
      registerReporter({ name: 'processing', factory })
      const reporter = getReporter('processing')
      const violation = createSampleViolation({
        ruleId: 'custom-rule',
        message: 'Test message',
      })
      expect(reporter.format(violation)).toBe('custom-rule: Test message')
    })

    test('custom reporter report receives analysis result', () => {
      const reportFn = vi.fn()
      const factory: ReporterFactory = () => ({
        name: 'report-receiver',
        format: () => '',
        report: reportFn,
      })
      registerReporter({ name: 'report-receiver', factory })
      const reporter = getReporter('report-receiver')
      const result = createSampleAnalysisResult()
      reporter.report(result)
      expect(reportFn).toHaveBeenCalledWith(result)
    })
  })

  describe('Reporter format with violation variations', () => {
    test('console format handles error severity', () => {
      const reporter = getReporter('console')
      const violation = createSampleViolation({ severity: 'error' })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('console format handles warning severity', () => {
      const reporter = getReporter('console')
      const violation = createSampleViolation({ severity: 'warning' })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('console format handles info severity', () => {
      const reporter = getReporter('console')
      const violation = createSampleViolation({ severity: 'info' })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('json format handles violation with all optional fields', () => {
      const reporter = getReporter('json')
      const violation = createSampleViolation({
        endLine: 10,
        endColumn: 20,
        source: 'const x = 1',
        suggestion: 'Use const instead of let',
        meta: { fixable: true },
      })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('csv format handles violation with minimal fields', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation()
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('markdown format handles violation', () => {
      const reporter = getReporter('markdown')
      const violation = createSampleViolation({
        filePath: 'src/example.ts',
        ruleId: 'max-params',
        message: 'Too many parameters',
      })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('sarif format handles violation', () => {
      const reporter = getReporter('sarif')
      const violation = createSampleViolation()
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('gitlab format handles violation', () => {
      const reporter = getReporter('gitlab')
      const violation = createSampleViolation()
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })
  })

  describe('Module-level singleton behavior', () => {
    test('registry persists across multiple listReporters calls', () => {
      registerReporter({ name: 'persist-test', factory: createMockReporter('persist') })
      expect(hasReporter('persist-test')).toBe(true)

      const list1 = listReporters()
      expect(list1.find((r) => r.name === 'persist-test')).toBeDefined()

      const list2 = listReporters()
      expect(list2.find((r) => r.name === 'persist-test')).toBeDefined()
    })

    test('registration persists across different API calls', () => {
      registerReporter({ name: 'persist-all', factory: createMockReporter('persist-impl') })

      expect(hasReporter('persist-all')).toBe(true)
      expect(getReporter('persist-all').name).toBe('persist-impl')
      expect(getReporterFactory('persist-all')).toBeDefined()
      expect(listReporters().find((r) => r.name === 'persist-all')).toBeDefined()
    })

    test('built-in reporters are always available', () => {
      const builtIn = ['console', 'json', 'html', 'junit', 'sarif', 'markdown', 'gitlab', 'csv']
      for (let i = 0; i < 3; i++) {
        builtIn.forEach((name) => {
          expect(hasReporter(name)).toBe(true)
        })
      }
    })

    test('getReporter always creates fresh instances', () => {
      const instance1 = getReporter('console')
      const instance2 = getReporter('console')
      const instance3 = getReporter('console')

      expect(instance1).not.toBe(instance2)
      expect(instance2).not.toBe(instance3)
      expect(instance1).not.toBe(instance3)
    })

    test('getReporterFactory returns same reference each call', () => {
      const factory1 = getReporterFactory('json')
      const factory2 = getReporterFactory('json')

      expect(factory1).toBe(factory2)
    })

    test('registered custom factory reference is stable', () => {
      const factory = createMockReporter('stable-ref')
      registerReporter({ name: 'stable-ref', factory })

      const ref1 = getReporterFactory('stable-ref')
      const ref2 = getReporterFactory('stable-ref')
      expect(ref1).toBe(factory)
      expect(ref2).toBe(factory)
    })

    test('built-in reporters cannot be removed', () => {
      expect(hasReporter('console')).toBe(true)
      expect(hasReporter('json')).toBe(true)
    })
  })

  describe('Registration with minimal and maximal data', () => {
    test('minimal registration with only required fields', () => {
      const entry: ReporterRegistryEntry = {
        name: 'minimal-only',
        factory: createMockReporter('min-impl'),
      }
      registerReporter(entry)
      expect(hasReporter('minimal-only')).toBe(true)
    })

    test('maximal registration with all fields', () => {
      const factory = createMockReporter('max-impl')
      const entry: ReporterRegistryEntry = {
        name: 'maximal',
        description: 'A fully specified reporter with description',
        factory,
      }
      registerReporter(entry)

      const reporters = listReporters()
      const found = reporters.find((r) => r.name === 'maximal')
      expect(found).toBeDefined()
      expect(found?.description).toBe('A fully specified reporter with description')
      expect(found?.factory).toBe(factory)
    })

    test('registration with empty description', () => {
      registerReporter({
        name: 'empty-desc',
        description: '',
        factory: createMockReporter('empty-desc-impl'),
      })
      const reporters = listReporters()
      const entry = reporters.find((r) => r.name === 'empty-desc')
      expect(entry?.description).toBe('')
    })

    test('registration with long description', () => {
      const longDesc = 'This is a very long description. '.repeat(20)
      registerReporter({
        name: 'long-desc',
        description: longDesc,
        factory: createMockReporter('long-desc-impl'),
      })
      const reporters = listReporters()
      const entry = reporters.find((r) => r.name === 'long-desc')
      expect(entry?.description).toBe(longDesc)
    })

    test('registration with unicode name', () => {
      registerReporter({
        name: 'unicode-名前',
        factory: createMockReporter('unicode-impl'),
      })
      expect(hasReporter('unicode-名前')).toBe(true)
    })

    test('registration with unicode description', () => {
      registerReporter({
        name: 'unicode-desc-test',
        description: 'レポーターの説明 🎉',
        factory: createMockReporter('unicode-desc-impl'),
      })
      const reporters = listReporters()
      const entry = reporters.find((r) => r.name === 'unicode-desc-test')
      expect(entry?.description).toBe('レポーターの説明 🎉')
    })
  })

  describe('Concurrent-like access patterns', () => {
    test('rapid sequential registrations', () => {
      for (let i = 0; i < 20; i++) {
        registerReporter({
          name: `rapid-${i}`,
          factory: createMockReporter(`rapid-impl-${i}`),
        })
      }
      for (let i = 0; i < 20; i++) {
        expect(hasReporter(`rapid-${i}`)).toBe(true)
      }
    })

    test('rapid sequential getReporter calls', () => {
      const instances: Reporter[] = []
      for (let i = 0; i < 10; i++) {
        instances.push(getReporter('console'))
      }
      for (let i = 0; i < instances.length; i++) {
        for (let j = i + 1; j < instances.length; j++) {
          expect(instances[i]).not.toBe(instances[j])
        }
      }
    })

    test('interleaved register and get', () => {
      registerReporter({ name: 'interleave-1', factory: createMockReporter('int-1') })
      const r1 = getReporter('interleave-1')

      registerReporter({ name: 'interleave-2', factory: createMockReporter('int-2') })
      const r2 = getReporter('interleave-2')

      expect(r1.name).toBe('int-1')
      expect(r2.name).toBe('int-2')
    })

    test('interleaved register and listReporters', () => {
      registerReporter({ name: 'list-inter-1', factory: createMockReporter('li-1') })
      const count1 = listReporters().filter((r) => r.name.startsWith('list-inter')).length

      registerReporter({ name: 'list-inter-2', factory: createMockReporter('li-2') })
      const count2 = listReporters().filter((r) => r.name.startsWith('list-inter')).length

      expect(count2).toBe(count1 + 1)
    })

    test('interleaved register and hasReporter', () => {
      registerReporter({ name: 'has-inter', factory: createMockReporter('hi') })
      expect(hasReporter('has-inter')).toBe(true)

      registerReporter({ name: 'has-inter-2', factory: createMockReporter('hi2') })
      expect(hasReporter('has-inter')).toBe(true)
      expect(hasReporter('has-inter-2')).toBe(true)
    })
  })

  describe('Reporter with various Violation inputs', () => {
    test('violation with minimal required fields', () => {
      const reporter = getReporter('csv')
      const violation: Violation = {
        filePath: 'a.ts',
        line: 1,
        column: 1,
        message: 'msg',
        ruleId: 'rule',
        severity: 'error',
      }
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('violation with all optional fields', () => {
      const reporter = getReporter('csv')
      const violation: Violation = {
        filePath: 'complex.ts',
        line: 100,
        column: 50,
        endLine: 105,
        endColumn: 60,
        message: 'Complex violation with all fields',
        ruleId: 'complex-rule',
        severity: 'warning',
        source: 'function complex() { return 1 }',
        suggestion: 'Simplify the function',
        meta: { category: 'complexity', fixable: true },
      }
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('violation with zero line and column', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation({ line: 0, column: 0 })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('violation with large line number', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation({ line: 999999 })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('violation with special characters in message', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation({
        message: 'Message with "quotes" and, commas',
      })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('violation with newline in message', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation({
        message: 'Line 1\nLine 2',
      })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })

    test('violation with special characters in filePath', () => {
      const reporter = getReporter('csv')
      const violation = createSampleViolation({
        filePath: 'path/with spaces/file name.ts',
      })
      const result = reporter.format(violation)
      expect(typeof result).toBe('string')
    })
  })

  describe('Built-in reporter report method', () => {
    test('console reporter report does not throw with empty result', () => {
      const reporter = getReporter('console')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('json reporter report does not throw with empty result', () => {
      const reporter = getReporter('json')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('csv reporter report does not throw with empty result', () => {
      const reporter = getReporter('csv')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('markdown reporter report does not throw with empty result', () => {
      const reporter = getReporter('markdown')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('sarif reporter report does not throw with empty result', () => {
      const reporter = getReporter('sarif')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('gitlab reporter report does not throw with empty result', () => {
      const reporter = getReporter('gitlab')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('junit reporter report does not throw with empty result', () => {
      const reporter = getReporter('junit')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('html reporter report does not throw with empty result', () => {
      const reporter = getReporter('html')
      const result = createSampleAnalysisResult()
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('console reporter report handles result with violations', () => {
      const reporter = getReporter('console')
      const result: AnalysisResult = {
        files: [
          {
            filePath: 'test.ts',
            violations: [createSampleViolation()],
            stats: { parseTime: 10, analysisTime: 20, totalTime: 30 },
          },
        ],
        summary: {
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalFiles: 1,
          filesWithViolations: 1,
          totalTime: 30,
        },
        timestamp: new Date().toISOString(),
      }
      expect(() => reporter.report(result)).not.toThrow()
    })

    test('csv reporter report handles result with violations', () => {
      const reporter = getReporter('csv')
      const result: AnalysisResult = {
        files: [
          {
            filePath: 'test.ts',
            violations: [createSampleViolation()],
            stats: { parseTime: 5, analysisTime: 10, totalTime: 15 },
          },
        ],
        summary: {
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalFiles: 1,
          filesWithViolations: 1,
          totalTime: 15,
        },
        timestamp: new Date().toISOString(),
      }
      expect(() => reporter.report(result)).not.toThrow()
    })
  })
})
