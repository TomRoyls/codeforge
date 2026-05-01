import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  isExpectCall,
  toASTNode,
} from '../../utils/ast-helpers.js'

const TRUTHY_LITERALS = new Set<null | number | string | boolean>([true, 1, 'true', '1'])
const FALSY_LITERALS = new Set<null | number | string | boolean>([false, 0, '', 'false', '0', null])

function isSameNode(a: unknown, b: unknown): boolean {
  const na = toASTNode(a)
  const nb = toASTNode(b)
  if (!na || !nb) return false
  if (na.type !== nb.type) return false

  if (na.type === 'Identifier' && nb.type === 'Identifier') {
    return na.name === nb.name
  }

  if (na.type === 'Literal' && nb.type === 'Literal') {
    return na.value === nb.value
  }

  return false
}

export const noRedundantExpectRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        if (!isExpectCall(node)) return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const matcherName = getPropertyName(callee.property)
        if (!matcherName) return

        const expectArg = args[0]
        const expectArgNode = toASTNode(expectArg)

        if (matcherName === 'toBe' || matcherName === 'toEqual' || matcherName === 'toStrictEqual') {
          const matcherArgs = (n as { arguments?: unknown[] }).arguments
          if (!matcherArgs || matcherArgs.length < 1) return

          const matcherArg = matcherArgs[0]
          const matcherArgNode = toASTNode(matcherArg)

          if (!expectArgNode || !matcherArgNode) return

          if (expectArgNode.type === 'Literal' && matcherArgNode.type === 'Literal') {
            const expectVal = expectArgNode.value as null | number | string | boolean
            const matchVal = matcherArgNode.value as null | number | string | boolean

            if ((TRUTHY_LITERALS.has(expectVal) && TRUTHY_LITERALS.has(matchVal)) ||
                (FALSY_LITERALS.has(expectVal) && FALSY_LITERALS.has(matchVal))) {
              context.report({
                loc: extractLocation(node),
                message: `Redundant assertion: expect(${JSON.stringify(expectVal)}).${matcherName}(${JSON.stringify(matchVal)}). This assertion always passes.`,
              })
              return
            }
          }

          if (isSameNode(expectArg, matcherArg)) {
            context.report({
              loc: extractLocation(node),
              message: `Redundant assertion: comparing a value to itself. This assertion always passes.`,
            })
          }
        }

        if (matcherName === 'toBeTruthy') {
          if (expectArgNode && expectArgNode.type === 'Literal') {
            const val = expectArgNode.value as null | number | string | boolean
            if (TRUTHY_LITERALS.has(val)) {
              context.report({
                loc: extractLocation(node),
                message: `Redundant assertion: expect(${JSON.stringify(val)}).toBeTruthy() always passes.`,
              })
            }
          }
        }

        if (matcherName === 'toBeFalsy') {
          if (expectArgNode && expectArgNode.type === 'Literal') {
            const val = expectArgNode.value as null | number | string | boolean
            if (FALSY_LITERALS.has(val)) {
              context.report({
                loc: extractLocation(node),
                message: `Redundant assertion: expect(${JSON.stringify(val)}).toBeFalsy() always passes.`,
              })
            }
          }
        }

        if (matcherName === 'toBeNull') {
          if (expectArgNode && expectArgNode.type === 'Literal' && expectArgNode.value === null) {
            context.report({
              loc: extractLocation(node),
              message: 'Redundant assertion: expect(null).toBeNull() always passes.',
            })
          }
        }

        if (matcherName === 'toBeUndefined') {
          if (expectArgNode && expectArgNode.type === 'Identifier' && expectArgNode.name === 'undefined') {
            context.report({
              loc: extractLocation(node),
              message: 'Redundant assertion: expect(undefined).toBeUndefined() always passes.',
            })
          }
        }

        if (matcherName === 'toBeDefined') {
          if (expectArgNode && expectArgNode.type === 'Literal') {
            context.report({
              loc: extractLocation(node),
              message: 'Redundant assertion: expect().toBeDefined() with a literal always passes.',
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow redundant assertions that always pass, such as expect(true).toBe(true) or comparing a value to itself.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-redundant-expect',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRedundantExpectRule
