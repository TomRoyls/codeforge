import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

export const noVarRule: RuleDefinition = {
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
            loc: location,
            message: "Use 'let' or 'const' instead of 'var'",
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: "Disallow the use of 'var' declarations. Use 'let' or 'const' instead.",
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-var',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noVarRule
