import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessarySpreadArrayRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrayExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ArrayExpression') return

        const nn = n as Record<string, unknown>
        const elements = nn.elements
        if (!Array.isArray(elements) || elements.length !== 1) return

        const first = elements[0]
        if (!first || typeof first !== 'object') return

        const spreadNode = toASTNode(first)
        if (!spreadNode || spreadNode.type !== 'SpreadElement') return

        const s = spreadNode as Record<string, unknown>
        const argument = s.argument
        if (!argument || typeof argument !== 'object') return

        const argNode = toASTNode(argument)
        if (!argNode) return

        const a = argNode as Record<string, unknown>
        if (a.type === 'ArrayExpression') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary spread of an array literal into a new array. Use the inner array directly or avoid the redundant wrapping.',
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
        'Disallow unnecessary spread of array literals into new arrays.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-spread-array.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessarySpreadArrayRule
