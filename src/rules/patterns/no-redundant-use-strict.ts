import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRedundantUseStrictRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    let hasUseStrict = false

    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExpressionStatement') return

        const expr = (n as Record<string, unknown>).expression
        if (!expr || typeof expr !== 'object') return
        const e = expr as Record<string, unknown>

        if (e.type === 'Literal' && e.value === 'use strict') {
          if (hasUseStrict) {
            context.report({
              loc: extractLocation(n),
              message: 'Redundant "use strict" directive.',
              node: n,
            })
          }
          hasUseStrict = true
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow redundant "use strict" directives',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-redundant-use-strict',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRedundantUseStrictRule
