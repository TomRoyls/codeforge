/**
 * @fileoverview Import style consistency rule for CodeForge
 * Enforces consistent import style across the codebase
 * @module rules/dependencies/consistent-imports
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

type ImportStyle = 'default' | 'namespace' | 'named'

interface ImportStatement {
  readonly kind: 'default' | 'namespace' | 'named' | 'mixed'
  readonly source: string
  readonly location: SourceLocation
  readonly namedCount: number
  readonly hasDefault: boolean
  readonly hasNamespace: boolean
}

interface ConsistentImportsOptions {
  readonly prefer: ImportStyle
  readonly namespaceThreshold?: number
  readonly exclude?: readonly string[]
}

function analyzeImport(node: unknown): ImportStatement | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'ImportDeclaration' || !n.source) {
    return null
  }

  const sourceNode = n.source as Record<string, unknown> | undefined
  if (!sourceNode?.value || typeof sourceNode.value !== 'string') {
    return null
  }

  const loc = n.loc as Record<string, unknown> | undefined
  const start = loc?.start as Record<string, unknown> | undefined
  const end = loc?.end as Record<string, unknown> | undefined

  const location: SourceLocation = {
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }

  let hasDefault = false
  let hasNamespace = false
  let namedCount = 0

  const specifiers = n.specifiers
  if (Array.isArray(specifiers)) {
    for (const spec of specifiers) {
      if (!spec || typeof spec !== 'object') continue
      const specNode = spec as Record<string, unknown>
      switch (specNode.type) {
        case 'ImportDefaultSpecifier':
          hasDefault = true
          break
        case 'ImportNamespaceSpecifier':
          hasNamespace = true
          break
        case 'ImportSpecifier':
          namedCount++
          break
      }
    }
  }

  let kind: ImportStatement['kind']
  if (hasDefault && namedCount > 0) {
    kind = 'mixed'
  } else if (hasDefault) {
    kind = 'default'
  } else if (hasNamespace) {
    kind = 'namespace'
  } else {
    kind = 'named'
  }

  return {
    kind,
    source: sourceNode.value,
    location,
    namedCount,
    hasDefault,
    hasNamespace,
  }
}

const excludePatternCache = new Map<string, RegExp>()

function getExcludePatternRegex(pattern: string): RegExp {
  const cached = excludePatternCache.get(pattern)
  if (cached) return cached

  const regex = new RegExp(pattern.slice(1, -1))
  excludePatternCache.set(pattern, regex)
  return regex
}

function isExcluded(source: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      return getExcludePatternRegex(pattern).test(source)
    }
    return source === pattern || source.includes(pattern)
  })
}

function generateSuggestion(importInfo: ImportStatement, prefer: ImportStyle): string {
  const { source } = importInfo

  switch (prefer) {
    case 'namespace':
      return `import * as namespace from '${source}';`
    case 'default':
      return `import module from '${source}';`
    case 'named':
      return `import { /* names */ } from '${source}';`
    default:
      return ''
  }
}

/**
 * Rule: consistent-imports
 * Enforces consistent import style across the codebase.
 */
export const consistentImportsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    fixable: 'code',
    docs: {
      description:
        'Enforce consistent import style across the codebase. Choose between default imports, namespace imports, or named imports.',
      category: 'dependencies',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/consistent-imports',
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefer: {
            type: 'string',
            enum: ['default', 'namespace', 'named'],
            default: 'named',
          },
          namespaceThreshold: {
            type: 'number',
            minimum: 1,
            default: 5,
          },
          exclude: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<ConsistentImportsOptions>(context.config.options, {
      prefer: 'named',
      namespaceThreshold: 5,
      exclude: [],
    })
    const prefer = options.prefer ?? 'named'
    const namespaceThreshold = options.namespaceThreshold ?? 5
    const exclude = options.exclude ?? []

    return {
      ImportDeclaration(node: unknown): void {
        const importInfo = analyzeImport(node)
        if (!importInfo) return

        if (isExcluded(importInfo.source, exclude)) {
          return
        }

        switch (prefer) {
          case 'namespace':
            if (importInfo.kind === 'named' && importInfo.namedCount >= namespaceThreshold) {
              context.report({
                node,
                message: `Use namespace import instead of multiple named imports from '${importInfo.source}'`,
                loc: importInfo.location,
                suggest: [
                  {
                    desc: 'Convert to namespace import',
                    message: `Convert to namespace import`,
                    fix: {
                      range: [0, 0],
                      text: generateSuggestion(importInfo, 'namespace'),
                    },
                  },
                ],
              })
            }
            break

          case 'default':
            if (importInfo.kind === 'named' && importInfo.namedCount === 1) {
              context.report({
                node,
                message: `Consider using default import from '${importInfo.source}' if the module exports a default`,
                loc: importInfo.location,
              })
            } else if (
              importInfo.kind === 'namespace' ||
              (importInfo.kind === 'named' && importInfo.namedCount > 1)
            ) {
              context.report({
                node,
                message: `Prefer default imports over ${importInfo.kind} imports`,
                loc: importInfo.location,
              })
            }
            break

          case 'named':
            if (importInfo.kind === 'namespace') {
              context.report({
                node,
                message: `Use named imports instead of namespace import from '${importInfo.source}'`,
                loc: importInfo.location,
              })
            } else if (importInfo.kind === 'mixed' && importInfo.namedCount > 0) {
              context.report({
                node,
                message: `Separate default and named imports into separate statements`,
                loc: importInfo.location,
              })
            }
            break
        }
      },

      CallExpression(node: unknown): void {
        const n = node as Record<string, unknown>

        const callee = n.callee as Record<string, unknown> | undefined
        const arguments_ = n.arguments as unknown[] | undefined
        const arg0 =
          Array.isArray(arguments_) && arguments_.length > 0
            ? (arguments_[0] as Record<string, unknown> | undefined)
            : undefined

        if (
          callee?.type === 'Identifier' &&
          callee.name === 'require' &&
          arg0?.type === 'StringLiteral' &&
          arg0.value &&
          typeof arg0.value === 'string'
        ) {
          const source = arg0.value

          if (isExcluded(source, exclude)) {
            return
          }

          if (prefer === 'named' || prefer === 'default') {
            const loc = n.loc as Record<string, unknown> | undefined
            const start = loc?.start as Record<string, unknown> | undefined
            const end = loc?.end as Record<string, unknown> | undefined

            context.report({
              node,
              message: `Use ES module ${prefer} imports instead of require()`,
              loc: {
                start: {
                  line: typeof start?.line === 'number' ? start.line : 1,
                  column: typeof start?.column === 'number' ? start.column : 0,
                },
                end: {
                  line: typeof end?.line === 'number' ? end.line : 1,
                  column: typeof end?.column === 'number' ? end.column : 0,
                },
              },
            })
          }
        }
      },
    }
  },
}

export default consistentImportsRule
