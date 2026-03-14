/**
 * @fileoverview Prefer Date.now() over new Date().getTime()
 * @module rules/patterns/prefer-date-now
 */

import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  isIdentifier,
} from '../../utils/ast-helpers.js'

function isDateGetTimeCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  const calleeNode = callee as Record<string, unknown>
  const object = calleeNode.object as Record<string, unknown> | undefined
  const property = calleeNode.property as Record<string, unknown> | undefined

  if (!property || property.type !== 'Identifier' || property.name !== 'getTime') {
    return false
  }

  if (!object || object.type !== 'NewExpression') {
    return false
  }

  const newExpr = object as Record<string, unknown>
  const newCallee = newExpr.callee as Record<string, unknown> | undefined

  if (!newCallee || !isIdentifier(newCallee, 'Date')) {
    return false
  }

  const args = newExpr.arguments as unknown[] | undefined
  if (args && args.length > 0) {
    return false
  }

  return true
}

export const preferDateNowRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer Date.now() over new Date().getTime(). Date.now() is more concise and avoids creating an unnecessary Date object.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-date-now',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isDateGetTimeCall(node)) {
          return
        }

        const location = extractLocation(node)
        const n = node as Record<string, unknown>
        const range = n.range as [number, number] | undefined

        context.report({
          message: 'Use Date.now() instead of new Date().getTime().',
          loc: location,
          fix: range
            ? {
                range,
                text: 'Date.now()',
              }
            : undefined,
        })
      },
    }
  },
}

export default preferDateNowRule
