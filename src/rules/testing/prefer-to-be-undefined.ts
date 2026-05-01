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

function isUndefinedIdentifier(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  return (
    n.type === 'Identifier' &&
    'name' in n &&
    (n as { name: unknown }).name === 'undefined'
  )
}

export const preferToBeUndefinedRule: RuleDefinition = {
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

        if (!isUndefinedIdentifier(args[0])) return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'CallExpression') return

        if (!isExpectCallee(object.callee)) return

        context.report({
          loc: extractLocation(node),
          message:
            'Use `toBeUndefined()` instead of `' +
            propertyName +
            '(undefined)`',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce using toBeUndefined() over toBe(undefined) and similar patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-to-be-undefined',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferToBeUndefinedRule
