import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noFloatingPromisesReturnedRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ReturnStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ReturnStatement') return

        const argument = (n as Record<string, unknown>).argument
        if (!argument || typeof argument !== 'object') return
        const arg = argument as Record<string, unknown>

        if (arg.type === 'CallExpression') {
          const callee = arg.callee
          if (callee && typeof callee === 'object') {
            const c = callee as Record<string, unknown>
            if (c.type === 'Identifier' && typeof c.name === 'string' && c.name.endsWith('Async')) {
              context.report({
                loc: extractLocation(n),
                message: 'Floating Promise returned without being awaited.',
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
      category: 'patterns',
      description: 'Disallow returning unawaited async function calls',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-floating-promises-returned',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noFloatingPromisesReturnedRule
