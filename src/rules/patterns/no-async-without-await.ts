import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isAsync(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.async === true
}

function containsAwait(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

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
    const value = n[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsAwait(item)) {
          return true
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      if (containsAwait(value)) {
        return true
      }
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

function containsForAwait(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

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
    const value = n[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsForAwait(item)) {
          return true
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      if (containsForAwait(value)) {
        return true
      }
    }
  }

  return false
}

export const noAsyncWithoutAwaitRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow async functions that lack await expressions. Async functions without await are usually unnecessary and add overhead.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-async-without-await',
    },
    schema: [],
    fixable: 'code',
  },

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
          message: 'Async function has no await expression.',
          loc: location,
        })
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    }
  },
}

export default noAsyncWithoutAwaitRule
