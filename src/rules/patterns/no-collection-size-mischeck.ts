import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const SIZE_PROPERTIES: ReadonlySet<string> = new Set(['length', 'size'])

function isSizeProperty(node: ReturnType<typeof toASTNode>): boolean {
  if (!node || node.type !== 'MemberExpression' || node.computed) return false
  const prop = toASTNode(node.property)
  if (prop?.type === 'Identifier' && prop.name) {
    return SIZE_PROPERTIES.has(prop.name)
  }

  return false
}

function isNegativeLiteral(node: ReturnType<typeof toASTNode>): boolean {
  if (!node) return false
  if (node.type === 'UnaryExpression' && node.operator === '-') {
    const arg = toASTNode(node.argument)
    if (arg?.type === 'Literal' && typeof arg.value === 'number' && arg.value > 0) {
      return true
    }
  }

  return false
}

export const noCollectionSizeMischeckRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const op = n.operator
        if (op !== '<' && op !== '<=' && op !== '>' && op !== '>=' && op !== '===' && op !== '==' && op !== '!==' && op !== '!=') return

        const left = toASTNode(n.left)
        const right = toASTNode(n.right)

        if (isSizeProperty(left) && isNegativeLiteral(right)) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected comparison of collection size with a negative number. Collection sizes are always non-negative, making this comparison always ${op === '>' || op === '>=' || op === '!==' || op === '!=' ? 'true' : 'false'}.`,
          })
          return
        }

        if (isNegativeLiteral(left) && isSizeProperty(right)) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected comparison of a negative number with collection size. Collection sizes are always non-negative, making this comparison always ${op === '<' || op === '<=' || op === '!==' || op === '!=' ? 'true' : 'false'}.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow comparisons of collection sizes (.length, .size) with negative numbers. Collection sizes are always non-negative.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-collection-size-mischeck',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noCollectionSizeMischeckRule
