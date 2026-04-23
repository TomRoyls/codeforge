import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
  create(context: RuleContext): RuleVisitor {
    const importNames = new Set<string>()

    return {
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.left)) {
          const left = n.left as Record<string, unknown>
          const name = left.name as string
          if (importNames.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Import binding '${name}' should not be modified.`,
            })
          }
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
      ImportSpecifier(node: unknown): void {
        if (!isImportSpecifier(node)) return
        const n = node as Record<string, unknown>
        if (n.local && isIdentifier(n.local)) {
          const local = n.local as Record<string, unknown>
          importNames.add(local.name as string)
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow assignment to import bindings.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noImportAssignRule
