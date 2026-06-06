import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getCallRootName, toASTNode } from '../../utils/ast-helpers.js'
import { HOOK_FUNCTIONS } from '../../utils/constants.js'

export const requireHookDescriptionRule: RuleDefinition = {
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

        const callbackNode = callback as { type?: string; body?: unknown }
        if (callbackNode.type !== 'ArrowFunctionExpression' && callbackNode.type !== 'FunctionExpression') return

        const body = callbackNode.body
        if (!body || typeof body !== 'object') return

        const bodyNode = body as { type?: string }

        if (bodyNode.type === 'BlockStatement') {
          const blockBody = (body as { body?: unknown[] }).body
          if (!blockBody || blockBody.length === 0) return
        }

        const firstArg = args[0] as { type?: string; value?: unknown } | undefined
        if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') return

        context.report({
          loc: extractLocation(node),
          message: `Hook '${rootName}' should have a description string as the first argument for clarity.`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Require description strings in test hook functions (beforeEach, afterEach, beforeAll, afterAll)',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/require-hook-description',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default requireHookDescriptionRule
