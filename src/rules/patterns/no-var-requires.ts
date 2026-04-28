import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoVarRequiresOptions {
  readonly allow?: string[]
}

function isRequireCall(node: unknown): { isRequire: boolean; moduleName?: string } {
  const n = toASTNode(node)
  if (n?.type !== 'CallExpression') return { isRequire: false }

  const callee = toASTNode(n.callee)
  if (callee?.type !== 'Identifier' || callee.name !== 'require') return { isRequire: false }

  const args = n.arguments
  if (!Array.isArray(args) || args.length === 0) return { isRequire: true }

  const firstArg = toASTNode(args[0])
  if (firstArg?.type === 'Literal' && typeof firstArg.value === 'string') {
    return { isRequire: true, moduleName: firstArg.value }
  }

  return { isRequire: true }
}

function isVarDeclaration(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'VariableDeclaration' && n.kind === 'var'
}

export const noVarRequiresRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoVarRequiresOptions>(context.config.options, { allow: [] })
    const allowedModules = options.allow ?? []

    return {
      VariableDeclaration(node: unknown): void {
        if (!isVarDeclaration(node)) return
        const n = toASTNode(node)
        const declarations = n?.declarations
        if (!Array.isArray(declarations) || declarations.length === 0) return

        for (const decl of declarations) {
          if (decl === null || decl === undefined) throw new Error('Invalid declaration')
          const d = toASTNode(decl)
          const { isRequire, moduleName } = isRequireCall(d?.init)

          if (isRequire) {
            if (moduleName && allowedModules.includes(moduleName)) continue

            context.report({
              loc: extractLocation(node),
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
