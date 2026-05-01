import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  isExpectCallee,
  toASTNode,
} from '../../utils/ast-helpers.js'
import { EQUALITY_MATCHERS } from '../../utils/constants.js'

function isNullLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  return (
    n.type === 'Literal' &&
    'value' in n &&
    (n as { value: unknown }).value === null
  )
}

export const preferToBeNullRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const propertyName = getPropertyName(callee.property)
        if (propertyName === null || !EQUALITY_MATCHERS.has(propertyName)) return

        const args = n.arguments
        if (!Array.isArray(args) || args.length === 0) return

        if (!isNullLiteral(args[0])) return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        if (!isExpectCallee(object.callee)) return

        context.report({
          loc: extractLocation(node),
          message:
            'Use `toBeNull()` instead of `' +
            propertyName +
            '(null)`',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce using toBeNull() over toBe(null) and similar patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-to-be-null',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferToBeNullRule
