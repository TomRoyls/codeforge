import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnsafeArgumentRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        for (const arg of args) {
          const a = toASTNode(arg)
          if (!a) continue

          if (a.type === 'TSAsExpression' || a.type === 'TSTypeAssertion') {
            context.report({
              loc: extractLocation(a),
              message: 'Unsafe type assertion in function argument. This bypasses type safety — consider using a proper type guard instead.',
              node: a,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow unsafe type assertions in function call arguments',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-argument',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnsafeArgumentRule
