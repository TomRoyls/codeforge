import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUselessRenameRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ImportSpecifier(node: unknown): void {
        checkRename(node)
      },
      ExportSpecifier(node: unknown): void {
        checkRename(node)
      },
    }

    function checkRename(n: unknown): void {
      const node = toASTNode(n)
      if (!node) return

      const imported = (node as { imported?: unknown }).imported
      const exported = (node as { exported?: unknown }).exported
      const local = (node as { local?: unknown }).local

      const sourceName = getName(imported ?? exported)
      const targetName = getName(local)

      if (sourceName !== null && targetName !== null && sourceName === targetName) {
        context.report({
          loc: extractLocation(node),
          message: `Useless rename of \`${sourceName}\`. The imported/exported name is the same as the local name.`,
          node: node,
        })
      }
    }

    function getName(node: unknown): string | null {
      const n = toASTNode(node)
      if (!n) return null

      if (n.type === 'Identifier') {
        return (n as { name?: string }).name ?? null
      }

      if (n.type === 'Literal') {
        const val = (n as { value?: unknown }).value
        return typeof val === 'string' ? val : null
      }

      return null
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow useless rename in import/export specifiers',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-rename',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessRenameRule
