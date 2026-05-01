import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noInvalidUseBeforeDefRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const id = toASTNode((n as { id?: unknown }).id)
        if (!id || id.type !== 'Identifier') return

        const init = toASTNode((n as { init?: unknown }).init)
        if (!init) return

        if (init.type === 'Identifier') {
          const initName = (init as { name?: string }).name
          const idName = (id as { name?: string }).name
          if (initName !== undefined && idName !== undefined && initName === idName) {
            context.report({
              loc: extractLocation(n),
              message: `Variable \`${idName}\` is assigned to itself. This is likely a mistake.`,
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow variable assignments where the value is the same as the variable name',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-invalid-use-before-def',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noInvalidUseBeforeDefRule
