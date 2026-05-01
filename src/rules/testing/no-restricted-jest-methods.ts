import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getPropertyName, toASTNode } from '../../utils/ast-helpers.js'

interface RestrictedJestMethodsOptions {
  restrictedMethods?: string[]
}

function getOptions(context: RuleContext): RestrictedJestMethodsOptions {
  const options = context.config?.options
  if (
    Array.isArray(options) &&
    options.length > 0 &&
    typeof options[0] === 'object' &&
    options[0] !== null
  ) {
    return options[0] as RestrictedJestMethodsOptions
  }
  return {}
}

export const noRestrictedJestMethodsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = getOptions(context)
    const restrictedMethods = new Set<string>(
      options.restrictedMethods ?? [],
    )

    return {
      CallExpression(node: unknown): void {
        if (restrictedMethods.size === 0) return

        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'Identifier') return

        if (typeof object.name !== 'string' || object.name !== 'jest') return

        const methodName = getPropertyName(callee.property)
        if (methodName === null || !restrictedMethods.has(methodName)) return

        context.report({
          loc: extractLocation(node),
          message:
            "Use of restricted jest method '" +
            methodName +
            "' is not allowed.",
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow specific jest methods configured by the user',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-restricted-jest-methods',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          restrictedMethods: {
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

export default noRestrictedJestMethodsRule
