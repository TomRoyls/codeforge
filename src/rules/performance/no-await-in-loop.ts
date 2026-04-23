import { SyntaxKind } from 'ts-morph'

import type { RuleDefinition, RuleOptions } from '../types.js'

import {
  type FunctionLikeNode,
  getNodeRange,
  type RuleViolation,
  type VisitorContext,
} from '../../ast/visitor.js'

export interface NoAwaitInLoopOptions extends RuleOptions {}

const LOOP_KINDS = [
  SyntaxKind.ForStatement,
  SyntaxKind.ForInStatement,
  SyntaxKind.ForOfStatement,
  SyntaxKind.WhileStatement,
  SyntaxKind.DoStatement,
]

export const noAwaitInLoopRule: RuleDefinition<NoAwaitInLoopOptions> = {
  create(_options: NoAwaitInLoopOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitFunction(node: FunctionLikeNode, context: VisitorContext) {
          const loops = LOOP_KINDS.flatMap((kind) => node.getDescendantsOfKind(kind))

          for (const loop of loops) {
            const awaitExpressions = loop.getDescendantsOfKind(SyntaxKind.AwaitExpression)

            for (const awaitExpr of awaitExpressions) {
              violations.push({
                filePath: context.getFilePath(),
                message: 'Await inside loop can cause performance issues.',
                range: getNodeRange(awaitExpr),
                ruleId: 'no-await-in-loop',
                severity: 'warning',
                suggestion: 'Consider using Promise.all() with map() for parallel execution.',
              })
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'performance',
    description: 'Disallow await inside of loops for better performance',
    fixable: 'code',
    name: 'no-await-in-loop',
    recommended: true,
  },
}

export function analyzeAwaitInLoop(
  node: FunctionLikeNode,
  context: VisitorContext,
): RuleViolation[] {
  const violations: RuleViolation[] = []

  const loops = LOOP_KINDS.flatMap((kind) => node.getDescendantsOfKind(kind))

  for (const loop of loops) {
    const awaitExpressions = loop.getDescendantsOfKind(SyntaxKind.AwaitExpression)

    for (const awaitExpr of awaitExpressions) {
      violations.push({
        filePath: context.getFilePath(),
        message: 'Await inside loop can cause performance issues.',
        range: getNodeRange(awaitExpr),
        ruleId: 'no-await-in-loop',
        severity: 'warning',
        suggestion: 'Consider using Promise.all() with map() for parallel execution.',
      })
    }
  }

  return violations
}
