import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  type ASTNode,
  getNodeText,
  getRange,
  isCallExpression,
  isMemberExpression,
  toASTNode,
} from '../../utils/ast-helpers.js'

function isThisExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'ThisExpression'
}

function getMethodName(node: unknown): null | string {
  const n = toASTNode(node)
  if (n?.type !== 'MemberExpression') return null

  const property = toASTNode(n.property)
  if (property?.type !== 'Identifier') return null

  return property.name ?? null
}

function isBindCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false

  const n = toASTNode(node)
  if (!n?.callee) return false

  return getMethodName(n.callee) === 'bind'
}

function isBindThisCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false

  const n = toASTNode(node)
  const args = n?.arguments

  if (!args || args.length !== 1) return false

  return isThisExpression(args[0])
}

function getCalleeObject(node: unknown): unknown {
  if (!isCallExpression(node)) return null

  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)

  if (!callee || !isMemberExpression(callee)) return null

  return callee.object
}

function isFunctionExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  return n.type === 'FunctionExpression' || n.type === 'FunctionDeclaration'
}

function isAssignmentToThisProperty(node: unknown): boolean {
  if (!isMemberExpression(node)) return false

  const n = toASTNode(node)
  return isThisExpression(n?.object)
}

export const preferAtContextRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n?.left || !n?.right) return

        // Check for this.method = function() { ... } pattern
        if (isAssignmentToThisProperty(n.left) && isFunctionExpression(n.right)) {
          const fnNode = toASTNode(n.right)
          if (!fnNode) return

          const usesThis = functionUsesThis(fnNode)

          if (usesThis) {
            const location = extractLocation(n.right)

            context.report({
              loc: location,
              message: `Consider using an arrow function to automatically preserve 'this' context instead of a function expression.`,
            })
          }
        }
      },

      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) return

        // Check for .bind(this) pattern
        if (isBindCall(node) && isBindThisCall(node)) {
          const calleeObject = getCalleeObject(node)
          const location = extractLocation(node)

          let fix: undefined | { range: readonly [number, number]; text: string }
          const nodeRange = getRange(node)

          if (nodeRange && calleeObject) {
            const source = context.getSource()
            const calleeText = getNodeText(calleeObject, source)

            // Check if the callee is a function expression - we can convert it to arrow function
            if (isFunctionExpression(calleeObject)) {
              const fnNode = toASTNode(calleeObject)
              if (fnNode?.params && fnNode.body) {
                const {params} = fnNode
                const {body} = fnNode

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
            fix,
            loc: location,
            message: `Prefer arrow function over .bind(this). Arrow functions automatically capture 'this' from the enclosing scope.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer arrow functions over .bind(this) for preserving context. Arrow functions automatically capture `this` from the enclosing scope, making the code cleaner and more readable.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-at-context',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function functionUsesThis(fnNode: ASTNode): boolean {
  const {body} = fnNode
  if (!body) return false

  // Check if body has this references
  return hasThisReference(body)
}

function hasThisReference(node: unknown, visited: Set<unknown> = new Set()): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (visited.has(node)) return false

  visited.add(node)

  // Direct ThisExpression
  if (n.type === 'ThisExpression') return true

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
    if (key === 'loc' || key === 'range' || key === 'type' || key === 'parent') {
      continue
    }

    const value = (n as Record<string, unknown>)[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (hasThisReference(item, visited)) {
          return true
        }
      }
    } else if (typeof value === 'object' && value !== null && hasThisReference(value, visited)) {
      return true
    }
  }

  return false
}

export default preferAtContextRule
