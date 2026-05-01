import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isDescribeCall } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface MaxNestedDescribeOptions {
  readonly max?: number
}

const DEFAULT_MAX = 5

export const maxNestedDescribeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<MaxNestedDescribeOptions>(
      context.config.options,
      {},
    )

    const max = options.max ?? DEFAULT_MAX
    let currentDepth = 0
    let maxDepthReached = 0

    return {
      CallExpression(node: unknown): void {
        const functionName = isDescribeCall(node)
        if (functionName === null) return

        currentDepth++
        if (currentDepth > maxDepthReached) {
          maxDepthReached = currentDepth
        }

        if (currentDepth > max) {
          context.report({
            loc: extractLocation(node),
            message: `Too many nested describe blocks (${currentDepth}). Maximum allowed is ${max}.`,
            node,
          })
        }
      },

      'CallExpression:exit'(node: unknown): void {
        const functionName = isDescribeCall(node)
        if (functionName !== null) {
          currentDepth--
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Enforce a maximum depth for nested describe blocks to keep test suites readable',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/max-nested-describe',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          max: {
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default maxNestedDescribeRule
