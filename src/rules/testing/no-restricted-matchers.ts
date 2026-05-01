import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isExpectCall, toASTNode } from '../../utils/ast-helpers.js'

interface RestrictedMatchersOptions {
  restrictedMatchers?: string[]
}

function getOptions(context: RuleContext): RestrictedMatchersOptions {
  const options = context.config?.options
  if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && options[0] !== null) {
    return options[0] as RestrictedMatchersOptions
  }
  return {}
}

function detectRestrictedMatcher(
  node: unknown,
  restrictedMatchers: ReadonlySet<string>,
): null | { matcherName: string } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return null

  const property = toASTNode(callee.property)
  if (!property || property.type !== 'Identifier' || typeof property.name !== 'string') return null

  const matcherName = property.name
  if (!restrictedMatchers.has(matcherName)) return null

  const object = toASTNode(callee.object)
  if (!object) return null

  if (isExpectCall(object)) {
    return { matcherName }
  }

  if (object.type === 'MemberExpression') {
    const innerProp = toASTNode(object.property)
    if (
      innerProp &&
      innerProp.type === 'Identifier' &&
      typeof innerProp.name === 'string' &&
      innerProp.name === 'not'
    ) {
      const innerObj = toASTNode(object.object)
      if (innerObj && isExpectCall(innerObj)) {
        return { matcherName }
      }
    }
  }

  return null
}

export const noRestrictedMatchersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = getOptions(context)
    const restrictedMatchers = new Set<string>(options.restrictedMatchers ?? [])

    return {
      CallExpression(node: unknown): void {
        if (restrictedMatchers.size === 0) return

        const result = detectRestrictedMatcher(node, restrictedMatchers)
        if (!result) return

        context.report({
          loc: extractLocation(node),
          message: `Use of restricted matcher '${result.matcherName}' is not allowed.`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow specific matchers configured by the user',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-restricted-matchers',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          restrictedMatchers: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRestrictedMatchersRule
