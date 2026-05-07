import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  isCustomReporterFormat,
  loadReporterFromPath,
  resolveReporterModulePath,
  validateReporterModule,
} from '../../../src/reporters/plugin-loader.js'

import { CLIError } from '../../../src/utils/errors.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = path.resolve(__dirname, '../../fixtures/reporters')
const VALID_REPORTER_PATH = path.resolve(FIXTURES_DIR, 'valid-reporter.js')
const INVALID_REPORTER_PATH = path.resolve(FIXTURES_DIR, 'invalid-reporter.js')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('isCustomReporterFormat', () => {
  test('returns true for custom:./path', () => {
    expect(isCustomReporterFormat('custom:./path')).toBe(true)
  })

  test('returns true for custom:path/to/mod', () => {
    expect(isCustomReporterFormat('custom:path/to/mod')).toBe(true)
  })

  test('returns true for custom:', () => {
    expect(isCustomReporterFormat('custom:')).toBe(true)
  })

  test('returns false for console', () => {
    expect(isCustomReporterFormat('console')).toBe(false)
  })

  test('returns false for json', () => {
    expect(isCustomReporterFormat('json')).toBe(false)
  })

  test('returns false for empty string', () => {
    expect(isCustomReporterFormat('')).toBe(false)
  })

  test('returns false for format starting with custom without colon', () => {
    expect(isCustomReporterFormat('customformat')).toBe(false)
  })

  test('returns true for custom:/absolute/path.js', () => {
    expect(isCustomReporterFormat('custom:/absolute/path.js')).toBe(true)
  })
})

describe('resolveReporterModulePath', () => {
  test('resolves absolute path that exists', () => {
    const result = resolveReporterModulePath(VALID_REPORTER_PATH)
    expect(result).toBe(VALID_REPORTER_PATH)
  })

  test('resolves relative path against cwd', () => {
    const relativePath = path.relative(process.cwd(), VALID_REPORTER_PATH)
    const result = resolveReporterModulePath(relativePath)
    expect(result).toBe(VALID_REPORTER_PATH)
  })

  test('resolves relative path against custom cwd', () => {
    const relativePath = path.relative(FIXTURES_DIR, VALID_REPORTER_PATH)
    const result = resolveReporterModulePath(relativePath, FIXTURES_DIR)
    expect(result).toBe(VALID_REPORTER_PATH)
  })

  test('throws CLIError for non-existent path', () => {
    expect(() => resolveReporterModulePath('/tmp/nonexistent-reporter-xyz.js')).toThrow(CLIError)
  })

  test('throws CLIError containing path for non-existent file', () => {
    const missingPath = '/tmp/nonexistent-reporter-xyz.js'
    try {
      resolveReporterModulePath(missingPath)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain(missingPath)
    }
  })

  test('throws for relative path that does not exist', () => {
    expect(() => resolveReporterModulePath('./no-such-file.js')).toThrow(CLIError)
  })

  test('returns absolute path unchanged when file exists', () => {
    const result = resolveReporterModulePath(VALID_REPORTER_PATH)
    expect(path.isAbsolute(result)).toBe(true)
  })
})

describe('validateReporterModule', () => {
  test('returns true for a function', () => {
    const fn = () => {}
    expect(validateReporterModule(fn)).toBe(true)
  })

  test('returns true for object with default as function', () => {
    const mod = { default: () => {} }
    expect(validateReporterModule(mod)).toBe(true)
  })

  test('returns false for null', () => {
    expect(validateReporterModule(null)).toBe(false)
  })

  test('returns false for empty object', () => {
    expect(validateReporterModule({})).toBe(false)
  })

  test('returns false for number', () => {
    expect(validateReporterModule(42)).toBe(false)
  })

  test('returns false for string', () => {
    expect(validateReporterModule('string')).toBe(false)
  })

  test('returns false for object with default as non-function', () => {
    const mod = { default: 'not-fn' }
    expect(validateReporterModule(mod)).toBe(false)
  })

  test('returns false for undefined', () => {
    expect(validateReporterModule(undefined)).toBe(false)
  })

  test('returns false for boolean true', () => {
    expect(validateReporterModule(true)).toBe(false)
  })

  test('returns false for boolean false', () => {
    expect(validateReporterModule(false)).toBe(false)
  })

  test('returns false for object with default as null', () => {
    const mod = { default: null }
    expect(validateReporterModule(mod)).toBe(false)
  })

  test('returns false for object with default as number', () => {
    const mod = { default: 42 }
    expect(validateReporterModule(mod)).toBe(false)
  })

  test('returns true for object with default as named function', () => {
    const mod = { default: function namedFn() {} }
    expect(validateReporterModule(mod)).toBe(true)
  })
})

describe('loadReporterFromPath', () => {
  test('loads valid reporter module and returns factory', async () => {
    const factory = await loadReporterFromPath(VALID_REPORTER_PATH)
    expect(typeof factory).toBe('function')
  })

  test('factory from valid reporter produces a reporter with name', async () => {
    const factory = await loadReporterFromPath(VALID_REPORTER_PATH)
    const reporter = factory({ verbose: false })
    expect(reporter.name).toBe('test-reporter')
  })

  test('factory from valid reporter produces a reporter with report method', async () => {
    const factory = await loadReporterFromPath(VALID_REPORTER_PATH)
    const reporter = factory({ verbose: false })
    expect(typeof reporter.report).toBe('function')
  })

  test('factory from valid reporter produces a reporter with format method', async () => {
    const factory = await loadReporterFromPath(VALID_REPORTER_PATH)
    const reporter = factory({ verbose: false })
    expect(typeof reporter.format).toBe('function')
  })

  test('throws CLIError for non-existent module path', async () => {
    await expect(loadReporterFromPath('/tmp/nonexistent-reporter-xyz.js')).rejects.toThrow(CLIError)
  })

  test('throws error containing module path for non-existent file', async () => {
    const missingPath = '/tmp/nonexistent-reporter-xyz.js'
    try {
      await loadReporterFromPath(missingPath)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain(missingPath)
    }
  })

  test('throws CLIError for invalid reporter module', async () => {
    await expect(loadReporterFromPath(INVALID_REPORTER_PATH)).rejects.toThrow(CLIError)
  })

  test('throws error about invalid module for non-function export', async () => {
    try {
      await loadReporterFromPath(INVALID_REPORTER_PATH)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('does not export a valid ReporterFactory')
    }
  })

  test('error for invalid module includes suggestions', async () => {
    try {
      await loadReporterFromPath(INVALID_REPORTER_PATH)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      const cliError = error as CLIError
      expect(cliError.suggestions.length).toBeGreaterThan(0)
    }
  })
})
