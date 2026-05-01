import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryLiteralKeyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSPropertySignature(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TSPropertySignature') return

        const nn = n as Record<string, unknown>
        const key = nn.key
        if (!key || typeof key !== 'object') return

        const k = key as Record<string, unknown>
        if (k.type !== 'Literal' || typeof k.value !== 'string') return

        const name = k.value as string
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
          context.report({
            loc: extractLocation(n),
            message: `Unnecessary quoted key '${name}'. Use unquoted '${name}' instead.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary quoted string literal keys in type declarations',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-literal-key',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryLiteralKeyRule
