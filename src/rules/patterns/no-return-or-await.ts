import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isAsyncFunctionWithReturnOrAwait(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (
    n.type !== 'FunctionDeclaration' &&
    n.type !== 'FunctionExpression' &&
    n.type !== 'ArrowFunctionExpression'
  ) {
    return false
  }

  const async = n.async as boolean
  if (!async) {
    return false
  }

  const body = n.body as Record<string, unknown>
  if (!body) {
    return false
  }

  return body.type !== 'BlockStatement' || !hasReturnOrAwait(body)
}

function hasReturnOrAwait(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>
  const type = n.type as string

  if (type === 'ReturnStatement' || type === 'AwaitExpression') {
    return true
  }

  for (const key of Object.keys(n)) {
    const value = n[key]
    if (typeof value === 'object' && value !== null) {
      if (hasReturnOrAwait(value)) {
        return true
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'object' && item !== null && hasReturnOrAwait(item)) {
            return true
          }
        }
      }
    }
  }

  return false
}

export const noReturnOrAwaitRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow async functions that never use await or return. Async functions should perform asynchronous operations.',
      category: 'performance',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-return-or-await',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        if (isAsyncFunctionWithReturnOrAwait(node)) {
          return
        }
        const n = node as Record<string, unknown>
        if (n.async !== true) {
          return
        }
        const location = extractLocation(node)
        context.report({
          message: 'Async function has no await or return.',
          loc: location,
        })
      },
      FunctionExpression(node: unknown): void {
        if (isAsyncFunctionWithReturnOrAwait(node)) {
          return
        }
        const n = node as Record<string, unknown>
        if (n.async !== true) {
          return
        }
        const location = extractLocation(node)
        context.report({
          message: 'Async function has no await or return.',
          loc: location,
        })
      },
      ArrowFunctionExpression(node: unknown): void {
        if (isAsyncFunctionWithReturnOrAwait(node)) {
          return
        }
        const n = node as Record<string, unknown>
        if (n.async !== true) {
          return
        }
        const location = extractLocation(node)
        context.report({
          message: 'Async function has no await or return.',
          loc: location,
        })
      },
    }
  },
}

export default noReturnOrAwaitRule
