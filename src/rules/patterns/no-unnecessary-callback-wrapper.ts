import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryCallbackWrapperRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const nn = n as Record<string, unknown>
        const callee = nn.callee
        if (!callee || typeof callee !== 'object') return

        const c = callee as Record<string, unknown>
        if (c.type !== 'ArrowFunctionExpression' && c.type !== 'FunctionExpression') return

        const body = c.body
        if (!body || typeof body !== 'object') return

        const b = body as Record<string, unknown>
        if (b.type !== 'CallExpression') return

        const innerArgs = b.arguments
        if (!Array.isArray(innerArgs)) return

        const innerCallee = b.callee
        if (!innerCallee || typeof innerCallee !== 'object') return

        const ic = innerCallee as Record<string, unknown>
        if (ic.type === 'Identifier' && typeof ic.name === 'string') {
          const outerArgs = nn.arguments
          if (
            Array.isArray(outerArgs) &&
            outerArgs.length === 1 &&
            outerArgs[0] &&
            typeof outerArgs[0] === 'object' &&
            (outerArgs[0] as Record<string, unknown>).type === 'Identifier'
          ) {
            const outerParam = c.params
            if (
              Array.isArray(outerParam) &&
              outerParam.length === 1 &&
              outerParam[0] &&
              typeof outerParam[0] === 'object'
            ) {
              const param = outerParam[0] as Record<string, unknown>
              if (
                param.type === 'Identifier' &&
                innerArgs.length === 1 &&
                innerArgs[0] &&
                typeof innerArgs[0] === 'object'
              ) {
                const innerArg = innerArgs[0] as Record<string, unknown>
                if (
                  innerArg.type === 'Identifier' &&
                  param.name === innerArg.name
                ) {
                  context.report({
                    loc: extractLocation(n),
                    message: `Unnecessary callback wrapper around '${ic.name}'.`,
                    node: n,
                  })
                }
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary callback wrappers that only forward arguments',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-callback-wrapper',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryCallbackWrapperRule
