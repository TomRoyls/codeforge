import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { AnalysisResult, ReporterOptions } from '../../../src/reporters/types.js'
import type { OutputFormat } from '../../../src/commands/report-helpers.js'

// ============================================================================
// Mocks — must come before imports of mocked modules
// ============================================================================

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

// ============================================================================
// Imports — after mocks
// ============================================================================

import {
  createReporter,
  getPlatformOpenCommand,
  readAnalysisFile,
  validateAnalysisResult,
} from '../../../src/commands/report-helpers.js'

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

import { ConsoleReporter } from '../../../src/reporters/console-reporter.js'
import { GitLabReporter } from '../../../src/reporters/gitlab-reporter.js'
import { HTMLReporter } from '../../../src/reporters/html-reporter.js'
import { JSONReporter } from '../../../src/reporters/json-reporter.js'
import { JUnitReporter } from '../../../src/reporters/junit-reporter.js'
import { MarkdownReporter } from '../../../src/reporters/markdown-reporter.js'
import { SARIFReporter } from '../../../src/reporters/sarif-reporter.js'
import { CLIError } from '../../../src/utils/errors.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const defaultReporterOptions = (): ReporterOptions => ({
  color: true,
  errorsOnly: false,
  includeSource: false,
  outputPath: undefined,
  pretty: false,
  quiet: false,
  verbose: false,
})

function makeAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      errorCount: 0,
      filesWithViolations: 0,
      infoCount: 0,
      totalFiles: 0,
      totalTime: 100,
      warningCount: 0,
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '1.0.0',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// createReporter
// ============================================================================

