/**
 * @fileoverview Barrel import detection rule for CodeForge
 * Detects imports from barrel files (index.ts/index.js)
 * @module rules/dependencies/no-barrel-imports
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'

interface BarrelImport {
  readonly barrelPath: string
  readonly source: string
  readonly location: SourceLocation
  readonly specifiers: readonly string[]
}

interface NoBarrelImportsOptions {
  readonly barrelPatterns?: readonly string[]
  readonly exclude?: readonly string[]
  readonly allowTypeOnly?: boolean
}

const DEFAULT_BARREL_PATTERNS = [
  '/index.ts',
  '/index.js',
  '/index.tsx',
  '/index.jsx',
  '/index.mjs',
  '/index.cjs',
]

function isBarrelImport(source: string, patterns: readonly string[]): boolean {
  const normalizedSource = source.replace(/\\/g, '/')

  for (const pattern of patterns) {
    if (normalizedSource.endsWith(pattern)) {
      return true
    }
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
      if (regex.test(normalizedSource)) {
        return true
      }
    }
  }

  return false
}

function isExcluded(source: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      const regex = new RegExp(pattern.slice(1, -1))
      return regex.test(source)
    }
    return source === pattern || source.includes(pattern)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImportDetails(node: any): {
  source: string
  specifiers: string[]
  isTypeOnly: boolean
  location: SourceLocation
} | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const location = extractLocation(node)

  if (node.type === 'ImportDeclaration' && node.source?.value) {
    const specifiers: string[] = []
    const isTypeOnly = node.importKind === 'type'

    if (node.specifiers) {
      for (const spec of node.specifiers) {
        if (spec.type === 'ImportDefaultSpecifier') {
          specifiers.push('default')
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          specifiers.push('*')
        } else if (spec.type === 'ImportSpecifier' && spec.imported?.name) {
          specifiers.push(spec.imported.name)
        }
      }
    }

    return {
      source: node.source.value,
      specifiers,
      isTypeOnly,
      location,
    }
  }

  if (node.type === 'ExportNamedDeclaration' && node.source?.value) {
    return {
      source: node.source.value,
      specifiers: [],
      isTypeOnly: node.exportKind === 'type',
      location,
    }
  }

  if (node.type === 'ExportAllDeclaration' && node.source?.value) {
    return {
      source: node.source.value,
      specifiers: ['*'],
      isTypeOnly: node.exportKind === 'type',
      location,
    }
  }

  return null
}

function generateDirectImportSuggestion(barrelImport: BarrelImport): string {
  const { specifiers, barrelPath } = barrelImport
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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow imports from barrel files (index.ts/index.js). Importing from barrel files can cause performance issues, circular dependencies, and make the dependency graph harder to understand.',
      category: 'dependencies',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-barrel-imports',
    },
    schema: [
      {
        type: 'object',
        properties: {
          barrelPatterns: {
            type: 'array',
            items: { type: 'string' },
            default: DEFAULT_BARREL_PATTERNS,
          },
          exclude: {
            type: 'array',
            items: { type: 'string' },
          },
          allowTypeOnly: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: NoBarrelImportsOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as NoBarrelImportsOptions
    const barrelPatterns = options.barrelPatterns ?? DEFAULT_BARREL_PATTERNS
    const exclude = options.exclude ?? []
    const allowTypeOnly = options.allowTypeOnly ?? false

    return {
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
            source: details.source,
            location: details.location,
            specifiers: details.specifiers,
          }

          context.report({
            node,
            message: `Import from barrel file '${details.source}'. Consider importing directly from the source module.`,
            loc: details.location,
            suggest: [
              {
                desc: 'Import directly from source module',
                message: 'Import directly from source module',
                fix: {
                  range: [0, 0],
                  text: generateDirectImportSuggestion(barrelImport),
                },
              },
            ],
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
            node,
            message: `Re-export from barrel file '${details.source}'. Consider exporting directly from the source module.`,
            loc: details.location,
          })
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
            node,
            message: `Re-export all from barrel file '${details.source}'. Consider exporting directly from the source module.`,
            loc: details.location,
          })
        }
      },

      CallExpression(node: unknown): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = node as any

        if (
          n.callee?.type === 'Identifier' &&
          n.callee.name === 'require' &&
          n.arguments?.[0]?.type === 'StringLiteral'
        ) {
          const source = n.arguments[0].value

          if (isExcluded(source, exclude)) {
            return
          }

          if (isBarrelImport(source, barrelPatterns)) {
            context.report({
              node,
              message: `require() from barrel file '${source}'. Consider requiring directly from the source module.`,
              loc: extractLocation(n),
            })
          }
        }
      },
    }
  },
}

export default noBarrelImportsRule
