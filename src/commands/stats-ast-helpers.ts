import { type BinaryExpression, Node, type SourceFile } from 'ts-morph'

export interface CodeStructures {
  classes: number
  enums: number
  functions: number
  interfaces: number
  methods: number
  typeAliases: number
}

export function isLogicalOperator(node: BinaryExpression): boolean {
  const operator = node.getOperatorToken().getKind()
  return operator === 56 || operator === 57
}

export function calculateFileComplexity(sourceFile: SourceFile): number {
  let complexity = 0

  function visit(node: Node): void {
    if (
      Node.isIfStatement(node) ||
      Node.isForStatement(node) ||
      Node.isForInStatement(node) ||
      Node.isForOfStatement(node) ||
      Node.isWhileStatement(node) ||
      Node.isDoStatement(node) ||
      Node.isCatchClause(node) ||
      Node.isConditionalExpression(node)
    ) {
      complexity += 1
    }

    if (Node.isCaseClause(node)) {
      complexity += 1
    }

    if (Node.isBinaryExpression(node) && isLogicalOperator(node)) {
      complexity += 1
    }

    node.forEachChild(visit)
  }

  sourceFile.forEachChild(visit)
  return Math.max(complexity, 1)
}

export function countCodeStructures(sourceFile: SourceFile): CodeStructures {
  const structures: CodeStructures = {
    classes: 0,
    enums: 0,
    functions: 0,
    interfaces: 0,
    methods: 0,
    typeAliases: 0,
  }

  function visit(node: Node): void {
    if (Node.isFunctionDeclaration(node)) {
      structures.functions++
    }

    if (Node.isMethodDeclaration(node) || Node.isConstructorDeclaration(node)) {
      structures.methods++
    }

    if (Node.isClassDeclaration(node)) {
      structures.classes++
    }

    if (Node.isInterfaceDeclaration(node)) {
      structures.interfaces++
    }

    if (Node.isTypeAliasDeclaration(node)) {
      structures.typeAliases++
    }

    if (Node.isEnumDeclaration(node)) {
      structures.enums++
    }

    node.forEachChild(visit)
  }

  sourceFile.forEachChild(visit)
  return structures
}
