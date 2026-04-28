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
    FunctionDeclaration: 262,
    FunctionExpression: 218,
    ArrowFunction: 219,
    MethodDeclaration: 174,
    ConstructorDeclaration: 176,
    GetAccessorDeclaration: 177,
    SetAccessorDeclaration: 178,
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
  test('returns true for FunctionDeclaration (262)', () => {
    const node = createMockNode({ kind: SyntaxKind.FunctionDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for FunctionExpression (218)', () => {
    const node = createMockNode({ kind: SyntaxKind.FunctionExpression })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for ArrowFunction (219)', () => {
    const node = createMockNode({ kind: SyntaxKind.ArrowFunction })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for MethodDeclaration (174)', () => {
    const node = createMockNode({ kind: SyntaxKind.MethodDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for ConstructorDeclaration (174)', () => {
    const node = createMockNode({ kind: SyntaxKind.ConstructorDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for GetAccessorDeclaration (177)', () => {
    const node = createMockNode({ kind: SyntaxKind.GetAccessorDeclaration })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns true for SetAccessorDeclaration (178)', () => {
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

describe('getNodePosition additional coverage', () => {
  test('handles position at column 0 line 1', () => {
    const node = createMockNode({ start: 0, line: 1, column: 0 })
    const pos = getNodePosition(node)
    expect(pos).toEqual({ line: 1, column: 0 })
  })

  test('handles large line numbers', () => {
    const node = createMockNode({ start: 5000, line: 200, column: 15 })
    const pos = getNodePosition(node)
    expect(pos.line).toBe(200)
    expect(pos.column).toBe(15)
  })

  test('handles position with large column offset', () => {
    const node = createMockNode({ start: 300, line: 10, column: 80 })
    const pos = getNodePosition(node)
    expect(pos.column).toBe(80)
  })

  test('returns consistent results for same node', () => {
    const node = createMockNode({ start: 42, line: 5, column: 7 })
    const pos1 = getNodePosition(node)
    const pos2 = getNodePosition(node)
    expect(pos1).toEqual(pos2)
  })

  test('uses node start position not end position', () => {
    const node = createMockNode({ start: 10, end: 100, line: 2, column: 5 })
    const pos = getNodePosition(node)
    expect(pos.line).toBe(2)
    expect(pos.column).toBe(5)
  })
})

describe('getNodeRange additional coverage', () => {
  test('returns range where start line equals end line for single-line node', () => {
    const node = createMockNode({ start: 0, end: 5, line: 1, column: 0 })
    const range = getNodeRange(node)
    expect(range.start.line).toBe(1)
    expect(range.end.line).toBeGreaterThanOrEqual(1)
  })

  test('preserves column information in range', () => {
    const node = createMockNode({ start: 20, end: 60, line: 3, column: 8 })
    const range = getNodeRange(node)
    expect(range.start.column).toBe(8)
  })

  test('end column accounts for span length', () => {
    const node = createMockNode({ start: 0, end: 50, line: 1, column: 0 })
    const range = getNodeRange(node)
    expect(range.end.column).toBeGreaterThan(range.start.column)
  })

  test('returns consistent results for same node', () => {
    const node = createMockNode({ start: 15, end: 45, line: 2, column: 3 })
    const range1 = getNodeRange(node)
    const range2 = getNodeRange(node)
    expect(range1).toEqual(range2)
  })

  test('range object has start and end with line and column', () => {
    const node = createMockNode({ start: 0, end: 10, line: 1, column: 0 })
    const range = getNodeRange(node)
    expect(range).toHaveProperty('start')
    expect(range).toHaveProperty('end')
    expect(range.start).toHaveProperty('line')
    expect(range.start).toHaveProperty('column')
    expect(range.end).toHaveProperty('line')
    expect(range.end).toHaveProperty('column')
  })

  test('handles node at very end of file', () => {
    const node = createMockNode({ start: 990, end: 1000, line: 50, column: 30 })
    const range = getNodeRange(node)
    expect(range.start.line).toBe(50)
    expect(range.start.column).toBe(30)
  })
})

describe('isFunctionLike additional coverage', () => {
  test('returns false for SourceFile kind', () => {
    const node = createMockNode({ kind: SyntaxKind.SourceFile })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for ForStatement kind', () => {
    const node = createMockNode({ kind: SyntaxKind.ForStatement })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for WhileStatement kind', () => {
    const node = createMockNode({ kind: SyntaxKind.WhileStatement })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for SwitchStatement kind', () => {
    const node = createMockNode({ kind: SyntaxKind.SwitchStatement })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for CaseClause kind', () => {
    const node = createMockNode({ kind: SyntaxKind.CaseClause })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for CatchClause kind', () => {
    const node = createMockNode({ kind: SyntaxKind.CatchClause })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for ConditionalExpression kind', () => {
    const node = createMockNode({ kind: SyntaxKind.ConditionalExpression })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for BinaryExpression kind', () => {
    const node = createMockNode({ kind: SyntaxKind.BinaryExpression })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for NumericLiteral kind', () => {
    const node = createMockNode({ kind: 8 })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for unknown kind 999', () => {
    const node = createMockNode({ kind: 999 })
    expect(isFunctionLike(node)).toBe(false)
  })
})

describe('getFunctionName additional coverage', () => {
  describe('FunctionDeclaration edge cases', () => {
    test('returns anonymous function for empty string name', () => {
      const node = createMockFunctionDeclaration({ functionName: '' })
      expect(getFunctionName(node)).toBe('anonymous function')
    })

    test('returns function name for function with unicode name', () => {
      const node = createMockFunctionDeclaration({ functionName: '日本語関数' })
      expect(getFunctionName(node)).toBe('日本語関数')
    })

    test('returns function name for function with dollar sign', () => {
      const node = createMockFunctionDeclaration({ functionName: '$jquery' })
      expect(getFunctionName(node)).toBe('$jquery')
    })

    test('returns function name for function with underscore prefix', () => {
      const node = createMockFunctionDeclaration({ functionName: '_privateFn' })
      expect(getFunctionName(node)).toBe('_privateFn')
    })
  })

  describe('FunctionExpression edge cases', () => {
    test('returns name for function expression with long name', () => {
      const node = createMockFunctionExpression({
        functionName: 'veryLongFunctionNameThatDescribesWhatItDoes',
      })
      expect(getFunctionName(node)).toBe('veryLongFunctionNameThatDescribesWhatItDoes')
    })
  })

  describe('ArrowFunction edge cases', () => {
    test('returns arrow function when parent is undefined', () => {
      const node = createMockArrowFunction({ parentIsVariable: false })
      expect(getFunctionName(node)).toBe('arrow function')
    })
  })

  describe('MethodDeclaration edge cases', () => {
    test('returns Anonymous.methodName when class has no name', () => {
      const node = createMockMethodDeclaration({
        methodName: 'myMethod',
        parentClassName: '',
      })

      expect(getFunctionName(node)).toBe('.myMethod')
    })

    test('returns method name with special characters', () => {
      const node = createMockMethodDeclaration({
        methodName: '$init',
        parentClassName: undefined,
      })
      expect(getFunctionName(node)).toBe('$init')
    })
  })

  describe('ConstructorDeclaration edge cases', () => {
    test('returns constructor with Anonymous when class has no name', () => {
      const node = createMockConstructorDeclaration({ parentClassName: '' })
      expect(getFunctionName(node)).toBe('constructor ()')
    })
  })

  describe('GetAccessorDeclaration edge cases', () => {
    test('returns get accessor for name with underscores', () => {
      const node = createMockGetAccessorDeclaration({ accessorName: '_privateValue' })
      expect(getFunctionName(node)).toBe('get _privateValue')
    })

    test('returns get accessor for single char name', () => {
      const node = createMockGetAccessorDeclaration({ accessorName: 'x' })
      expect(getFunctionName(node)).toBe('get x')
    })
  })

  describe('SetAccessorDeclaration edge cases', () => {
    test('returns set accessor for name with numbers', () => {
      const node = createMockSetAccessorDeclaration({ accessorName: 'value2' })
      expect(getFunctionName(node)).toBe('set value2')
    })

    test('returns set accessor for single char name', () => {
      const node = createMockSetAccessorDeclaration({ accessorName: 'y' })
      expect(getFunctionName(node)).toBe('set y')
    })
  })
})

describe('traverseAST additional coverage', () => {
  describe('with constructor declarations', () => {
    test('calls visitFunction for constructor declarations', () => {
      const ctorNode = createMockConstructorDeclaration({ parentClassName: 'MyClass' })
      const sourceFile = createSourceFileWithChildren([ctorNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })
  })

  describe('with accessor declarations', () => {
    test('calls visitFunction for get accessor', () => {
      const getNode = createMockGetAccessorDeclaration({ accessorName: 'prop' })
      const sourceFile = createSourceFileWithChildren([getNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })

    test('calls visitFunction for set accessor', () => {
      const setNode = createMockSetAccessorDeclaration({ accessorName: 'prop' })
      const sourceFile = createSourceFileWithChildren([setNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })
  })

  describe('with multiple node types', () => {
    test('visits functions and loops in same traversal', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'fn' })
      const forNode = createMockForStatement()
      const sourceFile = createSourceFileWithChildren([funcNode, forNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitedFunctions: number[] = []
      const visitedLoops: number[] = []
      const visitor: ASTVisitor = {
        visitFunction: vi.fn(() => visitedFunctions.push(1)),
        visitLoop: vi.fn(() => visitedLoops.push(1)),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitedFunctions).toHaveLength(1)
      expect(visitedLoops).toHaveLength(1)
    })

    test('visits all branching node types in single file', () => {
      const ifNode = createMockIfStatement()
      const forNode = createMockForStatement()
      const whileNode = createMockWhileStatement()
      const switchNode = createMockSwitchStatement()
      const condNode = createMockConditionalExpression()
      const sourceFile = createSourceFileWithChildren([
        ifNode,
        forNode,
        whileNode,
        switchNode,
        condNode,
      ])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitIfStatement: vi.fn(),
        visitLoop: vi.fn(),
        visitSwitch: vi.fn(),
        visitConditional: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitIfStatement).toHaveBeenCalledTimes(1)
      expect(visitor.visitLoop).toHaveBeenCalledTimes(2)
      expect(visitor.visitSwitch).toHaveBeenCalledTimes(1)
      expect(visitor.visitConditional).toHaveBeenCalledTimes(1)
    })
  })

  describe('exitNode callback order', () => {
    test('calls exitNode after all children are visited', () => {
      const childNode = createMockNode({ kind: SyntaxKind.Identifier })
      const parentNode = createMockNode({ kind: SyntaxKind.IfStatement, children: [childNode] })
      const sourceFile = createSourceFileWithChildren([parentNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const callOrder: string[] = []
      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, ctx) => {
          callOrder.push(`visit-d${ctx.depth}`)
        }),
        exitNode: vi.fn((_node, ctx) => {
          callOrder.push(`exit-d${ctx.depth}`)
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(callOrder[0]).toBe('visit-d0')
      expect(callOrder[1]).toBe('visit-d1')
      expect(callOrder[2]).toBe('visit-d2')

      const exitChildIdx = callOrder.indexOf('exit-d2')
      const exitParentIdx = callOrder.indexOf('exit-d1')
      expect(exitChildIdx).toBeLessThan(exitParentIdx)
    })
  })

  describe('with wide trees', () => {
    test('visits all 20 siblings', () => {
      const children = Array.from({ length: 20 }, (_, i) =>
        createMockNode({ kind: SyntaxKind.Identifier, text: `id${i}` }),
      )
      const sourceFile = createSourceFileWithChildren(children)
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitCount = { value: 0 }
      const visitor: ASTVisitor = {
        visitNode: vi.fn(() => {
          visitCount.value++
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitCount.value).toBe(21)
    })

    test('visits all 50 siblings correctly', () => {
      const children = Array.from({ length: 50 }, (_, i) =>
        createMockNode({ kind: SyntaxKind.Identifier, text: `node${i}` }),
      )
      const sourceFile = createSourceFileWithChildren(children)
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const ids: string[] = []
      const visitor: ASTVisitor = {
        visitNode: vi.fn((node) => {
          ids.push((node as { getText: () => string }).getText())
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(ids).toHaveLength(51)
    })
  })

  describe('with empty visitor', () => {
    test('does not throw with empty visitor object', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {}
      const violations: RuleViolation[] = []

      expect(() => traverseAST(sourceFile, visitor, violations)).not.toThrow()
    })
  })

  describe('with visitor with all callbacks', () => {
    test('all specific callbacks fire for matching nodes', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'fn' })
      const ifNode = createMockIfStatement()
      const forNode = createMockForStatement()
      const switchNode = createMockSwitchStatement()
      const caseNode = createMockCaseClause()
      const catchNode = createMockCatchClause()
      const condNode = createMockConditionalExpression()
      const binNode = createMockBinaryExpression()
      const sourceFile = createSourceFileWithChildren([
        funcNode,
        ifNode,
        forNode,
        switchNode,
        caseNode,
        catchNode,
        condNode,
        binNode,
      ])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitNode: vi.fn(),
        exitNode: vi.fn(),
        visitSourceFile: vi.fn(),
        visitFunction: vi.fn(),
        visitIfStatement: vi.fn(),
        visitLoop: vi.fn(),
        visitSwitch: vi.fn(),
        visitCase: vi.fn(),
        visitCatch: vi.fn(),
        visitConditional: vi.fn(),
        visitBinaryExpression: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitSourceFile).toHaveBeenCalledTimes(1)
      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
      expect(visitor.visitIfStatement).toHaveBeenCalledTimes(1)
      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
      expect(visitor.visitSwitch).toHaveBeenCalledTimes(1)
      expect(visitor.visitCase).toHaveBeenCalledTimes(1)
      expect(visitor.visitCatch).toHaveBeenCalledTimes(1)
      expect(visitor.visitConditional).toHaveBeenCalledTimes(1)
      expect(visitor.visitBinaryExpression).toHaveBeenCalledTimes(1)

      expect(visitor.exitNode!.mock.calls.length).toBeGreaterThanOrEqual(9)
    })
  })

  describe('violations array', () => {
    test('uses default empty array when not provided', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'test',
            severity: 'error',
            message: 'msg',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
        }),
      }

      traverseAST(sourceFile, visitor)
    })

    test('shares violations array across callbacks', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'fn' })
      const ifNode = createMockIfStatement()
      const sourceFile = createSourceFileWithChildren([funcNode, ifNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const visitor: ASTVisitor = {
        visitFunction: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'func-rule',
            severity: 'warning',
            message: 'Function',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          })
        }),
        visitIfStatement: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'if-rule',
            severity: 'info',
            message: 'If',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          })
        }),
      }

      traverseAST(sourceFile, visitor, violations)

      expect(violations).toHaveLength(2)
      expect(violations[0].ruleId).toBe('func-rule')
      expect(violations[1].ruleId).toBe('if-rule')
    })
  })

  describe('context properties', () => {
    test('sourceFile is accessible in context', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let capturedSourceFile: unknown
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          capturedSourceFile = context.sourceFile
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(capturedSourceFile).toBe(sourceFile)
    })

    test('depth increments for nested children', () => {
      const grandChild = createMockNode({ kind: SyntaxKind.Identifier })
      const child = createMockNode({ kind: SyntaxKind.IfStatement, children: [grandChild] })
      const sourceFile = createSourceFileWithChildren([child])
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
      expect(depths).toHaveLength(3)
    })

    test('parent references the node being visited', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let capturedParent: unknown
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          capturedParent = context.parent
        }),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(capturedParent).toBeDefined()
    })
  })

  describe('deep nesting', () => {
    test('handles 100 levels deep', () => {
      const depth = 100
      const nestedNode = createDeeplyNestedNodes(depth)
      const sourceFile = createSourceFileWithChildren([nestedNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let maxDepth = 0
      const visitor: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          if (context.depth > maxDepth) maxDepth = context.depth
        }),
      }
      const violations: RuleViolation[] = []

      expect(() => traverseAST(sourceFile, visitor, violations)).not.toThrow()
      expect(maxDepth).toBe(depth + 1)
    })
  })

  describe('for-in and for-of specifically', () => {
    test('for-in triggers visitLoop', () => {
      const forInNode = createMockForInStatement()
      const sourceFile = createSourceFileWithChildren([forInNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitLoop: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('for-of triggers visitLoop', () => {
      const forOfNode = createMockForOfStatement()
      const sourceFile = createSourceFileWithChildren([forOfNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitLoop: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('do-while triggers visitLoop', () => {
      const doNode = createMockDoStatement()
      const sourceFile = createSourceFileWithChildren([doNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitLoop: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitLoop).toHaveBeenCalledTimes(1)
    })
  })

  describe('switch with case and default', () => {
    test('switch with case clause visits both', () => {
      const caseNode = createMockCaseClause()
      const switchNode = createMockSwitchStatement({ children: [caseNode] })
      const sourceFile = createSourceFileWithChildren([switchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitSwitch: vi.fn(),
        visitCase: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitSwitch).toHaveBeenCalledTimes(1)
      expect(visitor.visitCase).toHaveBeenCalledTimes(1)
    })

    test('switch with default clause visits both', () => {
      const defaultNode = createMockDefaultClause()
      const switchNode = createMockSwitchStatement({ children: [defaultNode] })
      const sourceFile = createSourceFileWithChildren([switchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = {
        visitSwitch: vi.fn(),
        visitCase: vi.fn(),
      }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitSwitch).toHaveBeenCalledTimes(1)
      expect(visitor.visitCase).toHaveBeenCalledTimes(1)
    })
  })

  describe('nested functions', () => {
    test('visits nested arrow function inside function', () => {
      const arrow = createMockArrowFunction({ parentIsVariable: false })
      const func = createMockFunctionDeclaration({ functionName: 'outer', children: [arrow] })
      const sourceFile = createSourceFileWithChildren([func])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(2)
    })

    test('visits method inside class', () => {
      const method = createMockMethodDeclaration({ methodName: 'run', parentClassName: 'Svc' })
      const sourceFile = createSourceFileWithChildren([method])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })
  })

  describe('with function expression', () => {
    test('calls visitFunction for function expression', () => {
      const exprNode = createMockFunctionExpression({ functionName: 'exprFn' })
      const sourceFile = createSourceFileWithChildren([exprNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
    })
  })

  describe('with binary expression', () => {
    test('calls visitBinaryExpression callback', () => {
      const binNode = createMockBinaryExpression()
      const sourceFile = createSourceFileWithChildren([binNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitBinaryExpression: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitBinaryExpression).toHaveBeenCalledTimes(1)
    })

    test('visits binary expression nested in if statement', () => {
      const binNode = createMockBinaryExpression()
      const ifNode = createMockIfStatement({ children: [binNode] })
      const sourceFile = createSourceFileWithChildren([ifNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitBinaryExpression: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitBinaryExpression).toHaveBeenCalledTimes(1)
    })
  })

  describe('with conditional expression', () => {
    test('calls visitConditional callback', () => {
      const condNode = createMockConditionalExpression()
      const sourceFile = createSourceFileWithChildren([condNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitConditional: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitConditional).toHaveBeenCalledTimes(1)
    })
  })

  describe('with catch clause', () => {
    test('calls visitCatch callback', () => {
      const catchNode = createMockCatchClause()
      const sourceFile = createSourceFileWithChildren([catchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitor: ASTVisitor = { visitCatch: vi.fn() }
      const violations: RuleViolation[] = []

      traverseAST(sourceFile, visitor, violations)

      expect(visitor.visitCatch).toHaveBeenCalledTimes(1)
    })
  })

  describe('multiple violations from single node', () => {
    test('can add multiple violations per node', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const visitor: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'r1',
            severity: 'error',
            message: 'First',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
          context.addViolation({
            ruleId: 'r2',
            severity: 'warning',
            message: 'Second',
            filePath: context.getFilePath(),
            range: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
          })
          context.addViolation({
            ruleId: 'r3',
            severity: 'info',
            message: 'Third',
            filePath: context.getFilePath(),
            range: { start: { line: 3, column: 0 }, end: { line: 3, column: 1 } },
          })
        }),
      }

      traverseAST(sourceFile, visitor, violations)

      expect(violations).toHaveLength(3)
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

  describe('specific visitor callbacks with multiple visitors', () => {
    test('calls visitFunction on all visitors', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'fn' })
      const sourceFile = createSourceFileWithChildren([funcNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitFunction: vi.fn() }
      const v2: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitFunction).toHaveBeenCalledTimes(1)
      expect(v2.visitFunction).toHaveBeenCalledTimes(1)
    })

    test('calls visitIfStatement on all visitors', () => {
      const ifNode = createMockIfStatement()
      const sourceFile = createSourceFileWithChildren([ifNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitIfStatement: vi.fn() }
      const v2: ASTVisitor = { visitIfStatement: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitIfStatement).toHaveBeenCalledTimes(1)
      expect(v2.visitIfStatement).toHaveBeenCalledTimes(1)
    })

    test('calls visitLoop on all visitors', () => {
      const forNode = createMockForStatement()
      const sourceFile = createSourceFileWithChildren([forNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitLoop: vi.fn() }
      const v2: ASTVisitor = { visitLoop: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitLoop).toHaveBeenCalledTimes(1)
      expect(v2.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('calls visitSwitch on all visitors', () => {
      const switchNode = createMockSwitchStatement()
      const sourceFile = createSourceFileWithChildren([switchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitSwitch: vi.fn() }
      const v2: ASTVisitor = { visitSwitch: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitSwitch).toHaveBeenCalledTimes(1)
      expect(v2.visitSwitch).toHaveBeenCalledTimes(1)
    })

    test('calls visitCase on all visitors', () => {
      const caseNode = createMockCaseClause()
      const sourceFile = createSourceFileWithChildren([caseNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitCase: vi.fn() }
      const v2: ASTVisitor = { visitCase: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitCase).toHaveBeenCalledTimes(1)
      expect(v2.visitCase).toHaveBeenCalledTimes(1)
    })

    test('calls visitCatch on all visitors', () => {
      const catchNode = createMockCatchClause()
      const sourceFile = createSourceFileWithChildren([catchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitCatch: vi.fn() }
      const v2: ASTVisitor = { visitCatch: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitCatch).toHaveBeenCalledTimes(1)
      expect(v2.visitCatch).toHaveBeenCalledTimes(1)
    })

    test('calls visitConditional on all visitors', () => {
      const condNode = createMockConditionalExpression()
      const sourceFile = createSourceFileWithChildren([condNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitConditional: vi.fn() }
      const v2: ASTVisitor = { visitConditional: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitConditional).toHaveBeenCalledTimes(1)
      expect(v2.visitConditional).toHaveBeenCalledTimes(1)
    })

    test('calls visitBinaryExpression on all visitors', () => {
      const binNode = createMockBinaryExpression()
      const sourceFile = createSourceFileWithChildren([binNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitBinaryExpression: vi.fn() }
      const v2: ASTVisitor = { visitBinaryExpression: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitBinaryExpression).toHaveBeenCalledTimes(1)
      expect(v2.visitBinaryExpression).toHaveBeenCalledTimes(1)
    })
  })

  describe('exitNode with multiple visitors', () => {
    test('calls exitNode on all visitors in order', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const order: string[] = []
      const v1: ASTVisitor = { exitNode: vi.fn(() => order.push('v1-exit')) }
      const v2: ASTVisitor = { exitNode: vi.fn(() => order.push('v2-exit')) }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(order[0]).toBe('v1-exit')
      expect(order[1]).toBe('v2-exit')
    })
  })

  describe('wide tree with multiple visitors', () => {
    test('visits all children with all visitors', () => {
      const children = Array.from({ length: 10 }, (_, i) =>
        createMockNode({ kind: SyntaxKind.Identifier, text: `id${i}` }),
      )
      const sourceFile = createSourceFileWithChildren(children)
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const count1 = { value: 0 }
      const count2 = { value: 0 }
      const v1: ASTVisitor = { visitNode: vi.fn(() => count1.value++) }
      const v2: ASTVisitor = { visitNode: vi.fn(() => count2.value++) }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(count1.value).toBe(11)
      expect(count2.value).toBe(11)
    })
  })

  describe('violations with multiple visitors', () => {
    test('all visitors share same violations array', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const v1: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'v1-rule',
            severity: 'error',
            message: 'From v1',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
        }),
      }
      const v2: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'v2-rule',
            severity: 'warning',
            message: 'From v2',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
        }),
      }

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(violations).toHaveLength(2)
      expect(violations[0].ruleId).toBe('v1-rule')
      expect(violations[1].ruleId).toBe('v2-rule')
    })
  })

  describe('nested structures with multiple visitors', () => {
    test('visits nested functions with multiple visitors', () => {
      const arrow = createMockArrowFunction({ parentIsVariable: false })
      const func = createMockFunctionDeclaration({ functionName: 'outer', children: [arrow] })
      const sourceFile = createSourceFileWithChildren([func])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitFunction: vi.fn() }
      const v2: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitFunction).toHaveBeenCalledTimes(2)
      expect(v2.visitFunction).toHaveBeenCalledTimes(2)
    })

    test('visits switch with case children using multiple visitors', () => {
      const caseNode = createMockCaseClause()
      const switchNode = createMockSwitchStatement({ children: [caseNode] })
      const sourceFile = createSourceFileWithChildren([switchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitSwitch: vi.fn(), visitCase: vi.fn() }
      const v2: ASTVisitor = { visitSwitch: vi.fn(), visitCase: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitSwitch).toHaveBeenCalledTimes(1)
      expect(v1.visitCase).toHaveBeenCalledTimes(1)
      expect(v2.visitSwitch).toHaveBeenCalledTimes(1)
      expect(v2.visitCase).toHaveBeenCalledTimes(1)
    })

    test('handles three levels of nesting with multiple visitors', () => {
      const leaf = createMockNode({ kind: SyntaxKind.Identifier })
      const mid = createMockNode({ kind: SyntaxKind.IfStatement, children: [leaf] })
      const top = createMockNode({ kind: SyntaxKind.ForStatement, children: [mid] })
      const sourceFile = createSourceFileWithChildren([top])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const depths: number[] = []
      const v: ASTVisitor = {
        visitNode: vi.fn((_node, context) => depths.push(context.depth)),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(depths).toEqual([0, 1, 2, 3])
    })
  })

  describe('visitor with only specific callbacks', () => {
    test('visitor with only visitFunction works', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'fn' })
      const sourceFile = createSourceFileWithChildren([funcNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitFunction).toHaveBeenCalledTimes(1)
    })

    test('visitor with only visitLoop works', () => {
      const forNode = createMockForStatement()
      const sourceFile = createSourceFileWithChildren([forNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitLoop: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitLoop).toHaveBeenCalledTimes(1)
    })

    test('visitor with only visitIfStatement works', () => {
      const ifNode = createMockIfStatement()
      const sourceFile = createSourceFileWithChildren([ifNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitIfStatement: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitIfStatement).toHaveBeenCalledTimes(1)
    })

    test('visitor with only visitSwitch works', () => {
      const switchNode = createMockSwitchStatement()
      const sourceFile = createSourceFileWithChildren([switchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitSwitch: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitSwitch).toHaveBeenCalledTimes(1)
    })

    test('visitor with only visitCase works', () => {
      const caseNode = createMockCaseClause()
      const sourceFile = createSourceFileWithChildren([caseNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitCase: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitCase).toHaveBeenCalledTimes(1)
    })

    test('visitor with only visitCatch works', () => {
      const catchNode = createMockCatchClause()
      const sourceFile = createSourceFileWithChildren([catchNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitCatch: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitCatch).toHaveBeenCalledTimes(1)
    })

    test('visitor with only visitConditional works', () => {
      const condNode = createMockConditionalExpression()
      const sourceFile = createSourceFileWithChildren([condNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitConditional: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitConditional).toHaveBeenCalledTimes(1)
    })

    test('visitor with only visitBinaryExpression works', () => {
      const binNode = createMockBinaryExpression()
      const sourceFile = createSourceFileWithChildren([binNode])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitBinaryExpression: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitBinaryExpression).toHaveBeenCalledTimes(1)
    })
  })

  describe('addViolation context in multiple visitors', () => {
    test('addViolation captures ruleId correctly', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const v: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'custom-rule-id',
            severity: 'error',
            message: 'msg',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
        }),
      }

      traverseASTMultiple(sourceFile, [v], violations)

      expect(violations[0].ruleId).toBe('custom-rule-id')
    })

    test('addViolation captures message correctly', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const v: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'r',
            severity: 'warning',
            message: 'Detailed message about the issue',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          })
        }),
      }

      traverseASTMultiple(sourceFile, [v], violations)

      expect(violations[0].message).toBe('Detailed message about the issue')
    })

    test('addViolation captures suggestion correctly', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const violations: RuleViolation[] = []
      const v: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          context.addViolation({
            ruleId: 'r',
            severity: 'info',
            message: 'msg',
            filePath: context.getFilePath(),
            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
            suggestion: 'Try doing X instead',
          })
        }),
      }

      traverseASTMultiple(sourceFile, [v], violations)

      expect(violations[0].suggestion).toBe('Try doing X instead')
    })

    test('sourceFile in context matches original sourceFile', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      let captured: unknown
      const v: ASTVisitor = {
        visitSourceFile: vi.fn((_node, context) => {
          captured = context.sourceFile
        }),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(captured).toBe(sourceFile)
    })
  })

  describe('mixed node types with multiple visitors', () => {
    test('handles source file with many different node types', () => {
      const func = createMockFunctionDeclaration({ functionName: 'fn' })
      const ifNode = createMockIfStatement()
      const forNode = createMockForStatement()
      const forInNode = createMockForInStatement()
      const forOfNode = createMockForOfStatement()
      const whileNode = createMockWhileStatement()
      const doNode = createMockDoStatement()
      const switchNode = createMockSwitchStatement()
      const caseNode = createMockCaseClause()
      const defaultNode = createMockDefaultClause()
      const catchNode = createMockCatchClause()
      const condNode = createMockConditionalExpression()
      const binNode = createMockBinaryExpression()
      const sourceFile = createSourceFileWithChildren([
        func,
        ifNode,
        forNode,
        forInNode,
        forOfNode,
        whileNode,
        doNode,
        switchNode,
        caseNode,
        defaultNode,
        catchNode,
        condNode,
        binNode,
      ])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const visitCount = { value: 0 }
      const v: ASTVisitor = {
        visitNode: vi.fn(() => visitCount.value++),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(visitCount.value).toBe(14)
    })

    test('handles arrow function with variable parent in multiple visitors', () => {
      const arrow = createMockArrowFunction({ parentIsVariable: true, variableName: 'myArrow' })
      const sourceFile = createSourceFileWithChildren([arrow])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitFunction: vi.fn() }
      const v2: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitFunction).toHaveBeenCalledTimes(1)
      expect(v2.visitFunction).toHaveBeenCalledTimes(1)
    })

    test('handles constructor with class parent in multiple visitors', () => {
      const ctor = createMockConstructorDeclaration({ parentClassName: 'MyClass' })
      const sourceFile = createSourceFileWithChildren([ctor])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitFunction: vi.fn() }
      const v2: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitFunction).toHaveBeenCalledTimes(1)
      expect(v2.visitFunction).toHaveBeenCalledTimes(1)
    })

    test('handles get and set accessors in multiple visitors', () => {
      const getter = createMockGetAccessorDeclaration({ accessorName: 'val' })
      const setter = createMockSetAccessorDeclaration({ accessorName: 'val' })
      const sourceFile = createSourceFileWithChildren([getter, setter])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(v.visitFunction).toHaveBeenCalledTimes(2)
    })

    test('handles function expression in multiple visitors', () => {
      const expr = createMockFunctionExpression({ functionName: 'expr' })
      const sourceFile = createSourceFileWithChildren([expr])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitFunction: vi.fn() }
      const v2: ASTVisitor = { visitFunction: vi.fn() }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v1, v2], violations)

      expect(v1.visitFunction).toHaveBeenCalledTimes(1)
      expect(v2.visitFunction).toHaveBeenCalledTimes(1)
    })
  })

  describe('error propagation with multiple visitors', () => {
    test('second visitor error prevents third from running', () => {
      const sourceFile = createMockSourceFile()
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const v1: ASTVisitor = { visitNode: vi.fn() }
      const v2: ASTVisitor = {
        visitNode: vi.fn(() => {
          throw new Error('v2 error')
        }),
      }
      const v3: ASTVisitor = { visitNode: vi.fn() }

      expect(() => traverseASTMultiple(sourceFile, [v1, v2, v3], [])).toThrow('v2 error')
    })
  })

  describe('context depth accuracy', () => {
    test('tracks depth correctly with wide + deep tree', () => {
      const deep1 = createDeeplyNestedNodes(3)
      const deep2 = createDeeplyNestedNodes(3)
      const sourceFile = createSourceFileWithChildren([deep1, deep2])
      ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
      const maxDepth = { value: 0 }
      const v: ASTVisitor = {
        visitNode: vi.fn((_node, context) => {
          if (context.depth > maxDepth.value) maxDepth.value = context.depth
        }),
      }
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [v], violations)

      expect(maxDepth.value).toBe(4)
    })
  })
})

