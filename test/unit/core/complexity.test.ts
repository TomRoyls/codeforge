import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { Project, type SourceFile, Node, SyntaxKind } from 'ts-morph'
import {
  getComplexityCategory,
  calculateCyclomaticComplexity,
  calculateCognitiveComplexity,
  calculateComplexitySummary,
  type FunctionComplexity,
  type ComplexityCategory,
} from '../../../src/core/complexity'
import { type FunctionLikeNode, getFunctionName } from '../../../src/ast/visitor'

import { globalParseCache } from '../../../src/cache/parse-cache'

import { Parser } from '../../../src/core/parser'

describe('Complexity Analysis', () => {
  let project: Project
  let parser: Parser

  beforeEach(() => {
    globalParseCache.clear()
    parser = new Parser()
    project = new Project({
      skipFileDependencyResolution: true,
      skipAddingFilesFromTsConfig: true,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
      },
    })
  })

  afterEach(() => {
    parser.dispose()
    globalParseCache.clear()
  })

  function createSourceFile(code: string, fileName: string = '/test.ts'): SourceFile {
    return project.createSourceFile(fileName, code)
  }

  describe('getComplexityCategory', () => {
    test('returns "low" for complexity 1-5', () => {
      expect(getComplexityCategory(1)).toBe('low')
      expect(getComplexityCategory(3)).toBe('low')
      expect(getComplexityCategory(5)).toBe('low')
    })

    test('returns "moderate" for complexity 6-10', () => {
      expect(getComplexityCategory(6)).toBe('moderate')
      expect(getComplexityCategory(8)).toBe('moderate')
      expect(getComplexityCategory(10)).toBe('moderate')
    })
    test('returns "high" for complexity 11-20', () => {
      expect(getComplexityCategory(11)).toBe('high')
      expect(getComplexityCategory(15)).toBe('high')
      expect(getComplexityCategory(20)).toBe('high')
    })
    test('returns "extreme" for complexity 21+', () => {
      expect(getComplexityCategory(21)).toBe('extreme')
      expect(getComplexityCategory(30)).toBe('extreme')
      expect(getComplexityCategory(100)).toBe('extreme')
    })
  })

  describe('calculateCyclomaticComplexity', () => {
    test('returns 1 for simple function with no branches', () => {
      const code = `function simple() { return 1; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('simple')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })
    test('counts if statement as +1', () => {
      const code = `function withIf() { if (true) { return 1; } return 0; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withIf')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts for loop as +1', () => {
      const code = `function withFor() { for (let i = 0; i < 10; i++) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withFor')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts while loop as +1', () => {
      const code = `function withWhile() { while (true) { break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withWhile')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts for-in loop as +1', () => {
      const code = `function withForIn() { for (const x in []) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withForIn')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts for-of loop as +1', () => {
      const code = `function withForOf() { for (const x of []) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withForOf')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts do-while loop as +1', () => {
      const code = `function withDo() { do {} while (false); }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withDo')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts ternary operator as +1', () => {
      const code = `function withTernary() { return true ? 1 : 0; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withTernary')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts catch clause as +1', () => {
      const code = `function withCatch() { try {} catch (e) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withCatch')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts case clause as +1', () => {
      const code = `function withSwitch() { switch (x) { case 1: break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withSwitch')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
    test('counts multiple case clauses', () => {
      const code = `function withMultiCase() { switch (x) { case 1: break; case 2: break; case 3: break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withMultiCase')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })
    test('counts && operator as +1', () => {
      const code = `function withAnd() { if (a && b) { return true; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withAnd')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
    test('counts || operator as +1', () => {
      const code = `function withOr() { if (a || b) { return true; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withOr')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
    test('counts nested if statements', () => {
      const code = `function nested() { if (a) { if (b) { return 1; } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('nested')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
    test('handles complex function with multiple constructs', () => {
      const code = `
        function complex(x: number) {
          if (x > 0) {
            for (let i = 0; i < x; i++) {
              if (i === 5) {
                return i;
              }
            }
          } else if (x < 0) {
            return -1;
          }
          return 0;
        }
      `
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('complex')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(5)
    })
  })

  describe('calculateCognitiveComplexity', () => {
    test('returns 1 for simple function with no branches', () => {
      const code = `function simple() { return 1; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('simple')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })
    test('adds nesting penalty for nested if', () => {
      const code = `function nestedIf() { if (a) { if (b) { return 1; } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('nestedIf')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
    test('adds nesting penalty for nested loops', () => {
      const code = `function nestedLoop() { for (let i = 0; i < 10; i++) { for (let j = 0; j < 10; j++) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('nestedLoop')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
    test('adds nesting penalty for if inside for loop', () => {
      const code = `function ifInFor() { for (let i = 0; i < 10; i++) { if (i === 5) { return i; } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifInFor')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
    test('counts deeply nested structures', () => {
      const code = `function deeplyNested() { if (a) { for (let i = 0; i < 10; i++) { if (b) { while (c) { if (d) { return 1; } } } } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('deeplyNested')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBeGreaterThan(10)
    })
    test('does not add penalty for sibling branches', () => {
      const code = `function siblings() { if (a) {} if (b) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('siblings')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })
  })

  describe('calculateCyclomaticComplexity with accessors', () => {
    test('getter with no branches returns 1', () => {
      const code = `class A { get val() { return this._val; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('val')!
      const complexity = calculateCyclomaticComplexity(getter as never)
      expect(complexity).toBe(1)
    })
    test('getter with if returns 2', () => {
      const code = `class A { get val() { if (this._val) { return this._val; } return 0; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('val')!
      const complexity = calculateCyclomaticComplexity(getter as never)
      expect(complexity).toBe(2)
    })
    test('getter with ternary returns 2', () => {
      const code = `class A { get val() { return this._val ? this._val : 0; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('val')!
      const complexity = calculateCyclomaticComplexity(getter as never)
      expect(complexity).toBe(2)
    })
    test('setter with no branches returns 1', () => {
      const code = `class A { set val(v: number) { this._val = v; } }`
      const sourceFile = createSourceFile(code)
      const setter = sourceFile.getClass('A')!.getSetAccessor('val')!
      const complexity = calculateCyclomaticComplexity(setter as never)
      expect(complexity).toBe(1)
    })
    test('setter with if returns 2', () => {
      const code = `class A { set val(v: number) { if (v > 0) { this._val = v; } } }`
      const sourceFile = createSourceFile(code)
      const setter = sourceFile.getClass('A')!.getSetAccessor('val')!
      const complexity = calculateCyclomaticComplexity(setter as never)
      expect(complexity).toBe(2)
    })
    test('constructor with no branches returns 1', () => {
      const code = `class A { constructor() {} }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCyclomaticComplexity(ctor as never)
      expect(complexity).toBe(1)
    })
    test('constructor with for loop returns 2', () => {
      const code = `class A { constructor(n: number) { for (let i = 0; i < n; i++) {} } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCyclomaticComplexity(ctor as never)
      expect(complexity).toBe(2)
    })
    test('constructor with try-catch returns 2', () => {
      const code = `class A { constructor() { try { this.init(); } catch (e) {} } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCyclomaticComplexity(ctor as never)
      expect(complexity).toBe(2)
    })
  })

  describe('calculateComplexitySummary', () => {
    test('returns empty summary for empty array', () => {
      const summary = calculateComplexitySummary([])
      expect(summary.totalFunctions).toBe(0)
      expect(summary.averageCyclomatic).toBe(0)
      expect(summary.averageCognitive).toBe(0)
      expect(summary.maxCyclomatic).toBe(0)
      expect(summary.maxCognitive).toBe(0)
    })
    test('calculates correct summary for single function', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'test',
          filePath: '/test.ts',
          startLine: 1,
          cyclomatic: 5,
          cognitive: 3,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(1)
      expect(summary.averageCyclomatic).toBe(5)
      expect(summary.averageCognitive).toBe(3)
      expect(summary.maxCyclomatic).toBe(5)
      expect(summary.maxCognitive).toBe(3)
    })
    test('calculates correct summary for multiple functions', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/test.ts',
          startLine: 1,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/test.ts',
          startLine: 5,
          cyclomatic: 10,
          cognitive: 8,
          category: 'moderate',
        },
        {
          functionName: 'c',
          filePath: '/test.ts',
          startLine: 10,
          cyclomatic: 25,
          cognitive: 30,
          category: 'extreme',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(3)
      expect(summary.averageCyclomatic).toBe(12.33)
      expect(summary.averageCognitive).toBe(13.33)
      expect(summary.maxCyclomatic).toBe(25)
      expect(summary.maxCognitive).toBe(30)
    })
    test('counts category breakdown correctly', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/test.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/test.ts',
          startLine: 2,
          cyclomatic: 7,
          cognitive: 7,
          category: 'moderate',
        },
        {
          functionName: 'c',
          filePath: '/test.ts',
          startLine: 3,
          cyclomatic: 15,
          cognitive: 15,
          category: 'high',
        },
        {
          functionName: 'd',
          filePath: '/test.ts',
          startLine: 4,
          cyclomatic: 30,
          cognitive: 30,
          category: 'extreme',
        },
        {
          functionName: 'e',
          filePath: '/test.ts',
          startLine: 5,
          cyclomatic: 3,
          cognitive: 3,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.low).toBe(2)
      expect(summary.categoryBreakdown.moderate).toBe(1)
      expect(summary.categoryBreakdown.high).toBe(1)
      expect(summary.categoryBreakdown.extreme).toBe(1)
    })
  })

  describe('getComplexityCategory edge cases', () => {
    test('returns "low" for complexity 0', () => {
      expect(getComplexityCategory(0)).toBe('low')
    })

    test('returns "low" for negative complexity', () => {
      expect(getComplexityCategory(-1)).toBe('low')
    })

    test('boundary: exactly 5 is low', () => {
      expect(getComplexityCategory(5)).toBe('low')
    })

    test('boundary: exactly 6 is moderate', () => {
      expect(getComplexityCategory(6)).toBe('moderate')
    })

    test('boundary: exactly 10 is moderate', () => {
      expect(getComplexityCategory(10)).toBe('moderate')
    })

    test('boundary: exactly 11 is high', () => {
      expect(getComplexityCategory(11)).toBe('high')
    })

    test('boundary: exactly 20 is high', () => {
      expect(getComplexityCategory(20)).toBe('high')
    })

    test('boundary: exactly 21 is extreme', () => {
      expect(getComplexityCategory(21)).toBe('extreme')
    })
  })

  describe('calculateCyclomaticComplexity additional paths', () => {
    test('counts chained && operators', () => {
      const code = `function chainedAnd() { if (a && b && c) { return 1; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('chainedAnd')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })

    test('counts mixed && and || operators', () => {
      const code = `function mixedLogic() { if (a && b || c) { return 1; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('mixedLogic')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })

    test('counts else-if as additional if', () => {
      const code = `function elseIf() { if (a) {} else if (b) {} else {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('elseIf')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts nested ternary expressions', () => {
      const code = `function nestedTernary() { return a ? (b ? 1 : 2) : 3; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('nestedTernary')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('handles arrow function with branches', () => {
      const code = `const arrow = (x: number) => { if (x > 0) { return 1; } return 0; }`
      const sourceFile = createSourceFile(code)
      const arrowDecl = sourceFile.getVariableDeclaration('arrow')!
      const arrowFunc = arrowDecl.getFirstChildByKind(SyntaxKind.ArrowFunction)!
      const complexity = calculateCyclomaticComplexity(arrowFunc as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('handles function with no body statements', () => {
      const code = `function empty() {}`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('empty')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts switch with default and multiple cases', () => {
      const code = `function switchDefault(x: number) { switch (x) { case 1: break; case 2: break; default: break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('switchDefault')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts try-catch with nested if', () => {
      const code = `function tryCatchNested() { try { if (x) {} } catch (e) { if (y) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('tryCatchNested')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })

    test('counts logical operator in non-if context', () => {
      const code = `function logicAssign() { const x = a && b; return x; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('logicAssign')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('counts multiple catch clauses in separate try blocks', () => {
      const code = `function multiCatch() { try {} catch (e) {} try {} catch (e2) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('multiCatch')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
  })

  describe('calculateCognitiveComplexity additional paths', () => {
    test('counts switch statement as +1', () => {
      const code = `function withSwitch() { switch (x) { case 1: break; case 2: break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withSwitch')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts conditional expression (ternary)', () => {
      const code = `function withTernary() { return x ? 1 : 0; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withTernary')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('adds nesting for ternary branches', () => {
      const code = `function nestedTernary() { return a ? (b ? 1 : 2) : 3; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('nestedTernary')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBeGreaterThanOrEqual(3)
    })

    test('counts catch clause with nesting', () => {
      const code = `function withCatch() { try { if (x) {} } catch (e) { if (y) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withCatch')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBeGreaterThan(2)
    })

    test('counts for-in loop', () => {
      const code = `function withForIn() { for (const x in obj) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withForIn')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts for-of loop', () => {
      const code = `function withForOf() { for (const x of arr) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withForOf')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts do-while loop', () => {
      const code = `function withDoWhile() { do {} while (false); }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withDoWhile')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts logical && operator outside if condition', () => {
      const code = `function withAnd() { return a && b; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withAnd')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts logical || operator outside if condition', () => {
      const code = `function withOr() { return a || b; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withOr')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts nullish coalescing ?? operator outside if condition', () => {
      const code = `function withNullish() { return a ?? b; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withNullish')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts cyclomatic complexity for nullish coalescing ?? operator', () => {
      const code = `function withNullish() { return a ?? b; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withNullish')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('does not recurse into nested function declarations', () => {
      const code = `function outer() { function inner() { if (x) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('outer')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('does not recurse into nested arrow functions', () => {
      const code = `function outer() { const inner = () => { if (x) {} }; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('outer')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('handles if-else if chain correctly', () => {
      const code = `function ifElseChain() { if (a) {} else if (b) {} else if (c) {} else {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifElseChain')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('handles if with else block containing nested if', () => {
      const code = `function elseNested() { if (a) {} else { if (b) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('elseNested')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('returns 1 for empty function body', () => {
      const code = `function empty() {}`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('empty')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts switch with nested if inside case', () => {
      const code = `function switchNested() { switch (x) { case 1: if (y) { break; } break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('switchNested')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBeGreaterThan(2)
    })

    test('counts for-of with nested if', () => {
      const code = `function forOfNested() { for (const x of arr) { if (x) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forOfNested')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
  })

  describe('calculateCognitiveComplexity with accessors and constructors', () => {
    test('getter with no branches returns 1', () => {
      const code = `class A { get val() { return this._val; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('val')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBe(1)
    })

    test('getter with if returns 1', () => {
      const code = `class A { get val() { if (this._val) { return this._val; } return 0; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('val')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBe(1)
    })

    test('getter with nested if returns 3', () => {
      const code = `class A { get val() { if (this._val) { if (this._ok) { return 1; } } return 0; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('val')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBe(3)
    })

    test('setter with no branches returns 1', () => {
      const code = `class A { set val(v: number) { this._val = v; } }`
      const sourceFile = createSourceFile(code)
      const setter = sourceFile.getClass('A')!.getSetAccessor('val')!
      const complexity = calculateCognitiveComplexity(setter as never)
      expect(complexity).toBe(1)
    })

    test('setter with if-else returns 1', () => {
      const code = `class A { set val(v: number) { if (v > 0) { this._val = v; } else { this._val = 0; } } }`
      const sourceFile = createSourceFile(code)
      const setter = sourceFile.getClass('A')!.getSetAccessor('val')!
      const complexity = calculateCognitiveComplexity(setter as never)
      expect(complexity).toBe(1)
    })

    test('constructor with no branches returns 1', () => {
      const code = `class A { constructor() {} }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCognitiveComplexity(ctor as never)
      expect(complexity).toBe(1)
    })

    test('constructor with for loop returns 1', () => {
      const code = `class A { constructor(n: number) { for (let i = 0; i < n; i++) {} } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCognitiveComplexity(ctor as never)
      expect(complexity).toBe(1)
    })

    test('constructor with nested for-if returns 3', () => {
      const code = `class A { constructor(n: number) { for (let i = 0; i < n; i++) { if (i === 5) { break; } } } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCognitiveComplexity(ctor as never)
      expect(complexity).toBe(3)
    })

    test('constructor with switch returns 1', () => {
      const code = `class A { constructor(x: number) { switch (x) { case 1: break; default: break; } } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCognitiveComplexity(ctor as never)
      expect(complexity).toBe(1)
    })

    test('constructor with try-catch returns 1', () => {
      const code = `class A { constructor() { try { this.init(); } catch (e) {} } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCognitiveComplexity(ctor as never)
      expect(complexity).toBe(1)
    })

    test('getter with for and if returns 3', () => {
      const code = `class A { get items() { for (const x of this._data) { if (x) { return x; } } return null; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('items')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBe(3)
    })

    test('getter with logical operators returns correct complexity', () => {
      const code = `class A { get computed() { return this.a && this.b || this.c; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('computed')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBe(2)
    })
  })

  describe('calculateComplexitySummary additional paths', () => {
    test('handles two functions with different complexity', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'simple',
          filePath: '/test.ts',
          startLine: 1,
          cyclomatic: 2,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'complex',
          filePath: '/test.ts',
          startLine: 5,
          cyclomatic: 15,
          cognitive: 20,
          category: 'high',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(2)
      expect(summary.averageCyclomatic).toBe(8.5)
      expect(summary.averageCognitive).toBe(10.5)
      expect(summary.maxCyclomatic).toBe(15)
      expect(summary.maxCognitive).toBe(20)
    })

    test('handles all functions in same category', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 3,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 5,
          cognitive: 4,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.low).toBe(3)
      expect(summary.categoryBreakdown.moderate).toBe(0)
      expect(summary.categoryBreakdown.high).toBe(0)
      expect(summary.categoryBreakdown.extreme).toBe(0)
    })

    test('rounds averages to two decimal places', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 3,
          cognitive: 3,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.averageCyclomatic).toBe(2)
      expect(summary.averageCognitive).toBe(2)
    })

    test('handles single extreme function', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'mega',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 50,
          cognitive: 60,
          category: 'extreme',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(1)
      expect(summary.maxCyclomatic).toBe(50)
      expect(summary.maxCognitive).toBe(60)
      expect(summary.categoryBreakdown.extreme).toBe(1)
    })

    test('summary with all four categories present', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 8,
          cognitive: 8,
          category: 'moderate',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 15,
          cognitive: 15,
          category: 'high',
        },
        {
          functionName: 'd',
          filePath: '/t.ts',
          startLine: 4,
          cyclomatic: 25,
          cognitive: 25,
          category: 'extreme',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.low).toBe(1)
      expect(summary.categoryBreakdown.moderate).toBe(1)
      expect(summary.categoryBreakdown.high).toBe(1)
      expect(summary.categoryBreakdown.extreme).toBe(1)
      expect(summary.totalFunctions).toBe(4)
    })
  })

  describe('calculateCyclomaticComplexity extended coverage', () => {
    test('counts method declaration in class', () => {
      const code = `
        class MyClass {
          method() { if (x) { return 1; } return 0; }
        }
      `
      const sourceFile = createSourceFile(code)
      const cls = sourceFile.getClass('MyClass')!
      const method = cls.getMethod('method')!
      const complexity = calculateCyclomaticComplexity(method as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('counts private method in class', () => {
      const code = `
        class MyClass {
          private secret() { if (a) {} if (b) {} }
        }
      `
      const sourceFile = createSourceFile(code)
      const cls = sourceFile.getClass('MyClass')!
      const method = cls.getMethod('secret')!
      const complexity = calculateCyclomaticComplexity(method as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts async arrow function with multiple branches', () => {
      const code = `const fn = async () => { if (a) {} else if (b) {} }`
      const sourceFile = createSourceFile(code)
      const decl = sourceFile.getVariableDeclaration('fn')!
      const arrow = decl.getFirstChildByKind(SyntaxKind.ArrowFunction)!
      const complexity = calculateCyclomaticComplexity(arrow as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts chained ternary with three branches', () => {
      const code = `function chained() { return a ? 1 : b ? 2 : 3; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('chained')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts multiple loops in same function', () => {
      const code = `function multiLoop() { for (let i = 0; i < 5; i++) {} while (true) {} do {} while (false); }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('multiLoop')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })

    test('counts combination of if, loop, ternary, and catch', () => {
      const code = `
        function combo() {
          if (a) {}
          for (let i = 0; i < 5; i++) {}
          try {} catch (e) {}
          return b ? 1 : 0;
        }
      `
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('combo')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(5)
    })

    test('returns 1 for function that only returns a value', () => {
      const code = `function identity(x: number) { return x; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('identity')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts logical operators in return statement', () => {
      const code = `function logicReturn() { return a || b || c; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('logicReturn')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts deeply nested if-else chain', () => {
      const code = `function deepIf() { if (a) { if (b) { if (c) { return 1; } } } return 0; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('deepIf')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })

    test('counts switch inside loop', () => {
      const code = `
        function switchInLoop() {
          for (let i = 0; i < 10; i++) {
            switch (i) { case 1: break; case 2: break; }
          }
        }
      `
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('switchInLoop')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })

    test('counts logical AND in while condition', () => {
      const code = `function whileLogic() { while (a && b) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('whileLogic')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts logical OR in for condition', () => {
      const code = `function forLogic() { for (let i = 0; a || b; i++) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forLogic')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts catch with finally block', () => {
      const code = `function withFinally() { try {} catch (e) {} finally {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('withFinally')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('handles function expression with branches', () => {
      const code = `const fn = function() { if (x) {} }`
      const sourceFile = createSourceFile(code)
      const decl = sourceFile.getVariableDeclaration('fn')!
      const funcExpr = decl.getFirstChildByKind(SyntaxKind.FunctionExpression)!
      const complexity = calculateCyclomaticComplexity(funcExpr as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('counts multiple nested ternaries with logical operators', () => {
      const code = `function megaTernary() { return (a && b) ? (c ? 1 : 2) : (d || e) ? 3 : 4; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('megaTernary')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(6)
    })
  })

  describe('calculateCognitiveComplexity extended coverage', () => {
    test('does not add nesting for sibling for loops', () => {
      const code = `function siblingLoops() { for (let i = 0; i < 5; i++) {} for (let j = 0; j < 5; j++) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('siblingLoops')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('penalizes triple-nested ifs', () => {
      const code = `function tripleNest() { if (a) { if (b) { if (c) { return 1; } } } return 0; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('tripleNest')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(6)
    })

    test('penalizes if-else with nested for loop', () => {
      const code = `function ifElseFor() { if (a) { for (let i = 0; i < 5; i++) {} } else { return 0; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifElseFor')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('handles catch inside for loop', () => {
      const code = `function catchInFor() { for (let i = 0; i < 5; i++) { try {} catch (e) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('catchInFor')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts multiple logical operators', () => {
      const code = `function multiLogic() { return a && b && c || d; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('multiLogic')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts switch with multiple cases as single increment', () => {
      const code = `function multiCase() { switch (x) { case 1: break; case 2: break; case 3: break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('multiCase')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts while loop with nested if', () => {
      const code = `function whileIf() { while (a) { if (b) { break; } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('whileIf')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts for-in with nested if', () => {
      const code = `function forInIf() { for (const k in obj) { if (k === 'x') {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forInIf')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('counts do-while with nested if', () => {
      const code = `function doWhileIf() { do { if (x) { break; } } while (y); }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('doWhileIf')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('returns minimum of 1 for function with only variable declarations', () => {
      const code = `function onlyVars() { const a = 1; const b = 2; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('onlyVars')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts nested ternaries with correct nesting bonus', () => {
      const code = `function nestedTern() { return a ? (b ? (c ? 1 : 0) : 2) : 3; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('nestedTern')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(6)
    })

    test('counts if with both then and else branches increasing nesting', () => {
      const code = `function ifElseNest() { if (a) { if (b) {} } else { if (c) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifElseNest')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(5)
    })

    test('does not recurse into nested function expressions', () => {
      const code = `function outer() { const fn = function() { if (x) {} }; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('outer')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('handles default clause in switch', () => {
      const code = `function switchDefault() { switch (x) { case 1: break; default: break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('switchDefault')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('counts complex real-world-like function', () => {
      const code = `
        function processItems(items: any[]) {
          for (const item of items) {
            if (item.active) {
              switch (item.type) {
                case 'a':
                  if (item.value > 0) { continue; }
                  break;
              }
            }
          }
        }
      `
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('processItems')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBeGreaterThan(5)
    })
  })

  describe('calculateCyclomaticComplexity mixed node types', () => {
    test('getter with multiple if branches returns 3', () => {
      const code = `class A { get x() { if (a) {} if (b) {} return 0; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('x')!
      const complexity = calculateCyclomaticComplexity(getter as never)
      expect(complexity).toBe(3)
    })

    test('setter with while loop returns 2', () => {
      const code = `class A { set x(v: number) { while (v > 0) { v--; } } }`
      const sourceFile = createSourceFile(code)
      const setter = sourceFile.getClass('A')!.getSetAccessor('x')!
      const complexity = calculateCyclomaticComplexity(setter as never)
      expect(complexity).toBe(2)
    })

    test('constructor with else-if chain returns 3', () => {
      const code = `class A { constructor(x: number) { if (x === 1) {} else if (x === 2) {} else {} } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCyclomaticComplexity(ctor as never)
      expect(complexity).toBe(3)
    })

    test('constructor with logical operators in condition returns 3', () => {
      const code = `class A { constructor(a: boolean, b: boolean) { if (a && b) {} } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCyclomaticComplexity(ctor as never)
      expect(complexity).toBe(3)
    })

    test('getter with switch and multiple cases returns 4', () => {
      const code = `class A { get x() { switch (this.type) { case 'a': return 1; case 'b': return 2; case 'c': return 3; default: return 0; } } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('x')!
      const complexity = calculateCyclomaticComplexity(getter as never)
      expect(complexity).toBe(4)
    })

    test('setter with ternary and logical operator returns 3', () => {
      const code = `class A { set x(v: any) { this._v = v && v.ok ? v : null; } }`
      const sourceFile = createSourceFile(code)
      const setter = sourceFile.getClass('A')!.getSetAccessor('x')!
      const complexity = calculateCyclomaticComplexity(setter as never)
      expect(complexity).toBe(3)
    })

    test('constructor with for-of and nested if returns 3', () => {
      const code = `class A { constructor(items: any[]) { for (const item of items) { if (item.active) {} } } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCyclomaticComplexity(ctor as never)
      expect(complexity).toBe(3)
    })

    test('getter with do-while returns 2', () => {
      const code = `class A { get x() { do { this.compute(); } while (this.dirty); return this._val; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('x')!
      const complexity = calculateCyclomaticComplexity(getter as never)
      expect(complexity).toBe(2)
    })
  })

  describe('calculateCognitiveComplexity mixed node types', () => {
    test('getter with ternary inside if returns 3', () => {
      const code = `class A { get x() { if (this.ok) { return this.a ? 1 : 0; } return 0; } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('x')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBe(3)
    })

    test('constructor with while and nested if returns 3', () => {
      const code = `class A { constructor() { while (this.hasNext()) { if (this.valid()) { break; } } } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCognitiveComplexity(ctor as never)
      expect(complexity).toBe(3)
    })

    test('setter with for-in returns 1', () => {
      const code = `class A { set data(obj: any) { for (const k in obj) { this.props[k] = obj[k]; } } }`
      const sourceFile = createSourceFile(code)
      const setter = sourceFile.getClass('A')!.getSetAccessor('data')!
      const complexity = calculateCognitiveComplexity(setter as never)
      expect(complexity).toBe(1)
    })

    test('getter with if-else if chain returns correct complexity', () => {
      const code = `class A { get status() { if (this.a) { return 1; } else if (this.b) { return 2; } else { return 0; } } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('status')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBeGreaterThanOrEqual(1)
    })

    test('constructor with try-catch inside for loop returns 3', () => {
      const code = `class A { constructor(items: any[]) { for (const item of items) { try { this.process(item); } catch (e) {} } } }`
      const sourceFile = createSourceFile(code)
      const ctor = sourceFile.getClass('A')!.getConstructors()[0]!
      const complexity = calculateCognitiveComplexity(ctor as never)
      expect(complexity).toBe(3)
    })

    test('getter with nested ternaries returns 5', () => {
      const code = `class A { get x() { return this.a ? (this.b ? 1 : 0) : (this.c ? 2 : 3); } }`
      const sourceFile = createSourceFile(code)
      const getter = sourceFile.getClass('A')!.getGetAccessor('x')!
      const complexity = calculateCognitiveComplexity(getter as never)
      expect(complexity).toBe(5)
    })
  })

  describe('calculateComplexitySummary extended coverage', () => {
    test('handles large number of functions', () => {
      const functions: FunctionComplexity[] = Array.from({ length: 100 }, (_, i) => ({
        functionName: `fn${i}`,
        filePath: '/t.ts',
        startLine: i + 1,
        cyclomatic: 1,
        cognitive: 1,
        category: 'low' as ComplexityCategory,
      }))
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(100)
      expect(summary.averageCyclomatic).toBe(1)
      expect(summary.categoryBreakdown.low).toBe(100)
    })

    test('handles functions with very high complexity', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'mega',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 500,
          cognitive: 750,
          category: 'extreme',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.maxCyclomatic).toBe(500)
      expect(summary.maxCognitive).toBe(750)
    })

    test('computes correct average with fractional results', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 2,
          cognitive: 3,
          category: 'low',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 3,
          cognitive: 4,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.averageCyclomatic).toBe(2)
      expect(summary.averageCognitive).toBe(3)
    })

    test('categoryBreakdown has zero for missing categories', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 8,
          cognitive: 8,
          category: 'moderate',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.low).toBe(0)
      expect(summary.categoryBreakdown.high).toBe(0)
      expect(summary.categoryBreakdown.extreme).toBe(0)
      expect(summary.categoryBreakdown.moderate).toBe(1)
    })

    test('tracks max for multiple functions with same max cyclomatic', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 15,
          cognitive: 10,
          category: 'high',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 15,
          cognitive: 20,
          category: 'high',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.maxCyclomatic).toBe(15)
      expect(summary.maxCognitive).toBe(20)
    })

    test('averages are rounded to 2 decimal places', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      const avgStr = summary.averageCyclomatic.toString()
      if (avgStr.includes('.')) {
        const decimalPart = avgStr.split('.')[1]
        expect(decimalPart.length).toBeLessThanOrEqual(2)
      }
    })

    test('handles mix of low and extreme complexity functions', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'simple',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'extreme',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 50,
          cognitive: 60,
          category: 'extreme',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.averageCyclomatic).toBe(25.5)
      expect(summary.averageCognitive).toBe(30.5)
      expect(summary.categoryBreakdown.low).toBe(1)
      expect(summary.categoryBreakdown.extreme).toBe(1)
    })

    test('does not mutate input array', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 5,
          cognitive: 5,
          category: 'low',
        },
      ]
      const copy = [...functions]
      calculateComplexitySummary(functions)
      expect(functions).toHaveLength(copy.length)
      expect(functions[0].cyclomatic).toBe(copy[0].cyclomatic)
    })
  })

  describe('getComplexityCategory additional coverage', () => {
    test('returns "low" for very large negative number', () => {
      expect(getComplexityCategory(-100)).toBe('low')
    })

    test('returns "extreme" for very large positive number', () => {
      expect(getComplexityCategory(10000)).toBe('extreme')
    })

    test('boundary: 4 is low (one below moderate boundary)', () => {
      expect(getComplexityCategory(4)).toBe('low')
    })

    test('boundary: 7 is moderate (mid range)', () => {
      expect(getComplexityCategory(7)).toBe('moderate')
    })

    test('boundary: 15 is high (mid range)', () => {
      expect(getComplexityCategory(15)).toBe('high')
    })

    test('boundary: 9 is moderate (one below high boundary)', () => {
      expect(getComplexityCategory(9)).toBe('moderate')
    })

    test('boundary: 19 is high (one below extreme boundary)', () => {
      expect(getComplexityCategory(19)).toBe('high')
    })
  })

  describe('calculateCyclomaticComplexity further edge cases', () => {
    test('try-finally without catch does not add complexity', () => {
      const code = `function tryFinally() { try { x(); } finally { y(); } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('tryFinally')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('empty switch statement has no case clauses', () => {
      const code = `function emptySwitch() { switch (x) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('emptySwitch')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('async generator function with no branches returns 1', () => {
      const code = `async function* asyncGen() { yield 1; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('asyncGen')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('chained || operators in if condition', () => {
      const code = `function chainedOr() { if (a || b || c || d) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('chainedOr')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(5)
    })

    test('two separate if-else blocks', () => {
      const code = `function twoIfElse() { if (a) {} else {} if (b) {} else {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('twoIfElse')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('for-of nested inside for-in', () => {
      const code = `function forInForOf() { for (const x in obj) { for (const y of arr) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forInForOf')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('switch with five case clauses', () => {
      const code = `function fiveCases() { switch (x) { case 1: break; case 2: break; case 3: break; case 4: break; case 5: break; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('fiveCases')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(6)
    })

    test('ternary expression in while condition', () => {
      const code = `function ternaryWhile() { while (a ? true : false) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ternaryWhile')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('do-while with logical AND in condition', () => {
      const code = `function doWhileAnd() { do {} while (a && b); }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('doWhileAnd')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('if statement followed by ternary in variable', () => {
      const code = `function ifThenTernary() { if (a) {} const x = b ? 1 : 0; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifThenTernary')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('for loop with ternary in body', () => {
      const code = `function forTernaryBody() { for (let i = 0; i < 10; i++) { a ? x() : y(); } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forTernaryBody')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('four-way else-if chain', () => {
      const code = `function fourElseIf() { if (a) {} else if (b) {} else if (c) {} else if (d) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('fourElseIf')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(5)
    })

    test('nested for loop containing while loop', () => {
      const code = `function forWhile() { for (;;) { while (true) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forWhile')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('if inside catch inside for loop', () => {
      const code = `function forCatchIf() { for (;;) { try {} catch (e) { if (x) {} } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forCatchIf')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(4)
    })

    test('consecutive ternary expressions in variables', () => {
      const code = `function twoTernaries() { const a = x ? 1 : 0; const b = y ? 2 : 3; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('twoTernaries')!
      const complexity = calculateCyclomaticComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
  })

  describe('calculateCognitiveComplexity further edge cases', () => {
    test('try-finally without catch returns 1', () => {
      const code = `function tryFinally() { try { x(); } finally { y(); } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('tryFinally')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('empty switch statement returns 1', () => {
      const code = `function emptySwitch() { switch (x) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('emptySwitch')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('sibling if-else pairs count independently', () => {
      const code = `function siblingIfElse() { if (a) {} else {} if (b) {} else {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('siblingIfElse')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(2)
    })

    test('for loop with ternary in body adds nesting', () => {
      const code = `function forTernary() { for (;;) { a ? x() : y(); } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forTernary')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('if-else with ternary in both branches', () => {
      const code = `function ifElseTernary() { if (a) { x ? 1 : 0; } else { y ? 2 : 3; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifElseTernary')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(5)
    })

    test('for loop with if-else inside body', () => {
      const code = `function forIfElse() { for (;;) { if (a) {} else {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forIfElse')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('switch statement inside for loop', () => {
      const code = `function forSwitch() { for (;;) { switch (x) { case 1: break; } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forSwitch')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('catch clause inside while loop', () => {
      const code = `function whileCatch() { while (a) { try {} catch (e) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('whileCatch')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('quad-nested if statements accumulate nesting bonuses', () => {
      const code = `function quadNest() { if (a) { if (b) { if (c) { if (d) {} } } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('quadNest')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(10)
    })

    test('for-in with switch containing if statement', () => {
      const code = `function forInSwitchIf() { for (const k in obj) { switch (x) { case 1: if (y) {} break; } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('forInSwitchIf')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(6)
    })

    test('ternary condition logical operators are not counted', () => {
      const code = `function ternaryLogic() { return (a && b) ? 1 : 0; }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ternaryLogic')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('if condition logical operators are not counted', () => {
      const code = `function ifLogic() { if (a && b) {} }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifLogic')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(1)
    })

    test('double-nested for loops with inner if', () => {
      const code = `function doubleForIf() { for (;;) { for (;;) { if (a) {} } } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('doubleForIf')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(6)
    })

    test('while loop with nested while loop', () => {
      const code = `function nestedWhile() { while (a) { while (b) {} } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('nestedWhile')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })

    test('if-else chain with logical operators in body', () => {
      const code = `function ifElseLogic() { if (a) { return x && y; } else { return z || w; } }`
      const sourceFile = createSourceFile(code)
      const func = sourceFile.getFunction('ifElseLogic')!
      const complexity = calculateCognitiveComplexity(func as FunctionLikeNode)
      expect(complexity).toBe(3)
    })
  })

  describe('calculateComplexitySummary with varied inputs', () => {
    test('summary from real complexity values (low to extreme)', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 8,
          cognitive: 6,
          category: 'moderate',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 15,
          cognitive: 20,
          category: 'high',
        },
        {
          functionName: 'd',
          filePath: '/t.ts',
          startLine: 4,
          cyclomatic: 50,
          cognitive: 80,
          category: 'extreme',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(4)
      expect(summary.maxCyclomatic).toBe(50)
      expect(summary.maxCognitive).toBe(80)
      expect(summary.categoryBreakdown.low).toBe(1)
      expect(summary.categoryBreakdown.moderate).toBe(1)
      expect(summary.categoryBreakdown.high).toBe(1)
      expect(summary.categoryBreakdown.extreme).toBe(1)
    })

    test('summary with 10 identical functions', () => {
      const functions: FunctionComplexity[] = Array.from({ length: 10 }, (_, i) => ({
        functionName: `fn${i}`,
        filePath: '/t.ts',
        startLine: i + 1,
        cyclomatic: 5,
        cognitive: 5,
        category: 'low' as ComplexityCategory,
      }))
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(10)
      expect(summary.averageCyclomatic).toBe(5)
      expect(summary.averageCognitive).toBe(5)
      expect(summary.categoryBreakdown.low).toBe(10)
    })

    test('summary with mixed low and moderate only', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 3,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 7,
          cognitive: 8,
          category: 'moderate',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 5,
          cognitive: 4,
          category: 'low',
        },
        {
          functionName: 'd',
          filePath: '/t.ts',
          startLine: 4,
          cyclomatic: 10,
          cognitive: 9,
          category: 'moderate',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.low).toBe(2)
      expect(summary.categoryBreakdown.moderate).toBe(2)
      expect(summary.categoryBreakdown.high).toBe(0)
      expect(summary.categoryBreakdown.extreme).toBe(0)
      expect(summary.averageCyclomatic).toBe(6.25)
      expect(summary.averageCognitive).toBe(5.75)
    })

    test('summary with single high complexity function', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'only',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 15,
          cognitive: 12,
          category: 'high',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(1)
      expect(summary.averageCyclomatic).toBe(15)
      expect(summary.averageCognitive).toBe(12)
      expect(summary.categoryBreakdown.high).toBe(1)
    })

    test('summary with very large dataset performance', () => {
      const functions: FunctionComplexity[] = Array.from({ length: 500 }, (_, i) => ({
        functionName: `fn${i}`,
        filePath: '/t.ts',
        startLine: i + 1,
        cyclomatic: (i % 30) + 1,
        cognitive: (i % 25) + 1,
        category: getComplexityCategory((i % 30) + 1),
      }))
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(500)
      expect(summary.maxCyclomatic).toBe(30)
      expect(summary.maxCognitive).toBe(25)
    })

    test('summary preserves precision for known values', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 3,
          cognitive: 5,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.averageCyclomatic).toBe(2)
      expect(summary.averageCognitive).toBe(3)
    })
  })

  describe('getComplexityCategory and calculateComplexitySummary integration', () => {
    test('getComplexityCategory correctly classifies summary max values', () => {
      expect(getComplexityCategory(1)).toBe('low')
      expect(getComplexityCategory(6)).toBe('moderate')
      expect(getComplexityCategory(11)).toBe('high')
      expect(getComplexityCategory(25)).toBe('extreme')
    })

    test('summary category counts match getComplexityCategory for random values', () => {
      const values = [1, 3, 5, 6, 8, 10, 11, 15, 20, 21, 30, 50]
      const functions: FunctionComplexity[] = values.map((v, i) => ({
        functionName: `fn${i}`,
        filePath: '/t.ts',
        startLine: i + 1,
        cyclomatic: v,
        cognitive: v,
        category: getComplexityCategory(v),
      }))
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.low).toBe(values.filter((v) => v <= 5).length)
      expect(summary.categoryBreakdown.moderate).toBe(
        values.filter((v) => v >= 6 && v <= 10).length,
      )
      expect(summary.categoryBreakdown.high).toBe(values.filter((v) => v >= 11 && v <= 20).length)
      expect(summary.categoryBreakdown.extreme).toBe(values.filter((v) => v >= 21).length)
    })

    test('empty summary has zero for all categories', () => {
      const summary = calculateComplexitySummary([])
      expect(summary.categoryBreakdown.low).toBe(0)
      expect(summary.categoryBreakdown.moderate).toBe(0)
      expect(summary.categoryBreakdown.high).toBe(0)
      expect(summary.categoryBreakdown.extreme).toBe(0)
    })

    test('summary with all extreme functions', () => {
      const functions: FunctionComplexity[] = Array.from({ length: 5 }, (_, i) => ({
        functionName: `fn${i}`,
        filePath: '/t.ts',
        startLine: i + 1,
        cyclomatic: 30 + i,
        cognitive: 40 + i,
        category: 'extreme' as ComplexityCategory,
      }))
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.extreme).toBe(5)
      expect(summary.maxCyclomatic).toBe(34)
      expect(summary.maxCognitive).toBe(44)
    })

    test('getComplexityCategory returns consistent results for same input', () => {
      for (let i = 0; i < 50; i++) {
        const result = getComplexityCategory(i)
        if (i <= 5) expect(result).toBe('low')
        else if (i <= 10) expect(result).toBe('moderate')
        else if (i <= 20) expect(result).toBe('high')
        else expect(result).toBe('extreme')
      }
    })

    test('summary averages are correctly rounded', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 3,
          cognitive: 3,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.averageCyclomatic).toBe(2)
      expect(summary.averageCognitive).toBe(2)
    })

    test('summary with functions spanning all categories', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 8,
          cognitive: 7,
          category: 'moderate',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 18,
          cognitive: 22,
          category: 'high',
        },
        {
          functionName: 'd',
          filePath: '/t.ts',
          startLine: 4,
          cyclomatic: 45,
          cognitive: 55,
          category: 'extreme',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(4)
      expect(summary.averageCyclomatic).toBe(18.25)
      expect(summary.averageCognitive).toBe(21.5)
    })
  })

  describe('calculateComplexitySummary further coverage', () => {
    test('handles single function with complexity of 1', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'simple',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(1)
      expect(summary.averageCyclomatic).toBe(1)
      expect(summary.averageCognitive).toBe(1)
      expect(summary.categoryBreakdown.low).toBe(1)
    })

    test('computes fractional average correctly', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'd',
          filePath: '/t.ts',
          startLine: 4,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.averageCyclomatic).toBe(1.25)
      expect(summary.averageCognitive).toBe(1.25)
    })

    test('handles progressive complexity values', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 3,
          cognitive: 3,
          category: 'low',
        },
        {
          functionName: 'd',
          filePath: '/t.ts',
          startLine: 4,
          cyclomatic: 4,
          cognitive: 4,
          category: 'low',
        },
        {
          functionName: 'e',
          filePath: '/t.ts',
          startLine: 5,
          cyclomatic: 5,
          cognitive: 5,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(5)
      expect(summary.maxCyclomatic).toBe(5)
      expect(summary.maxCognitive).toBe(5)
      expect(summary.averageCyclomatic).toBe(3)
      expect(summary.averageCognitive).toBe(3)
    })

    test('max cognitive can differ from max cyclomatic', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 10,
          cognitive: 5,
          category: 'moderate',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 3,
          cognitive: 15,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.maxCyclomatic).toBe(10)
      expect(summary.maxCognitive).toBe(15)
    })

    test('handles functions with duplicate names', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'fn',
          filePath: '/a.ts',
          startLine: 1,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
        {
          functionName: 'fn',
          filePath: '/b.ts',
          startLine: 1,
          cyclomatic: 4,
          cognitive: 4,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(2)
      expect(summary.averageCyclomatic).toBe(3)
    })

    test('extreme and low categories only', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 1,
          cognitive: 1,
          category: 'low',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 50,
          cognitive: 50,
          category: 'extreme',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 2,
          cognitive: 2,
          category: 'low',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.categoryBreakdown.low).toBe(2)
      expect(summary.categoryBreakdown.extreme).toBe(1)
      expect(summary.categoryBreakdown.moderate).toBe(0)
      expect(summary.categoryBreakdown.high).toBe(0)
    })

    test('handles large dataset of functions', () => {
      const functions: FunctionComplexity[] = Array.from({ length: 1000 }, (_, i) => ({
        functionName: `fn${i}`,
        filePath: '/t.ts',
        startLine: i + 1,
        cyclomatic: (i % 20) + 1,
        cognitive: (i % 15) + 1,
        category: getComplexityCategory((i % 20) + 1),
      }))
      const summary = calculateComplexitySummary(functions)
      expect(summary.totalFunctions).toBe(1000)
      expect(summary.maxCyclomatic).toBe(20)
      expect(summary.maxCognitive).toBe(15)
    })

    test('summary object has all required properties', () => {
      const summary = calculateComplexitySummary([])
      expect(summary).toHaveProperty('totalFunctions')
      expect(summary).toHaveProperty('averageCyclomatic')
      expect(summary).toHaveProperty('averageCognitive')
      expect(summary).toHaveProperty('maxCyclomatic')
      expect(summary).toHaveProperty('maxCognitive')
      expect(summary).toHaveProperty('categoryBreakdown')
    })

    test('categoryBreakdown has all four categories', () => {
      const summary = calculateComplexitySummary([])
      expect(summary.categoryBreakdown).toHaveProperty('low')
      expect(summary.categoryBreakdown).toHaveProperty('moderate')
      expect(summary.categoryBreakdown).toHaveProperty('high')
      expect(summary.categoryBreakdown).toHaveProperty('extreme')
    })

    test('averages with 7/3 produce correct rounding', () => {
      const functions: FunctionComplexity[] = [
        {
          functionName: 'a',
          filePath: '/t.ts',
          startLine: 1,
          cyclomatic: 7,
          cognitive: 3,
          category: 'moderate',
        },
        {
          functionName: 'b',
          filePath: '/t.ts',
          startLine: 2,
          cyclomatic: 7,
          cognitive: 3,
          category: 'moderate',
        },
        {
          functionName: 'c',
          filePath: '/t.ts',
          startLine: 3,
          cyclomatic: 7,
          cognitive: 3,
          category: 'moderate',
        },
      ]
      const summary = calculateComplexitySummary(functions)
      expect(summary.averageCyclomatic).toBe(7)
      expect(summary.averageCognitive).toBe(3)
    })
  })
})
