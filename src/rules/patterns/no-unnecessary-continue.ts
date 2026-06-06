import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getParentNode, toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryContinueRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ContinueStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ContinueStatement') return

        const p = getParentNode(n)
        if (!p || p.type !== 'BlockStatement') return

        const blockStatements = p.body
        if (!Array.isArray(blockStatements)) return

        const continueIndex = blockStatements.indexOf(n)
        if (continueIndex === -1) return

        if (continueIndex === blockStatements.length - 1) {
          const bp = getParentNode(p)
          if (
            bp?.type === 'ForStatement' ||
            bp?.type === 'ForInStatement' ||
            bp?.type === 'ForOfStatement' ||
            bp?.type === 'WhileStatement' ||
            bp?.type === 'DoWhileStatement'
          ) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary continue statement at the end of a loop.',
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
      description:
        'Disallow unnecessary continue statements at the end of loop bodies.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-continue.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryContinueRule
