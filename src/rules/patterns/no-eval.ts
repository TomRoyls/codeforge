import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

function isDirectEvalCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const n = toASTNode(node)
  if (!n) return false
  return isIdentifier(n.callee, 'eval')
}

export const noEvalRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isDirectEvalCall(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: "Unexpected use of 'eval'.",
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Disallow the use of eval() as a global function. eval() can lead to security vulnerabilities and performance issues.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-eval',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noEvalRule
