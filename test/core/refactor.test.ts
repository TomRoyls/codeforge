import { describe, it, expect } from 'vitest'
import { RenameEngine } from '../../src/core/refactor/rename-engine.js'
import { ExtractEngine } from '../../src/core/refactor/extract-engine.js'
import { RefactorEngine } from '../../src/core/refactor/refactor-engine.js'
import type { RefactoringContext, RefactoringAction, TextEdit } from '../../src/core/refactor/types.js'

describe('RenameEngine', () => {
  const engine = new RenameEngine()

  describe('renameSymbol', () => {
    it('should rename a simple variable', () => {
      const source = 'const foo = 1;\nconsole.log(foo);'
      const result = engine.renameSymbol(source, 'foo', 'bar')
      expect(result.success).toBe(true)
      expect(result.oldName).toBe('foo')
      expect(result.newName).toBe('bar')
      expect(result.occurrences).toBe(2)
    })

    it('should fail for empty oldName', () => {
      const result = engine.renameSymbol('const foo = 1', '', 'bar')
      expect(result.success).toBe(false)
      expect(result.occurrences).toBe(0)
    })

    it('should fail for empty newName', () => {
      const result = engine.renameSymbol('const foo = 1', 'foo', '')
      expect(result.success).toBe(false)
    })

    it('should fail when oldName equals newName', () => {
      const result = engine.renameSymbol('const foo = 1', 'foo', 'foo')
      expect(result.success).toBe(false)
    })

    it('should not rename occurrences in strings', () => {
      const source = "const foo = 1;\nconst str = 'foo bar';"
      const result = engine.renameSymbol(source, 'foo', 'baz')
      expect(result.success).toBe(true)
      expect(result.occurrences).toBe(1)
    })

    it('should not rename occurrences in double-quoted strings', () => {
      const source = 'const foo = 1;\nconst str = "foo bar";'
      const result = engine.renameSymbol(source, 'foo', 'baz')
      expect(result.success).toBe(true)
      expect(result.occurrences).toBe(1)
    })

    it('should not rename partial matches', () => {
      const source = 'const foobar = 1;\nconst foo = 2;'
      const result = engine.renameSymbol(source, 'foo', 'baz')
      expect(result.success).toBe(true)
      expect(result.occurrences).toBe(1)
    })

    it('should not rename when name is part of larger identifier', () => {
      const source = 'const food = 1;\nconst foo = 2;\nconst foobar = 3;'
      const result = engine.renameSymbol(source, 'foo', 'baz')
      expect(result.success).toBe(true)
      expect(result.occurrences).toBe(1)
    })

    it('should return empty edits when name not found', () => {
      const result = engine.renameSymbol('const bar = 1', 'foo', 'baz')
      expect(result.success).toBe(false)
      expect(result.occurrences).toBe(0)
    })

    it('should rename across multiple lines', () => {
      const source = 'const foo = 1;\nconst bar = foo + 2;\nreturn foo;'
      const result = engine.renameSymbol(source, 'foo', 'baz')
      expect(result.success).toBe(true)
      expect(result.occurrences).toBe(3)
    })

    it('should handle property access correctly', () => {
      const source = 'const foo = {};\nfoo.bar = 1;\nconsole.log(foo);'
      const result = engine.renameSymbol(source, 'foo', 'qux')
      expect(result.success).toBe(true)
      expect(result.occurrences).toBe(3)
    })

    it('should produce edits map with file key', () => {
      const result = engine.renameSymbol('let foo = 1', 'foo', 'bar')
      expect(result.edits.has('file')).toBe(true)
    })

    it('should handle single occurrence', () => {
      const result = engine.renameSymbol('const foo = 1', 'foo', 'bar')
      expect(result.occurrences).toBe(1)
      const edits = result.edits.get('file')!
      expect(edits[0]!.newText).toBe('bar')
    })
  })

  describe('findOccurrences', () => {
    it('should find all occurrences of a name', () => {
      const source = 'const foo = 1;\nconst bar = foo + 2;'
      const occurrences = engine.findOccurrences(source, 'foo')
      expect(occurrences).toHaveLength(2)
    })

    it('should return correct line and column', () => {
      const source = 'const foo = 1;'
      const occurrences = engine.findOccurrences(source, 'foo')
      expect(occurrences[0]!.line).toBe(1)
      expect(occurrences[0]!.column).toBe(7)
    })

    it('should return context string', () => {
      const source = 'const foo = 1;'
      const occurrences = engine.findOccurrences(source, 'foo')
      expect(occurrences[0]!.context).toBe('const foo = 1;')
    })

    it('should find multiple occurrences on same line', () => {
      const source = 'foo + foo'
      const occurrences = engine.findOccurrences(source, 'foo')
      expect(occurrences).toHaveLength(2)
      expect(occurrences[0]!.column).toBe(1)
      expect(occurrences[1]!.column).toBe(7)
    })

    it('should return empty array when not found', () => {
      const occurrences = engine.findOccurrences('const bar = 1', 'foo')
      expect(occurrences).toEqual([])
    })

    it('should find occurrences across many lines', () => {
      const source = Array(10).fill('const foo = 1;').join('\n')
      const occurrences = engine.findOccurrences(source, 'foo')
      expect(occurrences).toHaveLength(10)
    })
  })

  describe('isInString', () => {
    it('should detect position inside single-quoted string', () => {
      const source = "const str = 'hello world';"
      expect(engine.isInString(source, 1, 15)).toBe(true)
    })

    it('should detect position inside double-quoted string', () => {
      const source = 'const str = "hello world";'
      expect(engine.isInString(source, 1, 15)).toBe(true)
    })

    it('should return false for code outside strings', () => {
      const source = 'const foo = 1;'
      expect(engine.isInString(source, 1, 7)).toBe(false)
    })

    it('should handle escaped quotes', () => {
      const source = "const str = 'it\\'s here';"
      expect(engine.isInString(source, 1, 14)).toBe(true)
    })

    it('should return false for invalid line number', () => {
      expect(engine.isInString('const foo = 1', 0, 1)).toBe(false)
      expect(engine.isInString('const foo = 1', 5, 1)).toBe(false)
    })

    it('should return false for invalid column', () => {
      expect(engine.isInString('const foo = 1', 1, 0)).toBe(false)
    })
  })

  describe('isInComment', () => {
    it('should detect position in line comment', () => {
      const source = 'const foo = 1; // foo bar'
      expect(engine.isInComment(source, 1, 20)).toBe(true)
    })

    it('should not flag code before comment', () => {
      const source = 'const foo = 1; // comment'
      expect(engine.isInComment(source, 1, 7)).toBe(false)
    })

    it('should detect position in block comment', () => {
      const source = '/* block comment */\nconst foo = 1;'
      expect(engine.isInComment(source, 1, 5)).toBe(true)
    })

    it('should detect multi-line block comment', () => {
      const source = '/* block\ncomment */\nconst foo = 1;'
      expect(engine.isInComment(source, 2, 3)).toBe(true)
    })

    it('should return false for code after block comment', () => {
      const source = '/* comment */\nconst foo = 1;'
      expect(engine.isInComment(source, 2, 7)).toBe(false)
    })

    it('should return false for invalid line', () => {
      expect(engine.isInComment('const foo = 1', 0, 1)).toBe(false)
    })
  })

  describe('renameInScope', () => {
    it('should rename only within specified scope', () => {
      const source = 'const foo = 1;\nconst bar = foo;\nconst baz = foo;'
      const result = engine.renameInScope(source, 'foo', 'qux', 2, 2)
      const lines = result.split('\n')
      expect(lines[0]).toBe('const foo = 1;')
      expect(lines[1]).toBe('const bar = qux;')
      expect(lines[2]).toBe('const baz = foo;')
    })

    it('should rename across multiple scope lines', () => {
      const source = 'const foo = 1;\nlet a = foo;\nlet b = foo;\nconst bar = foo;'
      const result = engine.renameInScope(source, 'foo', 'qux', 2, 3)
      const lines = result.split('\n')
      expect(lines[0]).toBe('const foo = 1;')
      expect(lines[1]).toBe('let a = qux;')
      expect(lines[2]).toBe('let b = qux;')
      expect(lines[3]).toBe('const bar = foo;')
    })

    it('should not affect lines outside scope', () => {
      const source = 'const foo = 1;\nconst bar = 2;'
      const result = engine.renameInScope(source, 'foo', 'qux', 2, 2)
      expect(result).toBe('const foo = 1;\nconst bar = 2;')
    })

    it('should handle single line scope', () => {
      const source = 'const foo = 1;\nfoo + foo\nconst baz = foo;'
      const result = engine.renameInScope(source, 'foo', 'qux', 2, 2)
      const lines = result.split('\n')
      expect(lines[1]).toBe('qux + qux')
      expect(lines[2]).toBe('const baz = foo;')
    })
  })
})

describe('ExtractEngine', () => {
  const engine = new ExtractEngine()

  describe('extractFunction', () => {
    it('should extract a simple function', () => {
      const source = 'function process() {\n  const result = compute(a, b);\n  return result;\n}'
      const result = engine.extractFunction(source, 2, 3, 'extractedCompute')
      expect(result.success).toBe(true)
      expect(result.extractedName).toBe('extractedCompute')
      expect(result.newDeclaration).toContain('function extractedCompute')
      expect(result.sourceEdits).toHaveLength(2)
    })

    it('should detect parameters from extracted code', () => {
      const source = 'function process() {\n  const result = a + b;\n  return result;\n}'
      const result = engine.extractFunction(source, 2, 3, 'add')
      expect(result.success).toBe(true)
      expect(result.newDeclaration).toContain('a')
      expect(result.newDeclaration).toContain('b')
    })

    it('should return failure for invalid line range', () => {
      const result = engine.extractFunction('const x = 1', 5, 10, 'foo')
      expect(result.success).toBe(false)
    })

    it('should return failure for start > end', () => {
      const result = engine.extractFunction('const x = 1\nconst y = 2', 2, 1, 'foo')
      expect(result.success).toBe(false)
    })

    it('should include return type when return statement present', () => {
      const source = 'function main() {\n  return 42;\n}'
      const result = engine.extractFunction(source, 2, 2, 'getValue')
      expect(result.success).toBe(true)
      expect(result.newDeclaration).toContain('unknown')
    })

    it('should have void return when no return statement', () => {
      const source = 'function main() {\n  console.log("hi");\n}'
      const result = engine.extractFunction(source, 2, 2, 'sayHi')
      expect(result.success).toBe(true)
      expect(result.newDeclaration).toContain('void')
    })

    it('should provide declaration location', () => {
      const source = 'function process() {\n  const x = 1;\n  return x;\n}'
      const result = engine.extractFunction(source, 2, 3, 'getX')
      expect(result.declarationLocation.line).toBeGreaterThanOrEqual(1)
      expect(result.declarationLocation.column).toBe(1)
    })
  })

  describe('extractVariable', () => {
    it('should extract a variable from a line', () => {
      const source = 'const result = a + b + c;'
      const result = engine.extractVariable(source, 'a + b', 'sum', 1)
      expect(result.success).toBe(true)
      expect(result.extractedName).toBe('sum')
      expect(result.newDeclaration).toContain('const sum = a + b')
      expect(result.sourceEdits).toHaveLength(2)
    })

    it('should return failure for empty expression', () => {
      const result = engine.extractVariable('const x = 1', '', 'name', 1)
      expect(result.success).toBe(false)
    })

    it('should return failure for empty name', () => {
      const result = engine.extractVariable('const x = 1 + 2', '1 + 2', '', 1)
      expect(result.success).toBe(false)
    })

    it('should return failure for expression not found on line', () => {
      const result = engine.extractVariable('const x = 1', 'notfound', 'name', 1)
      expect(result.success).toBe(false)
    })

    it('should return failure for invalid line number', () => {
      const result = engine.extractVariable('const x = 1', '1', 'name', 5)
      expect(result.success).toBe(false)
    })

    it('should preserve indentation in declaration', () => {
      const source = '  const result = a + b;'
      const result = engine.extractVariable(source, 'a + b', 'sum', 1)
      expect(result.newDeclaration).toContain('  const sum = a + b')
    })

    it('should provide correct source edits', () => {
      const source = 'const result = a + b;'
      const result = engine.extractVariable(source, 'a + b', 'sum', 1)
      const insertionEdit = result.sourceEdits[0]!
      const replacementEdit = result.sourceEdits[1]!
      expect(insertionEdit.newText).toContain('const sum = a + b')
      expect(replacementEdit.newText).toBe('sum')
    })
  })

  describe('detectExpression', () => {
    it('should detect expression at column range', () => {
      const source = 'const result = a + b;'
      expect(engine.detectExpression(source, 1, 16, 21)).toBe('a + b')
    })

    it('should return empty for invalid line', () => {
      expect(engine.detectExpression('const x = 1', 0, 1, 5)).toBe('')
    })

    it('should return empty for invalid column range', () => {
      expect(engine.detectExpression('const x = 1', 1, 5, 1)).toBe('')
    })

    it('should return full line expression', () => {
      const source = 'hello world'
      expect(engine.detectExpression(source, 1, 1, 12)).toBe('hello world')
    })

    it('should handle single character', () => {
      const source = 'abc'
      expect(engine.detectExpression(source, 1, 2, 3)).toBe('b')
    })
  })

  describe('findInsertionPoint', () => {
    it('should find insertion point for a line', () => {
      const source = 'function foo() {\n  const x = 1;\n  return x;\n}'
      const point = engine.findInsertionPoint(source, 2)
      expect(point.column).toBe(1)
      expect(point.line).toBeGreaterThanOrEqual(1)
    })

    it('should return valid point for single line source', () => {
      const point = engine.findInsertionPoint('const x = 1', 1)
      expect(point.line).toBeGreaterThanOrEqual(1)
    })

    it('should prefer location before target line', () => {
      const source = 'function foo() {\n  const x = 1;\n  const y = 2;\n  return x + y;\n}'
      const point = engine.findInsertionPoint(source, 3)
      expect(point.line).toBeLessThanOrEqual(3)
    })
  })

  describe('generateFunctionSignature', () => {
    it('should generate signature with parameters', () => {
      const sig = engine.generateFunctionSignature(['a: number', 'b: number'], 'number')
      expect(sig).toBe('function extracted(a: number, b: number): number')
    })

    it('should generate signature without parameters', () => {
      const sig = engine.generateFunctionSignature([], 'void')
      expect(sig).toBe('function extracted(): void')
    })

    it('should handle single parameter', () => {
      const sig = engine.generateFunctionSignature(['x: string'], 'string')
      expect(sig).toBe('function extracted(x: string): string')
    })
  })
})

describe('RefactorEngine', () => {
  const engine = new RefactorEngine()

  describe('applyEdit', () => {
    it('should apply a single-line edit', () => {
      const source = 'const foo = 1;'
      const edits: TextEdit[] = [
        { startLine: 1, startColumn: 7, endLine: 1, endColumn: 10, newText: 'bar' },
      ]
      const result = engine.applyEdit(source, edits)
      expect(result).toBe('const bar = 1;')
    })

    it('should apply multi-line edit', () => {
      const source = 'const foo = 1;\nconst bar = 2;'
      const edits: TextEdit[] = [
        { startLine: 1, startColumn: 7, endLine: 2, endColumn: 14, newText: 'baz = 3' },
      ]
      const result = engine.applyEdit(source, edits)
      expect(result).toBe('const baz = 3;')
    })

    it('should apply multiple edits in reverse order', () => {
      const source = 'const foo = 1;\nconst bar = 2;'
      const edits: TextEdit[] = [
        { startLine: 1, startColumn: 7, endLine: 1, endColumn: 10, newText: 'baz' },
        { startLine: 2, startColumn: 7, endLine: 2, endColumn: 10, newText: 'qux' },
      ]
      const result = engine.applyEdit(source, edits)
      expect(result).toBe('const baz = 1;\nconst qux = 2;')
    })

    it('should return source unchanged for empty edits', () => {
      const source = 'const foo = 1;'
      expect(engine.applyEdit(source, [])).toBe('const foo = 1;')
    })

    it('should handle edit at end of line', () => {
      const source = 'const foo = 1;'
      const edits: TextEdit[] = [
        { startLine: 1, startColumn: 13, endLine: 1, endColumn: 14, newText: '2' },
      ]
      const result = engine.applyEdit(source, edits)
      expect(result).toBe('const foo = 2;')
    })

    it('should handle replacement with longer text', () => {
      const source = 'const x = 1;'
      const edits: TextEdit[] = [
        { startLine: 1, startColumn: 7, endLine: 1, endColumn: 8, newText: 'longName' },
      ]
      const result = engine.applyEdit(source, edits)
      expect(result).toBe('const longName = 1;')
    })

    it('should handle replacement with shorter text', () => {
      const source = 'const longName = 1;'
      const edits: TextEdit[] = [
        { startLine: 1, startColumn: 7, endLine: 1, endColumn: 15, newText: 'x' },
      ]
      const result = engine.applyEdit(source, edits)
      expect(result).toBe('const x = 1;')
    })

    it('should skip invalid edit line numbers', () => {
      const source = 'const foo = 1;'
      const edits: TextEdit[] = [
        { startLine: 5, startColumn: 1, endLine: 5, endColumn: 5, newText: 'bar' },
      ]
      expect(engine.applyEdit(source, edits)).toBe('const foo = 1;')
    })
  })

  describe('applyAction', () => {
    it('should apply a rename action', () => {
      const context: RefactoringContext = {
        filePath: 'test.ts',
        source: 'const foo = 1;',
      }
      const action: RefactoringAction = {
        type: 'rename',
        description: 'Rename foo to bar',
        filePath: 'test.ts',
        edits: [{ startLine: 1, startColumn: 7, endLine: 1, endColumn: 10, newText: 'bar' }],
      }
      const result = engine.applyAction(context, action)
      expect(result).toBe('const bar = 1;')
    })

    it('should apply an extract-variable action', () => {
      const context: RefactoringContext = {
        filePath: 'test.ts',
        source: 'const result = a + b;',
      }
      const action: RefactoringAction = {
        type: 'extract-variable',
        description: 'Extract a + b to sum',
        filePath: 'test.ts',
        edits: [
          { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1, newText: 'const sum = a + b;\n' },
          { startLine: 2, startColumn: 17, endLine: 2, endColumn: 22, newText: 'sum' },
        ],
      }
      const result = engine.applyAction(context, action)
      expect(result).toContain('const sum = a + b;')
    })
  })

  describe('getSuggestions', () => {
    it('should return suggestions for source with issues', () => {
      const context: RefactoringContext = {
        filePath: 'test.ts',
        source: 'function longFunc() {\n' + Array(25).fill('  const x = 1;').join('\n') + '\n}',
      }
      const suggestions = engine.getSuggestions(context)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should return empty suggestions for clean source', () => {
      const context: RefactoringContext = {
        filePath: 'test.ts',
        source: 'const x = 1;\nconst y = 2;',
      }
      const suggestions = engine.getSuggestions(context)
      expect(suggestions.filter(s => s.type === 'extract-function')).toEqual([])
    })

    it('should detect duplicated code blocks', () => {
      const block = '  const x = 1;\n  const y = 2;\n  const z = x + y;'
      const source = block + '\n\n' + block
      const suggestions = engine.detectDuplicatedCode(source)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]!.type).toBe('extract-function')
    })

    it('should not flag short blocks as duplicated', () => {
      const source = 'a\na'
      const suggestions = engine.detectDuplicatedCode(source)
      expect(suggestions).toEqual([])
    })
  })

  describe('detectLongFunctions', () => {
    it('should detect functions exceeding max lines', () => {
      const source = 'function longFunc() {\n' + Array(25).fill('  const x = 1;').join('\n') + '\n}'
      const suggestions = engine.detectLongFunctions(source, 20)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]!.description).toContain('longFunc')
    })

    it('should not flag short functions', () => {
      const source = 'function short() {\n  return 1;\n}'
      const suggestions = engine.detectLongFunctions(source, 20)
      expect(suggestions).toEqual([])
    })

    it('should set impact to high for very long functions', () => {
      const source = 'function veryLong() {\n' + Array(50).fill('  const x = 1;').join('\n') + '\n}'
      const suggestions = engine.detectLongFunctions(source, 20)
      expect(suggestions[0]!.impact).toBe('high')
    })

    it('should set impact to medium for moderately long functions', () => {
      const source = 'function medFunc() {\n' + Array(25).fill('  const x = 1;').join('\n') + '\n}'
      const suggestions = engine.detectLongFunctions(source, 20)
      expect(suggestions[0]!.impact).toBe('medium')
    })

    it('should detect arrow functions', () => {
      const source = 'const fn = () => {\n' + Array(25).fill('  x++;').join('\n') + '\n}'
      const suggestions = engine.detectLongFunctions(source, 20)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should include line number in location', () => {
      const source = 'function longFunc() {\n' + Array(25).fill('  x++;').join('\n') + '\n}'
      const suggestions = engine.detectLongFunctions(source, 20)
      expect(suggestions[0]!.location.line).toBe(1)
    })
  })

  describe('detectComplexConditions', () => {
    it('should detect complex && conditions', () => {
      const source = 'if (a && b && c && d) {}'
      const suggestions = engine.detectComplexConditions(source)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]!.type).toBe('extract-variable')
    })

    it('should detect complex || conditions', () => {
      const source = 'if (a || b || c || d) {}'
      const suggestions = engine.detectComplexConditions(source)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should detect mixed && and || conditions', () => {
      const source = 'if (a && b || c && d) {}'
      const suggestions = engine.detectComplexConditions(source)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should not flag simple conditions', () => {
      const source = 'if (a && b) {}'
      const suggestions = engine.detectComplexConditions(source)
      expect(suggestions).toEqual([])
    })

    it('should detect deeply nested parentheses', () => {
      const source = 'const x = ((((a + b))));'
      const suggestions = engine.detectComplexConditions(source)
      expect(suggestions.some(s => s.type === 'simplify')).toBe(true)
    })

    it('should set higher confidence for more operators', () => {
      const source5 = 'if (a && b && c && d && e) {}'
      const source3 = 'if (a && b && c && d) {}'
      const sug5 = engine.detectComplexConditions(source5)
      const sug3 = engine.detectComplexConditions(source3)
      expect(sug5[0]!.confidence).toBeGreaterThan(sug3[0]!.confidence)
    })

    it('should set high impact for very complex conditions', () => {
      const source = 'if (a && b && c && d && e && f) {}'
      const suggestions = engine.detectComplexConditions(source)
      expect(suggestions[0]!.impact).toBe('high')
    })
  })

  describe('previewChanges', () => {
    it('should show preview with markers', () => {
      const source = 'const foo = 1;\nconst bar = 2;'
      const action: RefactoringAction = {
        type: 'rename',
        description: 'test',
        filePath: 'test.ts',
        edits: [{ startLine: 1, startColumn: 7, endLine: 1, endColumn: 10, newText: 'baz' }],
      }
      const preview = engine.previewChanges(source, action)
      expect(preview).toContain('+')
      expect(preview).toContain('baz')
    })

    it('should include line numbers in preview', () => {
      const source = 'const foo = 1;'
      const action: RefactoringAction = {
        type: 'rename',
        description: 'test',
        filePath: 'test.ts',
        edits: [{ startLine: 1, startColumn: 7, endLine: 1, endColumn: 10, newText: 'bar' }],
      }
      const preview = engine.previewChanges(source, action)
      expect(preview).toContain('1:')
    })

    it('should include separator between change groups', () => {
      const source = 'const foo = 1;\nconst bar = 2;'
      const action: RefactoringAction = {
        type: 'rename',
        description: 'test',
        filePath: 'test.ts',
        edits: [
          { startLine: 1, startColumn: 7, endLine: 1, endColumn: 10, newText: 'baz' },
          { startLine: 2, startColumn: 7, endLine: 2, endColumn: 10, newText: 'qux' },
        ],
      }
      const preview = engine.previewChanges(source, action)
      expect(preview).toContain('---')
    })
  })
})

describe('Integration', () => {
  it('should rename and then apply edits', () => {
    const renameEngine = new RenameEngine()
    const refactorEngine = new RefactorEngine()
    const source = 'const foo = 1;\nconsole.log(foo);'

    const renameResult = renameEngine.renameSymbol(source, 'foo', 'bar')
    expect(renameResult.success).toBe(true)

    const edits = renameResult.edits.get('file')!
    const result = refactorEngine.applyEdit(source, edits)
    expect(result).toBe('const bar = 1;\nconsole.log(bar);')
  })

  it('should extract variable and apply edits', () => {
    const extractEngine = new ExtractEngine()
    const refactorEngine = new RefactorEngine()
    const source = 'const result = a + b + c;'

    const extractResult = extractEngine.extractVariable(source, 'a + b', 'sum', 1)
    expect(extractResult.success).toBe(true)

    const result = refactorEngine.applyEdit(source, extractResult.sourceEdits)
    expect(result).toContain('const sum = a + b')
    expect(result).toContain('sum + c')
  })

  it('should chain rename with suggestion detection', () => {
    const refactorEngine = new RefactorEngine()
    const source = 'if (a && b && c && d) {\n  doSomething();\n}'

    const suggestions = refactorEngine.detectComplexConditions(source)
    expect(suggestions.length).toBeGreaterThan(0)
  })

  it('should handle full refactoring workflow', () => {
    const renameEngine = new RenameEngine()
    const refactorEngine = new RefactorEngine()
    const source = 'function process(data) {\n  const result = data.map(x => x * 2);\n  return result;\n}'

    const renameResult = renameEngine.renameSymbol(source, 'data', 'input')
    const edits = renameResult.edits.get('file')!
    const renamed = refactorEngine.applyEdit(source, edits)
    expect(renamed).toContain('input')
    expect(renamed).not.toContain('data.map')
    expect(renamed).toContain('input.map')
  })

  it('should detect suggestions and apply fixes', () => {
    const refactorEngine = new RefactorEngine()
    const block = '  const a = 1;\n  const b = 2;\n  const c = a + b;'
    const source = 'function one() {\n' + block + '\n}\nfunction two() {\n' + block + '\n}'

    const dupes = refactorEngine.detectDuplicatedCode(source)
    expect(dupes.length).toBeGreaterThan(0)
    expect(dupes[0]!.type).toBe('extract-function')
  })
})

describe('Edge cases', () => {
  const renameEngine = new RenameEngine()
  const extractEngine = new ExtractEngine()
  const refactorEngine = new RefactorEngine()

  it('should handle empty source in rename', () => {
    const result = renameEngine.renameSymbol('', 'foo', 'bar')
    expect(result.success).toBe(false)
  })

  it('should handle empty source in extract function', () => {
    const result = extractEngine.extractFunction('', 1, 1, 'foo')
    expect(result.success).toBe(false)
  })

  it('should handle empty source in detectDuplicatedCode', () => {
    const suggestions = refactorEngine.detectDuplicatedCode('')
    expect(suggestions).toEqual([])
  })

  it('should handle empty source in detectLongFunctions', () => {
    const suggestions = refactorEngine.detectLongFunctions('', 20)
    expect(suggestions).toEqual([])
  })

  it('should handle empty source in detectComplexConditions', () => {
    const suggestions = refactorEngine.detectComplexConditions('')
    expect(suggestions).toEqual([])
  })

  it('should handle source with only comments', () => {
    const source = '// just a comment\n/* block comment */'
    const result = renameEngine.renameSymbol(source, 'comment', 'note')
    expect(result.success).toBe(false)
  })

  it('should handle single character variable names', () => {
    const source = 'const x = 1;\nconst y = x + 2;'
    const result = renameEngine.renameSymbol(source, 'x', 'z')
    expect(result.success).toBe(true)
    expect(result.occurrences).toBe(2)
  })

  it('should handle unicode in source', () => {
    const source = 'const café = 1;\nconsole.log(café);'
    const result = renameEngine.renameSymbol(source, 'café', 'cafe')
    expect(result.success).toBe(true)
  })

  it('should handle very long lines', () => {
    const longExpr = 'a'.repeat(1000)
    const source = `const foo = ${longExpr};`
    const result = renameEngine.renameSymbol(source, 'foo', 'bar')
    expect(result.success).toBe(true)
  })

  it('should handle extract function with no parameters', () => {
    const source = 'function main() {\n  console.log("hello");\n}'
    const result = extractEngine.extractFunction(source, 2, 2, 'greet')
    expect(result.success).toBe(true)
  })

  it('should handle applyEdit with overlapping-style edits applied in reverse', () => {
    const source = 'aaaa'
    const edits: TextEdit[] = [
      { startLine: 1, startColumn: 1, endLine: 1, endColumn: 2, newText: 'b' },
      { startLine: 1, startColumn: 3, endLine: 1, endColumn: 4, newText: 'c' },
    ]
    const result = refactorEngine.applyEdit(source, edits)
    expect(result).toBe('baca')
  })

  it('should handle rename of property name (dot notation)', () => {
    const source = 'const obj = {};\nobj.foo = 1;\nobj.bar = obj.foo;'
    const result = renameEngine.renameSymbol(source, 'foo', 'baz')
    expect(result.success).toBe(true)
  })

  it('should handle detection with nested functions', () => {
    const source = 'function outer() {\n  function inner() {\n    const x = 1;\n    return x;\n  }\n  return inner();\n}'
    const suggestions = refactorEngine.detectLongFunctions(source, 20)
    expect(suggestions).toEqual([])
  })

  it('should handle getSuggestions with selection context', () => {
    const context: RefactoringContext = {
      filePath: 'test.ts',
      source: 'const x = 1;',
      selection: { startLine: 1, startColumn: 7, endLine: 1, endColumn: 8 },
    }
    const suggestions = refactorEngine.getSuggestions(context)
    expect(Array.isArray(suggestions)).toBe(true)
  })

  it('should handle getSuggestions with cursor position', () => {
    const context: RefactoringContext = {
      filePath: 'test.ts',
      source: 'const foo = 1;',
      cursor: { line: 1, column: 7 },
    }
    const suggestions = refactorEngine.getSuggestions(context)
    expect(Array.isArray(suggestions)).toBe(true)
  })
})
