import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
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
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
}

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

  const specifiers = n.specifiers as unknown[] | undefined
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Enforce consistent usage of type exports. Use `export type` for types to make the export intent clear.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/consistent-type-exports',
    },
    schema: [],
    fixable: undefined,
  },

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
            message:
              'Use `export type` for type exports to make the intent clear. Example: `export type { MyType }` or `export type MyType = ...`',
            loc: location,
          })
        }
      },
    }
  },
}

export default consistentTypeExportsRule
