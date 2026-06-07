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
  try {
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
  } catch {
    return { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } }
  }
}

export function getNodeFilePath(node: Node): string {
  try {
    return node.getSourceFile().getFilePath()
  } catch {
    return 'unknown'
  }
}

export function isFunctionLike(node: Node): node is FunctionLikeNode {
  const kind = node.getKind()
  return (
    kind === 262 ||
    kind === 218 ||
    kind === 219 ||
    kind === 174 ||
    kind === 176 ||
    kind === 177 ||
    kind === 178
  )
}

export function getFunctionName(node: FunctionLikeNode): string {
  const kind = node.getKind()
  const nodeAs = node as unknown as Record<string, unknown>

  if (
    Node.isFunctionDeclaration(node) ||
    Node.isFunctionExpression(node) ||
    kind === 262 ||
    kind === 218
  ) {
    const name =
      typeof nodeAs.getName === 'function'
        ? (nodeAs.getName as () => string | undefined)()
        : undefined
    if (name) return name
  }

  if (Node.isMethodDeclaration(node) || kind === 174) {
    const name =
      typeof nodeAs.getName === 'function'
        ? (nodeAs.getName as () => string)()
        : 'method'
    const parent = node.getParent()
    if (Node.isClassDeclaration(parent)) {
      return `${parent.getName() ?? 'Anonymous'}.${name}`
    }

    return name
  }

  if (Node.isConstructorDeclaration(node) || kind === 176) {
    const parent = node.getParent()
    if (Node.isClassDeclaration(parent)) {
      return `constructor (${parent.getName() ?? 'Anonymous'})`
    }

    return 'constructor'
  }

  if (Node.isGetAccessorDeclaration(node) || kind === 177) {
    return `get ${typeof nodeAs.getName === 'function' ? (nodeAs.getName as () => string)() : 'accessor'}`
  }

  if (Node.isSetAccessorDeclaration(node) || kind === 178) {
    return `set ${typeof nodeAs.getName === 'function' ? (nodeAs.getName as () => string)() : 'accessor'}`
  }

  if (Node.isArrowFunction(node) || kind === 219) {
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

  const MAX_TRAVERSAL_DEPTH = 200

  function visit(node: Node, depth: number): void {
    if (depth > MAX_TRAVERSAL_DEPTH) return

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

  // Pre-filter visitors by callback type to skip iteration over visitors
  // that don't implement a given callback
  const visitNodeVisitors = visitors.filter((v) => v.visitNode !== undefined)
  const visitSourceFileVisitors = visitors.filter((v) => v.visitSourceFile !== undefined)
  const visitFunctionVisitors = visitors.filter((v) => v.visitFunction !== undefined)
  const visitIfStatementVisitors = visitors.filter((v) => v.visitIfStatement !== undefined)
  const visitLoopVisitors = visitors.filter((v) => v.visitLoop !== undefined)
  const visitSwitchVisitors = visitors.filter((v) => v.visitSwitch !== undefined)
  const visitCaseVisitors = visitors.filter((v) => v.visitCase !== undefined)
  const visitCatchVisitors = visitors.filter((v) => v.visitCatch !== undefined)
  const visitConditionalVisitors = visitors.filter((v) => v.visitConditional !== undefined)
  const visitBinaryExpressionVisitors = visitors.filter((v) => v.visitBinaryExpression !== undefined)
  const exitNodeVisitors = visitors.filter((v) => v.exitNode !== undefined)

  // Single reusable context — mutated per node instead of allocating a new object each time
  const ctx: VisitorContext = {
    addViolation(violation: RuleViolation) {
      violations.push(violation)
    },
    depth: 0,
    getFilePath: () => filePath,
    parent: undefined as Node | undefined,
    sourceFile,
  }

  const MAX_TRAVERSAL_DEPTH = 200

  function visit(node: Node, depth: number): void {
    if (depth > MAX_TRAVERSAL_DEPTH) return

    ctx.parent = node
    ctx.depth = depth

    for (let i = 0; i < visitNodeVisitors.length; i++) {
      visitNodeVisitors[i]!.visitNode!(node, ctx)
    }

    if (Node.isSourceFile(node)) {
      for (let i = 0; i < visitSourceFileVisitors.length; i++) {
        visitSourceFileVisitors[i]!.visitSourceFile!(node, ctx)
      }
    } else if (isFunctionLike(node)) {
      for (let i = 0; i < visitFunctionVisitors.length; i++) {
        visitFunctionVisitors[i]!.visitFunction!(node, ctx)
      }
    } else if (Node.isIfStatement(node)) {
      for (let i = 0; i < visitIfStatementVisitors.length; i++) {
        visitIfStatementVisitors[i]!.visitIfStatement!(node, ctx)
      }
    } else if (
      Node.isForStatement(node) ||
      Node.isForInStatement(node) ||
      Node.isForOfStatement(node) ||
      Node.isWhileStatement(node) ||
      Node.isDoStatement(node)
    ) {
      for (let i = 0; i < visitLoopVisitors.length; i++) {
        visitLoopVisitors[i]!.visitLoop!(node, ctx)
      }
    } else if (Node.isSwitchStatement(node)) {
      for (let i = 0; i < visitSwitchVisitors.length; i++) {
        visitSwitchVisitors[i]!.visitSwitch!(node, ctx)
      }
    } else if (Node.isCaseClause(node) || Node.isDefaultClause(node)) {
      for (let i = 0; i < visitCaseVisitors.length; i++) {
        visitCaseVisitors[i]!.visitCase!(node, ctx)
      }
    } else if (Node.isCatchClause(node)) {
      for (let i = 0; i < visitCatchVisitors.length; i++) {
        visitCatchVisitors[i]!.visitCatch!(node, ctx)
      }
    } else if (Node.isConditionalExpression(node)) {
      for (let i = 0; i < visitConditionalVisitors.length; i++) {
        visitConditionalVisitors[i]!.visitConditional!(node, ctx)
      }
    } else if (Node.isBinaryExpression(node)) {
      for (let i = 0; i < visitBinaryExpressionVisitors.length; i++) {
        visitBinaryExpressionVisitors[i]!.visitBinaryExpression!(node, ctx)
      }
    }

    node.forEachChild((child) => {
      visit(child, depth + 1)
    })

    for (let i = 0; i < exitNodeVisitors.length; i++) {
      exitNodeVisitors[i]!.exitNode!(node, ctx)
    }
  }

  visit(sourceFile, 0)
}

export { Node } from 'ts-morph'
