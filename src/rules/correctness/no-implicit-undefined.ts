import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noImplicitUndefinedRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const argument = toASTNode((n as { argument?: unknown }).argument)
        if (!argument) return

        if (argument.type !== 'Identifier') return

        const name = (argument as { name?: string }).name
        if (name !== 'undefined') return

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary return of `undefined`. Functions return undefined by default when no value is specified.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow explicit return of undefined where it is implicit',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-implicit-undefined',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noImplicitUndefinedRule
