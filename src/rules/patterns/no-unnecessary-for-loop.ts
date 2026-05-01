import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryForLoopRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ForStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ForStatement') return

        const nn = n as Record<string, unknown>
        const init = nn.init
        const test = nn.test
        const update = nn.update

        if (!init && !test && !update) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary for loop with no init, test, or update. Use a while(true) or refactor.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow for loops with no init, test, or update expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-for-loop',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryForLoopRule
