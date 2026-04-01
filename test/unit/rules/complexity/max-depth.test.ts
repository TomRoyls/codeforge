import { describe, test, expect, vi } from 'vitest'
import { maxDepthRule, analyzeDepth } from '../../../../src/rules/complexity/max-depth'
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor'
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockArrowFunction,
  createMockMethodDeclaration,
  createMockIfStatement,
  createMockForStatement,
  createMockForInStatement,
  createMockForOfStatement,
  createMockWhileStatement,
  createMockDoStatement,
  createMockSwitchStatement,
  createMockCatchClause,
  createMockNode,
  createSourceFileWithChildren,
  SyntaxKind,
} from '../../../helpers/ast-helpers'
import type { SourceFile, Node } from 'ts-morph'

function createMockVisitorContext(sourceFile: SourceFile): VisitorContext {
  return {
    sourceFile,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => sourceFile.getFilePath(),
  }
}

vi.mock('ts-morph', () => {
  const actual = vi.importActual('ts-morph')
  const kinds = {
    SourceFile: 305,
    FunctionDeclaration: 257,
    FunctionExpression: 216,
    ArrowFunction: 211,
    MethodDeclaration: 173,
    ConstructorDeclaration: 174,
    GetAccessorDeclaration: 175,
    SetAccessorDeclaration: 176,
    ClassDeclaration: 263,
    IfStatement: 244,
    ForStatement: 245,
    ForInStatement: 246,
    ForOfStatement: 282,
    WhileStatement: 247,
    DoStatement: 248,
    SwitchStatement: 251,
    CaseClause: 297,
    DefaultClause: 298,
    CatchClause: 253,
    ConditionalExpression: 226,
    BinaryExpression: 225,
    VariableDeclaration: 260,
    Identifier: 79,
    Block: 236,
    TryStatement: 254,
  }

  const isNodeOfKind = (node: { getKind: () => number }, kind: number) => node?.getKind() === kind

  return {
    ...actual,
    Node: {
      isSourceFile: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.SourceFile),
      isFunctionDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.FunctionDeclaration),
      isFunctionExpression: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.FunctionExpression),
      isArrowFunction: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ArrowFunction),
      isMethodDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.MethodDeclaration),
      isConstructorDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ConstructorDeclaration),
      isGetAccessorDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.GetAccessorDeclaration),
      isSetAccessorDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.SetAccessorDeclaration),
      isClassDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ClassDeclaration),
      isIfStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.IfStatement),
      isForStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ForStatement),
      isForInStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ForInStatement),
      isForOfStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ForOfStatement),
      isWhileStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.WhileStatement),
      isDoStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.DoStatement),
      isSwitchStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.SwitchStatement),
      isCaseClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.CaseClause),
      isDefaultClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.DefaultClause),
      isCatchClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.CatchClause),
      isConditionalExpression: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ConditionalExpression),
      isBinaryExpression: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.BinaryExpression),
      isVariableDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.VariableDeclaration),
      isIdentifier: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.Identifier),
      isBlock: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.Block),
      isTryStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.TryStatement),
    },
  }
})

describe('maxDepthRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxDepthRule.meta.name).toBe('max-depth')
    })

    test('has correct category', () => {
      expect(maxDepthRule.meta.category).toBe('complexity')
    })

    test('is recommended', () => {
      expect(maxDepthRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(maxDepthRule.meta.description).toContain('nesting depth')
    })
  })

  describe('defaultOptions', () => {
    test('has default max of 4', () => {
      expect(maxDepthRule.defaultOptions.max).toBe(4)
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = maxDepthRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = maxDepthRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for shallow function', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'shallowFunc' })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxDepthRule.create({ max: 4 })
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('nesting depth calculation', () => {
  test('function with if statement increases depth', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with for loop increases depth', () => {
    const forNode = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with while loop increases depth', () => {
    const whileNode = createMockWhileStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithWhile',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with switch statement increases depth', () => {
    const switchNode = createMockSwitchStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithSwitch',
      children: [switchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with catch clause increases depth', () => {
    const catchNode = createMockCatchClause()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithCatch',
      children: [catchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with block increases depth', () => {
    const blockNode = createMockNode({ kind: 236 })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithBlock',
      children: [blockNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested structures accumulate depth', () => {
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedFunc',
      children: [outerIf],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('deeply nested structures reach high depth', () => {
    let currentNode: Node = createMockIfStatement()
    for (let i = 0; i < 4; i++) {
      currentNode = createMockIfStatement({ children: [currentNode] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'deeplyNested',
      children: [currentNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 5')
  })
})

describe('threshold boundaries', () => {
  test('no violation when depth equals max', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcAtLimit',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('violation when depth exceeds max by 1', () => {
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcOverLimit',
      children: [outerIf],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('handles very large depth values', () => {
    let currentNode: Node = createMockIfStatement()
    for (let i = 0; i < 9; i++) {
      currentNode = createMockIfStatement({ children: [currentNode] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'veryDeepFunc',
      children: [currentNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 10')
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-depth')
  })

  test('violation includes warning severity', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes function name in message', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'myFunction',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain("Function 'myFunction'")
  })

  test('violation includes suggestion', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('separate functions')
  })

  test('violation includes range', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })
})

describe('analyzeDepth', () => {
  test('returns empty array for file with no violations', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('returns violations for deeply nested functions', () => {
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedFunc',
      children: [outerIf],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('max-depth')
  })

  test('uses default max of 4 when not specified', () => {
    let currentNode: Node = createMockIfStatement()
    for (let i = 0; i < 4; i++) {
      currentNode = createMockIfStatement({ children: [currentNode] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'deepFunc',
      children: [currentNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile)
    expect(violations).toHaveLength(1)
  })

  test('handles multiple functions with varying depths', () => {
    const shallowFunc = createMockFunctionDeclaration({ functionName: 'shallowFunc' })
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const deepFunc = createMockFunctionDeclaration({
      functionName: 'deepFunc',
      children: [outerIf],
    })
    const sourceFile = createSourceFileWithChildren([
      shallowFunc,
      deepFunc,
    ]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('deepFunc')
  })
})

describe('custom options', () => {
  test('uses custom max value from options', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('uses default max when not provided', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('edge cases', () => {
  test('handles empty function body', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'emptyFunc',
      children: [],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles arrow function', () => {
    const arrowNode = createMockArrowFunction({ parentIsVariable: true, variableName: 'arrowFn' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles method declaration', () => {
    const methodNode = createMockMethodDeclaration({ methodName: 'doSomething' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles mixed nesting constructs', () => {
    const innerBlock = createMockNode({ kind: 236 })
    const forNode = createMockForStatement({ children: [innerBlock] })
    const ifNode = createMockIfStatement({ children: [forNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mixedNesting',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })
})
  describe('conditional expression with different operator precedence', () => {
    it('should handle conditional expression with logical operators', () => {
      const sourceFile = createSourceFile(\`
        function testLogicalOperators() {
          const a = 1;
          const b = 2;
          if (a && b && c === 0) {
            return a + b;
          }
          return c + d;
        }
      `)
      const sourceFile = createSourceFile(\`
        function testLogicalOperators() {
          const a = 1;
          const b = 2;
          if (a && b && c === 10) {
            return a * b;
          }
          return a + c;
        }
      `)
      const sourceFile = createSourceFile(\`
        function testNestedLogical() {
          const a = 1;
          const b = 2;
          if (a && b && c === 20) {
            return a * b;
          }
        }
      `)
    })

    it('should handle deeply nested ternary operations', () => {
      const sourceFile = createSourceFile(\`
        function testNestedTernary() {
          const a = 1;
          const b = 2;
          const c = 3;
          if (a && b && c && d === 40) {
            return a + b + c + d;
          }
        }
      `)
    })

    it('should handle nested if statements with logical operators', () => {
      const sourceFile = createSourceFile(\`
        function testNestedIf() {
          const a = 1;
          const b = 2;
          if (a && b && c === 30) {
            return a * b * c;
          }
        }
      `)
    })

    it('should handle nested if statements with return', () => {
      const sourceFile = createSourceFile(\`
        function testNestedReturn() {
          const a = 1;
          const b = 2;
          if (a && b && c === 20) {
            return a + b;
          }
          return a + b;
        }
      `)
    })

    it('should handle nested if with multiple conditions', () => {
      const sourceFile = createSourceFile(\`
        function testNestedMultipleConditions() {
          const a = 1;
          const b = 2;
          const c = 3;
          if (a && b && c && d === 40) {
            return a * b * c * d;
          }
        }
      `)
    })

    it('should handle nested ternary with complex expression', () => {
      const sourceFile = createSourceFile(\`
        function testNestedTernary() {
          const a = 1;
          const b = 2;
          const c = a > 30 ? d : a > 10;
          const d = a > 40? d : b > 10 : a > 20;
          const e = a > 50? e : d > 20;
          const f = a > 60? f : f > 20;
          return a + b + c + d + e + f;
        }
      })
    })
  })
})

describe('rule definition', () => {
    it('should have correct meta properties', () => {
      expect(maxDepthRule.meta.name).toBe('max-depth')
      expect(maxDepthRule.meta.category).toBe('complexity')
      expect(maxDepthRule.meta.recommended).toBe(true)
      expect(maxDepthRule.meta.fixable).toBe('code')
    })

    it('should have default options', () => {
      expect(maxDepthRule.defaultOptions).toBeDefined()
      expect(maxDepthRule.defaultOptions.max).toBe(4)
    })

    it('should create visitor with visitFunction method', () => {
      const result = maxDepthRule.create({ max: 4 })
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitFunction).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

  })
})
