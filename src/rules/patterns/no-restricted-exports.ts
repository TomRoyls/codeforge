import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRestrictedExportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExportNamedDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExportNamedDeclaration') return

        const specifiers = (n as Record<string, unknown>).specifiers
        if (!Array.isArray(specifiers)) return

        for (const spec of specifiers) {
          if (!spec || typeof spec !== 'object') continue
          const s = spec as Record<string, unknown>
          if (s.type !== 'ExportSpecifier') continue

          const exported = s.exported
          if (!exported || typeof exported !== 'object') continue
          const exp = exported as Record<string, unknown>

          if (exp.type === 'Identifier' && exp.name === 'default') {
            context.report({
              loc: extractLocation(n),
              message: 'Unexpected export of "default" via named export.',
              node: n,
            })
            return
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow exporting the name "default" via named exports',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-restricted-exports',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRestrictedExportsRule
