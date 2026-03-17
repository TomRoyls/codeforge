import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isWithStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'WithStatement'
}

export const noWithRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow with statements.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      WithStatement(node: unknown): void {
        if (!isWithStatement(node)) return
        context.report({
          message: "'with' statement is not allowed.",
          loc: extractLocation(node),
        })
      },
    }
  },
}
export default noWithRule
