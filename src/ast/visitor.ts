import {
  type ArrowFunction,
  type BinaryExpression,
  type CaseClause,
  type CatchClause,
  type ConditionalExpression,
  type ConstructorDeclaration,
  type DefaultClause,
  type DoStatement,
  type ForInStatement,
  type ForOfStatement,
  type ForStatement,
  type FunctionDeclaration,
  type FunctionExpression,
  type GetAccessorDeclaration,
  type IfStatement,
  type MethodDeclaration,
  Node,
  type SetAccessorDeclaration,
  type SourceFile,
  type SwitchStatement,
  type WhileStatement,
} from 'ts-morph'

export type FunctionLikeNode =
  | ArrowFunction
  | ConstructorDeclaration
  | FunctionDeclaration
  | FunctionExpression
  | GetAccessorDeclaration
  | MethodDeclaration
  | SetAccessorDeclaration

export type BranchingNode =
  | CaseClause
  | CatchClause
  | ConditionalExpression
  | DoStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | IfStatement
  | WhileStatement

export interface Position {
  column: number
  line: number
}

export interface Range {
  end: Position
  start: Position
}

export interface RuleViolation {
  filePath: string
  message: string
  range: Range
  ruleId: string
  severity: 'error' | 'info' | 'warning'
  suggestion?: string
}

export interface VisitorContext {
  addViolation: (violation: RuleViolation) => void
  depth: number
  getFilePath: () => string
  parent: Node | undefined
  sourceFile: SourceFile
}

export interface ASTVisitor {
  exitNode?: (node: Node, context: VisitorContext) => void
  visitBinaryExpression?: (node: BinaryExpression, context: VisitorContext) => void
  visitCase?: (node: CaseClause | DefaultClause, context: VisitorContext) => void
  visitCatch?: (node: CatchClause, context: VisitorContext) => void
  visitConditional?: (node: ConditionalExpression, context: VisitorContext) => void
  visitFunction?: (node: FunctionLikeNode, context: VisitorContext) => void
  visitIfStatement?: (node: IfStatement, context: VisitorContext) => void
  visitLoop?: (
    node: DoStatement | ForInStatement | ForOfStatement | ForStatement | WhileStatement,
    context: VisitorContext,
  ) => void
  visitNode?: (node: Node, context: VisitorContext) => void
  visitSourceFile?: (node: SourceFile, context: VisitorContext) => void
  visitSwitch?: (node: SwitchStatement, context: VisitorContext) => void
}

export function getNodePosition(node: Node): Position {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const position = sourceFile.getLineAndColumnAtPos(start)
  return {
    column: position.column,
    line: position.line,
  }
}

export function getNodeRange(node: Node): Range {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const end = node.getEnd()
  const startPosition = sourceFile.getLineAndColumnAtPos(start)
  const endPosition = sourceFile.getLineAndColumnAtPos(end)
  return {
    end: {
      column: endPosition.column,
      line: endPosition.line,
    },
    start: {
      column: startPosition.column,
      line: startPosition.line,
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
    addViolation(violation: RuleViolation) {
      violations.push(violation)
    },
    depth: currentDepth,
    getFilePath: () => filePath,
    parent,
    sourceFile,
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
    addViolation(violation: RuleViolation) {
      violations.push(violation)
    },
    depth: currentDepth,
    getFilePath: () => filePath,
    parent,
    sourceFile,
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



export {Node} from 'ts-morph'