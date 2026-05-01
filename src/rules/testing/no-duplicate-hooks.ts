import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isDescribeCall, toASTNode } from '../../utils/ast-helpers.js'
import { HOOK_FUNCTIONS } from '../../utils/constants.js'

function getHookName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return null
  }

  const callee = toASTNode(n.callee)
  if (!callee) {
    return null
  }

  // Direct call: beforeEach(() => {})
  if (
    callee.type === 'Identifier' &&
    typeof callee.name === 'string' &&
    HOOK_FUNCTIONS.has(callee.name)
  ) {
    return callee.name
  }

  return null
}

export const noDuplicateHooksRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const scopeStack: Set<string>[] = []

    return {
      CallExpression(node: unknown): void {
        if (isDescribeCall(node) !== null) {
          scopeStack.push(new Set())
          return
        }

        const hookName = getHookName(node)
        if (hookName === null) {
          return
        }

        // Hooks outside any describe scope are not tracked
        if (scopeStack.length === 0) {
          return
        }

        const currentScope = scopeStack.at(-1)
        if (currentScope && currentScope.has(hookName)) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected duplicate ${hookName} hook in describe block`,
            node,
          })
        } else if (currentScope) {
          currentScope.add(hookName)
        }
      },

      'CallExpression:exit'(node: unknown): void {
        if (isDescribeCall(node) !== null) {
          scopeStack.pop()
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow duplicate beforeEach/afterEach/beforeAll/afterAll hooks within the same describe block',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-duplicate-hooks.md',
    },
    schema: [],
    severity: 'error',
    type: 'suggestion',
  },
}

export default noDuplicateHooksRule
