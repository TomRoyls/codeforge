import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isAsync(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.async === true
}

function containsAwait(node: unknown, visited: Set<unknown> = new Set()): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  if (visited.has(node)) {
    return false
  }

  visited.add(node)

  const n = node as Record<string, unknown>

  if (n.type === 'AwaitExpression') {
    return true
  }

  // Don't traverse into nested functions - they have their own async context
  if (
    n.type === 'FunctionDeclaration' ||
    n.type === 'FunctionExpression' ||
    n.type === 'ArrowFunctionExpression'
  ) {
    return false
  }

  for (const key of Object.keys(n)) {
    if (key === 'parent' || key === 'loc' || key === 'range') continue
    const value = n[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsAwait(item, visited)) {
          return true
        }
      }
    } else if (typeof value === 'object' && value !== null && containsAwait(value, visited)) {
      return true
    }
  }

  return false
}

function isGenerator(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.generator === true
}

function isForOfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ForOfStatement' && n.await === true
}

function containsForAwait(node: unknown, visited: Set<unknown> = new Set()): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  if (visited.has(node)) {
    return false
  }

  visited.add(node)

  const n = node as Record<string, unknown>

  if (isForOfStatement(n)) {
    return true
  }

  // Don't traverse into nested functions
  if (
    n.type === 'FunctionDeclaration' ||
    n.type === 'FunctionExpression' ||
    n.type === 'ArrowFunctionExpression'
  ) {
    return false
  }

  for (const key of Object.keys(n)) {
    if (key === 'parent' || key === 'loc' || key === 'range') continue
    const value = n[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsForAwait(item, visited)) {
          return true
        }
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
      if (!isAsync(node)) {
        return
      }

      // Skip async generators - they may use for-await
      if (isGenerator(node)) {
        return
      }

      const n = node as Record<string, unknown>
      const body = n.body as unknown

      // Check for await expression or for-await-of
      if (!containsAwait(body) && !containsForAwait(body)) {
        const location = extractLocation(node)
        context.report({
          loc: location,
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
