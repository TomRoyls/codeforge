import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const NATIVE_OBJECTS = new Set([
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Function',
  'Symbol',
  'RegExp',
  'Date',
  'Math',
  'JSON',
  'Promise',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Proxy',
  'Reflect',
  'Error',
  'TypeError',
  'ReferenceError',
  'SyntaxError',
  'RangeError',
  'URIError',
  'EvalError',
])

function isPrototypeExtension(node: unknown): { isExtension: boolean; nativeName: string | null } {
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
  if (obj.type === 'Identifier' && NATIVE_OBJECTS.has(obj.name as string)) {
    if (prop.type === 'Identifier' && prop.name === 'prototype') {
      // This is assignment to NativeObject.prototype itself, not an extension
      return { isExtension: false, nativeName: null }
    }
  }

  return { isExtension: false, nativeName: null }
}

export const noExtendNativeRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow extending native objects. Modifying prototypes of built-in objects can cause unexpected behavior and conflicts with other code.',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-extend-native',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const { isExtension, nativeName } = isPrototypeExtension(node)

        if (!isExtension || !nativeName) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message: `Extending native object '${nativeName}' is not allowed. Use a utility function or wrapper instead.`,
          loc: location,
        })
      },
    }
  },
}

export default noExtendNativeRule
