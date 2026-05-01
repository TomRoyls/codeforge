import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryInitializationRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const init = toASTNode((n as { init?: unknown }).init)
        if (!init) return

        if (init.type !== 'Identifier' && init.type !== 'Literal') return

        if (init.type === 'Identifier') {
          const name = (init as { name?: string }).name
          if (name === 'undefined') {
            context.report({
              loc: extractLocation(n),
              message: 'Unnecessary initialization to `undefined`. Variables are undefined by default when declared without an initializer.',
              node: n,
            })
          }
          return
        }

        if (init.type === 'Literal') {
          const value = (init as { value?: unknown }).value
          if (value === null) {
            context.report({
              loc: extractLocation(n),
              message: 'Unnecessary initialization to `null`. Use explicit `null` only when the intent is to set a non-undefined default.',
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
      description: 'Disallow unnecessary variable initialization to undefined or null',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-initialization',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryInitializationRule
