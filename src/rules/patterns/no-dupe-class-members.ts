import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getMemberKey(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n?.key) return null

  const k = toASTNode(n.key)
  if (!k) return null

  if (k.type === 'Identifier' && typeof k.name === 'string') return k.name
  if (k.type === 'Literal' && typeof k.value === 'string') return k.value
  if (k.type === 'Literal' && typeof k.value === 'number') return String(k.value)
  return null
}

function isMethodDefinition(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'MethodDefinition' || n?.type === 'PropertyDefinition'
}

function getMemberSignature(node: unknown): null | string {
  if (!isMethodDefinition(node)) return null
  const key = getMemberKey(node)
  if (!key) return null
  const n = toASTNode(node)
  const kind = n?.kind || 'method'
  const isStatic = n?.static ? '#static' : ''
  return `${key}|${kind}${isStatic}`
}

export const noDupeClassMembersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ClassBody(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ClassBody' || !Array.isArray(n.body)) return

        const seen = new Map<string, unknown>()
        for (const member of n.body) {
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
