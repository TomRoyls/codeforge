import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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

function getMemberKey(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null
  const n = node as Record<string, unknown>
  const key = n.key
  if (!key || typeof key !== 'object') return null
  const k = key as Record<string, unknown>
  if (k.type === 'Identifier' && typeof k.name === 'string') return k.name
  if (k.type === 'Literal' && typeof k.value === 'string') return k.value
  if (k.type === 'Literal' && typeof k.value === 'number') return String(k.value)
  return null
}

function getMemberSignature(node: unknown): string | null {
  if (!isMethodDefinition(node)) return null
  const n = node as Record<string, unknown>
  const key = getMemberKey(node)
  if (!key) return null
  const kind = n.kind || 'method'
  const isStatic = n.static ? '#static' : ''
  return `${key}|${kind}${isStatic}`
}

export const noDupeClassMembersRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow duplicate class members.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      ClassBody(node: unknown): void {
        if (!isClassBody(node)) return
        const n = node as Record<string, unknown>
        const body = n.body
        if (!Array.isArray(body)) return
        
        const seen = new Map<string, unknown>()
        for (const member of body) {
          if (!isMethodDefinition(member)) continue
          const sig = getMemberSignature(member)
          if (sig) {
            if (seen.has(sig)) {
              context.report({
                message: `Duplicate class member '${sig.split('|')[0]}'.`,
                loc: extractLocation(member),
              })
            }
            seen.set(sig, member)
          }
        }
      },
    }
  },
}
export default noDupeClassMembersRule
