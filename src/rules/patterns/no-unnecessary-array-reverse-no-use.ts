import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayReverseNoUseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExpressionStatement') return

        const expr = (n as Record<string, unknown>).expression
        if (!expr || typeof expr !== 'object') return

        const exprNode = toASTNode(expr) as Record<string, unknown>
        if (!exprNode || exprNode.type !== 'CallExpression') return

        const callee = exprNode.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const c = calleeNode as Record<string, unknown>
        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!propNode || propNode.type !== 'Identifier') return
        if (propNode.name !== 'reverse') return

        context.report({
          loc: extractLocation(n),
          message:
            'Unnecessary .reverse() as a statement. .reverse() mutates the array in place. The result is discarded. Assign it or use the return value.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Flag .reverse() used as a statement without using the return value.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-reverse-no-use.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryArrayReverseNoUseRule
