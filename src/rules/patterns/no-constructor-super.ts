import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noConstructorSuperRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as Record<string, unknown>).callee
        if (!callee || typeof callee !== 'object') return
        const c = callee as Record<string, unknown>

        if (c.type === 'Super') {
          const args = (n as Record<string, unknown>).arguments
          if (Array.isArray(args) && args.length === 0) {
            context.report({
              loc: extractLocation(n),
              message: 'super() call requires arguments when extending a class.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Flag super() calls without arguments in derived classes',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-constructor-super',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConstructorSuperRule
