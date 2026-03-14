import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isCallExpression, isIdentifier } from '../../utils/ast-helpers.js'

function isDirectEvalCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown

  return isIdentifier(callee, 'eval')
}

export const noEvalRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow the use of eval() as a global function. eval() can lead to security vulnerabilities and performance issues.',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-eval',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isDirectEvalCall(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message: "Unexpected use of 'eval'.",
          loc: location,
        })
      },
    }
  },
}

export default noEvalRule
