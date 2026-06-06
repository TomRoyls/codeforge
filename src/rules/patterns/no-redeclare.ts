import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noRedeclareRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const declared = new Set<string>()

    return {
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'FunctionDeclaration') return

        const id = toASTNode(n.id)
        if (id?.type !== 'Identifier') return

        const name = id.name ?? ''

        if (declared.has(name)) {
          context.report({
            loc: extractLocation(node),
            message: `'${name}' is already defined.`,
          })
        }

        declared.add(name)
      },
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'VariableDeclarator') return

        const id = toASTNode(n.id)
        if (id?.type !== 'Identifier') return

        const name = id.name ?? ''

        if (declared.has(name)) {
          context.report({
            loc: extractLocation(node),
            message: `'${name}' is already defined.`,
          })
        }

        declared.add(name)
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow redeclaring variables.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-redeclare.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noRedeclareRule
