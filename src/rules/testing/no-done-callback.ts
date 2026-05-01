import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getCallRootName, toASTNode } from '../../utils/ast-helpers.js'
import { TEST_AND_HOOK_FUNCTIONS } from '../../utils/constants.js'

const DONE_CALLBACK_NAMES = new Set(['callback', 'cb', 'done', 'finish', 'finished', 'next'])

function hasDoneCallback(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  if (!n.arguments || !Array.isArray(n.arguments) || n.arguments.length === 0) return null

  // eslint-disable-next-line unicorn/prefer-at
  const callback = n.arguments[n.arguments.length - 1]
  const cb = toASTNode(callback)
  if (!cb) return null

  if (
    (cb.type === 'ArrowFunctionExpression' || cb.type === 'FunctionExpression') &&
    cb.params &&
    Array.isArray(cb.params) &&
    cb.params.length > 0
  ) {
    const firstParam = toASTNode(cb.params[0])
    if (
      firstParam?.type === 'Identifier' &&
      typeof firstParam.name === 'string' &&
      DONE_CALLBACK_NAMES.has(firstParam.name)
    ) {
      return firstParam.name
    }
  }

  return null
}

export const noDoneCallbackRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const callName = getCallRootName(node)
        if (callName === null) return

        if (!TEST_AND_HOOK_FUNCTIONS.has(callName)) return

        const doneParam = hasDoneCallback(node)
        if (doneParam === null) return

        context.report({
          loc: extractLocation(node),
          message: `Unexpected '${doneParam}' callback parameter in ${callName}(). Use async/await instead of the done callback pattern.`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow the use of done callbacks in tests and hooks, encouraging modern async/await patterns instead',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-done-callback.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDoneCallbackRule
