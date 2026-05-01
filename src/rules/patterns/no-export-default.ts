import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noExportDefaultRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExportDefaultDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExportDefaultDeclaration') return

        context.report({
          loc: extractLocation(n),
          message: 'Unexpected default export.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow default exports',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-export-default',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noExportDefaultRule
