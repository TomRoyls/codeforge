import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, it, expect, afterAll } from 'vitest'

import { CLIError } from '../../src/utils/errors.js'
import {
  isCustomReporterFormat,
  resolveReporterModulePath,
  validateReporterModule,
  loadReporterFromPath,
} from '../../src/reporters/plugin-loader.js'

// ─── isCustomReporterFormat ───

describe('isCustomReporterFormat', () => {
  it('returns true for "custom:./path"', () => {
    expect(isCustomReporterFormat('custom:./path')).toBe(true)
  })

  it('returns true for "custom:/abs/path"', () => {
    expect(isCustomReporterFormat('custom:/abs/path')).toBe(true)
  })

  it('returns false for "json"', () => {
    expect(isCustomReporterFormat('json')).toBe(false)
  })

  it('returns false for "console"', () => {
    expect(isCustomReporterFormat('console')).toBe(false)
  })

  it('returns false for "html"', () => {
    expect(isCustomReporterFormat('html')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isCustomReporterFormat('')).toBe(false)
  })

  it('returns false for "Custom:./path" (case sensitive)', () => {
    expect(isCustomReporterFormat('Custom:./path')).toBe(false)
  })
})

// ─── resolveReporterModulePath ───

describe('resolveReporterModulePath', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'plugin-loader-test-'))
  const existingFile = join(tempDir, 'reporter.mjs')
  writeFileSync(existingFile, 'export default function() {}', 'utf8')

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('resolves an absolute path to an existing file', () => {
    const result = resolveReporterModulePath(existingFile)
    expect(result).toBe(existingFile)
  })

  it('resolves a relative path using cwd', () => {
    const result = resolveReporterModulePath('reporter.mjs', tempDir)
    expect(result).toBe(existingFile)
  })

  it('throws CLIError.fileNotFound for non-existent file', () => {
    const nonExistent = join(tempDir, 'no-such-file.mjs')
    try {
      resolveReporterModulePath(nonExistent)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E002')
      expect((error as CLIError).message).toContain(nonExistent)
    }
  })
})

// ─── validateReporterModule ───

describe('validateReporterModule', () => {
  it('returns true for a function', () => {
    const fn = function reporter() {
      return { name: 'test', report() {} }
    }
    expect(validateReporterModule(fn)).toBe(true)
  })

  it('returns true for an arrow function', () => {
    const fn = () => ({ name: 'test', report() {} })
    expect(validateReporterModule(fn)).toBe(true)
  })

  it('returns true for object with .default function', () => {
    const module = { default: function reporter() {
      return { name: 'test', report() {} }
    }}
    expect(validateReporterModule(module)).toBe(true)
  })

  it('returns true for object with .default arrow function', () => {
    const module = { default: () => ({ name: 'test', report() {} }) }
    expect(validateReporterModule(module)).toBe(true)
  })

  it('returns false for null', () => {
    expect(validateReporterModule(null)).toBe(false)
  })

  it('returns false for string', () => {
    expect(validateReporterModule('not a module')).toBe(false)
  })

  it('returns false for object with non-function .default', () => {
    expect(validateReporterModule({ default: 'not a function' })).toBe(false)
  })

  it('returns false for object without .default', () => {
    expect(validateReporterModule({ name: 'test' })).toBe(false)
  })

  it('returns false for number', () => {
    expect(validateReporterModule(42)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(validateReporterModule(undefined)).toBe(false)
  })

  it('returns false for boolean true', () => {
    expect(validateReporterModule(true)).toBe(false)
  })
})

// ─── loadReporterFromPath ───

describe('loadReporterFromPath', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'plugin-loader-load-'))
  const validModule = join(tempDir, 'valid-reporter.mjs')
  writeFileSync(
    validModule,
    'export default function(options) { return { name: "test", report() {} } }',
    'utf8',
  )

  const invalidModule = join(tempDir, 'invalid-reporter.mjs')
  writeFileSync(invalidModule, 'export const value = 42', 'utf8')

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('loads and returns a ReporterFactory from a valid module', async () => {
    const factory = await loadReporterFromPath(validModule)
    expect(typeof factory).toBe('function')
    const reporter = factory({} as never)
    expect(reporter).toHaveProperty('name', 'test')
    expect(typeof reporter.report).toBe('function')
  })

  it('throws CLIError when module does not export a valid ReporterFactory', async () => {
    try {
      await loadReporterFromPath(invalidModule)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E001')
      expect((error as CLIError).message).toContain('Invalid reporter module')
    }
  })

  it('throws CLIError when module file does not exist', async () => {
    const nonExistent = join(tempDir, 'no-such-file.mjs')
    try {
      await loadReporterFromPath(nonExistent)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E001')
      expect((error as CLIError).message).toContain('Failed to load reporter module')
    }
  })
})
