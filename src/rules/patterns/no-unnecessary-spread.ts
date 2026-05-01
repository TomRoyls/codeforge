import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessarySpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SpreadElement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'SpreadElement') return

        const nn = n as Record<string, unknown>
        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = argument as Record<string, unknown>
        if (arg.type === 'ArrayExpression') {
          const elements = arg.elements
          if (Array.isArray(elements) && elements.length === 1) {
            context.report({
              loc: extractLocation(n),
              message: 'Unnecessary spread of single-element array.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary spread of single-element arrays',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-spread',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessarySpreadRule
