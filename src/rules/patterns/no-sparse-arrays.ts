import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

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
        const n = toASTNode(node)
        if (!n || n.type !== 'ArrayExpression') return
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-sparse-arrays.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noSparseArraysRule
