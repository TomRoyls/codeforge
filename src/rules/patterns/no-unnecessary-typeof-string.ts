import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isStringLiteral(node: Record<string, unknown>): boolean {
  const t = node.type as string
  if (t === 'StringLiteral') return true
  if (t === 'Literal' && typeof node.value === 'string') return true
  if (t === 'TemplateLiteral') {
    const exprs = node.expressions
    if (Array.isArray(exprs) && exprs.length === 0) return true
  }
  return false
}

export const noUnnecessaryTypeofStringRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '===' && nn.operator !== '!==') return

        const left = nn.left
        const right = nn.right
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return

        const leftNode = toASTNode(left)
        const rightNode = toASTNode(right)
        if (!leftNode || !rightNode) return

        const l = leftNode as Record<string, unknown>
        const r = rightNode as Record<string, unknown>

        const leftIsTypeof = l.type === 'UnaryExpression' && (l as Record<string, unknown>).operator === 'typeof'
        const rightIsString = r.type === 'StringLiteral' || (r.type === 'Literal' && r.value === 'string')

        if (leftIsTypeof && rightIsString) {
          const typeofArg = (l as Record<string, unknown>).argument
          if (!typeofArg || typeof typeofArg !== 'object') return

          const argNode = toASTNode(typeofArg)
          if (!argNode) return

          const a = argNode as Record<string, unknown>
          if (isStringLiteral(a)) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary typeof check on a string literal. The result is always "string".',
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
        'Disallow typeof comparison on values that are already string literals.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-typeof-string.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTypeofStringRule
