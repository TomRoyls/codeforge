import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryConcatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const op = (n as { operator?: string }).operator
        if (op !== '+') return

        const left = toASTNode((n as { left?: unknown }).left)
        const right = toASTNode((n as { right?: unknown }).right)
        if (!left || !right) return

        if (left.type === 'Literal' && right.type === 'Literal') {
          const leftVal = (left as { value?: unknown }).value
          const rightVal = (right as { value?: unknown }).value

          if (typeof leftVal === 'string' && typeof rightVal === 'string') {
            context.report({
              loc: extractLocation(n),
              message: `Unnecessary concatenation of two string literals \`"${String(leftVal)}" + "${String(rightVal)}"\`. Use a single string literal instead: \`"${String(leftVal)}${String(rightVal)}"\`.`,
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
      description: 'Disallow unnecessary concatenation of string literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-concat',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryConcatRule
