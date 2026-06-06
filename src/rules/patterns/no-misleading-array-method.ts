import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const SIDE_EFFECT_METHODS = new Set(['forEach'])
const MISLEADING_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'find', 'findIndex', 'some', 'every', 'flatMap'])

export const noMisleadingArrayMethodRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee || (callee as { type?: string }).type !== 'MemberExpression') return

        const property = (callee as { property?: unknown }).property
        if (!property) return

        const propType = (property as { type?: string }).type
        let methodName = ''
        if (propType === 'Identifier') {
          methodName = (property as { name?: string }).name ?? ''
        } else if (propType === 'Literal' && typeof (property as { value?: unknown }).value === 'string') {
          methodName = (property as { value?: string }).value ?? ''
        }

        if (!methodName) return

        if (SIDE_EFFECT_METHODS.has(methodName)) {
          const args = (n as { arguments?: unknown[] }).arguments
          if (args && args.length > 0) {
            const callback = args[0]
            if (callback && (callback as { type?: string }).type === 'ArrowFunctionExpression') {
              const body = (callback as { body?: unknown }).body
              if (body && (body as { type?: string }).type === 'BlockStatement') {
                const stmts = (body as { body?: unknown[] }).body
                if (stmts && stmts.length > 0) {
                  const first = stmts[0]
                  if (first && (first as { type?: string }).type === 'ReturnStatement') {
                    const arg = (first as { argument?: unknown }).argument
                    if (!arg) {
                      context.report({
                        loc: extractLocation(n),
                        message: `Avoid using '${methodName}' with an early return. Consider using 'some', 'every', or 'find' instead for clarity.`,
                        node: n,
                      })
                    }
                  }
                }
              }
            }
          }
        }

        if (MISLEADING_METHODS.has(methodName)) {
          const args = (n as { arguments?: unknown[] }).arguments
          if (args && args.length > 0) {
            const callback = args[0]
            if (callback && (callback as { type?: string }).type === 'ArrowFunctionExpression') {
              const body = (callback as { body?: unknown }).body
              if (body && (body as { type?: string }).type !== 'BlockStatement') {
                const parent = (n as { parent?: unknown }).parent
                if (parent && (parent as { type?: string }).type === 'ExpressionStatement') {
                  context.report({
                    loc: extractLocation(n),
                    message: `The return value of '${methodName}()' is not used. Use 'forEach' instead if you don't need the result.`,
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
      description: 'Detect misleading use of array methods where the intent is unclear',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-misleading-array-method',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMisleadingArrayMethodRule
