/**
 * @module rules/patterns/no-restricted-syntax
 * Disallows specified AST node types.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const RESTRICTED_TYPES = new Set([
  'WithStatement',
  'DebuggerStatement',
  'LabeledStatement',
])

export const noRestrictedSyntaxRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      enterNode(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (RESTRICTED_TYPES.has(n.type as string)) {
          context.report({
            loc: extractLocation(n),
            message: `Unexpected '${n.type}' syntax.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow specified syntax',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-restricted-syntax',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRestrictedSyntaxRule
