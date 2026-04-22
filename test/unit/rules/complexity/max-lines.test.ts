import { describe, test, expect, vi } from 'vitest'
import {
  maxLinesRule,
  maxLinesPerFunctionRule,
  analyzeMaxLines,
  analyzeMaxLinesPerFunction,
} from '../../../../src/rules/complexity/max-lines'
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor'
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockArrowFunction,
  createMockMethodDeclaration,
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

function createMockSourceFileWithLines(
  lineCount: number,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): SourceFile {
  const lines: string[] = []
  for (let i = 0; i < lineCount; i++) {
    lines.push(`line ${i + 1}`)
  }
  const text = lines.join('\n')

  const sourceFile = createMockSourceFile({
    getFullText: vi.fn(() => text),
  })

  ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
  return sourceFile as unknown as SourceFile
}

function createMockFunctionWithLines(
  startLine: number,
  endLine: number,
  functionName: string = 'testFunc',
): FunctionLikeNode {
  const sourceFile = createMockSourceFile()
  const text = Array.from({ length: endLine }, (_, i) => `line ${i + 1}`).join('\n')

  const sourceFileWithText = {
    ...sourceFile,
    getFullText: () => text,
    getDescendants: () => [],
  }

  const funcNode = createMockFunctionDeclaration({
    functionName,
    start: 0,
    end: (endLine - startLine + 1) * 10,
  })

  const nodeWithLineNumbers = {
    ...funcNode,
    getSourceFile: () => sourceFileWithText,
    getStartLineNumber: () => startLine,
    getEndLineNumber: () => endLine,
    getDescendants: () => [],
  }

  return nodeWithLineNumbers as unknown as FunctionLikeNode
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

describe('maxLinesRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxLinesRule.meta.name).toBe('max-lines')
    })

    test('has correct category', () => {
      expect(maxLinesRule.meta.category).toBe('complexity')
    })

    test('is not recommended', () => {
      expect(maxLinesRule.meta.recommended).toBe(false)
    })

    test('has description', () => {
      expect(maxLinesRule.meta.description).toContain('lines per file')
    })
  })

  describe('defaultOptions', () => {
    test('has default max of 300', () => {
      expect(maxLinesRule.defaultOptions.max).toBe(300)
    })

    test('has skipBlankLines default to true', () => {
      expect(maxLinesRule.defaultOptions.skipBlankLines).toBe(true)
    })

    test('has skipComments default to true', () => {
      expect(maxLinesRule.defaultOptions.skipComments).toBe(true)
    })
  })

  describe('create', () => {
    test('returns visitor with visitSourceFile', () => {
      const ruleInstance = maxLinesRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitSourceFile).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = maxLinesRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })
  })
})

describe('maxLinesPerFunctionRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxLinesPerFunctionRule.meta.name).toBe('max-lines-per-function')
    })

    test('has correct category', () => {
      expect(maxLinesPerFunctionRule.meta.category).toBe('complexity')
    })

    test('is recommended', () => {
      expect(maxLinesPerFunctionRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(maxLinesPerFunctionRule.meta.description).toContain('lines per function')
    })
  })

  describe('defaultOptions', () => {
    test('has default max of 50', () => {
      expect(maxLinesPerFunctionRule.defaultOptions.max).toBe(50)
    })

    test('has skipBlankLines default to true', () => {
      expect(maxLinesPerFunctionRule.defaultOptions.skipBlankLines).toBe(true)
    })

    test('has skipComments default to true', () => {
      expect(maxLinesPerFunctionRule.defaultOptions.skipComments).toBe(true)
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = maxLinesPerFunctionRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = maxLinesPerFunctionRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })
  })
})

describe('file line counting', () => {
  test('short file has no violations', () => {
    const sourceFile = createMockSourceFileWithLines(10)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('file exceeding max has violation', () => {
    const sourceFile = createMockSourceFileWithLines(150)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('150 lines')
  })

  test('file at exact limit has no violation', () => {
    const sourceFile = createMockSourceFileWithLines(100)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('file one line over limit has violation', () => {
    const sourceFile = createMockSourceFileWithLines(101)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })
})

describe('function line counting', () => {
  test('short function has no violations', () => {
    const funcNode = createMockFunctionWithLines(1, 10)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function exceeding max has violation', () => {
    const funcNode = createMockFunctionWithLines(1, 60)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('60 lines')
  })

  test('function at exact limit has no violation', () => {
    const funcNode = createMockFunctionWithLines(1, 50)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function one line over limit has violation', () => {
    const funcNode = createMockFunctionWithLines(1, 51)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })
})

describe('violation structure', () => {
  test('max-lines violation includes correct ruleId', () => {
    const sourceFile = createMockSourceFileWithLines(150)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-lines')
  })

  test('max-lines violation includes warning severity', () => {
    const sourceFile = createMockSourceFileWithLines(150)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('max-lines violation includes suggestion', () => {
    const sourceFile = createMockSourceFileWithLines(150)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('modules')
  })

  test('max-lines-per-function violation includes function name', () => {
    const funcNode = createMockFunctionWithLines(1, 60, 'myLongFunction')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain("'myLongFunction'")
  })

  test('max-lines-per-function violation includes correct ruleId', () => {
    const funcNode = createMockFunctionWithLines(1, 60)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-lines-per-function')
  })
})

describe('analyzeMaxLines', () => {
  test('returns empty array for file within limit', () => {
    const sourceFile = createMockSourceFileWithLines(50)
    const violations = analyzeMaxLines(sourceFile, 100, {})
    expect(violations).toHaveLength(0)
  })

  test('returns violation for file exceeding limit', () => {
    const sourceFile = createMockSourceFileWithLines(150)
    const violations = analyzeMaxLines(sourceFile, 100, {})
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('max-lines')
  })

  test('uses default max of 300 when not specified', () => {
    const sourceFile = createMockSourceFileWithLines(50)
    const violations = analyzeMaxLines(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('analyzeMaxLinesPerFunction', () => {
  test('returns empty array for functions within limit', () => {
    const funcNode = createMockFunctionWithLines(1, 10)
    const sourceFile = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }

    const violations = analyzeMaxLinesPerFunction(sourceFile as unknown as SourceFile, 50, {})
    expect(violations).toHaveLength(0)
  })

  test('returns violations for functions exceeding limit', () => {
    const funcNode = createMockFunctionWithLines(1, 60)
    const sourceFile = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }

    const violations = analyzeMaxLinesPerFunction(sourceFile as unknown as SourceFile, 50, {})
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('max-lines-per-function')
  })

  test('uses default max of 50 when not specified', () => {
    const funcNode = createMockFunctionWithLines(1, 10)
    const sourceFile = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }

    const violations = analyzeMaxLinesPerFunction(sourceFile as unknown as SourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('custom options', () => {
  test('max-lines uses custom max value', () => {
    const sourceFile = createMockSourceFileWithLines(20)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 10,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('max-lines-per-function uses custom max value', () => {
    const funcNode = createMockFunctionWithLines(1, 20)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 10,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })
})

describe('edge cases', () => {
  test('handles empty file', () => {
    const sourceFile = createMockSourceFile({
      getFullText: vi.fn(() => ''),
    })
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const context = createMockVisitorContext(sourceFile as unknown as SourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 10,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile as unknown as SourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles single line file', () => {
    const sourceFile = createMockSourceFileWithLines(1)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({ max: 1, skipBlankLines: false, skipComments: false })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles single line function', () => {
    const funcNode = createMockFunctionWithLines(1, 1)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles multi-start-line function', () => {
    const funcNode = createMockFunctionWithLines(50, 100)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles very large line counts', () => {
    const sourceFile = createMockSourceFileWithLines(1000)
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    ruleInstance.visitor.visitSourceFile!(sourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('1000 lines')
  })
})

describe('skipBlankLines option', () => {
  test('skipBlankLines=true skips blank lines in file', () => {
    const text = 'line1\n\n\nline2\n\nline3'
    const sourceFile = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const context = createMockVisitorContext(sourceFile as unknown as SourceFile)
    const ruleInstance = maxLinesRule.create({ max: 3, skipBlankLines: true, skipComments: false })
    ruleInstance.visitor.visitSourceFile!(sourceFile as unknown as SourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('skipBlankLines=false counts blank lines in file', () => {
    const text = 'line1\n\n\nline2\n\nline3'
    const sourceFile = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const context = createMockVisitorContext(sourceFile as unknown as SourceFile)
    const ruleInstance = maxLinesRule.create({ max: 3, skipBlankLines: false, skipComments: false })
    ruleInstance.visitor.visitSourceFile!(sourceFile as unknown as SourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('skipBlankLines=true skips blank lines in function', () => {
    const text = 'line1\n\n\nline2\n\nline3'
    const sourceFileWithText = {
      ...createMockSourceFile(),
      getFullText: () => text,
      getDescendants: () => [],
    }

    const funcNode = {
      ...createMockFunctionDeclaration({ functionName: 'testFunc' }),
      getSourceFile: () => sourceFileWithText,
      getStartLineNumber: () => 1,
      getEndLineNumber: () => 6,
      getDescendants: () => [],
    }

    const context = createMockVisitorContext(sourceFileWithText as unknown as SourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 3,
      skipBlankLines: true,
      skipComments: false,
    })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('skipComments option', () => {
  test('skipComments=true skips comment lines in file', () => {
    const text = 'line1\n// comment\nline2'
    const mockCommentRange = {
      getPos: () => 6,
      getEnd: () => 16,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockCommentRange],
    }

    const sourceFile = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const context = createMockVisitorContext(sourceFile as unknown as SourceFile)
    const ruleInstance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: true })
    ruleInstance.visitor.visitSourceFile!(sourceFile as unknown as SourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('skipComments=false counts comment lines in file', () => {
    const text = 'line1\n// comment\nline2'
    const sourceFile = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const context = createMockVisitorContext(sourceFile as unknown as SourceFile)
    const ruleInstance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: false })
    ruleInstance.visitor.visitSourceFile!(sourceFile as unknown as SourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('skipComments=true skips comment lines in function', () => {
    const text = 'line1\n// comment\nline2'
    const mockCommentRange = {
      getPos: () => 6,
      getEnd: () => 16,
    }
    const mockChild = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockCommentRange],
    }

    const sourceFileWithText = {
      ...createMockSourceFile(),
      getFullText: () => text,
      getDescendants: () => [],
    }

    const funcNode = {
      ...createMockFunctionDeclaration({ functionName: 'testFunc' }),
      getSourceFile: () => sourceFileWithText,
      getStartLineNumber: () => 1,
      getEndLineNumber: () => 3,
      getDescendants: () => [mockChild],
    }

    const context = createMockVisitorContext(sourceFileWithText as unknown as SourceFile)
    const ruleInstance = maxLinesPerFunctionRule.create({
      max: 2,
      skipBlankLines: false,
      skipComments: true,
    })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('combined skip options', () => {
  test('skipBlankLines=true and skipComments=true together', () => {
    const text = 'line1\n\n// comment\n\nline2'
    const mockCommentRange = {
      getPos: () => 7,
      getEnd: () => 17,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockCommentRange],
    }

    const sourceFile = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const context = createMockVisitorContext(sourceFile as unknown as SourceFile)
    const ruleInstance = maxLinesRule.create({ max: 2, skipBlankLines: true, skipComments: true })
    ruleInstance.visitor.visitSourceFile!(sourceFile as unknown as SourceFile, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('maxLinesRule meta expanded', () => {
  test('meta has fixable property set to code', () => {
    expect(maxLinesRule.meta.fixable).toBe('code')
  })

  test('meta name is a string', () => {
    expect(typeof maxLinesRule.meta.name).toBe('string')
  })

  test('meta description mentions file', () => {
    expect(maxLinesRule.meta.description).toContain('file')
  })

  test('meta description mentions maximum', () => {
    expect(maxLinesRule.meta.description).toContain('maximum')
  })

  test('meta category is complexity', () => {
    expect(maxLinesRule.meta.category).toBe('complexity')
  })

  test('defaultOptions has max property', () => {
    expect(maxLinesRule.defaultOptions).toHaveProperty('max')
  })

  test('defaultOptions has skipBlankLines property', () => {
    expect(maxLinesRule.defaultOptions).toHaveProperty('skipBlankLines')
  })

  test('defaultOptions has skipComments property', () => {
    expect(maxLinesRule.defaultOptions).toHaveProperty('skipComments')
  })
})

describe('maxLinesPerFunctionRule meta expanded', () => {
  test('meta has fixable property set to code', () => {
    expect(maxLinesPerFunctionRule.meta.fixable).toBe('code')
  })

  test('meta name is a string', () => {
    expect(typeof maxLinesPerFunctionRule.meta.name).toBe('string')
  })

  test('meta description mentions function', () => {
    expect(maxLinesPerFunctionRule.meta.description).toContain('function')
  })

  test('meta description mentions maximum', () => {
    expect(maxLinesPerFunctionRule.meta.description).toContain('maximum')
  })

  test('meta category is complexity', () => {
    expect(maxLinesPerFunctionRule.meta.category).toBe('complexity')
  })

  test('defaultOptions has max property', () => {
    expect(maxLinesPerFunctionRule.defaultOptions).toHaveProperty('max')
  })

  test('defaultOptions has skipBlankLines property', () => {
    expect(maxLinesPerFunctionRule.defaultOptions).toHaveProperty('skipBlankLines')
  })

  test('defaultOptions has skipComments property', () => {
    expect(maxLinesPerFunctionRule.defaultOptions).toHaveProperty('skipComments')
  })
})

describe('maxLinesRule create expanded', () => {
  test('create returns object with visitor property', () => {
    const instance = maxLinesRule.create({})
    expect(instance).toHaveProperty('visitor')
  })

  test('create returns object with onComplete property', () => {
    const instance = maxLinesRule.create({})
    expect(instance).toHaveProperty('onComplete')
  })

  test('visitor does not have visitFunction', () => {
    const instance = maxLinesRule.create({})
    expect(instance.visitor.visitFunction).toBeUndefined()
  })

  test('onComplete returns array when called without visit', () => {
    const instance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    const violations = instance.onComplete!()
    expect(Array.isArray(violations)).toBe(true)
  })

  test('multiple source file visits accumulate violations', () => {
    const sf1 = createMockSourceFileWithLines(150)
    const ctx1 = createMockVisitorContext(sf1)
    const sf2 = createMockSourceFileWithLines(200)
    const ctx2 = createMockVisitorContext(sf2)
    const instance = maxLinesRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitSourceFile!(sf1, ctx1)
    instance.visitor.visitSourceFile!(sf2, ctx2)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(2)
  })
})

describe('maxLinesPerFunctionRule create expanded', () => {
  test('create returns object with visitor property', () => {
    const instance = maxLinesPerFunctionRule.create({})
    expect(instance).toHaveProperty('visitor')
  })

  test('create returns object with onComplete property', () => {
    const instance = maxLinesPerFunctionRule.create({})
    expect(instance).toHaveProperty('onComplete')
  })

  test('visitor does not have visitSourceFile', () => {
    const instance = maxLinesPerFunctionRule.create({})
    expect(instance.visitor.visitSourceFile).toBeUndefined()
  })

  test('onComplete returns array when called without visit', () => {
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    const violations = instance.onComplete!()
    expect(Array.isArray(violations)).toBe(true)
  })

  test('multiple function visits accumulate violations', () => {
    const fn1 = createMockFunctionWithLines(1, 60, 'func1')
    const fn2 = createMockFunctionWithLines(1, 70, 'func2')
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn1, ctx)
    instance.visitor.visitFunction!(fn2, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(2)
  })
})

describe('file under max lines - various counts', () => {
  test('1-line file with max 10 has no violation', () => {
    const sf = createMockSourceFileWithLines(1)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 10, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('5-line file with max 10 has no violation', () => {
    const sf = createMockSourceFileWithLines(5)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 10, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('50-line file with max 100 has no violation', () => {
    const sf = createMockSourceFileWithLines(50)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('99-line file with max 100 has no violation', () => {
    const sf = createMockSourceFileWithLines(99)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('250-line file with max 300 has no violation', () => {
    const sf = createMockSourceFileWithLines(250)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 300, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('299-line file with max 300 has no violation', () => {
    const sf = createMockSourceFileWithLines(299)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 300, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('2-line file with max 2 has no violation', () => {
    const sf = createMockSourceFileWithLines(2)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('10-line file with max 10 has no violation', () => {
    const sf = createMockSourceFileWithLines(10)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 10, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('file at exactly max lines', () => {
  test('100-line file at max 100 has no violation', () => {
    const sf = createMockSourceFileWithLines(100)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('1-line file at max 1 has no violation', () => {
    const sf = createMockSourceFileWithLines(1)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('300-line file at max 300 has no violation', () => {
    const sf = createMockSourceFileWithLines(300)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 300, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('50-line file at max 50 has no violation', () => {
    const sf = createMockSourceFileWithLines(50)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 50, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('500-line file at max 500 has no violation', () => {
    const sf = createMockSourceFileWithLines(500)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 500, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('file over max lines - various counts', () => {
  test('11-line file with max 10 has violation', () => {
    const sf = createMockSourceFileWithLines(11)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 10, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('11 lines')
  })

  test('200-line file with max 100 has violation', () => {
    const sf = createMockSourceFileWithLines(200)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('200 lines')
  })

  test('301-line file with max 300 has violation', () => {
    const sf = createMockSourceFileWithLines(301)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 300, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('301 lines')
  })

  test('2-line file with max 1 has violation', () => {
    const sf = createMockSourceFileWithLines(2)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('101-line file with max 100 has violation message with max', () => {
    const sf = createMockSourceFileWithLines(101)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()[0].message).toContain('100')
  })

  test('5000-line file with max 100 has violation', () => {
    const sf = createMockSourceFileWithLines(5000)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('5000 lines')
  })

  test('51-line file with max 50 has violation', () => {
    const sf = createMockSourceFileWithLines(51)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 50, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('102-line file with max 1 has violation showing 102 lines', () => {
    const sf = createMockSourceFileWithLines(102)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()[0].message).toContain('102 lines')
  })

  test('150-line file violation message mentions maximum', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed')
  })

  test('violation message includes max threshold value', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 42, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()[0].message).toContain('42')
  })
})

describe('function under max lines - various counts', () => {
  test('5-line function with max 50 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 5)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('25-line function with max 50 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 25)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('49-line function with max 50 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 49)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('1-line function with max 1 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 1)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('10-line function with max 10 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 10)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 10,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function starting at line 10 ending at line 20 with max 11 has no violation', () => {
    const fn = createMockFunctionWithLines(10, 20)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 11,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('3-line function with max 5 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 3)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 5,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('20-line function with max 20 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 20)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 20,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('function at exactly max lines', () => {
  test('50-line function at max 50 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 50)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('100-line function at max 100 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 100)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('1-line function at max 1 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 1)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function starting at line 5 ending at line 15 at max 11 has no violation', () => {
    const fn = createMockFunctionWithLines(5, 15)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 11,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('200-line function at max 200 has no violation', () => {
    const fn = createMockFunctionWithLines(1, 200)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 200,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('function over max lines - various counts', () => {
  test('51-line function with max 50 has violation', () => {
    const fn = createMockFunctionWithLines(1, 51)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('100-line function with max 50 has violation showing 100 lines', () => {
    const fn = createMockFunctionWithLines(1, 100)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].message).toContain('100 lines')
  })

  test('2-line function with max 1 has violation', () => {
    const fn = createMockFunctionWithLines(1, 2)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('11-line function with max 10 has violation', () => {
    const fn = createMockFunctionWithLines(1, 11)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 10,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('function starting at line 10 ending at 20 with max 10 has violation', () => {
    const fn = createMockFunctionWithLines(10, 20)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 10,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('violation message includes function name', () => {
    const fn = createMockFunctionWithLines(1, 60, 'namedFunc')
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].message).toContain("'namedFunc'")
  })

  test('violation message includes line count', () => {
    const fn = createMockFunctionWithLines(1, 75)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].message).toContain('75 lines')
  })

  test('violation message includes max value', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 30,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].message).toContain('30')
  })

  test('200-line function with max 10 has violation', () => {
    const fn = createMockFunctionWithLines(1, 200)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 10,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('200 lines')
  })

  test('violation message says Maximum allowed', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed')
  })
})

describe('skipBlankLines for file - expanded', () => {
  test('skipBlankLines=true does not count blank lines toward total', () => {
    const text = 'a\n\n\nb'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: true, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipBlankLines=false counts all lines including blank', () => {
    const text = 'a\n\n\nb'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 3, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('skipBlankLines=true with all blank lines except one', () => {
    const text = '\n\n\na\n\n'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: true, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipBlankLines=false with all blank lines triggers violation', () => {
    const text = '\n\n\n\n'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 3, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('skipBlankLines=true with all blank lines passes', () => {
    const text = '\n\n\n\n'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: true, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipBlankLines=false with many blank lines has correct line count', () => {
    const text = 'a\n\n\n\n\n\nb'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 5, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('7 lines')
  })
})

describe('skipBlankLines for function - expanded', () => {
  test('skipBlankLines=true skips blank lines in function', () => {
    const text = 'code\n\n\ncode2'
    const sfWithText = {
      ...createMockSourceFile(),
      getFullText: () => text,
      getDescendants: () => [],
    }
    const fn = {
      ...createMockFunctionDeclaration({ functionName: 'blankFn' }),
      getSourceFile: () => sfWithText,
      getStartLineNumber: () => 1,
      getEndLineNumber: () => 4,
      getDescendants: () => [],
    }
    const ctx = createMockVisitorContext(sfWithText as unknown as SourceFile)
    const instance = maxLinesPerFunctionRule.create({
      max: 2,
      skipBlankLines: true,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn as unknown as FunctionLikeNode, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipBlankLines=false counts blank lines in function', () => {
    const text = 'code\n\n\ncode2'
    const sfWithText = {
      ...createMockSourceFile(),
      getFullText: () => text,
      getDescendants: () => [],
    }
    const fn = {
      ...createMockFunctionDeclaration({ functionName: 'blankFn' }),
      getSourceFile: () => sfWithText,
      getStartLineNumber: () => 1,
      getEndLineNumber: () => 4,
      getDescendants: () => [],
    }
    const ctx = createMockVisitorContext(sfWithText as unknown as SourceFile)
    const instance = maxLinesPerFunctionRule.create({
      max: 2,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn as unknown as FunctionLikeNode, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('skipBlankLines=true with function containing only blank lines passes', () => {
    const text = '\n\n\n'
    const sfWithText = {
      ...createMockSourceFile(),
      getFullText: () => text,
      getDescendants: () => [],
    }
    const fn = {
      ...createMockFunctionDeclaration({ functionName: 'blankFn' }),
      getSourceFile: () => sfWithText,
      getStartLineNumber: () => 1,
      getEndLineNumber: () => 3,
      getDescendants: () => [],
    }
    const ctx = createMockVisitorContext(sfWithText as unknown as SourceFile)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: true,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn as unknown as FunctionLikeNode, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('skipComments for file - expanded', () => {
  test('skipComments=true with only comment lines passes', () => {
    const text = '// comment 1\n// comment 2'
    const mockCommentRange = {
      getPos: () => 0,
      getEnd: () => 12,
    }
    const mockCommentRange2 = {
      getPos: () => 13,
      getEnd: () => 25,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockCommentRange, mockCommentRange2],
    }
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: false, skipComments: true })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipComments=false with comment lines counts them', () => {
    const text = '// comment 1\n// comment 2\n// comment 3'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('skipComments=true with mixed code and comments', () => {
    const text = 'code1\n// comment\ncode2'
    const mockRange = {
      getPos: () => 6,
      getEnd: () => 16,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockRange],
    }
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: true })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipComments=true with trailing comment', () => {
    const text = 'code1 // inline comment\ncode2'
    const mockRange = {
      getPos: () => 6,
      getEnd: () => 23,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockRange],
    }
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: true })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('skipComments for function - expanded', () => {
  test('skipComments=true skips comment lines in function', () => {
    const text = 'code\n// comment\ncode2\n// comment2\ncode3'
    const mockRange = {
      getPos: () => 5,
      getEnd: () => 15,
    }
    const mockRange2 = {
      getPos: () => 22,
      getEnd: () => 33,
    }
    const mockChild = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockRange, mockRange2],
    }
    const sfWithText = {
      ...createMockSourceFile(),
      getFullText: () => text,
      getDescendants: () => [],
    }
    const fn = {
      ...createMockFunctionDeclaration({ functionName: 'commentFn' }),
      getSourceFile: () => sfWithText,
      getStartLineNumber: () => 1,
      getEndLineNumber: () => 5,
      getDescendants: () => [mockChild],
    }
    const ctx = createMockVisitorContext(sfWithText as unknown as SourceFile)
    const instance = maxLinesPerFunctionRule.create({
      max: 3,
      skipBlankLines: false,
      skipComments: true,
    })
    instance.visitor.visitFunction!(fn as unknown as FunctionLikeNode, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipComments=false counts comment lines in function', () => {
    const text = 'code\n// comment\ncode2\n// comment2\ncode3'
    const sfWithText = {
      ...createMockSourceFile(),
      getFullText: () => text,
      getDescendants: () => [],
    }
    const fn = {
      ...createMockFunctionDeclaration({ functionName: 'commentFn' }),
      getSourceFile: () => sfWithText,
      getStartLineNumber: () => 1,
      getEndLineNumber: () => 5,
      getDescendants: () => [],
    }
    const ctx = createMockVisitorContext(sfWithText as unknown as SourceFile)
    const instance = maxLinesPerFunctionRule.create({
      max: 4,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn as unknown as FunctionLikeNode, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('combined skip options - expanded', () => {
  test('skipBlankLines=true and skipComments=false with blank lines only', () => {
    const text = 'a\n\nb'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: true, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipBlankLines=false and skipComments=true with comments only', () => {
    const text = 'a\n// comment\nb'
    const mockRange = {
      getPos: () => 2,
      getEnd: () => 12,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockRange],
    }
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: true })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('skipBlankLines=false and skipComments=false counts everything', () => {
    const text = 'a\n\n// comment\nb'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 3, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('skipBlankLines=true and skipComments=true with mixed content passes', () => {
    const text = 'code\n\n// comment\n\ncode2'
    const mockRange = {
      getPos: () => 6,
      getEnd: () => 16,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockRange],
    }
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: true, skipComments: true })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('custom max option - file rule', () => {
  test('max=1 triggers on 2-line file', () => {
    const sf = createMockSourceFileWithLines(2)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('max=500 does not trigger on 100-line file', () => {
    const sf = createMockSourceFileWithLines(100)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 500, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=1000 does not trigger on 1000-line file', () => {
    const sf = createMockSourceFileWithLines(1000)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 1000, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=1000 triggers on 1001-line file', () => {
    const sf = createMockSourceFileWithLines(1001)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 1000, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('max=5 triggers on 6-line file', () => {
    const sf = createMockSourceFileWithLines(6)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 5, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('custom max option - function rule', () => {
  test('max=1 triggers on 2-line function', () => {
    const fn = createMockFunctionWithLines(1, 2)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('max=100 does not trigger on 50-line function', () => {
    const fn = createMockFunctionWithLines(1, 50)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=100 does not trigger on 100-line function', () => {
    const fn = createMockFunctionWithLines(1, 100)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=100 triggers on 101-line function', () => {
    const fn = createMockFunctionWithLines(1, 101)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('max=5 triggers on 6-line function', () => {
    const fn = createMockFunctionWithLines(1, 6)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 5,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('max=200 does not trigger on 200-line function', () => {
    const fn = createMockFunctionWithLines(1, 200)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 200,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('violation properties - file rule', () => {
  test('violation has filePath property', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const v = instance.onComplete!()[0]
    expect(v).toHaveProperty('filePath')
    expect(v.filePath).toBeDefined()
  })

  test('violation has range property', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const v = instance.onComplete!()[0]
    expect(v).toHaveProperty('range')
    expect(v.range).toBeDefined()
  })

  test('violation has message property', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const v = instance.onComplete!()[0]
    expect(v).toHaveProperty('message')
    expect(typeof v.message).toBe('string')
  })

  test('violation has suggestion property', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const v = instance.onComplete!()[0]
    expect(v).toHaveProperty('suggestion')
    expect(typeof v.suggestion).toBe('string')
  })

  test('violation has severity warning', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()[0].severity).toBe('warning')
  })

  test('violation suggestion mentions splitting', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()[0].suggestion).toContain('splitting')
  })
})

describe('violation properties - function rule', () => {
  test('violation has filePath property', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    const v = instance.onComplete!()[0]
    expect(v).toHaveProperty('filePath')
  })

  test('violation has range property', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    const v = instance.onComplete!()[0]
    expect(v).toHaveProperty('range')
  })

  test('violation has suggestion mentioning smaller functions', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].suggestion).toContain('smaller')
  })

  test('violation has severity warning', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].severity).toBe('warning')
  })

  test('violation message includes single quotes around function name', () => {
    const fn = createMockFunctionWithLines(1, 60, 'myFunc')
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].message).toContain("'myFunc'")
  })

  test('violation has ruleId max-lines-per-function', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 50,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()[0].ruleId).toBe('max-lines-per-function')
  })
})

describe('analyzeMaxLines standalone - expanded', () => {
  test('returns empty for file with 10 lines and max 100', () => {
    const sf = createMockSourceFileWithLines(10)
    expect(analyzeMaxLines(sf, 100, {})).toHaveLength(0)
  })

  test('returns violation for file with 200 lines and max 100', () => {
    const sf = createMockSourceFileWithLines(200)
    const violations = analyzeMaxLines(sf, 100, {})
    expect(violations).toHaveLength(1)
  })

  test('returns empty for file at exact limit', () => {
    const sf = createMockSourceFileWithLines(100)
    expect(analyzeMaxLines(sf, 100, {})).toHaveLength(0)
  })

  test('returns violation with correct ruleId', () => {
    const sf = createMockSourceFileWithLines(200)
    expect(analyzeMaxLines(sf, 100, {})[0].ruleId).toBe('max-lines')
  })

  test('returns violation with warning severity', () => {
    const sf = createMockSourceFileWithLines(200)
    expect(analyzeMaxLines(sf, 100, {})[0].severity).toBe('warning')
  })

  test('returns violation with suggestion', () => {
    const sf = createMockSourceFileWithLines(200)
    expect(analyzeMaxLines(sf, 100, {})[0].suggestion).toBeDefined()
  })

  test('uses default max of 300 when maxLines not specified', () => {
    const sf = createMockSourceFileWithLines(50)
    expect(analyzeMaxLines(sf)).toHaveLength(0)
  })

  test('uses default max of 300 - triggers on 301', () => {
    const sf = createMockSourceFileWithLines(301)
    const violations = analyzeMaxLines(sf)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('301 lines')
  })

  test('respects skipBlankLines option', () => {
    const text = 'a\n\n\nb'
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => []),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeMaxLines(sf as unknown as SourceFile, 2, { skipBlankLines: true })
    expect(violations).toHaveLength(0)
  })

  test('respects skipComments option', () => {
    const text = 'a\n// comment\nb'
    const mockRange = {
      getPos: () => 2,
      getEnd: () => 12,
    }
    const mockNode = {
      getLeadingCommentRanges: () => [],
      getTrailingCommentRanges: () => [mockRange],
    }
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => text),
      getDescendants: vi.fn(() => [mockNode]),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeMaxLines(sf as unknown as SourceFile, 2, { skipComments: true })
    expect(violations).toHaveLength(0)
  })

  test('violation message contains line count', () => {
    const sf = createMockSourceFileWithLines(150)
    const violations = analyzeMaxLines(sf, 100, {})
    expect(violations[0].message).toContain('150 lines')
  })

  test('violation message contains max threshold', () => {
    const sf = createMockSourceFileWithLines(150)
    const violations = analyzeMaxLines(sf, 100, {})
    expect(violations[0].message).toContain('100')
  })
})

describe('analyzeMaxLinesPerFunction standalone - expanded', () => {
  test('returns empty for source file with small function', () => {
    const fn = createMockFunctionWithLines(1, 10)
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn)
      },
    }
    expect(analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})).toHaveLength(0)
  })

  test('returns violation for source file with large function', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn)
      },
    }
    const violations = analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})
    expect(violations).toHaveLength(1)
  })

  test('returns violation with correct ruleId', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn)
      },
    }
    expect(analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})[0].ruleId).toBe(
      'max-lines-per-function',
    )
  })

  test('returns violation with warning severity', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn)
      },
    }
    expect(analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})[0].severity).toBe(
      'warning',
    )
  })

  test('returns violation with suggestion', () => {
    const fn = createMockFunctionWithLines(1, 60)
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn)
      },
    }
    expect(
      analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})[0].suggestion,
    ).toBeDefined()
  })

  test('uses default max of 50', () => {
    const fn = createMockFunctionWithLines(1, 10)
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn)
      },
    }
    expect(analyzeMaxLinesPerFunction(sf as unknown as SourceFile)).toHaveLength(0)
  })

  test('uses default max of 50 - triggers on 51-line function', () => {
    const fn = createMockFunctionWithLines(1, 51)
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn)
      },
    }
    expect(analyzeMaxLinesPerFunction(sf as unknown as SourceFile)).toHaveLength(1)
  })

  test('returns empty for source file with no children', () => {
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (_cb: (node: unknown) => void) => {},
    }
    expect(analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})).toHaveLength(0)
  })

  test('finds multiple violating functions', () => {
    const fn1 = createMockFunctionWithLines(1, 60, 'func1')
    const fn2 = createMockFunctionWithLines(1, 70, 'func2')
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn1)
        cb(fn2)
      },
    }
    const violations = analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})
    expect(violations).toHaveLength(2)
  })

  test('skips functions within limit', () => {
    const fn1 = createMockFunctionWithLines(1, 10, 'small')
    const fn2 = createMockFunctionWithLines(1, 60, 'large')
    const sf = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(fn1)
        cb(fn2)
      },
    }
    const violations = analyzeMaxLinesPerFunction(sf as unknown as SourceFile, 50, {})
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain("'large'")
  })
})

describe('edge cases - expanded', () => {
  test('empty string file has no violation with max 1', () => {
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => ''),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('single newline file has 1 line', () => {
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => '\n'),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function spanning single line at max 1 passes', () => {
    const fn = createMockFunctionWithLines(5, 5)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function spanning 2 lines at max 1 fails', () => {
    const fn = createMockFunctionWithLines(5, 6)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('very large file with 10000 lines triggers violation', () => {
    const sf = createMockSourceFileWithLines(10000)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('10000 lines')
  })

  test('function starting at line 100 ending at 200 with max 101 passes', () => {
    const fn = createMockFunctionWithLines(100, 200)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 101,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function starting at line 100 ending at 200 with max 100 fails', () => {
    const fn = createMockFunctionWithLines(100, 200)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('function at very high line numbers', () => {
    const fn = createMockFunctionWithLines(5000, 5100)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 100,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('empty file with skipBlankLines true has no violation', () => {
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => ''),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: true, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('file with only newlines and skipBlankLines=true passes', () => {
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => '\n\n\n\n\n'),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 1, skipBlankLines: true, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('single newline counted as 2 lines with skipBlankLines=false', () => {
    const sf = createMockSourceFile({
      getFullText: vi.fn(() => '\n'),
    })
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const ctx = createMockVisitorContext(sf as unknown as SourceFile)
    const instance = maxLinesRule.create({ max: 2, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf as unknown as SourceFile, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with same start and end line counted as 1', () => {
    const fn = createMockFunctionWithLines(42, 42)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 1,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with same start and end line at max 0 triggers violation', () => {
    const fn = createMockFunctionWithLines(42, 42)
    const sf = createMockSourceFile()
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesPerFunctionRule.create({
      max: 0,
      skipBlankLines: false,
      skipComments: false,
    })
    instance.visitor.visitFunction!(fn, ctx)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('1 lines')
  })

  test('max-lines violation filePath matches sourceFile path', () => {
    const sf = createMockSourceFileWithLines(150)
    const ctx = createMockVisitorContext(sf)
    const instance = maxLinesRule.create({ max: 100, skipBlankLines: false, skipComments: false })
    instance.visitor.visitSourceFile!(sf, ctx)
    expect(instance.onComplete!()[0].filePath).toBe(sf.getFilePath())
  })
})
