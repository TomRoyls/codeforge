import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier } from '../../utils/ast-helpers.js'

function isNewFuncCall(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>
  const {type} = n

  if (type === 'NewExpression') {
    const callee = n.callee as unknown
    return isIdentifier(callee, 'Function')
  }

  if (type === 'CallExpression') {
    const callee = n.callee as unknown
    return isIdentifier(callee, 'Function')
  }

  return false
}

export const noNewFuncRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (isNewFuncCall(node)) {
          const location = extractLocation(node)

          context.report({
            loc: location,
            message: 'Unexpected use of Function constructor.',
          })
        }
      },
      NewExpression(node: unknown): void {
        if (isNewFuncCall(node)) {
          const location = extractLocation(node)

          context.report({
            loc: location,
            message: 'Unexpected use of Function constructor.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Disallow new Function() and Function() calls. Creating functions at runtime from strings is a security risk similar to eval().',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-new-func',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noNewFuncRule
