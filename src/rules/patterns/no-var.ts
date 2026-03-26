import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

export const noVarRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: "Disallow the use of 'var' declarations. Use 'let' or 'const' instead.",
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-var',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.kind === 'var') {
          const location = extractLocation(node)
          context.report({
            message: "Use 'let' or 'const' instead of 'var'",
            loc: location,
          })
        }
      },
    }
  },
}

export default noVarRule
