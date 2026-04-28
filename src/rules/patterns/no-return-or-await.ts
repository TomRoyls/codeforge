import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isAsyncFunctionWithReturnOrAwait(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  const { type } = n
  if (type !== 'FunctionDeclaration' && type !== 'FunctionExpression' && type !== 'ArrowFunctionExpression') return false
  if (n.async !== true) return false
  const body = toASTNode(n.body)
  if (!body) return false
  return body.type !== 'BlockStatement' || !hasReturnOrAwait(body)
}

function hasReturnOrAwait(node: unknown, visited: Set<unknown> = new Set()): boolean {
  if (!node || typeof node !== 'object') return false
  if (visited.has(node)) return false
  visited.add(node)

  const n = toASTNode(node)
  if (n?.type === 'ReturnStatement' || n?.type === 'AwaitExpression') return true

  for (const value of Object.values(node as Record<string, unknown>)) {
    if (typeof value === 'object' && value !== null) {
      if (hasReturnOrAwait(value, visited)) return true
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'object' && item !== null && hasReturnOrAwait(item, visited)) return true
        }
      }
    }
  }

  return false
}

function checkFunction(node: unknown, context: RuleContext): void {
  if (node === null || node === undefined) throw new Error('Invalid node')
  if (isAsyncFunctionWithReturnOrAwait(node)) return
  const n = toASTNode(node)
  if (n?.async !== true) return
  context.report({
    loc: extractLocation(node),
    message: 'Async function has no await or return.',
  })
}

export const noReturnOrAwaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ArrowFunctionExpression(node: unknown): void { checkFunction(node, context) },
      FunctionDeclaration(node: unknown): void { checkFunction(node, context) },
      FunctionExpression(node: unknown): void { checkFunction(node, context) },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Disallow async functions that never use await or return. Async functions should perform asynchronous operations.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-return-or-await',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noReturnOrAwaitRule
