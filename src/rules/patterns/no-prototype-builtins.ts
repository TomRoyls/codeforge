import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow calling some Object.prototype methods directly on objects.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) return
        const n = node as Record<string, unknown>
        const callee = n.callee
        if (isMemberExpression(callee)) {
          const member = callee as Record<string, unknown>
          if (isIdentifier(member.property)) {
            const prop = member.property as Record<string, unknown>
            const name = prop.name as string
            if (PROTOTYPE_METHODS.has(name)) {
              context.report({
                message: `Do not call '${name}' directly on an object. Use Object.prototype.${name}.call() instead.`,
                loc: extractLocation(node),
              })
            }
          }
        }
      },
    }
  },
}
export default noPrototypeBuiltinsRule
