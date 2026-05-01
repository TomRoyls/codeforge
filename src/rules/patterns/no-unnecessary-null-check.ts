import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNullCheckRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const operator = (n as { operator?: string }).operator
        if (operator !== '!==' && operator !== '!=') return

        const left = (n as { left?: unknown }).left
        const right = (n as { right?: unknown }).right
        if (!left || !right) return

        const isNullLiteral = (side: unknown): boolean => {
          if (!side || typeof side !== 'object') return false
          return (side as { type?: string }).type === 'NullLiteral'
        }

        const isUndefinedIdentifier = (side: unknown): boolean => {
          if (!side || typeof side !== 'object') return false
          const s = side as { type?: string; name?: string }
          return s.type === 'Identifier' && s.name === 'undefined'
        }

        const isVoidUnary = (side: unknown): boolean => {
          if (!side || typeof side !== 'object') return false
          const s = side as { type?: string; operator?: string; argument?: unknown }
          return s.type === 'UnaryExpression' && s.operator === 'void'
        }

        if (isNullLiteral(right) || isUndefinedIdentifier(right) || isVoidUnary(right)) {
          const parent = (n as { _parent?: unknown })._parent
          if (parent && (parent as { type?: string }).type === 'IfStatement') {
            const consequent = (parent as { consequent?: unknown }).consequent
            if (consequent && (consequent as { type?: string }).type === 'BlockStatement') {
              const body = (consequent as { body?: unknown[] }).body
              if (body && body.length > 0) {
                for (const stmt of body) {
                  if (!stmt || typeof stmt !== 'object') continue
                  const s = stmt as Record<string, unknown>
                  if (s.type === 'IfStatement') {
                    const innerTest = s.test
                    if (innerTest) {
                      const innerType = (innerTest as { type?: string }).type
                      if (innerType === 'BinaryExpression') {
                        const innerOp = (innerTest as { operator?: string }).operator
                        if (innerOp === '!==' || innerOp === '!=' || innerOp === '===' || innerOp === '==') {
                          const innerLeft = (innerTest as { left?: unknown }).left
                          const innerRight = (innerTest as { right?: unknown }).right
                          if (
                            (isNullLiteral(innerRight) || isUndefinedIdentifier(innerRight) || isVoidUnary(innerRight)) &&
                            JSON.stringify(innerLeft) === JSON.stringify(left)
                          ) {
                            context.report({
                              loc: extractLocation(innerTest as Record<string, unknown>),
                              message: 'Redundant null/undefined check. The outer condition already ensures the value is not null/undefined.',
                              node: innerTest as Record<string, unknown>,
                            })
                          }
                        }
                      }
                    }
                  }
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
      description: 'Detect redundant null/undefined checks after truthy guards',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-null-check',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNullCheckRule
