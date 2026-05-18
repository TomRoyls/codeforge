import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('analyze module', () => {
  it('exports the Analyze class as default', async () => {
    const mod = await import('../src/commands/analyze.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Analyze class has static description', async () => {
    const mod = await import('../src/commands/analyze.js')
    expect(mod.default.description).toBe('Analyze code for violations and issues')
  })

  it('Analyze class has static flags defined', async () => {
    const mod = await import('../src/commands/analyze.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.ci).toBeDefined()
    expect(mod.default.flags.format).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
    expect(mod.default.flags.fix).toBeDefined()
    expect(mod.default.flags.staged).toBeDefined()
    expect(mod.default.flags.concurrency).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
  })

  it('Analyze class has static args defined', async () => {
    const mod = await import('../src/commands/analyze.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  it('Analyze class has static examples', async () => {
    const mod = await import('../src/commands/analyze.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Exports ──────────────────────────────────────
describe('analyze type interfaces', () => {
  it('AnalysisSummary shape is valid', () => {
    const summary = {
      duration: 123.45,
      errors: 2,
      info: 10,
      totalFiles: 5,
      totalViolations: 15,
      warnings: 3,
    }
    expect(summary.duration).toBe(123.45)
    expect(summary.errors).toBe(2)
    expect(summary.totalViolations).toBe(15)
  })

  it('FileReport shape is valid', () => {
    const report = {
      filePath: 'src/test.ts',
      violations: [],
    }
    expect(report.filePath).toBe('src/test.ts')
    expect(report.violations).toHaveLength(0)
  })

  it('FailedFile shape is valid', () => {
    const failed = {
      error: 'parse error',
      filePath: 'src/bad.ts',
    }
    expect(failed.error).toBe('parse error')
    expect(failed.filePath).toBe('src/bad.ts')
  })

  it('AnalysisResult shape is valid', () => {
    const result = {
      allViolations: [],
      failedFiles: [],
      fileReports: [],
    }
    expect(result.allViolations).toHaveLength(0)
    expect(result.failedFiles).toHaveLength(0)
    expect(result.fileReports).toHaveLength(0)
  })

  it('FixResult shape is valid', () => {
    const fixResult = {
      fixesApplied: 5,
      fixesSkipped: 1,
    }
    expect(fixResult.fixesApplied).toBe(5)
    expect(fixResult.fixesSkipped).toBe(1)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Analyze static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/analyze.js')
    expect(mod.default.flags.format.default).toBe('console')
    expect(mod.default.flags['fail-on-warnings'].default).toBe(false)
    expect(mod.default.flags.fix.default).toBe(false)
    expect(mod.default.flags.staged.default).toBe(false)
    expect(mod.default.flags.verbose.default).toBe(false)
    expect(mod.default.flags.quiet.default).toBe(false)
  })

  it('has correct flag options for format', async () => {
    const mod = await import('../src/commands/analyze.js')
    const formatOptions = mod.default.flags.format.options
    expect(formatOptions).toContain('console')
    expect(formatOptions).toContain('json')
    expect(formatOptions).toContain('html')
    expect(formatOptions).toContain('junit')
    expect(formatOptions).toContain('sarif')
  })

  it('has severity-level flag with correct options', async () => {
    const mod = await import('../src/commands/analyze.js')
    const severityOptions = mod.default.flags['severity-level'].options
    expect(severityOptions).toContain('error')
    expect(severityOptions).toContain('warning')
    expect(severityOptions).toContain('info')
  })

  it('has baseline flag with correct options', async () => {
    const mod = await import('../src/commands/analyze.js')
    const baselineOptions = mod.default.flags.baseline.options
    expect(baselineOptions).toContain('compare')
    expect(baselineOptions).toContain('save')
  })

  it('has profile flag with correct options', async () => {
    const mod = await import('../src/commands/analyze.js')
    const profileOptions = mod.default.flags.profile.options
    expect(profileOptions).toContain('strict')
    expect(profileOptions).toContain('moderate')
    expect(profileOptions).toContain('lenient')
  })

  it('has args with correct default', async () => {
    const mod = await import('../src/commands/analyze.js')
    expect(mod.default.args.path.default).toBe('.')
  })

  it('has examples with command and description', async () => {
    const mod = await import('../src/commands/analyze.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
