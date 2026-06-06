/**
 * @file Barrel import detection rule for CodeForge
 * Detects imports from barrel files (index.ts/index.js)
 * @module rules/dependencies/no-barrel-imports
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface BarrelImport {
  readonly barrelPath: string
  readonly location: SourceLocation
  readonly source: string
  readonly specifiers: readonly string[]
}

interface NoBarrelImportsOptions {
  readonly allowTypeOnly?: boolean
  readonly barrelPatterns?: readonly string[]
  readonly exclude?: readonly string[]
}

const DEFAULT_BARREL_PATTERNS = [
  '/index.ts',
  '/index.js',
  '/index.tsx',
  '/index.jsx',
  '/index.mjs',
  '/index.cjs',
]

const wildcardPatternCache = new Map<string, RegExp>()
const excludePatternCache = new Map<string, RegExp>()

function getWildcardPatternRegex(pattern: string): RegExp {
  const cached = wildcardPatternCache.get(pattern)
  if (cached) return cached

  const regex = new RegExp('^' + pattern.replaceAll('*', '.*').replaceAll('?', '.') + '$')
  wildcardPatternCache.set(pattern, regex)
  return regex
}

function getExcludePatternRegex(pattern: string): RegExp {
  const cached = excludePatternCache.get(pattern)
  if (cached) return cached

  const regex = new RegExp(pattern.slice(1, -1))
  excludePatternCache.set(pattern, regex)
  return regex
}

function isBarrelImport(source: string, patterns: readonly string[]): boolean {
  const normalizedSource = source.replaceAll('\\', '/')

  for (const pattern of patterns) {
    if (normalizedSource.endsWith(pattern)) {
      return true
    }

    if (pattern.includes('*') && getWildcardPatternRegex(pattern).test(normalizedSource)) {
        return true
      }
  }

  return false
}

function isExcluded(source: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      return getExcludePatternRegex(pattern).test(source)
    }

    return source === pattern || source.includes(pattern)
  })
}

function extractImportDetails(node: unknown): null | {
  isTypeOnly: boolean
  location: SourceLocation
  source: string
  specifiers: string[]
} {
  const n = toASTNode(node)
  if (!n) return null

  const location = extractLocation(node)

  if (n.type === 'ImportDeclaration') {
    const sourceNode = toASTNode(n.source)
    if (sourceNode?.value && typeof sourceNode.value === 'string') {
      const specifiers: string[] = []
      const isTypeOnly = n.importKind === 'type'

      const specifierArray = n.specifiers
      if (Array.isArray(specifierArray)) {
        for (const spec of specifierArray) {
          const specNode = toASTNode(spec)
          if (!specNode) continue
          switch (specNode.type) {
          case 'ImportDefaultSpecifier': {
            specifiers.push('default')
          
          break;
          }

          case 'ImportNamespaceSpecifier': {
            specifiers.push('*')
          
          break;
          }

          case 'ImportSpecifier': {
            const imported = toASTNode(specNode.imported)
            if (imported?.name && typeof imported.name === 'string') {
              specifiers.push(imported.name)
            }
          
          break;
          }
          // No default
          }
        }
      }

      return {
        isTypeOnly,
        location,
        source: sourceNode.value,
        specifiers,
      }
    }
  }

  if (n.type === 'ExportNamedDeclaration') {
    const sourceNode = toASTNode(n.source)
    if (sourceNode?.value && typeof sourceNode.value === 'string') {
      return {
        isTypeOnly: n.exportKind === 'type',
        location,
        source: sourceNode.value,
        specifiers: [],
      }
    }
  }

  if (n.type === 'ExportAllDeclaration') {
    const sourceNode = toASTNode(n.source)
    if (sourceNode?.value && typeof sourceNode.value === 'string') {
      return {
        isTypeOnly: n.exportKind === 'type',
        location,
        source: sourceNode.value,
        specifiers: ['*'],
      }
    }
  }

  return null
}

function generateDirectImportSuggestion(barrelImport: BarrelImport): string {
  const { barrelPath, specifiers } = barrelImport
  const dir = barrelPath.replace(/\/index\.(ts|js|tsx|jsx|mjs|cjs)$/, '')

  if (specifiers.length === 0) {
    return `import from '${dir}/<module>';`
  }

  const specList = specifiers.join(', ')
  return `import { ${specList} } from '${dir}/<module>';`
}

/**
 * Rule: no-barrel-imports
 * Detects imports from barrel files (index.ts/index.js).
 */
export const noBarrelImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoBarrelImportsOptions>(context.config.options, {
      allowTypeOnly: false,
      barrelPatterns: undefined,
      exclude: [],
    })
    const barrelPatterns = options.barrelPatterns ?? DEFAULT_BARREL_PATTERNS
    const exclude = options.exclude ?? []
    const allowTypeOnly = options.allowTypeOnly ?? false

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const callee = toASTNode(n.callee)
        const arguments_ = n.arguments
        const arg0 =
          Array.isArray(arguments_) && arguments_.length > 0
            ? toASTNode(arguments_[0])
            : undefined

        if (
          callee?.type === 'Identifier' &&
          callee.name === 'require' &&
          arg0?.type === 'Literal' &&
          arg0.value &&
          typeof arg0.value === 'string'
        ) {
          const source = arg0.value

          if (isExcluded(source, exclude)) {
            return
          }

          if (isBarrelImport(source, barrelPatterns)) {
            context.report({
              loc: extractLocation(n),
              message: `require() from barrel file '${source}'. Consider requiring directly from the source module.`,
              node,
            })
          }
        }
      },

      ExportAllDeclaration(node: unknown): void {
        const details = extractImportDetails(node)
        if (!details) return

        if (isExcluded(details.source, exclude)) {
          return
        }

        if (allowTypeOnly && details.isTypeOnly) {
          return
        }

        if (isBarrelImport(details.source, barrelPatterns)) {
          context.report({
            loc: details.location,
            message: `Re-export all from barrel file '${details.source}'. Consider exporting directly from the source module.`,
            node,
          })
        }
      },

      ExportNamedDeclaration(node: unknown): void {
        const details = extractImportDetails(node)
        if (!details || details.specifiers.length > 0) return

        if (isExcluded(details.source, exclude)) {
          return
        }

        if (allowTypeOnly && details.isTypeOnly) {
          return
        }

        if (isBarrelImport(details.source, barrelPatterns)) {
          context.report({
            loc: details.location,
            message: `Re-export from barrel file '${details.source}'. Consider exporting directly from the source module.`,
            node,
          })
        }
      },

      ImportDeclaration(node: unknown): void {
        const details = extractImportDetails(node)
        if (!details) return

        if (isExcluded(details.source, exclude)) {
          return
        }

        if (allowTypeOnly && details.isTypeOnly) {
          return
        }

        if (isBarrelImport(details.source, barrelPatterns)) {
          const barrelImport: BarrelImport = {
            barrelPath: details.source,
            location: details.location,
            source: details.source,
            specifiers: details.specifiers,
          }

          context.report({
            loc: details.location,
            message: `Import from barrel file '${details.source}'. Consider importing directly from the source module.`,
            node,
            suggest: [
              {
                desc: 'Import directly from source module',
                fix: {
                  range: [0, 0],
                  text: generateDirectImportSuggestion(barrelImport),
                },
                message: 'Import directly from source module',
              },
            ],
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description:
        'Disallow imports from barrel files (index.ts/index.js). Importing from barrel files can cause performance issues, circular dependencies, and make the dependency graph harder to understand.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-barrel-imports',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowTypeOnly: {
            default: false,
            type: 'boolean',
          },
          barrelPatterns: {
            default: DEFAULT_BARREL_PATTERNS,
            items: { type: 'string' },
            type: 'array',
          },
          exclude: {
            items: { type: 'string' },
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

export default noBarrelImportsRule
