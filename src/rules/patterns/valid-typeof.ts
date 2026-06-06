import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const VALID_TYPES = new Set([
  'bigint',
  'boolean',
  'function',
  'number',
  'object',
  'string',
  'symbol',
  'undefined',
])

export const validTypeofRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return
        if (n.operator !== '===' && n.operator !== '!==') return

        let typeofNode: unknown = null
        let valueNode: unknown = null

        const left = toASTNode(n.left)
        const right = toASTNode(n.right)

        if (left?.type === 'UnaryExpression' && left.operator === 'typeof') {
          typeofNode = n.left
          valueNode = n.right
        } else if (right?.type === 'UnaryExpression' && right.operator === 'typeof') {
          typeofNode = n.right
          valueNode = n.left
        }

        if (!typeofNode || !valueNode) return

        const v = toASTNode(valueNode)
        if (!v || v.type !== 'Literal') return
        if (typeof v.value !== 'string') return

        if (!VALID_TYPES.has(v.value)) {
          context.report({
            loc: extractLocation(node),
            message: `Invalid typeof comparison value '${v.value}'.`,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Enforce comparing typeof expressions against valid strings.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/valid-typeof',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default validTypeofRule
