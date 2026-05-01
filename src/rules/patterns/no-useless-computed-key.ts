/**
 * @module rules/patterns/no-useless-computed-key
 * Disallows unnecessary computed property keys in objects and classes.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUselessComputedKeyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Property(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Property') return

        const computed = (n as { computed?: unknown }).computed
        if (!computed) return

        const key = (n as { key?: unknown }).key
        if (!key || typeof key !== 'object') return

        const keyNode = key as Record<string, unknown>
        if (keyNode.type !== 'Identifier' && keyNode.type !== 'StringLiteral') return

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary computed property key. Use a literal key instead.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary computed property keys',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-computed-key',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessComputedKeyRule
