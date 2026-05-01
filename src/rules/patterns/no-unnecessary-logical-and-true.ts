import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isTrueLiteral(node: Record<string, unknown>): boolean {
  return node.type === 'BooleanLiteral' && node.value === true
}

export const noUnnecessaryLogicalAndTrueRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '&&') return

        const right = nn.right
        if (!right || typeof right !== 'object') return

        const rightNode = toASTNode(right)
        if (!rightNode) return

        const r = rightNode as Record<string, unknown>

        if (isTrueLiteral(r)) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary `&& true`. Use `!!leftOperand` or the condition directly.',
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
        'Disallow unnecessary logical AND with true (`x && true`).',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-logical-and-true.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryLogicalAndTrueRule
