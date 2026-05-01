/**
 * @module rules/patterns/no-use-extend-native
 * Disallows extending native objects.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const NATIVE_NAMES = new Set([
  'Object',
  'Function',
  'Boolean',
  'Symbol',
  'Error',
  'Number',
  'BigInt',
  'Math',
  'Date',
  'String',
  'RegExp',
  'Array',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Promise',
  'Proxy',
])

export const noUseExtendNativeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        if (calleeNode.type !== 'MemberExpression') return

        const object = (calleeNode as { object?: unknown }).object
        const objectNode = toASTNode(object)
        if (!objectNode || objectNode.type !== 'Identifier') return

        const objectName = (objectNode as { name?: unknown }).name
        if (typeof objectName !== 'string') return

        const property = (calleeNode as { property?: unknown }).property
        const propertyNode = toASTNode(property)
        if (!propertyNode || propertyNode.type !== 'Identifier') return

        const propertyName = (propertyNode as { name?: unknown }).name
        if (typeof propertyName !== 'string') return

        if (
          NATIVE_NAMES.has(objectName) &&
          (propertyName === 'extend' || propertyName === 'assign')
        ) {
          context.report({
            loc: extractLocation(n),
            message: `Do not extend native object '${objectName}'.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow extending native objects',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-use-extend-native',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUseExtendNativeRule
