import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getPropertyName, toASTNode } from '../../utils/ast-helpers.js'

export const preferMockReturnValueRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const methodName = getPropertyName(callee.property)
        if (methodName !== 'mockImplementation' && methodName !== 'mockImplementationOnce') return

        const args = n.arguments
        if (!Array.isArray(args) || args.length === 0) return

        const firstArg = toASTNode(args[0])
        if (!firstArg || firstArg.type !== 'ArrowFunctionExpression') return

        const params = firstArg.params
        if (Array.isArray(params) && params.length > 0) return

        const body = toASTNode(firstArg.body)
        if (!body) return

        // Skip block bodies: () => { return value }
        if (body.type === 'BlockStatement') return

        // Skip call expressions (Promise.resolve, etc.)
        if (body.type === 'CallExpression') return

        // Skip function expressions
        if (body.type === 'ArrowFunctionExpression' || body.type === 'FunctionExpression') return

        const shorthand = methodName === 'mockImplementation'
          ? 'mockReturnValue'
          : 'mockReturnValueOnce'

        context.report({
          loc: extractLocation(node),
          message: `Use ${shorthand}() instead of ${methodName}() to return a simple value`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Prefer mockReturnValue/mockReturnValueOnce over mockImplementation for simple return values',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-mock-return-value',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferMockReturnValueRule
