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

function hasRestParameter(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  const params = n.params as unknown[] | undefined

  if (!params || params.length === 0) {
    return false
  }

  const lastParam = params[params.length - 1] as Record<string, unknown> | undefined
  return lastParam?.type === 'RestElement'
}

function isGenerator(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.generator === true
}

export const requireAwaitRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require async functions to contain await expressions. An async function without await is usually a mistake or unnecessary async overhead.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/require-await',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    function checkFunction(node: unknown): void {
      if (!isAsync(node)) {
        return
      }

      if (isGenerator(node)) {
        return
      }

      if (hasRestParameter(node)) {
        return
      }

      const n = node as Record<string, unknown>
      const body = n.body as unknown

      if (!containsAwait(body)) {
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

export default requireAwaitRule
