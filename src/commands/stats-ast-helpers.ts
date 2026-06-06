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

  function visit(node: Node | object): void {
    if (typeof (node as any).getKind !== 'function') {
      complexity += 1
      return
    }

    const real = node as Node
    if (
      Node.isIfStatement(real) ||
      Node.isForStatement(real) ||
      Node.isForInStatement(real) ||
      Node.isForOfStatement(real) ||
      Node.isWhileStatement(real) ||
      Node.isDoStatement(real) ||
      Node.isCatchClause(real) ||
      Node.isConditionalExpression(real)
    ) {
      complexity += 1
    }

    if (Node.isCaseClause(real)) {
      complexity += 1
    }

    if (Node.isBinaryExpression(real) && isLogicalOperator(real as unknown as BinaryExpression)) {
      complexity += 1
    }

    if (typeof (real as any).forEachChild === 'function') {
      real.forEachChild(visit as (n: Node) => void)
    }
  }

  if (typeof (sourceFile as any).forEachChild === 'function') {
    ;(sourceFile as any).forEachChild(visit)
  }
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

  function visit(node: Node | object): void {
    if (typeof (node as any).getKind !== 'function') {
      return
    }

    const real = node as Node

    if (Node.isFunctionDeclaration(real)) {
      structures.functions++
    }

    if (Node.isMethodDeclaration(real) || Node.isConstructorDeclaration(real)) {
      structures.methods++
    }

    if (Node.isClassDeclaration(real)) {
      structures.classes++
    }

    if (Node.isInterfaceDeclaration(real)) {
      structures.interfaces++
    }

    if (Node.isTypeAliasDeclaration(real)) {
      structures.typeAliases++
    }

    if (Node.isEnumDeclaration(real)) {
      structures.enums++
    }

    if (typeof (real as any).forEachChild === 'function') {
      real.forEachChild(visit as (n: Node) => void)
    }
  }

  if (typeof (sourceFile as any).forEachChild === 'function') {
    ;(sourceFile as any).forEachChild(visit)
  }
  return structures
}
