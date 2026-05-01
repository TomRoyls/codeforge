import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryUndefinedReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const nn = n as Record<string, unknown>
        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = toASTNode(argument)
        if (!arg) return

        const a = arg as Record<string, unknown>
        if (a.type === 'Identifier' && a.name === 'undefined') {
          context.report({
            loc: extractLocation(arg),
            message:
              'Unnecessary return of undefined. Remove the argument or the entire return statement.',
            node: arg,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow explicit return of undefined which is unnecessary.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-undefined-return.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryUndefinedReturnRule
