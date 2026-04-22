import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
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

function getNodeType(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null
  return ((node as Record<string, unknown>).type as string) ?? null
}

export const noUselessUndefinedRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow useless undefined initializations and return values. Undefined is the default for uninitialized variables and void returns.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        if (!isReturnStatement(node)) return
        const n = node as Record<string, unknown>
        const argument = n.argument
        if (isUndefinedIdentifier(argument)) {
          context.report({
            message: 'Useless return of undefined. Remove the undefined or use void return.',
            loc: extractLocation(node),
          })
        }
      },

      VariableDeclarator(node: unknown): void {
        const type = getNodeType(node)
        if (type !== 'VariableDeclarator') return
        const n = node as Record<string, unknown>
        const init = n.init
        if (isUndefinedIdentifier(init)) {
          context.report({
            message: 'Useless undefined initialization. Variables are undefined by default.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noUselessUndefinedRule
