import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isTypeExport(node: unknown): boolean {
  const n = toASTNode(node)
  const declaration = toASTNode(n?.declaration)
  if (!declaration) return false
  return (
    declaration.type === 'TSTypeAliasDeclaration' ||
    declaration.type === 'TSInterfaceDeclaration' ||
    declaration.type === 'TSEnumDeclaration'
  )
}

function isExportType(node: unknown): boolean {
  return toASTNode(node)?.exportKind === 'type'
}

function hasTypeSpecifier(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.exportKind === 'type') return true

  const {specifiers} = n
  if (specifiers === undefined || specifiers === null) return false
  if (!Array.isArray(specifiers)) throw new TypeError('specifiers is not an array')
  if (specifiers.length === 0) return false

  return specifiers.some((spec) => {
    const s = toASTNode(spec)
    return s?.exportKind === 'type' || s?.importKind === 'type'
  })
}

export const consistentTypeExportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExportNamedDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ExportNamedDeclaration') return
        if (isExportType(node) || hasTypeSpecifier(node)) return

        if (isTypeExport(node)) {
          context.report({
            loc: extractLocation(node),
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
