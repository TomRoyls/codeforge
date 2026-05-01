import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNumericSeparatorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const nn = n as Record<string, unknown>
        const raw = nn.raw
        if (typeof raw !== 'string') return

        if (raw.includes('_') && typeof nn.value === 'number') {
          const num = nn.value as number
          if (num < 1000 && num > -1000 && num === Math.trunc(num)) {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary numeric separator in '${raw}'.`,
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
      description: 'Disallow unnecessary numeric separators in small numbers',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-numeric-separator',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNumericSeparatorRule
