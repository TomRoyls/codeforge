import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function getMethodName(node: unknown): null | string {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  const property = toASTNode(n?.property)

  if (!property || property.type !== 'Identifier') {
    return null
  }

  return property.name ?? null
}

function isObjectPrototypeMethod(node: unknown, methodName: string): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)

  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  const callProperty = toASTNode(callee.property)

  if (
    !callProperty ||
    callProperty.type !== 'Identifier' ||
    callProperty.name !== 'call'
  ) {
    return false
  }

  const methodCallee = toASTNode(callee.object)
  if (!methodCallee || !isMemberExpression(methodCallee)) {
    return false
  }

  const methodProperty = toASTNode(methodCallee.property)

  if (!methodProperty || methodProperty.type !== 'Identifier') {
    return false
  }

  if (methodProperty.name !== methodName) {
    return false
  }

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

  const objectIdentifier = toASTNode(prototypeCallee.object)
  if (
    !objectIdentifier ||
    objectIdentifier.type !== 'Identifier' ||
    objectIdentifier.name !== 'Object'
  ) {
    return false
  }

  return true
}

function isHasOwnPropertyCall(node: unknown): boolean {
  return isObjectPrototypeMethod(node, 'hasOwnProperty')
}

function isPropertyIsEnumerableCall(node: unknown): boolean {
  return isObjectPrototypeMethod(node, 'propertyIsEnumerable')
}

function isPrototypeCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)

  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  const object = toASTNode(callee.object)

  if (!object) {
    return false
  }

  const methodName = getMethodName(callee)
  if (methodName !== 'hasOwnProperty' && methodName !== 'propertyIsEnumerable') {
    return false
  }

  if (object.type === 'Identifier' && object.name === 'Object') {
    return false
  }

  return true
}

function getCallerName(node: unknown): string {
  if (!isCallExpression(node)) {
    return 'obj'
  }

  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)

  if (!callee || !isMemberExpression(callee)) {
    return 'obj'
  }

  const object = toASTNode(callee.object)

  if (!object || object.type !== 'Identifier') {
    return 'obj'
  }

  return object.name ?? 'obj'
}

export const preferObjectHasOwnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) {
          return
        }

        if (isHasOwnPropertyCall(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call(). Use Object.hasOwn(obj, prop) for cleaner code.',
          })
          return
        }

        if (isPropertyIsEnumerableCall(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Prefer Object.hasOwn() over Object.prototype.propertyIsEnumerable.call() for checking own properties.',
          })
          return
        }

        if (isPrototypeCall(node)) {
          const callerName = getCallerName(node)
          const location = extractLocation(node)
          const n = toASTNode(node)
          const callee = toASTNode(n?.callee)
          const methodName = getMethodName(callee)

          context.report({
            loc: location,
            message: `Prefer Object.hasOwn() over ${callerName}.${methodName}(). Use Object.hasOwn(${callerName}, prop) for safer property checking.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer Object.hasOwn() over hasOwnProperty() and propertyIsEnumerable() for safer property checking. Use Object.hasOwn(obj, prop) instead of obj.hasOwnProperty(prop) or Object.prototype.hasOwnProperty.call(obj, prop).',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-object-has-own',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferObjectHasOwnRule
