import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function isImportSpecifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ImportSpecifier'
}

export const noImportAssignRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow assignment to import bindings.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    const importNames = new Set<string>()

    return {
      ImportSpecifier(node: unknown): void {
        if (!isImportSpecifier(node)) return
        const n = node as Record<string, unknown>
        if (n.local && isIdentifier(n.local)) {
          const local = n.local as Record<string, unknown>
          importNames.add(local.name as string)
        }
      },
      ImportDefaultSpecifier(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.local && isIdentifier(n.local)) {
          const local = n.local as Record<string, unknown>
          importNames.add(local.name as string)
        }
      },
      ImportNamespaceSpecifier(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.local && isIdentifier(n.local)) {
          const local = n.local as Record<string, unknown>
          importNames.add(local.name as string)
        }
      },
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.left)) {
          const left = n.left as Record<string, unknown>
          const name = left.name as string
          if (importNames.has(name)) {
            context.report({
              message: `Import binding '${name}' should not be modified.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noImportAssignRule
