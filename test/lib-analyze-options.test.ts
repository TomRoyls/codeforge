import { describe, it, expect } from 'vitest'
import { parseAnalysisFlags, filterByExtensions } from '../src/lib/analyze-options.js'

// ─── parseAnalysisFlags ───────────────────────────────
describe('parseAnalysisFlags', () => {
  it('parses basic flags', () => {
    const flags = {
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: ['src/'],
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    }
    const opts = parseAnalysisFlags(flags)
    expect(opts.ciMode).toBe(false)
    expect(opts.concurrency).toBe(4)
    expect(opts.format).toBe('console')
    expect(opts.files).toEqual(['src/'])
    expect(opts.quiet).toBe(false)
    expect(opts.verbose).toBe(false)
  })

  it('forces json format in CI mode', () => {
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

  it('preserves non-console format in CI mode', () => {
    const opts = parseAnalysisFlags({
      ci: true,
      concurrency: 4,
      format: 'html',
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
    expect(opts.format).toBe('html')
  })

  it('forces quiet in CI mode', () => {
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

  it('disables verbose in CI mode', () => {
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

  it('parses single file string as array', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: 'src/',
      ignore: [],
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.files).toEqual(['src/'])
  })

  it('parses single ignore string as array', () => {
    const opts = parseAnalysisFlags({
      ci: false,
      concurrency: 4,
      format: 'console',
      quiet: false,
      verbose: false,
      staged: false,
      files: [],
      ignore: 'node_modules/**',
      'dry-run': false,
      'fail-on-warnings': false,
      'max-warnings': -1,
      output: undefined,
      rules: undefined,
      'severity-level': 'info',
      fix: false,
    })
    expect(opts.ignore).toEqual(['node_modules/**'])
  })

  it('defaults files to empty array', () => {
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
    expect(opts.ignore).toEqual([])
  })

  it('parses fix flag', () => {
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
      'fail-on-warnings': true,
      'max-warnings': 10,
      output: 'report.json',
      rules: ['no-eval'],
      'severity-level': 'warning',
      fix: true,
    })
    expect(opts.shouldFix).toBe(true)
    expect(opts.dryRun).toBe(true)
    expect(opts.failOnWarnings).toBe(true)
    expect(opts.maxWarnings).toBe(10)
    expect(opts.output).toBe('report.json')
    expect(opts.rules).toEqual(['no-eval'])
    expect(opts.severityLevel).toBe('warning')
  })
})

// ─── filterByExtensions ───────────────────────────────
describe('filterByExtensions', () => {
  it('returns all files when extensions is null', () => {
    const files = [{ path: 'a.ts' }, { path: 'b.js' }]
    expect(filterByExtensions(files, null)).toEqual(files)
  })

  it('filters by extension', () => {
    const files = [{ path: 'a.ts' }, { path: 'b.js' }, { path: 'c.py' }]
    const result = filterByExtensions(files, ['.ts', '.js'])
    expect(result).toEqual([{ path: 'a.ts' }, { path: 'b.js' }])
  })

  it('returns empty when no files match', () => {
    const files = [{ path: 'a.py' }]
    expect(filterByExtensions(files, ['.ts'])).toEqual([])
  })

  it('is case insensitive', () => {
    const files = [{ path: 'a.TS' }]
    expect(filterByExtensions(files, ['.ts'])).toEqual([{ path: 'a.TS' }])
  })

  it('handles empty files array', () => {
    expect(filterByExtensions([], ['.ts'])).toEqual([])
  })
})
