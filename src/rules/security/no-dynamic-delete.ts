/**
 * @file Disallow dynamic property deletion which can bypass security checks
 * @module rules/security/no-dynamic-delete
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoDynamicDeleteOptions {
  readonly allowInTests?: boolean
}

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }
}

function isStaticProperty(argument: unknown): boolean {
  if (!argument || typeof argument !== 'object') {
    return true
  }

  const arg = argument as Record<string, unknown>

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
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.operator !== 'delete') {
          return
        }

        const {argument} = n

        if (!argument || typeof argument !== 'object') {
          return
        }

        const arg = argument as Record<string, unknown>

        if (arg.type !== 'MemberExpression') {
          return
        }

        const {property} = arg
        const computed = arg.computed as boolean | undefined

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
