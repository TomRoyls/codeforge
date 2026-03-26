import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isBinaryExpression } from '../../utils/ast-helpers.js'

const BITWISE_OPERATORS = new Set([
  '&',
  '|',
  '^',
  '~',
  '<<',
  '>>',
  '>>>',
  '&=',
  '|=',
  '^=',
  '<<=',
  '>>=',
  '>>>=',
])

function isBitwiseOperator(operator: string): boolean {
  return BITWISE_OPERATORS.has(operator)
}

export const noBitwiseRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow bitwise operators (&, |, ^, ~, >>>, etc.). Bitwise operators are often mistaken for logical operators (& vs &&, | vs ||) and can indicate typos.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-bitwise',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: { type: 'string' },
            description:
              'List of bitwise operators to allow. Valid values: &, |, ^, ~, <<, >>, >>>, &=, |=, ^=, <<=, >>=, >>>=',
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const ruleConfig = context.config.rules?.['no-bitwise']
    const options =
      Array.isArray(ruleConfig) && ruleConfig.length > 1
        ? (ruleConfig[1] as Record<string, unknown>)
        : undefined
    const allowedOperators = new Set((options?.allow as string[]) ?? [])

    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (isBitwiseOperator(operator) && !allowedOperators.has(operator)) {
          const location = extractLocation(node)
          context.report({
            message: `Unexpected use of bitwise operator '${operator}'. Did you mean to use '${operator === '&' ? '&&' : operator === '|' ? '||' : operator}'?`,
            loc: location,
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
            message: "Unexpected use of bitwise NOT operator '~'",
            loc: location,
          })
        }
      },

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
              message: `Unexpected use of bitwise assignment operator '${operator}'`,
              loc: location,
            })
          }
        }
      },
    }
  },
}

export default noBitwiseRule
