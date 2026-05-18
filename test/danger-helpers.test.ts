import { describe, it, expect } from 'vitest'
import {
  DEFAULT_CI_COMMAND,
  DEFAULT_OUTPUT_FILE,
  DEFAULT_RESULTS_FILE,
  generateDangerfileContent,
  resolveDangerOptions,
  validateDangerOutputPath,
  displayDangerNextSteps,
} from '../src/commands/danger-helpers.js'

// ─── Constants ────────────────────────────────────────
describe('danger-helpers constants', () => {
  it('DEFAULT_CI_COMMAND contains expected analyze command', () => {
    expect(DEFAULT_CI_COMMAND).toContain('codeforge analyze')
    expect(DEFAULT_CI_COMMAND).toContain('--format json')
  })

  it('DEFAULT_OUTPUT_FILE is dangerfile.js', () => {
    expect(DEFAULT_OUTPUT_FILE).toBe('dangerfile.js')
  })

  it('DEFAULT_RESULTS_FILE is codeforge-results.json', () => {
    expect(DEFAULT_RESULTS_FILE).toBe('codeforge-results.json')
  })
})

// ─── generateDangerfileContent ────────────────────────
describe('generateDangerfileContent', () => {
  it('generates content with default options', () => {
    const content = generateDangerfileContent({
      ciCommand: DEFAULT_CI_COMMAND,
      outputFile: DEFAULT_OUTPUT_FILE,
      resultsFile: DEFAULT_RESULTS_FILE,
    })
    expect(content).toContain('execSync')
    expect(content).toContain('codeforge analyze')
    expect(content).toContain('CodeForge Dangerfile Integration')
  })

  it('includes the CI command in generated content', () => {
    const content = generateDangerfileContent({
      ciCommand: 'custom-command --flag',
      outputFile: 'output.js',
      resultsFile: 'results.json',
    })
    expect(content).toContain('custom-command --flag')
  })

  it('extracts results file from ci command --output flag', () => {
    const content = generateDangerfileContent({
      ciCommand: 'codeforge analyze --output custom-results.json',
      outputFile: 'dangerfile.js',
      resultsFile: 'custom-results.json',
    })
    expect(content).toContain('custom-results.json')
  })

  it('uses default results file when --output not in ci command', () => {
    const content = generateDangerfileContent({
      ciCommand: 'codeforge analyze',
      outputFile: 'dangerfile.js',
      resultsFile: DEFAULT_RESULTS_FILE,
    })
    expect(content).toContain(DEFAULT_RESULTS_FILE)
  })

  it('includes fail/warn/message handling for violations', () => {
    const content = generateDangerfileContent({
      ciCommand: DEFAULT_CI_COMMAND,
      outputFile: DEFAULT_OUTPUT_FILE,
      resultsFile: DEFAULT_RESULTS_FILE,
    })
    expect(content).toContain('fail(')
    expect(content).toContain('warn(')
    expect(content).toContain('message(')
  })
})

// ─── resolveDangerOptions ─────────────────────────────
describe('resolveDangerOptions', () => {
  it('returns defaults when no flags provided', () => {
    const opts = resolveDangerOptions({})
    expect(opts.ciCommand).toBe(DEFAULT_CI_COMMAND)
    expect(opts.outputFile).toBe(DEFAULT_OUTPUT_FILE)
  })

  it('uses ci-command flag value', () => {
    const opts = resolveDangerOptions({ 'ci-command': 'custom cmd' })
    expect(opts.ciCommand).toBe('custom cmd')
  })

  it('uses ciCommand flag value', () => {
    const opts = resolveDangerOptions({ ciCommand: 'alt cmd' })
    expect(opts.ciCommand).toBe('alt cmd')
  })

  it('uses output flag value', () => {
    const opts = resolveDangerOptions({ output: 'my-dangerfile.ts' })
    expect(opts.outputFile).toBe('my-dangerfile.ts')
  })

  it('extracts results file from ci command', () => {
    const opts = resolveDangerOptions({
      'ci-command': 'codeforge analyze --output my-results.json',
    })
    expect(opts.resultsFile).toBe('my-results.json')
  })

  it('falls back to default results file when no --output in ci command', () => {
    const opts = resolveDangerOptions({ 'ci-command': 'codeforge analyze' })
    expect(opts.resultsFile).toBe(DEFAULT_RESULTS_FILE)
  })
})

// ─── validateDangerOutputPath ─────────────────────────
describe('validateDangerOutputPath', () => {
  it('validates .js file paths', () => {
    expect(validateDangerOutputPath('dangerfile.js')).toEqual({ valid: true })
  })

  it('validates .ts file paths', () => {
    expect(validateDangerOutputPath('dangerfile.ts')).toEqual({ valid: true })
  })

  it('validates nested path with .js', () => {
    expect(validateDangerOutputPath('src/dangerfile.js')).toEqual({ valid: true })
  })

  it('rejects empty string', () => {
    const result = validateDangerOutputPath('')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('empty')
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

  it('rejects path without extension', () => {
    const result = validateDangerOutputPath('dangerfile')
    expect(result.valid).toBe(false)
  })

  it('rejects .json extension', () => {
    const result = validateDangerOutputPath('config.json')
    expect(result.valid).toBe(false)
  })
})

// ─── displayDangerNextSteps ───────────────────────────
describe('displayDangerNextSteps', () => {
  it('logs expected next steps', () => {
    const logs: string[] = []
    displayDangerNextSteps((msg) => logs.push(msg))

    const joined = logs.join('\n')
    expect(joined).toContain('Next steps:')
    expect(joined).toContain('npm install danger')
    expect(joined).toContain('danger ci')
    expect(joined).toContain('codeforge')
  })

  it('logs next steps', () => {
    const logs: string[] = []
    displayDangerNextSteps((msg) => logs.push(msg))
    expect(logs.length).toBeGreaterThanOrEqual(4)
    expect(logs.some(l => l.includes('Next steps'))).toBe(true)
  })
})
