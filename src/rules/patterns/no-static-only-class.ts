import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noStaticOnlyClassRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ClassDeclaration(node: unknown): void {
        checkClass(node)
      },
      ClassExpression(node: unknown): void {
        checkClass(node)
      },
    }

    function checkClass(n: unknown): void {
      const node = toASTNode(n)
      if (!node) return

      const body = (node as { body?: { body?: unknown[] } }).body
      if (!body?.body || !Array.isArray(body.body) || body.body.length === 0) return

      const members = body.body as unknown[]
      let hasInstanceMember = false

      for (const member of members) {
        const m = toASTNode(member)
        if (!m) continue

        const isStatic = (m as { static?: boolean }).static === true
        const kind = (m as { kind?: string }).kind

        if (!isStatic && kind !== 'constructor') {
          hasInstanceMember = true
          break
        }
      }

      if (!hasInstanceMember) {
        context.report({
          loc: extractLocation(node),
          message: 'Class has only static members. Consider using a plain object or module instead.',
          node: node,
        })
      }
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow classes that contain only static members',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-static-only-class',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noStaticOnlyClassRule
