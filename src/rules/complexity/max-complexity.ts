import type { Node, BinaryExpression, SourceFile } from 'ts-morph'
import { Node as TsNode } from 'ts-morph'
import type { RuleDefinition, RuleOptions } from '../types.js'
import {
  type FunctionLikeNode,
  type RuleViolation,
  getNodeRange,
  getFunctionName,
  traverseAST,
} from '../../ast/visitor.js'

interface MaxComplexityOptions extends RuleOptions {
  max?: number
}

function isLogicalOperator(node: BinaryExpression): boolean {
  const operator = node.getOperatorToken().getKind()
  return operator === 56 || operator === 57
}

function calculateFunctionComplexity(node: FunctionLikeNode): number {
  let complexity = 1

  function visit(child: Node): void {
    if (
      TsNode.isIfStatement(child) ||
      TsNode.isForStatement(child) ||
      TsNode.isForInStatement(child) ||
      TsNode.isForOfStatement(child) ||
      TsNode.isWhileStatement(child) ||
      TsNode.isDoStatement(child) ||
      TsNode.isCatchClause(child) ||
      TsNode.isConditionalExpression(child)
    ) {
      complexity += 1
    }

    if (TsNode.isCaseClause(child)) {
      complexity += 1
    }

    if (TsNode.isBinaryExpression(child) && isLogicalOperator(child)) {
      complexity += 1
    }

    child.forEachChild(visit)
  }

  node.forEachChild(visit)
  return complexity
}

export const maxComplexityRule: RuleDefinition<MaxComplexityOptions> = {
  meta: {
    name: 'max-complexity',
    description: 'Enforce a maximum cyclomatic complexity threshold for functions',
    category: 'complexity',
    recommended: true,
  },
  defaultOptions: {
    max: 10,
  },
  create: (options: MaxComplexityOptions) => {
    const violations: RuleViolation[] = []
    const maxComplexity = options.max ?? 10

    return {
      visitor: {
        visitFunction: (node: FunctionLikeNode) => {
          const complexity = calculateFunctionComplexity(node)
          const name = getFunctionName(node)

          if (complexity > maxComplexity) {
            const range = getNodeRange(node)
            violations.push({
              ruleId: 'max-complexity',
              severity: 'warning',
              message: `Function '${name}' has a complexity of ${complexity}. Maximum allowed is ${maxComplexity}.`,
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion:
                'Consider breaking this function into smaller, single-responsibility functions.',
            })
          }
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzeComplexity(
  sourceFile: SourceFile,
  maxComplexity: number = 10,
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitFunction: (node: FunctionLikeNode) => {
        const complexity = calculateFunctionComplexity(node)
        const name = getFunctionName(node)

        if (complexity > maxComplexity) {
          const range = getNodeRange(node)
          violations.push({
            ruleId: 'max-complexity',
            severity: 'warning',
            message: `Function '${name}' has a complexity of ${complexity}. Maximum allowed is ${maxComplexity}.`,
            filePath: sourceFile.getFilePath(),
            range,
            suggestion:
              'Consider breaking this function into smaller, single-responsibility functions.',
          })
        }
      },
    },
    violations,
  )

  return violations
}
