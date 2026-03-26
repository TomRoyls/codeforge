import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  getRange,
  getNodeText,
} from '../../utils/ast-helpers.js'

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

function isReduceCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'reduce'
}

function isArrayLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'ArrayExpression' && (!n.elements || (n.elements as unknown[]).length === 0)
}

function isArrowFunction(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  return (node as Record<string, unknown>).type === 'ArrowFunctionExpression'
}

function isFunctionExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  return (node as Record<string, unknown>).type === 'FunctionExpression'
}

function getReduceCallbackBody(callback: unknown): unknown {
  if (!callback || typeof callback !== 'object') {
    return null
  }

  const n = callback as Record<string, unknown>

  // Arrow function with expression body
  if (n.type === 'ArrowFunctionExpression' && n.expression) {
    return n.body
  }

  // Arrow function or function expression with block body
  if ((n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') && n.body) {
    const body = n.body as Record<string, unknown>
    if (body.type === 'BlockStatement' && body.body) {
      const statements = body.body as unknown[]
      // Look for return statement
      for (const stmt of statements) {
        const s = stmt as Record<string, unknown>
        if (s.type === 'ReturnStatement' && s.argument) {
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

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'concat'
}

function isSpreadConcatPattern(node: unknown): boolean {
  // Check for [...a, ...b] pattern
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'ArrayExpression') {
    return false
  }

  const elements = n.elements as unknown[] | undefined
  if (!elements || elements.length < 2) {
    return false
  }

  // Check if all elements are spread elements
  let spreadCount = 0
  for (const elem of elements) {
    const e = elem as Record<string, unknown>
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

  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined

  if (!args || args.length === 0) {
    return null
  }

  const callback = args[0]
  if (!isArrowFunction(callback) && !isFunctionExpression(callback)) {
    return null
  }

  return callback
}

function getReduceInitialValue(node: unknown): unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined

  if (!args || args.length < 2) {
    return null
  }

  return args[1]
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
  if (!node || typeof node !== 'object') {
    return false
  }
  return (node as Record<string, unknown>).type === 'ForStatement'
}

function isForOfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  return (node as Record<string, unknown>).type === 'ForOfStatement'
}

function isForInStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  return (node as Record<string, unknown>).type === 'ForInStatement'
}

function isAnyForLoop(node: unknown): boolean {
  return isForStatement(node) || isForOfStatement(node) || isForInStatement(node)
}

function isPushCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'push'
}

function getBlockStatements(node: unknown): unknown[] {
  if (!node || typeof node !== 'object') {
    return []
  }

  const n = node as Record<string, unknown>

  // If it's a block statement, return its body
  if (n.type === 'BlockStatement' && n.body) {
    return n.body as unknown[]
  }

  // If it's a for loop, get its body
  if (isAnyForLoop(node) && n.body) {
    const body = n.body as Record<string, unknown>
    if (body.type === 'BlockStatement' && body.body) {
      return body.body as unknown[]
    }
    // Single statement body
    return [body]
  }

  return []
}

function containsPushCall(statements: unknown[]): boolean {
  for (const stmt of statements) {
    const s = stmt as Record<string, unknown>

    // Check expression statements for push calls
    if (s.type === 'ExpressionStatement' && s.expression) {
      if (isPushCall(s.expression)) {
        return true
      }
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer Array.flat() over manual flattening patterns. Use arr.flat() instead of reduce with concat or nested for loops.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-array-flat',
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

        // Check for reduce with concat pattern
        if (isFlatteningReduce(node)) {
          const location = extractLocation(node)
          const calleeObject = getCalleeObject(node)
          const calleeName =
            calleeObject &&
            typeof calleeObject === 'object' &&
            (calleeObject as Record<string, unknown>).type === 'Identifier'
              ? ((calleeObject as Record<string, unknown>).name as string)
              : 'array'

          let fix: { range: readonly [number, number]; text: string } | undefined
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
            message: `Prefer .flat() over reduce with concat for array flattening. Use ${calleeName}.flat() instead.`,
            loc: location,
            fix,
          })
        }
      },

      ForStatement(node: unknown): void {
        if (isNestedForLoopFlattening(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Prefer .flat() over nested for loops for array flattening. Use arr.flat() instead.',
            loc: location,
          })
        }
      },

      ForOfStatement(node: unknown): void {
        if (isNestedForLoopFlattening(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Prefer .flat() over nested for loops for array flattening. Use arr.flat() instead.',
            loc: location,
          })
        }
      },
    }
  },
}

export default preferArrayFlatRule
