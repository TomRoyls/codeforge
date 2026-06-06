import { vi } from 'vitest'
import type {
  Node,
  SourceFile,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
  MethodDeclaration,
  ConstructorDeclaration,
  GetAccessorDeclaration,
  SetAccessorDeclaration,
  ClassDeclaration,
  IfStatement,
  ForStatement,
  ForInStatement,
  ForOfStatement,
  WhileStatement,
  DoStatement,
  SwitchStatement,
  CaseClause,
  DefaultClause,
  CatchClause,
  ConditionalExpression,
  BinaryExpression,
  VariableDeclaration,
  Identifier,
} from 'ts-morph'

// SyntaxKind values from ts-morph (differs from TypeScript compiler API)
export const SyntaxKind = {
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
  NumericLiteral: 8,
  StringLiteral: 9,
  TrueKeyword: 102,
  FalseKeyword: 99,
  NullKeyword: 101,
  EqualsEqualsToken: 40,
  EqualsEqualsEqualsToken: 41,
  ExclamationEqualsToken: 42,
  ExclamationEqualsEqualsToken: 43,
  LessThanToken: 32,
  LessThanEqualsToken: 33,
  GreaterThanToken: 35,
  GreaterThanEqualsToken: 36,
} as const

export interface MockNodeConfig {
  kind?: number
  start?: number
  end?: number
  line?: number
  column?: number
  text?: string
  filePath?: string
  children?: Node[]
}

export function createMockSourceFile(overrides: Record<string, unknown> = {}): SourceFile {
  const defaultImpl = {
    getFilePath: vi.fn(() => '/test/file.ts'),
    getStart: vi.fn(() => 0),
    getEnd: vi.fn(() => 100),
    getFullStart: vi.fn(() => 0),
    getFullText: vi.fn(() => 'const x = 1;'),
    getText: vi.fn(() => 'const x = 1;'),
    getLineAndColumnAtPos: vi.fn((pos: number) => {
      if (pos === 0) return { line: 1, column: 0 }
      if (pos < 10) return { line: 1, column: pos }
      return { line: 2, column: pos - 10 }
    }),
    forEachChild: vi.fn(),
    getChildCount: vi.fn(() => 0),
    getChildren: vi.fn((): Node[] => []),
    getKind: vi.fn(() => SyntaxKind.SourceFile),
    getSourceFile: vi.fn(function (this: SourceFile) {
      return this
    }),
  }
  return { ...defaultImpl, ...overrides } as unknown as SourceFile
}

export function createMockNode(config: MockNodeConfig = {}): Node {
  const {
    kind = SyntaxKind.Identifier,
    start = 0,
    end = 10,
    line = 1,
    column = 0,
    text = 'mockNode',
    filePath = '/test/file.ts',
    children = [],
  } = config

  const sourceFile = createMockSourceFile({
    getFilePath: vi.fn(() => filePath),
    getLineAndColumnAtPos: vi.fn((pos: number) => {
      if (pos === start) return { line, column }
      if (pos === end) return { line, column: column + (end - start) }
      return { line, column: pos - start + column }
    }),
  })

  return {
    getKind: vi.fn(() => kind),
    getStart: vi.fn(() => start),
    getEnd: vi.fn(() => end),
    getFullStart: vi.fn(() => start),
    getText: vi.fn(() => text),
    getSourceFile: vi.fn(() => sourceFile),
    forEachChild: vi.fn((cb: (node: Node) => void) => {
      children.forEach((child) => cb(child))
    }),
    getChildCount: vi.fn(() => children.length),
    getChildren: vi.fn(() => children),
    getParent: vi.fn(() => undefined),
  } as unknown as Node
}

export function createMockFunctionDeclaration(
  config: MockNodeConfig & { functionName?: string } = {},
): FunctionDeclaration {
  const { functionName = 'testFunction', children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.FunctionDeclaration,
    text: `function ${functionName}() {}`,
    children,
    ...rest,
  })

  return {
    ...node,
    getName: vi.fn(() => functionName),
  } as unknown as FunctionDeclaration
}

export function createMockFunctionExpression(
  config: MockNodeConfig & { functionName?: string | undefined } = {},
): FunctionExpression {
  const { functionName = undefined, children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.FunctionExpression,
    text: functionName ? `function ${functionName}() {}` : 'function() {}',
    children,
    ...rest,
  })

  return {
    ...node,
    getName: vi.fn(() => functionName),
  } as unknown as FunctionExpression
}

export function createMockArrowFunction(
  config: MockNodeConfig & { parentIsVariable?: boolean; variableName?: string } = {},
): ArrowFunction {
  const { parentIsVariable = false, variableName = 'arrowFn', children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.ArrowFunction,
    text: '() => {}',
    children,
    ...rest,
  })

  const parentNode = parentIsVariable
    ? ({
        getKind: vi.fn(() => SyntaxKind.VariableDeclaration),
        getNameNode: vi.fn(
          () =>
            ({
              getText: vi.fn(() => variableName),
              getKind: vi.fn(() => SyntaxKind.Identifier),
            }) as unknown as Identifier,
        ),
      } as unknown as VariableDeclaration)
    : undefined

  return {
    ...node,
    getParent: vi.fn(() => parentNode),
  } as unknown as ArrowFunction
}

export function createMockMethodDeclaration(
  config: MockNodeConfig & { methodName?: string; parentClassName?: string | undefined } = {},
): MethodDeclaration {
  const { methodName = 'testMethod', parentClassName = undefined, children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.MethodDeclaration,
    text: `${methodName}() {}`,
    children,
    ...rest,
  })

  const parentNode =
    parentClassName !== undefined
      ? ({
          getKind: vi.fn(() => SyntaxKind.ClassDeclaration),
          getName: vi.fn(() => parentClassName),
        } as unknown as ClassDeclaration)
      : undefined

  return {
    ...node,
    getName: vi.fn(() => methodName),
    getParent: vi.fn(() => parentNode),
  } as unknown as MethodDeclaration
}

export function createMockConstructorDeclaration(
  config: MockNodeConfig & { parentClassName?: string | undefined } = {},
): ConstructorDeclaration {
  const { parentClassName = undefined, children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.ConstructorDeclaration,
    text: 'constructor() {}',
    children,
    ...rest,
  })

  const parentNode =
    parentClassName !== undefined
      ? ({
          getKind: vi.fn(() => SyntaxKind.ClassDeclaration),
          getName: vi.fn(() => parentClassName),
        } as unknown as ClassDeclaration)
      : undefined

  return {
    ...node,
    getParent: vi.fn(() => parentNode),
  } as unknown as ConstructorDeclaration
}

export function createMockGetAccessorDeclaration(
  config: MockNodeConfig & { accessorName?: string } = {},
): GetAccessorDeclaration {
  const { accessorName = 'value', children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.GetAccessorDeclaration,
    text: `get ${accessorName}() {}`,
    children,
    ...rest,
  })

  return {
    ...node,
    getName: vi.fn(() => accessorName),
  } as unknown as GetAccessorDeclaration
}

export function createMockSetAccessorDeclaration(
  config: MockNodeConfig & { accessorName?: string } = {},
): SetAccessorDeclaration {
  const { accessorName = 'value', children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.SetAccessorDeclaration,
    text: `set ${accessorName}(v) {}`,
    children,
    ...rest,
  })

  return {
    ...node,
    getName: vi.fn(() => accessorName),
  } as unknown as SetAccessorDeclaration
}

export function createMockClassDeclaration(
  config: MockNodeConfig & { className?: string; children?: Node[] } = {},
): ClassDeclaration {
  const { className = 'TestClass', children = [], ...rest } = config
  const node = createMockNode({
    kind: SyntaxKind.ClassDeclaration,
    text: `class ${className} {}`,
    children,
    ...rest,
  })

  return {
    ...node,
    getName: vi.fn(() => className),
  } as unknown as ClassDeclaration
}

export function createMockIfStatement(config: MockNodeConfig = {}): IfStatement {
  return createMockNode({
    kind: SyntaxKind.IfStatement,
    text: 'if (true) {}',
    ...config,
  }) as unknown as IfStatement
}

export function createMockForStatement(config: MockNodeConfig = {}): ForStatement {
  return createMockNode({
    kind: SyntaxKind.ForStatement,
    text: 'for (;;) {}',
    ...config,
  }) as unknown as ForStatement
}

export function createMockForInStatement(config: MockNodeConfig = {}): ForInStatement {
  return createMockNode({
    kind: SyntaxKind.ForInStatement,
    text: 'for (x in obj) {}',
    ...config,
  }) as unknown as ForInStatement
}

export function createMockForOfStatement(config: MockNodeConfig = {}): ForOfStatement {
  return createMockNode({
    kind: SyntaxKind.ForOfStatement,
    text: 'for (x of arr) {}',
    ...config,
  }) as unknown as ForOfStatement
}

export function createMockWhileStatement(config: MockNodeConfig = {}): WhileStatement {
  return createMockNode({
    kind: SyntaxKind.WhileStatement,
    text: 'while (true) {}',
    ...config,
  }) as unknown as WhileStatement
}

export function createMockDoStatement(config: MockNodeConfig = {}): DoStatement {
  return createMockNode({
    kind: SyntaxKind.DoStatement,
    text: 'do {} while (true);',
    ...config,
  }) as unknown as DoStatement
}

export function createMockSwitchStatement(config: MockNodeConfig = {}): SwitchStatement {
  return createMockNode({
    kind: SyntaxKind.SwitchStatement,
    text: 'switch (x) {}',
    ...config,
  }) as unknown as SwitchStatement
}

export function createMockCaseClause(config: MockNodeConfig = {}): CaseClause {
  return createMockNode({
    kind: SyntaxKind.CaseClause,
    text: 'case 1:',
    ...config,
  }) as unknown as CaseClause
}

export function createMockDefaultClause(config: MockNodeConfig = {}): DefaultClause {
  return createMockNode({
    kind: SyntaxKind.DefaultClause,
    text: 'default:',
    ...config,
  }) as unknown as DefaultClause
}

export function createMockCatchClause(config: MockNodeConfig = {}): CatchClause {
  return createMockNode({
    kind: SyntaxKind.CatchClause,
    text: 'catch (e) {}',
    ...config,
  }) as unknown as CatchClause
}

export function createMockConditionalExpression(
  config: MockNodeConfig = {},
): ConditionalExpression {
  return createMockNode({
    kind: SyntaxKind.ConditionalExpression,
    text: 'a ? b : c',
    ...config,
  }) as unknown as ConditionalExpression
}

export function createMockBinaryExpression(config: MockNodeConfig = {}): BinaryExpression {
  return createMockNode({
    kind: SyntaxKind.BinaryExpression,
    text: 'a + b',
    ...config,
  }) as unknown as BinaryExpression
}

// Helper to create deeply nested node structure
export function createDeeplyNestedNodes(depth: number): Node {
  if (depth <= 0) {
    return createMockNode({ kind: SyntaxKind.Identifier, text: 'leaf' })
  }

  const child = createDeeplyNestedNodes(depth - 1)
  return createMockNode({
    kind: SyntaxKind.IfStatement,
    text: `level${depth}`,
    children: [child],
  })
}

// Helper to create source file with children
export function createSourceFileWithChildren(children: Node[]): SourceFile {
  const forEachChildMock = vi.fn((cb: (node: Node) => void) => {
    children.forEach((child) => cb(child))
  })
  return createMockSourceFile({
    forEachChild: forEachChildMock,
    getChildren: vi.fn(() => children),
    getChildCount: vi.fn(() => children.length),
  })
}

export function createMockIdentifier(text: string, config: MockNodeConfig = {}): Identifier {
  const node = createMockNode({
    kind: SyntaxKind.Identifier,
    text,
    ...config,
  })
  return {
    ...node,
    getText: vi.fn(() => text),
  } as unknown as Identifier
}

export function createMockNumericLiteral(value: number, config: MockNodeConfig = {}): Node {
  const node = createMockNode({
    kind: SyntaxKind.NumericLiteral,
    text: String(value),
    ...config,
  })
  return {
    ...node,
    getText: vi.fn(() => String(value)),
  } as unknown as Node
}
export function createMockStringLiteral(value: string, config: MockNodeConfig = {}): Node {
  const node = createMockNode({
    kind: SyntaxKind.StringLiteral,
    text: `"${value}"`,
    ...config,
  })
  return {
    ...node,
    getText: vi.fn(() => `"${value}"`),
  } as unknown as Node
}
export function createMockBooleanLiteral(value: boolean, config: MockNodeConfig = {}): Node {
  const node = createMockNode({
    kind: value ? SyntaxKind.TrueKeyword : SyntaxKind.FalseKeyword,
    text: String(value),
    ...config,
  })
  return {
    ...node,
    getText: vi.fn(() => String(value)),
  } as unknown as Node
}
export function createMockNullLiteral(config: MockNodeConfig = {}): Node {
  const node = createMockNode({
    kind: SyntaxKind.NullKeyword,
    text: 'null',
    ...config,
  })
  return {
    ...node,
    getText: vi.fn(() => 'null'),
  } as unknown as Node
}

export interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
  severity?: string
  ruleId?: string
}

export interface MockContextOptions {
  source?: string
  options?: unknown[]
  filePath?: string
}

export function createMockRuleContext(overrides: MockContextOptions = {}): {
  context: import('../../src/plugins/types.js').RuleContext
  reports: ReportDescriptor[]
} {
  const { source = 'const x = 1;', options = [], filePath = '/src/file.ts' } = overrides
  const reports: ReportDescriptor[] = []

  const context = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
        severity: descriptor.severity,
        ruleId: descriptor.ruleId,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as import('../../src/plugins/types.js').RuleContext

  return { context, reports }
}

export function createSimpleIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

export function createSimpleLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw: String(value),
    loc: {
      start: { line, column },
      end: { line, column: column + String(value).length },
    },
  }
}

export function createSimpleMemberExpression(
  object: unknown,
  property: unknown,
  computed = false,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleCallExpression(
  callee: unknown,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleBinaryExpression(
  left: unknown,
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleLogicalExpression(
  left: unknown,
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'LogicalExpression',
    left,
    operator,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleUnaryExpression(
  operator: string,
  argument: unknown,
  prefix = true,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

export function createSimpleAssignmentExpression(
  left: unknown,
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    left,
    operator,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

export function createSimpleExpressionStatement(
  expression: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleBlockStatement(body: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

export function createSimpleReturnStatement(
  argument: unknown = null,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

export function createSimpleFunctionDeclaration(
  name: string,
  params: unknown[] = [],
  body: unknown = null,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length + 20 },
    },
  }
}

export function createSimpleFunctionExpression(
  params: unknown[] = [],
  body: unknown = null,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

export function createSimpleArrowFunctionExpression(
  params: unknown[] = [],
  body: unknown = null,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

export function createSimpleNewExpression(
  callee: unknown,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleTemplateLiteral(
  quasis: unknown[],
  expressions: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleObjectExpression(
  properties: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ObjectExpression',
    properties,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

export function createSimpleVariableDeclarator(
  name: string,
  init: unknown = null,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length + 10 },
    },
  }
}
