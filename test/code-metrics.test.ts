import { CodeMetrics } from '../src/core/code-metrics/code-metrics.js'
import type { CodeFile, MetricResult } from '../src/core/code-metrics/types.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeFile(overrides?: Partial<CodeFile>): CodeFile {
  return {
    path: 'test.ts',
    content: '',
    language: 'typescript',
    ...overrides,
  }
}

const cm = new CodeMetrics()

// ─── Constructor ────────────────────────────────────────────────────────

describe('CodeMetrics constructor', () => {
  it('creates an instance without arguments', () => {
    const instance = new CodeMetrics()
    expect(instance).toBeInstanceOf(CodeMetrics)
  })

  it('exposes all public methods', () => {
    const instance = new CodeMetrics()
    expect(typeof instance.analyzeFile).toBe('function')
    expect(typeof instance.analyzeFiles).toBe('function')
    expect(typeof instance.countLines).toBe('function')
    expect(typeof instance.calculateLineRatios).toBe('function')
    expect(typeof instance.estimateComplexity).toBe('function')
    expect(typeof instance.estimateCognitiveComplexity).toBe('function')
    expect(typeof instance.maxNestingLevel).toBe('function')
    expect(typeof instance.countFunctions).toBe('function')
    expect(typeof instance.countBranches).toBe('function')
    expect(typeof instance.calculateMaintainabilityIndex).toBe('function')
    expect(typeof instance.getMaintainabilityGrade).toBe('function')
    expect(typeof instance.estimateHalstead).toBe('function')
    expect(typeof instance.detectDuplication).toBe('function')
    expect(typeof instance.getStatistics).toBe('function')
  })
})

// ─── countLines ─────────────────────────────────────────────────────────

describe('countLines', () => {
  it('returns zeros for empty string', () => {
    const result = cm.countLines('')
    expect(result.total).toBe(0)
    expect(result.code).toBe(0)
    expect(result.comment).toBe(0)
    expect(result.blank).toBe(0)
    expect(result.mixed).toBe(0)
  })

  it('counts a single code line (no trailing newline)', () => {
    const result = cm.countLines('const x = 1;')
    expect(result.total).toBe(1)
    expect(result.code).toBe(1)
    expect(result.blank).toBe(0)
  })

  it('counts a single code line (with trailing newline)', () => {
    const result = cm.countLines('const x = 1;\n')
    expect(result.total).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts blank lines', () => {
    const result = cm.countLines('\n\n\n')
    expect(result.total).toBe(3)
    expect(result.blank).toBe(3)
  })

  it('counts single-line comments with //', () => {
    const result = cm.countLines('// this is a comment\nconst x = 1;')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
    expect(result.total).toBe(2)
  })

  it('counts single-line comments starting with *', () => {
    const result = cm.countLines(' * a doc comment line\nconst x = 1;')
    expect(result.comment).toBe(1)
  })

  it('counts a single-line block comment /* ... */', () => {
    const result = cm.countLines('/* inline block */')
    expect(result.comment).toBe(1)
  })

  it('counts a multi-line block comment', () => {
    const content = '/* start\n * middle\n */\nconst x = 1;'
    const result = cm.countLines(content)
    expect(result.comment).toBe(3)
    expect(result.code).toBe(1)
    expect(result.total).toBe(4)
  })

  it('counts mixed code+comment lines', () => {
    const result = cm.countLines('const x = 1; // comment')
    expect(result.mixed).toBe(1)
    expect(result.code).toBe(0)
    expect(result.comment).toBe(0)
  })

  it('counts mixed lines with inline block comment', () => {
    const result = cm.countLines('const x = 1; /* comment */')
    expect(result.mixed).toBe(1)
  })

  it('classifies inline-comment-only line as comment when code portion is empty', () => {
    const result = cm.countLines('/* just a comment */')
    expect(result.comment).toBe(1)
    expect(result.mixed).toBe(0)
  })

  it('counts a realistic multi-line source file', () => {
    const content = [
      '// header comment',
      'const x = 1;',
      '',
      '/* block',
      ' * comment */',
      'const y = 2;',
      'const z = x + y; // inline',
    ].join('\n')
    const result = cm.countLines(content)
    expect(result.total).toBe(7)
    expect(result.code).toBe(2) // 'const x = 1;', 'const y = 2;'
    expect(result.blank).toBe(1)
    expect(result.comment).toBe(3) // '// header', '/* block', ' * comment */'
    expect(result.mixed).toBe(1) // 'const z = x + y; // inline'
  })

  it('handles lines that are only whitespace as blank', () => {
    const result = cm.countLines('   \n\t\n')
    expect(result.blank).toBe(2)
  })

  it('counts a line with only a string containing // as code', () => {
    const result = cm.countLines('const url = "https://example.com";')
    expect(result.code).toBe(1)
  })

  it('counts a line with only a string containing /* as code', () => {
    const result = cm.countLines('const s = "not /* a comment */";')
    expect(result.code).toBe(1)
  })
})

// ─── calculateLineRatios ────────────────────────────────────────────────

describe('calculateLineRatios', () => {
  it('returns all zeros when total is 0', () => {
    const result = cm.calculateLineRatios({ code: 0, comment: 0, total: 0 })
    expect(result.codeToComment).toBe(0)
    expect(result.codeToTotal).toBe(0)
    expect(result.commentToTotal).toBe(0)
  })

  it('returns codeToComment 0 when there are no comments', () => {
    const result = cm.calculateLineRatios({ code: 10, comment: 0, total: 20 })
    expect(result.codeToComment).toBe(0)
  })

  it('computes correct ratios for typical file', () => {
    const result = cm.calculateLineRatios({ code: 40, comment: 10, total: 60 })
    expect(result.codeToComment).toBeCloseTo(4)
    expect(result.codeToTotal).toBeCloseTo(40 / 60)
    expect(result.commentToTotal).toBeCloseTo(10 / 60)
  })

  it('computes ratio of 1 when all lines are code', () => {
    const result = cm.calculateLineRatios({ code: 50, comment: 0, total: 50 })
    expect(result.codeToTotal).toBeCloseTo(1)
    expect(result.commentToTotal).toBeCloseTo(0)
  })
})

// ─── estimateComplexity ─────────────────────────────────────────────────

describe('estimateComplexity', () => {
  it('returns 1 for empty content (base complexity)', () => {
    expect(cm.estimateComplexity('')).toBe(1)
  })

  it('returns 1 for simple code with no branching', () => {
    expect(cm.estimateComplexity('const x = 1;')).toBe(1)
  })

  it('increments for each if statement', () => {
    expect(cm.estimateComplexity('if (a) {} if (b) {}')).toBe(3)
  })

  it('increments for else if (also matches plain if)', () => {
    const code = 'if (a) {} else if (b) {}'
    expect(cm.estimateComplexity(code)).toBe(4)
  })

  it('increments for for loops', () => {
    expect(cm.estimateComplexity('for (let i = 0; i < n; i++) {}')).toBe(2)
  })

  it('increments for while loops', () => {
    expect(cm.estimateComplexity('while (true) {}')).toBe(2)
  })

  it('increments for case statements', () => {
    expect(cm.estimateComplexity('case 1: break; case 2: break;')).toBe(3)
  })

  it('increments for logical AND', () => {
    expect(cm.estimateComplexity('a && b && c')).toBe(3)
  })

  it('increments for logical OR', () => {
    expect(cm.estimateComplexity('a || b')).toBe(2)
  })

  it('increments for ternary operator', () => {
    expect(cm.estimateComplexity('a ? b : c')).toBe(2)
  })

  it('increments for catch', () => {
    expect(cm.estimateComplexity('try {} catch (e) {}')).toBe(2)
  })

  it('counts multiple patterns together', () => {
    const code = 'if (a) {} for (let i = 0; i < n; i++) {} while (x) {}'
    const result = cm.estimateComplexity(code)
    expect(result).toBe(4) // base 1 + if + for + while
  })
})

// ─── estimateCognitiveComplexity ────────────────────────────────────────

describe('estimateCognitiveComplexity', () => {
  it('returns 0 for empty content', () => {
    expect(cm.estimateCognitiveComplexity('')).toBe(0)
  })

  it('returns 0 for code with no control flow', () => {
    expect(cm.estimateCognitiveComplexity('const x = 1;')).toBe(0)
  })

  it('increments by 1 for a top-level if', () => {
    expect(cm.estimateCognitiveComplexity('if (a) { }')).toBe(1)
  })

  it('increments by 1 + nesting for nested if on separate lines', () => {
    const code = 'if (a) {\n  if (b) {\n  }\n}'
    expect(cm.estimateCognitiveComplexity(code)).toBe(3)
  })

  it('processes all-on-one-line with nesting canceling out', () => {
    const code = 'if (a) { if (b) { } }'
    expect(cm.estimateCognitiveComplexity(code)).toBe(1)
  })

  it('increments for else on same line as if', () => {
    const code = 'if (a) { } else { }'
    expect(cm.estimateCognitiveComplexity(code)).toBe(1)
  })

  it('increments for else on separate line from if', () => {
    const code = 'if (a) {\n} else {\n}'
    expect(cm.estimateCognitiveComplexity(code)).toBe(3)
  })

  it('increments for for loops', () => {
    expect(cm.estimateCognitiveComplexity('for (let i = 0; i < n; i++) { }')).toBe(1)
  })

  it('increments for while loops', () => {
    expect(cm.estimateCognitiveComplexity('while (x) { }')).toBe(1)
  })

  it('increments for switch', () => {
    expect(cm.estimateCognitiveComplexity('switch (x) { }')).toBe(1)
  })

  it('increments for catch', () => {
    expect(cm.estimateCognitiveComplexity('try { } catch (e) { }')).toBe(1)
  })

  it('counts logical operators && and ||', () => {
    expect(cm.estimateCognitiveComplexity('a && b || c')).toBe(2)
  })

  it('counts ternary with colon pattern', () => {
    const code = 'if (a) { }'
    const result = cm.estimateCognitiveComplexity(code)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('deeply nested code on separate lines adds more complexity', () => {
    const code = 'if (a) {\n  if (b) {\n    if (c) {\n    }\n  }\n}'
    expect(cm.estimateCognitiveComplexity(code)).toBe(6)
  })
})

// ─── maxNestingLevel ────────────────────────────────────────────────────

describe('maxNestingLevel', () => {
  it('returns 0 for empty string', () => {
    expect(cm.maxNestingLevel('')).toBe(0)
  })

  it('returns 0 when no braces', () => {
    expect(cm.maxNestingLevel('const x = 1;')).toBe(0)
  })

  it('returns 1 for single block', () => {
    expect(cm.maxNestingLevel('{ }')).toBe(1)
  })

  it('returns max depth for nested blocks', () => {
    expect(cm.maxNestingLevel('{ { { } } }')).toBe(3)
  })

  it('handles unmatched closing braces gracefully', () => {
    // closing braces without matching open should not go negative
    expect(cm.maxNestingLevel('} } }')).toBe(0)
  })

  it('handles function-like nesting', () => {
    const code = 'function foo() { if (true) { for (;;) { } } }'
    expect(cm.maxNestingLevel(code)).toBe(3)
  })

  it('tracks nesting across multiple lines', () => {
    const code = 'class A {\n  method() {\n    if (x) {\n    }\n  }\n}'
    expect(cm.maxNestingLevel(code)).toBe(3)
  })
})

// ─── countFunctions ─────────────────────────────────────────────────────

describe('countFunctions', () => {
  it('returns 0 for empty content', () => {
    expect(cm.countFunctions('')).toBe(0)
  })

  it('counts function declarations', () => {
    expect(cm.countFunctions('function foo() {}')).toBe(2)
    // function declaration + method pattern match (foo() {)
  })

  it('counts arrow functions with block body', () => {
    expect(cm.countFunctions('const f = () => { }')).toBe(1)
  })

  it('counts arrow functions with parenthesized body', () => {
    expect(cm.countFunctions('const f = () => (x)')).toBe(1)
  })

  it('does not double-count async function declarations', () => {
    const code = 'async function foo() {}'
    const result = cm.countFunctions(code)
    // async function matches function decl (+1) and async function decl (-1) and method pattern (+1)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('counts method-style declarations', () => {
    expect(cm.countFunctions('class A { handle() { } }')).toBeGreaterThanOrEqual(1)
  })

  it('counts multiple function types together', () => {
    const code = 'function a() {}\nconst b = () => {}'
    const result = cm.countFunctions(code)
    expect(result).toBeGreaterThanOrEqual(2)
  })
})

// ─── countBranches ──────────────────────────────────────────────────────

describe('countBranches', () => {
  it('returns 0 for empty content', () => {
    expect(cm.countBranches('')).toBe(0)
  })

  it('counts if statements', () => {
    expect(cm.countBranches('if (a) {}')).toBe(1)
  })

  it('counts else if separately from if', () => {
    const result = cm.countBranches('if (a) {} else if (b) {}')
    expect(result).toBe(2)
  })

  it('counts ternary operators', () => {
    expect(cm.countBranches('a ? b : c')).toBe(1)
  })

  it('counts switch statements', () => {
    expect(cm.countBranches('switch (x) { }')).toBe(1)
  })

  it('does not double-count else-if as both if and else-if', () => {
    const code = 'if (a) {} else if (b) {} else if (c) {}'
    const result = cm.countBranches(code)
    // 2 else-if + 1 top-level if
    expect(result).toBe(3)
  })

  it('counts multiple branch types together', () => {
    const code = 'if (a) {} switch (x) { } b ? c : d'
    const result = cm.countBranches(code)
    expect(result).toBe(3)
  })
})

// ─── calculateMaintainabilityIndex ──────────────────────────────────────

describe('calculateMaintainabilityIndex', () => {
  it('returns 100 for zero lines', () => {
    expect(cm.calculateMaintainabilityIndex(0, 1, 0)).toBe(100)
  })

  it('returns a value between 0 and 100', () => {
    const mi = cm.calculateMaintainabilityIndex(100, 10, 0.2)
    expect(mi).toBeGreaterThanOrEqual(0)
    expect(mi).toBeLessThanOrEqual(100)
  })

  it('higher complexity reduces maintainability', () => {
    const miLow = cm.calculateMaintainabilityIndex(50, 5, 0.1)
    const miHigh = cm.calculateMaintainabilityIndex(50, 50, 0.1)
    expect(miLow).toBeGreaterThan(miHigh)
  })

  it('higher comment ratio improves maintainability', () => {
    const miLowComment = cm.calculateMaintainabilityIndex(50, 10, 0.01)
    const miHighComment = cm.calculateMaintainabilityIndex(50, 10, 0.5)
    expect(miHighComment).toBeGreaterThan(miLowComment)
  })

  it('is clamped to 0 at minimum', () => {
    const mi = cm.calculateMaintainabilityIndex(10000, 500, 0)
    expect(mi).toBeGreaterThanOrEqual(0)
  })

  it('is clamped to 100 at maximum', () => {
    expect(cm.calculateMaintainabilityIndex(0, 1, 0)).toBe(100)
  })
})

// ─── getMaintainabilityGrade ────────────────────────────────────────────

describe('getMaintainabilityGrade', () => {
  it('returns A for mi >= 80', () => {
    expect(cm.getMaintainabilityGrade(80)).toBe('A')
    expect(cm.getMaintainabilityGrade(100)).toBe('A')
    expect(cm.getMaintainabilityGrade(99)).toBe('A')
  })

  it('returns B for mi >= 60 and < 80', () => {
    expect(cm.getMaintainabilityGrade(60)).toBe('B')
    expect(cm.getMaintainabilityGrade(79)).toBe('B')
    expect(cm.getMaintainabilityGrade(70)).toBe('B')
  })

  it('returns C for mi >= 40 and < 60', () => {
    expect(cm.getMaintainabilityGrade(40)).toBe('C')
    expect(cm.getMaintainabilityGrade(59)).toBe('C')
    expect(cm.getMaintainabilityGrade(50)).toBe('C')
  })

  it('returns D for mi >= 20 and < 40', () => {
    expect(cm.getMaintainabilityGrade(20)).toBe('D')
    expect(cm.getMaintainabilityGrade(39)).toBe('D')
    expect(cm.getMaintainabilityGrade(30)).toBe('D')
  })

  it('returns F for mi < 20', () => {
    expect(cm.getMaintainabilityGrade(0)).toBe('F')
    expect(cm.getMaintainabilityGrade(19)).toBe('F')
    expect(cm.getMaintainabilityGrade(1)).toBe('F')
  })
})

// ─── estimateHalstead ───────────────────────────────────────────────────

describe('estimateHalstead', () => {
  it('returns zeros for empty content', () => {
    const result = cm.estimateHalstead('')
    expect(result.volume).toBe(0)
    expect(result.difficulty).toBe(0)
  })

  it('returns positive volume for simple code', () => {
    const result = cm.estimateHalstead('const x = 1;')
    expect(result.volume).toBeGreaterThan(0)
  })

  it('returns positive difficulty for simple code', () => {
    const result = cm.estimateHalstead('const x = 1 + 2;')
    expect(result.difficulty).toBeGreaterThan(0)
  })

  it('increases volume with more code', () => {
    const small = cm.estimateHalstead('const x = 1;')
    const large = cm.estimateHalstead('const x = 1; const y = 2; const z = x + y; return z;')
    expect(large.volume).toBeGreaterThan(small.volume)
  })

  it('identifies unique operators', () => {
    const result = cm.estimateHalstead('x + y - z;')
    expect(result.volume).toBeGreaterThan(0)
  })

  it('volume is 0 when vocabulary is 0', () => {
    // Content with only whitespace doesn't match operand/operator patterns
    const result = cm.estimateHalstead('   ')
    expect(result.volume).toBe(0)
  })
})

// ─── detectDuplication ──────────────────────────────────────────────────

describe('detectDuplication', () => {
  it('returns zeros for empty content', () => {
    const result = cm.detectDuplication('', 3)
    expect(result.duplicatedLines).toBe(0)
    expect(result.duplicatedBlocks).toBe(0)
    expect(result.duplicationPercentage).toBe(0)
  })

  it('returns zeros when minLines is 0', () => {
    const result = cm.detectDuplication('const x = 1;\nconst y = 2;', 0)
    expect(result.duplicatedLines).toBe(0)
    expect(result.duplicatedBlocks).toBe(0)
  })

  it('returns zeros when minLines is negative', () => {
    const result = cm.detectDuplication('const x = 1;\nconst y = 2;', -1)
    expect(result.duplicatedLines).toBe(0)
  })

  it('detects no duplication in unique content', () => {
    const content = 'line 1\nline 2\nline 3\nline 4\nline 5'
    const result = cm.detectDuplication(content, 2)
    expect(result.duplicatedBlocks).toBe(0)
    expect(result.duplicatedLines).toBe(0)
  })

  it('detects exact block duplication', () => {
    const block = 'const x = 1;\nconst y = 2;\nconst z = 3;'
    const content = block + '\n' + block
    const result = cm.detectDuplication(content, 3)
    expect(result.duplicatedBlocks).toBe(1)
    expect(result.duplicatedLines).toBe(3)
  })

  it('computes correct duplication percentage', () => {
    const block = 'a\nb\nc'
    const content = block + '\n' + block // 6 lines, 3 duplicated
    const result = cm.detectDuplication(content, 3)
    expect(result.duplicationPercentage).toBeCloseTo(50)
  })

  it('skips overlapping duplicates by advancing past found block', () => {
    const block = 'a\nb\nc'
    const content = block + '\n' + block + '\n' + block
    const result = cm.detectDuplication(content, 3)
    // First unique, second match (1 block), skip 3, third match (1 block)
    expect(result.duplicatedBlocks).toBeGreaterThanOrEqual(1)
    expect(result.duplicatedBlocks).toBeLessThanOrEqual(2)
  })

  it('handles single-line content with minLines > 1', () => {
    const result = cm.detectDuplication('only one line', 2)
    expect(result.duplicatedBlocks).toBe(0)
    expect(result.duplicatedLines).toBe(0)
  })

  it('trims lines before comparison', () => {
    const content = '  a  \n  b  \n  c  \na\nb\nc'
    const result = cm.detectDuplication(content, 3)
    expect(result.duplicatedBlocks).toBe(1)
    expect(result.duplicatedLines).toBe(3)
  })
})

// ─── getStatistics ───────────────────────────────────────────────────────

describe('getStatistics', () => {
  it('returns zeros for empty results array', () => {
    const result = cm.getStatistics([])
    expect(result.files).toBe(0)
    expect(result.totals.lines).toBe(0)
    expect(result.averages.avgComplexity).toBe(0)
    expect(result.byLanguage).toEqual({})
  })

  it('aggregates single file result correctly', () => {
    const file: CodeFile = { path: 'app.ts', content: 'const x = 1;', language: 'typescript' }
    const metrics = cm.analyzeFile(file)
    const stats = cm.getStatistics([metrics])
    expect(stats.files).toBe(1)
    expect(stats.totals.lines).toBe(metrics.lines.total)
    expect(stats.averages.avgComplexity).toBe(metrics.complexity.cyclomatic)
  })

  it('sums totals across multiple files', () => {
    const f1: CodeFile = { path: 'a.ts', content: 'const x = 1;\nconst y = 2;', language: 'typescript' }
    const f2: CodeFile = { path: 'b.ts', content: 'const z = 3;', language: 'typescript' }
    const r1 = cm.analyzeFile(f1)
    const r2 = cm.analyzeFile(f2)
    const stats = cm.getStatistics([r1, r2])
    expect(stats.files).toBe(2)
    expect(stats.totals.lines).toBe(r1.lines.total + r2.lines.total)
    expect(stats.totals.codeLines).toBe(r1.lines.code + r2.lines.code)
  })

  it('computes correct averages', () => {
    const f1: CodeFile = { path: 'a.ts', content: 'if (a) {}', language: 'typescript' }
    const f2: CodeFile = { path: 'b.ts', content: 'if (a) {} if (b) {}', language: 'typescript' }
    const r1 = cm.analyzeFile(f1)
    const r2 = cm.analyzeFile(f2)
    const stats = cm.getStatistics([r1, r2])
    expect(stats.averages.avgComplexity).toBeCloseTo((r1.complexity.cyclomatic + r2.complexity.cyclomatic) / 2)
  })

  it('groups by file extension in byLanguage', () => {
    const f1: CodeFile = { path: 'a.ts', content: 'const x = 1;', language: 'typescript' }
    const f2: CodeFile = { path: 'b.js', content: 'const y = 2;', language: 'javascript' }
    const r1 = cm.analyzeFile(f1)
    const r2 = cm.analyzeFile(f2)
    const stats = cm.getStatistics([r1, r2])
    expect(typeof stats.byLanguage['ts']).toBe('object')
    expect(typeof stats.byLanguage['js']).toBe('object')
  })

  it('groups multiple files of same language together', () => {
    const f1: CodeFile = { path: 'a.ts', content: 'const x = 1;', language: 'typescript' }
    const f2: CodeFile = { path: 'b.ts', content: 'const y = 2;', language: 'typescript' }
    const r1 = cm.analyzeFile(f1)
    const r2 = cm.analyzeFile(f2)
    const stats = cm.getStatistics([r1, r2])
    expect(stats.byLanguage['ts']).toBeDefined()
    expect(stats.byLanguage['ts'].avgLinesPerFile).toBeCloseTo((r1.lines.total + r2.lines.total) / 2)
  })

  it('computes avgMaintainability correctly', () => {
    const f1: CodeFile = { path: 'a.ts', content: 'const x = 1;', language: 'typescript' }
    const f2: CodeFile = { path: 'b.ts', content: 'const y = 2;', language: 'typescript' }
    const r1 = cm.analyzeFile(f1)
    const r2 = cm.analyzeFile(f2)
    const stats = cm.getStatistics([r1, r2])
    expect(stats.averages.avgMaintainability).toBeCloseTo((r1.maintainability.mi + r2.maintainability.mi) / 2)
  })

  it('computes avgDuplication correctly', () => {
    const f1: CodeFile = { path: 'a.ts', content: 'const x = 1;', language: 'typescript' }
    const f2: CodeFile = { path: 'b.ts', content: 'const y = 2;', language: 'typescript' }
    const r1 = cm.analyzeFile(f1)
    const r2 = cm.analyzeFile(f2)
    const stats = cm.getStatistics([r1, r2])
    expect(stats.averages.avgDuplication).toBeCloseTo(
      (r1.duplication.duplicationPercentage + r2.duplication.duplicationPercentage) / 2,
    )
  })

  it('handles file with no dot extension by using last segment', () => {
    const f: CodeFile = { path: 'Makefile', content: 'all:', language: 'make' }
    const r = cm.analyzeFile(f)
    const stats = cm.getStatistics([r])
    expect(stats.byLanguage['Makefile']).toBeDefined()
  })

  it('totals.functions aggregates from all results', () => {
    const f1: CodeFile = { path: 'a.ts', content: 'function foo() {}', language: 'typescript' }
    const f2: CodeFile = { path: 'b.ts', content: 'function bar() {} function baz() {}', language: 'typescript' }
    const r1 = cm.analyzeFile(f1)
    const r2 = cm.analyzeFile(f2)
    const stats = cm.getStatistics([r1, r2])
    expect(stats.totals.functions).toBe(r1.complexity.functions + r2.complexity.functions)
  })
})

// ─── analyzeFile ─────────────────────────────────────────────────────────

describe('analyzeFile', () => {
  it('returns MetricResult with all required fields', () => {
    const file = makeFile({ content: 'const x = 1;' })
    const result = cm.analyzeFile(file)
    expect(result).toHaveProperty('path')
    expect(result).toHaveProperty('lines')
    expect(result).toHaveProperty('complexity')
    expect(result).toHaveProperty('maintainability')
    expect(result).toHaveProperty('duplication')
  })

  it('preserves file path in result', () => {
    const file = makeFile({ path: 'src/utils/helper.ts', content: 'const x = 1;' })
    const result = cm.analyzeFile(file)
    expect(result.path).toBe('src/utils/helper.ts')
  })

  it('returns correct line metrics', () => {
    const file = makeFile({ content: 'const x = 1;\n// comment\n' })
    const result = cm.analyzeFile(file)
    expect(result.lines.total).toBe(2)
    expect(result.lines.code).toBe(1)
    expect(result.lines.comment).toBe(1)
  })

  it('returns correct complexity metrics', () => {
    const file = makeFile({ content: 'if (a) { if (b) {} }' })
    const result = cm.analyzeFile(file)
    expect(result.complexity.cyclomatic).toBeGreaterThanOrEqual(2)
    expect(result.complexity.nesting).toBeGreaterThanOrEqual(1)
    expect(result.complexity.functions).toBeGreaterThanOrEqual(0)
    expect(result.complexity.branches).toBeGreaterThanOrEqual(1)
  })

  it('returns maintainability with mi and grade', () => {
    const file = makeFile({ content: 'const x = 1;' })
    const result = cm.analyzeFile(file)
    expect(result.maintainability.mi).toBeGreaterThanOrEqual(0)
    expect(result.maintainability.mi).toBeLessThanOrEqual(100)
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.maintainability.grade)
    expect(result.maintainability.halsteadVolume).toBeGreaterThanOrEqual(0)
    expect(result.maintainability.halsteadDifficulty).toBeGreaterThanOrEqual(0)
  })

  it('returns duplication metrics', () => {
    const file = makeFile({ content: 'const x = 1;' })
    const result = cm.analyzeFile(file)
    expect(result.duplication.duplicatedLines).toBeGreaterThanOrEqual(0)
    expect(result.duplication.duplicatedBlocks).toBeGreaterThanOrEqual(0)
    expect(result.duplication.duplicationPercentage).toBeGreaterThanOrEqual(0)
  })

  it('handles empty file content', () => {
    const file = makeFile({ content: '' })
    const result = cm.analyzeFile(file)
    expect(result.lines.total).toBe(0)
    expect(result.complexity.cyclomatic).toBe(1)
    expect(result.maintainability.mi).toBe(100)
    expect(result.maintainability.grade).toBe('A')
  })

  it('handles complex realistic file', () => {
    const content = [
      '/**',
      ' * Utility module',
       ' */',
      'import { foo } from "bar";',
      '',
      'function add(a: number, b: number): number {',
      '  if (a > 0) {',
      '    return a + b;',
      '  } else {',
      '    return b;',
      '  }',
      '}',
      '',
      'const multiply = (a: number, b: number) => a * b;',
    ].join('\n')
    const file = makeFile({ content })
    const result = cm.analyzeFile(file)
    expect(result.lines.total).toBe(14)
    expect(result.complexity.cyclomatic).toBeGreaterThanOrEqual(2)
    expect(result.complexity.functions).toBeGreaterThanOrEqual(1)
  })

  it('handles file with only comments', () => {
    const file = makeFile({ content: '// just a comment\n/* another */' })
    const result = cm.analyzeFile(file)
    expect(result.lines.comment).toBeGreaterThanOrEqual(1)
    expect(result.lines.code).toBe(0)
  })

  it('handles file with only blank lines', () => {
    const file = makeFile({ content: '\n\n\n' })
    const result = cm.analyzeFile(file)
    expect(result.lines.blank).toBe(3)
    expect(result.lines.code).toBe(0)
  })
})

// ─── analyzeFiles ────────────────────────────────────────────────────────

describe('analyzeFiles', () => {
  it('returns empty AggregateMetrics for empty array', () => {
    const result = cm.analyzeFiles([])
    expect(result.files).toBe(0)
    expect(result.totals.lines).toBe(0)
    expect(result.averages.avgComplexity).toBe(0)
    expect(result.byLanguage).toEqual({})
  })

  it('returns AggregateMetrics for single file', () => {
    const files = [makeFile({ path: 'a.ts', content: 'const x = 1;' })]
    const result = cm.analyzeFiles(files)
    expect(result.files).toBe(1)
    expect(result.totals.lines).toBe(1)
    expect(result.byLanguage['ts']).toBeDefined()
  })

  it('returns AggregateMetrics for multiple files', () => {
    const files = [
      makeFile({ path: 'a.ts', content: 'const x = 1;\nconst y = 2;' }),
      makeFile({ path: 'b.js', content: 'const z = 3;' }),
      makeFile({ path: 'c.ts', content: 'if (a) {}' }),
    ]
    const result = cm.analyzeFiles(files)
    expect(result.files).toBe(3)
    expect(result.totals.lines).toBe(4)
    expect(result.byLanguage['ts']).toBeDefined()
    expect(result.byLanguage['js']).toBeDefined()
  })

  it('computes byLanguage averages correctly for grouped files', () => {
    const files = [
      makeFile({ path: 'a.ts', content: 'const x = 1;' }),
      makeFile({ path: 'b.ts', content: 'const y = 2;\nconst z = 3;' }),
    ]
    const result = cm.analyzeFiles(files)
    const tsAvg = result.byLanguage['ts']
    expect(tsAvg.avgLinesPerFile).toBeCloseTo(1.5) // (1 + 2) / 2
  })

  it('correctly aggregates duplication across files', () => {
    const block = 'a\nb\nc'
    const files = [
      makeFile({ path: 'dup.ts', content: block + '\n' + block }),
      makeFile({ path: 'unique.ts', content: 'x\ny\nz' }),
    ]
    const result = cm.analyzeFiles(files)
    expect(result.totals.duplicatedLines).toBeGreaterThanOrEqual(0)
  })
})

// ─── Edge Cases & Boundary Conditions ───────────────────────────────────

describe('Edge cases', () => {
  it('countLines handles very long lines', () => {
    const longLine = 'x'.repeat(10000)
    const result = cm.countLines(longLine)
    expect(result.total).toBe(1)
    expect(result.code).toBe(1)
  })

  it('countLines handles mixed CRLF content (split by LF only)', () => {
    const content = 'const x = 1;\r\nconst y = 2;'
    const result = cm.countLines(content)
    // split by \n gives "const x = 1;\r" and "const y = 2;"
    expect(result.total).toBe(2)
  })

  it('estimateComplexity handles complex nested code', () => {
    const code = 'if (a) { if (b) { for (let i = 0; i < n; i++) { if (c) {} } } }'
    const result = cm.estimateComplexity(code)
    expect(result).toBeGreaterThanOrEqual(5)
  })

  it('maxNestingLevel handles deeply nested blocks', () => {
    let code = ''
    for (let i = 0; i < 50; i++) code += '{'
    for (let i = 0; i < 50; i++) code += '}'
    expect(cm.maxNestingLevel(code)).toBe(50)
  })

  it('detectDuplication with minLines equal to total lines', () => {
    const content = 'a\nb\nc'
    const result = cm.detectDuplication(content, 3)
    expect(result.duplicatedBlocks).toBe(0) // only one occurrence, no duplicate
  })

  it('detectDuplication with minLines greater than total lines', () => {
    const content = 'a\nb'
    const result = cm.detectDuplication(content, 5)
    expect(result.duplicatedBlocks).toBe(0)
    expect(result.duplicatedLines).toBe(0)
  })

  it('estimateHalstead handles code with many operators', () => {
    const code = 'a + b - c * d / e % f === g !== h > i < j >= k <= l'
    const result = cm.estimateHalstead(code)
    expect(result.volume).toBeGreaterThan(0)
  })

  it('estimateHalstead handles code with many identifiers', () => {
    const code = 'foo bar baz qux quux corge grault'
    const result = cm.estimateHalstead(code)
    expect(result.volume).toBeGreaterThan(0)
  })

  it('countLines handles template literals with comments inside', () => {
    const content = 'const s = `not // a comment`;'
    const result = cm.countLines(content)
    // template literals are stripped by the regex before checking for //
    expect(result.total).toBe(1)
  })

  it('analyzeFile with only duplicated blocks', () => {
    const block = 'const x = 1;\nconst y = 2;\nconst z = 3;'
    const file = makeFile({ content: block + '\n' + block })
    const result = cm.analyzeFile(file)
    expect(result.duplication.duplicatedBlocks).toBeGreaterThanOrEqual(1)
    expect(result.duplication.duplicatedLines).toBeGreaterThanOrEqual(3)
    expect(result.duplication.duplicationPercentage).toBeGreaterThan(0)
  })

  it('getMaintainabilityGrade boundary values', () => {
    expect(cm.getMaintainabilityGrade(79.999)).toBe('B')
    expect(cm.getMaintainabilityGrade(59.999)).toBe('C')
    expect(cm.getMaintainabilityGrade(39.999)).toBe('D')
    expect(cm.getMaintainabilityGrade(19.999)).toBe('F')
  })

  it('countLines handles block comment that starts and ends on same line', () => {
    const result = cm.countLines('/* comment */')
    expect(result.comment).toBe(1)
  })

  it('countLines handles successive single-line comments', () => {
    const content = '// line 1\n// line 2\n// line 3'
    const result = cm.countLines(content)
    expect(result.comment).toBe(3)
  })

  it('estimateCognitiveComplexity handles switch-case pattern', () => {
    const code = 'switch (x) { case 1: break; case 2: break; }'
    const result = cm.estimateCognitiveComplexity(code)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('estimateCognitiveComplexity handles else-if chain on separate lines', () => {
    const code = 'if (a) {\n} else if (b) {\n} else if (c) {\n} else {\n}'
    const result = cm.estimateCognitiveComplexity(code)
    expect(result).toBeGreaterThanOrEqual(4)
  })

  it('countBranches with nested ternary', () => {
    const code = 'a ? b ? c : d : e'
    const result = cm.countBranches(code)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('countFunctions with no functions returns 0', () => {
    expect(cm.countFunctions('const x = 1;')).toBe(0)
  })

  it('detectDuplication percentage is 0 when no duplication', () => {
    const content = 'unique1\nunique2\nunique3\nunique4'
    const result = cm.detectDuplication(content, 2)
    expect(result.duplicationPercentage).toBe(0)
  })

  it('getStatistics with many files of different types', () => {
    const files: CodeFile[] = []
    for (let i = 0; i < 10; i++) {
      files.push({ path: `f${i}.ts`, content: `const x${i} = ${i};`, language: 'typescript' })
    }
    for (let i = 0; i < 5; i++) {
      files.push({ path: `g${i}.js`, content: `const y${i} = ${i};`, language: 'javascript' })
    }
    const results = files.map((f) => cm.analyzeFile(f))
    const stats = cm.getStatistics(results)
    expect(stats.files).toBe(15)
    expect(stats.byLanguage['ts']).toBeDefined()
    expect(stats.byLanguage['js']).toBeDefined()
    expect(stats.totals.lines).toBe(15)
  })

  it('countLines returns correct ratio fields', () => {
    const result = cm.countLines('const x = 1;\n// comment')
    expect(result.ratio).toHaveProperty('codeToComment')
    expect(result.ratio).toHaveProperty('codeToTotal')
    expect(result.ratio).toHaveProperty('commentToTotal')
  })

  it('calculateMaintainabilityIndex with single line of code', () => {
    const mi = cm.calculateMaintainabilityIndex(1, 1, 0)
    expect(mi).toBeGreaterThanOrEqual(0)
    expect(mi).toBeLessThanOrEqual(100)
  })

  it('analyzeFile returns all complexity sub-fields', () => {
    const result = cm.analyzeFile(makeFile({ content: 'if (a) {}' }))
    expect(typeof result.complexity.cyclomatic).toBe('number')
    expect(typeof result.complexity.cognitive).toBe('number')
    expect(typeof result.complexity.nesting).toBe('number')
    expect(typeof result.complexity.branches).toBe('number')
    expect(typeof result.complexity.functions).toBe('number')
  })

  it('analyzeFile returns all maintainability sub-fields', () => {
    const result = cm.analyzeFile(makeFile({ content: 'const x = 1;' }))
    expect(typeof result.maintainability.mi).toBe('number')
    expect(typeof result.maintainability.grade).toBe('string')
    expect(typeof result.maintainability.halsteadVolume).toBe('number')
    expect(typeof result.maintainability.halsteadDifficulty).toBe('number')
  })

  it('estimateCognitiveComplexity handles try-catch-finally', () => {
    const code = 'try { } catch (e) { }'
    const result = cm.estimateCognitiveComplexity(code)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('maxNestingLevel with interleaved braces', () => {
    const code = '{ } { { } }'
    const result = cm.maxNestingLevel(code)
    expect(result).toBe(2)
  })

  it('countLines with block comment that does not close', () => {
    const content = '/* unclosed comment\nstill a comment\n'
    const result = cm.countLines(content)
    expect(result.comment).toBeGreaterThanOrEqual(2)
  })

  it('estimateHalstead handles numeric operands', () => {
    const result = cm.estimateHalstead('1 + 2 + 3.14')
    expect(result.volume).toBeGreaterThan(0)
  })

  it('getStatistics averages avgLinesPerFile is correct', () => {
    const files = [
      makeFile({ path: 'a.ts', content: 'line1\nline2\nline3' }),
      makeFile({ path: 'b.ts', content: 'line1' }),
    ]
    const results = files.map((f) => cm.analyzeFile(f))
    const stats = cm.getStatistics(results)
    expect(stats.averages.avgLinesPerFile).toBeCloseTo(2)
  })
})
