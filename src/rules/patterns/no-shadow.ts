import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function getDeclaratorName(node: unknown): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }

  const n = node as Record<string, unknown>

  if (n.type === 'Identifier') {
    return typeof n.name === 'string' ? n.name : undefined
  }

  if (n.type === 'VariableDeclarator') {
    const id = n.id as Record<string, unknown> | undefined
    if (id && typeof id === 'object' && id.type === 'Identifier') {
      return typeof id.name === 'string' ? id.name : undefined
    }
  }

  return undefined
}

export const noShadowRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow variable shadowing. Variable shadowing can lead to confusion and bugs when an outer scope variable becomes inaccessible.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-shadow',
    },
    schema: [],
  },

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
            message: `Variable '${name}' is already declared in an outer scope.`,
            loc: location,
          })
        }

        declaredNames.add(name)
      },
    }
  },
}

export default noShadowRule
