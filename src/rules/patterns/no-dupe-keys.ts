import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
function isObjectExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ObjectExpression'
}

function getPropertyKey(prop: unknown): null | string {
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
  create(context: RuleContext): RuleVisitor {
    return {
      ObjectExpression(node: unknown): void {
        if (!isObjectExpression(node)) return
        const n = node as Record<string, unknown>
        const properties = n.properties as undefined | unknown[]
        if (!properties) return
        const seenKeys = new Map<string, unknown>()
        for (const prop of properties) {
          const key = getPropertyKey(prop)
          if (key === null) continue
          if (seenKeys.has(key)) {
            context.report({
              loc: extractLocation(prop),
              message: `Duplicate key '${key}' in object literal.`,
            })
          } else {
            seenKeys.set(key, prop)
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow duplicate keys in object literals.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDupeKeysRule
