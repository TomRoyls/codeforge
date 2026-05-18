import { describe, it, expect } from 'vitest'

import Inspect from '../src/commands/inspect.js'
import {
  analyzeFile,
  countLines,
  detectLanguage,
  type FileInspection,
} from '../src/commands/inspect-helpers.js'
import { formatInspectionTable, formatInspectionOutput } from '../src/commands/inspect-format-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Inspect command - static metadata', () => {
  it('has a description', () => {
    expect(Inspect.description).toBe('Perform deep analysis of a single source file')
  })

  it('has examples array', () => {
    expect(Array.isArray(Inspect.examples)).toBe(true)
    expect(Inspect.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has file arg that is required', () => {
    expect(Inspect.args.file).toBeDefined()
    expect(Inspect.args.file.required).toBe(true)
  })

  it('uses <%= config.bin %> <%= command.id %> pattern in examples', () => {
    for (const example of Inspect.examples) {
      expect(example.command).toContain('<%= config.bin %> <%= command.id %>')
    }
  })
})

// ─── Flags ───────────────────────────────────────────────
describe('Inspect command - flags', () => {
  it('has format flag with options json and table', () => {
    expect(Inspect.flags.format.options).toContain('json')
    expect(Inspect.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Inspect.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Inspect.flags.output).toBeDefined()
  })

  it('has verbose flag defaulting to false', () => {
    expect(Inspect.flags.verbose.default).toBe(false)
  })

  it('format flag has char f', () => {
    expect(Inspect.flags.format.char).toBe('f')
  })

  it('output flag has char o', () => {
    expect(Inspect.flags.output.char).toBe('o')
  })

  it('verbose flag has char v', () => {
    expect(Inspect.flags.verbose.char).toBe('v')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Inspect command - class structure', () => {
  it('exports a default class', () => {
    expect(Inspect).toBeDefined()
    expect(typeof Inspect).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Inspect.prototype.run).toBe('function')
  })
})

// ─── detectLanguage ──────────────────────────────────────
describe('detectLanguage', () => {
  it('detects TypeScript', () => {
    expect(detectLanguage('file.ts')).toBe('TypeScript')
  })

  it('detects TypeScript React', () => {
    expect(detectLanguage('component.tsx')).toBe('TypeScript React')
  })

  it('detects JavaScript', () => {
    expect(detectLanguage('script.js')).toBe('JavaScript')
  })

  it('detects JavaScript React', () => {
    expect(detectLanguage('app.jsx')).toBe('JavaScript React')
  })

  it('detects Python', () => {
    expect(detectLanguage('main.py')).toBe('Python')
  })

  it('detects Rust', () => {
    expect(detectLanguage('main.rs')).toBe('Rust')
  })

  it('returns Unknown for unrecognized extensions', () => {
    expect(detectLanguage('file.xyz')).toBe('Unknown')
  })
})

// ─── countLines ──────────────────────────────────────────
describe('countLines', () => {
  it('counts total, code, blank, and comment lines', () => {
    const content = 'const x = 1;\n\n// comment\nconst y = 2;'
    const result = countLines(content)
    expect(result.total).toBe(4)
    expect(result.code).toBe(2)
    expect(result.blank).toBe(1)
    expect(result.comment).toBe(1)
  })

  it('handles block comments', () => {
    const content = '/* block\ncomment */\nconst x = 1;'
    const result = countLines(content)
    expect(result.comment).toBe(2)
    expect(result.code).toBe(1)
  })

  it('handles empty content', () => {
    const result = countLines('')
    expect(result.total).toBe(1)
    expect(result.blank).toBe(1)
    expect(result.code).toBe(0)
  })

  it('counts all blank lines', () => {
    const content = '\n\n\n'
    const result = countLines(content)
    expect(result.total).toBe(4)
    expect(result.blank).toBe(4)
  })
})

// ─── analyzeFile ─────────────────────────────────────────
describe('analyzeFile', () => {
  const sampleTs = `import { Command, Flags } from '@oclif/core'
import type { Result } from './types.js'
import * as fs from 'node:fs/promises'
import ora from 'ora'

export interface Config {
  name: string
  verbose: boolean
}

export function greet(name: string): string {
  if (name) {
    return 'Hello ' + name
  }
  return 'Hello'
}

export async function processFile(path: string): Promise<void> {
  const content = await fs.readFile(path, 'utf8')
  console.log(content)
}

const helper = (x: number) => x * 2

export default class Analyzer {
  run(): void {
    console.log('running')
  }
}
`

  it('parses imports correctly', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    expect(result.imports.length).toBeGreaterThanOrEqual(3)
    const sources = result.imports.map((i) => i.source)
    expect(sources).toContain('@oclif/core')
    expect(sources).toContain('./types.js')
    expect(sources).toContain('ora')
  })

  it('detects type-only imports', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    const typeImport = result.imports.find((i) => i.source === './types.js')
    expect(typeImport?.isTypeOnly).toBe(true)
  })

  it('parses exports correctly', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    const exportNames = result.exports.map((e) => e.name)
    expect(exportNames).toContain('Config')
    expect(exportNames).toContain('greet')
    expect(exportNames).toContain('processFile')
    expect(exportNames).toContain('Analyzer')
  })

  it('parses functions correctly', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    const funcNames = result.functions.map((f) => f.name)
    expect(funcNames).toContain('greet')
    expect(funcNames).toContain('processFile')
    expect(funcNames).toContain('helper')
  })

  it('detects async functions', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    const processFile = result.functions.find((f) => f.name === 'processFile')
    expect(processFile?.isAsync).toBe(true)
  })

  it('detects exported functions', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    const greet = result.functions.find((f) => f.name === 'greet')
    expect(greet?.isExported).toBe(true)
  })

  it('parses classes', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    expect(result.classes.length).toBeGreaterThanOrEqual(1)
    const analyzer = result.classes.find((c) => c.name === 'Analyzer')
    expect(analyzer).toBeDefined()
    expect(analyzer?.isExported).toBe(true)
  })

  it('estimates complexity', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    expect(result.metrics.complexity).toBeGreaterThan(1)
  })

  it('calculates metrics', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    expect(result.metrics.maintainabilityIndex).toBeGreaterThanOrEqual(0)
    expect(result.metrics.maintainabilityIndex).toBeLessThanOrEqual(100)
    expect(result.metrics.linesOfCodePerFunction).toBeGreaterThan(0)
    expect(result.metrics.dependencyCount).toBeGreaterThanOrEqual(3)
    expect(result.metrics.exportCount).toBeGreaterThanOrEqual(4)
  })

  it('returns correct language', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    expect(result.language).toBe('TypeScript')
  })

  it('returns correct file size', () => {
    const result = analyzeFile(sampleTs, 'test.ts')
    expect(result.size).toBe(sampleTs.length)
  })

  it('handles namespace imports', () => {
    const content = `import * as path from 'node:path'\nconst x = 1;`
    const result = analyzeFile(content, 'test.ts')
    expect(result.imports.length).toBe(1)
    expect(result.imports[0]!.items).toContain('* as path')
  })

  it('handles side-effect imports', () => {
    const content = `import './setup.js'\nconst x = 1;`
    const result = analyzeFile(content, 'test.ts')
    expect(result.imports.length).toBe(1)
    expect(result.imports[0]!.items).toHaveLength(0)
  })

  it('handles re-exports', () => {
    const content = `export * from './utils.js'\nexport { foo } from './bar.js'`
    const result = analyzeFile(content, 'test.ts')
    expect(result.exports.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── formatInspectionTable ───────────────────────────────
describe('formatInspectionTable', () => {
  it('produces output containing file info', () => {
    const inspection: FileInspection = {
      classes: [],
      exports: [{ isExported: true, line: 1, name: 'greet', type: 'function' }],
      functions: [{ isAsync: false, isExported: true, line: 1, name: 'greet', params: 1 }],
      imports: [{ isTypeOnly: false, items: ['chalk'], line: 1, source: 'chalk' }],
      language: 'TypeScript',
      lines: { blank: 1, code: 10, comment: 0, total: 11 },
      metrics: {
        complexity: 3,
        dependencyCount: 1,
        exportCount: 1,
        linesOfCodePerFunction: 10,
        maintainabilityIndex: 80,
      },
      path: 'src/index.ts',
      size: 256,
    }
    const output = formatInspectionTable(inspection, false)
    expect(output).toContain('src/index.ts')
    expect(output).toContain('TypeScript')
    expect(output).toContain('256')
    expect(output).toContain('greet')
    expect(output).toContain('chalk')
  })

  it('shows line numbers when verbose', () => {
    const inspection: FileInspection = {
      classes: [],
      exports: [{ isExported: true, line: 5, name: 'foo', type: 'const' }],
      functions: [],
      imports: [{ isTypeOnly: false, items: ['bar'], line: 1, source: 'baz' }],
      language: 'TypeScript',
      lines: { blank: 0, code: 5, comment: 0, total: 5 },
      metrics: {
        complexity: 1,
        dependencyCount: 1,
        exportCount: 1,
        linesOfCodePerFunction: 5,
        maintainabilityIndex: 100,
      },
      path: 'test.ts',
      size: 100,
    }
    const output = formatInspectionTable(inspection, true)
    expect(output).toContain('L1')
    expect(output).toContain('L5')
  })
})

// ─── formatInspectionOutput ──────────────────────────────
describe('formatInspectionOutput', () => {
  const inspection: FileInspection = {
    classes: [],
    exports: [],
    functions: [],
    imports: [],
    language: 'TypeScript',
    lines: { blank: 0, code: 5, comment: 0, total: 5 },
    metrics: {
      complexity: 1,
      dependencyCount: 0,
      exportCount: 0,
      linesOfCodePerFunction: 5,
      maintainabilityIndex: 100,
    },
    path: 'test.ts',
    size: 100,
  }

  it('returns JSON when format is json', () => {
    const output = formatInspectionOutput(inspection, 'json', false)
    const parsed = JSON.parse(output)
    expect(parsed.path).toBe('test.ts')
    expect(parsed.language).toBe('TypeScript')
  })

  it('returns table when format is table', () => {
    const output = formatInspectionOutput(inspection, 'table', false)
    expect(output).toContain('File Inspection Report')
    expect(output).toContain('test.ts')
  })
})
