import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DiscoveredFile } from '../src/core/file-discovery.js'

import {
  resolvePatterns,
  normalizeFlags,
  filterFilesByExtension,
  applyFixesToFiles,
  getProfileSeverityOverrides,
} from '../src/utils/command-helpers.js'

// ─── resolvePatterns ──────────────────────────────────

describe('resolvePatterns', () => {
  it('returns argsFiles wrapped in array when it is a string', () => {
    expect(resolvePatterns('src/**/*.ts', undefined)).toEqual(['src/**/*.ts'])
  })

  it('returns argsFiles as-is when it is an array', () => {
    expect(resolvePatterns(['src/**/*.ts', 'lib/**/*.ts'], undefined)).toEqual([
      'src/**/*.ts',
      'lib/**/*.ts',
    ])
  })

  it('returns argsFiles single-element array unchanged', () => {
    expect(resolvePatterns(['only.ts'], undefined)).toEqual(['only.ts'])
  })

  it('returns configFiles when argsFiles is undefined', () => {
    expect(resolvePatterns(undefined, ['**/*.ts'])).toEqual(['**/*.ts'])
  })

  it('returns empty array when both args are undefined', () => {
    expect(resolvePatterns(undefined, undefined)).toEqual([])
  })

  it('prefers argsFiles string over configFiles', () => {
    expect(resolvePatterns('args.ts', ['config.ts'])).toEqual(['args.ts'])
  })

  it('prefers argsFiles array over configFiles', () => {
    expect(resolvePatterns(['a.ts', 'b.ts'], ['c.ts'])).toEqual(['a.ts', 'b.ts'])
  })

  it('returns configFiles when argsFiles is undefined even if configFiles is empty', () => {
    expect(resolvePatterns(undefined, [])).toEqual([])
  })

  it('returns argsFiles empty array over configFiles', () => {
    expect(resolvePatterns([], ['config.ts'])).toEqual([])
  })

  it('treats empty string argsFiles as falsy, falling back to configFiles', () => {
    expect(resolvePatterns('', ['config.ts'])).toEqual(['config.ts'])
  })

  it('handles single-element configFiles', () => {
    expect(resolvePatterns(undefined, ['only.ts'])).toEqual(['only.ts'])
  })

  it('handles multi-element configFiles', () => {
    const configFiles = ['a.ts', 'b.ts', 'c.ts']
    expect(resolvePatterns(undefined, configFiles)).toEqual(configFiles)
  })

  it('returns the same array reference for argsFiles array', () => {
    const args = ['a.ts']
    const result = resolvePatterns(args, ['b.ts'])
    expect(result).toBe(args)
  })

  it('returns the same array reference for configFiles', () => {
    const config = ['a.ts']
    const result = resolvePatterns(undefined, config)
    expect(result).toBe(config)
  })

  it('handles argsFiles with glob patterns', () => {
    expect(resolvePatterns('src/**/{foo,bar}.ts', undefined)).toEqual([
      'src/**/{foo,bar}.ts',
    ])
  })
})

// ─── normalizeFlags ───────────────────────────────────

describe('normalizeFlags', () => {
  const defaultFlags = {
    'cache-results': false,
    ci: false,
    concurrency: 4,
    'dry-run': false,
    'fail-on-warnings': false,
    fix: false,
    format: 'console',
    'max-warnings': -1,
    output: undefined,
    quiet: false,
    staged: false,
    verbose: false,
  }

  it('returns default normalized flags', () => {
    const result = normalizeFlags(defaultFlags)
    expect(result).toEqual({
      cacheResults: false,
      changedMode: undefined,
      ciMode: false,
      concurrency: 4,
      dryRun: false,
      failOnWarnings: false,
      format: 'console',
      maxWarnings: -1,
      output: undefined,
      quiet: false,
      shouldFix: false,
      stagedMode: false,
      verbose: false,
    })
  })

  it('maps cache-results to cacheResults', () => {
    const result = normalizeFlags({ ...defaultFlags, 'cache-results': true })
    expect(result.cacheResults).toBe(true)
  })

  it('maps changed to changedMode', () => {
    const result = normalizeFlags({ ...defaultFlags, changed: 'main' })
    expect(result.changedMode).toBe('main')
  })

  it('leaves changedMode undefined when changed is not provided', () => {
    const result = normalizeFlags(defaultFlags)
    expect(result.changedMode).toBeUndefined()
  })

  it('maps ci to ciMode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true })
    expect(result.ciMode).toBe(true)
  })

  it('maps concurrency', () => {
    const result = normalizeFlags({ ...defaultFlags, concurrency: 8 })
    expect(result.concurrency).toBe(8)
  })

  it('maps dry-run to dryRun', () => {
    const result = normalizeFlags({ ...defaultFlags, 'dry-run': true })
    expect(result.dryRun).toBe(true)
  })

  it('maps fail-on-warnings to failOnWarnings', () => {
    const result = normalizeFlags({ ...defaultFlags, 'fail-on-warnings': true })
    expect(result.failOnWarnings).toBe(true)
  })

  it('maps fix to shouldFix', () => {
    const result = normalizeFlags({ ...defaultFlags, fix: true })
    expect(result.shouldFix).toBe(true)
  })

  it('maps format', () => {
    const result = normalizeFlags({ ...defaultFlags, format: 'json' })
    expect(result.format).toBe('json')
  })

  it('maps max-warnings to maxWarnings', () => {
    const result = normalizeFlags({ ...defaultFlags, 'max-warnings': 10 })
    expect(result.maxWarnings).toBe(10)
  })

  it('maps output', () => {
    const result = normalizeFlags({ ...defaultFlags, output: 'report.json' })
    expect(result.output).toBe('report.json')
  })

  it('leaves output undefined when not provided', () => {
    const result = normalizeFlags(defaultFlags)
    expect(result.output).toBeUndefined()
  })

  it('maps quiet', () => {
    const result = normalizeFlags({ ...defaultFlags, quiet: true })
    expect(result.quiet).toBe(true)
  })

  it('maps staged to stagedMode', () => {
    const result = normalizeFlags({ ...defaultFlags, staged: true })
    expect(result.stagedMode).toBe(true)
  })

  it('maps verbose', () => {
    const result = normalizeFlags({ ...defaultFlags, verbose: true })
    expect(result.verbose).toBe(true)
  })

  // CI mode overrides

  it('overrides format to json in CI mode when format is console', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, format: 'console' })
    expect(result.format).toBe('json')
  })

  it('keeps non-console format in CI mode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, format: 'sarif' })
    expect(result.format).toBe('sarif')
  })

  it('forces quiet to true in CI mode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, quiet: false })
    expect(result.quiet).toBe(true)
  })

  it('keeps quiet true in CI mode when explicitly set', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, quiet: true })
    expect(result.quiet).toBe(true)
  })

  it('forces verbose to false in CI mode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, verbose: true })
    expect(result.verbose).toBe(false)
  })

  it('keeps verbose false in CI mode when not set', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, verbose: false })
    expect(result.verbose).toBe(false)
  })

  it('allows verbose when not in CI mode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: false, verbose: true })
    expect(result.verbose).toBe(true)
  })

  it('allows quiet false when not in CI mode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: false, quiet: false })
    expect(result.quiet).toBe(false)
  })

  it('handles all flags enabled simultaneously', () => {
    const result = normalizeFlags({
      'cache-results': true,
      changed: 'develop',
      ci: false,
      concurrency: 16,
      'dry-run': true,
      'fail-on-warnings': true,
      fix: true,
      format: 'html',
      'max-warnings': 5,
      output: 'out.html',
      quiet: true,
      staged: true,
      verbose: true,
    })
    expect(result).toEqual({
      cacheResults: true,
      changedMode: 'develop',
      ciMode: false,
      concurrency: 16,
      dryRun: true,
      failOnWarnings: true,
      format: 'html',
      maxWarnings: 5,
      output: 'out.html',
      quiet: true,
      shouldFix: true,
      stagedMode: true,
      verbose: true,
    })
  })

  it('CI mode overrides take priority over individual flags', () => {
    const result = normalizeFlags({
      'cache-results': true,
      ci: true,
      concurrency: 2,
      'dry-run': false,
      'fail-on-warnings': false,
      fix: false,
      format: 'console',
      'max-warnings': -1,
      quiet: false,
      staged: false,
      verbose: true,
    })
    expect(result.format).toBe('json')
    expect(result.quiet).toBe(true)
    expect(result.verbose).toBe(false)
  })

  it('handles zero concurrency', () => {
    const result = normalizeFlags({ ...defaultFlags, concurrency: 0 })
    expect(result.concurrency).toBe(0)
  })

  it('handles negative max-warnings', () => {
    const result = normalizeFlags({ ...defaultFlags, 'max-warnings': -5 })
    expect(result.maxWarnings).toBe(-5)
  })

  it('handles zero max-warnings', () => {
    const result = normalizeFlags({ ...defaultFlags, 'max-warnings': 0 })
    expect(result.maxWarnings).toBe(0)
  })

  it('preserves junit format in CI mode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, format: 'junit' })
    expect(result.format).toBe('junit')
  })

  it('preserves markdown format in CI mode', () => {
    const result = normalizeFlags({ ...defaultFlags, ci: true, format: 'markdown' })
    expect(result.format).toBe('markdown')
  })

  it('returns output as undefined when not specified', () => {
    const result = normalizeFlags({ ...defaultFlags })
    expect(result.output).toBeUndefined()
  })
})

// ─── filterFilesByExtension ───────────────────────────

describe('filterFilesByExtension', () => {
  const makeFiles = (paths: string[]): DiscoveredFile[] =>
    paths.map((p) => ({ path: p, absolutePath: `/abs/${p}` }))

  it('returns all files when extensionInput is undefined', () => {
    const files = makeFiles(['a.ts', 'b.js', 'c.py'])
    expect(filterFilesByExtension(files, undefined)).toEqual(files)
  })

  it('returns all files when extensionInput is null', () => {
    const files = makeFiles(['a.ts', 'b.js'])
    expect(filterFilesByExtension(files, null)).toEqual(files)
  })

  it('filters by single extension string', () => {
    const files = makeFiles(['a.ts', 'b.js', 'c.ts'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(2)
    expect(result[0].path).toBe('a.ts')
    expect(result[1].path).toBe('c.ts')
  })

  it('filters by comma-separated extensions', () => {
    const files = makeFiles(['a.ts', 'b.js', 'c.py'])
    const result = filterFilesByExtension(files, '.ts,.js')
    expect(result).toHaveLength(2)
  })

  it('filters by array of extensions', () => {
    const files = makeFiles(['a.ts', 'b.js', 'c.py'])
    const result = filterFilesByExtension(files, ['.ts', '.py'])
    expect(result).toHaveLength(2)
    expect(result[0].path).toBe('a.ts')
    expect(result[1].path).toBe('c.py')
  })

  it('treats empty string extensionInput as falsy, returning all files', () => {
    const files = makeFiles(['a.ts'])
    const result = filterFilesByExtension(files, '')
    expect(result).toEqual(files)
  })

  it('returns empty array when extensionInput is comma-only string', () => {
    const files = makeFiles(['a.ts'])
    const result = filterFilesByExtension(files, ',,,')
    expect(result).toEqual([])
  })

  it('returns empty array when files array is empty', () => {
    expect(filterFilesByExtension([], '.ts')).toEqual([])
  })

  it('handles case-insensitive extension matching', () => {
    const files = makeFiles(['a.TS', 'b.ts', 'c.Ts'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(3)
  })

  it('handles case-insensitive extension input', () => {
    const files = makeFiles(['a.ts', 'b.TS'])
    const result = filterFilesByExtension(files, '.TS')
    expect(result).toHaveLength(2)
  })

  it('excludes hidden dotfiles without additional extensions', () => {
    const files = makeFiles(['.eslintrc', 'config.ts'])
    const result = filterFilesByExtension(files, ['.ts', '.eslintrc'])
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('config.ts')
  })

  it('includes hidden files with real extensions', () => {
    const files = makeFiles(['.hidden.ts', 'visible.ts'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(2)
  })

  it('handles files in subdirectories', () => {
    const files = makeFiles(['src/utils/a.ts', 'src/b.js', 'test/c.ts'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(2)
  })

  it('handles files with multiple dots in name', () => {
    const files = makeFiles(['my.component.test.ts', 'util.js'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('my.component.test.ts')
  })

  it('handles backslash paths', () => {
    const files = makeFiles(['src\\utils\\a.ts', 'src\\b.js'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(1)
  })

  it('trims whitespace from comma-separated extensions', () => {
    const files = makeFiles(['a.ts', 'b.js'])
    const result = filterFilesByExtension(files, ' .ts , .js ')
    expect(result).toHaveLength(2)
  })

  it('filters out empty segments from comma-separated input', () => {
    const files = makeFiles(['a.ts', 'b.js'])
    const result = filterFilesByExtension(files, '.ts,,.js')
    expect(result).toHaveLength(2)
  })

  it('matches .tsx extension', () => {
    const files = makeFiles(['a.tsx', 'b.ts', 'c.jsx'])
    const result = filterFilesByExtension(files, '.tsx')
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('a.tsx')
  })

  it('matches .jsx extension', () => {
    const files = makeFiles(['a.jsx', 'b.js'])
    const result = filterFilesByExtension(files, '.jsx')
    expect(result).toHaveLength(1)
  })

  it('does not match partial extension', () => {
    const files = makeFiles(['a.ts', 'b.tsx'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('a.ts')
  })

  it('handles single file matching', () => {
    const files = makeFiles(['only.ts'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(1)
  })

  it('handles single file not matching', () => {
    const files = makeFiles(['only.ts'])
    const result = filterFilesByExtension(files, '.js')
    expect(result).toHaveLength(0)
  })

  it('handles extension with dot in directory name', () => {
    const files = makeFiles(['src.v2/code.ts', 'src.v2/code.js'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('src.v2/code.ts')
  })

  it('does not match file with extension only in directory name', () => {
    const files = makeFiles(['src.ts/code'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(0)
  })

  it('returns empty for empty array extension input', () => {
    const files = makeFiles(['a.ts'])
    const result = filterFilesByExtension(files, [])
    expect(result).toEqual([])
  })

  it('handles extension matching for .mjs files', () => {
    const files = makeFiles(['a.mjs', 'b.js'])
    const result = filterFilesByExtension(files, '.mjs')
    expect(result).toHaveLength(1)
  })

  it('handles extension matching for .cjs files', () => {
    const files = makeFiles(['a.cjs', 'b.js'])
    const result = filterFilesByExtension(files, '.cjs')
    expect(result).toHaveLength(1)
  })

  it('matches multiple extensions via array', () => {
    const files = makeFiles(['a.ts', 'b.tsx', 'c.js', 'd.jsx', 'e.py'])
    const result = filterFilesByExtension(files, ['.ts', '.tsx', '.js', '.jsx'])
    expect(result).toHaveLength(4)
  })

  it('preserves absolutePath in filtered results', () => {
    const files = makeFiles(['a.ts', 'b.js'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result[0].absolutePath).toBe('/abs/a.ts')
  })

  it('handles deeply nested paths', () => {
    const files = makeFiles(['a/b/c/d/e/f.ts'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(1)
  })

  it('handles file with no extension', () => {
    const files = makeFiles(['Makefile', 'README'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(0)
  })

  it('handles file ending with dot', () => {
    const files = makeFiles(['file.', 'file.ts'])
    const result = filterFilesByExtension(files, '.ts')
    expect(result).toHaveLength(1)
  })
})

// ─── applyFixesToFiles ────────────────────────────────

describe('applyFixesToFiles', () => {
  const mockViolations = [
    { ruleId: 'rule-a', message: 'msg', severity: 'warning' as const },
  ]

  it('returns zero counts when no violations', async () => {
    const result = await applyFixesToFiles({
      allViolations: [],
      applyFixesFn: vi.fn(),
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(result).toEqual({ fixesApplied: 0, fixesSkipped: 0 })
  })

  it('delegates to applyFixesFn when violations exist', async () => {
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fixesApplied: 3,
      fixesSkipped: 1,
    })
    const result = await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(mockApplyFixes).toHaveBeenCalledTimes(1)
    expect(result.fixesApplied).toBe(3)
    expect(result.fixesSkipped).toBe(1)
  })

  it('does not call applyFixesFn when violations array is empty', async () => {
    const mockApplyFixes = vi.fn()
    await applyFixesToFiles({
      allViolations: [],
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(mockApplyFixes).not.toHaveBeenCalled()
  })

  it('passes dryRun to applyFixesFn', async () => {
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fixesApplied: 0,
      fixesSkipped: 1,
    })
    await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(mockApplyFixes).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: true }),
    )
  })

  it('passes quiet to applyFixesFn', async () => {
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: true,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(mockApplyFixes).toHaveBeenCalledWith(
      expect.objectContaining({ quiet: true }),
    )
  })

  it('passes allViolations to applyFixesFn', async () => {
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(mockApplyFixes).toHaveBeenCalledWith(
      expect.objectContaining({ allViolations: mockViolations }),
    )
  })

  it('returns fileFixReports from applyFixesFn when present', async () => {
    const reports = [{ filePath: 'a.ts', fixes: [] }]
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fileFixReports: reports,
      fixesApplied: 0,
      fixesSkipped: 0,
    })
    const result = await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(result.fileFixReports).toEqual(reports)
  })

  it('does not include fileFixReports when applyFixesFn omits it', async () => {
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    const result = await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(result.fileFixReports).toBeUndefined()
  })

  it('passes concurrency to applyFixesFn', async () => {
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 8,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(mockApplyFixes).toHaveBeenCalledWith(
      expect.objectContaining({ concurrency: 8 }),
    )
  })

  it('passes discoveredFiles to applyFixesFn', async () => {
    const files: DiscoveredFile[] = [{ path: 'a.ts', absolutePath: '/a.ts' }]
    const mockApplyFixes = vi.fn().mockResolvedValue({
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    await applyFixesToFiles({
      allViolations: mockViolations,
      applyFixesFn: mockApplyFixes,
      concurrency: 4,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(),
      parser: {} as never,
      quiet: false,
      rulesWithFixes: new Map(),
      verbose: false,
    })
    expect(mockApplyFixes).toHaveBeenCalledWith(
      expect.objectContaining({ discoveredFiles: files }),
    )
  })
})

// ─── getProfileSeverityOverrides ──────────────────────

describe('getProfileSeverityOverrides', () => {
  it('returns correct overrides for lenient profile', () => {
    const result = getProfileSeverityOverrides('lenient')
    expect(result).toEqual({
      'max-complexity': 'info',
      'max-depth': 'info',
      'max-file-size': 'info',
      'max-lines': 'info',
      'max-params': 'info',
      'no-console': 'info',
      'no-magic-numbers': 'info',
    })
  })

  it('returns correct overrides for moderate profile', () => {
    const result = getProfileSeverityOverrides('moderate')
    expect(result).toEqual({
      'max-complexity': 'warning',
      'max-depth': 'warning',
      'max-file-size': 'warning',
      'no-console': 'warning',
      'no-magic-numbers': 'warning',
    })
  })

  it('returns correct overrides for strict profile', () => {
    const result = getProfileSeverityOverrides('strict')
    expect(result).toEqual({
      'no-console': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-explicit-any': 'error',
      'no-implicit-coercion': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
    })
  })

  it('returns 7 overrides for lenient', () => {
    expect(Object.keys(getProfileSeverityOverrides('lenient'))).toHaveLength(7)
  })

  it('returns 5 overrides for moderate', () => {
    expect(Object.keys(getProfileSeverityOverrides('moderate'))).toHaveLength(5)
  })

  it('returns 7 overrides for strict', () => {
    expect(Object.keys(getProfileSeverityOverrides('strict'))).toHaveLength(7)
  })

  it('all lenient values are info severity', () => {
    const result = getProfileSeverityOverrides('lenient')
    expect(Object.values(result).every((v) => v === 'info')).toBe(true)
  })

  it('all moderate values are warning severity', () => {
    const result = getProfileSeverityOverrides('moderate')
    expect(Object.values(result).every((v) => v === 'warning')).toBe(true)
  })

  it('all strict values are error severity', () => {
    const result = getProfileSeverityOverrides('strict')
    expect(Object.values(result).every((v) => v === 'error')).toBe(true)
  })

  it('escalates no-console across profiles', () => {
    expect(getProfileSeverityOverrides('lenient')['no-console']).toBe('info')
    expect(getProfileSeverityOverrides('moderate')['no-console']).toBe('warning')
    expect(getProfileSeverityOverrides('strict')['no-console']).toBe('error')
  })

  it('escalates no-magic-numbers from lenient to moderate', () => {
    expect(getProfileSeverityOverrides('lenient')['no-magic-numbers']).toBe('info')
    expect(getProfileSeverityOverrides('moderate')['no-magic-numbers']).toBe('warning')
  })

  it('lenient does not include strict-only rules', () => {
    const result = getProfileSeverityOverrides('lenient')
    expect(result).not.toHaveProperty('no-debugger')
    expect(result).not.toHaveProperty('no-eval')
    expect(result).not.toHaveProperty('no-explicit-any')
    expect(result).not.toHaveProperty('no-implicit-coercion')
    expect(result).not.toHaveProperty('no-unused-vars')
    expect(result).not.toHaveProperty('prefer-const')
  })

  it('moderate does not include strict-only rules', () => {
    const result = getProfileSeverityOverrides('moderate')
    expect(result).not.toHaveProperty('no-debugger')
    expect(result).not.toHaveProperty('no-eval')
    expect(result).not.toHaveProperty('no-explicit-any')
    expect(result).not.toHaveProperty('prefer-const')
  })

  it('strict does not include lenient-only rules', () => {
    const result = getProfileSeverityOverrides('strict')
    expect(result).not.toHaveProperty('max-complexity')
    expect(result).not.toHaveProperty('max-depth')
    expect(result).not.toHaveProperty('max-file-size')
    expect(result).not.toHaveProperty('max-lines')
    expect(result).not.toHaveProperty('max-params')
    expect(result).not.toHaveProperty('no-magic-numbers')
  })

  it('different profiles produce different overrides', () => {
    const lenient = getProfileSeverityOverrides('lenient')
    const moderate = getProfileSeverityOverrides('moderate')
    const strict = getProfileSeverityOverrides('strict')
    expect(lenient).not.toEqual(moderate)
    expect(moderate).not.toEqual(strict)
    expect(lenient).not.toEqual(strict)
  })

  it('all severity values are valid', () => {
    const valid = new Set(['error', 'warning', 'info'])
    for (const profile of ['lenient', 'moderate', 'strict'] as const) {
      const overrides = getProfileSeverityOverrides(profile)
      for (const severity of Object.values(overrides)) {
        expect(valid.has(severity)).toBe(true)
      }
    }
  })

  it('no-console is present in all profiles', () => {
    expect(getProfileSeverityOverrides('lenient')).toHaveProperty('no-console')
    expect(getProfileSeverityOverrides('moderate')).toHaveProperty('no-console')
    expect(getProfileSeverityOverrides('strict')).toHaveProperty('no-console')
  })

  it('each profile has unique rule keys', () => {
    for (const profile of ['lenient', 'moderate', 'strict'] as const) {
      const keys = Object.keys(getProfileSeverityOverrides(profile))
      expect(new Set(keys).size).toBe(keys.length)
    }
  })
})

// ─── loadCommandConfig ────────────────────────────────

vi.mock('../src/config/discovery.js', () => ({
  findConfigPath: vi.fn(),
}))

vi.mock('../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(function () {
    return { getConfig: vi.fn() }
  }),
}))

vi.mock('../src/config/validator.js', () => ({
  validateConfig: vi.fn((c) => c),
}))

vi.mock('../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((base, cli) => ({ ...base, ...cli })),
  mergeEnvConfig: vi.fn((fileConfig, envConfig) => ({ ...fileConfig, ...envConfig })),
}))

vi.mock('../src/config/env-parser.js', () => ({
  parseEnvVars: vi.fn(() => ({})),
}))

vi.mock('../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}))

describe('loadCommandConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns merged defaults when no config file found', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')

    vi.mocked(findConfigPath).mockResolvedValue(undefined)
    const cache = new ConfigCache()

    const result = await loadCommandConfig({}, cache)
    expect(result).toBeDefined()
  })

  it('passes config flag to findConfigPath', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')

    vi.mocked(findConfigPath).mockResolvedValue(undefined)
    const cache = new ConfigCache()

    await loadCommandConfig({ config: 'custom.json' }, cache)
    expect(findConfigPath).toHaveBeenCalledWith('custom.json', expect.any(String))
  })

  it('loads config from file when found', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')

    vi.mocked(findConfigPath).mockResolvedValue('/path/to/.codeforgerc.json')
    const cache = new ConfigCache()

    const result = await loadCommandConfig({}, cache)
    expect(result).toBeDefined()
  })

  it('merges cli files flag into config', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')
    const { mergeConfigs } = await import('../src/config/merger.js')

    vi.mocked(findConfigPath).mockResolvedValue(undefined)
    const cache = new ConfigCache()

    await loadCommandConfig({ files: ['**/*.ts'] }, cache)
    expect(mergeConfigs).toHaveBeenCalledWith(expect.any(Object), { files: ['**/*.ts'] })
  })

  it('merges cli ignore flag into config', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')
    const { mergeConfigs } = await import('../src/config/merger.js')

    vi.mocked(findConfigPath).mockResolvedValue(undefined)
    const cache = new ConfigCache()

    await loadCommandConfig({ ignore: ['node_modules/**'] }, cache)
    expect(mergeConfigs).toHaveBeenCalledWith(expect.any(Object), {
      ignore: ['node_modules/**'],
    })
  })

  it('does not add files to cli flags when undefined', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')
    const { mergeConfigs } = await import('../src/config/merger.js')

    vi.mocked(findConfigPath).mockResolvedValue(undefined)
    const cache = new ConfigCache()

    await loadCommandConfig({}, cache)
    expect(mergeConfigs).toHaveBeenCalledWith(expect.any(Object), {})
  })

  it('calls parseEnvVars', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')
    const { parseEnvVars } = await import('../src/config/env-parser.js')

    vi.mocked(findConfigPath).mockResolvedValue(undefined)
    const cache = new ConfigCache()

    await loadCommandConfig({}, cache)
    expect(parseEnvVars).toHaveBeenCalled()
  })

  it('validates config when config file is found', async () => {
    const { loadCommandConfig } = await import('../src/utils/command-helpers.js')
    const { findConfigPath } = await import('../src/config/discovery.js')
    const { ConfigCache } = await import('../src/config/cache.js')
    const { validateConfig } = await import('../src/config/validator.js')

    vi.mocked(findConfigPath).mockResolvedValue('/path/config.json')
    const cache = new ConfigCache()
    const mockConfig = { rules: {} }

    cache.getConfig = vi.fn().mockResolvedValue(mockConfig)

    await loadCommandConfig({}, cache)
    expect(validateConfig).toHaveBeenCalledWith(mockConfig)
  })
})

// ─── setupRuleRegistryLazy ────────────────────────────

vi.mock('../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return { register: vi.fn(), disable: vi.fn(), runRules: vi.fn().mockReturnValue([]) }
  }),
}))

vi.mock('../src/rules/categories.js', () => ({
  RULE_CATEGORIES: {},
  getRuleCategory: vi.fn().mockReturnValue('style'),
}))

vi.mock('../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    getRuleIds: vi.fn().mockReturnValue(['rule-one', 'rule-two', 'rule-three']),
    loadAllRules: vi.fn().mockResolvedValue({
      'rule-one': { meta: { id: 'rule-one' } },
      'rule-two': { meta: { id: 'rule-two' } },
      'rule-three': { meta: { id: 'rule-three' } },
    }),
    loadRules: vi.fn().mockImplementation(async (ruleIds: string[]) => {
      const all: Record<string, { meta: { id: string } }> = {
        'rule-one': { meta: { id: 'rule-one' } },
        'rule-two': { meta: { id: 'rule-two' } },
        'rule-three': { meta: { id: 'rule-three' } },
      }
      const result: Record<string, { meta: { id: string } }> = {}
      for (const id of ruleIds) {
        if (all[id]) result[id] = all[id]
      }
      return result
    }),
  },
}))

describe('setupRuleRegistryLazy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads all rules when no requestedRules provided', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const mockRegister = vi.fn()
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: mockRegister,
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    const registry = await setupRuleRegistryLazy(undefined)
    expect(mockRegister).toHaveBeenCalledTimes(3)
    expect(registry).toBeDefined()
  })

  it('loads only requested rules', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const mockRegister = vi.fn()
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: mockRegister,
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy(['rule-one'])
    expect(mockRegister).toHaveBeenCalledTimes(1)
    expect(mockRegister).toHaveBeenCalledWith('rule-one', { meta: { id: 'rule-one' } }, 'style')
  })

  it('logs warning for unknown rules', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const { logger } = await import('../src/utils/logger.js')
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: vi.fn(),
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy(['rule-one', 'nonexistent'])
    expect(logger.warn).toHaveBeenCalledWith('Unknown rules will be ignored: nonexistent')
  })

  it('does not warn when all rules are known', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const { logger } = await import('../src/utils/logger.js')
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: vi.fn(),
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy(['rule-one', 'rule-two'])
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('loads all rules for empty requestedRules array', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const mockRegister = vi.fn()
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: mockRegister,
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy([])
    expect(mockRegister).toHaveBeenCalled()
  })

  it('registers no rules when only unknown rules requested', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const mockRegister = vi.fn()
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: mockRegister,
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy(['unknown-rule'])
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('creates new RuleRegistry instance', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: vi.fn(),
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy(undefined)
    expect(RuleRegistry).toHaveBeenCalledTimes(1)
  })

  it('registers with correct category from getRuleCategory', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const { getRuleCategory } = await import('../src/rules/categories.js')
    const mockRegister = vi.fn()
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: mockRegister,
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy(['rule-two'])
    expect(getRuleCategory).toHaveBeenCalledWith('rule-two')
    expect(mockRegister).toHaveBeenCalledWith('rule-two', { meta: { id: 'rule-two' } }, 'style')
  })

  it('handles multiple unknown rules in warning message', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const { logger } = await import('../src/utils/logger.js')
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: vi.fn(),
        disable: vi.fn(),
        runRules: vi.fn().mockReturnValue([]),
      } as never
    })

    await setupRuleRegistryLazy(['rule-one', 'fake1', 'fake2'])
    expect(logger.warn).toHaveBeenCalledWith('Unknown rules will be ignored: fake1, fake2')
  })

  it('returns a registry with runRules method', async () => {
    const { setupRuleRegistryLazy } = await import('../src/utils/command-helpers.js')
    const { RuleRegistry } = await import('../src/core/rule-registry.js')
    const mockRunRules = vi.fn().mockReturnValue([])
    vi.mocked(RuleRegistry).mockImplementation(function () {
      return {
        register: vi.fn(),
        disable: vi.fn(),
        runRules: mockRunRules,
      } as never
    })

    const registry = await setupRuleRegistryLazy(undefined)
    expect(typeof registry.runRules).toBe('function')
  })
})
