import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isCallExpression, isMemberExpression } from '../../utils/ast-helpers.js'

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

function isObjectPrototypeMethod(node: unknown, methodName: string): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  const callCallee = callee as Record<string, unknown>
  const callProperty = callCallee.property as Record<string, unknown> | undefined

  if (
    !callProperty ||
    callProperty.type !== 'Identifier' ||
    (callProperty as Record<string, unknown>).name !== 'call'
  ) {
    return false
  }

  const methodCallee = callCallee.object as Record<string, unknown> | undefined
  if (!methodCallee || !isMemberExpression(methodCallee)) {
    return false
  }

  const m = methodCallee as Record<string, unknown>
  const methodProperty = m.property as Record<string, unknown> | undefined

  if (!methodProperty || methodProperty.type !== 'Identifier') {
    return false
  }

  const methodPropName = (methodProperty as Record<string, unknown>).name as string
  if (methodPropName !== methodName) {
    return false
  }

  const prototypeCallee = m.object as Record<string, unknown> | undefined
  if (!prototypeCallee || !isMemberExpression(prototypeCallee)) {
    return false
  }

  const p = prototypeCallee as Record<string, unknown>
  const prototypeProperty = p.property as Record<string, unknown> | undefined

  if (
    !prototypeProperty ||
    prototypeProperty.type !== 'Identifier' ||
    (prototypeProperty as Record<string, unknown>).name !== 'prototype'
  ) {
    return false
  }

  const objectIdentifier = p.object as Record<string, unknown> | undefined
  if (
    !objectIdentifier ||
    objectIdentifier.type !== 'Identifier' ||
    (objectIdentifier as Record<string, unknown>).name !== 'Object'
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

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return false
  }

  const c = callee as Record<string, unknown>
  const object = c.object as Record<string, unknown> | undefined

  if (!object) {
    return false
  }

  const methodName = getMethodName(callee)
  if (methodName !== 'hasOwnProperty' && methodName !== 'propertyIsEnumerable') {
    return false
  }

  if (object.type === 'Identifier' && (object as Record<string, unknown>).name === 'Object') {
    return false
  }

  return true
}

function getCallerName(node: unknown): string {
  if (!isCallExpression(node)) {
    return 'obj'
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return 'obj'
  }

  const c = callee as Record<string, unknown>
  const object = c.object as Record<string, unknown> | undefined

  if (!object || object.type !== 'Identifier') {
    return 'obj'
  }

  return (object as Record<string, unknown>).name as string
}

export const preferObjectHasOwnRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer Object.hasOwn() over hasOwnProperty() and propertyIsEnumerable() for safer property checking. Use Object.hasOwn(obj, prop) instead of obj.hasOwnProperty(prop) or Object.prototype.hasOwnProperty.call(obj, prop).',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-object-has-own',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) {
          return
        }

        if (isHasOwnPropertyCall(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call(). Use Object.hasOwn(obj, prop) for cleaner code.',
            loc: location,
          })
          return
        }

        if (isPropertyIsEnumerableCall(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Prefer Object.hasOwn() over Object.prototype.propertyIsEnumerable.call() for checking own properties.',
            loc: location,
          })
          return
        }

        if (isPrototypeCall(node)) {
          const callerName = getCallerName(node)
          const location = extractLocation(node)
          const callee = (node as Record<string, unknown>).callee as Record<string, unknown>
          const methodName = getMethodName(callee)

          context.report({
            message: `Prefer Object.hasOwn() over ${callerName}.${methodName}(). Use Object.hasOwn(${callerName}, prop) for safer property checking.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default preferObjectHasOwnRule
