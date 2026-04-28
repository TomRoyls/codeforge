import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const DEPRECATED_MODULES: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ['@babel/polyfill', new Set(['*'])],
  ['colors', new Set(['disableColors', 'enableColors', 'setTheme'])],
  ['core-js', new Set(['*'])],
  ['mkdirp', new Set(['manual', 'sync'])],
  ['querystring', new Set(['escape', 'parse', 'stringify', 'unescape'])],
  ['request', new Set(['*'])],
  ['rx', new Set(['*'])],
])

function getImportSource(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'ImportDeclaration' && typeof n.source === 'object' && n.source !== null) {
      const src = toASTNode(n.source)
      if (src?.type === 'Literal' && typeof src.value === 'string') {
        return src.value
      }
    }

  return null
}

function getImportedNames(node: unknown): string[] {
  const n = toASTNode(node)
  if (!n) return []

  const names: string[] = []
  const {specifiers} = n
  if (!Array.isArray(specifiers)) return []

  for (const spec of specifiers) {
    const s = toASTNode(spec)
    if (!s) continue

    if (s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier') {
      names.push('*')
    } else if (s.type === 'ImportSpecifier') {
      const imported = toASTNode(s.imported)
      if (imported?.type === 'Identifier' && imported.name) {
        names.push(imported.name)
      }
    }
  }

  return names
}

export const noDeprecatedImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ImportDeclaration(node: unknown): void {
        const source = getImportSource(node)
        if (source === null) return

        const deprecatedNames = DEPRECATED_MODULES.get(source)
        if (!deprecatedNames) return

        const importedNames = getImportedNames(node)
        if (importedNames.length === 0) return

        const isAllDeprecated = deprecatedNames.has('*')
        if (isAllDeprecated) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected import from deprecated module '${source}'. This package is deprecated. Refer to its documentation for recommended alternatives.`,
          })
          return
        }

        for (const name of importedNames) {
          if (name === '*') {
            if (isAllDeprecated) {
              context.report({
                loc: extractLocation(node),
                message: `Unexpected import from deprecated module '${source}'. This package is deprecated. Refer to its documentation for recommended alternatives.`,
              })
              return
            }

            continue
          }

          if (deprecatedNames.has(name)) {
            context.report({
              loc: extractLocation(node),
              message: `Unexpected import '${name}' from '${source}'. This export is deprecated. Use the recommended alternative.`,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow imports from deprecated modules or deprecated exports from modules.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-deprecated-imports',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDeprecatedImportsRule
