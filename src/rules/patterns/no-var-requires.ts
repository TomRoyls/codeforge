import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoVarRequiresOptions {
  readonly allow?: string[]
}

function isRequireCall(node: unknown): { isRequire: boolean; moduleName?: string } {
  if (!node || typeof node !== 'object') {
    return { isRequire: false }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isRequire: false }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || callee.type !== 'Identifier' || callee.name !== 'require') {
    return { isRequire: false }
  }

  const args = n.arguments as undefined | unknown[]

  if (!args || args.length === 0) {
    return { isRequire: true }
  }

  const firstArg = args[0] as Record<string, unknown> | undefined

  if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
    return { isRequire: true, moduleName: firstArg.value }
  }

  return { isRequire: true }
}

function isVarDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclaration' && n.kind === 'var'
}

export const noVarRequiresRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoVarRequiresOptions>(context.config.options, { allow: [] })

    const allowedModules = options.allow ?? []

    return {
      VariableDeclaration(node: unknown): void {
        if (!isVarDeclaration(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const declarations = n.declarations as undefined | unknown[]

        if (!declarations || declarations.length === 0) {
          return
        }

        for (const decl of declarations) {
          const d = decl as Record<string, unknown>
          const {init} = d

          const { isRequire, moduleName } = isRequireCall(init)

          if (isRequire) {
            if (moduleName && allowedModules.includes(moduleName)) {
              continue
            }

            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Unexpected var require(). Use ES6 import statement instead for better static analysis and tree shaking.`,
            })
            return
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow require statements using var. Use ES6 import statements instead for better static analysis and tree shaking.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-var-requires',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            items: {
              type: 'string',
            },
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

export default noVarRequiresRule
