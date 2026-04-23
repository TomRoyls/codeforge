import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isImportDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ImportDeclaration'
}

function getModuleFromImport(node: unknown): null | string {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'ImportDeclaration') {
    return null
  }

  const source = n.source as Record<string, unknown> | undefined
  if (!source || source.type !== 'Literal') {
    return null
  }

  const {value} = source
  return typeof value === 'string' ? value : null
}

export const noDuplicateImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const moduleMap = new Map<string, unknown[]>()

    return {
      ImportDeclaration(node: unknown): void {
        if (!isImportDeclaration(node)) {
          return
        }

        const module = getModuleFromImport(node)

        if (!module) {
          return
        }

        const imports = moduleMap.get(module) || []
        imports.push(node)
        moduleMap.set(module, imports)

        if (imports.length > 1) {
          const location = extractLocation(imports.at(-1))
          context.report({
            loc: location,
            message: `Multiple imports from '${module}' should be combined into a single import statement.`,
          })
        }
      },

      Program(): void {
        moduleMap.clear()
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Detect duplicate imports from the same module. Multiple imports from the same module should be combined into a single import statement.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-duplicate-imports',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDuplicateImportsRule
