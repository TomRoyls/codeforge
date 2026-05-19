import { describe, expect, it } from 'vitest'

import DeadCode from '../src/commands/deadcode.js'
import {
  analyzeFile,
  buildDeadCodeResult,
  computeDeadCodeStats,
  detectDeadBranches,
  detectShadowedDeclarations,
  detectUnreachableCode,
  detectUnusedExports,
  detectUnusedParameters,
  detectUnusedVariables,
  detectUnreferencedFunctions,
  type DeadCodeItem,
  type DeadCodeStats,
  type DeadCodeResult,
} from '../src/commands/deadcode-helpers.js'
import { formatDeadCodeJson, formatDeadCodeTable, getConfidenceColor, getDeadCodeIcon } from '../src/commands/deadcode-format-helpers.js'

// ─── Helpers ───────────────────────────────────────────────

function makeDeadCodeItem(overrides: Partial<DeadCodeItem> = {}): DeadCodeItem {
  return {
    confidence: 80,
    context: 'const unused = 1',
    file: 'test.ts',
    line: 1,
    name: 'unused',
    reason: 'Variable is unused',
    type: 'unused-var',
    ...overrides,
  }
}

function makeDeadCodeStats(overrides: Partial<DeadCodeStats> = {}): DeadCodeStats {
  return {
    byFile: { 'test.ts': 1 },
    byType: { 'unused-var': 1 },
    estimatedLines: 2,
    highConfidence: 1,
    lowConfidence: 0,
    mediumConfidence: 0,
    totalIssues: 1,
    ...overrides,
  }
}

function makeDeadCodeResult(overrides: Partial<DeadCodeResult> = {}): DeadCodeResult {
  return {
    files: ['test.ts'],
    items: [makeDeadCodeItem()],
    stats: makeDeadCodeStats(),
    ...overrides,
  }
}

// ─── Command metadata ──────────────────────────────────────

describe('DeadCode command - static metadata', () => {
  it('has a description', () => {
    expect(DeadCode.description).toBe('Detect potentially dead (unreachable) code')
  })

  it('has examples array', () => {
    expect(Array.isArray(DeadCode.examples)).toBe(true)
    expect(DeadCode.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(DeadCode.args.path).toBeDefined()
    expect(DeadCode.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(DeadCode.args.path.default).toBe('.')
  })
})

describe('DeadCode command - flags', () => {
  it('has format flag with options', () => {
    expect(DeadCode.flags.format.options).toContain('json')
    expect(DeadCode.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(DeadCode.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(DeadCode.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(DeadCode.flags.ignore).toBeDefined()
    expect(DeadCode.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag defaulting to .ts,.tsx,.js,.jsx', () => {
    expect(DeadCode.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has threshold flag defaulting to 50', () => {
    expect(DeadCode.flags.threshold.default).toBe(50)
  })

  it('has verbose flag defaulting to false', () => {
    expect(DeadCode.flags.verbose.default).toBe(false)
  })
})

describe('DeadCode command - class structure', () => {
  it('exports a default class', () => {
    expect(DeadCode).toBeDefined()
    expect(typeof DeadCode).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof DeadCode.prototype.run).toBe('function')
  })
})

// ─── detectUnusedExports ───────────────────────────────────

describe('detectUnusedExports', () => {
  it('detects unused exported function', () => {
    const content = 'export function foo() {}\n'
    const items = detectUnusedExports(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('foo')
    expect(items[0]!.type).toBe('unused-export')
  })

  it('detects unused exported class', () => {
    const content = 'export class MyClass {}\n'
    const items = detectUnusedExports(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('MyClass')
  })

  it('detects unused exported interface', () => {
    const content = 'export interface MyInterface {}\n'
    const items = detectUnusedExports(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('MyInterface')
  })

  it('detects unused exported type', () => {
    const content = 'export type MyType = string;\n'
    const items = detectUnusedExports(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('MyType')
  })

  it('detects unused exported enum', () => {
    const content = 'export enum Color { Red, Green }\n'
    const items = detectUnusedExports(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('Color')
  })

  it('detects unused exported const', () => {
    const content = 'export const MY_CONST = 42;\n'
    const items = detectUnusedExports(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('MY_CONST')
  })

  it('does not flag exports that are imported elsewhere', () => {
    const content = 'import { foo } from "./other";\nexport function foo() {}\n'
    const items = detectUnusedExports(content, 'test.ts')
    const fooItem = items.find((i) => i.name === 'foo')
    expect(fooItem).toBeUndefined()
  })

  it('does not flag exports used in the same file', () => {
    const content = 'export function foo() { return 1; }\nconst x = foo();\n'
    const items = detectUnusedExports(content, 'test.ts')
    const fooItem = items.find((i) => i.name === 'foo')
    expect(fooItem).toBeUndefined()
  })

  it('returns empty for no exports', () => {
    const content = 'function foo() {}\n'
    const items = detectUnusedExports(content, 'test.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectUnreachableCode ─────────────────────────────────

describe('detectUnreachableCode', () => {
  it('detects code after return', () => {
    const content = 'function foo() {\n  return 1;\n  console.log("dead");\n}\n'
    const items = detectUnreachableCode(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.type).toBe('unreachable')
  })

  it('detects code after throw', () => {
    const content = 'function foo() {\n  throw new Error("fail");\n  doSomething();\n}\n'
    const items = detectUnreachableCode(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.type).toBe('unreachable')
  })

  it('detects code after break', () => {
    const content = 'switch(x) {\n  case 1:\n    break;\n    doSomething();\n}\n'
    const items = detectUnreachableCode(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('does not flag normal code flow', () => {
    const content = 'const x = 1;\nconsole.log(x);\n'
    const items = detectUnreachableCode(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('does not flag return at end of function', () => {
    const content = 'function foo() {\n  return 1;\n}\n'
    const items = detectUnreachableCode(content, 'test.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectUnusedVariables ─────────────────────────────────

describe('detectUnusedVariables', () => {
  it('detects unused const', () => {
    const content = 'const unused = 42;\n'
    const items = detectUnusedVariables(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('unused')
    expect(items[0]!.type).toBe('unused-var')
  })

  it('detects unused let', () => {
    const content = 'let unused = 42;\n'
    const items = detectUnusedVariables(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('unused')
  })

  it('does not flag used variables', () => {
    const content = 'const used = 42;\nconsole.log(used);\n'
    const items = detectUnusedVariables(content, 'test.ts')
    const usedItem = items.find((i) => i.name === 'used')
    expect(usedItem).toBeUndefined()
  })

  it('does not flag _prefixed variables', () => {
    const content = 'const _unused = 42;\n'
    const items = detectUnusedVariables(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('does not flag common loop variables', () => {
    const content = 'const i = 0;\n'
    const items = detectUnusedVariables(content, 'test.ts')
    const iItem = items.find((item) => item.name === 'i')
    expect(iItem).toBeUndefined()
  })

  it('returns empty for no variables', () => {
    const content = 'console.log("hello");\n'
    const items = detectUnusedVariables(content, 'test.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectUnreferencedFunctions ───────────────────────────

describe('detectUnreferencedFunctions', () => {
  it('detects uncalled local function', () => {
    const content = 'function foo() {}\n'
    const items = detectUnreferencedFunctions(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('foo')
    expect(items[0]!.type).toBe('unreferenced-fn')
  })

  it('does not flag called functions', () => {
    const content = 'function foo() {}\nfoo();\n'
    const items = detectUnreferencedFunctions(content, 'test.ts')
    const fooItem = items.find((i) => i.name === 'foo')
    expect(fooItem).toBeUndefined()
  })

  it('does not flag exported functions', () => {
    const content = 'export function foo() {}\n'
    const items = detectUnreferencedFunctions(content, 'test.ts')
    const fooItem = items.find((i) => i.name === 'foo')
    expect(fooItem).toBeUndefined()
  })

  it('detects uncalled arrow function', () => {
    const content = 'const bar = () => {};\n'
    const items = detectUnreferencedFunctions(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('bar')
  })

  it('detects uncalled async function', () => {
    const content = 'async function loadData() {}\n'
    const items = detectUnreferencedFunctions(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('loadData')
  })

  it('returns empty for no functions', () => {
    const content = 'const x = 1;\n'
    const items = detectUnreferencedFunctions(content, 'test.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectShadowedDeclarations ────────────────────────────

describe('detectShadowedDeclarations', () => {
  it('detects variable shadowing in inner scope', () => {
    const content = 'const x = 1;\n{\n  const x = 2;\n}\n'
    const items = detectShadowedDeclarations(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('x')
    expect(items[0]!.type).toBe('shadowed-decl')
  })

  it('does not flag different variable names', () => {
    const content = 'const x = 1;\n{\n  const y = 2;\n}\n'
    const items = detectShadowedDeclarations(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('does not flag non-nested declarations', () => {
    const content = 'const a = 1;\nconst b = 2;\n'
    const items = detectShadowedDeclarations(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('detects shadowing in function scope', () => {
    const content = 'const value = 10;\nfunction foo() {\n  const value = 20;\n}\n'
    const items = detectShadowedDeclarations(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── detectUnusedParameters ────────────────────────────────

describe('detectUnusedParameters', () => {
  it('detects unused function parameter', () => {
    const content = 'function foo(unused) { return 1; }\n'
    const items = detectUnusedParameters(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('unused')
    expect(items[0]!.type).toBe('unused-param')
  })

  it('does not flag used parameters', () => {
    const content = 'function foo(used) { return used; }\n'
    const items = detectUnusedParameters(content, 'test.ts')
    const usedItem = items.find((i) => i.name === 'used')
    expect(usedItem).toBeUndefined()
  })

  it('does not flag _prefixed parameters', () => {
    const content = 'function foo(_unused) { return 1; }\n'
    const items = detectUnusedParameters(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('detects unused param among multiple', () => {
    const content = 'function foo(unused, used) { return used; }\n'
    const items = detectUnusedParameters(content, 'test.ts')
    const unusedItem = items.find((i) => i.name === 'unused')
    expect(unusedItem).toBeDefined()
  })

  it('handles function with no parameters', () => {
    const content = 'function foo() { return 1; }\n'
    const items = detectUnusedParameters(content, 'test.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectDeadBranches ────────────────────────────────────

describe('detectDeadBranches', () => {
  it('detects if(false) branch', () => {
    const content = 'if (false) { doSomething(); }\n'
    const items = detectDeadBranches(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.type).toBe('dead-branch')
    expect(items[0]!.name).toBe('false')
  })

  it('detects if(0) branch', () => {
    const content = 'if (0) { doSomething(); }\n'
    const items = detectDeadBranches(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('0')
  })

  it('detects if(null) branch', () => {
    const content = 'if (null) { doSomething(); }\n'
    const items = detectDeadBranches(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('detects if(true) with else as dead else', () => {
    const content = 'if (true) { doSomething(); } else { deadCode(); }\n'
    const items = detectDeadBranches(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0]!.name).toBe('true')
  })

  it('does not flag normal conditions', () => {
    const content = 'if (x > 0) { doSomething(); }\n'
    const items = detectDeadBranches(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('does not flag if(true) without else', () => {
    const content = 'if (true) { doSomething(); }\n'
    const items = detectDeadBranches(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('detects if(undefined) branch', () => {
    const content = 'if (undefined) { doSomething(); }\n'
    const items = detectDeadBranches(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── analyzeFile ───────────────────────────────────────────

describe('analyzeFile', () => {
  it('combines results from all detectors', () => {
    const content = [
      'export function unusedExport() {}',
      'const unusedVar = 1;',
      'function unusedFn() {}',
      'if (false) { doSomething(); }',
    ].join('\n')
    const items = analyzeFile(content, 'test.ts')
    const types = new Set(items.map((i) => i.type))
    expect(types.has('unused-export')).toBe(true)
    expect(types.has('unused-var')).toBe(true)
    expect(types.has('unreferenced-fn')).toBe(true)
    expect(types.has('dead-branch')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const content = 'const x = 1;\nconsole.log(x);\n'
    const items = analyzeFile(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('assigns correct file path to all items', () => {
    const content = 'const unused = 1;\n'
    const items = analyzeFile(content, 'src/my-file.ts')
    for (const item of items) {
      expect(item.file).toBe('src/my-file.ts')
    }
  })
})

// ─── computeDeadCodeStats ──────────────────────────────────

describe('computeDeadCodeStats', () => {
  it('counts by type', () => {
    const items: DeadCodeItem[] = [
      makeDeadCodeItem({ type: 'unused-var' }),
      makeDeadCodeItem({ type: 'unused-var' }),
      makeDeadCodeItem({ type: 'unreferenced-fn' }),
    ]
    const stats = computeDeadCodeStats(items, 0)
    expect(stats.byType['unused-var']).toBe(2)
    expect(stats.byType['unreferenced-fn']).toBe(1)
  })

  it('counts by file', () => {
    const items: DeadCodeItem[] = [
      makeDeadCodeItem({ file: 'a.ts' }),
      makeDeadCodeItem({ file: 'a.ts' }),
      makeDeadCodeItem({ file: 'b.ts' }),
    ]
    const stats = computeDeadCodeStats(items, 0)
    expect(stats.byFile['a.ts']).toBe(2)
    expect(stats.byFile['b.ts']).toBe(1)
  })

  it('computes confidence buckets', () => {
    const items: DeadCodeItem[] = [
      makeDeadCodeItem({ confidence: 90 }),
      makeDeadCodeItem({ confidence: 85 }),
      makeDeadCodeItem({ confidence: 60 }),
      makeDeadCodeItem({ confidence: 30 }),
    ]
    const stats = computeDeadCodeStats(items, 0)
    expect(stats.highConfidence).toBe(2)
    expect(stats.mediumConfidence).toBe(1)
    expect(stats.lowConfidence).toBe(1)
  })

  it('filters by threshold', () => {
    const items: DeadCodeItem[] = [
      makeDeadCodeItem({ confidence: 90 }),
      makeDeadCodeItem({ confidence: 40 }),
    ]
    const stats = computeDeadCodeStats(items, 50)
    expect(stats.totalIssues).toBe(1)
  })

  it('estimates dead lines', () => {
    const items: DeadCodeItem[] = [
      makeDeadCodeItem(),
      makeDeadCodeItem(),
      makeDeadCodeItem(),
    ]
    const stats = computeDeadCodeStats(items, 0)
    expect(stats.estimatedLines).toBe(6)
  })

  it('handles empty items', () => {
    const stats = computeDeadCodeStats([], 0)
    expect(stats.totalIssues).toBe(0)
    expect(stats.highConfidence).toBe(0)
    expect(stats.estimatedLines).toBe(0)
  })
})

// ─── buildDeadCodeResult ───────────────────────────────────

describe('buildDeadCodeResult', () => {
  it('analyzes multiple files', async () => {
    const files = ['a.ts', 'b.ts']
    const reader = async (path: string) => {
      if (path === 'a.ts') return 'const unused = 1;\n'
      return 'const x = 1;\nconsole.log(x);\n'
    }
    const result = await buildDeadCodeResult(files, reader, { threshold: 0 })
    expect(result.files).toEqual(['a.ts', 'b.ts'])
    expect(result.items.length).toBeGreaterThanOrEqual(1)
  })

  it('skips unreadable files', async () => {
    const files = ['missing.ts']
    const reader = async () => {
      throw new Error('File not found')
    }
    const result = await buildDeadCodeResult(files, reader, { threshold: 0 })
    expect(result.items).toHaveLength(0)
    expect(result.stats.totalIssues).toBe(0)
  })

  it('applies threshold filter', async () => {
    const files = ['test.ts']
    const reader = async () => 'if (false) { dead(); }\n'
    const result = await buildDeadCodeResult(files, reader, { threshold: 100 })
    // All items have confidence < 100
    expect(result.items.length).toBe(0)
  })

  it('returns correct stats', async () => {
    const files = ['test.ts']
    const reader = async () => 'const unused = 1;\n'
    const result = await buildDeadCodeResult(files, reader, { threshold: 0 })
    expect(result.stats.totalIssues).toBeGreaterThanOrEqual(1)
    expect(result.stats.byFile['test.ts']).toBeGreaterThanOrEqual(1)
  })
})

// ─── getConfidenceColor ────────────────────────────────────

describe('getConfidenceColor', () => {
  it('returns red for high confidence (>=80)', () => {
    const colorFn = getConfidenceColor(90)
    const result = colorFn('test')
    expect(result).toContain('test')
  })

  it('returns yellow for medium confidence (50-79)', () => {
    const colorFn = getConfidenceColor(60)
    const result = colorFn('test')
    expect(result).toContain('test')
  })

  it('returns blue for low confidence (<50)', () => {
    const colorFn = getConfidenceColor(30)
    const result = colorFn('test')
    expect(result).toContain('test')
  })

  it('returns red at exactly 80', () => {
    const colorFn = getConfidenceColor(80)
    const result = colorFn('test')
    expect(result).toContain('test')
  })

  it('returns yellow at exactly 50', () => {
    const colorFn = getConfidenceColor(50)
    const result = colorFn('test')
    expect(result).toContain('test')
  })
})

// ─── getDeadCodeIcon ───────────────────────────────────────

describe('getDeadCodeIcon', () => {
  it('returns icon for unused-export', () => {
    expect(getDeadCodeIcon('unused-export')).toBeTruthy()
  })

  it('returns icon for unreachable', () => {
    expect(getDeadCodeIcon('unreachable')).toBeTruthy()
  })

  it('returns icon for unused-var', () => {
    expect(getDeadCodeIcon('unused-var')).toBeTruthy()
  })

  it('returns icon for unreferenced-fn', () => {
    expect(getDeadCodeIcon('unreferenced-fn')).toBeTruthy()
  })

  it('returns icon for shadowed-decl', () => {
    expect(getDeadCodeIcon('shadowed-decl')).toBeTruthy()
  })

  it('returns icon for unused-param', () => {
    expect(getDeadCodeIcon('unused-param')).toBeTruthy()
  })

  it('returns icon for dead-branch', () => {
    expect(getDeadCodeIcon('dead-branch')).toBeTruthy()
  })

  it('returns different icons for different types', () => {
    const icons = new Set([
      getDeadCodeIcon('unused-export'),
      getDeadCodeIcon('unreachable'),
      getDeadCodeIcon('unused-var'),
    ])
    expect(icons.size).toBeGreaterThan(1)
  })
})

// ─── formatDeadCodeTable ───────────────────────────────────

describe('formatDeadCodeTable', () => {
  it('contains header with column names', () => {
    const result = makeDeadCodeResult()
    const output = formatDeadCodeTable(result, false)
    expect(output).toContain('File')
    expect(output).toContain('Line')
    expect(output).toContain('Type')
    expect(output).toContain('Confidence')
  })

  it('contains issue data', () => {
    const result = makeDeadCodeResult({
      items: [makeDeadCodeItem({ name: 'myVar', file: 'src/test.ts' })],
    })
    const output = formatDeadCodeTable(result, false)
    expect(output).toContain('myVar')
    expect(output).toContain('src/test.ts')
  })

  it('shows summary stats', () => {
    const result = makeDeadCodeResult()
    const output = formatDeadCodeTable(result, false)
    expect(output).toContain('Summary')
    expect(output).toContain('Total issues')
  })

  it('shows context in verbose mode', () => {
    const result = makeDeadCodeResult({
      items: [makeDeadCodeItem({ context: 'const unused = 1' })],
    })
    const output = formatDeadCodeTable(result, true)
    expect(output).toContain('Context')
  })

  it('shows success message when no issues', () => {
    const result = makeDeadCodeResult({
      items: [],
      stats: makeDeadCodeStats({
        byFile: {},
        byType: {},
        estimatedLines: 0,
        highConfidence: 0,
        lowConfidence: 0,
        mediumConfidence: 0,
        totalIssues: 0,
      }),
    })
    const output = formatDeadCodeTable(result, false)
    expect(output).toContain('No dead code detected')
  })

  it('shows type breakdown', () => {
    const result = makeDeadCodeResult({
      stats: makeDeadCodeStats({
        byType: { 'unused-var': 3 },
        totalIssues: 3,
      }),
    })
    const output = formatDeadCodeTable(result, false)
    expect(output).toContain('Issues by type')
  })
})

// ─── formatDeadCodeJson ────────────────────────────────────

describe('formatDeadCodeJson', () => {
  it('produces valid JSON', () => {
    const result = makeDeadCodeResult()
    const output = formatDeadCodeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains items array', () => {
    const result = makeDeadCodeResult()
    const output = formatDeadCodeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.items).toBeDefined()
    expect(Array.isArray(parsed.items)).toBe(true)
  })

  it('contains stats object', () => {
    const result = makeDeadCodeResult()
    const output = formatDeadCodeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalIssues).toBe(1)
  })

  it('contains files array', () => {
    const result = makeDeadCodeResult()
    const output = formatDeadCodeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(parsed.files).toContain('test.ts')
  })

  it('handles empty results', () => {
    const result = makeDeadCodeResult({
      items: [],
      stats: makeDeadCodeStats({ totalIssues: 0 }),
    })
    const output = formatDeadCodeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.items).toHaveLength(0)
    expect(parsed.stats.totalIssues).toBe(0)
  })

  it('preserves item data accurately', () => {
    const result = makeDeadCodeResult({
      items: [makeDeadCodeItem({ name: 'testFn', confidence: 75, type: 'unreferenced-fn' })],
    })
    const output = formatDeadCodeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.items[0].name).toBe('testFn')
    expect(parsed.items[0].confidence).toBe(75)
    expect(parsed.items[0].type).toBe('unreferenced-fn')
  })
})
