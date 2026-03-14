import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../utils/ast-helpers.js'

const NON_PROMISE_AWARE_METHODS = new Set([
  'forEach',
  'map',
  'filter',
  'reduce',
  'reduceRight',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'every',
  'some',
  'sort',
  'flatMap',
])

function isAsyncFunction(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return (
    (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') && n.async === true
  )
}

function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'CallExpression'
}

function isMemberExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'MemberExpression'
}

function getMethodName(node: unknown): string | null {
  if (!isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return null
  }

  const property = callee.property as Record<string, unknown> | undefined
  if (!property || property.type !== 'Identifier') {
    return null
  }

  return property.name as string
}

function getArguments(node: unknown): unknown[] {
  if (!isCallExpression(node)) {
    return []
  }

  const n = node as Record<string, unknown>
  return (n.arguments as unknown[]) ?? []
}

function findParentAsyncFunction(node: unknown, depth = 0): boolean {
  if (!node || typeof node !== 'object' || depth > 50) {
    return false
  }

  const n = node as Record<string, unknown>
  const parent = n.parent as Record<string, unknown> | undefined

  if (!parent) {
    return false
  }

  if (
    (parent.type === 'ArrowFunctionExpression' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'FunctionDeclaration') &&
    parent.async === true
  ) {
    return true
  }

  return findParentAsyncFunction(parent, depth + 1)
}

export const noMisusedPromisesRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow Promises in places not designed to handle them, such as async callbacks passed to non-Promise-aware methods and await in non-async functions.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-misused-promises',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checksConditionals: {
            type: 'boolean',
            default: true,
          },
          checksVoidReturn: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    function checkMisusedPromiseCallback(node: unknown): void {
      if (!isCallExpression(node)) {
        return
      }

      const methodName = getMethodName(node)
      if (!methodName || !NON_PROMISE_AWARE_METHODS.has(methodName)) {
        return
      }

      const args = getArguments(node)
      if (args.length === 0) {
        return
      }

      const callback = args[0]
      if (!isAsyncFunction(callback)) {
        return
      }

      const location = extractLocation(callback)
      context.report({
        message: `Promise returned from async ${methodName} callback is ignored. This can lead to unhandled rejections. Consider using for-of with await for sequential execution.`,
        loc: location,
      })
    }

    function checkAwaitInSyncFunction(node: unknown): void {
      if (!node || typeof node !== 'object') {
        return
      }

      const n = node as Record<string, unknown>

      if (n.type !== 'AwaitExpression') {
        return
      }

      if (!findParentAsyncFunction(node)) {
        const location = extractLocation(node)
        context.report({
          message:
            'await used in a non-async function. Add async keyword to the containing function.',
          loc: location,
        })
      }
    }

    return {
      CallExpression(node: unknown): void {
        checkMisusedPromiseCallback(node)
      },

      AwaitExpression(node: unknown): void {
        checkAwaitInSyncFunction(node)
      },
    }
  },
}

export default noMisusedPromisesRule
