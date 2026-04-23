import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isDebuggerStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'DebuggerStatement'
}

export const noDebuggerRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      DebuggerStatement(node: unknown): void {
        if (!isDebuggerStatement(node)) return
        context.report({
          loc: extractLocation(node),
          message: `Unexpected 'debugger' statement. ${RULE_SUGGESTIONS.useLoggingLibrary}`,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow the use of debugger statements.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDebuggerRule
