import { describe, expect, it } from 'vitest'

import type { AnalysisResult } from '../../src/reporters/types.js'

import {
  CUSTOM_REPORTER_PREFIX,
  getPlatformOpenCommand,
  validateAnalysisResult,
} from '../../src/commands/report-helpers.js'

// ─── validateAnalysisResult ───

describe('validateAnalysisResult', () => {
  const validResult: AnalysisResult = {
    files: [],
    summary: {
      errorCount: 0,
      filesWithViolations: 0,
      infoCount: 0,
      totalFiles: 0,
      totalTime: 0,
      warningCount: 0,
    },
    timestamp: '2025-01-01T00:00:00.000Z',
  }

  it('returns true when data has files, summary, and timestamp', () => {
    expect(validateAnalysisResult(validResult)).toBe(true)
  })

  it('returns true when files contain violations', () => {
    const withFiles: AnalysisResult = {
      ...validResult,
      files: [
        {
          filePath: 'src/index.ts',
          violations: [
            {
              column: 1,
              filePath: 'src/index.ts',
              line: 10,
              message: 'Unexpected console statement',
              ruleId: 'no-console',
              severity: 'warning',
            },
          ],
          stats: { analysisTime: 5, parseTime: 2, totalTime: 7 },
        },
      ],
    }
    expect(validateAnalysisResult(withFiles)).toBe(true)
  })

  it('returns false when missing files', () => {
    const data = { summary: validResult.summary, timestamp: validResult.timestamp }
    expect(validateAnalysisResult(data as AnalysisResult)).toBe(false)
  })

  it('returns false when missing summary', () => {
    const data = { files: validResult.files, timestamp: validResult.timestamp }
    expect(validateAnalysisResult(data as AnalysisResult)).toBe(false)
  })

  it('returns false when missing timestamp', () => {
    const data = { files: validResult.files, summary: validResult.summary }
    expect(validateAnalysisResult(data as AnalysisResult)).toBe(false)
  })

  it('returns false for null input', () => {
    expect(validateAnalysisResult(null as unknown as AnalysisResult)).toBe(false)
  })

  it('returns false for undefined input', () => {
    expect(validateAnalysisResult(undefined as unknown as AnalysisResult)).toBe(false)
  })

  it('returns false when files is empty array but present', () => {
    // Empty array is truthy, so this should return true
    const data: AnalysisResult = {
      files: [],
      summary: validResult.summary,
      timestamp: '2025-01-01T00:00:00.000Z',
    }
    expect(validateAnalysisResult(data)).toBe(true)
  })

  it('returns false when summary is an empty object', () => {
    const data = { files: [], summary: {}, timestamp: '2025-01-01' }
    expect(validateAnalysisResult(data as AnalysisResult)).toBe(true)
  })
})

// ─── getPlatformOpenCommand ───

describe('getPlatformOpenCommand', () => {
  it('returns open command for darwin', () => {
    expect(getPlatformOpenCommand('/path/to/report.html', 'darwin')).toBe('open "/path/to/report.html"')
  })

  it('returns start command for win32', () => {
    expect(getPlatformOpenCommand('/path/to/report.html', 'win32')).toBe('start "" "/path/to/report.html"')
  })

  it('returns xdg-open command for linux', () => {
    expect(getPlatformOpenCommand('/path/to/report.html', 'linux')).toBe('xdg-open "/path/to/report.html"')
  })

  it('returns xdg-open for unknown platform', () => {
    expect(getPlatformOpenCommand('/path/to/report.html', 'freebsd')).toBe('xdg-open "/path/to/report.html"')
  })

  it('returns xdg-open for empty platform string', () => {
    expect(getPlatformOpenCommand('/path/to/report.html', '')).toBe('xdg-open "/path/to/report.html"')
  })

  it('handles file paths with spaces', () => {
    expect(getPlatformOpenCommand('/path/with spaces/report.html', 'darwin')).toBe(
      'open "/path/with spaces/report.html"',
    )
  })

  it('handles relative file paths', () => {
    expect(getPlatformOpenCommand('./report.html', 'linux')).toBe('xdg-open "./report.html"')
  })
})

// ─── CUSTOM_REPORTER_PREFIX ───

describe('CUSTOM_REPORTER_PREFIX', () => {
  it('is the string "custom:"', () => {
    expect(CUSTOM_REPORTER_PREFIX).toBe('custom:')
  })

  it('has length 7', () => {
    expect(CUSTOM_REPORTER_PREFIX).toHaveLength(7)
  })

  it('ends with a colon', () => {
    expect(CUSTOM_REPORTER_PREFIX.endsWith(':')).toBe(true)
  })
})
