import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { containsNodeType, toASTNode } from '../../utils/ast-helpers.js'

const TEST_CALLBACK_NAMES = new Set([
  'afterAll',
  'afterEach',
  'beforeAll',
  'beforeEach',
  'describe',
  'it',
  'test',
])

const USELESS_ASYNC_MESSAGE =
  'Unexpected async test callback without await. Remove the async keyword or add an await expression.'

function isTestCallbackName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return TEST_CALLBACK_NAMES.has(callee.name) ? callee.name : null
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      TEST_CALLBACK_NAMES.has(object.name)
    ) {
      return object.name
    }
  }

  return null
}

export const noUselessAsyncTestRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const functionName = isTestCallbackName(node)
        if (functionName === null) return

        const n = toASTNode(node)
        if (!n?.arguments || !Array.isArray(n.arguments)) return

        const args = n.arguments
        if (args.length === 0) return

        const callback = args[args.length - 1]
        const callbackNode = toASTNode(callback)

        if (
          !callbackNode ||
          (callbackNode.type !== 'ArrowFunctionExpression' &&
            callbackNode.type !== 'FunctionExpression')
        ) {
          return
        }

        if (callbackNode.async !== true) return

        if (!containsNodeType(callbackNode.body, 'AwaitExpression')) {
          context.report({
            loc: extractLocation(callback),
            message: USELESS_ASYNC_MESSAGE,
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
        'Disallow async test callbacks that contain no await expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-useless-async-test',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessAsyncTestRule
