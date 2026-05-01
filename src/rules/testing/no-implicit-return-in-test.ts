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
import { TEST_CASE_FUNCTIONS } from '../../utils/constants.js'

export const noImplicitReturnInTestRule: RuleDefinition = {
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

        const cbNode = callback as { type?: string; body?: unknown; expression?: unknown }
        if (cbNode.type !== 'ArrowFunctionExpression') return

        const body = cbNode.body
        if (!body || typeof body !== 'object') return

        const bodyNode = body as { type?: string }
        if (bodyNode.type === 'BlockStatement') return

        if (bodyNode.type === 'CallExpression') {
          const callee = (bodyNode as { callee?: unknown }).callee
          if (callee && typeof callee === 'object') {
            const calleeNode = callee as { type?: string; object?: unknown; property?: unknown }
            if (calleeNode.type === 'MemberExpression') {
              const obj = calleeNode.object as { type?: string; callee?: unknown; name?: string }
              if (obj.type === 'CallExpression') {
                const innerCallee = obj.callee as { type?: string; name?: string }
                if (innerCallee.type === 'Identifier' && innerCallee.name === 'expect') {
                  context.report({
                    loc: extractLocation(node),
                    message: `Arrow function test implicitly returns an expect() expression. Wrap the body in braces to avoid returning the assertion.`,
                    node,
                  })
                }
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow arrow function test callbacks that implicitly return expect() expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-implicit-return-in-test',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noImplicitReturnInTestRule
