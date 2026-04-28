import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noNamespaceRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSModuleDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSModuleDeclaration') return

        const isNamespace = n.kind === 'namespace'
        const name = typeof n.id === 'object' && n.id !== null
          ? (toASTNode(n.id)?.name ?? null)
          : null

        if (isNamespace) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected namespace '${name ?? 'anonymous'}'. Use ES modules (import/export) for better tree-shaking and module resolution.`,
          })
          return
        }

        const hasStringId = typeof n.id === 'object' && n.id !== null
          && toASTNode(n.id)?.type === 'Literal'
          && typeof toASTNode(n.id)?.value === 'string'

        if (hasStringId) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected external module augmentation '${name ?? 'unknown'}'. Prefer explicit imports over ambient module declarations.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow TypeScript namespaces and module declarations. Use ES modules (import/export) for better tree-shaking, bundling, and standards compliance.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-namespace',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNamespaceRule
