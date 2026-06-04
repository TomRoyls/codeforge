import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryStringLengthCompareRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        const op = nn.operator
        if (op !== '>' && op !== '>=' && op !== '<' && op !== '<=') return

        const left = nn.left
        const right = nn.right
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return

        const leftNode = toASTNode(left) as Record<string, unknown>
        const rightNode = toASTNode(right) as Record<string, unknown>
        if (!leftNode || !rightNode) return

        const leftIsLengthAccess = isLengthAccess(leftNode)
        const rightIsZero = (rightNode.type === 'NumericLiteral' || (rightNode.type === 'Literal' && typeof (rightNode as Record<string, unknown>).value === 'number')) && (rightNode as Record<string, unknown>).value === 0

        if (leftIsLengthAccess && rightIsZero) {
          if (op === '>') {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary .length > 0 comparison. Use the string directly in a boolean context (truthy check) or .length > 0 can be simplified.',
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
      description:
        'Flag .length > 0 comparisons that could be simplified.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-length-compare.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function isLengthAccess(node: Record<string, unknown>): boolean {
  if (node.type !== 'MemberExpression') return false
  const n = node as Record<string, unknown>
  const prop = n.property
  if (!prop || typeof prop !== 'object') return false
  const propNode = toASTNode(prop) as Record<string, unknown>
  if (!propNode || propNode.type !== 'Identifier') return false
  return propNode.name === 'length'
}

export default noUnnecessaryStringLengthCompareRule
