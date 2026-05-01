import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noTestPrefixRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = context.config?.options?.[0] as { testFunction?: string } | undefined
    const preferredFn = options?.testFunction === 'test' ? 'test' : 'it'
    const disallowedFn = preferredFn === 'it' ? 'test' : 'it'

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'Identifier') return

        if (typeof callee.name === 'string' && callee.name === disallowedFn) {
          context.report({
            loc: extractLocation(node),
            message: `Use '${preferredFn}()' instead of '${disallowedFn}()' for consistency`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Enforce consistent test function naming (it vs test)',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-test-prefix',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          testFunction: {
            enum: ['it', 'test'],
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noTestPrefixRule
