import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isIdentifier } from '../../utils/ast-helpers.js'

function isNewFuncCall(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>
  const type = n.type

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow new Function() and Function() calls. Creating functions at runtime from strings is a security risk similar to eval().',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-new-func',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (isNewFuncCall(node)) {
          const location = extractLocation(node)

          context.report({
            message: 'Unexpected use of Function constructor.',
            loc: location,
          })
        }
      },
      CallExpression(node: unknown): void {
        if (isNewFuncCall(node)) {
          const location = extractLocation(node)

          context.report({
            message: 'Unexpected use of Function constructor.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noNewFuncRule
