import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isLiteral } from '../../utils/ast-helpers.js'

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  if (!isLiteral(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  return n.value === value
}

function areNodesEqual(nodeA: unknown, nodeB: unknown): boolean {
  if (!nodeA || !nodeB || typeof nodeA !== 'object' || typeof nodeB !== 'object') {
    return false
  }

  const a = nodeA as Record<string, unknown>
  const b = nodeB as Record<string, unknown>

  // Compare literals by value
  if (a.type === 'Literal' && b.type === 'Literal') {
    return a.value === b.value
  }

  // Compare identifiers by name
  if (a.type === 'Identifier' && b.type === 'Identifier') {
    return a.name === b.name
  }

  // For other types, compare raw source if available
  return a.raw !== undefined && a.raw === b.raw
}

export const noUnneededTernaryRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        if (n.type !== 'ConditionalExpression') {
          return
        }

        const {consequent} = n
        const {alternate} = n

        if (!consequent || !alternate) {
          return
        }

        const location = extractLocation(node)

        // Check for: cond ? true : false
        if (isBooleanLiteral(consequent, true) && isBooleanLiteral(alternate, false)) {
          context.report({
            loc: location,
            message:
              'Unnecessary use of boolean literals in ternary expression. Use `!!condition` or `Boolean(condition)` instead.',
          })
          return
        }

        // Check for: cond ? false : true
        if (isBooleanLiteral(consequent, false) && isBooleanLiteral(alternate, true)) {
          context.report({
            loc: location,
            message:
              'Unnecessary use of boolean literals in ternary expression. Use `!condition` instead.',
          })
          return
        }

        // Check for identical consequent and alternate: cond ? val : val
        if (areNodesEqual(consequent, alternate)) {
          context.report({
            loc: location,
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
        'Disallow ternary expressions that can be simplified. Ternary expressions like `x ? true : false` should use `!!x` or `Boolean(x)`, and `x ? false : true` should use `!x`. Identical branches should be simplified.',
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
