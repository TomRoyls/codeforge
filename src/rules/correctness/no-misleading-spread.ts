import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const KNOWN_NON_SPREADABLE = new Set([
  'number',
  'boolean',
  'symbol',
  'bigint',
])

export const noMisleadingSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SpreadElement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'SpreadElement') return

        const arg = toASTNode((n as { argument?: unknown }).argument)
        if (!arg) return

        if (arg.type === 'Literal') {
          const value = (arg as { value?: unknown }).value
          if (value !== null && value !== undefined && KNOWN_NON_SPREADABLE.has(typeof value)) {
            context.report({
              loc: extractLocation(n),
              message: `Spreading a ${typeof value} value is likely a mistake. Spread only works with iterable values (arrays, strings, etc.).`,
              node: n,
            })
          }
        }

        if (arg.type === 'TemplateLiteral') {
          const quasis = (arg as { quasis?: unknown[] }).quasis
          const expressions = (arg as { expressions?: unknown[] }).expressions
          if (quasis?.length === 1 && (expressions?.length ?? 0) === 0) {
            const raw = ((quasis as { value?: { raw?: string } }[])[0]?.value?.raw ?? '')
            if (!raw.includes('${')) {
              context.report({
                loc: extractLocation(n),
                message: 'Spreading a template literal with no expressions is equivalent to spreading a string, which may not be intended.',
                node: n,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow spread of non-iterable primitive values',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-misleading-spread',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMisleadingSpreadRule
