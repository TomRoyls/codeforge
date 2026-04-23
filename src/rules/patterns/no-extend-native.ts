import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const NATIVE_OBJECTS = new Set([
  'Array',
  'Boolean',
  'Date',
  'Error',
  'EvalError',
  'Function',
  'JSON',
  'Map',
  'Math',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'Reflect',
  'RegExp',
  'Set',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'URIError',
  'WeakMap',
  'WeakSet',
])

function isPrototypeExtension(node: unknown): { isExtension: boolean; nativeName: null | string } {
  if (!node || typeof node !== 'object') {
    return { isExtension: false, nativeName: null }
  }

  const n = node as Record<string, unknown>

  // Check for AssignmentExpression
  if (n.type !== 'AssignmentExpression') {
    return { isExtension: false, nativeName: null }
  }

  const left = n.left as Record<string, unknown> | undefined

  if (!left || left.type !== 'MemberExpression') {
    return { isExtension: false, nativeName: null }
  }

  // Check if we're assigning to NativeObject.prototype.property or NativeObject['prototype']['property']
  const obj = left.object as Record<string, unknown> | undefined
  const prop = left.property as Record<string, unknown> | undefined

  if (!obj || !prop) {
    return { isExtension: false, nativeName: null }
  }

  // Case 1: NativeObject.prototype.property (direct prototype access)
  if (obj.type === 'MemberExpression') {
    const objObj = obj.object as Record<string, unknown> | undefined
    const objProp = obj.property as Record<string, unknown> | undefined

    if (
      objObj &&
      objProp &&
      objObj.type === 'Identifier' &&
      objProp.type === 'Identifier' &&
      objProp.name === 'prototype' &&
      NATIVE_OBJECTS.has(objObj.name as string)
    ) {
      return { isExtension: true, nativeName: objObj.name as string }
    }
  }

  // Case 2: NativeObject['property'] (bracket notation on prototype)
  if (obj.type === 'Identifier' && NATIVE_OBJECTS.has(obj.name as string) && prop.type === 'Identifier' && prop.name === 'prototype') {
      // This is assignment to NativeObject.prototype itself, not an extension
      return { isExtension: false, nativeName: null }
    }

  return { isExtension: false, nativeName: null }
}

export const noExtendNativeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const { isExtension, nativeName } = isPrototypeExtension(node)

        if (!isExtension || !nativeName) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: `Extending native object '${nativeName}' is not allowed. Use a utility function or wrapper instead.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Disallow extending native objects. Modifying prototypes of built-in objects can cause unexpected behavior and conflicts with other code.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-extend-native',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noExtendNativeRule
