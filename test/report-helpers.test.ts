import { describe, it, expect } from 'vitest'
import {
  createReporter,
  validateAnalysisResult,
  getPlatformOpenCommand,
  CUSTOM_REPORTER_PREFIX,
} from '../src/commands/report-helpers.js'

import type { AnalysisResult } from '../src/reporters/types.js'

// ─── CUSTOM_REPORTER_PREFIX ────────────────────────────
describe('CUSTOM_REPORTER_PREFIX', () => {
  it('is "custom:"', () => {
    expect(CUSTOM_REPORTER_PREFIX).toBe('custom:')
  })
})

// ─── validateAnalysisResult ────────────────────────────
describe('validateAnalysisResult', () => {
  const validResult: AnalysisResult = {
    files: [],
    summary: {
      errorCount: 0,
      filesWithViolations: 0,
      infoCount: 0,
      totalFiles: 0,
      totalTime: 100,
      warningCount: 0,
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }

  it('returns true for valid result', () => {
    expect(validateAnalysisResult(validResult)).toBe(true)
  })

  it('returns false when files is missing', () => {
    expect(validateAnalysisResult({ summary: validResult.summary, timestamp: validResult.timestamp } as never)).toBe(false)
  })

  it('returns false when summary is missing', () => {
    expect(validateAnalysisResult({ files: [], timestamp: validResult.timestamp } as never)).toBe(false)
  })

  it('returns false when timestamp is missing', () => {
    expect(validateAnalysisResult({ files: [], summary: validResult.summary } as never)).toBe(false)
  })

  it('returns false for empty object', () => {
    expect(validateAnalysisResult({} as never)).toBe(false)
  })

  it('returns true when all required fields present', () => {
    const minimal = { files: [], summary: {}, timestamp: '2024-01-01' }
    expect(validateAnalysisResult(minimal as never)).toBe(true)
  })
})

// ─── createReporter ────────────────────────────────────
describe('createReporter', () => {
  const opts = { format: 'console' as const }

  it('creates ConsoleReporter for console format', async () => {
    const reporter = await createReporter('console', opts)
    expect(reporter).toBeDefined()
  })

  it('creates JSONReporter for json format', async () => {
    const reporter = await createReporter('json', opts)
    expect(reporter).toBeDefined()
  })

  it('creates JUnitReporter for junit format', async () => {
    const reporter = await createReporter('junit', opts)
    expect(reporter).toBeDefined()
  })

  it('creates MarkdownReporter for markdown format', async () => {
    const reporter = await createReporter('markdown', opts)
    expect(reporter).toBeDefined()
  })

  it('creates SARIFReporter for sarif format', async () => {
    const reporter = await createReporter('sarif', opts)
    expect(reporter).toBeDefined()
  })

  it('creates HTMLReporter for html format', async () => {
    const reporter = await createReporter('html', opts)
    expect(reporter).toBeDefined()
  })

  it('creates GitLabReporter for gitlab format', async () => {
    const reporter = await createReporter('gitlab', opts)
    expect(reporter).toBeDefined()
  })

  it('creates CSVReporter for csv format', async () => {
    const reporter = await createReporter('csv', opts)
    expect(reporter).toBeDefined()
  })

  it('creates SonarQubeReporter for sonarqube format', async () => {
    const reporter = await createReporter('sonarqube', opts)
    expect(reporter).toBeDefined()
  })

  it('falls back to ConsoleReporter for unknown format', async () => {
    const reporter = await createReporter('unknown' as never, opts)
    expect(reporter).toBeDefined()
  })

  it('throws for custom format without path', async () => {
    await expect(createReporter('custom:' as never, opts)).rejects.toThrow()
  })

  it('throws for custom format with invalid module path', async () => {
    await expect(createReporter('custom:./nonexistent.js' as never, opts)).rejects.toThrow()
  })
})

// ─── getPlatformOpenCommand ────────────────────────────
describe('getPlatformOpenCommand', () => {
  it('returns open command for darwin', () => {
    expect(getPlatformOpenCommand('/path/to/file.html', 'darwin')).toBe('open "/path/to/file.html"')
  })

  it('returns start command for win32', () => {
    expect(getPlatformOpenCommand('/path/to/file.html', 'win32')).toBe('start "" "/path/to/file.html"')
  })

  it('returns xdg-open for linux', () => {
    expect(getPlatformOpenCommand('/path/to/file.html', 'linux')).toBe('xdg-open "/path/to/file.html"')
  })

  it('returns xdg-open as fallback for unknown platform', () => {
    expect(getPlatformOpenCommand('/path/to/file.html', 'freebsd')).toBe('xdg-open "/path/to/file.html"')
  })

  it('quotes the file path', () => {
    const result = getPlatformOpenCommand('/path/with spaces/file.html', 'darwin')
    expect(result).toContain('"/path/with spaces/file.html"')
  })
})
