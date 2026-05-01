import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryInstanceofArrayRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== 'instanceof') return

        const right = nn.right
        if (!right || typeof right !== 'object') return

        const r = right as Record<string, unknown>
        if (r.type !== 'Identifier' || r.name !== 'Array') return

        const left = nn.left
        if (!left || typeof left !== 'object') return

        const l = left as Record<string, unknown>
        if (l.type === 'ArrayExpression') {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary instanceof Array check on an array literal. It always returns true.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary instanceof Array checks on array literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-instanceof-array',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryInstanceofArrayRule
