import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  getRange,
} from '../../utils/ast-helpers.js'

function isThisExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  return (node as Record<string, unknown>).type === 'ThisExpression'
}

function getMethodName(node: unknown): string | null {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const property = n.property as Record<string, unknown> | undefined

  if (!property || property.type !== 'Identifier') {
    return null
  }

  return property.name as string
}

function isBindCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'bind'
}

function isBindThisCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined

  if (!args || args.length !== 1) {
    return false
  }

  const firstArg = args[0]
  return isThisExpression(firstArg)
}

function getCalleeObject(node: unknown): unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return null
  }

  const c = callee as Record<string, unknown>
  return c.object
}

function isFunctionExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const type = (node as Record<string, unknown>).type
  return type === 'FunctionExpression' || type === 'FunctionDeclaration'
}

function isAssignmentToThisProperty(node: unknown): boolean {
  if (!isMemberExpression(node)) {
    return false
  }
  const n = node as Record<string, unknown>
  const obj = n.object as Record<string, unknown> | undefined
  return isThisExpression(obj)
}

function getNodeText(node: unknown, source: string): string {
  const range = getRange(node)
  if (!range) {
    return ''
  }
  return source.slice(range[0], range[1])
}

export const preferAtContextRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer arrow functions over .bind(this) for preserving context. Arrow functions automatically capture `this` from the enclosing scope, making the code cleaner and more readable.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-at-context',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) {
          return
        }

        // Check for .bind(this) pattern
        if (isBindCall(node) && isBindThisCall(node)) {
          const calleeObject = getCalleeObject(node)
          const location = extractLocation(node)

          let fix: { range: readonly [number, number]; text: string } | undefined
          const nodeRange = getRange(node)

          if (nodeRange && calleeObject) {
            const source = context.getSource()
            const calleeText = getNodeText(calleeObject, source)

            // Check if the callee is a function expression - we can convert it to arrow function
            if (isFunctionExpression(calleeObject)) {
              const fnNode = calleeObject as Record<string, unknown>
              const params = fnNode.params as unknown[] | undefined
              const body = fnNode.body as Record<string, unknown> | undefined

              if (body && params) {
                const paramsText = params.map((p) => getNodeText(p, source)).join(', ')
                const bodyText = getNodeText(body, source)

                if (bodyText) {
                  // Convert function expression to arrow function
                  fix = {
                    range: nodeRange,
                    text: `(${paramsText}) => ${bodyText}`,
                  }
                }
              }
            } else if (calleeText) {
              // For method references, just suggest the pattern
              // We can't auto-fix method references without more context
              fix = undefined
            }
          }

          context.report({
            message: `Prefer arrow function over .bind(this). Arrow functions automatically capture 'this' from the enclosing scope.`,
            loc: location,
            fix,
          })
        }
      },

      AssignmentExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const left = n.left
        const right = n.right

        // Check for this.method = function() { ... } pattern
        if (isAssignmentToThisProperty(left) && isFunctionExpression(right)) {
          const fnNode = right as Record<string, unknown>
          const usesThis = functionUsesThis(fnNode)

          if (usesThis) {
            const location = extractLocation(right)

            context.report({
              message: `Consider using an arrow function to automatically preserve 'this' context instead of a function expression.`,
              loc: location,
            })
          }
        }
      },
    }
  },
}

function functionUsesThis(fnNode: Record<string, unknown>): boolean {
  const body = fnNode.body as Record<string, unknown> | undefined
  if (!body) {
    return false
  }

  // Check if body has this references
  return hasThisReference(body)
}

function hasThisReference(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  // Direct ThisExpression
  if (n.type === 'ThisExpression') {
    return true
  }

  // Don't descend into nested functions (they have their own this)
  if (
    n.type === 'FunctionExpression' ||
    n.type === 'FunctionDeclaration' ||
    n.type === 'ArrowFunctionExpression'
  ) {
    return false
  }

  // Check all properties recursively
  for (const key of Object.keys(n)) {
    if (key === 'loc' || key === 'range' || key === 'type') {
      continue
    }

    const value = n[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (hasThisReference(item)) {
          return true
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      if (hasThisReference(value)) {
        return true
      }
    }
  }

  return false
}

export default preferAtContextRule
