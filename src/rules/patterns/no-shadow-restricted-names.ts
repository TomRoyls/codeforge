import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const RESTRICTED_NAMES = new Set(['undefined', 'NaN', 'Infinity', 'eval', 'arguments'])

function isVariableDeclarator(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclarator'
}

function isFunctionDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'FunctionDeclaration'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noShadowRestrictedNamesRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow identifiers from shadowing restricted names.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        if (!isVariableDeclarator(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          const name = id.name as string
          if (RESTRICTED_NAMES.has(name)) {
            context.report({
              message: `Shadowing of global property '${name}'.`,
              loc: extractLocation(node),
            })
          }
        }
      },
      FunctionDeclaration(node: unknown): void {
        if (!isFunctionDeclaration(node)) return
        const n = node as Record<string, unknown>
        if (n.id && isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          const name = id.name as string
          if (RESTRICTED_NAMES.has(name)) {
            context.report({
              message: `Shadowing of global property '${name}'.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noShadowRestrictedNamesRule
