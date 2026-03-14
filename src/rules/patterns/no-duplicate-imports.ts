import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isImportDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'ImportDeclaration'
}

function getModuleFromImport(node: unknown): string | null {
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

  const value = source.value
  return typeof value === 'string' ? value : null
}

export const noDuplicateImportsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Detect duplicate imports from the same module. Multiple imports from the same module should be combined into a single import statement.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-duplicate-imports',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    const moduleMap = new Map<string, unknown[]>()

    return {
      Program(): void {
        moduleMap.clear()
      },

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
          const location = extractLocation(imports[imports.length - 1])
          context.report({
            message: `Multiple imports from '${module}' should be combined into a single import statement.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default noDuplicateImportsRule
