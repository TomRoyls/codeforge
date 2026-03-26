import { describe, test, expect, vi } from 'vitest'
import {
  getNodePosition,
  getNodeRange,
  isFunctionLike,
  getFunctionName,
  traverseAST,
  traverseASTMultiple,
  type RuleViolation,
  type ASTVisitor,
} from '../../../src/ast/visitor'
import {
  createMockSourceFile,
  createMockNode,
  createMockFunctionDeclaration,
  createMockFunctionExpression,
  createMockArrowFunction,
  createMockMethodDeclaration,
  createMockConstructorDeclaration,
  createMockGetAccessorDeclaration,
  createMockSetAccessorDeclaration,
  createMockIfStatement,
  createMockForStatement,
  createMockForInStatement,
  createMockForOfStatement,
  createMockWhileStatement,
  createMockDoStatement,
  createMockSwitchStatement,
  createMockCaseClause,
  createMockDefaultClause,
  createMockCatchClause,
  createMockConditionalExpression,
  createMockBinaryExpression,
  createDeeplyNestedNodes,
  createSourceFileWithChildren,
  SyntaxKind,
} from '../../helpers/ast-helpers'

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
    },
  }
})

describe('getNodePosition', () => {
  test('returns correct position for node at start of file', () => {
    const node = createMockNode({ start: 0, line: 1, column: 0 })
    const position = getNodePosition(node)
    expect(position).toEqual({ line: 1, column: 0 })
  })

  test('returns correct position for node at middle of file', () => {
    const node = createMockNode({ start: 50, line: 5, column: 10 })
    const position = getNodePosition(node)
    expect(position).toEqual({ line: 5, column: 10 })
  })

  test('returns correct position for node at end of file', () => {
    const node = createMockNode({ start: 100, line: 10, column: 25 })
    const position = getNodePosition(node)
    expect(position).toEqual({ line: 10, column: 25 })
  })

  test('uses source file from node to get line and column', () => {
    const node = createMockNode({ start: 20, line: 3, column: 5 })
    const position = getNodePosition(node)
    expect(position.line).toBe(3)
    expect(position.column).toBe(5)
  })
})

describe('getNodeRange', () => {
  test('returns correct range for small node', () => {
    const node = createMockNode({ start: 0, end: 10, line: 1, column: 0 })
    const range = getNodeRange(node)
    expect(range.start).toEqual({ line: 1, column: 0 })
    expect(range.end.line).toBe(1)
  })

  test('returns correct range for multi-line node', () => {
    const node = createMockNode({ start: 0, end: 50, line: 1, column: 0 })
    const range = getNodeRange(node)
    expect(range.start.line).toBe(1)
    expect(range.end.line).toBeGreaterThanOrEqual(1)
  })

  test('returns start and end positions from source file', () => {
    const node = createMockNode({ start: 25, end: 75, line: 2, column: 5 })
    const range = getNodeRange(node)
    expect(range.start.line).toBe(2)
    expect(range.start.column).toBe(5)
  })
})

describe('isFunctionLike', () => {
  test('returns true for FunctionDeclaration (257)', () => {
    const node = createMockNode({ kind: SyntaxKind.FunctionDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for FunctionExpression (216)', () => {
    const node = createMockNode({ kind: SyntaxKind.FunctionExpression })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for ArrowFunction (211)', () => {
    const node = createMockNode({ kind: SyntaxKind.ArrowFunction })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for MethodDeclaration (173)', () => {
    const node = createMockNode({ kind: SyntaxKind.MethodDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for ConstructorDeclaration (174)', () => {
    const node = createMockNode({ kind: SyntaxKind.ConstructorDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for GetAccessorDeclaration (175)', () => {
    const node = createMockNode({ kind: SyntaxKind.GetAccessorDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for SetAccessorDeclaration (176)', () => {
    const node = createMockNode({ kind: SyntaxKind.SetAccessorDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns false for non-function nodes', () => {
    const node = createMockNode({ kind: SyntaxKind.ClassDeclaration })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for IfStatement', () => {
    const node = createMockNode({ kind: SyntaxKind.IfStatement })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for Identifier', () => {
    const node = createMockNode({ kind: SyntaxKind.Identifier })
    expect(isFunctionLike(node)).toBe(false)
  })
})

describe('getFunctionName', () => {
  describe('FunctionDeclaration', () => {
    test('returns function name for named function', () => {
      const node = createMockFunctionDeclaration({ functionName: 'myFunction' })
      expect(getFunctionName(node)).toBe('myFunction')
    })

    test('returns anonymous function when name is undefined', () => {
      const node = createMockFunctionDeclaration({ functionName: undefined })
      vi.spyOn(node, 'getName').mockReturnValue(undefined)
      expect(getFunctionName(node)).toBe('anonymous function')
    })
  })

  describe('FunctionExpression', () => {
    test('returns function name for named function expression', () => {
      const node = createMockFunctionExpression({ functionName: 'namedExpr' })
      expect(getFunctionName(node)).toBe('namedExpr')
    })

    test('returns anonymous function when name is undefined', () => {
      const node = createMockFunctionExpression({ functionName: undefined })
      vi.spyOn(node, 'getName').mockReturnValue(undefined)
      expect(getFunctionName(node)).toBe('anonymous function')
    })
  })

  describe('ArrowFunction', () => {
    test('returns variable name when parent is VariableDeclaration', () => {
      const node = createMockArrowFunction({ parentIsVariable: true, variableName: 'arrowVar' })
      expect(getFunctionName(node)).toBe('arrowVar')
    })

    test('returns arrow function when parent is not VariableDeclaration', () => {
      const node = createMockArrowFunction({ parentIsVariable: false })
      expect(getFunctionName(node)).toBe('arrow function')
    })
  })

  describe('MethodDeclaration', () => {
    test('returns ClassName.methodName when parent is ClassDeclaration', () => {
      const node = createMockMethodDeclaration({
        methodName: 'doSomething',
        parentClassName: 'MyClass',
      })
      expect(getFunctionName(node)).toBe('MyClass.doSomething')
    })

    test('returns just method name when parent is not ClassDeclaration', () => {
      const node = createMockMethodDeclaration({
        methodName: 'doSomething',
        parentClassName: undefined,
      })
      expect(getFunctionName(node)).toBe('doSomething')
    })
  })

  describe('ConstructorDeclaration', () => {
    test('returns constructor with class name when parent is ClassDeclaration', () => {
      const node = createMockConstructorDeclaration({ parentClassName: 'MyClass' })
      expect(getFunctionName(node)).toBe('constructor (MyClass)')
    })

    test('returns just constructor when parent is not ClassDeclaration', () => {
      const node = createMockConstructorDeclaration({ parentClassName: undefined })
      expect(getFunctionName(node)).toBe('constructor')
    })
  })

  describe('GetAccessorDeclaration', () => {
    test('returns get accessor name', () => {
      const node = createMockGetAccessorDeclaration({ accessorName: 'value' })
      expect(getFunctionName(node)).toBe('get value')
    })
  })

  describe('SetAccessorDeclaration', () => {
    test('returns set accessor name', () => {
      const node = createMockSetAccessorDeclaration({ accessorName: 'value' })
      expect(getFunctionName(node)).toBe('set value')
    })
  })
})

describe('traverseAST', () => {
  describe('with empty source file', () => {
    test('calls visitSourceFile hook', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitSourceFile).toHaveBeenCalledTimes(1)
    })

    test('calls visitNode hook for source file', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitNode: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitNode).toHaveBeenCalledTimes(1)
    })

    test('calls exitNode hook after traversing', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        exitNode: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.exitNode).toHaveBeenCalledTimes(1)
    })
  })

  describe('with function declarations', () => {
    test('calls visitFunction for each function', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
      const sourceFile = createSourceFileWithChildren([funcNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitFunction: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })

    test('calls visitFunction for arrow functions', () => {
      const arrowNode = createMockArrowFunction({ parentIsVariable: true })
      const sourceFile = createSourceFileWithChildren([arrowNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitFunction: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })

    test('calls visitFunction for method declarations', () => {
      const methodNode = createMockMethodDeclaration({ methodName: 'testMethod' })
      const sourceFile = createSourceFileWithChildren([methodNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitFunction: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })
  })

  describe('with branching nodes', () => {
    test('calls visitIfStatement for if statements', () => {
      const ifNode = createMockIfStatement()
      const sourceFile = createSourceFileWithChildren([ifNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitIfStatement: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitIfStatement).toHaveBeenCalledTimes(1)
    })

    test('calls visitLoop for for statements', () => {
      const forNode = createMockForStatement()
      const sourceFile = createSourceFileWithChildren([forNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitLoop: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('calls visitLoop for while statements', () => {
      const whileNode = createMockWhileStatement()
      const sourceFile = createSourceFileWithChildren([whileNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitLoop: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('calls visitSwitch for switch statements', () => {
      const switchNode = createMockSwitchStatement()
      const sourceFile = createSourceFileWithChildren([switchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitSwitch: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitSwitch).toHaveBeenCalledTimes(1)
    })

    test('calls visitCase for case clauses', () => {
      const caseNode = createMockCaseClause()
      const sourceFile = createSourceFileWithChildren([caseNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitCase: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitCase).toHaveBeenCalledTimes(1)
    })

    test('calls visitCatch for catch clauses', () => {
      const catchNode = createMockCatchClause()
      const sourceFile = createSourceFileWithChildren([catchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitCatch: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitCatch).toHaveBeenCalledTimes(1)
    })

    test('calls visitConditional for conditional expressions', () => {
      const conditionalNode = createMockConditionalExpression()
      const sourceFile = createSourceFileWithChildren([conditionalNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitConditional: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitConditional).toHaveBeenCalledTimes(1)
    })

    test('calls visitBinaryExpression for binary expressions', () => {
      const binaryNode = createMockBinaryExpression()
      const sourceFile = createSourceFileWithChildren([binaryNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitBinaryExpression: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitBinaryExpression).toHaveBeenCalledTimes(1)
    })
  })

  describe('with nested structures', () => {
    test('traverses deeply nested nodes', () => {
      const depth = 5
      const nestedNode = createDeeplyNestedNodes(depth)
      const sourceFile = createSourceFileWithChildren([nestedNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitedNodes: number[] = []
      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          visitedNodes.push(context.depth)
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitedNodes.length).toBeGreaterThan(depth)
    })

    test('tracks depth correctly through nested structures', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const parentNode = createMockNode({ kind: SyntaxKind.IfStatement, children: [childNode] })
      const sourceFile = createSourceFileWithChildren([parentNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const depths: number[] = []
      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          depths.push(context.depth)
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(depths).toContain(0)
      expect(depths).toContain(1)
      expect(depths).toContain(2)
    })
  })

  describe('collects violations', () => {
    test('addViolation adds to violations array', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'test-rule',
            severity: 'error',
            message: 'Test violation',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          })
        }),
      }

      traverseAST(sourceFile, visitor, violations)

      expect(violations).toHaveLength(1)
      expect(violations[0].ruleId).toBe('test-rule')
      expect(violations[0].severity).toBe('error')
    })

    test('accumulates multiple violations', () => {
      const funcNode1 = createMockFunctionDeclaration({ functionName: 'func1' })
      const funcNode2 = createMockFunctionDeclaration({ functionName: 'func2' })
      const sourceFile = createSourceFileWithChildren([funcNode1, funcNode2])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const visitor: ASTVisitor = {
        visitFunction: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'func-rule',
            severity: 'warning',
            message: 'Function found',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          })
        }),
      }

      traverseAST(sourceFile, visitor, violations)

      expect(violations).toHaveLength(2)
    })

    test('supports different severity levels', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'error-rule',
            severity: 'error',
            message: 'Error',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
          context.addViolation({
            ruleId: 'warning-rule',
            severity: 'warning',
            message: 'Warning',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
          context.addViolation({
            ruleId: 'info-rule',
            severity: 'info',
            message: 'Info',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
        }),
      }

      traverseAST(sourceFile, visitor, violations)

      expect(violations.map((v) => v.severity)).toEqual(['error', 'warning', 'info'])
    })
  })

  describe('visitor context', () => {
    test('getFilePath returns correct path', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let capturedPath: string | undefined
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          capturedPath = context.getFilePath()
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(capturedPath).toBe('/test/file.ts')
    })

    test('parent is defined for root node', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let capturedParent: unknown = null
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          capturedParent = context.parent
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(capturedParent).toBeDefined()
    })

    test('depth starts at 0 for source file', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let capturedDepth: number | undefined
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          capturedDepth = context.depth
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(capturedDepth).toBe(0)
    })
  })

  describe('all loop types', () => {
    test('calls visitLoop for for-in statements', () => {
      const forInNode = createMockForInStatement()
      const sourceFile = createSourceFileWithChildren([forInNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitLoop: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('calls visitLoop for for-of statements', () => {
      const forOfNode = createMockForOfStatement()
      const sourceFile = createSourceFileWithChildren([forOfNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitLoop: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('calls visitLoop for do-while statements', () => {
      const doNode = createMockDoStatement()
      const sourceFile = createSourceFileWithChildren([doNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitLoop: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })
  })

  describe('case clause types', () => {
    test('calls visitCase for default clauses', () => {
      const defaultNode = createMockDefaultClause()
      const sourceFile = createSourceFileWithChildren([defaultNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitCase: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitCase).toHaveBeenCalledTimes(1)
    })
  })

  describe('RuleViolation structure', () => {
    test('violation includes optional suggestion', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'suggest-rule',
            severity: 'warning',
            message: 'Consider refactoring',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            suggestion: 'Use a more descriptive name',
          })
        }),
      }

      traverseAST(sourceFile, visitor, violations)

      expect(violations[0].suggestion).toBe('Use a more descriptive name')
    })

    test('violation works without suggestion', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'no-suggest-rule',
            severity: 'error',
            message: 'Critical error',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          })
        }),
      }

      traverseAST(sourceFile, visitor, violations)

      expect(violations[0].suggestion).toBeUndefined()
    })
  })
})

describe('traverseASTMultiple', () => {
  describe('edge cases', () => {
    test('handles empty visitors array without error', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []

      expect(() => traverseASTMultiple(sourceFile, [], violations)).not.toThrow()
      expect(violations).toHaveLength(0)
    })

    test('delegates to traverseAST for single visitor', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      expect(visitor.visitSourceFile).toHaveBeenCalledTimes(1)
    })

    test('handles many visitors (100+) gracefully', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitorCount = 150
      const visitors: ASTVisitor[] = Array.from({ length: visitorCount }, () => ({
        visitNode: vi.fn(),
      }))
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, visitors, violations)

      // Each visitor's visitNode should be called at least once (for source file)
      visitors.forEach((visitor) => {
        expect(visitor.visitNode).toHaveBeenCalled()
      })
    })

    test('works with visitors that only have visitNode', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitNode: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      expect(visitor.visitNode).toHaveBeenCalled()
    })

    test('works with visitors that only have exitNode', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        exitNode: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      expect(visitor.exitNode).toHaveBeenCalled()
    })

    test('calls all callbacks in correct order (visitNode -> specific -> children -> exitNode)', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callOrder: string[] = []
      const visitor: ASTVisitor = {
        visitNode: vi.fn(() => callOrder.push('visitNode')),
        visitSourceFile: vi.fn(() => callOrder.push('visitSourceFile')),
        exitNode: vi.fn(() => callOrder.push('exitNode')),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      // visitNode should be called before visitSourceFile
      const visitNodeIndex = callOrder.indexOf('visitNode')
      const visitSourceFileIndex = callOrder.indexOf('visitSourceFile')
      const exitNodeIndex = callOrder.indexOf('exitNode')

      expect(visitNodeIndex).toBeLessThan(visitSourceFileIndex)
      expect(visitSourceFileIndex).toBeLessThan(exitNodeIndex)
    })

    test('collects violations from multiple visitors', () => {
      const funcNode1 = createMockFunctionDeclaration({ functionName: 'func1' })
      const funcNode2 = createMockFunctionDeclaration({ functionName: 'func2' })
      const sourceFile = createSourceFileWithChildren([funcNode1, funcNode2])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []

      const visitor1: ASTVisitor = {
        visitFunction: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'rule-1',
            severity: 'error',
            message: 'Visitor 1 violation',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          })
        }),
      }

      const visitor2: ASTVisitor = {
        visitFunction: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'rule-2',
            severity: 'warning',
            message: 'Visitor 2 violation',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          })
        }),
      }

      traverseASTMultiple(sourceFile, [visitor1, visitor2], violations)

      // 2 functions x 2 visitors = 4 violations
      expect(violations).toHaveLength(4)
      expect(violations.filter((v) => v.ruleId === 'rule-1')).toHaveLength(2)
      expect(violations.filter((v) => v.ruleId === 'rule-2')).toHaveLength(2)
    })

    test('propagates errors from visitors', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitNode: vi.fn(() => {
          throw new Error('Test error from visitor')
        }),
      }
      const violations: RuleViolation[] = []

      expect(() => traverseASTMultiple(sourceFile, [visitor], violations)).toThrow(
        'Test error from visitor',
      )
    })

    test('handles visitors with undefined callbacks gracefully', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      // Visitor with explicitly undefined callbacks
      const visitor: ASTVisitor = {
        visitNode: undefined,
        exitNode: undefined,
        visitSourceFile: undefined,
      }
      const violations: RuleViolation[] = []

      // Should not throw
      expect(() => traverseASTMultiple(sourceFile, [visitor], violations)).not.toThrow()
    })

    test('handles mixed visitors with some having callbacks and some not', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callCount = { visitor1: 0, visitor2: 0 }

      const visitor1: ASTVisitor = {
        visitSourceFile: vi.fn(() => {
          callCount.visitor1++
        }),
      }

      const visitor2: ASTVisitor = {
        // No callbacks defined
      }

      const visitor3: ASTVisitor = {
        visitSourceFile: vi.fn(() => {
          callCount.visitor2++
        }),
      }

      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor1, visitor2, visitor3], violations)

      expect(callCount.visitor1).toBe(1)
      expect(callCount.visitor2).toBe(1)
    })

    test('handles mixed visitors with some having callbacks and some not', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callCount = { visitor1: 0, visitor2: 0 }

      const visitor1: ASTVisitor = {
        visitSourceFile: vi.fn(() => {
          callCount.visitor1++
        }),
      }

      const visitor2: ASTVisitor = {}

      const visitor3: ASTVisitor = {
        visitSourceFile: vi.fn(() => {
          callCount.visitor2++
        }),
      }

      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor1, visitor2, visitor3], violations)

      expect(callCount.visitor1).toBe(1)
      expect(callCount.visitor2).toBe(1)
    })

    test('handles completely empty visitor object {} without error', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {}
      const violations: RuleViolation[] = []

      expect(() => traverseASTMultiple(sourceFile, [visitor], violations)).not.toThrow()
      expect(violations).toHaveLength(0)
    })

    test('calls all visitors in order when multiple visitors have same method', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const sourceFile = createSourceFileWithChildren([childNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callOrder: string[] = []

      const visitor1: ASTVisitor = {
        visitNode: vi.fn(() => callOrder.push('visitor1')),
      }

      const visitor2: ASTVisitor = {
        visitNode: vi.fn(() => callOrder.push('visitor2')),
      }

      const visitor3: ASTVisitor = {
        visitNode: vi.fn(() => callOrder.push('visitor3')),
      }

      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor1, visitor2, visitor3], violations)

      expect(callOrder).toHaveLength(6)
      expect(callOrder[0]).toBe('visitor1')
      expect(callOrder[1]).toBe('visitor2')
      expect(callOrder[2]).toBe('visitor3')
    })

    test('calls exitNode after children are traversed', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const sourceFile = createSourceFileWithChildren([childNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callOrder: string[] = []

      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          if (context.depth === 0) {
            callOrder.push('visitNode-parent')
          } else {
            callOrder.push('visitNode-child')
          }
        }),
        exitNode: vi.fn((_node, context) => {
          if (context.depth === 0) {
            callOrder.push('exitNode-parent')
          } else {
            callOrder.push('exitNode-child')
          }
        }),
      }

      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      expect(callOrder).toEqual([
        'visitNode-parent',
        'visitNode-child',
        'exitNode-child',
        'exitNode-parent',
      ])
    })

    test('handles deeply nested AST structure (50+ levels) without stack overflow', () => {
      const depth = 50
      const nestedNode = createDeeplyNestedNodes(depth)
      const sourceFile = createSourceFileWithChildren([nestedNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const maxDepthSeen = { value: 0 }
      const nodeCount = { value: 0 }

      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          nodeCount.value++
          if (context.depth > maxDepthSeen.value) {
            maxDepthSeen.value = context.depth
          }
        }),
      }
      const violations: RuleViolation[] = []

      expect(() => traverseASTMultiple(sourceFile, [visitor], violations)).not.toThrow()
      expect(maxDepthSeen.value).toBe(depth + 1)
      expect(nodeCount.value).toBe(depth + 2)
    })
  })

  describe('visitor context', () => {
    test('calls multiple visitors with same method in order', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const sourceFile = createSourceFileWithChildren([childNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callOrder: string[] = []

      const visitor1: ASTVisitor = {
        visitNode: vi.fn(() => callOrder.push('visitor1')),
      }

      const visitor2: ASTVisitor = {
        visitNode: vi.fn(() => callOrder.push('visitor2')),
      }

      const visitor3: ASTVisitor = {
        visitNode: vi.fn(() => callOrder.push('visitor3')),
      }

      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor1, visitor2, visitor3], violations)

      // Each node should call all 3 visitors in order
      // Source file + child node = 2 nodes, each visited by 3 visitors = 6 calls
      expect(callOrder).toHaveLength(6)
      // Verify order is preserved for first node
      expect(callOrder[0]).toBe('visitor1')
      expect(callOrder[1]).toBe('visitor2')
      expect(callOrder[2]).toBe('visitor3')
    })

    test('calls exitNode after children are traversed', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const sourceFile = createSourceFileWithChildren([childNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callOrder: string[] = []

      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          if (context.depth === 0) {
            callOrder.push('visitNode-parent')
          } else {
            callOrder.push('visitNode-child')
          }
        }),
        exitNode: vi.fn((_node, context) => {
          if (context.depth === 0) {
            callOrder.push('exitNode-parent')
          } else {
            callOrder.push('exitNode-child')
          }
        }),
      }

      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      // Verify: visitNode(parent) -> visitNode(child) -> exitNode(child) -> exitNode(parent)
      expect(callOrder).toEqual([
        'visitNode-parent',
        'visitNode-child',
        'exitNode-child',
        'exitNode-parent',
      ])
    })

    test('handles deeply nested AST structure (50+ levels) without stack overflow', () => {
      const depth = 50
      const nestedNode = createDeeplyNestedNodes(depth)
      const sourceFile = createSourceFileWithChildren([nestedNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const maxDepthSeen = { value: 0 }
      const nodeCount = { value: 0 }

      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          nodeCount.value++
          if (context.depth > maxDepthSeen.value) {
            maxDepthSeen.value = context.depth
          }
        }),
      }
      const violations: RuleViolation[] = []

      expect(() => traverseASTMultiple(sourceFile, [visitor], violations)).not.toThrow()
      // Should traverse all levels (source file at 0 + nested nodes)
      expect(maxDepthSeen.value).toBe(depth + 1)
      expect(nodeCount.value).toBeGreaterThan(depth)
    })
  })

  describe('visitor context', () => {
    test('provides correct depth for nested nodes', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const parentNode = createMockNode({ kind: SyntaxKind.IfStatement, children: [childNode] })
      const sourceFile = createSourceFileWithChildren([parentNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const depths: number[] = []
      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          depths.push(context.depth)
        }),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      expect(depths).toContain(0) // source file
      expect(depths).toContain(1) // parent node
      expect(depths).toContain(2) // child node
    })

    test('provides correct parent reference', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const parentNode = createMockNode({ kind: SyntaxKind.IfStatement, children: [childNode] })
      const sourceFile = createSourceFileWithChildren([parentNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let capturedParent: unknown = null
      const visitor: ASTVisitor = {
        visitNode: vi.fn((node, context) => {
          if ((node as { getKind: () => number }).getKind() === SyntaxKind.Identifier) {
            capturedParent = context.parent
          }
        }),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      expect(capturedParent).toBeDefined()
    })

    test('getFilePath returns correct path', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let capturedPath: string | undefined
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          capturedPath = context.getFilePath()
        }),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      expect(capturedPath).toBe('/test/file.ts')
    })
  })
})
