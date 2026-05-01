import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryClassRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ClassDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ClassDeclaration') return

        const nn = n as Record<string, unknown>
        const body = nn.body
        if (!body || typeof body !== 'object') return

        const b = body as Record<string, unknown>
        const bodyItems = b.body
        if (!Array.isArray(bodyItems) || bodyItems.length !== 0) return

        const superClass = nn.superClass
        if (superClass !== null && superClass !== undefined) return

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary empty class with no superclass or body.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow empty classes with no superclass or body',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-class',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryClassRule
