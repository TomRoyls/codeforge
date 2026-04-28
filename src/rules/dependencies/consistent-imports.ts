/**
 * @file Import style consistency rule for CodeForge
 * Enforces consistent import style across the codebase
 * @module rules/dependencies/consistent-imports
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

type ImportStyle = 'default' | 'named' | 'namespace'

interface ImportStatement {
  readonly hasDefault: boolean
  readonly hasNamespace: boolean
  readonly kind: 'default' | 'mixed' | 'named' | 'namespace'
  readonly location: SourceLocation
  readonly namedCount: number
  readonly source: string
}

interface ConsistentImportsOptions {
  readonly exclude?: readonly string[]
  readonly namespaceThreshold?: number
  readonly prefer: ImportStyle
}

function analyzeImport(node: unknown): ImportStatement | null {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type !== 'ImportDeclaration' || !n.source) {
    return null
  }

  const sourceNode = toASTNode(n.source)
  if (!sourceNode?.value || typeof sourceNode.value !== 'string') {
    return null
  }

  const loc = toASTNode(n.loc)
  const start = toASTNode(loc?.start)
  const end = toASTNode(loc?.end)

  const location: SourceLocation = {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }

  let hasDefault = false
  let hasNamespace = false
  let namedCount = 0

  const {specifiers} = n
  if (Array.isArray(specifiers)) {
    for (const spec of specifiers) {
      const specNode = toASTNode(spec)
      if (!specNode) continue
      switch (specNode.type) {
        case 'ImportDefaultSpecifier': {
          hasDefault = true
          break
        }

        case 'ImportNamespaceSpecifier': {
          hasNamespace = true
          break
        }

        case 'ImportSpecifier': {
          namedCount++
          break
        }
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
    hasDefault,
    hasNamespace,
    kind,
    location,
    namedCount,
    source: sourceNode.value,
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
    case 'default': {
      return `import module from '${source}';`
    }

    case 'named': {
      return `import { /* names */ } from '${source}';`
    }

    case 'namespace': {
      return `import * as namespace from '${source}';`
    }

    default: {
      return ''
    }
  }
}

/**
 * Rule: consistent-imports
 * Enforces consistent import style across the codebase.
 */
export const consistentImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<ConsistentImportsOptions>(context.config.options, {
      exclude: [],
      namespaceThreshold: 5,
      prefer: 'named',
    })
    const prefer = options.prefer ?? 'named'
    const namespaceThreshold = options.namespaceThreshold ?? 5
    const exclude = options.exclude ?? []

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
          (arg0?.type === 'Literal' || arg0?.type === 'StringLiteral') &&
          arg0.value &&
          typeof arg0.value === 'string'
        ) {
          const source = arg0.value

          if (isExcluded(source, exclude)) {
            return
          }

          if (prefer === 'named' || prefer === 'default') {
            const loc = toASTNode(n.loc)
            const start = toASTNode(loc?.start)
            const end = toASTNode(loc?.end)

            context.report({
              loc: {
                end: {
                  column: typeof end?.column === 'number' ? end.column : 0,
                  line: typeof end?.line === 'number' ? end.line : 1,
                },
                start: {
                  column: typeof start?.column === 'number' ? start.column : 0,
                  line: typeof start?.line === 'number' ? start.line : 1,
                },
              },
              message: `Use ES module ${prefer} imports instead of require()`,
              node,
            })
          }
        }
      },

      ImportDeclaration(node: unknown): void {
        const importInfo = analyzeImport(node)
        if (!importInfo) return

        if (isExcluded(importInfo.source, exclude)) {
          return
        }

        switch (prefer) {
          case 'default': {
            if (importInfo.kind === 'named' && importInfo.namedCount === 1) {
              context.report({
                loc: importInfo.location,
                message: `Consider using default import from '${importInfo.source}' if the module exports a default`,
                node,
              })
            } else if (
              importInfo.kind === 'namespace' ||
              (importInfo.kind === 'named' && importInfo.namedCount > 1)
            ) {
              context.report({
                loc: importInfo.location,
                message: `Prefer default imports over ${importInfo.kind} imports`,
                node,
              })
            }

            break
          }

          case 'named': {
            if (importInfo.kind === 'namespace') {
              context.report({
                loc: importInfo.location,
                message: `Use named imports instead of namespace import from '${importInfo.source}'`,
                node,
              })
            } else if (importInfo.kind === 'mixed' && importInfo.namedCount > 0) {
              context.report({
                loc: importInfo.location,
                message: `Separate default and named imports into separate statements`,
                node,
              })
            }

            break
          }

          case 'namespace': {
            if (importInfo.kind === 'named' && importInfo.namedCount >= namespaceThreshold) {
              context.report({
                loc: importInfo.location,
                message: `Use namespace import instead of multiple named imports from '${importInfo.source}'`,
                node,
                suggest: [
                  {
                    desc: 'Convert to namespace import',
                    fix: {
                      range: [0, 0],
                      text: generateSuggestion(importInfo, 'namespace'),
                    },
                    message: `Convert to namespace import`,
                  },
                ],
              })
            }

            break
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description:
        'Enforce consistent import style across the codebase. Choose between default imports, namespace imports, or named imports.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/consistent-imports',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          exclude: {
            items: { type: 'string' },
            type: 'array',
          },
          namespaceThreshold: {
            default: 5,
            minimum: 1,
            type: 'number',
          },
          prefer: {
            default: 'named',
            enum: ['default', 'namespace', 'named'],
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default consistentImportsRule
