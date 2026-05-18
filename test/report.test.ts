import { describe, it, expect } from 'vitest'
import {
  CUSTOM_REPORTER_PREFIX,
  getPlatformOpenCommand,
  validateAnalysisResult,
} from '../src/commands/report-helpers.js'
import type { AnalysisResult } from '../src/reporters/types.js'

// ─── validateAnalysisResult ──────────────────────────
describe('validateAnalysisResult', () => {
  it('returns true for valid analysis result', () => {
    const data: AnalysisResult = {
      files: [],
      summary: {
        errorCount: 0,
        filesWithViolations: 0,
        infoCount: 0,
        totalFiles: 0,
        totalTime: 0,
        warningCount: 0,
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }

    expect(validateAnalysisResult(data)).toBe(true)
  })

  it('returns false when files is missing', () => {
    const data = {
      summary: { errorCount: 0 },
      timestamp: new Date().toISOString(),
    }

    expect(validateAnalysisResult(data as any)).toBe(false)
  })

  it('returns false when summary is missing', () => {
    const data = {
      files: [],
      timestamp: new Date().toISOString(),
    }

    expect(validateAnalysisResult(data as any)).toBe(false)
  })

  it('returns false when timestamp is missing', () => {
    const data = {
      files: [],
      summary: { errorCount: 0 },
    }

    expect(validateAnalysisResult(data as any)).toBe(false)
  })

  it('returns false for empty object', () => {
    expect(validateAnalysisResult({} as any)).toBe(false)
  })
})

// ─── getPlatformOpenCommand ──────────────────────────
describe('getPlatformOpenCommand', () => {
  it('returns open command for darwin', () => {
    const cmd = getPlatformOpenCommand('/path/to/report.html', 'darwin')

    expect(cmd).toContain('open')
    expect(cmd).toContain('/path/to/report.html')
  })

  it('returns start command for win32', () => {
    const cmd = getPlatformOpenCommand('/path/to/report.html', 'win32')

    expect(cmd).toContain('start')
    expect(cmd).toContain('/path/to/report.html')
  })

  it('returns xdg-open for linux', () => {
    const cmd = getPlatformOpenCommand('/path/to/report.html', 'linux')

    expect(cmd).toContain('xdg-open')
    expect(cmd).toContain('/path/to/report.html')
  })

  it('defaults to xdg-open for unknown platforms', () => {
    const cmd = getPlatformOpenCommand('/path/to/report.html', 'freebsd')

    expect(cmd).toContain('xdg-open')
  })
})

// ─── CUSTOM_REPORTER_PREFIX ──────────────────────────
describe('CUSTOM_REPORTER_PREFIX', () => {
  it('has the expected value', () => {
    expect(CUSTOM_REPORTER_PREFIX).toBe('custom:')
  })
})
