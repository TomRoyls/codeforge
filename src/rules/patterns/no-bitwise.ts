import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression } from '../../utils/ast-helpers.js'

const BITWISE_OPERATORS = new Set([
  '&',
  '&=',
  '<<',
  '<<=',
  '>>',
  '>>=',
  '>>>',
  '>>>=',
  '^',
  '^=',
  '|',
  '|=',
  '~',
])

function isBitwiseOperator(operator: string): boolean {
  return BITWISE_OPERATORS.has(operator)
}

export const noBitwiseRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const ruleConfig = context.config.rules?.['no-bitwise']
    const options =
      Array.isArray(ruleConfig) && ruleConfig.length > 1
        ? (ruleConfig[1] as Record<string, unknown>)
        : undefined
    const allowedOperators = new Set((options?.allow as string[]) ?? [])

    return {
      AssignmentExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type === 'AssignmentExpression') {
          const operator = n.operator as string

          if (isBitwiseOperator(operator) && !allowedOperators.has(operator)) {
            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Unexpected use of bitwise assignment operator '${operator}'`,
            })
          }
        }
      },

      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (isBitwiseOperator(operator) && !allowedOperators.has(operator)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: `Unexpected use of bitwise operator '${operator}'. Did you mean to use '${operator === '&' ? '&&' : operator === '|' ? '||' : operator}'?`,
          })
        }
      },

      UnaryExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type === 'UnaryExpression' && n.operator === '~' && !allowedOperators.has('~')) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: "Unexpected use of bitwise NOT operator '~'",
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow bitwise operators (&, |, ^, ~, >>>, etc.). Bitwise operators are often mistaken for logical operators (& vs &&, | vs ||) and can indicate typos.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-bitwise',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            description:
              'List of bitwise operators to allow. Valid values: &, |, ^, ~, <<, >>, >>>, &=, |=, ^=, <<=, >>=, >>>=',
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noBitwiseRule
