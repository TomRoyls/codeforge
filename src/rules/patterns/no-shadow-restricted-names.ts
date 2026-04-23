import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const RESTRICTED_NAMES = new Set(['arguments', 'eval', 'Infinity', 'NaN', 'undefined'])

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
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        if (!isFunctionDeclaration(node)) return
        const n = node as Record<string, unknown>
        if (n.id && isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          const name = id.name as string
          if (RESTRICTED_NAMES.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Shadowing of global property '${name}'.`,
            })
          }
        }
      },
      VariableDeclarator(node: unknown): void {
        if (!isVariableDeclarator(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          const name = id.name as string
          if (RESTRICTED_NAMES.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Shadowing of global property '${name}'.`,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow identifiers from shadowing restricted names.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noShadowRestrictedNamesRule
