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

const LITERAL_MAP: Record<string, Record<string, string>> = {
  toBe: {
    null: 'toBeNull',
    undefined: 'toBeUndefined',
    true: 'toBeTruthy',
    false: 'toBeFalsy',
    NaN: 'toBeNaN',
  },
  toEqual: {
    null: 'toBeNull',
    undefined: 'toBeUndefined',
    true: 'toBeTruthy',
    false: 'toBeFalsy',
    NaN: 'toBeNaN',
  },
}

function getLiteralSuggestion(matcher: string, literalValue: unknown): null | string {
  const matcherMap = LITERAL_MAP[matcher]
  if (!matcherMap) return null

  if (literalValue === null) return matcherMap.null ?? null
  if (literalValue === undefined) return matcherMap.undefined ?? null
  if (literalValue === true) return matcherMap.true ?? null
  if (literalValue === false) return matcherMap.false ?? null
  if (typeof literalValue === 'number' && Number.isNaN(literalValue)) return matcherMap.NaN ?? null

  return null
}

function buildMessage(matcher: string, suggestion: string): string {
  return `Use ${suggestion}() instead of ${matcher}().`
}

export const preferLiteralMatchersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        if (!isExpectCall(callee.object)) return

        const matcherName = getPropertyName(callee.property)
        if (typeof matcherName !== 'string') return

        if (matcherName !== 'toBe' && matcherName !== 'toEqual') return

        const args = n.arguments
        if (!Array.isArray(args) || args.length !== 1) return

        const arg = toASTNode(args[0])
        if (!arg || arg.type !== 'Literal') return

        const suggestion = getLiteralSuggestion(matcherName, arg.value)
        if (!suggestion) return

        context.report({
          loc: extractLocation(node),
          message: buildMessage(matcherName, suggestion),
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Prefer literal-specific matchers like toBeNull, toBeUndefined, toBeTruthy, toBeFalsy over toBe/toEqual with literal values',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-literal-matchers',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferLiteralMatchersRule
