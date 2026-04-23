import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, isMemberExpression } from '../../utils/ast-helpers.js'

interface ImportInfo {
  importedName?: string
  isDefault: boolean
  isNamespace: boolean
  localName: string
  source: string
}

function collectImports(ast: unknown): ImportInfo[] {
  const imports: ImportInfo[] = []

  if (!ast || typeof ast !== 'object') {
    return imports
  }

  const n = ast as Record<string, unknown>
  const body = n.body as undefined | unknown[]

  if (!body || !Array.isArray(body)) {
    return imports
  }

  for (const node of body) {
    if (!node || typeof node !== 'object') {
      continue
    }

    const stmt = node as Record<string, unknown>
    if (stmt.type !== 'ImportDeclaration') {
      continue
    }

    const source = stmt.source as Record<string, unknown> | undefined
    const sourceValue = source?.value as string | undefined
    if (!sourceValue) {
      continue
    }

    const specifiers = stmt.specifiers as undefined | unknown[]
    if (!specifiers || !Array.isArray(specifiers)) {
      continue
    }

    for (const spec of specifiers) {
      if (!spec || typeof spec !== 'object') {
        continue
      }

      const s = spec as Record<string, unknown>
      const local = s.local as Record<string, unknown> | undefined
      const localName = local?.name as string | undefined

      if (!localName) {
        continue
      }

      const specType = s.type as string

      switch (specType) {
      case 'ImportDefaultSpecifier': {
        imports.push({
          importedName: 'default',
          isDefault: true,
          isNamespace: false,
          localName,
          source: sourceValue,
        })
      
      break;
      }

      case 'ImportNamespaceSpecifier': {
        imports.push({
          isDefault: false,
          isNamespace: true,
          localName,
          source: sourceValue,
        })
      
      break;
      }

      case 'ImportSpecifier': {
        const imported = s.imported as Record<string, unknown> | undefined
        const importedName = imported?.name as string | undefined

        imports.push({
          importedName: importedName ?? localName,
          isDefault: false,
          isNamespace: false,
          localName,
          source: sourceValue,
        })
      
      break;
      }
      // No default
      }
    }
  }

  return imports
}

function isUnnecessaryQualifier(
  node: unknown,
  imports: ImportInfo[],
): null | { memberName: string; qualifier: string; } {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.computed === true) {
    return null
  }

  if (n.optional === true) {
    return null
  }

  const {object} = n
  if (!isIdentifier(object)) {
    return null
  }

  const qualifierName = (object as Record<string, unknown>).name as string

  const property = n.property as Record<string, unknown> | undefined
  if (!property || property.type !== 'Identifier') {
    return null
  }

  const memberName = property.name as string

  const namespaceImport = imports.find((imp) => imp.isNamespace && imp.localName === qualifierName)

  if (!namespaceImport) {
    return null
  }

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
