import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const HOOK_NAMES = new Set([
  'beforeEach',
  'beforeAll',
  'afterEach',
  'afterAll',
])

export const noAsyncSetupRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee) return

        let hookName: string | undefined

        if (callee.type === 'Identifier') {
          hookName = (callee as { name?: string }).name
        }

        if (!hookName || !HOOK_NAMES.has(hookName)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const callback = toASTNode(args[0])
        if (!callback) return

        const isAsync =
          callback.type === 'ArrowFunctionExpression' ||
          callback.type === 'FunctionExpression'

        if (!isAsync) return

        const asyncModifier = (callback as { async?: boolean }).async
        if (!asyncModifier) return

        context.report({
          loc: extractLocation(callback),
          message: `Unexpected async \`${hookName}\` hook. Async setup hooks can cause timing issues and test flakiness. Consider refactoring to use synchronous setup or proper async utilities.`,
          node: callback,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description: 'Disallow async setup and teardown hooks',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-async-setup',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAsyncSetupRule
