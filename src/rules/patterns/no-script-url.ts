/**
 * @module rules/patterns/no-script-url
 * Disallows javascript: URLs.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noScriptUrlRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      StringLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'StringLiteral') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        if (value.toLowerCase().startsWith('javascript:')) {
          context.report({
            loc: extractLocation(n),
            message: 'Unexpected javascript: URL.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow javascript: URLs',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-script-url',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noScriptUrlRule
