import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getPropertyKey(prop: unknown): null | string {
  const p = toASTNode(prop)
  if (p?.type === 'Property' && p.key) {
    if (p.computed) return null
    const key = toASTNode(p.key)
    if (!key) return null
    if (key.type === 'Identifier') return key.name ?? null
    if (key.type === 'Literal' && 'value' in key) return String(key.value)
  }

  return null
}

export const noDupeKeysRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ObjectExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ObjectExpression') return

        const properties = n.properties as undefined | unknown[]
        if (!properties) return

        const seenKeys = new Map<string, unknown>()
        for (const prop of properties) {
          const key = getPropertyKey(prop)
          if (key === null) continue
          if (seenKeys.has(key)) {
            context.report({ loc: extractLocation(prop), message: `Duplicate key '${key}' in object literal.` })
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-dupe-keys.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDupeKeysRule
