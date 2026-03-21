import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isDebuggerStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'DebuggerStatement'
}
export const noDebuggerRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow the use of debugger statements.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      DebuggerStatement(node: unknown): void {
        if (!isDebuggerStatement(node)) return
        context.report({
          message: `Unexpected 'debugger' statement. ${RULE_SUGGESTIONS.useLoggingLibrary}`,
          loc: extractLocation(node),
        })
      },
    }
  },
}
export default noDebuggerRule
