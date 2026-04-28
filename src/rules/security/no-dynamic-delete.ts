/**
 * @file Disallow dynamic property deletion which can bypass security checks
 * @module rules/security/no-dynamic-delete
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoDynamicDeleteOptions {
  readonly allowInTests?: boolean
}

function isStaticProperty(argument: unknown): boolean {
  const arg = toASTNode(argument)
  if (!arg) {
    return true
  }

  if (arg.type === 'Literal') {
    return typeof arg.value === 'string' || typeof arg.value === 'number'
  }

  if (arg.type === 'Identifier') {
    return false
  }

  if (arg.type === 'MemberExpression') {
    return false
  }

  if (arg.type === 'CallExpression') {
    return false
  }

  if (arg.type === 'TemplateLiteral') {
    return (arg.expressions as unknown[])?.length === 0
  }

  return false
}

function isTestContext(context: RuleContext): boolean {
  const filePath = context.getFilePath()
  return (
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('__tests__') ||
    filePath.includes('test/')
  )
}

export const noDynamicDeleteRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoDynamicDeleteOptions>(context.config.options, {
      allowInTests: false,
    })

    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) {
          return
        }

        if (n.operator !== 'delete') {
          return
        }

        const arg = toASTNode(n.argument)
        if (!arg) {
          return
        }

        if (arg.type !== 'MemberExpression') {
          return
        }

        const {property} = arg
        const {computed} = arg

        if (!computed) {
          return
        }

        if (isStaticProperty(property)) {
          return
        }

        if (options.allowInTests && isTestContext(context)) {
          return
        }

        context.report({
          loc: extractLocation(node),
          message:
            'Dynamic property deletion detected. Use static property access (delete obj.key), Map.delete(), or a filtered copy instead for better security and maintainability.',
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Disallow dynamic property deletion (delete obj[dynamicKey]). Dynamic deletion can bypass security checks, indicate poor design, and make code harder to analyze. Use static property deletion or Map/Set instead.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-dynamic-delete',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowInTests: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noDynamicDeleteRule
