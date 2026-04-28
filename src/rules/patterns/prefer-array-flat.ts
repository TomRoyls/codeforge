import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getNodeText,
  getRange,
  isCallExpression,
  isMemberExpression,
  toASTNode,
} from '../../utils/ast-helpers.js'

function getMethodName(node: unknown): null | string {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null

  const property = toASTNode(n.property)
  if (!property || property.type !== 'Identifier') {
    return null
  }

  return property.name ?? null
}

function getCalleeObject(node: unknown): unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null

  const callee = toASTNode(n.callee)
  if (!callee || !isMemberExpression(callee)) {
    return null
  }

  return callee.object
}

function isReduceCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)
  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'reduce'
}

function isArrayLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) {
    return false
  }

  return n.type === 'ArrayExpression' && (!n.elements || n.elements.length === 0)
}

function isArrowFunction(node: unknown): boolean {
  return toASTNode(node)?.type === 'ArrowFunctionExpression'
}

function isFunctionExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'FunctionExpression'
}

function getReduceCallbackBody(callback: unknown): unknown {
  const n = toASTNode(callback)
  if (!n) {
    return null
  }

  // Arrow function with expression body
  if (n.type === 'ArrowFunctionExpression' && n.expression) {
    return n.body
  }

  // Arrow function or function expression with block body
  if ((n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') && n.body) {
    const body = toASTNode(n.body)
    if (body?.type === 'BlockStatement' && body.body) {
      const statements = body.body as unknown[]
      // Look for return statement
      for (const stmt of statements) {
        const s = toASTNode(stmt)
        if (s?.type === 'ReturnStatement' && s.argument) {
          return s.argument
        }
      }
    }
  }

  return null
}

function isConcatCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)
  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'concat'
}

function isSpreadConcatPattern(node: unknown): boolean {
  // Check for [...a, ...b] pattern
  const n = toASTNode(node)
  if (!n) {
    return false
  }

  if (n.type !== 'ArrayExpression') {
    return false
  }

  if (!n.elements || n.elements.length < 2) {
    return false
  }

  // Check if all elements are spread elements
  let spreadCount = 0
  for (const elem of n.elements) {
    const e = toASTNode(elem)
    if (e && e.type === 'SpreadElement') {
      spreadCount++
    }
  }

  return spreadCount >= 2
}

function getReduceCallback(node: unknown): unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null

  if (!n.arguments || n.arguments.length === 0) {
    return null
  }

  const callback = n.arguments[0]
  if (!isArrowFunction(callback) && !isFunctionExpression(callback)) {
    return null
  }

  return callback
}

function getReduceInitialValue(node: unknown): unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null

  if (!n.arguments || n.arguments.length < 2) {
    return null
  }

  return n.arguments[1]
}

function isFlatteningReduce(node: unknown): boolean {
  if (!isReduceCall(node)) {
    return false
  }

  // Check if initial value is empty array
  const initialValue = getReduceInitialValue(node)
  if (!isArrayLiteral(initialValue)) {
    return false
  }

  // Get the callback function
  const callback = getReduceCallback(node)
  if (!callback) {
    return false
  }

  // Get the body of the callback
  const body = getReduceCallbackBody(callback)
  if (!body) {
    return false
  }

  // Check for concat pattern: acc.concat(val) or [...acc, ...val]
  if (isConcatCall(body)) {
    return true
  }

  if (isSpreadConcatPattern(body)) {
    return true
  }

  return false
}

function isForStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'ForStatement'
}

function isForOfStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'ForOfStatement'
}

function isForInStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'ForInStatement'
}

function isAnyForLoop(node: unknown): boolean {
  return isForStatement(node) || isForOfStatement(node) || isForInStatement(node)
}

function isPushCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)
  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'push'
}

function getBlockStatements(node: unknown): unknown[] {
  const n = toASTNode(node)
  if (!n) {
    return []
  }

  // If it's a block statement, return its body
  if (n.type === 'BlockStatement' && n.body) {
    return n.body as unknown[]
  }

  // If it's a for loop, get its body
  if (isAnyForLoop(node) && n.body) {
    const body = toASTNode(n.body)
    if (body?.type === 'BlockStatement' && body.body) {
      return body.body as unknown[]
    }

    // Single statement body
    return [n.body]
  }

  return []
}

function containsPushCall(statements: unknown[]): boolean {
  for (const stmt of statements) {
    const s = toASTNode(stmt)

    // Check expression statements for push calls
    if (s?.type === 'ExpressionStatement' && s.expression && isPushCall(s.expression)) {
        return true
      }
  }

  return false
}

function isNestedForLoopFlattening(node: unknown): boolean {
  if (!isAnyForLoop(node)) {
    return false
  }

  const statements = getBlockStatements(node)

  // Look for nested for loop with push
  for (const stmt of statements) {
    if (isAnyForLoop(stmt)) {
      const innerStatements = getBlockStatements(stmt)
      if (containsPushCall(innerStatements)) {
        return true
      }
    }
  }

  return false
}

export const preferArrayFlatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) {
          return
        }

        // Check for reduce with concat pattern
        if (isFlatteningReduce(node)) {
          const location = extractLocation(node)
          const calleeObject = getCalleeObject(node)
          const calleeObjNode = toASTNode(calleeObject)
          const calleeName =
            calleeObjNode?.type === 'Identifier'
              ? (calleeObjNode.name ?? 'array')
              : 'array'

          let fix: undefined | { range: readonly [number, number]; text: string }
          const nodeRange = getRange(node)
          if (nodeRange) {
            const source = context.getSource()
            const calleeObjectText = getNodeText(calleeObject, source)
            if (calleeObjectText) {
              fix = {
                range: nodeRange,
                text: `${calleeObjectText}.flat()`,
              }
            }
          }

          context.report({
            fix,
            loc: location,
            message: `Prefer .flat() over reduce with concat for array flattening. Use ${calleeName}.flat() instead.`,
          })
        }
      },

      ForOfStatement(node: unknown): void {
        if (isNestedForLoopFlattening(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Prefer .flat() over nested for loops for array flattening. Use arr.flat() instead.',
          })
        }
      },

      ForStatement(node: unknown): void {
        if (isNestedForLoopFlattening(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Prefer .flat() over nested for loops for array flattening. Use arr.flat() instead.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer Array.flat() over manual flattening patterns. Use arr.flat() instead of reduce with concat or nested for loops.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-array-flat',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferArrayFlatRule
