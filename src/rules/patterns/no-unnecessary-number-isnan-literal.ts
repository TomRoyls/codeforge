import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isLiteralNode(argNode: Record<string, unknown>): boolean {
  // Babel-style discrete literal types
  if (
    argNode.type === 'BooleanLiteral' ||
    argNode.type === 'NullLiteral' ||
    argNode.type === 'BigIntLiteral'
  ) {
    return true
  }
  // ESTree encodes every primitive literal as { type: 'Literal', value: ... }
  if (argNode.type === 'Literal') return true
  if (argNode.type === 'TemplateLiteral') {
    const expressions = argNode.expressions
    return Array.isArray(expressions) && expressions.length === 0
  }
  return false
}

export const noUnnecessaryNumberIsnanLiteralRule: RuleDefinition = {
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
        const obj = c.object
        const prop = c.property
        if (!obj || !prop || typeof obj !== 'object' || typeof prop !== 'object') return

        const objNode = toASTNode(obj) as Record<string, unknown>
        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!objNode || !propNode) return

        if (objNode.type !== 'Identifier' || objNode.name !== 'Number') return
        if (propNode.type !== 'Identifier' || propNode.name !== 'isNaN') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const arg = args[0]
        if (!arg || typeof arg !== 'object') return

        const argNode = toASTNode(arg) as Record<string, unknown>
        if (!argNode) return

        if (isLiteralNode(argNode)) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary Number.isNaN() call on a literal value. Number.isNaN() always returns false for literal values.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Number.isNaN() on literal values, which always returns false.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-isnan-literal.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNumberIsnanLiteralRule
