import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const PROTOTYPE_METHODS = new Set(['hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'])

function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'CallExpression'
}

function isMemberExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'MemberExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noPrototypeBuiltinsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) return
        const n = node as Record<string, unknown>
        const {callee} = n
        if (isMemberExpression(callee)) {
          const member = callee as Record<string, unknown>
          if (isIdentifier(member.property)) {
            const prop = member.property as Record<string, unknown>
            const name = prop.name as string
            if (PROTOTYPE_METHODS.has(name)) {
              context.report({
                loc: extractLocation(node),
                message: `Do not call '${name}' directly on an object. Use Object.prototype.${name}.call() instead.`,
              })
            }
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow calling some Object.prototype methods directly on objects.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noPrototypeBuiltinsRule
