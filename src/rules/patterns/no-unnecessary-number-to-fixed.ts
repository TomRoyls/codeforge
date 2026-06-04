import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNumberToFixedRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'MemberExpression') return

        const property = c.property
        if (!property || typeof property !== 'object') return

        const p = property as Record<string, unknown>
        if (p.type !== 'Identifier' || p.name !== 'toFixed') return

        const obj = c.object
        if (!obj || typeof obj !== 'object') return

        const o = obj as Record<string, unknown>
        if (o.type === 'NumericLiteral' || (o.type === 'Literal' && typeof o.value === 'number')) {
          const args = nn.arguments
          if (
            !Array.isArray(args) ||
            args.length === 0 ||
            (args.length === 1 &&
              isLiteralZero(args[0]))
          ) {
            context.report({
              loc: extractLocation(n),
              message:
                'Unnecessary .toFixed() call without fractional digits. Use String() or template literal instead.',
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
        'Disallow unnecessary .toFixed(0) calls on number literals.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-to-fixed.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function isLiteralZero(arg: unknown): boolean {
  const n = toASTNode(arg)
  if (!n) return false
  const nn = n as Record<string, unknown>
  if ((nn.type === 'NumericLiteral' || (nn.type === 'Literal' && typeof nn.value === 'number')) && nn.value === 0) return true
  if (nn.type === 'UnaryExpression' && nn.operator === '-') {
    const inner = toASTNode(nn.argument)
    if (!inner) return false
    const i = inner as Record<string, unknown>
    if ((i.type === 'NumericLiteral' || (i.type === 'Literal' && typeof i.value === 'number')) && i.value === 0) return true
  }
  return false
}

export default noUnnecessaryNumberToFixedRule
