import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, toASTNode } from '../../utils/ast-helpers.js'

const RESTRICTED_NAMES = new Set(['arguments', 'eval', 'Infinity', 'NaN', 'undefined'])

export const noShadowRestrictedNamesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'FunctionDeclaration') return
        if (n.id && isIdentifier(n.id)) {
          const name = toASTNode(n.id)?.name
          if (name && RESTRICTED_NAMES.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Shadowing of global property '${name}'.`,
            })
          }
        }
      },
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'VariableDeclarator') return
        if (isIdentifier(n.id)) {
          const name = toASTNode(n.id)?.name
          if (name && RESTRICTED_NAMES.has(name)) {
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-shadow-restricted-names.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noShadowRestrictedNamesRule
