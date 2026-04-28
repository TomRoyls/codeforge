import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface MaxNestedDescribeOptions {
  readonly max?: number
}

const DEFAULT_MAX = 5

function getFunctionName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return object.name
    }
  }

  return null
}

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
        const functionName = getFunctionName(node)
        if (functionName === null) return

        if (DESCRIBE_FUNCTIONS.has(functionName)) {
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
        }
      },

      'CallExpression:exit'(node: unknown): void {
        const functionName = getFunctionName(node)
        if (functionName !== null && DESCRIBE_FUNCTIONS.has(functionName)) {
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
