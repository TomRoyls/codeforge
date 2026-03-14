import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  getRange,
} from '../../utils/ast-helpers.js'

/**
 * Checks if a node is a prototype method call pattern like:
 * - Array.prototype.slice.call()
 * - Object.prototype.hasOwnProperty.call()
 */
function isPrototypeMethodCall(node: unknown, objectName: string, methodName: string): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  // Check that we're calling .call()
  const callProperty = callee.property as Record<string, unknown> | undefined
  if (
    !callProperty ||
    callProperty.type !== 'Identifier' ||
    (callProperty as Record<string, unknown>).name !== 'call'
  ) {
    return false
  }

  // Get the method being called (e.g., slice, hasOwnProperty)
  const methodCallee = callee.object as Record<string, unknown> | undefined
  if (!methodCallee || !isMemberExpression(methodCallee)) {
    return false
  }

  const methodProperty = methodCallee.property as Record<string, unknown> | undefined
  if (!methodProperty || methodProperty.type !== 'Identifier') {
    return false
  }

  const methodPropName = (methodProperty as Record<string, unknown>).name as string
  if (methodPropName !== methodName) {
    return false
  }

  // Get the prototype part (e.g., Array.prototype, Object.prototype)
  const prototypeCallee = methodCallee.object as Record<string, unknown> | undefined
  if (!prototypeCallee || !isMemberExpression(prototypeCallee)) {
    return false
  }

  const prototypeProperty = prototypeCallee.property as Record<string, unknown> | undefined
  if (
    !prototypeProperty ||
    prototypeProperty.type !== 'Identifier' ||
    (prototypeProperty as Record<string, unknown>).name !== 'prototype'
  ) {
    return false
  }

  // Get the object name (e.g., Array, Object)
  const objectIdentifier = prototypeCallee.object as Record<string, unknown> | undefined
  if (
    !objectIdentifier ||
    objectIdentifier.type !== 'Identifier' ||
    (objectIdentifier as Record<string, unknown>).name !== objectName
  ) {
    return false
  }

  return true
}

function isArrayPrototypeSliceCall(node: unknown): boolean {
  return isPrototypeMethodCall(node, 'Array', 'slice')
}

function isObjectPrototypeHasOwnPropertyCall(node: unknown): boolean {
  return isPrototypeMethodCall(node, 'Object', 'hasOwnProperty')
}

function getNodeText(node: unknown, source: string): string {
  const range = getRange(node)
  if (!range) {
    return ''
  }
  return source.slice(range[0], range[1])
}

function getCallArguments(node: unknown): unknown[] {
  if (!isCallExpression(node)) {
    return []
  }
  const n = node as Record<string, unknown>
  return (n.arguments as unknown[]) ?? []
}

export const preferPrototypeMethodsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer modern alternatives over prototype method calls. Use spread syntax instead of Array.prototype.slice.call(), and Object.hasOwn() instead of Object.prototype.hasOwnProperty.call().',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-prototype-methods',
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

        // Check for Array.prototype.slice.call()
        if (isArrayPrototypeSliceCall(node)) {
          const location = extractLocation(node)
          const args = getCallArguments(node)
          const nodeRange = getRange(node)

          let fix: { range: readonly [number, number]; text: string } | undefined
          if (nodeRange && args.length > 0) {
            const source = context.getSource()
            const targetArg = args[0]
            const argText = getNodeText(targetArg, source)

            if (argText) {
              // Check if there are additional arguments (start/end indices)
              const hasStartIndex = args.length >= 2
              const hasEndIndex = args.length >= 3

              if (hasEndIndex) {
                const startText = getNodeText(args[1], source)
                const endText = getNodeText(args[2], source)
                fix = {
                  range: nodeRange,
                  text: `[...${argText}.slice(${startText}, ${endText})]`,
                }
              } else if (hasStartIndex) {
                const startText = getNodeText(args[1], source)
                fix = {
                  range: nodeRange,
                  text: `[...${argText}.slice(${startText})]`,
                }
              } else {
                fix = {
                  range: nodeRange,
                  text: `[...${argText}]`,
                }
              }
            }
          }

          context.report({
            message:
              'Prefer spread syntax over Array.prototype.slice.call(). Use [...arr] for array-like to array conversion.',
            loc: location,
            fix,
          })
          return
        }

        // Check for Object.prototype.hasOwnProperty.call()
        if (isObjectPrototypeHasOwnPropertyCall(node)) {
          const location = extractLocation(node)
          const args = getCallArguments(node)
          const nodeRange = getRange(node)

          let fix: { range: readonly [number, number]; text: string } | undefined
          if (nodeRange && args.length >= 2) {
            const source = context.getSource()
            const objText = getNodeText(args[0], source)
            const propText = getNodeText(args[1], source)

            if (objText && propText) {
              fix = {
                range: nodeRange,
                text: `Object.hasOwn(${objText}, ${propText})`,
              }
            }
          }

          context.report({
            message:
              'Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call(). Use Object.hasOwn(obj, prop) for cleaner code.',
            loc: location,
            fix,
          })
        }
      },
    }
  },
}

export default preferPrototypeMethodsRule
