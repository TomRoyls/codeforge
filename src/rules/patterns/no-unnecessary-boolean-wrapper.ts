import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryBooleanWrapperRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'Identifier' || c.name !== 'Boolean') return

        context.report({
          loc: extractLocation(n),
          message:
            'Unnecessary Boolean() call. Use a double negation (!!value) or direct truthiness check instead.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary Boolean() wrapper calls.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-boolean-wrapper.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBooleanWrapperRule
