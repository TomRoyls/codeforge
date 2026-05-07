import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryRegexpConstructorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        checkNewOrCall(n as Record<string, unknown>, context)
      },
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return
        checkNewOrCall(n as Record<string, unknown>, context)
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary RegExp constructor calls with regex literal arguments.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-regexp-constructor.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

function checkNewOrCall(
  node: Record<string, unknown>,
  context: RuleContext,
): void {
  const callee = node.callee
  if (!callee || typeof callee !== 'object') return

  const c = callee as Record<string, unknown>
  if (c.type !== 'Identifier' || c.name !== 'RegExp') return

  const args = node.arguments
  if (!Array.isArray(args) || args.length === 0) return

  const firstArg = toASTNode(args[0])
  if (!firstArg) return

  const fa = firstArg as Record<string, unknown>
  if (fa.type === 'RegExpLiteral') {
    context.report({
      loc: extractLocation(firstArg),
      message:
        'Unnecessary RegExp constructor call with a regex literal argument. Use the regex literal directly.',
      node: firstArg,
    })
  }
}

export default noUnnecessaryRegexpConstructorRule
