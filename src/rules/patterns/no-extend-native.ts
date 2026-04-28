import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

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
  const n = toASTNode(node)
  if (!n) return { isExtension: false, nativeName: null }

  if (n.type !== 'AssignmentExpression') {
    return { isExtension: false, nativeName: null }
  }

  const left = toASTNode(n.left)
  if (!left || left.type !== 'MemberExpression') {
    return { isExtension: false, nativeName: null }
  }

  const obj = toASTNode(left.object)
  const prop = toASTNode(left.property)
  if (!obj || !prop) {
    return { isExtension: false, nativeName: null }
  }

  if (obj.type === 'MemberExpression') {
    const objObj = toASTNode(obj.object)
    const objProp = toASTNode(obj.property)

    if (
      objObj &&
      objProp &&
      objObj.type === 'Identifier' &&
      objProp.type === 'Identifier' &&
      objProp.name === 'prototype' &&
      NATIVE_OBJECTS.has(objObj.name ?? '')
    ) {
      return { isExtension: true, nativeName: objObj.name ?? null }
    }
  }

  if (obj.type === 'Identifier' && NATIVE_OBJECTS.has(obj.name ?? '') && prop.type === 'Identifier' && prop.name === 'prototype') {
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
