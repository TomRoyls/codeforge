import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isIdentifier(node: unknown, name: string): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier' && n.name === name
}

function isUndefinedIdentifier(node: unknown): boolean {
  return isIdentifier(node, 'undefined')
}

function isReturnStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  return (node as Record<string, unknown>).type === 'ReturnStatement'
}

function getNodeType(node: unknown): null | string {
  if (!node || typeof node !== 'object') return null
  return ((node as Record<string, unknown>).type as string) ?? null
}

export const noUselessUndefinedRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        if (!isReturnStatement(node)) return
        const n = node as Record<string, unknown>
        const {argument} = n
        if (isUndefinedIdentifier(argument)) {
          context.report({
            loc: extractLocation(node),
            message: 'Useless return of undefined. Remove the undefined or use void return.',
          })
        }
      },

      VariableDeclarator(node: unknown): void {
        const type = getNodeType(node)
        if (type !== 'VariableDeclarator') return
        const n = node as Record<string, unknown>
        const {init} = n
        if (isUndefinedIdentifier(init)) {
          context.report({
            loc: extractLocation(node),
            message: 'Useless undefined initialization. Variables are undefined by default.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow useless undefined initializations and return values. Undefined is the default for uninitialized variables and void returns.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUselessUndefinedRule
