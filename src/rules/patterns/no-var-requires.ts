import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
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

  const args = n.arguments as unknown[] | undefined

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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow require statements using var. Use ES6 import statements instead for better static analysis and tree shaking.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-var-requires',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoVarRequiresOptions>(context.config.options, { allow: [] })

    const allowedModules = options.allow ?? []

    return {
      VariableDeclaration(node: unknown): void {
        if (!isVarDeclaration(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const declarations = n.declarations as unknown[] | undefined

        if (!declarations || declarations.length === 0) {
          return
        }

        for (const decl of declarations) {
          const d = decl as Record<string, unknown>
          const init = d.init

          const { isRequire, moduleName } = isRequireCall(init)

          if (isRequire) {
            if (moduleName && allowedModules.includes(moduleName)) {
              continue
            }

            const location = extractLocation(node)
            context.report({
              message: `Unexpected var require(). Use ES6 import statement instead for better static analysis and tree shaking.`,
              loc: location,
            })
            return
          }
        }
      },
    }
  },
}

export default noVarRequiresRule
