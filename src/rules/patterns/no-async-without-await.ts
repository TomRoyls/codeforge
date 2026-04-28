import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isAsync(node: unknown): boolean {
  return toASTNode(node)?.async === true
}

function containsAwait(node: unknown, visited: Set<unknown> = new Set()): boolean {
  if (!node || typeof node !== 'object') return false
  if (visited.has(node)) return false
  visited.add(node)

  const n = toASTNode(node)
  if (n?.type === 'AwaitExpression') return true
  if (n?.type === 'FunctionDeclaration' || n?.type === 'FunctionExpression' || n?.type === 'ArrowFunctionExpression') return false

  for (const value of Object.values(node as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsAwait(item, visited)) return true
      }
    } else if (typeof value === 'object' && value !== null && containsAwait(value, visited)) {
      return true
    }
  }

  return false
}

function isGenerator(node: unknown): boolean {
  return toASTNode(node)?.generator === true
}

function isForOfStatement(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'ForOfStatement' && n.await === true
}

function containsForAwait(node: unknown, visited: Set<unknown> = new Set()): boolean {
  if (!node || typeof node !== 'object') return false
  if (visited.has(node)) return false
  visited.add(node)

  const n = toASTNode(node)
  if (isForOfStatement(node)) return true
  if (n?.type === 'FunctionDeclaration' || n?.type === 'FunctionExpression' || n?.type === 'ArrowFunctionExpression') return false

  for (const value of Object.values(node as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsForAwait(item, visited)) return true
      }
    } else if (typeof value === 'object' && value !== null && containsForAwait(value, visited)) {
      return true
    }
  }

  return false
}

export const noAsyncWithoutAwaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    function checkFunction(node: unknown): void {
      if (!isAsync(node) || isGenerator(node)) return
      const body = toASTNode(node)?.body
      if (!containsAwait(body) && !containsForAwait(body)) {
        context.report({
          loc: extractLocation(node),
          message: 'Async function has no await expression.',
        })
      }
    }

    return {
      ArrowFunctionExpression: checkFunction,
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow async functions that lack await expressions. Async functions without await are usually unnecessary and add overhead.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-async-without-await',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAsyncWithoutAwaitRule
