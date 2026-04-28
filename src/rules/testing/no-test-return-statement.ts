import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const TEST_CALLBACK_FUNCTIONS = new Set(['it', 'test'])

function isTestCallbackCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return false
  }

  const callee = toASTNode(n.callee)
  if (!callee) {
    return false
  }

  // Direct call: it(...) or test(...)
  if (
    callee.type === 'Identifier' &&
    typeof callee.name === 'string' &&
    TEST_CALLBACK_FUNCTIONS.has(callee.name)
  ) {
    return true
  }

  // Member expression: it.each(...)(...) or test.skip(...), etc.
  // We need to check if the base object is 'it' or 'test'
  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      TEST_CALLBACK_FUNCTIONS.has(object.name)
    ) {
      return true
    }
  }

  return false
}

function getCallbackArg(node: unknown): unknown {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') {
    return null
  }

  const args = n.arguments
  if (!Array.isArray(args)) {
    return null
  }

  // Find the callback argument (last function argument)
  for (let i = args.length - 1; i >= 0; i--) {
    const arg = toASTNode(args[i])
    if (
      arg?.type === 'ArrowFunctionExpression' ||
      arg?.type === 'FunctionExpression'
    ) {
      return arg
    }
  }

  return null
}

export const noTestReturnStatementRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const testCallbacks = new Set<unknown>()
    let nestedFunctionDepth = 0

    return {
      ArrowFunctionExpression(node: unknown): void {
        if (testCallbacks.has(node)) {
          return
        }

        if (testCallbacks.size > 0) {
          nestedFunctionDepth++
        }
      },

      'ArrowFunctionExpression:exit'(node: unknown): void {
        if (testCallbacks.has(node)) {
          testCallbacks.delete(node)
          return
        }

        if (testCallbacks.size > 0 && nestedFunctionDepth > 0) {
          nestedFunctionDepth--
        }
      },

      CallExpression(node: unknown): void {
        if (isTestCallbackCall(node)) {
          const callback = getCallbackArg(node)
          if (callback) {
            testCallbacks.add(callback)
          }
        }
      },

      'CallExpression:exit'(): void {
        // Callback cleanup handled by function exit handlers
      },

      FunctionDeclaration(): void {
        if (testCallbacks.size > 0) {
          nestedFunctionDepth++
        }
      },

      'FunctionDeclaration:exit'(): void {
        if (testCallbacks.size > 0 && nestedFunctionDepth > 0) {
          nestedFunctionDepth--
        }
      },

      FunctionExpression(node: unknown): void {
        if (testCallbacks.has(node)) {
          return
        }

        if (testCallbacks.size > 0) {
          nestedFunctionDepth++
        }
      },

      'FunctionExpression:exit'(node: unknown): void {
        if (testCallbacks.has(node)) {
          testCallbacks.delete(node)
          return
        }

        if (testCallbacks.size > 0 && nestedFunctionDepth > 0) {
          nestedFunctionDepth--
        }
      },

      ReturnStatement(node: unknown): void {
        if (testCallbacks.size > 0 && nestedFunctionDepth === 0) {
          const n = toASTNode(node)
          if (n && n.argument !== null && n.argument !== undefined) {
            context.report({
              loc: extractLocation(node),
              message:
                'Unexpected return statement in test. Tests should use assertions instead of returning values.',
              node,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow return statements in test cases as tests should use assertions instead of returning values',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/no-test-return-statement.md',
    },
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noTestReturnStatementRule
