/**
 * @file Disallow constant binary expressions in conditionals
 * @module rules/correctness/no-constant-binary-expression
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isConstant(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'Literal') {
    return typeof n.value === 'boolean' || typeof n.value === 'number'
  }

  if (n.type === 'UnaryExpression' && n.operator === '!') {
    const arg = toASTNode(n.argument)
    return arg?.type === 'Literal' && typeof arg.value === 'boolean'
  }

  return false
}

function getConstantValue(node: unknown): unknown {
  const n = toASTNode(node)
  if (!n) return undefined

  if (n.type === 'Literal') {
    return n.value
  }

  if (n.type === 'UnaryExpression' && n.operator === '!') {
    const argument = toASTNode(n.argument)
    return argument?.type === 'Literal' ? !argument.value : undefined
  }

  return undefined
}

function isBinaryOperator(operator: unknown): operator is string {
  return operator === '===' || operator === '!=='
}

export const noConstantBinaryExpressionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (!isBinaryOperator(n.operator)) {
          return
        }

        const {left} = n
        const {right} = n

        const leftIsConstant = isConstant(left)
        const rightIsConstant = isConstant(right)

        if (!leftIsConstant && !rightIsConstant) {
          return
        }

        const constantSide = leftIsConstant ? 'left' : 'right'
        const constantValue = leftIsConstant ? getConstantValue(left) : getConstantValue(right)

        context.report({
          loc: extractLocation(node),
          message: `Unexpected comparison with constant ${typeof constantValue === 'boolean' ? 'boolean' : 'numeric'} value (${constantValue}) on the ${constantSide} side. This is likely a mistake. Use the variable directly or fix the comparison.`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description:
        'Disallow comparisons with constant binary values (true/false, 0/1). These are likely mistakes where a variable was intended, the boolean literal. Use the variable directly or fix the comparison.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-constant-binary-expression',
    },
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}
