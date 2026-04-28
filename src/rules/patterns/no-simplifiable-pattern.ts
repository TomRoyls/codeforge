import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, toASTNode } from '../../utils/ast-helpers.js'

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && n.value === value
}

function isUnaryExpression(node: unknown, operator: string): boolean {
  const n = toASTNode(node)
  return n?.type === 'UnaryExpression' && n.operator === operator
}

function isDoubleNegation(node: unknown): boolean {
  if (!isUnaryExpression(node, '!')) {
    return false
  }

  const n = toASTNode(node)
  return isUnaryExpression(n?.argument, '!')
}

export const noSimplifiablePatternRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ConditionalExpression') {
          return
        }

        const {alternate, consequent, test} = n

        if (
          isDoubleNegation(test) &&
          isBooleanLiteral(consequent, true) &&
          isBooleanLiteral(alternate, false)
        ) {
          const location = extractLocation(node)
          const nodeRange = getRange(node)
          const testRange = getRange(test)

          let fix: undefined | { range: readonly [number, number]; text: string }
          if (nodeRange && testRange) {
            const source = context.getSource()
            const testSource = source.slice(testRange[0], testRange[1])
            fix = {
              range: nodeRange,
              text: testSource,
            }
          }

          context.report({
            data: { test: getTestDescription(test) },
            fix,
            loc: location,
            message:
              'Unnecessary ternary expression. The condition `!!{{test}}` is already a boolean.',
          })
          return
        }

        if (isBooleanLiteral(consequent, true) && isBooleanLiteral(alternate, false)) {
          const location = extractLocation(node)
          const nodeRange = getRange(node)
          const testRange = getRange(test)

          let fix: undefined | { range: readonly [number, number]; text: string }
          if (nodeRange && testRange) {
            const source = context.getSource()
            const testSource = source.slice(testRange[0], testRange[1])
            fix = {
              range: nodeRange,
              text: `!!${testSource}`,
            }
          }

          context.report({
            data: { test: getTestDescription(test) },
            fix,
            loc: location,
            message:
              'Unnecessary ternary expression. Use `!!{{test}}` or `Boolean({{test}})` instead.',
          })
          return
        }

        if (isBooleanLiteral(consequent, false) && isBooleanLiteral(alternate, true)) {
          const location = extractLocation(node)
          const nodeRange = getRange(node)
          const testRange = getRange(test)

          let fix: undefined | { range: readonly [number, number]; text: string }
          if (nodeRange && testRange) {
            const source = context.getSource()
            const testSource = source.slice(testRange[0], testRange[1])
            fix = {
              range: nodeRange,
              text: `!${testSource}`,
            }
          }

          context.report({
            data: { test: getTestDescription(test) },
            fix,
            loc: location,
            message: 'Unnecessary ternary expression. Use `!{{test}}` instead.',
          })
          
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'style',
      description:
        'Disallow ternary expressions that can be simplified to a boolean conversion or negation.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-simplifiable-pattern',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function getTestDescription(test: unknown): string {
  const n = toASTNode(test)
  if (n?.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  return 'condition'
}

export default noSimplifiablePatternRule
