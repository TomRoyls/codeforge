import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

export const noImportAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const importNames = new Set<string>()

    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AssignmentExpression') return

        if (isIdentifier(n.left)) {
          const left = toASTNode(n.left)
          const name = left?.name
          if (name && importNames.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Import binding '${name}' should not be modified.`,
            })
          }
        }
      },
      ImportDefaultSpecifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (n.local && isIdentifier(n.local)) {
          const local = toASTNode(n.local)
          if (local?.name) {
            importNames.add(local.name)
          }
        }
      },
      ImportNamespaceSpecifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (n.local && isIdentifier(n.local)) {
          const local = toASTNode(n.local)
          if (local?.name) {
            importNames.add(local.name)
          }
        }
      },
      ImportSpecifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ImportSpecifier') return

        if (n.local && isIdentifier(n.local)) {
          const local = toASTNode(n.local)
          if (local?.name) {
            importNames.add(local.name)
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow assignment to import bindings.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-import-assign.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noImportAssignRule
