import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression'
}

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

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
        if (!isBinaryExpression(node)) return
        const n = node as Record<string, unknown>
        if (n.operator !== '===' && n.operator !== '!==') return

        let typeofNode: unknown = null
        let valueNode: unknown = null

        if (
          isUnaryExpression(n.left) &&
          (n.left as Record<string, unknown>).operator === 'typeof'
        ) {
          typeofNode = n.left
          valueNode = n.right
        } else if (
          isUnaryExpression(n.right) &&
          (n.right as Record<string, unknown>).operator === 'typeof'
        ) {
          typeofNode = n.right
          valueNode = n.left
        }

        if (!typeofNode || !valueNode) return
        if (!isLiteral(valueNode)) return
        const v = valueNode as Record<string, unknown>
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
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default validTypeofRule
