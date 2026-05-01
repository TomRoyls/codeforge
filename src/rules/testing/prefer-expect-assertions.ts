import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getCallRootName,
  getPropertyName,
  toASTNode,
} from '../../utils/ast-helpers.js'
import { TEST_CASE_FUNCTIONS } from '../../utils/constants.js'

function containsExpectAssertions(node: unknown, visited?: Set<unknown>): boolean {
  if (visited === undefined) visited = new Set()
  if (visited.has(node)) return false
  visited.add(node)

  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'CallExpression') {
    const callee = (n as { callee?: unknown }).callee
    if (callee && typeof callee === 'object') {
      const calleeNode = callee as { type?: string; object?: unknown; property?: unknown }
      if (calleeNode.type === 'MemberExpression') {
        const obj = calleeNode.object as { type?: string; callee?: unknown; name?: string }
        const isExpectObject =
          (obj.type === 'Identifier' && obj.name === 'expect') ||
          (obj.type === 'CallExpression' &&
            (obj.callee as { type?: string; name?: string })?.type === 'Identifier' &&
            (obj.callee as { type?: string; name?: string })?.name === 'expect')

        if (isExpectObject) {
          const propName = getPropertyName(calleeNode.property)
          if (propName === 'assertions' || propName === 'hasAssertions') {
            return true
          }
        }
      }
    }
  }

  for (const key of Object.keys(n)) {
    const val = (n as Record<string, unknown>)[key]
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (containsExpectAssertions(item, visited)) return true
        }
      } else {
        if (containsExpectAssertions(val, visited)) return true
      }
    }
  }

  return false
}

function containsExpectCall(node: unknown, visited?: Set<unknown>): boolean {
  if (visited === undefined) visited = new Set()
  if (visited.has(node)) return false
  visited.add(node)

  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'CallExpression') {
    const callee = (n as { callee?: unknown }).callee
    if (callee && typeof callee === 'object') {
      const calleeNode = callee as { type?: string; name?: string }
      if (calleeNode.type === 'Identifier' && calleeNode.name === 'expect') {
        return true
      }
    }
  }

  for (const key of Object.keys(n)) {
    const val = (n as Record<string, unknown>)[key]
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (containsExpectCall(item, visited)) return true
        }
      } else {
        if (containsExpectCall(val, visited)) return true
      }
    }
  }

  return false
}

export const preferExpectAssertionsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const rootName = getCallRootName(node)
        if (rootName === null || !TEST_CASE_FUNCTIONS.has(rootName)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const callback = args[args.length - 1]
        if (!callback || typeof callback !== 'object') return

        const cbNode = callback as { type?: string; async?: boolean }
        const isAsync = (cbNode.type === 'ArrowFunctionExpression' || cbNode.type === 'FunctionExpression')
          ? cbNode.async === true
          : false

        if (!isAsync) return

        const hasAssertions = containsExpectAssertions(callback)
        const hasExpect = containsExpectCall(callback)

        if (hasExpect && !hasAssertions) {
          context.report({
            loc: extractLocation(node),
            message: `async tests should include expect.assertions(n) or expect.hasAssertions() to verify the number of assertions.`,
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
        'Prefer using expect.assertions() or expect.hasAssertions() in async tests to verify assertion count',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-expect-assertions',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferExpectAssertionsRule
