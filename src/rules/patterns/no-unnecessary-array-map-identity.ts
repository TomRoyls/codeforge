import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryArrayMapIdentity: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.property || callee.property.type !== 'Identifier' || callee.property.name !== 'map') return
        const arg = n.arguments[0]
        if (!arg || (arg.type !== 'ArrowFunctionExpression' && arg.type !== 'FunctionExpression')) return
        if (!arg.params || arg.params.length !== 1) return
        const param = arg.params[0]
        if (!param || param.type !== 'Identifier') return
        const body = arg.body
        if (!body || Array.isArray(body)) return
        if (body.type === 'BlockStatement') {
          if (!body.body || !Array.isArray(body.body) || body.body.length !== 1) return
          const stmt = body.body[0]
          if (!stmt || stmt.type !== 'ReturnStatement' || !stmt.argument) return
          if (stmt.argument.type !== 'Identifier' || stmt.argument.name !== param.name) return
        } else {
          if (body.type !== 'Identifier' || body.name !== param.name) return
        }
        context.report({
          loc: extractLocation(n),
          message: `Array.prototype.map() with an identity function is unnecessary. Remove the .map() call or use the array directly.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow Array.prototype.map() with an identity function (x => x).',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-map-identity.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryArrayMapIdentity
