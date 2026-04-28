import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isUndefinedIdentifier(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Identifier' && n.name === 'undefined'
}

export const noUselessUndefinedRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ReturnStatement') return
        if (isUndefinedIdentifier(n.argument)) {
          context.report({
            loc: extractLocation(node),
            message: 'Useless return of undefined. Remove the undefined or use void return.',
          })
        }
      },

      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'VariableDeclarator') return
        if (isUndefinedIdentifier(n.init)) {
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
