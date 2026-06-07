import { type BinaryExpression, Node, type SourceFile, SyntaxKind } from 'ts-morph'

import { type FunctionLikeNode, getFunctionName, isFunctionLike } from '../ast/visitor.js'

/**
 * @stable
 */
export type ComplexityCategory = 'extreme' | 'high' | 'low' | 'moderate'

/**
 * @stable
 */
export interface FunctionComplexity {
  category: ComplexityCategory
  cognitive: number
  cyclomatic: number
  filePath: string
  functionName: string
  startLine: number
}

/**
 * @stable
 */
export interface ComplexityResult {
  functions: FunctionComplexity[]
  summary: {
    averageCognitive: number
    averageCyclomatic: number
    categoryBreakdown: Record<ComplexityCategory, number>
    maxCognitive: number
    maxCyclomatic: number
    totalFunctions: number
  }
}

const LOGICAL_OPERATORS = new Set([SyntaxKind.AmpersandAmpersandToken, SyntaxKind.BarBarToken, SyntaxKind.QuestionQuestionToken])

const LOW_COMPLEXITY_THRESHOLD = 5
const MODERATE_COMPLEXITY_THRESHOLD = 10
const HIGH_COMPLEXITY_THRESHOLD = 20

/**
 * @stable
 */
export function getComplexityCategory(complexity: number): ComplexityCategory {
  if (complexity <= LOW_COMPLEXITY_THRESHOLD) return 'low'
  if (complexity <= MODERATE_COMPLEXITY_THRESHOLD) return 'moderate'
  if (complexity <= HIGH_COMPLEXITY_THRESHOLD) return 'high'
  return 'extreme'
}

function isLogicalBinaryExpression(node: Node): boolean {
  if (!Node.isBinaryExpression(node)) return false
  const binaryExpr = node as BinaryExpression
  const operator = binaryExpr.getOperatorToken().getKind()
  return LOGICAL_OPERATORS.has(operator)
}

/**
 * @stable
 */
export function calculateCyclomaticComplexity(functionNode: FunctionLikeNode): number {
  let complexity = 1

  function visit(node: Node): void {
    if (Node.isIfStatement(node)) {
      complexity += 1
    } else if (Node.isForStatement(node)) {
      complexity += 1
    } else if (Node.isForInStatement(node)) {
      complexity += 1
    } else if (Node.isForOfStatement(node)) {
      complexity += 1
    } else if (Node.isWhileStatement(node)) {
      complexity += 1
    } else if (Node.isDoStatement(node)) {
      complexity += 1
    } else if (Node.isCaseClause(node)) {
      complexity += 1
    } else if (Node.isCatchClause(node)) {
      complexity += 1
    } else if (Node.isConditionalExpression(node)) {
      complexity += 1
    } else if (isLogicalBinaryExpression(node)) {
      complexity += 1
    }

    node.forEachChild(visit)
  }

  functionNode.forEachChild(visit)
  return complexity
}

/**
 * @stable
 */
export function calculateCognitiveComplexity(functionNode: FunctionLikeNode): number {
  let complexity = 0

  function visit(node: Node, nestingDepth: number): void {
    if (Node.isIfStatement(node)) {
      complexity += 1 + nestingDepth
      node.getThenStatement().forEachChild((child) => visit(child, nestingDepth + 1))
      const elseStatement = node.getElseStatement()
      if (elseStatement) {
        elseStatement.forEachChild((child) => visit(child, nestingDepth + 1))
      }

      return
    }

    if (Node.isForStatement(node)) {
      complexity += 1 + nestingDepth
      node.getStatement().forEachChild((child) => visit(child, nestingDepth + 1))
      return
    }

    if (Node.isForInStatement(node)) {
      complexity += 1 + nestingDepth
      node.getStatement().forEachChild((child) => visit(child, nestingDepth + 1))
      return
    }

    if (Node.isForOfStatement(node)) {
      complexity += 1 + nestingDepth
      node.getStatement().forEachChild((child) => visit(child, nestingDepth + 1))
      return
    }

    if (Node.isWhileStatement(node)) {
      complexity += 1 + nestingDepth
      node.getStatement().forEachChild((child) => visit(child, nestingDepth + 1))
      return
    }

    if (Node.isDoStatement(node)) {
      complexity += 1 + nestingDepth
      node.getStatement().forEachChild((child) => visit(child, nestingDepth + 1))
      return
    }

    if (Node.isSwitchStatement(node)) {
      complexity += 1 + nestingDepth
      for (const clause of node
        .getCaseBlock()
        .getClauses()) {
          clause.forEachChild((child) => {
            if (!Node.isCaseClause(child) && !Node.isDefaultClause(child)) {
              visit(child, nestingDepth + 1)
            }
          })
        }

      return
    }

    if (Node.isCaseClause(node)) {
      complexity += 1
      node.forEachChild((child) => visit(child, nestingDepth))
      return
    }

    if (Node.isCatchClause(node)) {
      complexity += 1 + nestingDepth
      node.getBlock().forEachChild((child) => visit(child, nestingDepth + 1))
      return
    }

    if (Node.isConditionalExpression(node)) {
      complexity += 1 + nestingDepth
      node.getWhenTrue().forEachChild((child) => visit(child, nestingDepth + 1))
      node.getWhenFalse().forEachChild((child) => visit(child, nestingDepth + 1))
      return
    }

    if (isLogicalBinaryExpression(node)) {
      complexity += 1
    }

    if (isFunctionLike(node) && node !== functionNode) {
      return
    }

    node.forEachChild((child) => visit(child, nestingDepth))
  }

  functionNode.forEachChild((child) => visit(child, 0))
  return Math.max(complexity, 1)
}

/**
 * @stable
 */
export function analyzeFileComplexity(sourceFile: SourceFile): FunctionComplexity[] {
  const results: FunctionComplexity[] = []
  const filePath = sourceFile.getFilePath()

  function visit(node: Node): void {
    if (isFunctionLike(node)) {
      const functionName = getFunctionName(node)
      const startLine = node.getStartLineNumber()
      const cyclomatic = calculateCyclomaticComplexity(node)
      const cognitive = calculateCognitiveComplexity(node)
      const category = getComplexityCategory(cyclomatic)

      results.push({
        category,
        cognitive,
        cyclomatic,
        filePath,
        functionName,
        startLine,
      })
    }

    node.forEachChild(visit)
  }

  sourceFile.forEachChild(visit)
  return results
}

/**
 * @stable
 */
export function calculateComplexitySummary(
  functions: FunctionComplexity[],
): ComplexityResult['summary'] {
  if (functions.length === 0) {
    return {
      averageCognitive: 0,
      averageCyclomatic: 0,
      categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
      maxCognitive: 0,
      maxCyclomatic: 0,
      totalFunctions: 0,
    }
  }

  let totalCyclomatic = 0
  let totalCognitive = 0
  let maxCyclomatic = 0
  let maxCognitive = 0
  for (const f of functions) {
    totalCyclomatic += f.cyclomatic
    totalCognitive += f.cognitive
    if (f.cyclomatic > maxCyclomatic) maxCyclomatic = f.cyclomatic
    if (f.cognitive > maxCognitive) maxCognitive = f.cognitive
  }

  const categoryBreakdown: Record<ComplexityCategory, number> = {
    extreme: 0,
    high: 0,
    low: 0,
    moderate: 0,
  }

  for (const func of functions) {
    categoryBreakdown[func.category]++
  }

  return {
    averageCognitive: Math.round((totalCognitive / functions.length) * 100) / 100,
    averageCyclomatic: Math.round((totalCyclomatic / functions.length) * 100) / 100,
    categoryBreakdown,
    maxCognitive,
    maxCyclomatic,
    totalFunctions: functions.length,
  }
}
