import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

interface ImportInfo {
  importedName?: string
  isDefault: boolean
  isNamespace: boolean
  localName: string
  source: string
}

function collectImports(ast: unknown): ImportInfo[] {
  const imports: ImportInfo[] = []
  const n = toASTNode(ast)
  const body = n?.body

  if (!Array.isArray(body)) return imports

  for (const node of body) {
    const stmt = toASTNode(node)
    if (stmt?.type !== 'ImportDeclaration') continue

    const source = toASTNode(stmt.source)
    const sourceValue = source?.value
    if (typeof sourceValue !== 'string') continue

    const {specifiers} = stmt
    if (!Array.isArray(specifiers)) continue

    for (const spec of specifiers) {
      const s = toASTNode(spec)
      const local = toASTNode(s?.local)
      const localName = local?.name
      if (typeof localName !== 'string') continue

      switch (s?.type) {
      case 'ImportDefaultSpecifier': {
        imports.push({
          importedName: 'default',
          isDefault: true,
          isNamespace: false,
          localName,
          source: sourceValue,
        })
        break
      }

      case 'ImportNamespaceSpecifier': {
        imports.push({
          isDefault: false,
          isNamespace: true,
          localName,
          source: sourceValue,
        })
        break
      }

      case 'ImportSpecifier': {
        const imported = toASTNode(s.imported)
        const importedName = imported?.name
        imports.push({
          importedName: importedName ?? localName,
          isDefault: false,
          isNamespace: false,
          localName,
          source: sourceValue,
        })
        break
      }
      }
    }
  }

  return imports
}

function isUnnecessaryQualifier(
  node: unknown,
  imports: ImportInfo[],
): null | { memberName: string; qualifier: string } {
  if (!isMemberExpression(node)) return null

  const n = toASTNode(node)
  if (!n) return null
  if (n.computed === true) return null
  if (n.optional === true) return null

  if (!isIdentifier(n.object)) return null
  const qualifierName = toASTNode(n.object)?.name
  if (typeof qualifierName !== 'string') return null

  const property = toASTNode(n.property)
  if (property?.type !== 'Identifier') return null
  const memberName = property.name
  if (typeof memberName !== 'string') return null

  const namespaceImport = imports.find((imp) => imp.isNamespace && imp.localName === qualifierName)
  if (!namespaceImport) return null

  const directImport = imports.find(
    (imp) =>
      !imp.isNamespace &&
      !imp.isDefault &&
      imp.source === namespaceImport.source &&
      imp.localName === memberName,
  )

  if (directImport) {
    return { memberName, qualifier: qualifierName }
  }

  return null
}

export const noUnnecessaryQualifierRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    let imports: ImportInfo[] = []

    return {
      MemberExpression(node: unknown): void {
        const result = isUnnecessaryQualifier(node, imports)

        if (!result) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: `Unnecessary qualifier '${result.qualifier}'. '${result.memberName}' is already imported directly. Use '${result.memberName}' instead of '${result.qualifier}.${result.memberName}'.`,
        })
      },

      Program(node: unknown): void {
        imports = collectImports(node)
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary namespace qualifiers. When a member is imported directly, using the qualified form (e.g., A.B) is unnecessary. Use the unqualified name (e.g., B) instead.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-qualifier',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryQualifierRule
