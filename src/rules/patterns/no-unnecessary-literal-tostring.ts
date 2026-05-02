import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryLiteralTostringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode || calleeNode.type !== 'MemberExpression') return

        const c = calleeNode as Record<string, unknown>
        const prop = c.property
        if (!prop || typeof prop !== 'object') return

        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!propNode || propNode.type !== 'Identifier') return
        if (propNode.name !== 'toString') return

        const obj = c.object
        if (!obj || typeof obj !== 'object') return

        const objNode = toASTNode(obj) as Record<string, unknown>
        if (!objNode) return

        if (objNode.type === 'StringLiteral') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary .toString() on a string literal. The value is already a string.',
            node: n,
          })
        } else if (objNode.type === 'TemplateLiteral') {
          const expressions = objNode.expressions
          if (Array.isArray(expressions) && expressions.length === 0) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary .toString() on a template literal without expressions. The value is already a string.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow .toString() on string literals, which is redundant.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-literal-tostring.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryLiteralTostringRule
