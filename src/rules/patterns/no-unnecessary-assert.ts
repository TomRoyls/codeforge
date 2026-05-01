import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryAssertRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSNonNullExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSNonNullExpression') return

        const nn = n as Record<string, unknown>
        const expression = nn.expression
        if (!expression || typeof expression !== 'object') return
        const expr = expression as Record<string, unknown>

        if (expr.type === 'Literal') {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary non-null assertion on a literal value.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary non-null assertions on literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-assert',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAssertRule
