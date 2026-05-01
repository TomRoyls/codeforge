import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const GLOBAL_IS_NAN = 'isNaN'

export const preferNumberIsnanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'Identifier') return

        if (callee.name !== GLOBAL_IS_NAN) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length !== 1) return

        context.report({
          loc: extractLocation(node),
          message:
            "Use Number.isNaN() instead of global isNaN(). The global isNaN() coerces non-numeric values, which can lead to unexpected results.",
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Enforce using Number.isNaN() over the global isNaN() function for more reliable NaN checks',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-number-isnan',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferNumberIsnanRule
