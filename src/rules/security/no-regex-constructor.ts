import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRegexConstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee || callee.type !== 'Identifier') return

        const name = (callee as { name?: string }).name
        if (name !== 'RegExp') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const firstArg = toASTNode(args[0])
        if (!firstArg) return

        if (firstArg.type !== 'Literal') {
          context.report({
            loc: extractLocation(n),
            message: 'Dynamic `RegExp()` constructor call with non-literal argument can lead to ReDoS. Use a regex literal instead when the pattern is known.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow RegExp constructor with dynamic arguments that may lead to ReDoS',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-regex-constructor',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRegexConstructorRule
