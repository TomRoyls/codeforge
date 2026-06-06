import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryWeakMapSetSpreadRule: RuleDefinition & Record<string, unknown> = {
  name: 'no-unnecessary-weakmap-set-spread',
  get type(): string { return this.meta.type },
  get severity(): string { return this.meta.severity },
  get category(): string | undefined { return this.meta.docs?.category },
  get recommended(): boolean | undefined { return this.meta.docs?.recommended },
  get description(): string | undefined { return this.meta.docs?.description },
  get docsUrl(): string | undefined { return this.meta.docs?.url },
  get schema(): unknown { return this.meta.schema },
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        if (n.type && n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression') return
        if (callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'weakMap') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'set') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: 'weakMap.set(...items) with a single spread is unusual. Consider passing arguments directly.',
          messageId: 'unnecessary-spread',
          node: n,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Warn about weakMap.set(...items) with spread which may be clearer with explicit arguments.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-weakmap-set-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryWeakMapSetSpreadRule
