import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryJsonStringifyLiteralRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const calleeNode = toASTNode(callee)
        if (!calleeNode) return

        const c = calleeNode as Record<string, unknown>
        if (c.type !== 'MemberExpression') return

        const obj = c.object
        const prop = c.property
        if (!obj || !prop || typeof obj !== 'object' || typeof prop !== 'object') return

        const objNode = toASTNode(obj) as Record<string, unknown>
        const propNode = toASTNode(prop) as Record<string, unknown>
        if (!objNode) return

        if (objNode.type !== 'Identifier' || objNode.name !== 'JSON') return
        if (propNode.type !== 'Identifier' || propNode.name !== 'stringify') return

        const args = nn.arguments
        if (!Array.isArray(args) || args.length < 1) return

        const firstArg = args[0]
        if (!firstArg || typeof firstArg !== 'object') return

        const argNode = toASTNode(firstArg)
        if (!argNode) return

        const a = argNode as Record<string, unknown>
        const t = a.type as string

        if (t === 'Literal' && typeof a.value === 'string') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary JSON.stringify on a string literal. Stringify a string always wraps it in quotes. Use the string directly.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary JSON.stringify() on string literals.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-json-stringify-literal.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryJsonStringifyLiteralRule
