import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const HOOK_NAMES = new Set(['beforeEach', 'afterEach', 'beforeAll', 'afterAll'])

const MESSAGE =
  'Unexpected empty {hookName}() hook. Empty hooks add noise without providing any value. Remove the hook or add meaningful setup/teardown logic.'

function isEmptyBody(body: unknown): boolean {
  const n = toASTNode(body)
  if (!n) return true

  if (n.type === 'BlockStatement') {
    const statements = n.body
    return !Array.isArray(statements) || statements.length === 0
  }

  return false
}

function isHookCallWithEmptyCallback(node: unknown): string | null {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    if (!HOOK_NAMES.has(callee.name)) return null

    const args = n.arguments
    if (!Array.isArray(args) || args.length === 0) return null

    const callback = toASTNode(args[0])
    if (!callback) return null

    if (callback.type === 'ArrowFunctionExpression') {
      if (callback.body && isEmptyBody(callback.body)) {
        return callee.name
      }
    } else if (callback.type === 'FunctionExpression') {
      if (callback.body && isEmptyBody(callback.body)) {
        return callee.name
      }
    }

    return null
  }

  return null
}

export const noEmptyHookRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const hookName = isHookCallWithEmptyCallback(node)
        if (hookName === null) return

        context.report({
          loc: extractLocation(node),
          message: MESSAGE.replace('{hookName}', hookName),
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow empty setup and teardown hooks',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-empty-hook',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noEmptyHookRule
