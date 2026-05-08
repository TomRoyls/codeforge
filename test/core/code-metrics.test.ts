import { describe, it, expect } from 'vitest'
import { CodeMetrics } from '../../src/core/code-metrics/code-metrics.js'
import type { CodeFile } from '../../src/core/code-metrics/types.js'

describe('CodeMetrics', () => {
  const cm = new CodeMetrics()

  describe('countLines', () => {
    it('should count total lines', () => {
      const result = cm.countLines('line1\nline2\nline3')
      expect(result.total).toBe(3)
    })

    it('should count code lines', () => {
      const result = cm.countLines('const a = 1\nconst b = 2')
      expect(result.code).toBe(2)
    })

    it('should count single-line comments with //', () => {
      const result = cm.countLines('// this is a comment\nconst a = 1')
      expect(result.comment).toBe(1)
      expect(result.code).toBe(1)
    })

    it('should count block comments /* */', () => {
      const result = cm.countLines('/* block comment */\nconst a = 1')
      expect(result.comment).toBe(1)
    })

    it('should count doc comments /** */', () => {
      const result = cm.countLines('/** doc */\nconst a = 1')
      expect(result.comment).toBe(1)
    })

    it('should count multi-line block comments', () => {
      const result = cm.countLines('/*\nline1\nline2\n*/\nconst a = 1')
      expect(result.comment).toBe(4)
      expect(result.code).toBe(1)
    })

    it('should count blank lines', () => {
      const result = cm.countLines('const a = 1\n\n\nconst b = 2')
      expect(result.blank).toBe(2)
    })

    it('should count mixed lines (code + comment)', () => {
      const result = cm.countLines('const a = 1 /* inline */\nconst b = 2')
      expect(result.mixed).toBe(1)
    })

    it('should handle empty string', () => {
      const result = cm.countLines('')
      expect(result.total).toBe(0)
      expect(result.code).toBe(0)
      expect(result.comment).toBe(0)
      expect(result.blank).toBe(0)
    })

    it('should handle single line', () => {
      const result = cm.countLines('const a = 1')
      expect(result.total).toBe(1)
      expect(result.code).toBe(1)
    })

    it('should handle file with only comments', () => {
      const result = cm.countLines('// comment1\n// comment2')
      expect(result.comment).toBe(2)
      expect(result.code).toBe(0)
    })

    it('should handle file with only blank lines', () => {
      const result = cm.countLines('\n\n\n')
      expect(result.blank).toBe(3)
      expect(result.code).toBe(0)
    })
  })

  describe('calculateLineRatios', () => {
    it('should compute codeToComment ratio', () => {
      const result = cm.calculateLineRatios({ code: 8, comment: 2, total: 12 })
      expect(result.codeToComment).toBe(4)
    })

    it('should compute codeToTotal ratio', () => {
      const result = cm.calculateLineRatios({ code: 6, comment: 2, total: 10 })
      expect(result.codeToTotal).toBe(0.6)
    })

    it('should compute commentToTotal ratio', () => {
      const result = cm.calculateLineRatios({ code: 6, comment: 2, total: 10 })
      expect(result.commentToTotal).toBe(0.2)
    })

    it('should handle zero total', () => {
      const result = cm.calculateLineRatios({ code: 0, comment: 0, total: 0 })
      expect(result.codeToTotal).toBe(0)
      expect(result.commentToTotal).toBe(0)
    })

    it('should handle zero comments for codeToComment', () => {
      const result = cm.calculateLineRatios({ code: 10, comment: 0, total: 10 })
      expect(result.codeToComment).toBe(0)
    })
  })

  describe('estimateComplexity', () => {
    it('should return 1 for simple function', () => {
      const result = cm.estimateComplexity('function foo() { return 1 }')
      expect(result).toBe(1)
    })

    it('should count if statements', () => {
      const result = cm.estimateComplexity('if (x) { y }')
      expect(result).toBe(2)
    })

    it('should count nested if statements', () => {
      const result = cm.estimateComplexity('if (a) { if (b) { c } }')
      expect(result).toBe(3)
    })

    it('should count switch cases', () => {
      const result = cm.estimateComplexity('switch(x) { case 1: break; case 2: break; }')
      expect(result).toBeGreaterThanOrEqual(3)
    })

    it('should count logical operators &&', () => {
      const result = cm.estimateComplexity('if (a && b) { c }')
      expect(result).toBeGreaterThanOrEqual(3)
    })

    it('should count logical operators ||', () => {
      const result = cm.estimateComplexity('if (a || b) { c }')
      expect(result).toBeGreaterThanOrEqual(3)
    })

    it('should count ternary operators', () => {
      const result = cm.estimateComplexity('const x = a ? b : c')
      expect(result).toBeGreaterThanOrEqual(2)
    })

    it('should count for loops', () => {
      const result = cm.estimateComplexity('for (let i = 0; i < n; i++) {}')
      expect(result).toBeGreaterThanOrEqual(2)
    })

    it('should count while loops', () => {
      const result = cm.estimateComplexity('while (true) {}')
      expect(result).toBeGreaterThanOrEqual(2)
    })

    it('should count catch blocks', () => {
      const result = cm.estimateComplexity('try {} catch(e) {}')
      expect(result).toBeGreaterThanOrEqual(2)
    })
  })

  describe('estimateCognitiveComplexity', () => {
    it('should return 0 for flat code without control flow', () => {
      const result = cm.estimateCognitiveComplexity('const a = 1\nconst b = 2')
      expect(result).toBe(0)
    })

    it('should increment for nesting', () => {
      const result = cm.estimateCognitiveComplexity('if (x) {\n  if (y) {\n  }\n}')
      expect(result).toBeGreaterThanOrEqual(3)
    })

    it('should count logical operators', () => {
      const result = cm.estimateCognitiveComplexity('if (a && b || c) {}')
      expect(result).toBeGreaterThanOrEqual(3)
    })
  })

  describe('maxNestingLevel', () => {
    it('should return 0 for flat code', () => {
      const result = cm.maxNestingLevel('const a = 1\nconst b = 2')
      expect(result).toBe(0)
    })

    it('should count single-level nesting', () => {
      const result = cm.maxNestingLevel('if (x) {\n  y\n}')
      expect(result).toBe(1)
    })

    it('should count deep nesting', () => {
      const result = cm.maxNestingLevel('{\n  {\n    {\n    }\n  }\n}')
      expect(result).toBe(3)
    })

    it('should handle code with no braces', () => {
      const result = cm.maxNestingLevel('const a = 1')
      expect(result).toBe(0)
    })
  })

  describe('countFunctions', () => {
    it('should count function declarations', () => {
      const result = cm.countFunctions('function foo() {}\nfunction bar() {}')
      expect(result).toBeGreaterThanOrEqual(2)
    })

    it('should count arrow functions', () => {
      const result = cm.countFunctions('const foo = () => { return 1 }')
      expect(result).toBeGreaterThanOrEqual(1)
    })

    it('should count async functions', () => {
      const result = cm.countFunctions('async function foo() {}')
      expect(result).toBeGreaterThanOrEqual(1)
    })

    it('should count method declarations', () => {
      const result = cm.countFunctions('class A { doSomething() {} }')
      expect(result).toBeGreaterThanOrEqual(1)
    })
  })

  describe('countBranches', () => {
    it('should count if statements', () => {
      const result = cm.countBranches('if (x) {}')
      expect(result).toBeGreaterThanOrEqual(1)
    })

    it('should count else if statements', () => {
      const result = cm.countBranches('if (a) {} else if (b) {}')
      expect(result).toBeGreaterThanOrEqual(2)
    })

    it('should count ternary operators', () => {
      const result = cm.countBranches('const x = a ? b : c')
      expect(result).toBeGreaterThanOrEqual(1)
    })

    it('should count switch statements', () => {
      const result = cm.countBranches('switch(x) { case 1: break }')
      expect(result).toBeGreaterThanOrEqual(1)
    })
  })

  describe('calculateMaintainabilityIndex', () => {
    it('should return 100 for zero lines', () => {
      const result = cm.calculateMaintainabilityIndex(0, 1, 0)
      expect(result).toBe(100)
    })

    it('should return a value between 0 and 100', () => {
      const result = cm.calculateMaintainabilityIndex(100, 10, 0.1)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    })

    it('should decrease with higher complexity', () => {
      const low = cm.calculateMaintainabilityIndex(50, 2, 0.1)
      const high = cm.calculateMaintainabilityIndex(50, 30, 0.1)
      expect(low).toBeGreaterThan(high)
    })

    it('should increase with comment ratio', () => {
      const noComments = cm.calculateMaintainabilityIndex(50, 5, 0)
      const withComments = cm.calculateMaintainabilityIndex(50, 5, 0.3)
      expect(withComments).toBeGreaterThan(noComments)
    })
  })

  describe('getMaintainabilityGrade', () => {
    it('should return A for MI >= 80', () => {
      expect(cm.getMaintainabilityGrade(90)).toBe('A')
      expect(cm.getMaintainabilityGrade(80)).toBe('A')
    })

    it('should return B for MI >= 60', () => {
      expect(cm.getMaintainabilityGrade(70)).toBe('B')
      expect(cm.getMaintainabilityGrade(60)).toBe('B')
    })

    it('should return C for MI >= 40', () => {
      expect(cm.getMaintainabilityGrade(50)).toBe('C')
      expect(cm.getMaintainabilityGrade(40)).toBe('C')
    })

    it('should return D for MI >= 20', () => {
      expect(cm.getMaintainabilityGrade(30)).toBe('D')
      expect(cm.getMaintainabilityGrade(20)).toBe('D')
    })

    it('should return F for MI < 20', () => {
      expect(cm.getMaintainabilityGrade(10)).toBe('F')
      expect(cm.getMaintainabilityGrade(0)).toBe('F')
    })
  })

  describe('estimateHalstead', () => {
    it('should estimate volume for simple code', () => {
      const result = cm.estimateHalstead('const a = 1 + 2')
      expect(result.volume).toBeGreaterThan(0)
    })

    it('should estimate difficulty for simple code', () => {
      const result = cm.estimateHalstead('const a = 1 + 2')
      expect(result.difficulty).toBeGreaterThanOrEqual(0)
    })

    it('should return zero for empty string', () => {
      const result = cm.estimateHalstead('')
      expect(result.volume).toBe(0)
      expect(result.difficulty).toBe(0)
    })

    it('should increase volume with more code', () => {
      const simple = cm.estimateHalstead('const a = 1')
      const complex = cm.estimateHalstead('const a = 1 + 2 * 3 / 4 - 5')
      expect(complex.volume).toBeGreaterThan(simple.volume)
    })
  })

  describe('detectDuplication', () => {
    it('should detect no duplicates', () => {
      const result = cm.detectDuplication('const a = 1\nconst b = 2\nconst c = 3', 3)
      expect(result.duplicatedBlocks).toBe(0)
      expect(result.duplicatedLines).toBe(0)
    })

    it('should detect a single duplicate block', () => {
      const content = 'line1\nline2\nline3\nline1\nline2\nline3'
      const result = cm.detectDuplication(content, 3)
      expect(result.duplicatedBlocks).toBe(1)
      expect(result.duplicatedLines).toBe(3)
    })

    it('should detect multiple duplicate blocks', () => {
      const content = 'a\nb\nc\na\nb\nc\na\nb\nc'
      const result = cm.detectDuplication(content, 3)
      expect(result.duplicatedBlocks).toBeGreaterThanOrEqual(1)
    })

    it('should respect minLines threshold', () => {
      const content = 'a\nb\na\nb'
      const result3 = cm.detectDuplication(content, 3)
      expect(result3.duplicatedBlocks).toBe(0)

      const result2 = cm.detectDuplication(content, 2)
      expect(result2.duplicatedBlocks).toBeGreaterThanOrEqual(1)
    })

    it('should handle empty content', () => {
      const result = cm.detectDuplication('', 3)
      expect(result.duplicatedLines).toBe(0)
      expect(result.duplicatedBlocks).toBe(0)
      expect(result.duplicationPercentage).toBe(0)
    })

    it('should calculate duplication percentage', () => {
      const content = 'a\nb\nc\na\nb\nc'
      const result = cm.detectDuplication(content, 3)
      expect(result.duplicationPercentage).toBe(50)
    })
  })

  describe('analyzeFile', () => {
    it('should return complete MetricResult for single file', () => {
      const file: CodeFile = {
        path: 'test.ts',
        content: 'function hello() {\n  // comment\n  return 1\n}',
        language: 'typescript',
      }
      const result = cm.analyzeFile(file)
      expect(result.path).toBe('test.ts')
      expect(result.lines.total).toBe(4)
      expect(result.lines.code).toBeGreaterThanOrEqual(1)
      expect(result.lines.comment).toBeGreaterThanOrEqual(1)
      expect(result.complexity.cyclomatic).toBeGreaterThanOrEqual(1)
      expect(result.complexity.functions).toBeGreaterThanOrEqual(1)
      expect(result.maintainability.mi).toBeGreaterThanOrEqual(0)
      expect(result.maintainability.mi).toBeLessThanOrEqual(100)
      expect(result.duplication).toBeDefined()
    })

    it('should handle empty file', () => {
      const file: CodeFile = { path: 'empty.ts', content: '', language: 'typescript' }
      const result = cm.analyzeFile(file)
      expect(result.lines.total).toBe(0)
      expect(result.maintainability.mi).toBe(100)
    })

    it('should handle file with only comments', () => {
      const file: CodeFile = { path: 'comments.ts', content: '// just a comment\n// another', language: 'typescript' }
      const result = cm.analyzeFile(file)
      expect(result.lines.comment).toBe(2)
      expect(result.lines.code).toBe(0)
    })

    it('should handle file with only blank lines', () => {
      const file: CodeFile = { path: 'blanks.ts', content: '\n\n\n', language: 'typescript' }
      const result = cm.analyzeFile(file)
      expect(result.lines.blank).toBe(3)
      expect(result.lines.code).toBe(0)
    })
  })

  describe('analyzeFiles', () => {
    it('should aggregate metrics for multiple files', () => {
      const files: CodeFile[] = [
        { path: 'a.ts', content: 'const a = 1\nconst b = 2', language: 'typescript' },
        { path: 'b.ts', content: 'function foo() { return 1 }', language: 'typescript' },
      ]
      const result = cm.analyzeFiles(files)
      expect(result.files).toBe(2)
      expect(result.totals.lines).toBeGreaterThanOrEqual(3)
      expect(result.averages.avgLinesPerFile).toBeGreaterThan(0)
    })

    it('should handle empty file list', () => {
      const result = cm.analyzeFiles([])
      expect(result.files).toBe(0)
      expect(result.totals.lines).toBe(0)
      expect(result.averages.avgComplexity).toBe(0)
    })

    it('should break down by language extension', () => {
      const files: CodeFile[] = [
        { path: 'a.ts', content: 'const a = 1', language: 'typescript' },
        { path: 'b.py', content: 'x = 1', language: 'python' },
      ]
      const result = cm.analyzeFiles(files)
      expect(result.byLanguage['ts']).toBeDefined()
      expect(result.byLanguage['py']).toBeDefined()
    })
  })

  describe('getStatistics', () => {
    it('should compute totals correctly', () => {
      const files: CodeFile[] = [
        { path: 'a.ts', content: 'const a = 1\n// comment\n\nconst b = 2', language: 'typescript' },
        { path: 'b.ts', content: 'function foo() { return 1 }', language: 'typescript' },
      ]
      const results = files.map((f) => cm.analyzeFile(f))
      const stats = cm.getStatistics(results)
      expect(stats.files).toBe(2)
      expect(stats.totals.lines).toBeGreaterThan(0)
      expect(stats.totals.codeLines).toBeGreaterThan(0)
      expect(stats.totals.commentLines).toBeGreaterThanOrEqual(1)
    })

    it('should compute averages correctly', () => {
      const files: CodeFile[] = [
        { path: 'a.ts', content: 'const a = 1', language: 'typescript' },
        { path: 'b.ts', content: 'const b = 2', language: 'typescript' },
      ]
      const results = files.map((f) => cm.analyzeFile(f))
      const stats = cm.getStatistics(results)
      expect(stats.averages.avgComplexity).toBeGreaterThanOrEqual(0)
      expect(stats.averages.avgLinesPerFile).toBeGreaterThan(0)
      expect(stats.averages.avgMaintainability).toBeGreaterThanOrEqual(0)
      expect(stats.averages.avgDuplication).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty results', () => {
      const stats = cm.getStatistics([])
      expect(stats.files).toBe(0)
      expect(stats.totals.lines).toBe(0)
      expect(stats.averages.avgComplexity).toBe(0)
      expect(stats.byLanguage).toEqual({})
    })

    it('should compute byLanguage breakdown', () => {
      const files: CodeFile[] = [
        { path: 'a.ts', content: 'const a = 1\nconst b = 2\nconst c = 3', language: 'typescript' },
        { path: 'b.py', content: 'x = 1', language: 'python' },
      ]
      const results = files.map((f) => cm.analyzeFile(f))
      const stats = cm.getStatistics(results)
      expect(stats.byLanguage['ts']).toBeDefined()
      expect(stats.byLanguage['py']).toBeDefined()
      expect(stats.byLanguage['ts']!.avgLinesPerFile).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle file with unicode content', () => {
      const result = cm.countLines('const hällö = "wörld"')
      expect(result.code).toBe(1)
    })

    it('should handle very long line', () => {
      const longLine = 'x'.repeat(10000)
      const result = cm.countLines(longLine)
      expect(result.total).toBe(1)
      expect(result.code).toBe(1)
    })

    it('should handle comment-like strings in code', () => {
      const result = cm.countLines('const url = "http://example.com"')
      expect(result.code).toBe(1)
    })

    it('should handle nested block comments', () => {
      const result = cm.countLines('/* outer /* inner */ end */\nconst a = 1')
      expect(result.comment).toBeGreaterThanOrEqual(1)
    })

    it('should handle detectDuplication with minLines 1', () => {
      const content = 'a\na\na'
      const result = cm.detectDuplication(content, 1)
      expect(result.duplicatedLines).toBeGreaterThanOrEqual(1)
    })

    it('should calculate maintainability for large codebase', () => {
      const mi = cm.calculateMaintainabilityIndex(1000, 50, 0.05)
      expect(mi).toBeGreaterThanOrEqual(0)
      expect(mi).toBeLessThanOrEqual(100)
    })

    it('should detectDuplication return 0 for minLines 0', () => {
      const result = cm.detectDuplication('a\nb\nc', 0)
      expect(result.duplicatedBlocks).toBe(0)
      expect(result.duplicatedLines).toBe(0)
    })

    it('should estimateHalstead for complex expression', () => {
      const result = cm.estimateHalstead('if (x > 0 && y < 10) { return x + y }')
      expect(result.volume).toBeGreaterThan(0)
      expect(result.difficulty).toBeGreaterThan(0)
    })

    it('should countLines handle Windows line endings', () => {
      const result = cm.countLines('const a = 1\r\nconst b = 2')
      expect(result.total).toBe(2)
    })
  })
})
