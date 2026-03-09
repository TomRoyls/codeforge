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
