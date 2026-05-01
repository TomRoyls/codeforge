import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getCallRootName } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoNestedDescribeOptions {
  readonly describeFunctionNames?: readonly string[]
  readonly maxDepth?: number
}

const DEFAULT_DESCRIBE_FUNCTIONS = [...DESCRIBE_FUNCTIONS]

export const noNestedDescribeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoNestedDescribeOptions>(
      context.config.options,
      {},
    )

    const describeFunctions = new Set(
      options.describeFunctionNames ?? DEFAULT_DESCRIBE_FUNCTIONS,
    )
    const maxDepth = options.maxDepth ?? 5
    let describeDepth = 0

    return {
      CallExpression(node: unknown): void {
        const functionName = getCallRootName(node)
        if (functionName !== null && describeFunctions.has(functionName)) {
          describeDepth++
          if (describeDepth > maxDepth) {
            context.report({
              loc: extractLocation(node),
              message: `Too many nested describe blocks (depth ${describeDepth}). Maximum allowed depth is ${maxDepth}. Consider flattening your test structure.`,
              node,
            })
          }
        }
      },

      'CallExpression:exit'(node: unknown): void {
        const functionName = getCallRootName(node)
        if (functionName !== null && describeFunctions.has(functionName)) {
          describeDepth--
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow excessively nested describe blocks to maintain readable test structure',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-nested-describe',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          describeFunctionNames: {
            items: { type: 'string' },
            type: 'array',
          },
          maxDepth: {
            minimum: 1,
            type: 'integer',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNestedDescribeRule
