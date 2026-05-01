import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isBooleanLiteral(node: Record<string, unknown>): boolean {
  return node.type === 'BooleanLiteral' ||
    (node.type === 'Literal' && typeof node.value === 'boolean')
}

export const noUnnecessaryTernaryBooleanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ConditionalExpression') return

        const nn = n as Record<string, unknown>
        const consequent = nn.consequent
        const alternate = nn.alternate
        if (!consequent || !alternate || typeof consequent !== 'object' || typeof alternate !== 'object') return

        const consNode = toASTNode(consequent)
        const altNode = toASTNode(alternate)
        if (!consNode || !altNode) return

        const c = consNode as Record<string, unknown>
        const a = altNode as Record<string, unknown>

        if (isBooleanLiteral(c) && isBooleanLiteral(a)) {
          const cVal = c.value as boolean
          const aVal = a.value as boolean

          if ((cVal === true && aVal === false) || (cVal === false && aVal === true)) {
            context.report({
              loc: extractLocation(n),
              message:
                cVal === true
                  ? 'Unnecessary ternary. Use the condition directly instead of `cond ? true : false`.'
                  : 'Unnecessary ternary. Use `!cond` instead of `cond ? false : true`.',
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
        'Disallow ternary expressions that evaluate to boolean literals.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-ternary-boolean.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTernaryBooleanRule
