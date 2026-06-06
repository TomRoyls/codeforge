import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noWithRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      WithStatement(node: unknown): void {
        if (toASTNode(node)?.type !== 'WithStatement') return
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-with.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noWithRule
