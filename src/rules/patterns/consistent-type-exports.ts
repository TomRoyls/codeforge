import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isExportNamedDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ExportNamedDeclaration'
}

function isTypeExport(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  const declaration = n.declaration as Record<string, unknown> | undefined
  if (!declaration) {
    return false
  }

  const declType = declaration.type as string | undefined
  return (
    declType === 'TSTypeAliasDeclaration' ||
    declType === 'TSInterfaceDeclaration' ||
    declType === 'TSEnumDeclaration'
  )
}

function isExportType(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.exportKind === 'type'
}

function hasTypeSpecifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.exportKind === 'type') {
    return true
  }

  const specifiers = n.specifiers as undefined | unknown[]
  if (!specifiers || specifiers.length === 0) {
    return false
  }

  return specifiers.some((spec) => {
    if (!spec || typeof spec !== 'object') {
      return false
    }

    const s = spec as Record<string, unknown>
    return s.exportKind === 'type' || s.importKind === 'type'
  })
}

export const consistentTypeExportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExportNamedDeclaration(node: unknown): void {
        if (!isExportNamedDeclaration(node)) {
          return
        }

        if (isExportType(node)) {
          return
        }

        if (hasTypeSpecifier(node)) {
          return
        }

        if (isTypeExport(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Use `export type` for type exports to make the intent clear. Example: `export type { MyType }` or `export type MyType = ...`',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Enforce consistent usage of type exports. Use `export type` for types to make the export intent clear.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/consistent-type-exports',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default consistentTypeExportsRule
