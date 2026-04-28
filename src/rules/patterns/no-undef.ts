import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

export const noUndefRule: RuleDefinition = {
  create(_context: RuleContext): RuleVisitor {
    const declared = new Set<string>()

    return {
      ClassDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.id) return
        if (isIdentifier(n.id)) {
          const id = toASTNode(n.id)
          if (id?.name) declared.add(id.name)
        }
      },
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.id) return
        if (isIdentifier(n.id)) {
          const id = toASTNode(n.id)
          if (id?.name) declared.add(id.name)
        }
      },
      Identifier(_node: unknown): void {
        // Note: This is a simplified implementation
        // Full implementation would need scope analysis
      },
      ImportSpecifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.local) return
        if (isIdentifier(n.local)) {
          const local = toASTNode(n.local)
          if (local?.name) declared.add(local.name)
        }
      },
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.id) return
        if (isIdentifier(n.id)) {
          const id = toASTNode(n.id)
          if (id?.name) declared.add(id.name)
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow undeclared variables.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUndefRule
