import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryConsoleStringConcatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const c = calleeNode as Record<string, unknown>
        const obj = c.object
        const prop = c.property
        if (!obj || !prop || typeof obj !== 'object' || typeof prop !== 'object') return

        const objNode = toASTNode(obj) as Record<string, unknown>
        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!objNode || !propNode) return

        if (objNode.type !== 'Identifier' || objNode.name !== 'console') return
        if (propNode.type !== 'Identifier') return
        const methodName = propNode.name as string
        if (methodName !== 'log' && methodName !== 'info' && methodName !== 'warn' && methodName !== 'error') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const arg = args[0]
        if (!arg || typeof arg !== 'object') return

        const argNode = toASTNode(arg) as Record<string, unknown>
        if (!argNode || argNode.type !== 'BinaryExpression') return

        if ((argNode as Record<string, unknown>).operator === '+') {
          context.report({
            loc: extractLocation(n),
            message:
              `Unnecessary string concatenation in console.${methodName}(). Use template literals or pass multiple arguments instead.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow string concatenation in console methods. Use template literals or multiple arguments instead.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-console-string-concat.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryConsoleStringConcatRule
