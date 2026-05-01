import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const SYNC_EXPRESSION_TYPES = new Set([
  'Literal',
  'Identifier',
  'BinaryExpression',
  'UnaryExpression',
  'LogicalExpression',
  'TemplateLiteral',
  'MemberExpression',
])

export const noUnnecessaryAwaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AwaitExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AwaitExpression') return

        const arg = toASTNode((n as { argument?: unknown }).argument)
        if (!arg) return

        if (arg.type && SYNC_EXPRESSION_TYPES.has(arg.type)) {
          context.report({
            loc: extractLocation(node),
            message: `Unnecessary await on a non-promise value (${arg.type}). Remove the await keyword or ensure the expression returns a Promise.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow await on expressions that are clearly not promises, such as literals, identifiers, and synchronous operators',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-await',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAwaitRule
