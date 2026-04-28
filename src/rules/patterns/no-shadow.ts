import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getDeclaratorName(node: unknown): string | undefined {
  const n = toASTNode(node)
  if (!n) return undefined

  if (n.type === 'Identifier') {
    return typeof n.name === 'string' ? n.name : undefined
  }

  if (n.type === 'VariableDeclarator') {
    const id = toASTNode(n.id)
    if (id && id.type === 'Identifier') {
      return typeof id.name === 'string' ? id.name : undefined
    }
  }

  return undefined
}

export const noShadowRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const declaredNames: Set<string> = new Set()

    return {
      VariableDeclarator(node: unknown): void {
        const name = getDeclaratorName(node)

        if (!name) {
          return
        }

        if (declaredNames.has(name)) {
          const location = extractLocation(node)

          context.report({
            loc: location,
            message: `Variable '${name}' is already declared in an outer scope.`,
          })
        }

        declaredNames.add(name)
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow variable shadowing. Variable shadowing can lead to confusion and bugs when an outer scope variable becomes inaccessible.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-shadow',
    },
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noShadowRule
