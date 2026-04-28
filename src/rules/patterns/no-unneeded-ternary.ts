import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isBooleanLiteral(n: ReturnType<typeof toASTNode>): boolean {
  if (!n) return false
  return n.type === 'Literal' && typeof n.value === 'boolean'
}

function getBooleanValue(n: ReturnType<typeof toASTNode>): boolean | null {
  if (!n) return null
  if (n.type === 'Literal' && typeof n.value === 'boolean') return n.value
  return null
}

function nodesAreEqual(a: ReturnType<typeof toASTNode>, b: ReturnType<typeof toASTNode>, rawA?: unknown, rawB?: unknown): boolean {
  if (!a || !b) return false
  if (a.type === 'Identifier' && b.type === 'Identifier') return a.name === b.name
  if (a.type === 'Literal' && b.type === 'Literal') return a.value === b.value
  if (typeof rawA === 'string' && typeof rawB === 'string' && rawA === rawB) return true
  return false
}

export const noUnneededTernaryRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ConditionalExpression') return

        const consequent = toASTNode(n.consequent)
        const alternate = toASTNode(n.alternate)

        if (isBooleanLiteral(consequent) && isBooleanLiteral(alternate)) {
          const consVal = getBooleanValue(consequent)
          const altVal = getBooleanValue(alternate)

          if (consVal === true && altVal === false) {
            context.report({
              loc: extractLocation(node),
              message:
                'Unnecessary use of boolean literals in ternary expression. Use `!!condition` or `Boolean(condition)` instead.',
            })
            return
          }

          if (consVal === false && altVal === true) {
            context.report({
              loc: extractLocation(node),
              message:
                'Unnecessary use of boolean literals in ternary expression. Use `!condition` instead.',
            })
            return
          }
        }

        const rawCons = typeof n.consequent === 'object' && n.consequent !== null
          ? (n.consequent as Record<string, unknown>).raw
          : undefined
        const rawAlt = typeof n.alternate === 'object' && n.alternate !== null
          ? (n.alternate as Record<string, unknown>).raw
          : undefined

        if (nodesAreEqual(consequent, alternate, rawCons, rawAlt)) {
          context.report({
            loc: extractLocation(node),
          message:
            'Unnecessary ternary expression with identical consequent and alternate branches.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary ternary expressions that can be simplified to a direct value or boolean coercion.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unneeded-ternary',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnneededTernaryRule
