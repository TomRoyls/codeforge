import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isArrayExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ArrayExpression'
}

function hasHole(elements: unknown[]): boolean {
  for (const el of elements) {
    if (el === null) return true
  }
  return false
}

export const noSparseArraysRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow sparse arrays.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      ArrayExpression(node: unknown): void {
        if (!isArrayExpression(node)) return
        const n = node as Record<string, unknown>
        const elements = n.elements
        if (Array.isArray(elements) && hasHole(elements)) {
          context.report({
            message: 'Unexpected sparse array.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noSparseArraysRule
