import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getParentNode, isCallExpression, isLogicalExpression, isUnaryExpression, toASTNode } from '../../utils/ast-helpers.js'

function isConditionalExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'ConditionalExpression'
}

function isIfStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'IfStatement'
}

function isPromiseCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)

  if (!callee) {
    return false
  }

  if (callee.type === 'MemberExpression') {
    const obj = toASTNode(callee.object)

    if (!obj || obj.type !== 'Identifier') {
      return false
    }

    return obj.name === 'Promise'
  }

  return false
}

function isAsyncFunctionCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)

  if (!callee || callee.type !== 'Identifier') {
    return false
  }

  const {name} = callee
  return name?.startsWith('fetch') || name === 'fetch'
}

function isPromiseLike(node: unknown): boolean {
  if (isPromiseCall(node)) {
    return true
  }

  if (isAsyncFunctionCall(node)) {
    return true
  }

  if (isCallExpression(node)) {
    const n = toASTNode(node)
    const callee = toASTNode(n?.callee)
    if (callee && callee.type === 'Identifier') {
      const {name} = callee
      return (
        (name?.toLowerCase()?.includes('promise') ?? false) ||
        (name?.toLowerCase()?.includes('async') ?? false)
      )
    }
  }

  return false
}

function isInBooleanContext(parent: unknown, node: unknown): boolean {
  const p = toASTNode(parent)
  if (!p) return false

  if (isIfStatement(p) && p.test === node) {
    return true
  }

  if (isConditionalExpression(p) && p.test === node) {
    return true
  }

  if (isLogicalExpression(p)) {
    return p.left === node || p.right === node
  }

  if (isUnaryExpression(p)) {
    return p.operator === '!'
  }

  return false
}

export const noPromiseAsBooleanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isPromiseLike(node)) {
          return
        }

        const n = toASTNode(node)
        const parent = getParentNode(n)

        if (isInBooleanContext(parent, node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Promises are always truthy in boolean contexts. Use await or .then() to resolve the Promise before using it in conditions.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Promises in boolean contexts. Promises are always truthy, so using them in if statements, &&, ||, or ! conditions is almost always a bug. Use await or .then() to resolve the Promise first.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-promise-as-boolean',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noPromiseAsBooleanRule
