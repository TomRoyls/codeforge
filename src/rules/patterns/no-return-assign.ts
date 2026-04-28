import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isReturnAssignment(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'ReturnStatement') return false

  const argument = toASTNode(n.argument)
  if (!argument) return false

  return argument.type === 'AssignmentExpression'
}

export const noReturnAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        if (!isReturnAssignment(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: 'Return statement should not contain assignment.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow assignment operators in return statements. Return statements like `return a = b` are confusing - did you mean to assign or compare? Always assign before returning.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-return-assign',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noReturnAssignRule
