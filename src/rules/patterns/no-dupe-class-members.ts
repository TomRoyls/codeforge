import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isClassBody(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ClassBody'
}

function isMethodDefinition(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'MethodDefinition' || n.type === 'PropertyDefinition'
}

function getMemberKey(node: unknown): null | string {
  if (!node || typeof node !== 'object') return null
  const n = node as Record<string, unknown>
  const {key} = n
  if (!key || typeof key !== 'object') return null
  const k = key as Record<string, unknown>
  if (k.type === 'Identifier' && typeof k.name === 'string') return k.name
  if (k.type === 'Literal' && typeof k.value === 'string') return k.value
  if (k.type === 'Literal' && typeof k.value === 'number') return String(k.value)
  return null
}

function getMemberSignature(node: unknown): null | string {
  if (!isMethodDefinition(node)) return null
  const n = node as Record<string, unknown>
  const key = getMemberKey(node)
  if (!key) return null
  const kind = n.kind || 'method'
  const isStatic = n.static ? '#static' : ''
  return `${key}|${kind}${isStatic}`
}

export const noDupeClassMembersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ClassBody(node: unknown): void {
        if (!isClassBody(node)) return
        const n = node as Record<string, unknown>
        const {body} = n
        if (!Array.isArray(body)) return

        const seen = new Map<string, unknown>()
        for (const member of body) {
          if (!isMethodDefinition(member)) continue
          const sig = getMemberSignature(member)
          if (sig) {
            if (seen.has(sig)) {
              context.report({
                loc: extractLocation(member),
                message: `Duplicate class member '${sig.split('|')[0]}'.`,
              })
            }

            seen.set(sig, member)
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow duplicate class members.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noDupeClassMembersRule
