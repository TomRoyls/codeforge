import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayFindIndexLiteral: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier' || callee.property.name !== 'findIndex') return
        const arg = n.arguments[0]
        if (arg.type !== 'ArrowFunctionExpression' && arg.type !== 'FunctionExpression') return
        if (arg.params.length !== 1) return
        const param = arg.params[0]
        if (param.type !== 'Identifier') return
        const body = arg.body
        if (body.type === 'BlockStatement') {
          if (body.body.length !== 1) return
          const stmt = body.body[0]
          if (stmt.type !== 'ReturnStatement' || !stmt.argument) return
          if (stmt.argument.type !== 'BinaryExpression') return
          if (stmt.argument.operator !== '===' && stmt.argument.operator !== '==') return
          const left = stmt.argument.left
          const right = stmt.argument.right
          const identifierSide = left.type === 'Identifier' && left.name === param.name ? left : right.type === 'Identifier' && right.name === param.name ? right : null
          if (!identifierSide) return
          const literalSide = identifierSide === left ? right : left
          if (literalSide.type === 'NumericLiteral' || literalSide.type === 'StringLiteral') {
            context.report({
              loc: extractLocation(n),
              message: `Array.prototype.findIndex() with a literal comparison can be replaced with indexOf().`,
              node: n,
            })
          }
        } else {
          if (body.type !== 'BinaryExpression') return
          if (body.operator !== '===' && body.operator !== '==') return
          const identifierSide = body.left.type === 'Identifier' && body.left.name === param.name ? body.left : body.right.type === 'Identifier' && body.right.name === param.name ? body.right : null
          if (!identifierSide) return
          const literalSide = identifierSide === body.left ? body.right : body.left
          if (literalSide.type === 'NumericLiteral' || literalSide.type === 'StringLiteral') {
            context.report({
              loc: extractLocation(n),
              message: `Array.prototype.findIndex() with a literal comparison can be replaced with indexOf().`,
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
        'Disallow Array.prototype.findIndex() with simple literal comparisons that could use indexOf().',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-index-literal.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayFindIndexLiteral
