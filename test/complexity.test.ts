import { describe, expect, it } from 'vitest'

import Complexity from '../src/commands/complexity.js'
import {
  analyzeFileComplexity,
  buildComplexityResult,
  calculateComplexity,
  extractFunctions,
  filterByThreshold,
  getRiskLevel,
  takeTop,
  type FunctionInfo,
  type FileComplexity,
  type ComplexityResult,
} from '../src/commands/complexity-helpers.js'

// ─── Test helpers ───────────────────────────────────────

function makeFunctionInfo(overrides: Partial<FunctionInfo> = {}): FunctionInfo {
  return {
    complexity: 1,
    endLine: 5,
    filePath: 'test.ts',
    linesOfCode: 5,
    name: 'testFunc',
    params: 0,
    riskLevel: 'low',
    startLine: 1,
    ...overrides,
  }
}

function makeFileComplexity(overrides: Partial<FileComplexity> = {}): FileComplexity {
  return {
    averageComplexity: 1,
    filePath: 'test.ts',
    functions: [makeFunctionInfo()],
    maxComplexity: 1,
    relativePath: 'test.ts',
    totalComplexity: 1,
    ...overrides,
  }
}

// ─── Command metadata ───────────────────────────────────

describe('Complexity command - static metadata', () => {
  it('has a description', () => {
    expect(Complexity.description).toContain('cyclomatic')
    expect(Complexity.description).toContain('cognitive')
  })

  it('has examples array', () => {
    expect(Array.isArray(Complexity.examples)).toBe(true)
    expect(Complexity.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Complexity.args.path).toBeDefined()
    expect(Complexity.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Complexity.args.path.default).toBe('.')
  })

  it('exports a default class', () => {
    expect(Complexity).toBeDefined()
    expect(typeof Complexity).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Complexity.prototype.run).toBe('function')
  })
})

// ─── Command flags ──────────────────────────────────────

describe('Complexity command - flags', () => {
  it('has format flag with options', () => {
    expect(Complexity.flags.format.options).toContain('json')
    expect(Complexity.flags.format.options).toContain('table')
    expect(Complexity.flags.format.options).toContain('markdown')
  })

  it('defaults format to table', () => {
    expect(Complexity.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Complexity.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Complexity.flags.ignore).toBeDefined()
    expect(Complexity.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Complexity.flags.ext).toBeDefined()
    expect(Complexity.flags.ext.default).toBe('')
  })

  it('has threshold flag defaulting to 0', () => {
    expect(Complexity.flags.threshold).toBeDefined()
    expect(Complexity.flags.threshold.default).toBe(0)
  })

  it('has top flag defaulting to 20', () => {
    expect(Complexity.flags.top).toBeDefined()
    expect(Complexity.flags.top.default).toBe(20)
  })

  it('has sort-by flag with options', () => {    expect(Complexity.flags['sort-by'].options).toContain('complexity')
    expect(Complexity.flags['sort-by'].options).toContain('name')
    expect(Complexity.flags['sort-by'].options).toContain('file')
  })

  it('defaults sort-by to complexity', () => {
    expect(Complexity.flags['sort-by'].default).toBe('complexity')
  })

  it('has format flag with char f', () => {
    expect(Complexity.flags.format.char).toBe('f')
  })
})

// ─── getRiskLevel ────────────────────────────────────────

describe('getRiskLevel', () => {
  it('returns low for complexity 1', () => {
    expect(getRiskLevel(1)).toBe('low')
  })

  it('returns low for complexity 5 (boundary)', () => {
    expect(getRiskLevel(5)).toBe('low')
  })

  it('returns medium for complexity 6 (boundary)', () => {
    expect(getRiskLevel(6)).toBe('medium')
  })

  it('returns medium for complexity 10 (boundary)', () => {
    expect(getRiskLevel(10)).toBe('medium')
  })

  it('returns high for complexity 11 (boundary)', () => {
    expect(getRiskLevel(11)).toBe('high')
  })

  it('returns high for complexity 20 (boundary)', () => {
    expect(getRiskLevel(20)).toBe('high')
  })

  it('returns very-high for complexity 21 (boundary)', () => {
    expect(getRiskLevel(21)).toBe('very-high')
  })

  it('returns very-high for complexity 50', () => {
    expect(getRiskLevel(50)).toBe('very-high')
  })
})

// ─── calculateComplexity ────────────────────────────────

describe('calculateComplexity', () => {
  it('returns 1 for base complexity (no decisions)', () => {
    expect(calculateComplexity('return 1;')).toBe(1)
  })

  it('returns 2 for one if statement', () => {
    expect(calculateComplexity('if (x) { return 1; }')).toBe(2)
  })

  it('counts multiple if/else', () => {
    const code = 'if (x) { a(); } else { b(); }'
    expect(calculateComplexity(code)).toBe(3)
  })

  it('counts for loop', () => {
    const code = 'for (let i = 0; i < 10; i++) { x(); }'
    expect(calculateComplexity(code)).toBe(2)
  })

  it('counts while loop', () => {
    const code = 'while (x) { y(); }'
    expect(calculateComplexity(code)).toBe(2)
  })

  it('counts switch case', () => {
    const code = 'case 1: break; case 2: break;'
    expect(calculateComplexity(code)).toBe(3)
  })

  it('counts catch', () => {
    const code = 'try { x(); } catch (e) { y(); }'
    expect(calculateComplexity(code)).toBe(2)
  })

  it('counts && operator', () => {
    const code = 'if (x && y) { z(); }'
    expect(calculateComplexity(code)).toBe(3)
  })

  it('counts || operator', () => {
    const code = 'if (x || y) { z(); }'
    expect(calculateComplexity(code)).toBe(3)
  })

  it('counts ternary ?', () => {
    const code = 'const x = a ? b : c;'
    expect(calculateComplexity(code)).toBe(2)
  })

  it('excludes optional chaining ?.', () => {
    const code = 'const x = obj?.prop;'
    expect(calculateComplexity(code)).toBe(1)
  })

  it('excludes TypeScript nullable ?:', () => {
    const code = 'function fn(x?: string): string | null { return x; }'
    expect(calculateComplexity(code)).toBe(1)
  })

  it('counts combined decision points', () => {
    const code = 'if (x && y) { for (let i = 0; i < n; i++) { if (a || b) { c(); } } }'
    // if(1) &&(1) for(1) if(1) ||(1) + base(1) = 6
    expect(calculateComplexity(code)).toBe(6)
  })

  it('returns 1 for empty string', () => {
    expect(calculateComplexity('')).toBe(1)
  })
})

// ─── extractFunctions ───────────────────────────────────

describe('extractFunctions', () => {
  it('detects named function declaration', () => {
    const code = 'function hello() { return 1; }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.name).toBe('hello')
  })

  it('detects arrow function', () => {
    const code = 'const add = (a, b) => { return a + b; }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.name).toBe('add')
  })

  it('detects function expression', () => {
    const code = 'const greet = function(name) { return name; }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.name).toBe('greet')
  })

  it('detects async function', () => {
    const code = 'async function fetchData() { return await fetch(url); }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.name).toBe('fetchData')
  })

  it('detects class method (private)', () => {
    const code = 'class Foo { private bar() { return 1; } }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns.some((fn) => fn.name === 'bar')).toBe(true)
  })

  it('detects class method (public)', () => {
    const code = 'class Foo { public bar() { return 1; } }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((fn) => fn.name === 'bar')).toBe(true)
  })

  it('detects static method', () => {
    const code = 'class Foo { static create() { return new Foo(); } }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((fn) => fn.name === 'create')).toBe(true)
  })

  it('detects getter', () => {
    const code = 'class Foo { get value() { return this._val; } }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((fn) => fn.name === 'value')).toBe(true)
  })

  it('detects setter', () => {
    const code = 'class Foo { set value(v) { this._val = v; } }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((fn) => fn.name === 'value')).toBe(true)
  })

  it('detects multiple functions in one file', () => {
    const code = `
function a() { return 1; }
function b() { return 2; }
const c = () => { return 3; }
`
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(3)
    const names = fns.map((fn) => fn.name)
    expect(names).toContain('a')
    expect(names).toContain('b')
    expect(names).toContain('c')
  })

  it('returns empty array for no functions', () => {
    const code = 'const x = 1;\nconst y = 2;'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns).toHaveLength(0)
  })

  it('counts params correctly for no params', () => {
    const code = 'function hello() { return 1; }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns[0]!.params).toBe(0)
  })

  it('counts params correctly for multiple params', () => {
    const code = 'function add(a, b, c) { return a + b + c; }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns[0]!.params).toBe(3)
  })

  it('computes startLine correctly', () => {
    const code = '\n\nfunction hello() { return 1; }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns[0]!.startLine).toBe(3)
  })

  it('computes linesOfCode correctly', () => {
    const code = 'function hello() {\n  return 1;\n}'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns[0]!.linesOfCode).toBe(3)
  })

  it('computes complexity for extracted function', () => {
    const code = 'function complex(x) { if (x) { return 1; } else { return 2; } }'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns[0]!.complexity).toBe(3) // if + else + base
  })
})

// ─── analyzeFileComplexity ──────────────────────────────

describe('analyzeFileComplexity', () => {
  it('computes correct file stats', () => {
    const code = `
function a() { return 1; }
function b(x) { if (x) { return 1; } }
`
    const result = analyzeFileComplexity(code, 'test.ts')
    expect(result.filePath).toBe('test.ts')
    expect(result.functions.length).toBeGreaterThanOrEqual(2)
    expect(result.totalComplexity).toBeGreaterThanOrEqual(3) // 1 + 2
  })

  it('handles empty file', () => {
    const result = analyzeFileComplexity('', 'empty.ts')
    expect(result.functions).toHaveLength(0)
    expect(result.totalComplexity).toBe(0)
    expect(result.averageComplexity).toBe(0)
    expect(result.maxComplexity).toBe(0)
  })

  it('computes maxComplexity correctly', () => {
    const code = `
function simple() { return 1; }
function complex(x) { if (x) { if (y) { return 1; } } }
`
    const result = analyzeFileComplexity(code, 'test.ts')
    expect(result.maxComplexity).toBeGreaterThanOrEqual(3)
  })
})

// ─── buildComplexityResult ──────────────────────────────

describe('buildComplexityResult', () => {
  it('computes correct totals and averages', () => {
    const fileResults: FileComplexity[] = [
      makeFileComplexity({
        functions: [
          makeFunctionInfo({ complexity: 2 }),
          makeFunctionInfo({ complexity: 4, name: 'otherFunc' }),
        ],
        totalComplexity: 6,
      }),
    ]
    const result = buildComplexityResult(fileResults)
    expect(result.totalFunctions).toBe(2)
    expect(result.totalComplexity).toBe(6)
    expect(result.averageComplexity).toBe(3)
  })

  it('computes byRiskLevel breakdown', () => {
    const fileResults: FileComplexity[] = [
      makeFileComplexity({
        functions: [
          makeFunctionInfo({ complexity: 3, riskLevel: 'low' }),
          makeFunctionInfo({ complexity: 8, riskLevel: 'medium', name: 'medFunc' }),
          makeFunctionInfo({ complexity: 15, riskLevel: 'high', name: 'highFunc' }),
          makeFunctionInfo({ complexity: 25, riskLevel: 'very-high', name: 'vhFunc' }),
        ],
        totalComplexity: 51,
      }),
    ]
    const result = buildComplexityResult(fileResults)
    const low = result.byRiskLevel.find((r) => r.level === 'low')
    const medium = result.byRiskLevel.find((r) => r.level === 'medium')
    const high = result.byRiskLevel.find((r) => r.level === 'high')
    const vh = result.byRiskLevel.find((r) => r.level === 'very-high')
    expect(low!.count).toBe(1)
    expect(medium!.count).toBe(1)
    expect(high!.count).toBe(1)
    expect(vh!.count).toBe(1)
  })

  it('computes byFile summary', () => {
    const fileResults: FileComplexity[] = [
      makeFileComplexity({ relativePath: 'a.ts', totalComplexity: 10, functions: [makeFunctionInfo()] }),
      makeFileComplexity({ relativePath: 'b.ts', totalComplexity: 5, functions: [makeFunctionInfo()] }),
    ]
    const result = buildComplexityResult(fileResults)
    expect(result.byFile).toHaveLength(2)
    expect(result.byFile[0]!.file).toBe('a.ts') // sorted desc by complexity
    expect(result.byFile[1]!.file).toBe('b.ts')
  })

  it('sorts functions by complexity descending', () => {
    const fileResults: FileComplexity[] = [
      makeFileComplexity({
        functions: [
          makeFunctionInfo({ complexity: 1, name: 'low' }),
          makeFunctionInfo({ complexity: 10, name: 'high' }),
          makeFunctionInfo({ complexity: 5, name: 'mid' }),
        ],
        totalComplexity: 16,
      }),
    ]
    const result = buildComplexityResult(fileResults)
    expect(result.functions[0]!.name).toBe('high')
    expect(result.functions[1]!.name).toBe('mid')
    expect(result.functions[2]!.name).toBe('low')
  })

  it('handles empty file results', () => {
    const result = buildComplexityResult([])
    expect(result.totalFunctions).toBe(0)
    expect(result.totalComplexity).toBe(0)
    expect(result.averageComplexity).toBe(0)
    expect(result.functions).toHaveLength(0)
  })
})

// ─── filterByThreshold ──────────────────────────────────

describe('filterByThreshold', () => {
  it('keeps functions above threshold', () => {
    const fns = [
      makeFunctionInfo({ complexity: 1, name: 'a' }),
      makeFunctionInfo({ complexity: 5, name: 'b' }),
      makeFunctionInfo({ complexity: 10, name: 'c' }),
    ]
    const result = filterByThreshold(fns, 5)
    expect(result).toHaveLength(1)
    expect(result.every((fn) => fn.complexity > 5)).toBe(true)
  })

  it('returns all with threshold 0', () => {
    const fns = [makeFunctionInfo({ complexity: 1 }), makeFunctionInfo({ complexity: 10 })]
    const result = filterByThreshold(fns, 0)
    expect(result).toHaveLength(2)
  })

  it('returns empty for high threshold', () => {
    const fns = [makeFunctionInfo({ complexity: 3 })]
    const result = filterByThreshold(fns, 100)
    expect(result).toHaveLength(0)
  })

  it('handles empty input', () => {
    expect(filterByThreshold([], 5)).toHaveLength(0)
  })
})

// ─── takeTop ────────────────────────────────────────────

describe('takeTop', () => {
  it('returns top N functions', () => {
    const fns = [1, 2, 3, 4, 5].map((i) => makeFunctionInfo({ complexity: i, name: `fn${i}` }))
    const result = takeTop(fns, 3)
    expect(result).toHaveLength(3)
  })

  it('returns all if N exceeds length', () => {
    const fns = [makeFunctionInfo(), makeFunctionInfo()]
    const result = takeTop(fns, 10)
    expect(result).toHaveLength(2)
  })

  it('returns empty for N = 0', () => {
    const fns = [makeFunctionInfo()]
    expect(takeTop(fns, 0)).toHaveLength(0)
  })

  it('handles empty input', () => {
    expect(takeTop([], 5)).toHaveLength(0)
  })
})
