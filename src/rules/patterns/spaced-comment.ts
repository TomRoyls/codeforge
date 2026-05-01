/**
 * @module rules/patterns/spaced-comment
 * Requires space after comment markers.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { toASTNode } from '../../utils/ast-helpers.js'

export const spacedCommentRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Program(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const source = context.getSource()
        const lines = source.split('\n')

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!
          const singleIdx = line.indexOf('//')
          if (singleIdx !== -1) {
            const afterMarker = line.substring(singleIdx + 2)
            if (afterMarker.length > 0 && afterMarker[0] !== ' ' && afterMarker[0] !== '\t') {
              context.report({
                loc: {
                  end: { column: singleIdx + 3, line: i + 1 },
                  start: { column: singleIdx, line: i + 1 },
                },
                message: 'Expected space after // comment marker.',
                node: n,
              })
            }
          }

          const multiIdx = line.indexOf('/*')
          if (multiIdx !== -1) {
            const afterMarker = line.substring(multiIdx + 2)
            if (afterMarker.length > 0 && afterMarker[0] !== ' ' && afterMarker[0] !== '\t' && afterMarker[0] !== '*') {
              context.report({
                loc: {
                  end: { column: multiIdx + 3, line: i + 1 },
                  start: { column: multiIdx, line: i + 1 },
                },
                message: 'Expected space after /* comment marker.',
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
      category: 'patterns',
      description: 'Require space after comment markers',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/spaced-comment',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default spacedCommentRule
