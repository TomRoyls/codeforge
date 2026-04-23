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

function hasRestParameter(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const params = n.params as undefined | unknown[]

  if (!params || params.length === 0) {
    return false
  }

  const lastParam = params.at(-1) as Record<string, unknown> | undefined
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
        'Require async functions to contain await expressions. An async function without await is usually a mistake or unnecessary async overhead.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/require-await',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default requireAwaitRule
