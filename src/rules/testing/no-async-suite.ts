import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isDescribeCall, toASTNode } from '../../utils/ast-helpers.js'

const ASYNC_SUITE_MESSAGE =
  'Unexpected async test suite. Use async test cases within the suite instead.'

function isAsyncFunction(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (
    (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') &&
    n.async === true
  ) {
    return true
  }

  return false
}

export const noAsyncSuiteRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const functionName = isDescribeCall(node)
        if (functionName === null) {
          return
        }

        const n = toASTNode(node)
        if (!n?.arguments || !Array.isArray(n.arguments)) {
          return
        }

        const args = n.arguments
        if (args.length === 0) {
          return
        }

        // eslint-disable-next-line unicorn/prefer-at
        const callback = args[args.length - 1]

        if (isAsyncFunction(callback)) {
          context.report({
            loc: extractLocation(node),
            message: ASYNC_SUITE_MESSAGE,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow async test suites (describe/context/suite) as async should be used in individual test cases instead',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-async-suite.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAsyncSuiteRule
