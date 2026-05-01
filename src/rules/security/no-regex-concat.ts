import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRegexConcatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee || (callee as { type?: string }).type !== 'Identifier') return

        const calleeName = (callee as { name?: string }).name
        if (calleeName !== 'RegExp') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const firstArg = args[0]
        if (!firstArg) return

        const argNode = toASTNode(firstArg)
        if (!argNode) return

        if (argNode.type === 'BinaryExpression') {
          const op = (argNode as { operator?: string }).operator
          if (op === '+') {
            const left = (argNode as { left?: unknown }).left
            const right = (argNode as { right?: unknown }).right
            const leftIsStr = left && (left as { type?: string }).type === 'StringLiteral'
            const rightIsStr = right && (right as { type?: string }).type === 'StringLiteral'
            if (leftIsStr || rightIsStr) {
              context.report({
                loc: extractLocation(n),
                message: 'Avoid concatenating strings to build regex patterns. Use a single string literal or template for clarity and correctness.',
                node: n,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow string concatenation in RegExp constructor',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-regex-concat',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRegexConcatRule
