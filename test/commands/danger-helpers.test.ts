import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CI_COMMAND,
  DEFAULT_OUTPUT_FILE,
  DEFAULT_RESULTS_FILE,
  generateDangerfileContent,
  resolveDangerOptions,
  validateDangerOutputPath,
} from '../../src/commands/danger-helpers.js'

// ─── Constants ───

describe('danger constants', () => {
  it('has expected default CI command', () => {
    expect(DEFAULT_CI_COMMAND).toContain('codeforge analyze')
  })

  it('has expected default output file', () => {
    expect(DEFAULT_OUTPUT_FILE).toBe('dangerfile.js')
  })

  it('has expected default results file', () => {
    expect(DEFAULT_RESULTS_FILE).toBe('codeforge-results.json')
  })
})

// ─── generateDangerfileContent ───

describe('generateDangerfileContent', () => {
  it('includes CI command in generated content', () => {
    const content = generateDangerfileContent({
      ciCommand: 'codeforge analyze --format json --output results.json',
      outputFile: 'dangerfile.js',
      resultsFile: 'results.json',
    })
    expect(content).toContain('codeforge analyze --format json --output results.json')
  })

  it('includes results file reference', () => {
    const content = generateDangerfileContent({
      ciCommand: 'codeforge analyze --format json --output my-results.json',
      outputFile: 'dangerfile.js',
      resultsFile: 'my-results.json',
    })
    expect(content).toContain('my-results.json')
  })

  it('extracts results file from ci command when not provided separately', () => {
    const content = generateDangerfileContent({
      ciCommand: 'codeforge analyze --output custom.json',
      outputFile: 'dangerfile.js',
      resultsFile: 'custom.json',
    })
    expect(content).toContain('custom.json')
  })

  it('contains danger.js API calls', () => {
    const content = generateDangerfileContent({
      ciCommand: DEFAULT_CI_COMMAND,
      outputFile: DEFAULT_OUTPUT_FILE,
      resultsFile: DEFAULT_RESULTS_FILE,
    })
    expect(content).toContain('fail(')
    expect(content).toContain('warn(')
  })
})

// ─── resolveDangerOptions ───

describe('resolveDangerOptions', () => {
  it('returns defaults when no flags set', () => {
    const result = resolveDangerOptions({})
    expect(result.ciCommand).toBe(DEFAULT_CI_COMMAND)
    expect(result.outputFile).toBe(DEFAULT_OUTPUT_FILE)
  })

  it('uses custom CI command from flags', () => {
    const result = resolveDangerOptions({ ciCommand: 'custom command' })
    expect(result.ciCommand).toBe('custom command')
  })

  it('uses custom CI command from ci-command flag', () => {
    const result = resolveDangerOptions({ 'ci-command': 'custom command' })
    expect(result.ciCommand).toBe('custom command')
  })

  it('uses custom output file from flags', () => {
    const result = resolveDangerOptions({ output: 'my-dangerfile.ts' })
    expect(result.outputFile).toBe('my-dangerfile.ts')
  })
})

// ─── validateDangerOutputPath ───

describe('validateDangerOutputPath', () => {
  it('accepts .js files', () => {
    expect(validateDangerOutputPath('dangerfile.js').valid).toBe(true)
  })

  it('accepts .ts files', () => {
    expect(validateDangerOutputPath('dangerfile.ts').valid).toBe(true)
  })

  it('accepts paths with directories', () => {
    expect(validateDangerOutputPath('path/to/dangerfile.js').valid).toBe(true)
  })

  it('rejects empty string', () => {
    const result = validateDangerOutputPath('')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('rejects whitespace-only string', () => {
    const result = validateDangerOutputPath('   ')
    expect(result.valid).toBe(false)
  })

  it('rejects non-js/ts extensions', () => {
    const result = validateDangerOutputPath('dangerfile.py')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('.js or .ts')
  })

  it('rejects files without extension', () => {
    const result = validateDangerOutputPath('dangerfile')
    expect(result.valid).toBe(false)
  })
})
