import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange } from '../../utils/ast-helpers.js'

interface ConditionalNode {
  alternate: unknown
  consequent: unknown
  loc?: unknown
  range?: [number, number]
  test: unknown
  type: string
}

function isConditionalExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'ConditionalExpression'
}

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === value
}

function isUnaryExpression(node: unknown, operator: string): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression' && n.operator === operator
}

function isDoubleNegation(node: unknown): boolean {
  if (!isUnaryExpression(node, '!')) {
    return false
  }

  const n = node as Record<string, unknown>
  return isUnaryExpression(n.argument, '!')
}

export const noSimplifiablePatternRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        if (!isConditionalExpression(node)) {
          return
        }

        const n = node as ConditionalNode
        const {test} = n
        const {consequent} = n
        const {alternate} = n

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
  if (!test || typeof test !== 'object') {
    return 'condition'
  }

  const n = test as Record<string, unknown>
  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  return 'condition'
}

export default noSimplifiablePatternRule
