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

const ASYMMETRIC_MATCHER_NAMES = new Set([
  'any',
  'anything',
  'arrayContaining',
  'objectContaining',
  'stringContaining',
  'stringMatching',
])

const REFERENCE_MATCHERS = new Set(['toBe'])

const MESSAGE =
  'Use toEqual() or toStrictEqual() instead of toBe() when using asymmetric matchers. toBe() checks reference equality and will always fail with asymmetric matchers.'

function isAsymmetricMatcher(arg: unknown): boolean {
  const n = toASTNode(arg)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return false

  const obj = toASTNode(callee.object)
  if (!obj || obj.type !== 'Identifier' || typeof obj.name !== 'string') return false

  if (obj.name !== 'expect') return false

  const prop = getPropertyName(callee.property)
  if (typeof prop !== 'string') return false

  return ASYMMETRIC_MATCHER_NAMES.has(prop)
}

export const noMisusedMatchersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        if (!isExpectCall(callee.object)) return

        const matcherName = getPropertyName(callee.property)
        if (typeof matcherName !== 'string' || !REFERENCE_MATCHERS.has(matcherName)) return

        const args = n.arguments
        if (!Array.isArray(args) || args.length === 0) return

        for (const arg of args) {
          if (isAsymmetricMatcher(arg)) {
            context.report({
              loc: extractLocation(node),
              message: MESSAGE,
              node,
            })
            return
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow using toBe() with asymmetric matchers like expect.any(), expect.objectContaining() etc.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-misused-matchers',
    },
    severity: 'error',
    type: 'problem',
  },
}

export default noMisusedMatchersRule
