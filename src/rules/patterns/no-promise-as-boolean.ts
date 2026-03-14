import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression'
}

function isLogicalExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'LogicalExpression'
}

function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'CallExpression'
}

function isConditionalExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'ConditionalExpression'
}

function isIfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'IfStatement'
}

function isPromiseCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  if (callee.type === 'MemberExpression') {
    const c = callee as Record<string, unknown>
    const object = c.object as Record<string, unknown> | undefined

    if (!object || object.type !== 'Identifier') {
      return false
    }

    const objName = (object as Record<string, unknown>).name as string
    return objName === 'Promise'
  }

  return false
}

function isAsyncFunctionCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || callee.type !== 'Identifier') {
    return false
  }

  const name = (callee as Record<string, unknown>).name as string
  return name.startsWith('fetch') || name === 'fetch'
}

function isPromiseLike(node: unknown): boolean {
  if (isPromiseCall(node)) {
    return true
  }

  if (isAsyncFunctionCall(node)) {
    return true
  }

  if (isCallExpression(node)) {
    const n = node as Record<string, unknown>
    const callee = n.callee as Record<string, unknown> | undefined
    if (callee && callee.type === 'Identifier') {
      const name = (callee as Record<string, unknown>).name as string
      return name.toLowerCase().includes('promise') || name.toLowerCase().includes('async')
    }
  }

  return false
}

function isInBooleanContext(parent: unknown, node: unknown): boolean {
  if (!parent || typeof parent !== 'object') {
    return false
  }

  const p = parent as Record<string, unknown>

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
    const op = p.operator as string
    return op === '!'
  }

  return false
}

export const noPromiseAsBooleanRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow Promises in boolean contexts. Promises are always truthy, so using them in if statements, &&, ||, or ! conditions is almost always a bug. Use await or .then() to resolve the Promise first.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-promise-as-boolean',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isPromiseLike(node)) {
          return
        }

        const parent = (node as Record<string, unknown>).parent

        if (isInBooleanContext(parent, node)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Promises are always truthy in boolean contexts. Use await or .then() to resolve the Promise before using it in conditions.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noPromiseAsBooleanRule
