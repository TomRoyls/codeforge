import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isHookCall, toASTNode } from '../../utils/ast-helpers.js'

function isDirectExpectCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  return callee.type === 'Identifier' && typeof callee.name === 'string' && callee.name === 'expect'
}

export const noAssertionInSetupRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const hookStack: string[] = []

    return {
      CallExpression(node: unknown): void {
        const hookName = isHookCall(node)
        if (hookName !== null) {
          hookStack.push(hookName)
          return
        }

        if (hookStack.length > 0 && isDirectExpectCall(node)) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected assertion in '${hookStack.at(-1)}' hook. Assertions should be in test functions.`,
            node,
          })
        }
      },

      'CallExpression:exit'(node: unknown): void {
        if (isHookCall(node) !== null) {
          hookStack.pop()
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow assertion calls inside setup and teardown hooks where they do not belong',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-assertion-in-setup',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAssertionInSetupRule
