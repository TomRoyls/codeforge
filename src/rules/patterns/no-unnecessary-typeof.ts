import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTypeofRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '===' && nn.operator !== '!==') return

        const left = nn.left
        const right = nn.right
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return

        const l = left as Record<string, unknown>
        const r = right as Record<string, unknown>

        const isLeftTypeof = l.type === 'UnaryExpression' && l.operator === 'typeof'
        const isRightString = r.type === 'Literal' && typeof r.value === 'string'

        const isRightTypeof = r.type === 'UnaryExpression' && r.operator === 'typeof'
        const isLeftString = l.type === 'Literal' && typeof l.value === 'string'

        if (isLeftTypeof && isRightString) {
          const val = r.value as string
          if (val !== 'undefined' && val !== 'object' && val !== 'function') {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary typeof comparison for '${val}'.`,
              node: n,
            })
          }
        } else if (isRightTypeof && isLeftString) {
          const val = l.value as string
          if (val !== 'undefined' && val !== 'object' && val !== 'function') {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary typeof comparison for '${val}'.`,
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
      description: 'Disallow unnecessary typeof comparisons for primitive types',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-typeof',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTypeofRule
