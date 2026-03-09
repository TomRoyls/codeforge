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

// SyntaxKind values from TypeScript
export const SyntaxKind = {
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
