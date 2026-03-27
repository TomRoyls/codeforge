import { describe, test, expect } from 'vitest'
import { parseAnalysisFlags, filterByExtensions } from '../../../src/lib/analyze-options'

describe('analyze-options', () => {
  describe('parseAnalysisFlags', () => {
    test('should parse basic flags', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: ['src/**/*.ts'],
        format: 'console',
        ignore: ['node_modules'],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.ciMode).toBe(false)
      expect(result.concurrency).toBe(4)
      expect(result.dryRun).toBe(false)
      expect(result.failOnWarnings).toBe(false)
      expect(result.files).toEqual(['src/**/*.ts'])
      expect(result.format).toBe('console')
      expect(result.ignore).toEqual(['node_modules'])
      expect(result.maxWarnings).toBe(-1)
      expect(result.output).toBeUndefined()
      expect(result.quiet).toBe(false)
      expect(result.rules).toBeUndefined()
      expect(result.severityLevel).toBe('info')
      expect(result.shouldFix).toBe(false)
      expect(result.stagedMode).toBe(false)
      expect(result.verbose).toBe(false)
    })

    test('should enable quiet mode when ci flag is set', () => {
      const flags = {
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'console',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.ciMode).toBe(true)
      expect(result.quiet).toBe(true)
    })

    test('should force json format when ci mode is enabled with console format', () => {
      const flags = {
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'console',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.format).toBe('json')
    })

    test('should preserve explicit format when ci mode is enabled', () => {
      const flags = {
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'junit',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.format).toBe('junit')
    })

    test('should disable verbose when ci mode is enabled', () => {
      const flags = {
        ci: true,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'console',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: true,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.verbose).toBe(false)
    })

    test('should handle single file as string', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: 'src/index.ts',
        format: 'console',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.files).toEqual(['src/index.ts'])
    })

    test('should handle files array', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: ['src/**/*.ts', 'lib/**/*.ts'],
        format: 'console',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.files).toEqual(['src/**/*.ts', 'lib/**/*.ts'])
    })

    test('should default files to empty array when not provided', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        format: 'console',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.files).toEqual([])
    })

    test('should handle single ignore as string', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'console',
        ignore: 'node_modules',
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.ignore).toEqual(['node_modules'])
    })

    test('should handle ignore array', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'console',
        ignore: ['node_modules', 'dist'],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.ignore).toEqual(['node_modules', 'dist'])
    })

    test('should parse rules array', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'console',
        ignore: [],
        'max-warnings': -1,
        output: undefined,
        quiet: false,
        rules: ['no-console-log', 'prefer-const'],
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.rules).toEqual(['no-console-log', 'prefer-const'])
    })

    test('should parse output path', () => {
      const flags = {
        ci: false,
        concurrency: 4,
        'dry-run': false,
        'fail-on-warnings': false,
        files: [],
        format: 'json',
        ignore: [],
        'max-warnings': -1,
        output: 'report.json',
        quiet: false,
        rules: undefined,
        'severity-level': 'info' as const,
        fix: false,
        staged: false,
        verbose: false,
      }

      const result = parseAnalysisFlags(flags)

      expect(result.output).toBe('report.json')
    })

    test('should parse all severity levels', () => {
      for (const level of ['error', 'warning', 'info'] as const) {
        const flags = {
          ci: false,
          concurrency: 4,
          'dry-run': false,
          'fail-on-warnings': false,
          files: [],
          format: 'console',
          ignore: [],
          'max-warnings': -1,
          output: undefined,
          quiet: false,
          rules: undefined,
          'severity-level': level,
          fix: false,
          staged: false,
          verbose: false,
        }

        const result = parseAnalysisFlags(flags)
        expect(result.severityLevel).toBe(level)
      }
    })
  })

  describe('filterByExtensions', () => {
    test('should return all files when extensions is null', () => {
      const files = [{ path: 'src/index.ts' }, { path: 'src/utils.js' }, { path: 'README.md' }]

      const result = filterByExtensions(files, null)

      expect(result).toEqual(files)
    })

    test('should filter files by single extension', () => {
      const files = [{ path: 'src/index.ts' }, { path: 'src/utils.js' }, { path: 'src/types.ts' }]

      const result = filterByExtensions(files, ['.ts'])

      expect(result).toEqual([{ path: 'src/index.ts' }, { path: 'src/types.ts' }])
    })

    test('should filter files by multiple extensions', () => {
      const files = [
        { path: 'src/index.ts' },
        { path: 'src/utils.js' },
        { path: 'README.md' },
        { path: 'src/types.ts' },
      ]

      const result = filterByExtensions(files, ['.ts', '.js'])

      expect(result).toEqual([
        { path: 'src/index.ts' },
        { path: 'src/utils.js' },
        { path: 'src/types.ts' },
      ])
    })

    test('should be case insensitive for extensions', () => {
      const files = [{ path: 'src/index.TS' }, { path: 'src/utils.Js' }, { path: 'src/types.ts' }]

      const result = filterByExtensions(files, ['.ts', '.js'])

      expect(result).toEqual([
        { path: 'src/index.TS' },
        { path: 'src/utils.Js' },
        { path: 'src/types.ts' },
      ])
    })

    test('should return empty array when no files match', () => {
      const files = [{ path: 'README.md' }, { path: 'package.json' }]

      const result = filterByExtensions(files, ['.ts'])

      expect(result).toEqual([])
    })

    test('should handle empty files array', () => {
      const result = filterByExtensions([], ['.ts'])

      expect(result).toEqual([])
    })

    test('should handle empty extensions array', () => {
      const files = [{ path: 'src/index.ts' }]

      const result = filterByExtensions(files, [])

      expect(result).toEqual([])
    })
  })
})
