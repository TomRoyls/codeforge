import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isBooleanLiteral(node: Record<string, unknown>): boolean {
  return node.type === 'BooleanLiteral' || (node.type === 'Literal' && typeof node.value === 'boolean')
}

export const noUnnecessaryBooleanLiteralCompareRule: RuleDefinition = {
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

        if (isBooleanLiteral(left as Record<string, unknown>) || isBooleanLiteral(right as Record<string, unknown>)) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary comparison to boolean literal.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary equality comparisons against boolean literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-boolean-literal-compare',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBooleanLiteralCompareRule
