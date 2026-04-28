import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

export const noExAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const catchParamNames = new Set<string>()

    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'AssignmentExpression') return
        if (isIdentifier(n.left)) {
          const name = toASTNode(n.left)?.name
          if (typeof name === 'string' && catchParamNames.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Do not reassign the catch parameter '${name}'.`,
            })
          }
        }
      },
      CatchClause(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'CatchClause') return
        if (n.param && isIdentifier(n.param)) {
          const name = toASTNode(n.param)?.name
          if (typeof name === 'string') catchParamNames.add(name)
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow reassigning exceptions in catch clauses.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noExAssignRule
