import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getCallRootName,
  toASTNode,
} from '../../utils/ast-helpers.js'
import { TEST_AND_HOOK_FUNCTIONS } from '../../utils/constants.js'

function containsAwait(node: unknown, visited?: Set<unknown>): boolean {
  if (visited === undefined) visited = new Set()
  if (visited.has(node)) return false
  visited.add(node)

  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'AwaitExpression') return true

  for (const key of Object.keys(n)) {
    const val = (n as Record<string, unknown>)[key]
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (containsAwait(item, visited)) return true
        }
      } else {
        if (containsAwait(val, visited)) return true
      }
    }
  }

  return false
}

export const noMisusedAsyncRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const rootName = getCallRootName(node)
        if (rootName === null || !TEST_AND_HOOK_FUNCTIONS.has(rootName)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const callback = args[args.length - 1]
        if (!callback || typeof callback !== 'object') return

        const cbNode = callback as { type?: string; async?: boolean }
        const isAsync = (cbNode.type === 'ArrowFunctionExpression' || cbNode.type === 'FunctionExpression')
          ? cbNode.async === true
          : false

        if (!isAsync) return

        if (!containsAwait(callback)) {
          context.report({
            loc: extractLocation(node),
            message: `Async '${rootName}' callback has no await expressions. Remove the async keyword or add await.`,
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
        'Disallow async test or hook callbacks that contain no await expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-misused-async',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMisusedAsyncRule
