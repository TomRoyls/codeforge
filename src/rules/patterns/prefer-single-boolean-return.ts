import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isTruthyLiteral(n: ReturnType<typeof toASTNode>): boolean {
  if (!n) return false
  if (n.type === 'Literal' && typeof n.value === 'boolean' && n.value === true) return true
  if (n.type === 'UnaryExpression' && n.operator === '!' && isFalsyLiteral(toASTNode(n.argument))) return true
  return false
}

function isFalsyLiteral(n: ReturnType<typeof toASTNode>): boolean {
  if (!n) return false
  if (n.type === 'Literal' && typeof n.value === 'boolean' && n.value === false) return true
  if (n.type === 'UnaryExpression' && n.operator === '!' && isTruthyLiteral(toASTNode(n.argument))) return true
  return false
}

function isSimpleReturnStatement(n: unknown): { argument: unknown; isReturn: boolean; } {
  const node = toASTNode(n)
  if (!node || node.type !== 'ReturnStatement') return { argument: null, isReturn: false }
  return { argument: node.argument, isReturn: true }
}

function getIfBodyStatements(n: ReturnType<typeof toASTNode>): unknown[] {
  if (!n) return []
  if (n.type === 'BlockStatement' && Array.isArray(n.body)) return n.body
  if (n.type === 'ReturnStatement' || n.type === 'ExpressionStatement') return [n]
  return []
}

export const preferSingleBooleanReturnRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'IfStatement') return

        if (!n.consequent || !n.alternate) return

        const consequentStmts = getIfBodyStatements(toASTNode(n.consequent))
        const alternateStmts = getIfBodyStatements(toASTNode(n.alternate))

        if (consequentStmts.length !== 1 || alternateStmts.length !== 1) return

        const consReturn = isSimpleReturnStatement(consequentStmts[0])
        const altReturn = isSimpleReturnStatement(alternateStmts[0])

        if (!consReturn.isReturn || !altReturn.isReturn) return

        const consArg = toASTNode(consReturn.argument)
        const altArg = toASTNode(altReturn.argument)

        const isTruthyFalsy = isTruthyLiteral(consArg) && isFalsyLiteral(altArg)
        const isFalsyTruthy = isFalsyLiteral(consArg) && isTruthyLiteral(altArg)

        if (!isTruthyFalsy && !isFalsyTruthy) return

        const message = isFalsyTruthy
          ? "Unexpected if-else that returns negated boolean. Use 'return !<condition>' directly."
          : "Unexpected if-else that returns a boolean. Use 'return <condition>' or 'return !!<condition>' directly."

        context.report({
          loc: extractLocation(node),
          message,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer returning a single boolean expression instead of if-else blocks that return true/false literals.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-single-boolean-return',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferSingleBooleanReturnRule
