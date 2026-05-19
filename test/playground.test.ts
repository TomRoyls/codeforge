import { describe, it, expect } from 'vitest'

import {
  analyzeFileIssues,
  analyzeFileQuality,
  analyzeFileStructure,
  analyzeFileStyle,
  buildPlaygroundResult,
  computeFileScore,
  detectLanguage,
  extractClasses,
  extractExports,
  extractFunctions,
  extractImports,
  extractInterfaces,
  extractTypes,
  generateRefactoringSuggestions,
  type FileAnalysis,
} from '../src/commands/playground-helpers.js'

import {
  buildScoreBar,
  formatIssues,
  formatPlaygroundJson,
  formatPlaygroundReport,
  formatQuality,
  formatStructure,
} from '../src/commands/playground-format-helpers.js'

import Playground from '../src/commands/playground.js'

const SAMPLE_TS = `import { Command } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'

// TODO: add more features
export interface Config {
  name: string
  value: number
}

export type Result = { ok: boolean }

export function greet(name: string): string {
  if (name) {
    console.log('Hello ' + name)
  }
  return 'Hello ' + name
}

export async function fetch(url: string): Promise<void> {
  const data = await fetch(url)
  return data
}

export class App {
  name: string
  version: string

  constructor(name: string) {
    this.name = name
  }

  run(): void {
    console.log('running')
  }
}

export default class Main extends Command {
  static override description = 'Main command'
}
`

// ─── detectLanguage ─────────────────────────────────────

describe('detectLanguage', () => {
  it('should detect TypeScript', () => { expect(detectLanguage('app.ts')).toBe('TypeScript') })
  it('should detect JavaScript', () => { expect(detectLanguage('app.js')).toBe('JavaScript') })
  it('should detect TSX', () => { expect(detectLanguage('app.tsx')).toBe('TypeScript (TSX)') })
  it('should detect JSX', () => { expect(detectLanguage('app.jsx')).toBe('JavaScript (JSX)') })
  it('should return Unknown for unknown extensions', () => { expect(detectLanguage('app.py')).toBe('Unknown') })
})

// ─── extractFunctions ───────────────────────────────────

describe('extractFunctions', () => {
  it('should extract named functions', () => {
    const fns = extractFunctions('function greet(name: string) { return name }')
    expect(fns).toHaveLength(1)
    expect(fns[0].name).toBe('greet')
  })

  it('should detect async functions', () => {
    const fns = extractFunctions('async function fetchData() { }')
    expect(fns[0].async).toBe(true)
  })

  it('should count params', () => {
    const fns = extractFunctions('function add(a: number, b: number) { }')
    expect(fns[0].params).toBe(2)
  })

  it('should extract arrow functions', () => {
    const fns = extractFunctions('const add = (a: number, b: number) => a + b')
    expect(fns).toHaveLength(1)
    expect(fns[0].name).toBe('add')
  })

  it('should extract async arrow functions', () => {
    const fns = extractFunctions('const load = async () => { }')
    expect(fns[0].async).toBe(true)
  })

  it('should return empty for no functions', () => {
    expect(extractFunctions('const x = 1')).toHaveLength(0)
  })
})

// ─── extractClasses ─────────────────────────────────────

describe('extractClasses', () => {
  it('should extract class names', () => {
    const cls = extractClasses('export class App { run() {} stop() {} }')
    expect(cls).toHaveLength(1)
    expect(cls[0].name).toBe('App')
  })

  it('should count methods', () => {
    const cls = extractClasses('class Foo { method1() {} method2() {} }')
    expect(cls[0].methods).toBeGreaterThanOrEqual(2)
  })

  it('should return empty for no classes', () => {
    expect(extractClasses('function foo() {}')).toHaveLength(0)
  })
})

// ─── extractImports ─────────────────────────────────────

describe('extractImports', () => {
  it('should extract ESM imports', () => {
    const imps = extractImports("import { Command } from '@oclif/core'")
    expect(imps).toHaveLength(1)
    expect(imps[0].type).toBe('esm')
    expect(imps[0].source).toBe('@oclif/core')
  })

  it('should count import items', () => {
    const imps = extractImports("import { a, b, c } from 'utils'")
    expect(imps[0].items).toBe(3)
  })

  it('should extract CJS require', () => {
    const imps = extractImports("const fs = require('fs')")
    expect(imps).toHaveLength(1)
    expect(imps[0].type).toBe('cjs')
  })

  it('should extract dynamic import', () => {
    const imps = extractImports("const mod = import('./module')")
    expect(imps).toHaveLength(1)
    expect(imps[0].type).toBe('dynamic')
  })

  it('should extract default import', () => {
    const imps = extractImports("import chalk from 'chalk'")
    expect(imps).toHaveLength(1)
    expect(imps[0].items).toBe(1)
  })

  it('should return empty for no imports', () => {
    expect(extractImports('const x = 1')).toHaveLength(0)
  })
})

// ─── extractExports ─────────────────────────────────────

describe('extractExports', () => {
  it('should extract named exports', () => {
    const exps = extractExports('export function foo() {}')
    expect(exps).toHaveLength(1)
    expect(exps[0].name).toBe('foo')
    expect(exps[0].type).toBe('named')
  })

  it('should extract default export', () => {
    const exps = extractExports('export default class App {}')
    expect(exps.some((e) => e.type === 'default')).toBe(true)
  })

  it('should extract const exports', () => {
    const exps = extractExports('export const X = 1')
    expect(exps[0].name).toBe('X')
  })

  it('should extract re-exports', () => {
    const exps = extractExports("export { foo } from './bar'")
    expect(exps.some((e) => e.type === 're-export')).toBe(true)
  })

  it('should return empty for no exports', () => {
    expect(extractExports('const x = 1')).toHaveLength(0)
  })
})

// ─── extractInterfaces ──────────────────────────────────

describe('extractInterfaces', () => {
  it('should extract interface names', () => {
    const ifaces = extractInterfaces('export interface Config { name: string; value: number }')
    expect(ifaces).toHaveLength(1)
    expect(ifaces[0].name).toBe('Config')
  })

  it('should count properties', () => {
    const ifaces = extractInterfaces('interface Opts { a: string\n b: number\n c: boolean }')
    expect(ifaces[0].properties).toBeGreaterThanOrEqual(1)
  })

  it('should return empty for no interfaces', () => {
    expect(extractInterfaces('const x = 1')).toHaveLength(0)
  })
})

// ─── extractTypes ───────────────────────────────────────

describe('extractTypes', () => {
  it('should extract type aliases', () => {
    const types = extractTypes('export type Result = { ok: boolean }')
    expect(types).toHaveLength(1)
    expect(types[0].name).toBe('Result')
  })

  it('should extract generic types', () => {
    const types = extractTypes('type Container<T> = { value: T }')
    expect(types[0].name).toBe('Container')
  })

  it('should return empty for no types', () => {
    expect(extractTypes('const x = 1')).toHaveLength(0)
  })
})

// ─── analyzeFileQuality ─────────────────────────────────

describe('analyzeFileQuality', () => {
  it('should return complexity 1 for simple code', () => {
    const q = analyzeFileQuality('const x = 1')
    expect(q.cyclomaticComplexity).toBe(1)
  })

  it('should increase complexity for if statements', () => {
    const q = analyzeFileQuality('if (x) { }\nif (y) { }')
    expect(q.cyclomaticComplexity).toBeGreaterThan(1)
  })

  it('should detect nesting depth', () => {
    const q = analyzeFileQuality('if (x) {\n  if (y) {\n    if (z) {\n    }\n  }\n}')
    expect(q.nestingDepth).toBeGreaterThanOrEqual(3)
  })

  it('should compute maintainability index', () => {
    const q = analyzeFileQuality('const x = 1')
    expect(q.maintainabilityIndex).toBeGreaterThanOrEqual(0)
    expect(q.maintainabilityIndex).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeFileIssues ──────────────────────────────────

describe('analyzeFileIssues', () => {
  it('should detect TODO comments', () => {
    const issues = analyzeFileIssues('// TODO: fix this\nconst x = 1', 'app.ts')
    expect(issues.todos).toHaveLength(1)
    expect(issues.todos[0].type).toBe('TODO')
  })

  it('should detect FIXME comments', () => {
    const issues = analyzeFileIssues('// FIXME: broken\n', 'app.ts')
    expect(issues.todos).toHaveLength(1)
    expect(issues.todos[0].type).toBe('FIXME')
  })

  it('should detect eval usage', () => {
    const issues = analyzeFileIssues('eval("code")', 'app.ts')
    expect(issues.securityIssues).toHaveLength(1)
    expect(issues.securityIssues[0].rule).toBe('no-eval')
  })

  it('should detect hardcoded password', () => {
    const issues = analyzeFileIssues("const password = 'secret123'", 'app.ts')
    expect(issues.securityIssues).toHaveLength(1)
    expect(issues.securityIssues[0].rule).toBe('no-hardcoded-secrets')
  })

  it('should detect sync I/O', () => {
    const issues = analyzeFileIssues("fs.readFileSync('f')", 'app.ts')
    expect(issues.perfIssues.some((p) => p.rule === 'no-sync-io')).toBe(true)
  })

  it('should detect console statements', () => {
    const issues = analyzeFileIssues("console.log('x')", 'app.ts')
    expect(issues.perfIssues.some((p) => p.rule === 'no-console')).toBe(true)
  })

  it('should return empty for clean code', () => {
    const issues = analyzeFileIssues('const x = 1', 'app.ts')
    expect(issues.todos).toHaveLength(0)
    expect(issues.securityIssues).toHaveLength(0)
  })
})

// ─── analyzeFileStyle ───────────────────────────────────

describe('analyzeFileStyle', () => {
  it('should detect spaces indentation', () => {
    const style = analyzeFileStyle('const x = 1\n  const y = 2')
    expect(style.indentationStyle).toBe('spaces')
  })

  it('should detect tabs indentation', () => {
    const style = analyzeFileStyle('const x = 1\n\tconst y = 2')
    expect(style.indentationStyle).toBe('tabs')
  })

  it('should detect single quotes', () => {
    const style = analyzeFileStyle("const x = 'hello'\nconst y = 'world'")
    expect(style.quoteStyle).toBe('single')
  })

  it('should detect double quotes', () => {
    const style = analyzeFileStyle('const x = "hello"\nconst y = "world"')
    expect(style.quoteStyle).toBe('double')
  })

  it('should detect semicolon usage', () => {
    const style = analyzeFileStyle('const x = 1;\nconst y = 2;')
    expect(style.semicolonUsage).toBe(true)
  })

  it('should detect no semicolons', () => {
    const style = analyzeFileStyle('const x = 1\nconst y = 2')
    expect(style.semicolonUsage).toBe(false)
  })
})

// ─── analyzeFileStructure ───────────────────────────────

describe('analyzeFileStructure', () => {
  it('should return full analysis', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    expect(a.filePath).toBe('app.ts')
    expect(a.fileName).toBe('app.ts')
    expect(a.language).toBe('TypeScript')
    expect(a.lines).toBeGreaterThan(0)
    expect(a.size).toBeGreaterThan(0)
  })

  it('should count lines correctly', () => {
    const a = analyzeFileStructure('code\n\n// comment\ncode', 'app.ts')
    expect(a.lines).toBe(4)
    expect(a.blankLines).toBe(1)
    expect(a.commentLines).toBe(1)
    expect(a.codeLines).toBe(2)
  })

  it('should extract all structure from sample', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    expect(a.functions.length).toBeGreaterThan(0)
    expect(a.classes.length).toBeGreaterThan(0)
    expect(a.imports.length).toBeGreaterThan(0)
    expect(a.exports.length).toBeGreaterThan(0)
    expect(a.interfaces.length).toBeGreaterThan(0)
    expect(a.types.length).toBeGreaterThan(0)
  })

  it('should detect quality metrics', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    expect(a.cyclomaticComplexity).toBeGreaterThan(0)
    expect(a.maintainabilityIndex).toBeGreaterThanOrEqual(0)
    expect(a.nestingDepth).toBeGreaterThanOrEqual(0)
  })

  it('should detect issues', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    expect(a.todos.length).toBeGreaterThan(0)
  })

  it('should detect style', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    expect(a.indentationStyle).toBeTruthy()
    expect(a.quoteStyle).toBeTruthy()
  })

  it('should generate suggestions', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    expect(a.refactoringSuggestions.length).toBeGreaterThan(0)
  })
})

// ─── computeFileScore ───────────────────────────────────

describe('computeFileScore', () => {
  it('should return 100 for clean file', () => {
    const a = analyzeFileStructure('const x = 1', 'app.ts')
    expect(computeFileScore(a)).toBe(100)
  })

  it('should penalize security issues', () => {
    const a = analyzeFileStructure("eval('code')", 'app.ts')
    expect(computeFileScore(a)).toBeLessThan(100)
  })

  it('should penalize long files', () => {
    const code = 'x\n'.repeat(400)
    const a = analyzeFileStructure(code, 'app.ts')
    expect(computeFileScore(a)).toBeLessThan(100)
  })

  it('should clamp to 0-100', () => {
    const a = analyzeFileStructure("eval('a')\npassword = 'x'\n" + 'x\n'.repeat(500), 'app.ts')
    expect(computeFileScore(a)).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRefactoringSuggestions ─────────────────────

describe('generateRefactoringSuggestions', () => {
  it('should suggest splitting for many functions', () => {
    const code = Array.from({ length: 25 }, (_, i) => `function fn${i}() {}`).join('\n')
    const a = analyzeFileStructure(code, 'app.ts')
    expect(a.refactoringSuggestions.some((s) => s.includes('functions'))).toBe(true)
  })

  it('should suggest splitting long files', () => {
    const code = 'x\n'.repeat(350)
    const a = analyzeFileStructure(code, 'app.ts')
    expect(a.refactoringSuggestions.some((s) => s.includes('long') || s.includes('splitting'))).toBe(true)
  })

  it('should say file looks good for clean code', () => {
    const a = analyzeFileStructure('const x = 1', 'app.ts')
    expect(a.refactoringSuggestions.some((s) => s.includes('good'))).toBe(true)
  })
})

// ─── buildPlaygroundResult ──────────────────────────────

describe('buildPlaygroundResult', () => {
  it('should return result with score', async () => {
    const reader = async () => 'const x = 1'
    const result = await buildPlaygroundResult('app.ts', reader)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.analysis).toBeDefined()
  })

  it('should pass all flag', async () => {
    const reader = async () => 'function foo() { if (x) { if (y) {} } }'
    const result = await buildPlaygroundResult('app.ts', reader, { all: true })
    expect(result.analysis.functions.length).toBeGreaterThan(0)
  })
})

// ─── buildScoreBar ──────────────────────────────────────

describe('buildScoreBar', () => {
  it('should produce bar at 100', () => { expect(buildScoreBar(100, 10)).toContain('█') })
  it('should produce bar at 0', () => { expect(buildScoreBar(0, 10)).toContain('░') })
})

// ─── formatPlaygroundReport ─────────────────────────────

describe('formatPlaygroundReport', () => {
  it('should include all sections', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    const score = computeFileScore(a)
    const report = formatPlaygroundReport({ analysis: a, score })
    expect(report).toContain('Structure')
    expect(report).toContain('Quality')
    expect(report).toContain('Issues')
    expect(report).toContain('Style')
    expect(report).toContain('Suggestions')
  })
})

// ─── formatPlaygroundJson ───────────────────────────────

describe('formatPlaygroundJson', () => {
  it('should produce valid JSON', () => {
    const a = analyzeFileStructure(SAMPLE_TS, 'app.ts')
    const json = formatPlaygroundJson({ analysis: a, score: 85 })
    const parsed = JSON.parse(json)
    expect(parsed.score).toBe(85)
    expect(parsed.analysis.fileName).toBe('app.ts')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Playground command', () => {
  it('should have correct description', () => {
    expect(Playground.description).toContain('eep') // Deep analysis
  })

  it('should have file arg', () => {
    expect(Playground.args.file).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Playground.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Playground.flags.output).toBeDefined()
  })

  it('should have all flag', () => {
    expect(Playground.flags.all).toBeDefined()
  })

  it('should have examples', () => {
    expect(Playground.examples.length).toBeGreaterThan(0)
  })
})
