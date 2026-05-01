/**
 * @module rules/patterns/no-multiple-empty-lines
 * Disallows multiple empty lines in source code.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { toASTNode } from '../../utils/ast-helpers.js'

export const noMultipleEmptyLinesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Program(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const source = context.getSource()
        const lines = source.split('\n')

        let emptyCount = 0
        for (let i = 0; i < lines.length; i++) {
          if (lines[i]!.trim() === '') {
            emptyCount++
            if (emptyCount >= 3) {
              context.report({
                loc: {
                  end: { column: 0, line: i + 1 },
                  start: { column: 0, line: i + 1 },
                },
                message: 'More than 2 empty lines are not allowed.',
                node: n,
              })
            }
          } else {
            emptyCount = 0
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow multiple empty lines',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-multiple-empty-lines',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMultipleEmptyLinesRule
