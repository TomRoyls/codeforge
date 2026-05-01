import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryYieldRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      YieldExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'YieldExpression') return

        const nn = n as Record<string, unknown>
        const argument = nn.argument

        if (argument === null || argument === undefined) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary yield without a value. Use return instead.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow yield expressions without a value which can be replaced with return.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-yield.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryYieldRule
