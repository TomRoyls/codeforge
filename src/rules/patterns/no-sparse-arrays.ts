import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
  create(context: RuleContext): RuleVisitor {
    return {
      ArrayExpression(node: unknown): void {
        if (!isArrayExpression(node)) return
        const n = node as Record<string, unknown>
        const {elements} = n
        if (Array.isArray(elements) && hasHole(elements)) {
          context.report({
            loc: extractLocation(node),
            message: 'Unexpected sparse array.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow sparse arrays.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noSparseArraysRule
