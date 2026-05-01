import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getCallRootName,
  isExpectCall,
  toASTNode,
} from '../../utils/ast-helpers.js'
import { HOOK_FUNCTIONS } from '../../utils/constants.js'

const SNAPSHOT_MATCHERS = new Set([
  'toMatchSnapshot',
  'toThrowErrorMatchingSnapshot',
])

function containsSnapshotCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'CallExpression') {
    if (isExpectCall(node)) return true
    const callee = (n as { callee?: unknown }).callee
    if (callee && typeof callee === 'object') {
      const calleeNode = callee as { type?: string; property?: unknown }
      if (calleeNode.type === 'MemberExpression' && calleeNode.property) {
        const prop = calleeNode.property as { type?: string; name?: string }
        if (prop.type === 'Identifier' && prop.name && SNAPSHOT_MATCHERS.has(prop.name)) {
          return true
        }
      }
    }
  }

  for (const key of Object.keys(n)) {
    const val = (n as Record<string, unknown>)[key]
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (containsSnapshotCall(item)) return true
        }
      } else {
        if (containsSnapshotCall(val)) return true
      }
    }
  }

  return false
}

export const noAsyncSnapshotRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const rootName = getCallRootName(node)
        if (rootName === null || !HOOK_FUNCTIONS.has(rootName)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const callback = args[args.length - 1]
        if (!callback || typeof callback !== 'object') return

        const cbNode = callback as { type?: string; async?: boolean; body?: unknown }
        const isAsync = cbNode.type === 'ArrowFunctionExpression' || cbNode.type === 'FunctionExpression'
          ? cbNode.async === true
          : false

        if (!isAsync) return

        if (containsSnapshotCall(callback)) {
          context.report({
            loc: extractLocation(node),
            message: `Async '${rootName}' hook contains snapshot matchers which can lead to unreliable tests. Use synchronous hooks for snapshot testing.`,
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
        'Disallow snapshot matchers in async test hooks (beforeEach, afterEach, beforeAll, afterAll)',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-async-snapshot',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAsyncSnapshotRule
