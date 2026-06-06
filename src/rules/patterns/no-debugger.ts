import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

export const noDebuggerRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      DebuggerStatement(node: unknown): void {
        if (toASTNode(node)?.type !== 'DebuggerStatement') return
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-debugger.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDebuggerRule
