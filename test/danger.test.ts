import { describe, it, expect } from 'vitest'

import Danger from '../src/commands/danger.js'
import {
  DEFAULT_CI_COMMAND,
  DEFAULT_OUTPUT_FILE,
  DEFAULT_RESULTS_FILE,
  displayDangerNextSteps,
  generateDangerfileContent,
  resolveDangerOptions,
  validateDangerOutputPath,
  type DangerfileOptions,
} from '../src/commands/danger-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Danger command - static metadata', () => {
  it('has a description', () => {
    expect(Danger.description).toBe('Generate a Dangerfile for Danger.js integration')
  })

  it('has examples array', () => {
    expect(Array.isArray(Danger.examples)).toBe(true)
    expect(Danger.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has force flag with char f', () => {
    expect(Danger.flags.force).toBeDefined()
    expect(Danger.flags.force.char).toBe('f')
    expect(Danger.flags.force.default).toBe(false)
  })

  it('has output flag with char o', () => {
    expect(Danger.flags.output).toBeDefined()
    expect(Danger.flags.output.char).toBe('o')
    expect(Danger.flags.output.default).toBe('dangerfile.js')
  })

  it('has ci-command flag with char c', () => {
    expect(Danger.flags['ci-command']).toBeDefined()
    expect(Danger.flags['ci-command'].char).toBe('c')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Danger command - class structure', () => {
  it('exports a default class', () => {
    expect(Danger).toBeDefined()
    expect(typeof Danger).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Danger.prototype.run).toBe('function')
  })

  it('has generateDangerfileContent instance method', () => {
    expect(typeof Danger.prototype.generateDangerfileContent).toBe('function')
  })
})

// ─── generateDangerfileContent helper ────────────────────
describe('Danger command - generateDangerfileContent helper', () => {
  it('generates content with CI command', () => {
    const options: DangerfileOptions = {
      ciCommand: 'codeforge analyze --format json --output results.json',
      outputFile: 'dangerfile.js',
      resultsFile: 'results.json',
    }
    const content = generateDangerfileContent(options)
    expect(content).toContain('codeforge analyze --format json --output results.json')
    expect(content).toContain('results.json')
    expect(content).toContain('execSync')
  })

  it('uses default results file when no --output in ci command', () => {
    const options: DangerfileOptions = {
      ciCommand: 'codeforge analyze',
      outputFile: 'dangerfile.js',
      resultsFile: DEFAULT_RESULTS_FILE,
    }
    const content = generateDangerfileContent(options)
    expect(content).toContain(DEFAULT_RESULTS_FILE)
  })
})

// ─── resolveDangerOptions helper ─────────────────────────
describe('Danger command - resolveDangerOptions helper', () => {
  it('returns defaults for empty flags', () => {
    const result = resolveDangerOptions({})
    expect(result.ciCommand).toBe(DEFAULT_CI_COMMAND)
    expect(result.outputFile).toBe(DEFAULT_OUTPUT_FILE)
  })

  it('uses custom output', () => {
    const result = resolveDangerOptions({ output: 'my-dangerfile.ts' })
    expect(result.outputFile).toBe('my-dangerfile.ts')
  })

  it('uses custom ci-command', () => {
    const result = resolveDangerOptions({ 'ci-command': 'my analyze cmd' })
    expect(result.ciCommand).toBe('my analyze cmd')
  })

  it('supports ciCommand alias', () => {
    const result = resolveDangerOptions({ ciCommand: 'alias cmd' })
    expect(result.ciCommand).toBe('alias cmd')
  })
})

// ─── validateDangerOutputPath helper ─────────────────────
describe('Danger command - validateDangerOutputPath helper', () => {
  it('validates .js files', () => {
    expect(validateDangerOutputPath('dangerfile.js').valid).toBe(true)
  })

  it('validates .ts files', () => {
    expect(validateDangerOutputPath('dangerfile.ts').valid).toBe(true)
  })

  it('validates nested paths with .js', () => {
    expect(validateDangerOutputPath('ci/dangerfile.js').valid).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateDangerOutputPath('').valid).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(validateDangerOutputPath('   ').valid).toBe(false)
  })

  it('rejects non-js/ts extension', () => {
    const result = validateDangerOutputPath('dangerfile.py')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('.js or .ts')
  })
})

// ─── displayDangerNextSteps helper ───────────────────────
describe('Danger command - displayDangerNextSteps helper', () => {
  it('logs next steps', () => {
    const logs: string[] = []
    displayDangerNextSteps((msg) => logs.push(msg))
    expect(logs.some(l => l.includes('npm install danger'))).toBe(true)
    expect(logs.some(l => l.includes('danger ci'))).toBe(true)
  })
})

// ─── Constants ───────────────────────────────────────────
describe('Danger command - constants', () => {
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

// ─── generateDangerfileContent instance delegation ────────
describe('Danger command - instance method delegates to helper', () => {
  it('generateDangerfileContent returns same as helper', () => {
    const options: DangerfileOptions = {
      ciCommand: 'codeforge analyze',
      outputFile: 'dangerfile.js',
      resultsFile: DEFAULT_RESULTS_FILE,
    }
    const helperResult = generateDangerfileContent(options)
    expect(helperResult).toContain('execSync')
    expect(helperResult).toContain('codeforge analyze')
  })
})
