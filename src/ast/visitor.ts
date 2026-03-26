import {
  Node,
  type SourceFile,
  type FunctionDeclaration,
  type FunctionExpression,
  type ArrowFunction,
  type MethodDeclaration,
  type ConstructorDeclaration,
  type GetAccessorDeclaration,
  type SetAccessorDeclaration,
  type IfStatement,
  type ForStatement,
  type ForInStatement,
  type ForOfStatement,
  type WhileStatement,
  type DoStatement,
  type SwitchStatement,
  type CaseClause,
  type DefaultClause,
  type CatchClause,
  type ConditionalExpression,
  type BinaryExpression,
} from 'ts-morph'

export type FunctionLikeNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunction
  | MethodDeclaration
  | ConstructorDeclaration
  | GetAccessorDeclaration
  | SetAccessorDeclaration

export type BranchingNode =
  | IfStatement
  | ForStatement
  | ForInStatement
  | ForOfStatement
  | WhileStatement
  | DoStatement
  | CaseClause
  | CatchClause
  | ConditionalExpression

export interface Position {
  line: number
  column: number
}

export interface Range {
  start: Position
  end: Position
}

export interface RuleViolation {
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  message: string
  filePath: string
  range: Range
  suggestion?: string
}

export interface VisitorContext {
  sourceFile: SourceFile
  depth: number
  parent: Node | undefined
  addViolation: (violation: RuleViolation) => void
  getFilePath: () => string
}

export interface ASTVisitor {
  visitNode?: (node: Node, context: VisitorContext) => void
  exitNode?: (node: Node, context: VisitorContext) => void
  visitFunction?: (node: FunctionLikeNode, context: VisitorContext) => void
  visitSourceFile?: (node: SourceFile, context: VisitorContext) => void
  visitIfStatement?: (node: IfStatement, context: VisitorContext) => void
  visitLoop?: (
    node: ForStatement | ForInStatement | ForOfStatement | WhileStatement | DoStatement,
    context: VisitorContext,
  ) => void
  visitSwitch?: (node: SwitchStatement, context: VisitorContext) => void
  visitCase?: (node: CaseClause | DefaultClause, context: VisitorContext) => void
  visitCatch?: (node: CatchClause, context: VisitorContext) => void
  visitConditional?: (node: ConditionalExpression, context: VisitorContext) => void
  visitBinaryExpression?: (node: BinaryExpression, context: VisitorContext) => void
}

export function getNodePosition(node: Node): Position {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const position = sourceFile.getLineAndColumnAtPos(start)
  return {
    line: position.line,
    column: position.column,
  }
}

export function getNodeRange(node: Node): Range {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const end = node.getEnd()
  const startPosition = sourceFile.getLineAndColumnAtPos(start)
  const endPosition = sourceFile.getLineAndColumnAtPos(end)
  return {
    start: {
      line: startPosition.line,
      column: startPosition.column,
    },
    end: {
      line: endPosition.line,
      column: endPosition.column,
    },
  }
}

export function isFunctionLike(node: Node): node is FunctionLikeNode {
  const kind = node.getKind()
  return (
    kind === 257 ||
    kind === 216 ||
    kind === 211 ||
    kind === 173 ||
    kind === 174 ||
    kind === 175 ||
    kind === 176
  )
}

export function getFunctionName(node: FunctionLikeNode): string {
  if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node)) {
    const name = node.getName()
    if (name) return name
  }

  if (Node.isMethodDeclaration(node)) {
    const name = node.getName()
    const parent = node.getParent()
    if (Node.isClassDeclaration(parent)) {
      return `${parent.getName() ?? 'Anonymous'}.${name}`
    }
    return name
  }

  if (Node.isConstructorDeclaration(node)) {
    const parent = node.getParent()
    if (Node.isClassDeclaration(parent)) {
      return `constructor (${parent.getName() ?? 'Anonymous'})`
    }
    return 'constructor'
  }

  if (Node.isGetAccessorDeclaration(node)) {
    return `get ${node.getName()}`
  }
  if (Node.isSetAccessorDeclaration(node)) {
    return `set ${node.getName()}`
  }

  if (Node.isArrowFunction(node)) {
    const parent = node.getParent()
    if (Node.isVariableDeclaration(parent)) {
      const nameNode = parent.getNameNode()
      if (Node.isIdentifier(nameNode)) {
        return nameNode.getText()
      }
    }
    return 'arrow function'
  }

  return 'anonymous function'
}

export function traverseAST(
  sourceFile: SourceFile,
  visitor: ASTVisitor,
  violations: RuleViolation[] = [],
): void {
  const filePath = sourceFile.getFilePath()

  const createChildContext = (parent: Node, currentDepth: number): VisitorContext => ({
    sourceFile,
    depth: currentDepth,
    parent,
    addViolation: (violation: RuleViolation) => {
      violations.push(violation)
    },
    getFilePath: () => filePath,
  })

  function visit(node: Node, depth: number): void {
    const nodeContext = createChildContext(node, depth)

    visitor.visitNode?.(node, nodeContext)

    if (Node.isSourceFile(node)) {
      visitor.visitSourceFile?.(node, nodeContext)
    } else if (isFunctionLike(node)) {
      visitor.visitFunction?.(node, nodeContext)
    } else if (Node.isIfStatement(node)) {
      visitor.visitIfStatement?.(node, nodeContext)
    } else if (
      Node.isForStatement(node) ||
      Node.isForInStatement(node) ||
      Node.isForOfStatement(node) ||
      Node.isWhileStatement(node) ||
      Node.isDoStatement(node)
    ) {
      visitor.visitLoop?.(node, nodeContext)
    } else if (Node.isSwitchStatement(node)) {
      visitor.visitSwitch?.(node, nodeContext)
    } else if (Node.isCaseClause(node) || Node.isDefaultClause(node)) {
      visitor.visitCase?.(node, nodeContext)
    } else if (Node.isCatchClause(node)) {
      visitor.visitCatch?.(node, nodeContext)
    } else if (Node.isConditionalExpression(node)) {
      visitor.visitConditional?.(node, nodeContext)
    } else if (Node.isBinaryExpression(node)) {
      visitor.visitBinaryExpression?.(node, nodeContext)
    }

    node.forEachChild((child) => {
      visit(child, depth + 1)
    })

    visitor.exitNode?.(node, nodeContext)
  }

  visit(sourceFile, 0)
}

export function traverseASTMultiple(
  sourceFile: SourceFile,
  visitors: ASTVisitor[],
  violations: RuleViolation[] = [],
): void {
  if (visitors.length === 0) return
  if (visitors.length === 1) {
    traverseAST(sourceFile, visitors[0]!, violations)
    return
  }

  const filePath = sourceFile.getFilePath()

  const createChildContext = (parent: Node, currentDepth: number): VisitorContext => ({
    sourceFile,
    depth: currentDepth,
    parent,
    addViolation: (violation: RuleViolation) => {
      violations.push(violation)
    },
    getFilePath: () => filePath,
  })

  function visit(node: Node, depth: number): void {
    const nodeContext = createChildContext(node, depth)

    for (const visitor of visitors) {
      visitor.visitNode?.(node, nodeContext)
    }

    if (Node.isSourceFile(node)) {
      for (const visitor of visitors) {
        visitor.visitSourceFile?.(node, nodeContext)
      }
    } else if (isFunctionLike(node)) {
      for (const visitor of visitors) {
        visitor.visitFunction?.(node, nodeContext)
      }
    } else if (Node.isIfStatement(node)) {
      for (const visitor of visitors) {
        visitor.visitIfStatement?.(node, nodeContext)
      }
    } else if (
      Node.isForStatement(node) ||
      Node.isForInStatement(node) ||
      Node.isForOfStatement(node) ||
      Node.isWhileStatement(node) ||
      Node.isDoStatement(node)
    ) {
      for (const visitor of visitors) {
        visitor.visitLoop?.(node, nodeContext)
      }
    } else if (Node.isSwitchStatement(node)) {
      for (const visitor of visitors) {
        visitor.visitSwitch?.(node, nodeContext)
      }
    } else if (Node.isCaseClause(node) || Node.isDefaultClause(node)) {
      for (const visitor of visitors) {
        visitor.visitCase?.(node, nodeContext)
      }
    } else if (Node.isCatchClause(node)) {
      for (const visitor of visitors) {
        visitor.visitCatch?.(node, nodeContext)
      }
    } else if (Node.isConditionalExpression(node)) {
      for (const visitor of visitors) {
        visitor.visitConditional?.(node, nodeContext)
      }
    } else if (Node.isBinaryExpression(node)) {
      for (const visitor of visitors) {
        visitor.visitBinaryExpression?.(node, nodeContext)
      }
    }

    node.forEachChild((child) => {
      visit(child, depth + 1)
    })

    for (const visitor of visitors) {
      visitor.exitNode?.(node, nodeContext)
    }
  }

  visit(sourceFile, 0)
}

export { Node }
