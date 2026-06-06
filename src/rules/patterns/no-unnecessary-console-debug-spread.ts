import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryConsoleDebugSpreadRule: RuleDefinition & Record<string, unknown> = {
  name: 'no-unnecessary-console-debug-spread',
  get type(): string { return this.meta.type },
  get severity(): string { return this.meta.severity },
  get category(): string | undefined { return this.meta.docs?.category },
  get recommended(): boolean | undefined { return this.meta.docs?.recommended },
  get description(): string | undefined { return this.meta.description ?? this.meta.docs?.description },
  get docsUrl(): string | undefined { return this.meta.docsUrl ?? this.meta.docs?.url },
  get schema(): unknown { return this.meta.schema },
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return
        if (!n.arguments || n.arguments.length !== 1) return
        const callee = n.callee
        if (!callee || callee.type !== 'MemberExpression' || callee.computed) return
        if (!callee.object || callee.object.type !== 'Identifier') return
        if (callee.object.name !== 'console') return
        if (!callee.property || callee.property.type !== 'Identifier') return
        if (callee.property.name !== 'debug') return
        const arg = n.arguments[0]
        if (!arg || arg.type !== 'SpreadElement') return
        context.report({
          loc: extractLocation(n),
          message: `console.debug(...items) with a single spread is unusual. Consider passing arguments directly.`,
          node: n,
        })
      },
    }
  },
  meta: {
    description: 'Warn about console.debug(...items) with spread which is likely a mistake.',
    message: 'console.debug(...items) with a single spread is unusual. Consider passing arguments directly.',
    docsUrl: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-debug-spread.ts',
    docs: {
      category: 'patterns',
      description: 'Warn about console.debug(...items) with spread which is likely a mistake.',
      recommended: false,
      url: 'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-debug-spread.ts',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noUnnecessaryConsoleDebugSpreadRule
