import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
function isObjectExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ObjectExpression'
}
function getPropertyKey(prop: unknown): string | null {
  if (!prop || typeof prop !== 'object') return null
  const p = prop as Record<string, unknown>
  if (p.type === 'Property' && p.key) {
    const key = p.key as Record<string, unknown>
    if (key.type === 'Identifier') return key.name as string
    if (key.type === 'Literal') return String(key.value)
  }
  return null
}
export const noDupeKeysRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow duplicate keys in object literals.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      ObjectExpression(node: unknown): void {
        if (!isObjectExpression(node)) return
        const n = node as Record<string, unknown>
        const properties = n.properties as unknown[] | undefined
        if (!properties) return
        const seenKeys = new Map<string, unknown>()
        for (const prop of properties) {
          const key = getPropertyKey(prop)
          if (key === null) continue
          if (seenKeys.has(key)) {
            context.report({
              message: `Duplicate key '${key}' in object literal.`,
              loc: extractLocation(prop),
            })
          } else {
            seenKeys.set(key, prop)
          }
        }
      },
    }
  },
}
export default noDupeKeysRule
