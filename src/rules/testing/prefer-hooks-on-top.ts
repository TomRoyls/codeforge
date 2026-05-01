import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getCallRootName, isDescribeCall } from '../../utils/ast-helpers.js'
import { HOOK_FUNCTIONS, TEST_CASE_FUNCTIONS } from '../../utils/constants.js'

interface ScopeState {
  seenTestCase: boolean
}

export const preferHooksOnTopRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const scopeStack: ScopeState[] = []

    return {
      CallExpression(node: unknown): void {
        if (isDescribeCall(node) !== null) {
          scopeStack.push({ seenTestCase: false })
          return
        }

        const callName = getCallRootName(node)
        if (callName === null) return

        if (scopeStack.length === 0) return

        const currentScope = scopeStack.at(-1)

        if (currentScope && HOOK_FUNCTIONS.has(callName) && currentScope.seenTestCase) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected '${callName}' hook after test cases. Hooks should be placed before all test cases in a describe block.`,
            node,
          })
          return
        }

        if (currentScope && TEST_CASE_FUNCTIONS.has(callName)) {
          currentScope.seenTestCase = true
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
        'Require setup and teardown hooks to be placed before all test cases within a describe block',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/prefer-hooks-on-top.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferHooksOnTopRule
