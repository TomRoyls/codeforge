import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isEnumIdentifier(n: Record<string, unknown>): boolean {
  return n.type === 'Identifier' && typeof n.name === 'string'
}

export const noUnsafeEnumComparisonRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        const op = nn.operator
        if (op !== '===' && op !== '!==' && op !== '==' && op !== '!=') return

        const left = nn.left
        const right = nn.right
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return

        const l = left as Record<string, unknown>
        const r = right as Record<string, unknown>

        if (isEnumIdentifier(l) && r.type === 'Literal' && typeof r.value === 'number') {
          context.report({
            loc: extractLocation(n),
            message: 'Unsafe enum comparison: avoid comparing enum values directly with numbers.',
            node: n,
          })
        }

        if (isEnumIdentifier(r) && l.type === 'Literal' && typeof l.value === 'number') {
          context.report({
            loc: extractLocation(n),
            message: 'Unsafe enum comparison: avoid comparing enum values directly with numbers.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Flag unsafe enum comparisons with numeric literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-enum-comparison',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnsafeEnumComparisonRule
