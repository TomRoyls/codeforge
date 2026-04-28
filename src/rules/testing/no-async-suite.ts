import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { DESCRIBE_FUNCTIONS } from '../../utils/constants.js'

const ASYNC_SUITE_MESSAGE =
  'Unexpected async test suite. Use async test cases within the suite instead.'

function getDescribeFunctionName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return null
  }

  const callee = toASTNode(n.callee)
  if (!callee) {
    return null
  }

  // Direct call: describe('title', async () => {})
  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    if (DESCRIBE_FUNCTIONS.has(callee.name)) {
      return callee.name
    }

    return null
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      DESCRIBE_FUNCTIONS.has(object.name)
    ) {
      return object.name
    }

    return null
  }

  return null
}

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
        const functionName = getDescribeFunctionName(node)
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
