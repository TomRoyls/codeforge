import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noDynamicImportRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee) return

        if (callee.type !== 'Import') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const firstArg = toASTNode(args[0])
        if (!firstArg || firstArg.type !== 'Literal') return

        const value = (firstArg as { value?: unknown }).value
        if (typeof value !== 'string') return

        context.report({
          loc: extractLocation(n),
          message: `Dynamic import detected for \`${value}\`. Use a static import statement instead for better tree-shaking and static analysis.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description: 'Disallow dynamic import() expressions in favor of static imports',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-dynamic-import',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDynamicImportRule
