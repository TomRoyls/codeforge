import { describe, test, expect } from 'vitest'
import { parseAnalysisFlags, filterByExtensions } from '../../../src/lib/analyze-options'

function createDefaultFlags(): Record<string, unknown> {
  return {
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
    'severity-level': 'info',
    fix: false,
    staged: false,
    verbose: false,
  }
}

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

    test('ciMode=false when ci flag is false', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.ciMode).toBe(false)
    })

    test('ciMode=true when ci flag is true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true })
      expect(result.ciMode).toBe(true)
    })

    test('format=console without ci returns console', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.format).toBe('console')
    })

    test('format=json without ci returns json', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), format: 'json' })
      expect(result.format).toBe('json')
    })

    test('format=html without ci returns html', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), format: 'html' })
      expect(result.format).toBe('html')
    })

    test('format=junit without ci returns junit', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), format: 'junit' })
      expect(result.format).toBe('junit')
    })

    test('format=markdown without ci returns markdown', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), format: 'markdown' })
      expect(result.format).toBe('markdown')
    })

    test('format=sarif without ci returns sarif', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), format: 'sarif' })
      expect(result.format).toBe('sarif')
    })

    test('format=gitlab without ci returns gitlab', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), format: 'gitlab' })
      expect(result.format).toBe('gitlab')
    })

    test('format=csv without ci returns csv', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), format: 'csv' })
      expect(result.format).toBe('csv')
    })

    test('format=console with ci=true overrides to json', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'console' })
      expect(result.format).toBe('json')
    })

    test('format=json with ci=true preserves json', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'json' })
      expect(result.format).toBe('json')
    })

    test('format=html with ci=true preserves html', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'html' })
      expect(result.format).toBe('html')
    })

    test('format=markdown with ci=true preserves markdown', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'markdown' })
      expect(result.format).toBe('markdown')
    })

    test('format=sarif with ci=true preserves sarif', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'sarif' })
      expect(result.format).toBe('sarif')
    })

    test('format=gitlab with ci=true preserves gitlab', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'gitlab' })
      expect(result.format).toBe('gitlab')
    })

    test('format=csv with ci=true preserves csv', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'csv' })
      expect(result.format).toBe('csv')
    })

    test('quiet=false and ci=false yields quiet=false', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.quiet).toBe(false)
    })

    test('quiet=true and ci=false yields quiet=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), quiet: true })
      expect(result.quiet).toBe(true)
    })

    test('quiet=false and ci=true yields quiet=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, quiet: false })
      expect(result.quiet).toBe(true)
    })

    test('quiet=true and ci=true yields quiet=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, quiet: true })
      expect(result.quiet).toBe(true)
    })

    test('verbose=true and ci=false yields verbose=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), verbose: true })
      expect(result.verbose).toBe(true)
    })

    test('verbose=false and ci=false yields verbose=false', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.verbose).toBe(false)
    })

    test('verbose=true and ci=true yields verbose=false', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, verbose: true })
      expect(result.verbose).toBe(false)
    })

    test('verbose=false and ci=true yields verbose=false', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, verbose: false })
      expect(result.verbose).toBe(false)
    })

    test('stagedMode=true when staged=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), staged: true })
      expect(result.stagedMode).toBe(true)
    })

    test('stagedMode=false when staged=false', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.stagedMode).toBe(false)
    })

    test('stagedMode is independent of ci flag', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, staged: true })
      expect(result.stagedMode).toBe(true)
    })

    test('stagedMode=false when ci=true but staged=false', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, staged: false })
      expect(result.stagedMode).toBe(false)
    })

    test('files as empty array returns empty array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), files: [] })
      expect(result.files).toEqual([])
    })

    test('files as single string path wraps in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), files: 'index.ts' })
      expect(result.files).toEqual(['index.ts'])
    })

    test('files as string with directory path wraps in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), files: 'src/index.ts' })
      expect(result.files).toEqual(['src/index.ts'])
    })

    test('files as string with glob pattern wraps in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), files: '**/*.ts' })
      expect(result.files).toEqual(['**/*.ts'])
    })

    test('files as array with single element returns that array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), files: ['single.ts'] })
      expect(result.files).toEqual(['single.ts'])
    })

    test('files as array with multiple elements returns that array', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        files: ['a.ts', 'b.ts', 'c.ts'],
      })
      expect(result.files).toEqual(['a.ts', 'b.ts', 'c.ts'])
    })

    test('files as array with glob patterns returns that array', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        files: ['*.ts', '*.js', '*.tsx'],
      })
      expect(result.files).toEqual(['*.ts', '*.js', '*.tsx'])
    })

    test('files not present in flags returns empty array', () => {
      const flags = createDefaultFlags()
      const flagsWithoutFiles = Object.fromEntries(
        Object.entries(flags).filter(([key]) => key !== 'files'),
      )
      const result = parseAnalysisFlags(flagsWithoutFiles)
      expect(result.files).toEqual([])
    })

    test('ignore not present in flags returns empty array', () => {
      const flags = createDefaultFlags()
      const flagsWithoutIgnore = Object.fromEntries(
        Object.entries(flags).filter(([key]) => key !== 'ignore'),
      )
      const result = parseAnalysisFlags(flagsWithoutIgnore)
      expect(result.ignore).toEqual([])
    })

    test('ignore as empty array returns empty array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ignore: [] })
      expect(result.ignore).toEqual([])
    })

    test('ignore as single string wraps in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ignore: 'dist' })
      expect(result.ignore).toEqual(['dist'])
    })

    test('ignore as string with glob pattern wraps in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ignore: '**/*.test.ts' })
      expect(result.ignore).toEqual(['**/*.test.ts'])
    })

    test('ignore as array with single element returns that array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ignore: ['coverage'] })
      expect(result.ignore).toEqual(['coverage'])
    })

    test('ignore as array with multiple elements returns that array', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ignore: ['node_modules', 'dist', '.cache'],
      })
      expect(result.ignore).toEqual(['node_modules', 'dist', '.cache'])
    })

    test('concurrency=1 returns 1', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), concurrency: 1 })
      expect(result.concurrency).toBe(1)
    })

    test('concurrency=2 returns 2', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), concurrency: 2 })
      expect(result.concurrency).toBe(2)
    })

    test('concurrency=8 returns 8', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), concurrency: 8 })
      expect(result.concurrency).toBe(8)
    })

    test('concurrency=16 returns 16', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), concurrency: 16 })
      expect(result.concurrency).toBe(16)
    })

    test('concurrency=0 returns 0', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), concurrency: 0 })
      expect(result.concurrency).toBe(0)
    })

    test('concurrency=32 returns 32', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), concurrency: 32 })
      expect(result.concurrency).toBe(32)
    })

    test('dryRun=true when dry-run=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'dry-run': true })
      expect(result.dryRun).toBe(true)
    })

    test('dryRun=false when dry-run=false', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.dryRun).toBe(false)
    })

    test('dryRun is independent of fix flag', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'dry-run': true, fix: true })
      expect(result.dryRun).toBe(true)
      expect(result.shouldFix).toBe(true)
    })

    test('failOnWarnings=true when fail-on-warnings=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'fail-on-warnings': true })
      expect(result.failOnWarnings).toBe(true)
    })

    test('failOnWarnings=false when fail-on-warnings=false', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.failOnWarnings).toBe(false)
    })

    test('failOnWarnings is independent of ci mode', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        'fail-on-warnings': true,
      })
      expect(result.failOnWarnings).toBe(true)
    })

    test('maxWarnings=-1 returns -1', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.maxWarnings).toBe(-1)
    })

    test('maxWarnings=0 returns 0', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'max-warnings': 0 })
      expect(result.maxWarnings).toBe(0)
    })

    test('maxWarnings=1 returns 1', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'max-warnings': 1 })
      expect(result.maxWarnings).toBe(1)
    })

    test('maxWarnings=10 returns 10', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'max-warnings': 10 })
      expect(result.maxWarnings).toBe(10)
    })

    test('maxWarnings=100 returns 100', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'max-warnings': 100 })
      expect(result.maxWarnings).toBe(100)
    })

    test('maxWarnings=500 returns 500', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'max-warnings': 500 })
      expect(result.maxWarnings).toBe(500)
    })

    test('output=undefined when not set', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.output).toBeUndefined()
    })

    test('output with relative path', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), output: './output/report.html' })
      expect(result.output).toBe('./output/report.html')
    })

    test('output with absolute path', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        output: '/tmp/reports/report.sarif',
      })
      expect(result.output).toBe('/tmp/reports/report.sarif')
    })

    test('output with just filename', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), output: 'report.json' })
      expect(result.output).toBe('report.json')
    })

    test('output with nested directory', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        output: 'reports/2024/q1/results.json',
      })
      expect(result.output).toBe('reports/2024/q1/results.json')
    })

    test('rules=undefined when not set', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.rules).toBeUndefined()
    })

    test('rules with single rule', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), rules: ['single-rule'] })
      expect(result.rules).toEqual(['single-rule'])
    })

    test('rules with multiple rules', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        rules: ['rule-a', 'rule-b', 'rule-c'],
      })
      expect(result.rules).toEqual(['rule-a', 'rule-b', 'rule-c'])
    })

    test('rules with real rule names', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        rules: ['no-console-log', 'prefer-const', 'max-params'],
      })
      expect(result.rules).toEqual(['no-console-log', 'prefer-const', 'max-params'])
    })

    test('severityLevel=error returns error', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'severity-level': 'error' })
      expect(result.severityLevel).toBe('error')
    })

    test('severityLevel=warning returns warning', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'severity-level': 'warning' })
      expect(result.severityLevel).toBe('warning')
    })

    test('severityLevel=info returns info', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'severity-level': 'info' })
      expect(result.severityLevel).toBe('info')
    })

    test('severityLevel with ci=true preserves severity', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        'severity-level': 'error',
      })
      expect(result.severityLevel).toBe('error')
    })

    test('shouldFix=true when fix=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), fix: true })
      expect(result.shouldFix).toBe(true)
    })

    test('shouldFix=false when fix=false', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.shouldFix).toBe(false)
    })

    test('shouldFix is independent of dryRun', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), fix: true, 'dry-run': false })
      expect(result.shouldFix).toBe(true)
      expect(result.dryRun).toBe(false)
    })

    test('fix=true and dry-run=true both true simultaneously', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), fix: true, 'dry-run': true })
      expect(result.shouldFix).toBe(true)
      expect(result.dryRun).toBe(true)
    })

    test('returns object with all expected keys', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      const keys = Object.keys(result)
      expect(keys).toContain('ciMode')
      expect(keys).toContain('concurrency')
      expect(keys).toContain('dryRun')
      expect(keys).toContain('failOnWarnings')
      expect(keys).toContain('files')
      expect(keys).toContain('format')
      expect(keys).toContain('ignore')
      expect(keys).toContain('maxWarnings')
      expect(keys).toContain('output')
      expect(keys).toContain('quiet')
      expect(keys).toContain('rules')
      expect(keys).toContain('severityLevel')
      expect(keys).toContain('shouldFix')
      expect(keys).toContain('stagedMode')
      expect(keys).toContain('verbose')
    })

    test('returns exactly 15 properties', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(Object.keys(result).length).toBe(15)
    })

    test('ci mode with all flags enabled', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        concurrency: 8,
        'dry-run': true,
        'fail-on-warnings': true,
        files: ['src/**/*.ts'],
        format: 'console',
        ignore: ['dist'],
        'max-warnings': 50,
        output: 'report.json',
        quiet: false,
        rules: ['no-console'],
        'severity-level': 'warning',
        fix: true,
        staged: true,
        verbose: true,
      })
      expect(result.ciMode).toBe(true)
      expect(result.concurrency).toBe(8)
      expect(result.dryRun).toBe(true)
      expect(result.failOnWarnings).toBe(true)
      expect(result.files).toEqual(['src/**/*.ts'])
      expect(result.format).toBe('json')
      expect(result.ignore).toEqual(['dist'])
      expect(result.maxWarnings).toBe(50)
      expect(result.output).toBe('report.json')
      expect(result.quiet).toBe(true)
      expect(result.rules).toEqual(['no-console'])
      expect(result.severityLevel).toBe('warning')
      expect(result.shouldFix).toBe(true)
      expect(result.stagedMode).toBe(true)
      expect(result.verbose).toBe(false)
    })

    test('all flags disabled minimal config', () => {
      const result = parseAnalysisFlags(createDefaultFlags())
      expect(result.ciMode).toBe(false)
      expect(result.concurrency).toBe(4)
      expect(result.dryRun).toBe(false)
      expect(result.failOnWarnings).toBe(false)
      expect(result.files).toEqual([])
      expect(result.format).toBe('console')
      expect(result.ignore).toEqual([])
      expect(result.maxWarnings).toBe(-1)
      expect(result.output).toBeUndefined()
      expect(result.quiet).toBe(false)
      expect(result.rules).toBeUndefined()
      expect(result.severityLevel).toBe('info')
      expect(result.shouldFix).toBe(false)
      expect(result.stagedMode).toBe(false)
      expect(result.verbose).toBe(false)
    })

    test('all flags enabled without ci', () => {
      const result = parseAnalysisFlags({
        ci: false,
        concurrency: 16,
        'dry-run': true,
        'fail-on-warnings': true,
        files: ['**/*.ts'],
        format: 'json',
        ignore: ['node_modules', 'dist'],
        'max-warnings': 0,
        output: '/tmp/report.json',
        quiet: true,
        rules: ['rule-a', 'rule-b'],
        'severity-level': 'error',
        fix: true,
        staged: true,
        verbose: true,
      })
      expect(result.ciMode).toBe(false)
      expect(result.concurrency).toBe(16)
      expect(result.dryRun).toBe(true)
      expect(result.failOnWarnings).toBe(true)
      expect(result.files).toEqual(['**/*.ts'])
      expect(result.format).toBe('json')
      expect(result.ignore).toEqual(['node_modules', 'dist'])
      expect(result.maxWarnings).toBe(0)
      expect(result.output).toBe('/tmp/report.json')
      expect(result.quiet).toBe(true)
      expect(result.rules).toEqual(['rule-a', 'rule-b'])
      expect(result.severityLevel).toBe('error')
      expect(result.shouldFix).toBe(true)
      expect(result.stagedMode).toBe(true)
      expect(result.verbose).toBe(true)
    })

    test('ci with fail-on-warnings combination', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        'fail-on-warnings': true,
      })
      expect(result.ciMode).toBe(true)
      expect(result.failOnWarnings).toBe(true)
      expect(result.format).toBe('json')
      expect(result.quiet).toBe(true)
      expect(result.verbose).toBe(false)
    })

    test('ci with explicit json format', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        format: 'json',
      })
      expect(result.format).toBe('json')
    })

    test('staged with verbose', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        staged: true,
        verbose: true,
      })
      expect(result.stagedMode).toBe(true)
      expect(result.verbose).toBe(true)
    })

    test('multiple files and multiple ignores', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        files: ['src/**/*.ts', 'lib/**/*.js'],
        ignore: ['node_modules', 'dist', 'coverage'],
      })
      expect(result.files).toEqual(['src/**/*.ts', 'lib/**/*.js'])
      expect(result.ignore).toEqual(['node_modules', 'dist', 'coverage'])
    })

    test('rules with output and json format', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        rules: ['max-params', 'no-any'],
        output: 'report.json',
        format: 'json',
      })
      expect(result.rules).toEqual(['max-params', 'no-any'])
      expect(result.output).toBe('report.json')
      expect(result.format).toBe('json')
    })

    test('concurrency=1 with verbose=true', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        concurrency: 1,
        verbose: true,
      })
      expect(result.concurrency).toBe(1)
      expect(result.verbose).toBe(true)
    })

    test('maxWarnings=0 with failOnWarnings=true', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        'max-warnings': 0,
        'fail-on-warnings': true,
      })
      expect(result.maxWarnings).toBe(0)
      expect(result.failOnWarnings).toBe(true)
    })

    test('works with config parameter passed', () => {
      const result = parseAnalysisFlags(createDefaultFlags(), { someConfig: true })
      expect(result.ciMode).toBe(false)
    })

    test('works with undefined config parameter', () => {
      const result = parseAnalysisFlags(createDefaultFlags(), undefined)
      expect(result.ciMode).toBe(false)
    })

    test('works with null config parameter', () => {
      const result = parseAnalysisFlags(createDefaultFlags(), null)
      expect(result.ciMode).toBe(false)
    })

    test('quiet flag independent of format', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), quiet: true, format: 'json' })
      expect(result.quiet).toBe(true)
      expect(result.format).toBe('json')
    })

    test('quiet flag independent of verbose', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), quiet: true, verbose: true })
      expect(result.quiet).toBe(true)
      expect(result.verbose).toBe(true)
    })

    test('concurrency is passed through unchanged', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), concurrency: 99 })
      expect(result.concurrency).toBe(99)
    })

    test('format=junit with ci=true preserves junit', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ci: true, format: 'junit' })
      expect(result.format).toBe('junit')
    })

    test('fix=true maps to shouldFix=true', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), fix: true })
      expect(result.shouldFix).toBe(true)
    })

    test('fix=false maps to shouldFix=false', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), fix: false })
      expect(result.shouldFix).toBe(false)
    })

    test('dry-run flag key is hyphenated', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'dry-run': true })
      expect(result.dryRun).toBe(true)
    })

    test('fail-on-warnings flag key is hyphenated', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'fail-on-warnings': true })
      expect(result.failOnWarnings).toBe(true)
    })

    test('max-warnings flag key is hyphenated', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'max-warnings': 42 })
      expect(result.maxWarnings).toBe(42)
    })

    test('severity-level flag key is hyphenated', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'severity-level': 'warning' })
      expect(result.severityLevel).toBe('warning')
    })

    test('files string with backslash path wraps in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), files: 'src\\index.ts' })
      expect(result.files).toEqual(['src\\index.ts'])
    })

    test('ignore string with leading dot wraps in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ignore: '.hidden' })
      expect(result.ignore).toEqual(['.hidden'])
    })

    test('files array preserves order', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        files: ['z.ts', 'a.ts', 'm.ts'],
      })
      expect(result.files).toEqual(['z.ts', 'a.ts', 'm.ts'])
    })

    test('ignore array preserves order', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ignore: ['zzz', 'aaa', 'mmm'],
      })
      expect(result.ignore).toEqual(['zzz', 'aaa', 'mmm'])
    })

    test('multiple flags set together: fix+staged+verbose', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        fix: true,
        staged: true,
        verbose: true,
      })
      expect(result.shouldFix).toBe(true)
      expect(result.stagedMode).toBe(true)
      expect(result.verbose).toBe(true)
    })

    test('multiple flags set together: quiet+fix+dry-run', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        quiet: true,
        fix: true,
        'dry-run': true,
      })
      expect(result.quiet).toBe(true)
      expect(result.shouldFix).toBe(true)
      expect(result.dryRun).toBe(true)
    })

    test('format console with quiet true', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        format: 'console',
        quiet: true,
      })
      expect(result.format).toBe('console')
      expect(result.quiet).toBe(true)
    })

    test('output with tilde path', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), output: '~/reports/out.json' })
      expect(result.output).toBe('~/reports/out.json')
    })

    test('output with . extension', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        output: 'results.sarif.json',
      })
      expect(result.output).toBe('results.sarif.json')
    })

    test('rules with empty array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), rules: [] })
      expect(result.rules).toEqual([])
    })

    test('files with deeply nested path string', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        files: 'src/lib/utils/helpers/format.ts',
      })
      expect(result.files).toEqual(['src/lib/utils/helpers/format.ts'])
    })

    test('ignore with complex glob pattern string', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ignore: '**/__tests__/**',
      })
      expect(result.ignore).toEqual(['**/__tests__/**'])
    })

    test('files with mixed patterns in array', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        files: ['src/**/*.ts', 'lib/index.js', 'test/*.spec.ts'],
      })
      expect(result.files).toEqual(['src/**/*.ts', 'lib/index.js', 'test/*.spec.ts'])
    })

    test('ignore with mixed patterns in array', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ignore: ['node_modules/**', '*.min.js', 'dist/'],
      })
      expect(result.ignore).toEqual(['node_modules/**', '*.min.js', 'dist/'])
    })

    test('concurrency and maxWarnings both set', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        concurrency: 12,
        'max-warnings': 25,
      })
      expect(result.concurrency).toBe(12)
      expect(result.maxWarnings).toBe(25)
    })

    test('ci mode with sarif format preserves sarif', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        format: 'sarif',
      })
      expect(result.format).toBe('sarif')
    })

    test('ci mode with csv format preserves csv', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        format: 'csv',
      })
      expect(result.format).toBe('csv')
    })

    test('ci mode with gitlab format preserves gitlab', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        format: 'gitlab',
      })
      expect(result.format).toBe('gitlab')
    })

    test('ci mode with markdown format preserves markdown', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        format: 'markdown',
      })
      expect(result.format).toBe('markdown')
    })

    test('ci mode with html format preserves html', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        ci: true,
        format: 'html',
      })
      expect(result.format).toBe('html')
    })

    test('quiet alone does not affect format', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), quiet: true, format: 'console' })
      expect(result.format).toBe('console')
    })

    test('verbose alone does not affect format', () => {
      const result = parseAnalysisFlags({
        ...createDefaultFlags(),
        verbose: true,
        format: 'console',
      })
      expect(result.format).toBe('console')
    })

    test('staged alone does not affect quiet', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), staged: true })
      expect(result.quiet).toBe(false)
    })

    test('staged alone does not affect verbose', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), staged: true })
      expect(result.verbose).toBe(false)
    })

    test('fix alone does not affect dryRun', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), fix: true })
      expect(result.dryRun).toBe(false)
    })

    test('dryRun alone does not affect fix', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), 'dry-run': true })
      expect(result.shouldFix).toBe(false)
    })

    test('multiple severity levels in sequence', () => {
      const levels: ReadonlyArray<'error' | 'info' | 'warning'> = ['error', 'warning', 'info']
      for (const level of levels) {
        const result = parseAnalysisFlags({ ...createDefaultFlags(), 'severity-level': level })
        expect(result.severityLevel).toBe(level)
      }
    })

    test('output with empty string', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), output: '' })
      expect(result.output).toBe('')
    })

    test('files with empty string in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), files: [''] })
      expect(result.files).toEqual([''])
    })

    test('ignore with empty string in array', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), ignore: [''] })
      expect(result.ignore).toEqual([''])
    })

    test('rules with single element array containing empty string', () => {
      const result = parseAnalysisFlags({ ...createDefaultFlags(), rules: [''] })
      expect(result.rules).toEqual([''])
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

    test('returns all files when extensions is null with single file', () => {
      const files = [{ path: 'src/index.ts' }]
      const result = filterByExtensions(files, null)
      expect(result).toEqual(files)
    })

    test('returns all files when extensions is null with many file types', () => {
      const files = [
        { path: 'a.ts' },
        { path: 'b.js' },
        { path: 'c.py' },
        { path: 'd.rs' },
        { path: 'e.go' },
      ]
      const result = filterByExtensions(files, null)
      expect(result).toEqual(files)
    })

    test('filters .tsx files only', () => {
      const files = [
        { path: 'App.tsx' },
        { path: 'index.ts' },
        { path: 'utils.js' },
        { path: 'Component.tsx' },
      ]
      const result = filterByExtensions(files, ['.tsx'])
      expect(result).toEqual([{ path: 'App.tsx' }, { path: 'Component.tsx' }])
    })

    test('filters .js files only', () => {
      const files = [
        { path: 'index.js' },
        { path: 'index.ts' },
        { path: 'utils.js' },
        { path: 'README.md' },
      ]
      const result = filterByExtensions(files, ['.js'])
      expect(result).toEqual([{ path: 'index.js' }, { path: 'utils.js' }])
    })

    test('filters .jsx files only', () => {
      const files = [
        { path: 'App.jsx' },
        { path: 'index.ts' },
        { path: 'Component.jsx' },
        { path: 'utils.js' },
      ]
      const result = filterByExtensions(files, ['.jsx'])
      expect(result).toEqual([{ path: 'App.jsx' }, { path: 'Component.jsx' }])
    })

    test('filters .mjs files', () => {
      const files = [{ path: 'module.mjs' }, { path: 'index.js' }, { path: 'config.cjs' }]
      const result = filterByExtensions(files, ['.mjs'])
      expect(result).toEqual([{ path: 'module.mjs' }])
    })

    test('filters .cjs files', () => {
      const files = [{ path: 'module.mjs' }, { path: 'index.js' }, { path: 'config.cjs' }]
      const result = filterByExtensions(files, ['.cjs'])
      expect(result).toEqual([{ path: 'config.cjs' }])
    })

    test('filters .json files', () => {
      const files = [
        { path: 'package.json' },
        { path: 'tsconfig.json' },
        { path: 'index.ts' },
        { path: 'README.md' },
      ]
      const result = filterByExtensions(files, ['.json'])
      expect(result).toEqual([{ path: 'package.json' }, { path: 'tsconfig.json' }])
    })

    test('filters .md files', () => {
      const files = [
        { path: 'README.md' },
        { path: 'CHANGELOG.md' },
        { path: 'index.ts' },
        { path: 'package.json' },
      ]
      const result = filterByExtensions(files, ['.md'])
      expect(result).toEqual([{ path: 'README.md' }, { path: 'CHANGELOG.md' }])
    })

    test('filters .css files', () => {
      const files = [
        { path: 'styles.css' },
        { path: 'index.ts' },
        { path: 'theme.css' },
        { path: 'README.md' },
      ]
      const result = filterByExtensions(files, ['.css'])
      expect(result).toEqual([{ path: 'styles.css' }, { path: 'theme.css' }])
    })

    test('filters .html files', () => {
      const files = [{ path: 'index.html' }, { path: 'index.ts' }, { path: 'about.html' }]
      const result = filterByExtensions(files, ['.html'])
      expect(result).toEqual([{ path: 'index.html' }, { path: 'about.html' }])
    })

    test('filters .vue files', () => {
      const files = [{ path: 'App.vue' }, { path: 'index.ts' }, { path: 'Header.vue' }]
      const result = filterByExtensions(files, ['.vue'])
      expect(result).toEqual([{ path: 'App.vue' }, { path: 'Header.vue' }])
    })

    test('filters .svelte files', () => {
      const files = [{ path: 'App.svelte' }, { path: 'index.ts' }, { path: 'Button.svelte' }]
      const result = filterByExtensions(files, ['.svelte'])
      expect(result).toEqual([{ path: 'App.svelte' }, { path: 'Button.svelte' }])
    })

    test('filters .py files', () => {
      const files = [{ path: 'main.py' }, { path: 'index.ts' }, { path: 'utils.py' }]
      const result = filterByExtensions(files, ['.py'])
      expect(result).toEqual([{ path: 'main.py' }, { path: 'utils.py' }])
    })

    test('filters .rb files', () => {
      const files = [{ path: 'app.rb' }, { path: 'index.ts' }, { path: 'helper.rb' }]
      const result = filterByExtensions(files, ['.rb'])
      expect(result).toEqual([{ path: 'app.rb' }, { path: 'helper.rb' }])
    })

    test('filters .go files', () => {
      const files = [{ path: 'main.go' }, { path: 'index.ts' }, { path: 'handler.go' }]
      const result = filterByExtensions(files, ['.go'])
      expect(result).toEqual([{ path: 'main.go' }, { path: 'handler.go' }])
    })

    test('filters .rs files', () => {
      const files = [{ path: 'main.rs' }, { path: 'index.ts' }, { path: 'lib.rs' }]
      const result = filterByExtensions(files, ['.rs'])
      expect(result).toEqual([{ path: 'main.rs' }, { path: 'lib.rs' }])
    })

    test('filters .yaml files', () => {
      const files = [{ path: 'config.yaml' }, { path: 'index.ts' }, { path: 'workflow.yml' }]
      const result = filterByExtensions(files, ['.yaml'])
      expect(result).toEqual([{ path: 'config.yaml' }])
    })

    test('filters .yml files', () => {
      const files = [{ path: 'config.yaml' }, { path: 'index.ts' }, { path: 'workflow.yml' }]
      const result = filterByExtensions(files, ['.yml'])
      expect(result).toEqual([{ path: 'workflow.yml' }])
    })

    test('filters .sh files', () => {
      const files = [{ path: 'setup.sh' }, { path: 'index.ts' }, { path: 'build.sh' }]
      const result = filterByExtensions(files, ['.sh'])
      expect(result).toEqual([{ path: 'setup.sh' }, { path: 'build.sh' }])
    })

    test('filters .txt files', () => {
      const files = [{ path: 'notes.txt' }, { path: 'index.ts' }, { path: 'log.txt' }]
      const result = filterByExtensions(files, ['.txt'])
      expect(result).toEqual([{ path: 'notes.txt' }, { path: 'log.txt' }])
    })

    test('filters .xml files', () => {
      const files = [{ path: 'pom.xml' }, { path: 'index.ts' }, { path: 'config.xml' }]
      const result = filterByExtensions(files, ['.xml'])
      expect(result).toEqual([{ path: 'pom.xml' }, { path: 'config.xml' }])
    })

    test('.TS uppercase extension matches .ts filter', () => {
      const files = [{ path: 'file.TS' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'file.TS' }])
    })

    test('.Js uppercase extension matches .js filter', () => {
      const files = [{ path: 'file.Js' }]
      const result = filterByExtensions(files, ['.js'])
      expect(result).toEqual([{ path: 'file.Js' }])
    })

    test('.JSON uppercase extension matches .json filter', () => {
      const files = [{ path: 'file.JSON' }]
      const result = filterByExtensions(files, ['.json'])
      expect(result).toEqual([{ path: 'file.JSON' }])
    })

    test('.MD uppercase extension matches .md filter', () => {
      const files = [{ path: 'README.MD' }]
      const result = filterByExtensions(files, ['.md'])
      expect(result).toEqual([{ path: 'README.MD' }])
    })

    test('.CSS uppercase extension matches .css filter', () => {
      const files = [{ path: 'styles.CSS' }]
      const result = filterByExtensions(files, ['.css'])
      expect(result).toEqual([{ path: 'styles.CSS' }])
    })

    test('.HTML uppercase extension matches .html filter', () => {
      const files = [{ path: 'index.HTML' }]
      const result = filterByExtensions(files, ['.html'])
      expect(result).toEqual([{ path: 'index.HTML' }])
    })

    test('mixed case path with .ts filter still matches', () => {
      const files = [{ path: 'src/Components/App.Ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/Components/App.Ts' }])
    })

    test('file with no extension does not match .ts', () => {
      const files = [{ path: 'Makefile' }, { path: 'Dockerfile' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('file starting with dot (.gitignore) has no ext matching .ts', () => {
      const files = [{ path: '.gitignore' }, { path: '.eslintrc' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('file with double dot (.d.ts) extracts .ts extension', () => {
      const files = [{ path: 'types/global.d.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'types/global.d.ts' }])
    })

    test('file with .spec.ts extracts .ts extension', () => {
      const files = [{ path: 'tests/unit.test.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'tests/unit.test.ts' }])
    })

    test('file with .spec.tsx extracts .tsx extension', () => {
      const files = [{ path: 'tests/component.spec.tsx' }]
      const result = filterByExtensions(files, ['.tsx'])
      expect(result).toEqual([{ path: 'tests/component.spec.tsx' }])
    })

    test('deeply nested path with .ts extension matches', () => {
      const files = [{ path: 'a/b/c/d/e/f/g/deep.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'a/b/c/d/e/f/g/deep.ts' }])
    })

    test('path with spaces in directory name', () => {
      const files = [{ path: 'my project/src/index.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'my project/src/index.ts' }])
    })

    test('path with spaces in filename', () => {
      const files = [{ path: 'src/my file.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/my file.ts' }])
    })

    test('file at root level with extension', () => {
      const files = [{ path: 'index.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'index.ts' }])
    })

    test('file at root level without extension', () => {
      const files = [{ path: 'Makefile' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('tar.gz file matches .gz not .tar.gz', () => {
      const files = [{ path: 'archive.tar.gz' }]
      const result = filterByExtensions(files, ['.gz'])
      expect(result).toEqual([{ path: 'archive.tar.gz' }])
    })

    test('tar.gz file does not match .tar', () => {
      const files = [{ path: 'archive.tar.gz' }]
      const result = filterByExtensions(files, ['.tar'])
      expect(result).toEqual([])
    })

    test('.config.js file matches .js', () => {
      const files = [{ path: 'prettier.config.js' }]
      const result = filterByExtensions(files, ['.js'])
      expect(result).toEqual([{ path: 'prettier.config.js' }])
    })

    test('file with path ending in dot', () => {
      const files = [{ path: 'file.' }]
      const result = filterByExtensions(files, ['.'])
      expect(result).toEqual([{ path: 'file.' }])
    })

    test('file ending in dot does not match .ts', () => {
      const files = [{ path: 'file.' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('path with unicode characters', () => {
      const files = [{ path: 'src/日本語/index.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/日本語/index.ts' }])
    })

    test('path with dashes in filename', () => {
      const files = [{ path: 'src/my-component.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/my-component.ts' }])
    })

    test('path with underscores in filename', () => {
      const files = [{ path: 'src/my_component.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/my_component.ts' }])
    })

    test('path with numbers in filename', () => {
      const files = [{ path: 'src/v2_utils.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/v2_utils.ts' }])
    })

    test('filters ts and js and tsx together', () => {
      const files = [
        { path: 'a.ts' },
        { path: 'b.js' },
        { path: 'c.tsx' },
        { path: 'd.jsx' },
        { path: 'e.md' },
        { path: 'f.json' },
      ]
      const result = filterByExtensions(files, ['.ts', '.js', '.tsx'])
      expect(result).toEqual([{ path: 'a.ts' }, { path: 'b.js' }, { path: 'c.tsx' }])
    })

    test('filters many extensions at once', () => {
      const files = [
        { path: 'a.ts' },
        { path: 'b.js' },
        { path: 'c.css' },
        { path: 'd.html' },
        { path: 'e.json' },
        { path: 'f.md' },
        { path: 'g.py' },
        { path: 'h.rs' },
      ]
      const result = filterByExtensions(files, ['.ts', '.js', '.css', '.html', '.json'])
      expect(result).toEqual([
        { path: 'a.ts' },
        { path: 'b.js' },
        { path: 'c.css' },
        { path: 'd.html' },
        { path: 'e.json' },
      ])
    })

    test('all files match returns all', () => {
      const files = [{ path: 'a.ts' }, { path: 'b.ts' }, { path: 'c.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual(files)
    })

    test('none match returns empty', () => {
      const files = [{ path: 'a.py' }, { path: 'b.rs' }, { path: 'c.go' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('single file matches', () => {
      const files = [{ path: 'index.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'index.ts' }])
    })

    test('single file does not match', () => {
      const files = [{ path: 'index.js' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('preserves order of matching files', () => {
      const files = [
        { path: 'z.ts' },
        { path: 'a.js' },
        { path: 'm.tsx' },
        { path: 'b.ts' },
        { path: 'c.md' },
      ]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'z.ts' }, { path: 'b.ts' }])
    })

    test('empty files array with null extensions returns empty array', () => {
      const result = filterByExtensions([], null)
      expect(result).toEqual([])
    })

    test('extension with leading dot required', () => {
      const files = [{ path: 'file.ts' }]
      const result = filterByExtensions(files, ['ts'])
      expect(result).toEqual([])
    })

    test('does not match partial extension name', () => {
      const files = [{ path: 'file.tsp' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('does not match extension appearing in middle of filename', () => {
      const files = [{ path: 'file.tsx' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('extension matching is exact after last dot', () => {
      const files = [{ path: 'file.test.ts' }, { path: 'file.ts.map' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'file.test.ts' }])
    })

    test('.map extension matches correctly', () => {
      const files = [{ path: 'file.ts.map' }, { path: 'file.js.map' }]
      const result = filterByExtensions(files, ['.map'])
      expect(result).toEqual([{ path: 'file.ts.map' }, { path: 'file.js.map' }])
    })

    test('large number of files filters correctly', () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        path: i % 2 === 0 ? `file${i}.ts` : `file${i}.js`,
      }))
      const result = filterByExtensions(files, ['.ts'])
      expect(result.length).toBe(50)
      expect(result.every((f) => f.path.endsWith('.ts'))).toBe(true)
    })

    test('duplicate paths are preserved', () => {
      const files = [{ path: 'index.ts' }, { path: 'index.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'index.ts' }, { path: 'index.ts' }])
    })

    test('path with query string style suffix', () => {
      const files = [{ path: 'file.ts?v=1' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('path with hash suffix', () => {
      const files = [{ path: 'file.ts#section' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('empty string path with .ts filter', () => {
      const files = [{ path: '' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('path that is just an extension .ts', () => {
      const files = [{ path: '.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([])
    })

    test('does not mutate input array', () => {
      const files = [{ path: 'a.ts' }, { path: 'b.js' }, { path: 'c.ts' }]
      const originalLength = files.length
      filterByExtensions(files, ['.ts'])
      expect(files.length).toBe(originalLength)
    })

    test('returns new array reference', () => {
      const files = [{ path: 'a.ts' }, { path: 'b.js' }]
      const result = filterByExtensions(files, ['.ts', '.js'])
      expect(result).not.toBe(files)
    })

    test('returns same object references', () => {
      const fileA = { path: 'a.ts' }
      const fileB = { path: 'b.js' }
      const files = [fileA, fileB]
      const result = filterByExtensions(files, ['.ts'])
      expect(result[0]).toBe(fileA)
    })

    test('.d.ts file matches .ts', () => {
      const files = [{ path: 'global.d.ts' }, { path: 'index.d.ts' }, { path: 'types.d.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([
        { path: 'global.d.ts' },
        { path: 'index.d.ts' },
        { path: 'types.d.ts' },
      ])
    })

    test('.min.js file matches .js', () => {
      const files = [{ path: 'vendor.min.js' }, { path: 'lodash.min.js' }]
      const result = filterByExtensions(files, ['.js'])
      expect(result).toEqual([{ path: 'vendor.min.js' }, { path: 'lodash.min.js' }])
    })

    test('filters .scss files', () => {
      const files = [{ path: 'styles.scss' }, { path: 'theme.scss' }, { path: 'index.ts' }]
      const result = filterByExtensions(files, ['.scss'])
      expect(result).toEqual([{ path: 'styles.scss' }, { path: 'theme.scss' }])
    })

    test('filters .less files', () => {
      const files = [{ path: 'styles.less' }, { path: 'index.ts' }]
      const result = filterByExtensions(files, ['.less'])
      expect(result).toEqual([{ path: 'styles.less' }])
    })

    test('filters .graphql files', () => {
      const files = [{ path: 'schema.graphql' }, { path: 'query.graphql' }, { path: 'index.ts' }]
      const result = filterByExtensions(files, ['.graphql'])
      expect(result).toEqual([{ path: 'schema.graphql' }, { path: 'query.graphql' }])
    })

    test('filters .prisma files', () => {
      const files = [{ path: 'schema.prisma' }, { path: 'index.ts' }]
      const result = filterByExtensions(files, ['.prisma'])
      expect(result).toEqual([{ path: 'schema.prisma' }])
    })

    test('filters .toml files', () => {
      const files = [{ path: 'Cargo.toml' }, { path: 'index.ts' }]
      const result = filterByExtensions(files, ['.toml'])
      expect(result).toEqual([{ path: 'Cargo.toml' }])
    })

    test('filters .lock files', () => {
      const files = [{ path: 'package-lock.json' }, { path: 'yarn.lock' }, { path: 'index.ts' }]
      const result = filterByExtensions(files, ['.lock'])
      expect(result).toEqual([{ path: 'yarn.lock' }])
    })

    test('filters .env files - no extension files', () => {
      const files = [{ path: '.env' }, { path: '.env.local' }]
      const result = filterByExtensions(files, ['.env'])
      expect(result).toEqual([])
    })

    test('multiple extensions some matching some not', () => {
      const files = [
        { path: 'a.ts' },
        { path: 'b.py' },
        { path: 'c.ts' },
        { path: 'd.rs' },
        { path: 'e.ts' },
      ]
      const result = filterByExtensions(files, ['.ts', '.py'])
      expect(result).toEqual([
        { path: 'a.ts' },
        { path: 'b.py' },
        { path: 'c.ts' },
        { path: 'e.ts' },
      ])
    })

    test('single extension in filter with single matching file', () => {
      const files = [{ path: 'only.ts' }, { path: 'not.py' }, { path: 'not.rs' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'only.ts' }])
    })

    test('filters .test.ts files by .ts extension', () => {
      const files = [{ path: 'foo.test.ts' }, { path: 'bar.spec.ts' }, { path: 'baz.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'foo.test.ts' }, { path: 'bar.spec.ts' }, { path: 'baz.ts' }])
    })

    test('filters .spec.jsx files by .jsx extension', () => {
      const files = [{ path: 'App.spec.jsx' }, { path: 'Button.test.jsx' }, { path: 'index.jsx' }]
      const result = filterByExtensions(files, ['.jsx'])
      expect(result).toEqual([
        { path: 'App.spec.jsx' },
        { path: 'Button.test.jsx' },
        { path: 'index.jsx' },
      ])
    })

    test('path with multiple slashes', () => {
      const files = [{ path: 'a/b/c/d/e/f.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'a/b/c/d/e/f.ts' }])
    })

    test('relative path with ./ prefix', () => {
      const files = [{ path: './src/index.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: './src/index.ts' }])
    })

    test('relative path with ../ prefix', () => {
      const files = [{ path: '../shared/utils.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: '../shared/utils.ts' }])
    })

    test('absolute path', () => {
      const files = [{ path: '/home/user/project/src/index.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: '/home/user/project/src/index.ts' }])
    })

    test('windows-style path', () => {
      const files = [{ path: 'src\\components\\App.tsx' }]
      const result = filterByExtensions(files, ['.tsx'])
      expect(result).toEqual([{ path: 'src\\components\\App.tsx' }])
    })

    test('path with parentheses in filename', () => {
      const files = [{ path: 'src/file (1).ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/file (1).ts' }])
    })

    test('path with brackets in filename', () => {
      const files = [{ path: 'src/[id].ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/[id].ts' }])
    })

    test('path with @ symbol', () => {
      const files = [{ path: 'src/@org/utils.ts' }]
      const result = filterByExtensions(files, ['.ts'])
      expect(result).toEqual([{ path: 'src/@org/utils.ts' }])
    })
  })
})
