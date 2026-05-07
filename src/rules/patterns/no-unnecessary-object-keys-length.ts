import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryObjectKeysLength: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        const outerCallee = n.callee
        if (!outerCallee || outerCallee.type !== 'MemberExpression' || outerCallee.computed) return
        if (!outerCallee.property || outerCallee.property.type !== 'Identifier' || outerCallee.property.name !== 'length') return
        const inner = outerCallee.object
        if (!inner || inner.type !== 'CallExpression') return
        if (!inner.arguments || inner.arguments.length !== 1) return
        const innerCallee = inner.callee
        if (!innerCallee || innerCallee.type !== 'MemberExpression' || innerCallee.computed) return
        if (!innerCallee.object || innerCallee.object.type !== 'Identifier' || innerCallee.object.name !== 'Object') return
        if (!innerCallee.property || innerCallee.property.type !== 'Identifier' || innerCallee.property.name !== 'keys') return
        context.report({
          loc: extractLocation(n),
          message: `Object.keys(obj).length can be replaced with Object.getOwnPropertyNames(obj).length or a simple count approach if only checking emptiness.`,
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Warn about Object.keys(obj).length which may not count symbol-keyed or non-enumerable properties.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-keys-length.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryObjectKeysLength
