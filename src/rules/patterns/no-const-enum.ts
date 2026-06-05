import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noConstEnumRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSEnumDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSEnumDeclaration') return

        if (!n.const) return

        const name = typeof n.id === 'object' && n.id !== null
          ? (toASTNode(n.id)?.name ?? 'enum')
          : 'enum'

        context.report({
          loc: extractLocation(node),
          message: `Unexpected const enum '${name}'. Const enums have cross-file compatibility issues with isolatedModules and may cause runtime errors when used across package boundaries.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow const enums. They have cross-file compatibility issues with isolatedModules and bundlers, and may cause unexpected runtime behavior.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-const-enum',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConstEnumRule
