import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS } from '../../utils/constants.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface RequireTopLevelDescribeOptions {
  readonly describeFunctionNames?: readonly string[]
}

const DEFAULT_DESCRIBE_FUNCTIONS = [...DESCRIBE_FUNCTIONS]

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

function isTestCase(name: string): boolean {
  return name === 'it' || name === 'test'
}

export const requireTopLevelDescribeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<RequireTopLevelDescribeOptions>(
      context.config.options,
      {},
    )

    const describeFunctions = new Set(
      options.describeFunctionNames ?? DEFAULT_DESCRIBE_FUNCTIONS,
    )
    let describeDepth = 0

    return {
      CallExpression(node: unknown): void {
        const functionName = getFunctionName(node)
        if (functionName !== null && describeFunctions.has(functionName)) {
          describeDepth++
          return
        }

        if (describeDepth > 0) return

        if (functionName !== null && isTestCase(functionName)) {
          context.report({
            loc: extractLocation(node),
            message: `All tests must be inside a describe block. Move '${functionName}' call into a describe() block.`,
            node,
          })
        }
      },

      'CallExpression:exit'(node: unknown): void {
        const functionName = getFunctionName(node)
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
        'Require all test cases to be organized inside describe blocks for better test structure',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/require-top-level-describe',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          describeFunctionNames: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default requireTopLevelDescribeRule
