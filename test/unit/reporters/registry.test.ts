import { describe, test, expect, vi, beforeEach } from 'vitest'
import type {
  Reporter,
  ReporterFactory,
  ReporterOptions,
  ReporterRegistryEntry,
} from '../../../src/reporters/types.js'
import {
  registerReporter,
  getReporter,
  listReporters,
  hasReporter,
  getReporterFactory,
} from '../../../src/reporters/index.js'

// Mock reporter factory helper
function createMockReporter(name: string): ReporterFactory {
  return (options: ReporterOptions) => ({
    name,
    format: vi.fn(() => ''),
    report: vi.fn(),
    ...options,
  })
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
})
