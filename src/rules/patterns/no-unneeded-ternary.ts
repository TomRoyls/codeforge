import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isLiteral } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow ternary expressions that can be simplified. Ternary expressions like `x ? true : false` should use `!!x` or `Boolean(x)`, and `x ? false : true` should use `!x`. Identical branches should be simplified.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unneeded-ternary',
    },
    schema: [],
    fixable: undefined,
  },

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

        const consequent = n.consequent
        const alternate = n.alternate

        if (!consequent || !alternate) {
          return
        }

        const location = extractLocation(node)

        // Check for: cond ? true : false
        if (isBooleanLiteral(consequent, true) && isBooleanLiteral(alternate, false)) {
          context.report({
            message:
              'Unnecessary use of boolean literals in ternary expression. Use `!!condition` or `Boolean(condition)` instead.',
            loc: location,
          })
          return
        }

        // Check for: cond ? false : true
        if (isBooleanLiteral(consequent, false) && isBooleanLiteral(alternate, true)) {
          context.report({
            message:
              'Unnecessary use of boolean literals in ternary expression. Use `!condition` instead.',
            loc: location,
          })
          return
        }

        // Check for identical consequent and alternate: cond ? val : val
        if (areNodesEqual(consequent, alternate)) {
          context.report({
            message:
              'Unnecessary ternary expression with identical consequent and alternate branches.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noUnneededTernaryRule
