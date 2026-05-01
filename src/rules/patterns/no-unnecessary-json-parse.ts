import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryJsonParseRule: RuleDefinition = {
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

        const obj = c.object
        if (!obj || typeof obj !== 'object') return

        const o = obj as Record<string, unknown>
        if (o.type !== 'Identifier' || o.name !== 'JSON') return

        const property = c.property
        if (!property || typeof property !== 'object') return

        const p = property as Record<string, unknown>
        if (p.type !== 'Identifier' || p.name !== 'parse') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const arg = firstArg as Record<string, unknown>
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          const val = arg.value as string
          if (val.startsWith('{') || val.startsWith('[')) {
            context.report({
              loc: extractLocation(n),
              message: 'Unnecessary JSON.parse() on a static string. Use the value directly.',
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
      description: 'Disallow unnecessary JSON.parse() calls on static strings',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-json-parse',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryJsonParseRule
