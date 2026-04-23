import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isWithStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'WithStatement'
}

export const noWithRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      WithStatement(node: unknown): void {
        if (!isWithStatement(node)) return
        context.report({
          loc: extractLocation(node),
          message: "'with' statement is not allowed.",
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow with statements.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noWithRule
