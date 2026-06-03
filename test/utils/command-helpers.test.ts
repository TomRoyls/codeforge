import { describe, expect, it } from 'vitest'
import { resolvePatterns, normalizeFlags, filterFilesByExtension, getProfileSeverityOverrides } from '../../src/utils/command-helpers.js'
import type { DiscoveredFile } from '../../src/core/file-discovery.js'

// ─── resolvePatterns ───

describe('resolvePatterns', () => {
  it('returns single string as array', () => {
    expect(resolvePatterns('*.ts', undefined)).toEqual(['*.ts'])
  })

  it('returns array as-is', () => {
    expect(resolvePatterns(['*.ts', '*.js'], undefined)).toEqual(['*.ts', '*.js'])
  })

  it('falls back to config files', () => {
    expect(resolvePatterns(undefined, ['*.tsx'])).toEqual(['*.tsx'])
  })

  it('returns empty when both undefined', () => {
    expect(resolvePatterns(undefined, undefined)).toEqual([])
  })

  it('prioritizes args over config', () => {
    expect(resolvePatterns('*.ts', ['*.js'])).toEqual(['*.ts'])
  })
})

// ─── normalizeFlags ───

describe('normalizeFlags', () => {
  const baseFlags = {
    'cache-results': false,
    ci: false,
    concurrency: 4,
    'dry-run': false,
    'fail-on-warnings': false,
    fix: false,
    format: 'console',
    'max-warnings': -1,
    quiet: false,
    staged: false,
    verbose: false,
  }

  it('returns defaults for base flags', () => {
    const result = normalizeFlags(baseFlags)
    expect(result.ciMode).toBe(false)
    expect(result.format).toBe('console')
    expect(result.quiet).toBe(false)
    expect(result.verbose).toBe(false)
  })

  it('CI mode forces json format and quiet', () => {
    const result = normalizeFlags({ ...baseFlags, ci: true, format: 'console' })
    expect(result.ciMode).toBe(true)
    expect(result.format).toBe('json')
    expect(result.quiet).toBe(true)
  })

  it('CI mode does not override explicit format', () => {
    const result = normalizeFlags({ ...baseFlags, ci: true, format: 'junit' })
    expect(result.format).toBe('junit')
  })

  it('CI mode disables verbose', () => {
    const result = normalizeFlags({ ...baseFlags, ci: true, verbose: true })
    expect(result.verbose).toBe(false)
  })

  it('passes through fix and dry-run', () => {
    const result = normalizeFlags({ ...baseFlags, fix: true, 'dry-run': true })
    expect(result.shouldFix).toBe(true)
    expect(result.dryRun).toBe(true)
  })

  it('passes through changed mode', () => {
    const result = normalizeFlags({ ...baseFlags, changed: 'main' })
    expect(result.changedMode).toBe('main')
  })
})

// ─── filterFilesByExtension ───

describe('filterFilesByExtension', () => {
  const files: DiscoveredFile[] = [
    { path: 'src/index.ts', hash: 'a' },
    { path: 'src/app.tsx', hash: 'b' },
    { path: 'src/style.css', hash: 'c' },
    { path: 'src/util.js', hash: 'd' },
  ]

  it('returns all files when no extension specified', () => {
    expect(filterFilesByExtension(files)).toEqual(files)
  })

  it('filters by single extension string', () => {
    const result = filterFilesByExtension(files, '.ts')
    expect(result.length).toBe(1)
    expect(result[0]!.path).toBe('src/index.ts')
  })

  it('filters by comma-separated extensions', () => {
    const result = filterFilesByExtension(files, '.ts,.tsx')
    expect(result.length).toBe(2)
    expect(result.map((f) => f.path).sort()).toEqual(['src/app.tsx', 'src/index.ts'])
  })

  it('filters by array of extensions', () => {
    const result = filterFilesByExtension(files, ['.js', '.css'])
    expect(result.length).toBe(2)
  })

  it('returns empty for no matching extensions', () => {
    const result = filterFilesByExtension(files, '.py')
    expect(result).toEqual([])
  })

  it('returns all files for empty extension string', () => {
    expect(filterFilesByExtension(files, '')).toEqual(files)
  })

  it('returns empty for comma-only extension string', () => {
    expect(filterFilesByExtension(files, ', ,')).toEqual([])
  })

  it('handles null extension', () => {
    expect(filterFilesByExtension(files, null)).toEqual(files)
  })
})

// ─── getProfileSeverityOverrides ───

describe('getProfileSeverityOverrides', () => {
  it('returns lenient overrides', () => {
    const overrides = getProfileSeverityOverrides('lenient')
    expect(overrides['max-complexity']).toBe('info')
    expect(overrides['no-console']).toBe('info')
  })

  it('returns moderate overrides', () => {
    const overrides = getProfileSeverityOverrides('moderate')
    expect(overrides['max-complexity']).toBe('warning')
  })

  it('returns strict overrides', () => {
    const overrides = getProfileSeverityOverrides('strict')
    expect(overrides['no-eval']).toBe('error')
    expect(overrides['no-explicit-any']).toBe('error')
  })

  it('getProfileSeverityOverrides returns object', () => {
    const overrides = getProfileSeverityOverrides('default')
    expect(typeof overrides).toBe('object')
  })
})
