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

function hasRestParameter(node: unknown): boolean {
  const n = toASTNode(node)
  const params = n?.params
  if (!Array.isArray(params) || params.length === 0) return false
  return toASTNode(params.at(-1))?.type === 'RestElement'
}

function isGenerator(node: unknown): boolean {
  return toASTNode(node)?.generator === true
}

export const requireAwaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    function checkFunction(node: unknown): void {
      if (!isAsync(node) || isGenerator(node) || hasRestParameter(node)) return
      const n = toASTNode(node)
      if (!n?.body || !containsAwait(n.body)) {
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
