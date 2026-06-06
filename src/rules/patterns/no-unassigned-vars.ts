import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnassignedVarsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'VariableDeclarator') return

        const id = toASTNode(n.id)
        if (id?.type !== 'Identifier') return

        if (n.init === null || n.init === undefined) {
          const name = typeof id.name === 'string' ? id.name : 'unknown'
          context.report({
            loc: extractLocation(node),
            message: `Variable '${name}' is never assigned a value.`,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow variables that are read but never assigned.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-unassigned-vars.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnassignedVarsRule
