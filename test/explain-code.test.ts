import { describe, expect, it } from 'vitest'

import {
  buildCodeExplanation,
  calculateCyclomaticComplexity,
  computeComplexityLevel,
  computeMetrics,
  detectControlFlow,
  detectPatterns,
  detectSideEffects,
  escapeRegex,
  extractArrowParams,
  extractCallsFromSection,
  extractExports,
  extractImports,
  extractSections,
  generateOverview,
  inferFilePurpose,
  inferReturnType,
  inferSectionDescription,
  parseParamList,
  parseSingleParam,
  resolveCalledBy,
  type CodeSection,
  type ExplainOptions,
} from '../src/commands/explain-code-helpers.js'

import {
  complexityIndicator,
  controlFlowLabel,
  formatExplainCsv,
  formatExplainJson,
  formatExplainTable,
  formatMetrics,
  formatParam,
  formatSection,
  sideEffectLabel,
} from '../src/commands/explain-code-format-helpers.js'

// ─── Language Detection ───────────────────────────────────────────────────────

describe('detectLanguage', () => {
  it('detects TypeScript', () => {
    const result = buildCodeExplanation('foo.ts', '', {})
    expect(result.language).toBe('TypeScript')
  })

  it('detects JavaScript', () => {
    const result = buildCodeExplanation('foo.js', '', {})
    expect(result.language).toBe('JavaScript')
  })

  it('detects Python', () => {
    const result = buildCodeExplanation('foo.py', '', {})
    expect(result.language).toBe('Python')
  })

  it('detects Rust', () => {
    const result = buildCodeExplanation('foo.rs', '', {})
    expect(result.language).toBe('Rust')
  })

  it('detects Go', () => {
    const result = buildCodeExplanation('foo.go', '', {})
    expect(result.language).toBe('Go')
  })

  it('returns Unknown for unrecognized extensions', () => {
    const result = buildCodeExplanation('foo.xyz', '', {})
    expect(result.language).toBe('Unknown')
  })

  it('detects TSX', () => {
    const result = buildCodeExplanation('component.tsx', '', {})
    expect(result.language).toBe('TypeScript (JSX)')
  })

  it('detects Vue', () => {
    const result = buildCodeExplanation('app.vue', '', {})
    expect(result.language).toBe('Vue')
  })
})

// ─── Import Extraction ────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts static imports', () => {
    const code = `import { foo } from './bar'\nimport * as fs from 'node:fs'`
    const imports = extractImports(code)
    expect(imports).toContain('./bar')
    expect(imports).toContain('node:fs')
    expect(imports).toHaveLength(2)
  })

  it('extracts type imports', () => {
    const code = `import type { Config } from './types'`
    const imports = extractImports(code)
    expect(imports).toContain('./types')
  })

  it('extracts dynamic imports', () => {
    const code = `const mod = import('./module')`
    const imports = extractImports(code)
    expect(imports).toContain('./module')
  })

  it('deduplicates imports', () => {
    const code = `import { a } from './x'\nimport { b } from './x'`
    const imports = extractImports(code)
    const xImports = imports.filter((i) => i === './x')
    expect(xImports).toHaveLength(1)
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── Export Extraction ────────────────────────────────────────────────────────

describe('extractExports', () => {
  it('extracts exported functions', () => {
    const exports = extractExports('export function foo() {}')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('foo')
    expect(exports[0]?.type).toBe('function')
  })

  it('extracts exported classes', () => {
    const exports = extractExports('export class Bar {}')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('Bar')
    expect(exports[0]?.type).toBe('class')
  })

  it('extracts exported interfaces', () => {
    const exports = extractExports('export interface Config { key: string }')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('Config')
    expect(exports[0]?.type).toBe('interface')
  })

  it('extracts exported types', () => {
    const exports = extractExports('export type Result = string | number')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('Result')
    expect(exports[0]?.type).toBe('type')
  })

  it('extracts exported constants', () => {
    const exports = extractExports('export const VERSION = "1.0"')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('VERSION')
    expect(exports[0]?.type).toBe('constant')
  })

  it('extracts named re-exports', () => {
    const exports = extractExports('export { foo, bar }')
    expect(exports).toHaveLength(2)
    expect(exports[0]?.name).toBe('foo')
    expect(exports[1]?.name).toBe('bar')
  })

  it('extracts default exports', () => {
    const exports = extractExports('export default MyClass')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('MyClass')
    expect(exports[0]?.purpose).toContain('Default')
  })

  it('extracts default exported classes', () => {
    const exports = extractExports('export default class Foo {}')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('Foo')
  })

  it('extracts async exported functions', () => {
    const exports = extractExports('export async function fetchData() {}')
    expect(exports).toHaveLength(1)
    expect(exports[0]?.name).toBe('fetchData')
  })
})

// ─── Section Extraction ───────────────────────────────────────────────────────

describe('extractSections', () => {
  it('extracts functions', () => {
    const code = 'function add(a: number, b: number): number {\n  return a + b\n}'
    const sections = extractSections(code)
    expect(sections.some((s) => s.name === 'add' && s.type === 'function')).toBe(true)
  })

  it('extracts classes', () => {
    const code = 'class Foo {\n  constructor() {}\n}'
    const sections = extractSections(code)
    expect(sections.some((s) => s.name === 'Foo' && s.type === 'class')).toBe(true)
  })

  it('extracts interfaces', () => {
    const code = 'interface Config {\n  key: string\n}'
    const sections = extractSections(code)
    expect(sections.some((s) => s.name === 'Config' && s.type === 'interface')).toBe(true)
  })

  it('extracts type aliases', () => {
    const code = "type Result = string | number;\n"
    const sections = extractSections(code)
    expect(sections.some((s) => s.name === 'Result' && s.type === 'type')).toBe(true)
  })

  it('extracts arrow function constants', () => {
    const code = 'const add = (a: number, b: number) => a + b'
    const sections = extractSections(code)
    const add = sections.find((s) => s.name === 'add')
    expect(add).toBeDefined()
    expect(add?.type).toBe('constant')
  })

  it('extracts exported functions', () => {
    const code = 'export function run() {\n  return 1\n}'
    const sections = extractSections(code)
    expect(sections.some((s) => s.name === 'run')).toBe(true)
  })

  it('extracts async functions', () => {
    const code = 'async function fetchData() {\n  await fetch("/")\n}'
    const sections = extractSections(code)
    expect(sections.some((s) => s.name === 'fetchData')).toBe(true)
  })

  it('sets line numbers correctly', () => {
    const code = 'function foo() {\n  return 1\n}\nfunction bar() {\n  return 2\n}'
    const sections = extractSections(code)
    const foo = sections.find((s) => s.name === 'foo')
    const bar = sections.find((s) => s.name === 'bar')
    expect(foo?.lineStart).toBe(1)
    expect(foo?.lineEnd).toBe(3)
    expect(bar?.lineStart).toBe(4)
    expect(bar?.lineEnd).toBe(6)
  })
})

// ─── Parameter Parsing ────────────────────────────────────────────────────────

describe('parseParamList', () => {
  it('parses empty parameter list', () => {
    expect(parseParamList('')).toEqual([])
  })

  it('parses single parameter', () => {
    const params = parseParamList('x: number')
    expect(params).toHaveLength(1)
    expect(params[0]?.name).toBe('x')
    expect(params[0]?.type).toBe('number')
  })

  it('parses multiple parameters', () => {
    const params = parseParamList('a: string, b: number')
    expect(params).toHaveLength(2)
    expect(params[0]?.name).toBe('a')
    expect(params[1]?.name).toBe('b')
  })

  it('handles optional parameters', () => {
    const params = parseParamList('opts?: Options')
    expect(params).toHaveLength(1)
    expect(params[0]?.name).toBe('opts')
    expect(params[0]?.purpose).toContain('Optional')
  })

  it('handles rest parameters', () => {
    const params = parseParamList('...args: string[]')
    expect(params).toHaveLength(1)
    expect(params[0]?.name).toBe('args')
  })

  it('handles complex types with commas', () => {
    const params = parseParamList('fn: (a: string, b: number) => void')
    expect(params).toHaveLength(1)
    expect(params[0]?.name).toBe('fn')
  })
})

describe('parseSingleParam', () => {
  it('parses typed parameter', () => {
    const p = parseSingleParam('filePath: string')
    expect(p.name).toBe('filePath')
    expect(p.type).toBe('string')
  })

  it('parses untyped parameter', () => {
    const p = parseSingleParam('value')
    expect(p.name).toBe('value')
    expect(p.type).toBe('unknown')
  })

  it('parses parameter with default value', () => {
    const p = parseSingleParam('count: number = 10')
    expect(p.name).toBe('count')
    expect(p.type).toBe('number')
  })
})

describe('extractArrowParams', () => {
  it('extracts multi-param arrow', () => {
    const params = extractArrowParams('const add = (a: number, b: number) => a + b')
    expect(params).toHaveLength(2)
  })

  it('extracts single-param arrow without parens', () => {
    const params = extractArrowParams('const fn = x => x + 1')
    expect(params).toHaveLength(1)
    expect(params[0]?.name).toBe('x')
  })

  it('returns empty for non-arrow constant', () => {
    expect(extractArrowParams('const x = 42')).toEqual([])
  })
})

// ─── Complexity ───────────────────────────────────────────────────────────────

describe('calculateCyclomaticComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(calculateCyclomaticComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(calculateCyclomaticComplexity('if (x) { foo() }')).toBe(2)
  })

  it('counts loops', () => {
    expect(calculateCyclomaticComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
  })

  it('counts logical operators', () => {
    expect(calculateCyclomaticComplexity('if (a && b || c) {}')).toBe(4)
  })

  it('counts switch cases', () => {
    expect(calculateCyclomaticComplexity('case 1: break;')).toBe(2)
  })
})

describe('computeComplexityLevel', () => {
  it('returns simple for <5', () => {
    expect(computeComplexityLevel(1)).toBe('simple')
    expect(computeComplexityLevel(4)).toBe('simple')
  })

  it('returns moderate for 5-10', () => {
    expect(computeComplexityLevel(5)).toBe('moderate')
    expect(computeComplexityLevel(10)).toBe('moderate')
  })

  it('returns complex for >10', () => {
    expect(computeComplexityLevel(11)).toBe('complex')
    expect(computeComplexityLevel(50)).toBe('complex')
  })
})

// ─── Control Flow ─────────────────────────────────────────────────────────────

describe('detectControlFlow', () => {
  it('detects linear flow', () => {
    expect(detectControlFlow('const x = 1')).toBe('linear')
  })

  it('detects branching', () => {
    expect(detectControlFlow('if (x) { foo() }')).toBe('branching')
  })

  it('detects switch as branching', () => {
    expect(detectControlFlow('switch (x) { case 1: break }')).toBe('branching')
  })

  it('detects looping', () => {
    expect(detectControlFlow('for (let i = 0; i < 10; i++) {}')).toBe('looping')
  })

  it('detects while as looping', () => {
    expect(detectControlFlow('while (true) {}')).toBe('looping')
  })

  it('detects async', () => {
    expect(detectControlFlow('async function foo() { await bar() }')).toBe('async')
  })

  it('detects Promise as async', () => {
    expect(detectControlFlow('Promise.resolve(1)')).toBe('async')
  })

  it('detects recursive function', () => {
    expect(detectControlFlow('function fib(n) { return fib(n - 1) }')).toBe('recursive')
  })
})

// ─── Side Effects ─────────────────────────────────────────────────────────────

describe('detectSideEffects', () => {
  it('detects file I/O', () => {
    expect(detectSideEffects('fs.readFile("x")')).toContain('file-io')
  })

  it('detects logging', () => {
    expect(detectSideEffects('console.log("hi")')).toContain('logging')
  })

  it('detects env access', () => {
    expect(detectSideEffects('process.env.KEY')).toContain('env-access')
  })

  it('detects network', () => {
    expect(detectSideEffects('fetch("/api")')).toContain('network')
  })

  it('detects non-deterministic', () => {
    expect(detectSideEffects('Math.random()')).toContain('non-deterministic')
  })

  it('detects state mutation', () => {
    expect(detectSideEffects('arr.push(1)')).toContain('state-mutation')
  })

  it('detects timers', () => {
    expect(detectSideEffects('setTimeout(() => {}, 100)')).toContain('timer')
  })

  it('detects event listeners', () => {
    expect(detectSideEffects('addEventListener("click", fn)')).toContain('event-listener')
  })

  it('returns empty for pure code', () => {
    expect(detectSideEffects('const x = 1 + 2')).toEqual([])
  })

  it('detects multiple side effects', () => {
    const effects = detectSideEffects('console.log(fs.readFileSync("x"))')
    expect(effects).toContain('logging')
    expect(effects).toContain('file-io')
  })
})

// ─── Pattern Detection ────────────────────────────────────────────────────────

describe('detectPatterns', () => {
  it('detects error handling', () => {
    expect(detectPatterns('try { foo() } catch(e) {}')).toContain('error-handling')
  })

  it('detects parallel execution', () => {
    expect(detectPatterns('Promise.all([a, b])')).toContain('parallel-execution')
  })

  it('detects async-await', () => {
    expect(detectPatterns('async function foo() { await bar() }')).toContain('async-await')
  })

  it('detects observer pattern', () => {
    expect(detectPatterns('emitter.on("event", fn)')).toContain('observer')
  })

  it('detects singleton', () => {
    expect(detectPatterns('class Foo { static readonly instance = new Foo() }')).toContain('singleton')
  })

  it('detects map pattern', () => {
    expect(detectPatterns('new Map()')).toContain('map-pattern')
  })

  it('detects set pattern', () => {
    expect(detectPatterns('new Set()')).toContain('set-pattern')
  })

  it('detects factory pattern', () => {
    expect(detectPatterns('function createFoo() {}')).toContain('factory')
  })

  it('detects promise chain', () => {
    expect(detectPatterns('fetch("/").then(r => r.json())')).toContain('promise-chain')
  })

  it('returns empty for no patterns', () => {
    expect(detectPatterns('const x = 1')).toEqual([])
  })

  it('detects middleware pattern', () => {
    expect(detectPatterns('app.use(middleware)')).toContain('middleware')
  })

  it('detects immutable pattern', () => {
    expect(detectPatterns('Object.freeze(obj)')).toContain('immutable-pattern')
  })
})

// ─── Purpose Inference ────────────────────────────────────────────────────────

describe('inferFilePurpose', () => {
  it('infers CLI command from commands/ path', () => {
    expect(inferFilePurpose('import { Command } from "@oclif/core"', 'src/commands/count.ts')).toBe('CLI command module')
  })

  it('infers test suite from test/ path', () => {
    expect(inferFilePurpose('describe("foo", () => {})', 'test/foo.test.ts')).toBe('Test suite')
  })

  it('infers utility module from utils/ path', () => {
    expect(inferFilePurpose('export function foo() {}', 'src/utils/format.ts')).toBe('Utility module with helper functions')
  })

  it('infers from @oclif import', () => {
    expect(inferFilePurpose('import { Command } from "@oclif/core"', 'my-file.ts')).toBe('CLI command module')
  })

  it('infers barrel file from index.ts', () => {
    const result = inferFilePurpose('export * from "./foo"', 'src/index.ts')
    expect(result).toContain('barrel')
  })

  it('infers core module from core/ path', () => {
    expect(inferFilePurpose('export class Foo {}', 'src/core/discovery.ts')).toBe('Core library module')
  })

  it('defaults to source file', () => {
    expect(inferFilePurpose('const x = 1', 'random.ts')).toContain('source file')
  })
})

// ─── Section Description ──────────────────────────────────────────────────────

describe('inferSectionDescription', () => {
  it('describes classes', () => {
    expect(inferSectionDescription('Foo', 'class', [], '')).toContain('Class definition')
  })

  it('describes interfaces', () => {
    expect(inferSectionDescription('Config', 'interface', [], '')).toContain('Type contract')
  })

  it('describes getters', () => {
    const desc = inferSectionDescription('getName', 'function', [], '')
    expect(desc).toContain('retrieves')
  })

  it('describes validators', () => {
    const desc = inferSectionDescription('validateConfig', 'function', [], '')
    expect(desc).toContain('Validation')
  })

  it('describes formatters', () => {
    const desc = inferSectionDescription('formatOutput', 'function', [], '')
    expect(desc).toContain('Formatting')
  })

  it('describes parsers', () => {
    const desc = inferSectionDescription('parseJSON', 'function', [], '')
    expect(desc).toContain('Parsing')
  })

  it('describes predicates', () => {
    const desc = inferSectionDescription('isValid', 'function', [], '')
    expect(desc).toContain('Predicate')
  })

  it('describes factories', () => {
    const desc = inferSectionDescription('buildResult', 'function', [], '')
    expect(desc).toContain('Factory')
  })

  it('describes handlers', () => {
    const desc = inferSectionDescription('handleClick', 'function', [], '')
    expect(desc).toContain('Event handler')
  })

  it('describes generic functions with params', () => {
    const desc = inferSectionDescription('processData', 'function', [{ name: 'data', type: 'string', purpose: 'Input' }], '')
    expect(desc).toContain('processData')
    expect(desc).toContain('data')
  })
})

// ─── Call Extraction ──────────────────────────────────────────────────────────

describe('extractCallsFromSection', () => {
  it('extracts function calls', () => {
    const calls = extractCallsFromSection('function foo() { bar(); baz() }', 'foo')
    expect(calls).toContain('bar')
    expect(calls).toContain('baz')
  })

  it('excludes self-calls', () => {
    const calls = extractCallsFromSection('function foo() { foo() }', 'foo')
    expect(calls).not.toContain('foo')
  })

  it('excludes keywords', () => {
    const calls = extractCallsFromSection('if (x) { return bar() }', 'test')
    expect(calls).not.toContain('if')
    expect(calls).not.toContain('return')
    expect(calls).toContain('bar')
  })

  it('deduplicates calls', () => {
    const calls = extractCallsFromSection('bar(); bar()', 'foo')
    const barCount = calls.filter((c) => c === 'bar').length
    expect(barCount).toBe(1)
  })
})

// ─── Return Type Inference ────────────────────────────────────────────────────

describe('inferReturnType', () => {
  it('infers explicit return type', () => {
    expect(inferReturnType('function foo(): string { return "hi" }', 'function')).toBe('string')
  })

  it('infers void for no return', () => {
    expect(inferReturnType('function foo() { console.log("hi") }', 'function')).toBe('void')
  })

  it('infers string from return literal', () => {
    expect(inferReturnType('function foo() { return "hi" }', 'function')).toBe('string')
  })

  it('infers number from return literal', () => {
    expect(inferReturnType('function foo() { return 42 }', 'function')).toBe('number')
  })

  it('infers boolean from return literal', () => {
    expect(inferReturnType('function foo() { return true }', 'function')).toBe('boolean')
  })

  it('returns instance for class', () => {
    expect(inferReturnType('class Foo {}', 'class')).toBe('instance')
  })

  it('returns object for interface', () => {
    expect(inferReturnType('interface Foo {}', 'interface')).toBe('object')
  })
})

// ─── Metrics ──────────────────────────────────────────────────────────────────

describe('computeMetrics', () => {
  it('counts lines', () => {
    const metrics = computeMetrics('line1\nline2\nline3', [])
    expect(metrics.lines).toBe(3)
  })

  it('counts functions', () => {
    const sections: CodeSection[] = [
      { type: 'function', name: 'a', lineStart: 1, lineEnd: 1, description: '', complexity: 'simple', calls: [], calledBy: [], parameters: [], returns: 'void', sideEffects: [], controlFlow: 'linear' },
      { type: 'constant', name: 'b', lineStart: 2, lineEnd: 2, description: '', complexity: 'simple', calls: [], calledBy: [], parameters: [{ name: 'x', type: 'number', purpose: 'x' }], returns: 'number', sideEffects: [], controlFlow: 'linear' },
    ]
    const metrics = computeMetrics('x', sections)
    expect(metrics.functions).toBe(2)
  })

  it('counts classes', () => {
    const sections: CodeSection[] = [
      { type: 'class', name: 'Foo', lineStart: 1, lineEnd: 1, description: '', complexity: 'simple', calls: [], calledBy: [], parameters: [], returns: 'instance', sideEffects: [], controlFlow: 'linear' },
    ]
    const metrics = computeMetrics('x', sections)
    expect(metrics.classes).toBe(1)
  })

  it('counts imports', () => {
    const metrics = computeMetrics('import { x } from "y"\nimport { z } from "w"', [])
    expect(metrics.imports).toBe(2)
  })
})

// ─── Overview ─────────────────────────────────────────────────────────────────

describe('generateOverview', () => {
  it('describes file structure', () => {
    const overview = generateOverview('foo.ts', 'TypeScript', [
      { type: 'function', name: 'foo', lineStart: 1, lineEnd: 5, description: '', complexity: 'simple', calls: [], calledBy: [], parameters: [], returns: 'void', sideEffects: [], controlFlow: 'linear' },
    ], ['./bar'], { lines: 10, functions: 1, classes: 0, imports: 1, exports: 0, complexity: 1 })
    expect(overview).toContain('TypeScript')
    expect(overview).toContain('10 lines')
    expect(overview).toContain('1 function')
    expect(overview).toContain('1 internal')
  })

  it('handles no dependencies', () => {
    const overview = generateOverview('foo.ts', 'TypeScript', [], [], { lines: 5, functions: 0, classes: 0, imports: 0, exports: 0, complexity: 1 })
    expect(overview).toContain('5 lines')
    expect(overview).not.toContain('Depends on')
  })
})

// ─── CalledBy Resolution ──────────────────────────────────────────────────────

describe('resolveCalledBy', () => {
  it('resolves caller relationships', () => {
    const sections: CodeSection[] = [
      { type: 'function', name: 'main', lineStart: 1, lineEnd: 3, description: '', complexity: 'simple', calls: ['helper'], calledBy: [], parameters: [], returns: 'void', sideEffects: [], controlFlow: 'linear' },
      { type: 'function', name: 'helper', lineStart: 5, lineEnd: 7, description: '', complexity: 'simple', calls: [], calledBy: [], parameters: [], returns: 'void', sideEffects: [], controlFlow: 'linear' },
    ]
    resolveCalledBy(sections)
    expect(sections[1]?.calledBy).toContain('main')
  })
})

// ─── Build Code Explanation ───────────────────────────────────────────────────

describe('buildCodeExplanation', () => {
  const sampleCode = `import { Command } from '@oclif/core'
import ora from 'ora'

export function formatOutput(data: string): string {
  if (!data) return ''
  return data.trim()
}

export class MyCommand extends Command {
  async run() {
    const spinner = ora('Loading...').start()
    spinner.succeed('Done')
  }
}
`

  it('builds full explanation', () => {
    const result = buildCodeExplanation('src/commands/mycommand.ts', sampleCode, {})
    expect(result.file).toBe('src/commands/mycommand.ts')
    expect(result.language).toBe('TypeScript')
    expect(result.purpose).toBeTruthy()
    expect(result.overview).toBeTruthy()
    expect(result.dependencies.length).toBeGreaterThan(0)
    expect(result.sections.length).toBeGreaterThan(0)
    expect(result.patterns).toBeInstanceOf(Array)
    expect(result.metrics.lines).toBe(15)
  })

  it('filters by line number', () => {
    const result = buildCodeExplanation('test.ts', sampleCode, { line: 5 })
    expect(result.sections.every((s) => s.lineStart <= 5 && s.lineEnd >= 5)).toBe(true)
  })

  it('filters by function name', () => {
    const result = buildCodeExplanation('test.ts', sampleCode, { functionName: 'formatOutput' })
    expect(result.sections.length).toBe(1)
    expect(result.sections[0]?.name).toBe('formatOutput')
  })

  it('returns all sections when no filter', () => {
    const result = buildCodeExplanation('test.ts', sampleCode, {})
    expect(result.sections.length).toBeGreaterThanOrEqual(2)
  })

  it('populates metrics', () => {
    const result = buildCodeExplanation('test.ts', sampleCode, {})
    expect(result.metrics.lines).toBeGreaterThan(0)
    expect(result.metrics.imports).toBeGreaterThan(0)
  })
})

// ─── Escape Regex ─────────────────────────────────────────────────────────────

describe('escapeRegex', () => {
  it('escapes special characters', () => {
    expect(escapeRegex('foo.bar')).toBe('foo\\.bar')
    expect(escapeRegex('a+b')).toBe('a\\+b')
    expect(escapeRegex('a*b')).toBe('a\\*b')
  })

  it('returns plain strings unchanged', () => {
    expect(escapeRegex('hello')).toBe('hello')
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatExplainJson', () => {
  it('produces valid JSON', () => {
    const explanation = buildCodeExplanation('test.ts', 'const x = 1', {})
    const json = formatExplainJson(explanation)
    const parsed = JSON.parse(json)
    expect(parsed.file).toBe('test.ts')
  })
})

describe('formatExplainCsv', () => {
  it('produces CSV with header', () => {
    const explanation = buildCodeExplanation('test.ts', 'function foo() {\n  return 1\n}', {})
    const csv = formatExplainCsv(explanation)
    expect(csv.split('\n')[0]).toContain('name,type,lineStart')
    expect(csv.split('\n').length).toBeGreaterThanOrEqual(2)
  })
})

describe('formatExplainTable', () => {
  it('produces table output', () => {
    const explanation = buildCodeExplanation('test.ts', 'function foo() { return 1 }', {})
    const table = formatExplainTable(explanation)
    expect(table).toContain('Code Explanation')
    expect(table).toContain('Language')
    expect(table).toContain('Purpose')
  })

  it('shows verbose info', () => {
    const code = `function main() {\n  helper()\n}\nfunction helper() {}`
    const explanation = buildCodeExplanation('test.ts', code, { verbose: true })
    const table = formatExplainTable(explanation, true)
    const mainSection = explanation.sections.find((s) => s.name === 'main')
    expect(mainSection).toBeDefined()
    expect(mainSection?.calls).toContain('helper')
  })
})

describe('formatMetrics', () => {
  it('formats metrics line', () => {
    const result = formatMetrics({ lines: 100, functions: 3, classes: 1, imports: 5, exports: 2, complexity: 8 })
    expect(result).toContain('100')
    expect(result).toContain('3')
  })
})

describe('formatParam', () => {
  it('formats parameter', () => {
    const result = formatParam({ name: 'x', type: 'number', purpose: 'Input value' })
    expect(result).toContain('x')
    expect(result).toContain('number')
    expect(result).toContain('Input value')
  })
})

describe('formatSection', () => {
  it('formats section with basic info', () => {
    const section: CodeSection = {
      type: 'function',
      name: 'foo',
      lineStart: 1,
      lineEnd: 5,
      description: 'Test function',
      complexity: 'simple',
      calls: [],
      calledBy: [],
      parameters: [],
      returns: 'void',
      sideEffects: [],
      controlFlow: 'linear',
    }
    const result = formatSection(section)
    expect(result).toContain('foo')
    expect(result).toContain('L1-5')
    expect(result).toContain('Test function')
  })

  it('shows side effects when present', () => {
    const section: CodeSection = {
      type: 'function',
      name: 'foo',
      lineStart: 1,
      lineEnd: 1,
      description: '',
      complexity: 'simple',
      calls: [],
      calledBy: [],
      parameters: [],
      returns: 'void',
      sideEffects: ['logging', 'file-io'],
      controlFlow: 'linear',
    }
    const result = formatSection(section)
    expect(result).toContain('Side Effects')
  })
})

describe('complexityIndicator', () => {
  it('returns indicator string', () => {
    expect(typeof complexityIndicator('simple')).toBe('string')
    expect(typeof complexityIndicator('moderate')).toBe('string')
    expect(typeof complexityIndicator('complex')).toBe('string')
  })
})

describe('controlFlowLabel', () => {
  it('returns label for each flow type', () => {
    expect(typeof controlFlowLabel('linear')).toBe('string')
    expect(typeof controlFlowLabel('branching')).toBe('string')
    expect(typeof controlFlowLabel('looping')).toBe('string')
    expect(typeof controlFlowLabel('recursive')).toBe('string')
    expect(typeof controlFlowLabel('async')).toBe('string')
  })
})

describe('sideEffectLabel', () => {
  it('returns label for each effect type', () => {
    expect(typeof sideEffectLabel('file-io')).toBe('string')
    expect(typeof sideEffectLabel('logging')).toBe('string')
    expect(typeof sideEffectLabel('env-access')).toBe('string')
    expect(typeof sideEffectLabel('network')).toBe('string')
  })
})
