import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noCjsImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee || callee.type !== 'Identifier') return

        const calleeName = (callee as { name?: string }).name
        if (calleeName !== 'require') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length !== 1) return

        const firstArg = toASTNode(args[0])
        if (!firstArg || firstArg.type !== 'Literal') return

        const argValue = (firstArg as { value?: unknown }).value
        if (typeof argValue !== 'string') return

        context.report({
          loc: extractLocation(n),
          message: `Unexpected CommonJS \`require()\` call. Use ES module \`import\` syntax instead: \`import module from '${argValue}'\`.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description: 'Disallow CommonJS require() calls in ES module files',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-cjs-imports',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noCjsImportsRule
