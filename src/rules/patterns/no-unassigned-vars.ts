import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isVariableDeclarator(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclarator'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noUnassignedVarsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow variables that are read but never assigned.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        if (!isVariableDeclarator(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          const name = id.name as string
          if (n.init === null || n.init === undefined) {
            context.report({
              message: `Variable '${name}' is never assigned a value.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noUnassignedVarsRule
