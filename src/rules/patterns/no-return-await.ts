import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noReturnAwaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const {argument} = n

        if (!argument) {
          return
        }

        if (toASTNode(argument)?.type === 'AwaitExpression') {
          const location = extractLocation(argument)
          context.report({
            loc: location,
            message:
              'Unnecessary return await. Return the Promise directly for better performance, or keep await only if you need to catch errors at this level.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary return await. In async functions, return await is redundant and slightly slower than returning the Promise directly.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-return-await',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noReturnAwaitRule
