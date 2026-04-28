import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getNodeText,
  getRange,
  isCallExpression,
  isMemberExpression,
  toASTNode,
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

  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)

  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  // Check that we're calling .call()
  const callProperty = toASTNode(callee.property)
  if (
    !callProperty ||
    callProperty.type !== 'Identifier' ||
    callProperty.name !== 'call'
  ) {
    return false
  }

  // Get the method being called (e.g., slice, hasOwnProperty)
  const methodCallee = toASTNode(callee.object)
  if (!methodCallee || !isMemberExpression(methodCallee)) {
    return false
  }

  const methodProperty = toASTNode(methodCallee.property)
  if (!methodProperty || methodProperty.type !== 'Identifier') {
    return false
  }

  const methodPropName = methodProperty.name
  if (methodPropName !== methodName) {
    return false
  }

  // Get the prototype part (e.g., Array.prototype, Object.prototype)
  const prototypeCallee = toASTNode(methodCallee.object)
  if (!prototypeCallee || !isMemberExpression(prototypeCallee)) {
    return false
  }

  const prototypeProperty = toASTNode(prototypeCallee.property)
  if (
    !prototypeProperty ||
    prototypeProperty.type !== 'Identifier' ||
    prototypeProperty.name !== 'prototype'
  ) {
    return false
  }

  // Get the object name (e.g., Array, Object)
  const objectIdentifier = toASTNode(prototypeCallee.object)
  if (
    !objectIdentifier ||
    objectIdentifier.type !== 'Identifier' ||
    objectIdentifier.name !== objectName
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

function getCallArguments(node: unknown): unknown[] {
  if (!isCallExpression(node)) {
    return []
  }

  const n = toASTNode(node)
  return n?.arguments ?? []
}

export const preferPrototypeMethodsRule: RuleDefinition = {
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

          let fix: undefined | { range: readonly [number, number]; text: string }
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
            fix,
            loc: location,
            message:
              'Prefer spread syntax over Array.prototype.slice.call(). Use [...arr] for array-like to array conversion.',
          })
          return
        }

        // Check for Object.prototype.hasOwnProperty.call()
        if (isObjectPrototypeHasOwnPropertyCall(node)) {
          const location = extractLocation(node)
          const args = getCallArguments(node)
          const nodeRange = getRange(node)

          let fix: undefined | { range: readonly [number, number]; text: string }
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
            fix,
            loc: location,
            message:
              'Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call(). Use Object.hasOwn(obj, prop) for cleaner code.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer modern alternatives over prototype method calls. Use spread syntax instead of Array.prototype.slice.call(), and Object.hasOwn() instead of Object.prototype.hasOwnProperty.call().',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-prototype-methods',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferPrototypeMethodsRule
