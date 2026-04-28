import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getIdentifierName, toASTNode } from '../../utils/ast-helpers.js'

export const noConstAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const constVariables = new Set<string>()

    return {
      AssignmentExpression(node: unknown): void {
        if (toASTNode(node)?.type !== 'AssignmentExpression') return

        const n = toASTNode(node)
        const name = getIdentifierName(n?.left)
        if (!name) return

        if (constVariables.has(name)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: `Unexpected assignment to const variable '${name}'.`,
          })
        }
      },

      VariableDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'VariableDeclaration' || n.kind !== 'const') return

        const {declarations} = n
        if (!declarations || !Array.isArray(declarations)) return

        for (const decl of declarations) {
          const d = toASTNode(decl)
          const name = getIdentifierName(d?.id)
          if (name) {
            constVariables.add(name)
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Report when a const variable is reassigned. Const variables cannot be reassigned after declaration.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-const-assign',
    },
    fixable: 'code',
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noConstAssignRule
