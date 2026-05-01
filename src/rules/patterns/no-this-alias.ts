/**
 * @module rules/patterns/no-this-alias
 * Disallows assigning `this` to a variable.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noThisAliasRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const init = (n as { init?: unknown }).init
        if (!init) return

        const initNode = toASTNode(init)
        if (!initNode || initNode.type !== 'ThisExpression') return

        context.report({
          loc: extractLocation(n),
          message: "Unexpected aliasing of 'this'. Use arrow functions or bind() instead.",
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: "Disallow aliasing 'this' to a variable",
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-this-alias',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noThisAliasRule
