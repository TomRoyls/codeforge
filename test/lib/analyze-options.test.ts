import { describe, it, expect } from 'vitest'
import { parseAnalysisFlags, filterByExtensions } from '../../src/lib/analyze-options.js'

// ─── parseAnalysisFlags: Basic Flags ───────────────────

describe('parseAnalysisFlags', () => {
  it('maps basic flags to correct AnalysisOptions shape', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 8,
      format: 'json',
      quiet: false,
      verbose: true,
      staged: false,
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      'dry-run': false,
      'fail-on-warnings': true,
      'max-warnings': 5,
      output: 'out.json',
      rules: ['no-console', 'prefer-const'],
      'severity-level': 'warning',
      fix: true,
    })

    expect(opts.ciMode).toBe(false)
    expect(opts.concurrency).toBe(8)
    expect(opts.format).toBe('json')
    expect(opts.quiet).toBe(false)
    expect(opts.verbose).toBe(true)
    expect(opts.stagedMode).toBe(false)
    expect(opts.files).toEqual(['src/**/*.ts'])
    expect(opts.ignore).toEqual(['node_modules/**'])
    expect(opts.dryRun).toBe(false)
    expect(opts.failOnWarnings).toBe(true)
    expect(opts.maxWarnings).toBe(5)
    expect(opts.output).toBe('out.json')
    expect(opts.rules).toEqual(['no-console', 'prefer-const'])
    expect(opts.severityLevel).toBe('warning')
    expect(opts.shouldFix).toBe(true)
  })

  // ─── CI Mode ─────────────────────────────────────────

  it('forces json format when CI mode is active and format is console', () => {
    const opts = parseAnalysisFlags({
      ci: true,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.format).toBe('json')
  })

  it('forces quiet=true in CI mode even when quiet flag is false', () => {
    const opts = parseAnalysisFlags({
      ci: true,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.quiet).toBe(true)
  })

  it('forces verbose=false in CI mode even when verbose flag is true', () => {
    const opts = parseAnalysisFlags({
      ci: true,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: true,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.verbose).toBe(false)
  })

  it('preserves non-console format in CI mode', () => {
    const opts = parseAnalysisFlags({
      ci: true,
      concurrency: 4,
      format: 'junit',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.format).toBe('junit')
  })

  // ─── files ───────────────────────────────────────────

  it('wraps a single string files value into an array', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: 'src/**/*.ts',
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.files).toEqual(['src/**/*.ts'])
  })

  it('passes through an array of files unchanged', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: ['src/a.ts', 'src/b.ts'],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.files).toEqual(['src/a.ts', 'src/b.ts'])
  })

  it('returns empty array for files when undefined', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: undefined,
      ignore: undefined,
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.files).toEqual([])
  })

  // ─── ignore ──────────────────────────────────────────

  it('wraps a single string ignore value into an array', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: 'dist/**',
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.ignore).toEqual(['dist/**'])
  })

  it('passes through an array of ignore patterns unchanged', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: ['node_modules/**', 'dist/**'],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.ignore).toEqual(['node_modules/**', 'dist/**'])
  })

  it('returns empty array for ignore when undefined', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: undefined,
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.ignore).toEqual([])
  })

  // ─── Flag Mapping ────────────────────────────────────

  it('maps fix flag to shouldFix', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: true,
    })
    expect(opts.shouldFix).toBe(true)
  })

  it('maps dry-run flag to dryRun', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': true,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.dryRun).toBe(true)
  })

  it('maps staged flag to stagedMode', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: true,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.stagedMode).toBe(true)
  })

  it('maps severity-level flag to severityLevel', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'error',
      fix: false,
    })
    expect(opts.severityLevel).toBe('error')
  })

  it('passes through quiet flag when not in CI mode', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: true,
      verbose: false,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.quiet).toBe(true)
  })

  it('preserves verbose flag when not in CI mode', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: true,
      staged: false,
      files: [],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.verbose).toBe(true)
  })
})

// ─── filterByExtensions ────────────────────────────────

describe('filterByExtensions', () => {
  it('returns all files when extensions is null', () => {
    const files = [{ path: 'a.ts' }, { path: 'b.js' }, { path: 'c.py' }]
    const result = filterByExtensions(files, null)
    expect(result).toEqual(files)
  })

  it('filters to only matching extensions (.ts)', () => {
    const files = [{ path: 'a.ts' }, { path: 'b.js' }, { path: 'c.py' }]
    const result = filterByExtensions(files, ['.ts'])
    expect(result).toEqual([{ path: 'a.ts' }])
  })

  it('matches multiple extensions', () => {
    const files = [{ path: 'a.ts' }, { path: 'b.js' }, { path: 'c.py' }, { path: 'd.tsx' }]
    const result = filterByExtensions(files, ['.ts', '.js'])
    expect(result).toEqual([{ path: 'a.ts' }, { path: 'b.js' }])
  })

  it('returns empty array when no files match extensions', () => {
    const files = [{ path: 'a.py' }, { path: 'b.rb' }]
    const result = filterByExtensions(files, ['.ts'])
    expect(result).toEqual([])
  })

  it('returns nothing when extensions is an empty array', () => {
    const files = [{ path: 'a.ts' }, { path: 'b.js' }]
    const result = filterByExtensions(files, [])
    expect(result).toEqual([])
  })

  it('is case-insensitive for file extensions', () => {
    const files = [{ path: 'a.TS' }, { path: 'b.Js' }]
    const result = filterByExtensions(files, ['.ts', '.js'])
    expect(result).toEqual(files)
  })

  it('handles empty files array', () => {
    const result = filterByExtensions([], ['.ts'])
    expect(result).toEqual([])
  })
})