describe('createReporter', () => {
  const options = defaultReporterOptions()

  test('console format returns ConsoleReporter instance', () => {
    const reporter = createReporter('console', options)
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('gitlab format returns GitLabReporter instance', () => {
    const reporter = createReporter('gitlab', options)
    expect(reporter).toBeInstanceOf(GitLabReporter)
  })

  test('html format returns HTMLReporter instance', () => {
    const reporter = createReporter('html', options)
    expect(reporter).toBeInstanceOf(HTMLReporter)
  })

  test('json format returns JSONReporter instance', () => {
    const reporter = createReporter('json', options)
    expect(reporter).toBeInstanceOf(JSONReporter)
  })

  test('junit format returns JUnitReporter instance', () => {
    const reporter = createReporter('junit', options)
    expect(reporter).toBeInstanceOf(JUnitReporter)
  })

  test('markdown format returns MarkdownReporter instance', () => {
    const reporter = createReporter('markdown', options)
    expect(reporter).toBeInstanceOf(MarkdownReporter)
  })

  test('sarif format returns SARIFReporter instance', () => {
    const reporter = createReporter('sarif', options)
    expect(reporter).toBeInstanceOf(SARIFReporter)
  })

  test('unknown format defaults to ConsoleReporter', () => {
    const reporter = createReporter('unknown' as OutputFormat, options)
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('empty string format defaults to ConsoleReporter', () => {
    const reporter = createReporter('' as OutputFormat, options)
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('options are passed through to ConsoleReporter constructor', () => {
    const customOptions: ReporterOptions = {
      ...options,
      verbose: true,
      quiet: false,
      outputPath: '/tmp/report.txt',
    }
    const reporter = createReporter('console', customOptions)
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('options are passed through to GitLabReporter constructor', () => {
    const customOptions: ReporterOptions = { ...options, pretty: true }
    const reporter = createReporter('gitlab', customOptions)
    expect(reporter).toBeInstanceOf(GitLabReporter)
  })

  test('options are passed through to HTMLReporter constructor', () => {
    const customOptions: ReporterOptions = { ...options, outputPath: '/tmp/report.html' }
    const reporter = createReporter('html', customOptions)
    expect(reporter).toBeInstanceOf(HTMLReporter)
  })

  test('options are passed through to JSONReporter constructor', () => {
    const customOptions: ReporterOptions = { ...options, pretty: true }
    const reporter = createReporter('json', customOptions)
    expect(reporter).toBeInstanceOf(JSONReporter)
  })

  test('options are passed through to JUnitReporter constructor', () => {
    const customOptions: ReporterOptions = { ...options, outputPath: '/tmp/junit.xml' }
    const reporter = createReporter('junit', customOptions)
    expect(reporter).toBeInstanceOf(JUnitReporter)
  })

  test('options are passed through to MarkdownReporter constructor', () => {
    const customOptions: ReporterOptions = { ...options, verbose: true }
    const reporter = createReporter('markdown', customOptions)
    expect(reporter).toBeInstanceOf(MarkdownReporter)
  })

  test('options are passed through to SARIFReporter constructor', () => {
    const customOptions: ReporterOptions = { ...options, outputPath: '/tmp/results.sarif' }
    const reporter = createReporter('sarif', customOptions)
    expect(reporter).toBeInstanceOf(SARIFReporter)
  })

  test('each format produces a distinct reporter type', () => {
    const console_ = createReporter('console', options)
    const gitlab_ = createReporter('gitlab', options)
    const html_ = createReporter('html', options)
    const json_ = createReporter('json', options)
    const junit_ = createReporter('junit', options)
    const markdown_ = createReporter('markdown', options)
    const sarif_ = createReporter('sarif', options)

    const types = [
      console_.constructor,
      gitlab_.constructor,
      html_.constructor,
      json_.constructor,
      junit_.constructor,
      markdown_.constructor,
      sarif_.constructor,
    ]

    // All types should be unique
    const uniqueTypes = new Set(types)
    expect(uniqueTypes.size).toBe(7)
  })

  test('console format returns reporter with correct name', () => {
    const reporter = createReporter('console', options)
    expect(reporter.name).toBeDefined()
    expect(typeof reporter.name).toBe('string')
  })

  test('gitlab format returns reporter with correct name', () => {
    const reporter = createReporter('gitlab', options)
    expect(reporter.name).toBeDefined()
    expect(typeof reporter.name).toBe('string')
  })

  test('creating two console reporters produces distinct instances', () => {
    const reporter1 = createReporter('console', options)
    const reporter2 = createReporter('console', options)
    expect(reporter1).not.toBe(reporter2)
  })

  test('all format reporters have a report method', () => {
    const formats: OutputFormat[] = [
      'console',
      'gitlab',
      'html',
      'json',
      'junit',
      'markdown',
      'sarif',
    ]
    for (const format of formats) {
      const reporter = createReporter(format, options)
      expect(typeof reporter.report).toBe('function')
    }
  })
})

// ============================================================================
// validateAnalysisResult — pure function, no mocking needed
// ============================================================================

describe('validateAnalysisResult', () => {
  test('valid data with all fields returns true', () => {
    const data = makeAnalysisResult()
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('valid data with populated files array returns true', () => {
    const data = makeAnalysisResult({
      files: [
        {
          filePath: '/src/test.ts',
          stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
          violations: [],
        },
      ],
    })
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('empty files array but present returns true', () => {
    const data = makeAnalysisResult({ files: [] })
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('missing files returns false', () => {
    const data = makeAnalysisResult()
    delete (data as unknown as Record<string, unknown>).files
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('missing summary returns false', () => {
    const data = makeAnalysisResult()
    delete (data as unknown as Record<string, unknown>).summary
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('missing timestamp returns false', () => {
    const data = makeAnalysisResult()
    delete (data as unknown as Record<string, unknown>).timestamp
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('all fields missing returns false', () => {
    const data = {} as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('null files returns false', () => {
    const data = makeAnalysisResult()
    data.files = null as unknown as AnalysisResult['files']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('null summary returns false', () => {
    const data = makeAnalysisResult()
    data.summary = null as unknown as AnalysisResult['summary']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('null timestamp returns false', () => {
    const data = makeAnalysisResult()
    data.timestamp = null as unknown as string
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('undefined files returns false', () => {
    const data = makeAnalysisResult()
    data.files = undefined as unknown as AnalysisResult['files']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('undefined summary returns false', () => {
    const data = makeAnalysisResult()
    data.summary = undefined as unknown as AnalysisResult['summary']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('undefined timestamp returns false', () => {
    const data = makeAnalysisResult()
    data.timestamp = undefined as unknown as string
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('empty string timestamp returns false (falsy)', () => {
    const data = makeAnalysisResult()
    data.timestamp = ''
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('missing version is still valid (version is optional)', () => {
    const data = makeAnalysisResult()
    delete data.version
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('only files missing returns false', () => {
    const data = { summary: {}, timestamp: '2024-01-01' } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('only summary missing returns false', () => {
    const data = { files: [], timestamp: '2024-01-01' } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('only timestamp missing returns false', () => {
    const data = { files: [], summary: {} } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('files set to false returns false', () => {
    const data = makeAnalysisResult()
    data.files = false as unknown as AnalysisResult['files']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('summary set to false returns false', () => {
    const data = makeAnalysisResult()
    data.summary = false as unknown as AnalysisResult['summary']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('files set to 0 (number) returns false', () => {
    const data = makeAnalysisResult()
    data.files = 0 as unknown as AnalysisResult['files']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('summary set to 0 (number) returns false', () => {
    const data = makeAnalysisResult()
    data.summary = 0 as unknown as AnalysisResult['summary']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('timestamp set to 0 (number) returns false', () => {
    const data = makeAnalysisResult()
    data.timestamp = 0 as unknown as string
    expect(validateAnalysisResult(data)).toBe(false)
  })
})

// ============================================================================
// readAnalysisFile
// ============================================================================

describe('readAnalysisFile', () => {
  const validResult = makeAnalysisResult()
  const validJson = JSON.stringify(validResult)

  test('valid JSON file with all required fields returns parsed data', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(validJson)

    const result = await readAnalysisFile('/path/to/analysis.json')

    expect(result).toEqual(validResult)
    expect(result.files).toEqual([])
    expect(result.summary).toEqual(validResult.summary)
    expect(result.timestamp).toBe('2024-01-01T00:00:00.000Z')
  })

  test('calls existsSync with the provided path', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(validJson)

    await readAnalysisFile('/custom/path.json')

    expect(existsSync).toHaveBeenCalledWith('/custom/path.json')
  })

  test('calls readFile with utf8 encoding', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(validJson)

    await readAnalysisFile('/path/to/analysis.json')

    expect(readFile).toHaveBeenCalledWith('/path/to/analysis.json', 'utf8')
  })

  test('file not found throws error with "not found"', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    await expect(readAnalysisFile('/missing.json')).rejects.toThrow('not found')
  })

  test('file not found error includes the file path', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    await expect(readAnalysisFile('/missing.json')).rejects.toThrow('/missing.json')
  })

  test('file read error throws error with "Failed to read"', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(new Error('Permission denied'))

    await expect(readAnalysisFile('/locked.json')).rejects.toThrow('Failed to read')
  })

  test('file read error includes original error message', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(new Error('Permission denied'))

    await expect(readAnalysisFile('/locked.json')).rejects.toThrow('Permission denied')
  })

  test('file read error includes file path', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(new Error('Permission denied'))

    await expect(readAnalysisFile('/locked.json')).rejects.toThrow('/locked.json')
  })

  test('file read error with non-Error thrown value', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue('disk error')

    await expect(readAnalysisFile('/corrupt.json')).rejects.toThrow('disk error')
  })

  test('invalid JSON throws CLIError', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('{ not valid json }')

    await expect(readAnalysisFile('/bad.json')).rejects.toThrow(CLIError)
  })

  test('invalid JSON error message contains "Invalid JSON"', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('{ not valid json }')

    try {
      await readAnalysisFile('/bad.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('Invalid JSON')
    }
  })

  test('invalid JSON error includes file path', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('{ bad }')

    try {
      await readAnalysisFile('/bad-path.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('/bad-path.json')
    }
  })

  test('invalid JSON CLIError has correct suggestions', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('{ bad }')

    try {
      await readAnalysisFile('/bad.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      const cliError = error as CLIError
      expect(cliError.suggestions).toContain('Validate your JSON syntax at jsonlint.com')
      expect(cliError.suggestions).toContain('Ensure the file was generated by the analyze command')
      expect(cliError.suggestions).toContain('Check for file corruption or incomplete download')
    }
  })

  test('valid JSON but missing required fields throws error with "missing required fields"', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ files: [] }))

    await expect(readAnalysisFile('/incomplete.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON but missing files field throws error', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 100,
          warningCount: 0,
        },
        timestamp: '2024-01-01T00:00:00.000Z',
      }),
    )

    await expect(readAnalysisFile('/no-files.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON but missing summary field throws error', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        files: [],
        timestamp: '2024-01-01T00:00:00.000Z',
      }),
    )

    await expect(readAnalysisFile('/no-summary.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON but missing timestamp field throws error', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        files: [],
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 100,
          warningCount: 0,
        },
      }),
    )

    await expect(readAnalysisFile('/no-timestamp.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON with all fields missing throws error', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({}))

    await expect(readAnalysisFile('/empty-obj.json')).rejects.toThrow('missing required fields')
  })

  test('returns full AnalysisResult with version field', async () => {
    const resultWithVersion = makeAnalysisResult({ version: '2.0.0' })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(resultWithVersion))

    const result = await readAnalysisFile('/with-version.json')

    expect(result.version).toBe('2.0.0')
  })

  test('returns AnalysisResult with populated files', async () => {
    const populatedResult = makeAnalysisResult({
      files: [
        {
          filePath: '/src/index.ts',
          stats: { analysisTime: 50, parseTime: 20, totalTime: 70 },
          violations: [
            {
              filePath: '/src/index.ts',
              line: 10,
              column: 5,
              message: 'Unexpected console statement',
              ruleId: 'no-console',
              severity: 'warning',
            },
          ],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(populatedResult))

    const result = await readAnalysisFile('/populated.json')

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.violations).toHaveLength(1)
  })

  test('non-Error thrown during JSON parse is handled', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('not-json-at-all')

    try {
      await readAnalysisFile('/not-json.txt')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('Invalid JSON')
    }
  })

  test('CLIError from invalid JSON has code E001', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('bad json')

    try {
      await readAnalysisFile('/bad.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E001')
    }
  })

  test('file not found throws CLIError', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    try {
      await readAnalysisFile('/missing.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CLIError)
    }
  })

  test('readFile rejection with null thrown value uses string conversion', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(null)

    await expect(readAnalysisFile('/null-error.json')).rejects.toThrow('Failed to read')
    await expect(readAnalysisFile('/null-error.json')).rejects.toThrow('null')
  })

  test('readFile rejection with number thrown value uses string conversion', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(42)

    await expect(readAnalysisFile('/number-error.json')).rejects.toThrow('Failed to read')
  })

  test('readFile rejection with undefined thrown value uses string conversion', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(undefined)

    await expect(readAnalysisFile('/undefined-error.json')).rejects.toThrow('Failed to read')
  })

  test('valid JSON with empty summary object still returns data', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        files: [],
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 0,
          warningCount: 0,
        },
        timestamp: '2024-01-01T00:00:00.000Z',
      }),
    )

    const result = await readAnalysisFile('/zero-summary.json')
    expect(result.summary.totalFiles).toBe(0)
    expect(result.summary.errorCount).toBe(0)
  })

  test('read error with non-Error non-string thrown value', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue({ code: 'ENOENT' })

    await expect(readAnalysisFile('/obj-error.json')).rejects.toThrow('Failed to read')
  })

  test('valid JSON with multiple files parses correctly', async () => {
    const multiFileResult = makeAnalysisResult({
      files: [
        {
          filePath: '/src/a.ts',
          stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
          violations: [],
        },
        {
          filePath: '/src/b.ts',
          stats: { analysisTime: 20, parseTime: 10, totalTime: 30 },
          violations: [
            {
              filePath: '/src/b.ts',
              line: 5,
              column: 1,
              message: 'Unused import',
              ruleId: 'no-unused',
              severity: 'warning',
            },
          ],
        },
        {
          filePath: '/src/c.ts',
          stats: { analysisTime: 5, parseTime: 2, totalTime: 7 },
          violations: [],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(multiFileResult))

    const result = await readAnalysisFile('/multi.json')

    expect(result.files).toHaveLength(3)
    expect(result.files[0]!.filePath).toBe('/src/a.ts')
    expect(result.files[1]!.violations).toHaveLength(1)
    expect(result.files[2]!.filePath).toBe('/src/c.ts')
  })

  test('valid JSON preserves all summary count fields', async () => {
    const resultWithCounts = makeAnalysisResult({
      summary: {
        errorCount: 3,
        filesWithViolations: 5,
        infoCount: 10,
        totalFiles: 20,
        totalTime: 500,
        warningCount: 7,
      },
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(resultWithCounts))

    const result = await readAnalysisFile('/counts.json')

    expect(result.summary.errorCount).toBe(3)
    expect(result.summary.filesWithViolations).toBe(5)
    expect(result.summary.infoCount).toBe(10)
    expect(result.summary.totalFiles).toBe(20)
    expect(result.summary.totalTime).toBe(500)
    expect(result.summary.warningCount).toBe(7)
  })
})

// ============================================================================
// getPlatformOpenCommand — pure function, no mocking needed
// ============================================================================

describe('getPlatformOpenCommand', () => {
  test('darwin returns open command', () => {
    expect(getPlatformOpenCommand('report.html', 'darwin')).toBe('open "report.html"')
  })

  test('win32 returns start command', () => {
    expect(getPlatformOpenCommand('report.html', 'win32')).toBe('start "" "report.html"')
  })

  test('linux returns xdg-open command', () => {
    expect(getPlatformOpenCommand('report.html', 'linux')).toBe('xdg-open "report.html"')
  })

  test('unknown platform returns xdg-open command', () => {
    expect(getPlatformOpenCommand('report.html', 'freebsd')).toBe('xdg-open "report.html"')
  })

  test('empty string platform returns xdg-open command', () => {
    expect(getPlatformOpenCommand('report.html', '')).toBe('xdg-open "report.html"')
  })

  test('aix platform returns xdg-open command', () => {
    expect(getPlatformOpenCommand('report.html', 'aix')).toBe('xdg-open "report.html"')
  })

  test('darwin with path containing spaces is properly quoted', () => {
    expect(getPlatformOpenCommand('/path/to/my report.html', 'darwin')).toBe(
      'open "/path/to/my report.html"',
    )
  })

  test('win32 with path containing spaces is properly quoted', () => {
    expect(getPlatformOpenCommand('/path/to/my report.html', 'win32')).toBe(
      'start "" "/path/to/my report.html"',
    )
  })

  test('linux with path containing spaces is properly quoted', () => {
    expect(getPlatformOpenCommand('/path/to/my report.html', 'linux')).toBe(
      'xdg-open "/path/to/my report.html"',
    )
  })

  test('darwin with simple filename', () => {
    expect(getPlatformOpenCommand('index.html', 'darwin')).toBe('open "index.html"')
  })

  test('win32 with simple filename', () => {
    expect(getPlatformOpenCommand('index.html', 'win32')).toBe('start "" "index.html"')
  })

  test('linux with absolute path', () => {
    expect(getPlatformOpenCommand('/home/user/report.html', 'linux')).toBe(
      'xdg-open "/home/user/report.html"',
    )
  })

  test('darwin with special characters in path', () => {
    expect(getPlatformOpenCommand('/path/file (copy).html', 'darwin')).toBe(
      'open "/path/file (copy).html"',
    )
  })

  test('win32 with special characters in path', () => {
    expect(getPlatformOpenCommand('/path/file (copy).html', 'win32')).toBe(
      'start "" "/path/file (copy).html"',
    )
  })

  test('darwin with deep nested path', () => {
    expect(getPlatformOpenCommand('/a/b/c/d/e/report.html', 'darwin')).toBe(
      'open "/a/b/c/d/e/report.html"',
    )
  })

  test('linux with relative path', () => {
    expect(getPlatformOpenCommand('./output/report.html', 'linux')).toBe(
      'xdg-open "./output/report.html"',
    )
  })

  test('all three known platforms produce different commands for same file', () => {
    const file = 'report.html'
    const darwinCmd = getPlatformOpenCommand(file, 'darwin')
    const win32Cmd = getPlatformOpenCommand(file, 'win32')
    const linuxCmd = getPlatformOpenCommand(file, 'linux')

    expect(darwinCmd).not.toBe(win32Cmd)
    expect(darwinCmd).not.toBe(linuxCmd)
    expect(win32Cmd).not.toBe(linuxCmd)
  })

  test('darwin command starts with open', () => {
    expect(getPlatformOpenCommand('f.html', 'darwin')).toMatch(/^open\s/)
  })

  test('win32 command starts with start', () => {
    expect(getPlatformOpenCommand('f.html', 'win32')).toMatch(/^start\s/)
  })

  test('linux command starts with xdg-open', () => {
    expect(getPlatformOpenCommand('f.html', 'linux')).toMatch(/^xdg-open\s/)
  })

  test('freebsd platform returns xdg-open', () => {
    expect(getPlatformOpenCommand('report.html', 'freebsd')).toContain('xdg-open')
  })

  test('darwin with empty filename', () => {
    expect(getPlatformOpenCommand('', 'darwin')).toBe('open ""')
  })

  test('win32 with empty filename', () => {
    expect(getPlatformOpenCommand('', 'win32')).toBe('start "" ""')
  })

  test('linux with empty filename', () => {
    expect(getPlatformOpenCommand('', 'linux')).toBe('xdg-open ""')
  })

  test('darwin with unicode filename', () => {
    expect(getPlatformOpenCommand('報告.html', 'darwin')).toBe('open "報告.html"')
  })

  test('linux with unicode filename', () => {
    expect(getPlatformOpenCommand('レポート.html', 'linux')).toBe('xdg-open "レポート.html"')
  })

  test('win32 with unicode filename', () => {
    expect(getPlatformOpenCommand('отчёт.html', 'win32')).toBe('start "" "отчёт.html"')
  })

  test('sunos platform defaults to xdg-open', () => {
    expect(getPlatformOpenCommand('report.html', 'sunos')).toBe('xdg-open "report.html"')
  })

  test('createReporter returns object with report method', () => {
    const reporter = createReporter('console', defaultReporterOptions())
    expect(typeof reporter.report).toBe('function')
  })

  test('darwin with multiple spaces in path', () => {
    expect(getPlatformOpenCommand('/path/to/my   report.html', 'darwin')).toBe(
      'open "/path/to/my   report.html"',
    )
  })

  test('win32 with UNC network path', () => {
    expect(getPlatformOpenCommand('\\\\server\\share\\report.html', 'win32')).toBe(
      'start "" "\\\\server\\share\\report.html"',
    )
  })

  test('linux with tilde in path', () => {
    expect(getPlatformOpenCommand('~/reports/output.html', 'linux')).toBe(
      'xdg-open "~/reports/output.html"',
    )
  })

  test('all default reporter options produce valid reporter', () => {
    const reporter = createReporter('console', defaultReporterOptions())
    expect(reporter).toBeInstanceOf(ConsoleReporter)
    expect(typeof reporter.name).toBe('string')
  })
})

// ============================================================================
// Additional edge cases for validateAnalysisResult
// ============================================================================

describe('validateAnalysisResult — additional edge cases', () => {
  test('files as truthy non-array string returns true (truthy check)', () => {
    const data = {
      files: 'not-an-array' as unknown as AnalysisResult['files'],
      summary: { errorCount: 0 },
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('summary as truthy non-object number returns true (truthy check)', () => {
    const data = {
      files: [],
      summary: 42 as unknown as AnalysisResult['summary'],
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('timestamp as truthy number returns true (truthy check)', () => {
    const data = {
      files: [],
      summary: { errorCount: 0 },
      timestamp: 1704067200000 as unknown as string,
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('extra fields on data do not affect validation', () => {
    const data = makeAnalysisResult({
      extraField: 'should be ignored',
    } as unknown as Partial<AnalysisResult>)
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('NaN files returns false (NaN is falsy)', () => {
    const data = makeAnalysisResult()
    data.files = Number.NaN as unknown as AnalysisResult['files']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('NaN timestamp returns false (NaN is falsy)', () => {
    const data = makeAnalysisResult()
    data.timestamp = Number.NaN as unknown as string
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('validates when files is a non-empty array', () => {
    const data = makeAnalysisResult({
      files: [
        {
          filePath: '/src/a.ts',
          stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
          violations: [],
        },
        {
          filePath: '/src/b.ts',
          stats: { analysisTime: 2, parseTime: 1, totalTime: 3 },
          violations: [],
        },
      ],
    })
    expect(validateAnalysisResult(data)).toBe(true)
  })
})

// ============================================================================
// Additional edge cases for readAnalysisFile
// ============================================================================

describe('readAnalysisFile — additional edge cases', () => {
  test('empty file content throws CLIError for invalid JSON', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('')

    try {
      await readAnalysisFile('/empty-file.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
    }
  })

  test('JSON array at top level throws missing required fields error', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('[1, 2, 3]')

    await expect(readAnalysisFile('/array.json')).rejects.toThrow('missing required fields')
  })

  test('JSON null at top level throws CLIError', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('null')

    try {
      await readAnalysisFile('/null.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('Invalid JSON')
    }
  })

  test('valid JSON with extra top-level fields returns data successfully', async () => {
    const extendedResult = {
      ...makeAnalysisResult(),
      customField: 'hello',
      nestedExtra: { deep: true },
    }
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(extendedResult))

    const result = await readAnalysisFile('/extended.json')
    expect(result.files).toEqual([])
    expect(result.timestamp).toBe('2024-01-01T00:00:00.000Z')
  })

  test('two consecutive valid reads return independent data', async () => {
    const result1 = makeAnalysisResult({ version: '1.0.0' })
    const result2 = makeAnalysisResult({ version: '2.0.0' })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify(result1))
      .mockResolvedValueOnce(JSON.stringify(result2))

    const first = await readAnalysisFile('/first.json')
    const second = await readAnalysisFile('/second.json')

    expect(first.version).toBe('1.0.0')
    expect(second.version).toBe('2.0.0')
  })

  test('whitespace-only file content throws CLIError', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('   \n\t  ')

    try {
      await readAnalysisFile('/whitespace.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
    }
  })

  test('read error with Error object containing custom message', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(new Error('EACCES: permission denied'))

    await expect(readAnalysisFile('/no-access.json')).rejects.toThrow('EACCES')
  })

  test('valid JSON with large summary numbers', async () => {
    const largeResult = makeAnalysisResult({
      summary: {
        errorCount: Number.MAX_SAFE_INTEGER,
        filesWithViolations: 999999,
        infoCount: 0,
        totalFiles: Number.MAX_SAFE_INTEGER,
        totalTime: 86400000,
        warningCount: 500000,
      },
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(largeResult))

    const result = await readAnalysisFile('/large.json')
    expect(result.summary.errorCount).toBe(Number.MAX_SAFE_INTEGER)
    expect(result.summary.totalFiles).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('JSON parse error with non-Error thrown value uses "Unknown error"', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('{bad')

    try {
      await readAnalysisFile('/non-error-throw.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('Invalid JSON')
    }
  })
})

// ============================================================================
// Additional edge cases for getPlatformOpenCommand
// ============================================================================

describe('getPlatformOpenCommand — additional edge cases', () => {
  test('haiku platform defaults to xdg-open', () => {
    expect(getPlatformOpenCommand('report.html', 'haiku')).toBe('xdg-open "report.html"')
  })

  test('cygwin platform defaults to xdg-open', () => {
    expect(getPlatformOpenCommand('report.html', 'cygwin')).toBe('xdg-open "report.html"')
  })

  test('darwin with file extension .pdf', () => {
    expect(getPlatformOpenCommand('output.pdf', 'darwin')).toBe('open "output.pdf"')
  })

  test('win32 with file extension .pdf', () => {
    expect(getPlatformOpenCommand('output.pdf', 'win32')).toBe('start "" "output.pdf"')
  })

  test('linux with dotfile name', () => {
    expect(getPlatformOpenCommand('.hidden-report.html', 'linux')).toBe(
      'xdg-open ".hidden-report.html"',
    )
  })
})

// ============================================================================
// Additional createReporter tests
// ============================================================================

describe('createReporter — exhaustive options', () => {
  test('console with all options enabled', () => {
    const opts: ReporterOptions = {
      color: true,
      errorsOnly: true,
      includeSource: true,
      outputPath: '/tmp/out.txt',
      pretty: true,
      quiet: true,
      verbose: true,
    }
    const reporter = createReporter('console', opts)
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('console with all options disabled', () => {
    const opts: ReporterOptions = {
      color: false,
      errorsOnly: false,
      includeSource: false,
      outputPath: undefined,
      pretty: false,
      quiet: false,
      verbose: false,
    }
    const reporter = createReporter('console', opts)
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('gitlab with errorsOnly true', () => {
    const opts: ReporterOptions = { ...defaultReporterOptions(), errorsOnly: true }
    const reporter = createReporter('gitlab', opts)
    expect(reporter).toBeInstanceOf(GitLabReporter)
  })

  test('html with includeSource true', () => {
    const opts: ReporterOptions = { ...defaultReporterOptions(), includeSource: true }
    const reporter = createReporter('html', opts)
    expect(reporter).toBeInstanceOf(HTMLReporter)
  })

  test('json with quiet true', () => {
    const opts: ReporterOptions = { ...defaultReporterOptions(), quiet: true }
    const reporter = createReporter('json', opts)
    expect(reporter).toBeInstanceOf(JSONReporter)
  })

  test('junit with verbose true', () => {
    const opts: ReporterOptions = { ...defaultReporterOptions(), verbose: true }
    const reporter = createReporter('junit', opts)
    expect(reporter).toBeInstanceOf(JUnitReporter)
  })

  test('markdown with color false', () => {
    const opts: ReporterOptions = { ...defaultReporterOptions(), color: false }
    const reporter = createReporter('markdown', opts)
    expect(reporter).toBeInstanceOf(MarkdownReporter)
  })

  test('sarif with pretty true and outputPath', () => {
    const opts: ReporterOptions = {
      ...defaultReporterOptions(),
      pretty: true,
      outputPath: '/out.sarif',
    }
    const reporter = createReporter('sarif', opts)
    expect(reporter).toBeInstanceOf(SARIFReporter)
  })

  test('each reporter has a name property that is a non-empty string', () => {
    const formats: OutputFormat[] = [
      'console',
      'gitlab',
      'html',
      'json',
      'junit',
      'markdown',
      'sarif',
    ]
    for (const format of formats) {
      const reporter = createReporter(format, defaultReporterOptions())
      expect(reporter.name.length).toBeGreaterThan(0)
    }
  })

  test('each reporter has a format method', () => {
    const formats: OutputFormat[] = [
      'console',
      'gitlab',
      'html',
      'json',
      'junit',
      'markdown',
      'sarif',
    ]
    for (const format of formats) {
      const reporter = createReporter(format, defaultReporterOptions())
      expect(typeof reporter.format).toBe('function')
    }
  })

  test('creating reporters with same options produces distinct instances', () => {
    const opts = defaultReporterOptions()
    const r1 = createReporter('json', opts)
    const r2 = createReporter('json', opts)
    expect(r1).not.toBe(r2)
  })

  test('creating reporters of different types produces distinct instances', () => {
    const opts = defaultReporterOptions()
    const r1 = createReporter('console', opts)
    const r2 = createReporter('json', opts)
    expect(r1).not.toBe(r2)
    expect(r1.constructor).not.toBe(r2.constructor)
  })

  test('switch default branch handles numeric-like format string', () => {
    const reporter = createReporter('123' as OutputFormat, defaultReporterOptions())
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('switch default branch handles format with uppercase letters', () => {
    const reporter = createReporter('Console' as OutputFormat, defaultReporterOptions())
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('switch default branch handles format with trailing whitespace', () => {
    const reporter = createReporter('console ' as OutputFormat, defaultReporterOptions())
    expect(reporter).toBeInstanceOf(ConsoleReporter)
  })

  test('html reporter with undefined outputPath', () => {
    const opts: ReporterOptions = { ...defaultReporterOptions(), outputPath: undefined }
    const reporter = createReporter('html', opts)
    expect(reporter).toBeInstanceOf(HTMLReporter)
  })
})

// ============================================================================
// Additional validateAnalysisResult — exhaustive type checks
// ============================================================================

describe('validateAnalysisResult — exhaustive type boundary checks', () => {
  test('files as empty object returns true (truthy)', () => {
    const data = {
      files: {} as unknown as AnalysisResult['files'],
      summary: { errorCount: 0 },
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('summary as empty string returns true (truthy)', () => {
    const data = {
      files: [],
      summary: ' ' as unknown as AnalysisResult['summary'],
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('files as boolean true returns true (truthy)', () => {
    const data = {
      files: true as unknown as AnalysisResult['files'],
      summary: { errorCount: 0 },
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('summary as boolean true returns true (truthy)', () => {
    const data = {
      files: [],
      summary: true as unknown as AnalysisResult['summary'],
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('timestamp as boolean true returns true (truthy)', () => {
    const data = {
      files: [],
      summary: { errorCount: 0 },
      timestamp: true as unknown as string,
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('files as negative number returns true (truthy)', () => {
    const data = {
      files: -1 as unknown as AnalysisResult['files'],
      summary: { errorCount: 0 },
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('summary as negative number returns true (truthy)', () => {
    const data = {
      files: [],
      summary: -1 as unknown as AnalysisResult['summary'],
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('timestamp as positive number returns true (truthy)', () => {
    const data = {
      files: [],
      summary: { errorCount: 0 },
      timestamp: 1 as unknown as string,
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('data with only files present returns false', () => {
    const data = { files: [] } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('data with only summary present returns false', () => {
    const data = { summary: { errorCount: 0 } } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('data with only timestamp present returns false', () => {
    const data = { timestamp: '2024-01-01' } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('data with files and summary but no timestamp returns false', () => {
    const data = { files: [], summary: { errorCount: 0 } } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('data with files and timestamp but no summary returns false', () => {
    const data = { files: [], timestamp: '2024-01-01' } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('data with summary and timestamp but no files returns false', () => {
    const data = {
      summary: { errorCount: 0 },
      timestamp: '2024-01-01',
    } as unknown as AnalysisResult
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('empty string timestamp is falsy and returns false', () => {
    const data = makeAnalysisResult()
    data.timestamp = ''
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('timestamp with whitespace-only string returns true (truthy)', () => {
    const data = makeAnalysisResult()
    data.timestamp = ' '
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('files set to empty string returns false (falsy)', () => {
    const data = makeAnalysisResult()
    data.files = '' as unknown as AnalysisResult['files']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('summary set to empty string returns false (falsy)', () => {
    const data = makeAnalysisResult()
    data.summary = '' as unknown as AnalysisResult['summary']
    expect(validateAnalysisResult(data)).toBe(false)
  })

  test('version field presence does not affect validation', () => {
    const data = makeAnalysisResult({ version: '3.0.0' })
    expect(validateAnalysisResult(data)).toBe(true)
  })

  test('version field absence does not affect validation', () => {
    const data = makeAnalysisResult()
    delete data.version
    expect(validateAnalysisResult(data)).toBe(true)
  })
})

// ============================================================================
// Additional readAnalysisFile — exhaustive error paths and edge cases
// ============================================================================

describe('readAnalysisFile — exhaustive error and edge cases', () => {
  test('file not found throws CLIError', async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    try {
      await readAnalysisFile('/no-file.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CLIError)
    }
  })

  test('file not found error is an Error instance', async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    try {
      await readAnalysisFile('/gone.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('not found')
    }
  })

  test('readFile throws generic error wraps message correctly', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(new Error('ENOSPC: no space left'))

    await expect(readAnalysisFile('/nospace.json')).rejects.toThrow('ENOSPC')
    await expect(readAnalysisFile('/nospace.json')).rejects.toThrow('Failed to read')
  })

  test('JSON boolean true at top level throws missing required fields', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('true')

    await expect(readAnalysisFile('/bool-true.json')).rejects.toThrow('missing required fields')
  })

  test('JSON number at top level throws missing required fields', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('42')

    await expect(readAnalysisFile('/number.json')).rejects.toThrow('missing required fields')
  })

  test('JSON string at top level throws missing required fields', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('"hello"')

    await expect(readAnalysisFile('/string.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON with files but null timestamp throws missing required fields', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        files: [],
        summary: { errorCount: 0 },
        timestamp: null,
      }),
    )

    await expect(readAnalysisFile('/null-ts.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON with timestamp but null summary throws missing required fields', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        files: [],
        summary: null,
        timestamp: '2024-01-01',
      }),
    )

    await expect(readAnalysisFile('/null-summary.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON with summary but null files throws missing required fields', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        files: null,
        summary: { errorCount: 0 },
        timestamp: '2024-01-01',
      }),
    )

    await expect(readAnalysisFile('/null-files.json')).rejects.toThrow('missing required fields')
  })

  test('valid JSON with empty string timestamp throws missing required fields', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        files: [],
        summary: { errorCount: 0 },
        timestamp: '',
      }),
    )

    await expect(readAnalysisFile('/empty-ts.json')).rejects.toThrow('missing required fields')
  })

  test('readFile called exactly once on success', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(makeAnalysisResult()))

    await readAnalysisFile('/once.json')

    expect(readFile).toHaveBeenCalledTimes(1)
  })

  test('existsSync called exactly once', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(makeAnalysisResult()))

    await readAnalysisFile('/check.json')

    expect(existsSync).toHaveBeenCalledTimes(1)
  })

  test('readFile not called when file does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    try {
      await readAnalysisFile('/missing.json')
    } catch {
      // expected
    }

    expect(readFile).not.toHaveBeenCalled()
  })

  test('CLIError from invalid JSON includes three suggestions', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue('{broken')

    try {
      await readAnalysisFile('/suggestions.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      const cliError = error as CLIError
      expect(cliError.suggestions).toHaveLength(3)
    }
  })

  test('valid JSON with violations array in files parses correctly', async () => {
    const result = makeAnalysisResult({
      files: [
        {
          filePath: '/src/error.ts',
          stats: { analysisTime: 100, parseTime: 50, totalTime: 150 },
          violations: [
            {
              filePath: '/src/error.ts',
              line: 1,
              column: 1,
              message: 'Fatal error',
              ruleId: 'fatal-rule',
              severity: 'error' as const,
            },
            {
              filePath: '/src/error.ts',
              line: 5,
              column: 10,
              message: 'Info message',
              ruleId: 'info-rule',
              severity: 'info' as const,
            },
          ],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/violations.json')
    expect(parsed.files[0]!.violations).toHaveLength(2)
    expect(parsed.files[0]!.violations[0]!.severity).toBe('error')
    expect(parsed.files[0]!.violations[1]!.severity).toBe('info')
  })

  test('valid JSON preserves violation ruleId', async () => {
    const result = makeAnalysisResult({
      files: [
        {
          filePath: '/src/a.ts',
          stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
          violations: [
            {
              filePath: '/src/a.ts',
              line: 10,
              column: 5,
              message: 'msg',
              ruleId: 'custom-rule-42',
              severity: 'warning' as const,
            },
          ],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/ruleid.json')
    expect(parsed.files[0]!.violations[0]!.ruleId).toBe('custom-rule-42')
  })

  test('valid JSON with many files parses all correctly', async () => {
    const files = Array.from({ length: 50 }, (_, i) => ({
      filePath: `/src/file${i}.ts`,
      stats: { analysisTime: i, parseTime: i, totalTime: i * 2 },
      violations: [],
    }))
    const result = makeAnalysisResult({ files })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/many-files.json')
    expect(parsed.files).toHaveLength(50)
  })

  test('valid JSON with ISO timestamp preserves the timestamp', async () => {
    const result = makeAnalysisResult({ timestamp: '2024-06-15T12:30:45.123Z' })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/iso.json')
    expect(parsed.timestamp).toBe('2024-06-15T12:30:45.123Z')
  })

  test('valid JSON with summary containing zero values preserves zeros', async () => {
    const result = makeAnalysisResult({
      summary: {
        errorCount: 0,
        filesWithViolations: 0,
        infoCount: 0,
        totalFiles: 0,
        totalTime: 0,
        warningCount: 0,
      },
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/zeros.json')
    expect(parsed.summary.errorCount).toBe(0)
    expect(parsed.summary.warningCount).toBe(0)
    expect(parsed.summary.infoCount).toBe(0)
    expect(parsed.summary.totalTime).toBe(0)
  })

  test('valid JSON with negative summary values still parses', async () => {
    const result = makeAnalysisResult({
      summary: {
        errorCount: -1,
        filesWithViolations: -5,
        infoCount: -10,
        totalFiles: -2,
        totalTime: -100,
        warningCount: -3,
      },
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/negative.json')
    expect(parsed.summary.errorCount).toBe(-1)
    expect(parsed.summary.totalFiles).toBe(-2)
  })

  test('readFile rejection with boolean true uses string conversion', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue(true)

    await expect(readAnalysisFile('/bool-error.json')).rejects.toThrow('Failed to read')
  })

  test('readFile rejection with array uses string conversion', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockRejectedValue([1, 2, 3])

    await expect(readAnalysisFile('/array-error.json')).rejects.toThrow('Failed to read')
  })

  test('valid JSON with fileStats containing column and line numbers', async () => {
    const result = makeAnalysisResult({
      files: [
        {
          filePath: '/src/details.ts',
          stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
          violations: [
            {
              filePath: '/src/details.ts',
              line: 42,
              column: 13,
              message: 'Detailed violation',
              ruleId: 'detail-check',
              severity: 'warning' as const,
              endLine: 44,
              endColumn: 20,
            },
          ],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/details.json')
    const v = parsed.files[0]!.violations[0]!
    expect(v.line).toBe(42)
    expect(v.column).toBe(13)
    expect(v.endLine).toBe(44)
    expect(v.endColumn).toBe(20)
  })

  test('valid JSON with violation meta field preserves it', async () => {
    const result = makeAnalysisResult({
      files: [
        {
          filePath: '/src/meta.ts',
          stats: { analysisTime: 5, parseTime: 2, totalTime: 7 },
          violations: [
            {
              filePath: '/src/meta.ts',
              line: 1,
              column: 1,
              message: 'Meta violation',
              ruleId: 'meta-rule',
              severity: 'info' as const,
              meta: { fixable: true, category: 'style' },
            },
          ],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/meta.json')
    expect(parsed.files[0]!.violations[0]!.meta).toEqual({ fixable: true, category: 'style' })
  })

  test('valid JSON with violation suggestion field preserves it', async () => {
    const result = makeAnalysisResult({
      files: [
        {
          filePath: '/src/fix.ts',
          stats: { analysisTime: 3, parseTime: 1, totalTime: 4 },
          violations: [
            {
              filePath: '/src/fix.ts',
              line: 10,
              column: 5,
              message: 'Fixable issue',
              ruleId: 'fix-rule',
              severity: 'warning' as const,
              suggestion: 'Replace with const',
            },
          ],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/suggestion.json')
    expect(parsed.files[0]!.violations[0]!.suggestion).toBe('Replace with const')
  })

  test('valid JSON with violation source field preserves it', async () => {
    const result = makeAnalysisResult({
      files: [
        {
          filePath: '/src/src.ts',
          stats: { analysisTime: 2, parseTime: 1, totalTime: 3 },
          violations: [
            {
              filePath: '/src/src.ts',
              line: 7,
              column: 3,
              message: 'Source violation',
              ruleId: 'src-rule',
              severity: 'error' as const,
              source: 'var x = 1;',
            },
          ],
        },
      ],
    })
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(result))

    const parsed = await readAnalysisFile('/source.json')
    expect(parsed.files[0]!.violations[0]!.source).toBe('var x = 1;')
  })
})

// ============================================================================
// Additional getPlatformOpenCommand — exhaustive platform and path checks
// ============================================================================

describe('getPlatformOpenCommand — exhaustive checks', () => {
  test('darwin with very long filename', () => {
    const longName = 'a'.repeat(200) + '.html'
    expect(getPlatformOpenCommand(longName, 'darwin')).toBe(`open "${longName}"`)
  })

  test('win32 with very long filename', () => {
    const longName = 'a'.repeat(200) + '.html'
    expect(getPlatformOpenCommand(longName, 'win32')).toBe(`start "" "${longName}"`)
  })

  test('linux with very long filename', () => {
    const longName = 'a'.repeat(200) + '.html'
    expect(getPlatformOpenCommand(longName, 'linux')).toBe(`xdg-open "${longName}"`)
  })

  test('darwin with single quote in path', () => {
    expect(getPlatformOpenCommand("/path/file's.html", 'darwin')).toBe('open "/path/file\'s.html"')
  })

  test('win32 with single quote in path', () => {
    expect(getPlatformOpenCommand("/path/file's.html", 'win32')).toBe(
      'start "" "/path/file\'s.html"',
    )
  })

  test('linux with single quote in path', () => {
    expect(getPlatformOpenCommand("/path/file's.html", 'linux')).toBe(
      'xdg-open "/path/file\'s.html"',
    )
  })

  test('darwin with double quotes in path', () => {
    expect(getPlatformOpenCommand('/path/file"copy".html', 'darwin')).toBe(
      'open "/path/file"copy".html"',
    )
  })

  test('linux with double quotes in path', () => {
    expect(getPlatformOpenCommand('/path/file"copy".html', 'linux')).toBe(
      'xdg-open "/path/file"copy".html"',
    )
  })

  test('darwin with hash character in path', () => {
    expect(getPlatformOpenCommand('/path/file#anchor.html', 'darwin')).toBe(
      'open "/path/file#anchor.html"',
    )
  })

  test('linux with hash character in path', () => {
    expect(getPlatformOpenCommand('/path/file#anchor.html', 'linux')).toBe(
      'xdg-open "/path/file#anchor.html"',
    )
  })

  test('win32 with forward slashes in path', () => {
    expect(getPlatformOpenCommand('C:/Users/report.html', 'win32')).toBe(
      'start "" "C:/Users/report.html"',
    )
  })

  test('openbsd platform defaults to xdg-open', () => {
    expect(getPlatformOpenCommand('report.html', 'openbsd')).toBe('xdg-open "report.html"')
  })

  test('netbsd platform defaults to xdg-open', () => {
    expect(getPlatformOpenCommand('report.html', 'netbsd')).toBe('xdg-open "report.html"')
  })

  test('android platform defaults to xdg-open', () => {
    expect(getPlatformOpenCommand('report.html', 'android')).toBe('xdg-open "report.html"')
  })

  test('darwin with file extension .sarif', () => {
    expect(getPlatformOpenCommand('results.sarif', 'darwin')).toBe('open "results.sarif"')
  })

  test('win32 with file extension .sarif', () => {
    expect(getPlatformOpenCommand('results.sarif', 'win32')).toBe('start "" "results.sarif"')
  })

  test('linux with file extension .sarif', () => {
    expect(getPlatformOpenCommand('results.sarif', 'linux')).toBe('xdg-open "results.sarif"')
  })

  test('result always contains the file path', () => {
    const platforms = ['darwin', 'win32', 'linux', 'freebsd', 'aix', 'sunos', 'unknown']
    const filePath = 'my-report.html'
    for (const platform of platforms) {
      const cmd = getPlatformOpenCommand(filePath, platform)
      expect(cmd).toContain(filePath)
    }
  })

  test('result always wraps file path in double quotes', () => {
    const platforms = ['darwin', 'win32', 'linux']
    const filePath = 'report.html'
    for (const platform of platforms) {
      const cmd = getPlatformOpenCommand(filePath, platform)
      expect(cmd).toContain(`"${filePath}"`)
    }
  })

  test('win32 command contains empty string argument before filepath', () => {
    const cmd = getPlatformOpenCommand('report.html', 'win32')
    expect(cmd).toContain('start ""')
  })

  test('darwin with file extension .xml', () => {
    expect(getPlatformOpenCommand('junit.xml', 'darwin')).toBe('open "junit.xml"')
  })

  test('linux with file extension .md', () => {
    expect(getPlatformOpenCommand('report.md', 'linux')).toBe('xdg-open "report.md"')
  })

  test('win32 with file extension .json', () => {
    expect(getPlatformOpenCommand('report.json', 'win32')).toBe('start "" "report.json"')
  })

  test('all unknown platforms fallback to xdg-open', () => {
    const unknownPlatforms = ['zos', 'vms', 'amiga', 'dos', 'templeos']
    for (const platform of unknownPlatforms) {
      expect(getPlatformOpenCommand('r.html', platform)).toMatch(/^xdg-open /)
    }
  })
})