describe('getNodePosition and getNodeRange integration', () => {
  test('position from node used in traversal', () => {
    const node = createMockNode({ start: 0, end: 10, line: 1, column: 0 })
    const sourceFile = createSourceFileWithChildren([node])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    let capturedNode: unknown = null
    const visitor: ASTVisitor = {
      visitNode: vi.fn((n) => {
        if ((n as { getKind: () => number }).getKind() !== SyntaxKind.SourceFile) {
          capturedNode = n
        }
      }),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    const pos = getNodePosition(capturedNode)
    expect(pos.line).toBe(1)
    expect(pos.column).toBe(0)
  })

  test('range from node captures start and end', () => {
    const node = createMockNode({ start: 0, end: 100, line: 1, column: 0 })
    const range = getNodeRange(node)
    expect(range.start.line).toBe(1)
    expect(range.end.line).toBeGreaterThanOrEqual(1)
    expect(range.end.column).toBeGreaterThan(0)
  })
})

describe('traverseAST with getFunctionName integration', () => {
  test('captures function name during traversal', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'traversedFn' })
    const sourceFile = createSourceFileWithChildren([funcNode])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const names: string[] = []
    const visitor: ASTVisitor = {
      visitFunction: vi.fn((node) => {
        names.push(getFunctionName(node))
      }),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(names).toEqual(['traversedFn'])
  })

  test('captures multiple function names in order', () => {
    const fn1 = createMockFunctionDeclaration({ functionName: 'first' })
    const fn2 = createMockFunctionDeclaration({ functionName: 'second' })
    const fn3 = createMockFunctionDeclaration({ functionName: 'third' })
    const sourceFile = createSourceFileWithChildren([fn1, fn2, fn3])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const names: string[] = []
    const visitor: ASTVisitor = {
      visitFunction: vi.fn((node) => {
        names.push(getFunctionName(node))
      }),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(names).toEqual(['first', 'second', 'third'])
  })

  test('captures method name with class prefix', () => {
    const method = createMockMethodDeclaration({
      methodName: 'calculate',
      parentClassName: 'Calculator',
    })
    const sourceFile = createSourceFileWithChildren([method])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const names: string[] = []
    const visitor: ASTVisitor = {
      visitFunction: vi.fn((node) => {
        names.push(getFunctionName(node))
      }),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(names).toEqual(['Calculator.calculate'])
  })
})

describe('traverseAST with violations across all node types', () => {
  test('can add violation for each node type', () => {
    const func = createMockFunctionDeclaration({ functionName: 'fn' })
    const ifNode = createMockIfStatement()
    const forNode = createMockForStatement()
    const switchNode = createMockSwitchStatement()
    const catchNode = createMockCatchClause()
    const condNode = createMockConditionalExpression()
    const binNode = createMockBinaryExpression()
    const sourceFile = createSourceFileWithChildren([
      func,
      ifNode,
      forNode,
      switchNode,
      catchNode,
      condNode,
      binNode,
    ])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations: RuleViolation[] = []
    const visitor: ASTVisitor = {
      visitFunction: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'fn',
          severity: 'error',
          message: 'fn',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
      visitIfStatement: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'if',
          severity: 'warning',
          message: 'if',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
      visitLoop: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'loop',
          severity: 'info',
          message: 'loop',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
      visitSwitch: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'switch',
          severity: 'error',
          message: 'switch',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
      visitCatch: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'catch',
          severity: 'warning',
          message: 'catch',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
      visitConditional: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'cond',
          severity: 'info',
          message: 'cond',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
      visitBinaryExpression: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'bin',
          severity: 'error',
          message: 'bin',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
    }

    traverseAST(sourceFile, visitor, violations)

    expect(violations).toHaveLength(7)
    const ruleIds = violations.map((v) => v.ruleId)
    expect(ruleIds).toContain('fn')
    expect(ruleIds).toContain('if')
    expect(ruleIds).toContain('loop')
    expect(ruleIds).toContain('switch')
    expect(ruleIds).toContain('catch')
    expect(ruleIds).toContain('cond')
    expect(ruleIds).toContain('bin')
  })
})

describe('traverseAST visitNode receives all nodes', () => {
  test('visitNode receives source file node', () => {
    const sourceFile = createMockSourceFile()
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const kinds: number[] = []
    const visitor: ASTVisitor = {
      visitNode: vi.fn((node) => {
        kinds.push((node as { getKind: () => number }).getKind())
      }),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(kinds).toContain(SyntaxKind.SourceFile)
  })

  test('visitNode receives all child node kinds', () => {
    const func = createMockFunctionDeclaration({ functionName: 'fn' })
    const ifNode = createMockIfStatement()
    const binNode = createMockBinaryExpression()
    const sourceFile = createSourceFileWithChildren([func, ifNode, binNode])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const kinds: number[] = []
    const visitor: ASTVisitor = {
      visitNode: vi.fn((node) => {
        kinds.push((node as { getKind: () => number }).getKind())
      }),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(kinds).toContain(SyntaxKind.SourceFile)
    expect(kinds).toContain(SyntaxKind.FunctionDeclaration)
    expect(kinds).toContain(SyntaxKind.IfStatement)
    expect(kinds).toContain(SyntaxKind.BinaryExpression)
  })

  test('visitNode count matches total node count', () => {
    const children = Array.from({ length: 5 }, () =>
      createMockNode({ kind: SyntaxKind.Identifier }),
    )
    const sourceFile = createSourceFileWithChildren(children)
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    let count = 0
    const visitor: ASTVisitor = {
      visitNode: vi.fn(() => {
        count++
      }),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(count).toBe(6)
  })
})

describe('traverseASTMultiple with violations from different node types', () => {
  test('each visitor can target different node types', () => {
    const func = createMockFunctionDeclaration({ functionName: 'fn' })
    const ifNode = createMockIfStatement()
    const sourceFile = createSourceFileWithChildren([func, ifNode])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations: RuleViolation[] = []
    const funcVisitor: ASTVisitor = {
      visitFunction: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'func-check',
          severity: 'error',
          message: 'm',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
    }
    const ifVisitor: ASTVisitor = {
      visitIfStatement: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'if-check',
          severity: 'warning',
          message: 'm',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
    }

    traverseASTMultiple(sourceFile, [funcVisitor, ifVisitor], violations)

    expect(violations).toHaveLength(2)
    expect(violations[0].ruleId).toBe('func-check')
    expect(violations[1].ruleId).toBe('if-check')
  })
})

describe('traverseAST with all loop types accumulating violations', () => {
  test('each loop type triggers visitLoop and can add violation', () => {
    const forNode = createMockForStatement()
    const forInNode = createMockForInStatement()
    const forOfNode = createMockForOfStatement()
    const whileNode = createMockWhileStatement()
    const doNode = createMockDoStatement()
    const sourceFile = createSourceFileWithChildren([
      forNode,
      forInNode,
      forOfNode,
      whileNode,
      doNode,
    ])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations: RuleViolation[] = []
    const visitor: ASTVisitor = {
      visitLoop: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'loop',
          severity: 'info',
          message: 'loop found',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
    }

    traverseAST(sourceFile, visitor, violations)

    expect(visitor.visitLoop).toHaveBeenCalledTimes(5)
    expect(violations).toHaveLength(5)
  })
})

describe('traverseAST exitNode captures correct depths', () => {
  test('exitNode depth matches visitNode depth for same node', () => {
    const sourceFile = createMockSourceFile()
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const visitDepths: number[] = []
    const exitDepths: number[] = []
    const visitor: ASTVisitor = {
      visitNode: vi.fn((_node, ctx) => visitDepths.push(ctx.depth)),
      exitNode: vi.fn((_node, ctx) => exitDepths.push(ctx.depth)),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(visitDepths).toEqual(exitDepths)
  })

  test('exitNode called once per node', () => {
    const child = createMockNode({ kind: SyntaxKind.Identifier })
    const parent = createMockNode({ kind: SyntaxKind.IfStatement, children: [child] })
    const sourceFile = createSourceFileWithChildren([parent])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    let exitCount = 0
    const visitor: ASTVisitor = {
      exitNode: vi.fn(() => exitCount++),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(exitCount).toBe(3)
  })
})

describe('traverseAST with default violations parameter', () => {
  test('works without passing violations array', () => {
    const sourceFile = createMockSourceFile()
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const visitor: ASTVisitor = { visitNode: vi.fn() }

    expect(() => traverseAST(sourceFile, visitor)).not.toThrow()
  })
})

describe('traverseASTMultiple single visitor delegation', () => {
  test('single visitor with visitFunction is delegated correctly', () => {
    const func = createMockFunctionDeclaration({ functionName: 'delegated' })
    const sourceFile = createSourceFileWithChildren([func])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const visitor: ASTVisitor = { visitFunction: vi.fn() }
    const violations: RuleViolation[] = []

    traverseASTMultiple(sourceFile, [visitor], violations)

    expect(visitor.visitFunction).toHaveBeenCalledTimes(1)
  })

  test('single visitor violations are collected', () => {
    const sourceFile = createMockSourceFile()
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations: RuleViolation[] = []
    const visitor: ASTVisitor = {
      visitSourceFile: vi.fn((_node, context) => {
        context.addViolation({
          ruleId: 'delegated-rule',
          severity: 'error',
          message: 'test',
          filePath: context.getFilePath(),
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
        })
      }),
    }

    traverseASTMultiple(sourceFile, [visitor], violations)

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('delegated-rule')
  })
})

describe('getNodeRange edge cases', () => {
  test('range with start at position zero', () => {
    const node = createMockNode({ start: 0, end: 5, line: 1, column: 0 })
    const range = getNodeRange(node)
    expect(range.start).toEqual({ line: 1, column: 0 })
  })

  test('range end position is after start position', () => {
    const node = createMockNode({ start: 10, end: 50, line: 2, column: 3 })
    const range = getNodeRange(node)
    expect(range.end.column).toBeGreaterThan(range.start.column)
  })
})

describe('traverseAST with method inside class body', () => {
  test('method inside class-like parent gets correct depth', () => {
    const method = createMockMethodDeclaration({ methodName: 'doWork', parentClassName: 'Worker' })
    const sourceFile = createSourceFileWithChildren([method])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const depths: number[] = []
    const visitor: ASTVisitor = {
      visitNode: vi.fn((_node, context) => depths.push(context.depth)),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(depths).toContain(0)
    expect(depths).toContain(1)
  })
})

describe('traverseASTMultiple with for-in and for-of', () => {
  test('calls visitLoop for for-in with multiple visitors', () => {
    const forInNode = createMockForInStatement()
    const sourceFile = createSourceFileWithChildren([forInNode])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const v1: ASTVisitor = { visitLoop: vi.fn() }
    const v2: ASTVisitor = { visitLoop: vi.fn() }
    const violations: RuleViolation[] = []

    traverseASTMultiple(sourceFile, [v1, v2], violations)

    expect(v1.visitLoop).toHaveBeenCalledTimes(1)
    expect(v2.visitLoop).toHaveBeenCalledTimes(1)
  })

  test('calls visitLoop for for-of with multiple visitors', () => {
    const forOfNode = createMockForOfStatement()
    const sourceFile = createSourceFileWithChildren([forOfNode])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const v1: ASTVisitor = { visitLoop: vi.fn() }
    const v2: ASTVisitor = { visitLoop: vi.fn() }
    const violations: RuleViolation[] = []

    traverseASTMultiple(sourceFile, [v1, v2], violations)

    expect(v1.visitLoop).toHaveBeenCalledTimes(1)
    expect(v2.visitLoop).toHaveBeenCalledTimes(1)
  })
})

describe('isFunctionLike boundary values', () => {
  test('returns false for kind just below FunctionDeclaration range', () => {
    const node = createMockNode({ kind: 256 })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns false for kind just above SetAccessorDeclaration range', () => {
    const node = createMockNode({ kind: 179 })
    expect(isFunctionLike(node)).toBe(false)
  })

  test('returns true for ArrowFunction kind 219', () => {
    const node = createMockNode({ kind: 219 })
    expect(isFunctionLike(node)).toBe(true)
  })

  test('returns false for kind 0', () => {
    const node = createMockNode({ kind: 0 })
    expect(isFunctionLike(node)).toBe(false)
  })
})

describe('traverseAST with deeply nested functions', () => {
  test('function nested inside another function increments depth correctly', () => {
    const innerFunc = createMockFunctionDeclaration({ functionName: 'inner' })
    const outerFunc = createMockFunctionDeclaration({
      functionName: 'outer',
      children: [innerFunc],
    })
    const sourceFile = createSourceFileWithChildren([outerFunc])
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const funcDepths: number[] = []
    const visitor: ASTVisitor = {
      visitFunction: vi.fn((_node, context) => funcDepths.push(context.depth)),
    }
    const violations: RuleViolation[] = []

    traverseAST(sourceFile, visitor, violations)

    expect(funcDepths).toEqual([1, 2])
  })
})
