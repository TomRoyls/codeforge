/**
 * @module rules/patterns/no-underscore-dangle
 * Disallows dangling underscores in identifiers.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnderscoreDangleRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Identifier(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Identifier') return

        const name = (n as { name?: unknown }).name
        if (typeof name !== 'string') return

        const hasLeading = name.startsWith('_') && name !== '_'
        const hasTrailing = name.endsWith('_') && name !== '_'

        if (!hasLeading && !hasTrailing) return

        const position = hasLeading && hasTrailing
          ? 'leading and trailing'
          : hasLeading
            ? 'leading'
            : 'trailing'

        context.report({
          loc: extractLocation(n),
          message: `Unexpected ${position} underscore in identifier '${name}'.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow dangling underscores in identifiers',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-underscore-dangle',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnderscoreDangleRule
