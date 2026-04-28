import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const NON_PROMISE_AWARE_METHODS = new Set([
  'every',
  'filter',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'flatMap',
  'forEach',
  'map',
  'reduce',
  'reduceRight',
  'some',
  'sort',
])

function isAsyncFunction(node: unknown): boolean {
  const n = toASTNode(node)
  return (
    (n?.type === 'ArrowFunctionExpression' || n?.type === 'FunctionExpression') && n.async === true
  )
}

function getMethodName(node: unknown): null | string {
  const n = toASTNode(node)
  if (n?.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (callee?.type !== 'MemberExpression') return null

  const property = toASTNode(callee.property)
  if (property?.type !== 'Identifier') return null

  return property.name ?? null
}

function getArguments(node: unknown): unknown[] {
  const n = toASTNode(node)
  if (n?.type !== 'CallExpression') return []
  return n.arguments ?? []
}

function findParentAsyncFunction(node: unknown, depth = 0): boolean {
  if (depth > 50) return false

  const n = toASTNode(node)
  const parent = toASTNode(n?.parent)
  if (!parent) return false

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
  create(context: RuleContext): RuleVisitor {
    function checkMisusedPromiseCallback(node: unknown): void {
      const n = toASTNode(node)
      if (n?.type !== 'CallExpression') return

      const methodName = getMethodName(node)
      if (!methodName || !NON_PROMISE_AWARE_METHODS.has(methodName)) return

      const args = getArguments(node)
      if (args.length === 0) return

      const callback = args[0]
      if (!isAsyncFunction(callback)) return

      const location = extractLocation(callback)
      context.report({
        loc: location,
        message: `Promise returned from async ${methodName} callback is ignored. This can lead to unhandled rejections. Consider using for-of with await for sequential execution.`,
      })
    }

    function checkAwaitInSyncFunction(node: unknown): void {
      const n = toASTNode(node)
      if (n?.type !== 'AwaitExpression') return

      if (!findParentAsyncFunction(node)) {
        const location = extractLocation(node)
        context.report({
          loc: location,
          message:
            'await used in a non-async function. Add async keyword to the containing function.',
        })
      }
    }

    return {
      AwaitExpression(node: unknown): void {
        checkAwaitInSyncFunction(node)
      },

      CallExpression(node: unknown): void {
        checkMisusedPromiseCallback(node)
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Promises in places not designed to handle them, such as async callbacks passed to non-Promise-aware methods and await in non-async functions.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-misused-promises',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          checksConditionals: {
            default: true,
            type: 'boolean',
          },
          checksVoidReturn: {
            default: true,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noMisusedPromisesRule
