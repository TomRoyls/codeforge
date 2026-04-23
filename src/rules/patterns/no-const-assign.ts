import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getIdentifierName } from '../../utils/ast-helpers.js'

function isVariableDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclaration'
}

function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}

export const noConstAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const constVariables = new Set<string>()

    return {
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const left = n.left as unknown

        const name = getIdentifierName(left)
        if (!name) {
          return
        }

        if (constVariables.has(name)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: `Unexpected assignment to const variable '${name}'.`,
          })
        }
      },

      VariableDeclaration(node: unknown): void {
        if (!isVariableDeclaration(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const kind = n.kind as string | undefined

        if (kind !== 'const') {
          return
        }

        const declarations = n.declarations as undefined | unknown[]
        if (!declarations) {
          return
        }

        for (const decl of declarations) {
          if (!decl || typeof decl !== 'object') {
            continue
          }

          const d = decl as Record<string, unknown>
          const id = d.id as unknown

          const name = getIdentifierName(id)
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
