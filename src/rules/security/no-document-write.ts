import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noDocumentWriteRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode((n as { callee?: unknown }).callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const obj = toASTNode((callee as { object?: unknown }).object)
        if (!obj || obj.type !== 'Identifier') return

        const objName = (obj as { name?: string }).name
        if (objName !== 'document') return

        const property = toASTNode((callee as { property?: unknown }).property)
        if (!property || property.type !== 'Identifier') return

        const propName = (property as { name?: string }).name
        if (propName !== 'write' && propName !== 'writeln') return

        context.report({
          loc: extractLocation(n),
          message: `\`document.${propName}()\` is a security risk and can lead to XSS attacks. Use DOM manipulation methods like \`textContent\`, \`createElement\`, or \`innerHTML\` with sanitization instead.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow use of document.write() and document.writeln()',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-document-write',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noDocumentWriteRule
