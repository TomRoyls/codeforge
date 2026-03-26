/**
 * @fileoverview Unused exports detection rule for CodeForge
 * Finds exports that are never imported by any other file
 * @module rules/dependencies/no-unused-exports
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface ExportInfo {
  readonly name: string
  readonly filePath: string
  readonly type: 'named' | 'default' | 'namespace'
  readonly location: SourceLocation
  readonly isTypeOnly: boolean
}

interface ImportInfo {
  readonly name: string
  readonly sourceFile: string
  readonly targetFile: string
  readonly isTypeOnly: boolean
}

interface UnusedExportsOptions {
  readonly ignorePatterns?: readonly string[]
  readonly ignoreTypeOnly?: boolean
  readonly allowEntryExports?: boolean
  readonly entryFiles?: readonly string[]
}

const globalExports = new Map<string, ExportInfo[]>()
const globalImports = new Map<string, ImportInfo[]>()
// Reverse index: maps target file to Set of imported export names (for O(1) lookup)
const importedByTargetFile = new Map<string, Set<string>>()

function extractExports(ast: unknown, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []

  if (!ast || typeof ast !== 'object') {
    return exports
  }

  const a = ast as Record<string, unknown>
  const body = Array.isArray(a.body)
    ? a.body
    : Array.isArray((a.program as Record<string, unknown> | undefined)?.body)
      ? ((a.program as Record<string, unknown>).body as unknown[])
      : []

  for (const node of body) {
    const nodeExports = extractExportsFromNode(node, filePath)
    exports.push(...nodeExports)
  }

  return exports
}

function extractExportsFromNode(node: unknown, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []

  if (!node || typeof node !== 'object') {
    return exports
  }

  const location = extractLocation(node)
  const n = node as Record<string, unknown>

  switch (n.type) {
    case 'ExportNamedDeclaration':
      const declaration = n.declaration as Record<string, unknown> | undefined
      if (declaration) {
        if (declaration.type === 'FunctionDeclaration') {
          const id = declaration.id as Record<string, unknown> | undefined
          if (id?.name && typeof id.name === 'string') {
            exports.push({
              name: id.name,
              filePath,
              type: 'named',
              location,
              isTypeOnly: n.exportKind === 'type',
            })
          }
        } else if (declaration.type === 'VariableDeclaration') {
          const declarations = declaration.declarations
          if (Array.isArray(declarations)) {
            for (const decl of declarations) {
              if (!decl || typeof decl !== 'object') continue
              const declNode = decl as Record<string, unknown>
              const id = declNode.id as Record<string, unknown> | undefined
              if (id?.type === 'Identifier' && typeof id.name === 'string') {
                exports.push({
                  name: id.name,
                  filePath,
                  type: 'named',
                  location,
                  isTypeOnly: n.exportKind === 'type',
                })
              }
            }
          }
        } else if (declaration.type === 'ClassDeclaration') {
          const id = declaration.id as Record<string, unknown> | undefined
          if (id?.name && typeof id.name === 'string') {
            exports.push({
              name: id.name,
              filePath,
              type: 'named',
              location,
              isTypeOnly: n.exportKind === 'type',
            })
          }
        } else if (declaration.type === 'TSTypeAliasDeclaration') {
          const id = declaration.id as Record<string, unknown> | undefined
          if (id?.name && typeof id.name === 'string') {
            exports.push({
              name: id.name,
              filePath,
              type: 'named',
              location,
              isTypeOnly: true,
            })
          }
        } else if (declaration.type === 'TSInterfaceDeclaration') {
          const id = declaration.id as Record<string, unknown> | undefined
          if (id?.name && typeof id.name === 'string') {
            exports.push({
              name: id.name,
              filePath,
              type: 'named',
              location,
              isTypeOnly: true,
            })
          }
        }
      } else {
        const specifiers = n.specifiers
        if (Array.isArray(specifiers)) {
          for (const spec of specifiers) {
            if (!spec || typeof spec !== 'object') continue
            const specNode = spec as Record<string, unknown>
            if (specNode.type === 'ExportSpecifier') {
              const exported = specNode.exported as Record<string, unknown> | undefined
              if (exported?.name && typeof exported.name === 'string') {
                exports.push({
                  name: exported.name,
                  filePath,
                  type: 'named',
                  location,
                  isTypeOnly: specNode.exportKind === 'type' || n.exportKind === 'type',
                })
              }
            }
          }
        }
      }
      break

    case 'ExportDefaultDeclaration':
      exports.push({
        name: 'default',
        filePath,
        type: 'default',
        location,
        isTypeOnly: false,
      })
      break

    case 'ExportAllDeclaration':
      exports.push({
        name: '*',
        filePath,
        type: 'namespace',
        location,
        isTypeOnly: n.exportKind === 'type',
      })
      break

    case 'FunctionDeclaration':
      const funcId = n.id as Record<string, unknown> | undefined
      if (funcId?.name && typeof funcId.name === 'string') {
        const hasExport = hasExportModifier(n)
        if (hasExport) {
          exports.push({
            name: funcId.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: false,
          })
        }
      }
      break

    case 'ClassDeclaration':
      const classId = n.id as Record<string, unknown> | undefined
      if (classId?.name && typeof classId.name === 'string') {
        const hasExport = hasExportModifier(n)
        if (hasExport) {
          exports.push({
            name: classId.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: false,
          })
        }
      }
      break

    case 'VariableDeclaration':
      const varHasExport = hasExportModifier(n)
      if (varHasExport) {
        const declarations = n.declarations
        if (Array.isArray(declarations)) {
          for (const decl of declarations) {
            if (!decl || typeof decl !== 'object') continue
            const declNode = decl as Record<string, unknown>
            const id = declNode.id as Record<string, unknown> | undefined
            if (id?.type === 'Identifier' && typeof id.name === 'string') {
              exports.push({
                name: id.name,
                filePath,
                type: 'named',
                location,
                isTypeOnly: false,
              })
            }
          }
        }
      }
      break
  }

  return exports
}

function hasExportModifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  const modifiers = n.modifiers
  if (!Array.isArray(modifiers)) return false

  return modifiers.some((mod) => {
    if (!mod || typeof mod !== 'object') return false
    const modNode = mod as Record<string, unknown>
    return modNode.type === 'TSExportKeyword' || modNode.kind === 'export'
  })
}

function extractImports(ast: unknown, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []

  if (!ast || typeof ast !== 'object') {
    return imports
  }

  const a = ast as Record<string, unknown>
  const body = Array.isArray(a.body)
    ? a.body
    : Array.isArray((a.program as Record<string, unknown> | undefined)?.body)
      ? ((a.program as Record<string, unknown>).body as unknown[])
      : []

  for (const node of body) {
    const nodeImports = extractImportsFromNode(node, filePath)
    imports.push(...nodeImports)
  }

  return imports
}

function extractImportsFromNode(node: unknown, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []

  if (!node || typeof node !== 'object') {
    return imports
  }

  const n = node as Record<string, unknown>

  switch (n.type) {
    case 'ImportDeclaration': {
      const sourceNode = n.source as Record<string, unknown> | undefined
      const source = sourceNode?.value
      if (typeof source === 'string') {
        const specifiers = n.specifiers
        if (Array.isArray(specifiers)) {
          for (const spec of specifiers) {
            if (!spec || typeof spec !== 'object') continue
            const specNode = spec as Record<string, unknown>
            let importedName = ''
            let isTypeOnly = n.importKind === 'type'

            switch (specNode.type) {
              case 'ImportDefaultSpecifier':
                importedName = 'default'
                break
              case 'ImportNamespaceSpecifier':
                importedName = '*'
                break
              case 'ImportSpecifier': {
                const imported = specNode.imported as Record<string, unknown> | undefined
                importedName = imported?.name ? (imported.name as string) : ''
                isTypeOnly = isTypeOnly || specNode.importKind === 'type'
                break
              }
            }

            if (importedName) {
              imports.push({
                name: importedName,
                sourceFile: filePath,
                targetFile: source,
                isTypeOnly,
              })
            }
          }
        }
      }
      break
    }

    case 'CallExpression': {
      const callee = n.callee as Record<string, unknown> | undefined
      const arguments_ = n.arguments as unknown[] | undefined
      if (
        callee?.type === 'Identifier' &&
        callee.name === 'require' &&
        Array.isArray(arguments_) &&
        arguments_.length > 0
      ) {
        const arg0 = arguments_[0] as Record<string, unknown> | undefined
        if (arg0?.type === 'StringLiteral' && typeof arg0.value === 'string') {
          imports.push({
            name: '*',
            sourceFile: filePath,
            targetFile: arg0.value,
            isTypeOnly: false,
          })
        }
      } else if (callee?.type === 'Import' && Array.isArray(arguments_) && arguments_.length > 0) {
        const arg0 = arguments_[0] as Record<string, unknown> | undefined
        if (arg0?.value && typeof arg0.value === 'string') {
          imports.push({
            name: '*',
            sourceFile: filePath,
            targetFile: arg0.value,
            isTypeOnly: false,
          })
        }
      }
      break
    }

    case 'TSImportEqualsDeclaration': {
      const moduleRef = n.moduleReference as Record<string, unknown> | undefined
      if (moduleRef?.type === 'TSExternalModuleReference') {
        const expression = moduleRef.expression as Record<string, unknown> | undefined
        if (expression?.value && typeof expression.value === 'string') {
          const id = n.id as Record<string, unknown> | undefined
          imports.push({
            name: id?.name ? (id.name as string) : '*',
            sourceFile: filePath,
            targetFile: expression.value,
            isTypeOnly: n.isTypeOnly === true,
          })
        }
      }
      break
    }
  }

  return imports
}

const isEntryFileCache = new Map<string, RegExp>()
const ignorePatternCache = new Map<string, RegExp>()

function getEntryFileRegex(pattern: string): RegExp {
  const cached = isEntryFileCache.get(pattern)
  if (cached) return cached

  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*').replace(/\?/g, '.')}$`)
  isEntryFileCache.set(pattern, regex)
  return regex
}

function getIgnorePatternRegex(pattern: string): RegExp {
  const cached = ignorePatternCache.get(pattern)
  if (cached) return cached

  const regex = new RegExp(pattern.slice(1, -1))
  ignorePatternCache.set(pattern, regex)
  return regex
}

function isEntryFile(filePath: string, entryFiles: readonly string[]): boolean {
  if (entryFiles.length === 0) {
    const fileName = filePath.split('/').pop() ?? ''
    return (
      fileName === 'index.ts' ||
      fileName === 'index.js' ||
      fileName === 'main.ts' ||
      fileName === 'main.js'
    )
  }

  return entryFiles.some((pattern) => {
    if (pattern.includes('*')) {
      return getEntryFileRegex(pattern).test(filePath)
    }
    return filePath.includes(pattern)
  })
}

function shouldIgnoreExport(name: string, patterns: readonly string[]): boolean {
  if (patterns.length === 0) return false

  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      return getIgnorePatternRegex(pattern).test(name)
    }
    return name === pattern
  })
}

/**
 * Rule: no-unused-exports
 * Finds exports that are never imported by any other file.
 */
export const noUnusedExportsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    fixable: 'code',
    docs: {
      description:
        'Disallow exports that are never imported by other modules. Unused exports indicate dead code or missing documentation.',
      category: 'dependencies',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-exports',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignorePatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreTypeOnly: {
            type: 'boolean',
            default: false,
          },
          allowEntryExports: {
            type: 'boolean',
            default: true,
          },
          entryFiles: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<UnusedExportsOptions>(context.config.options, {
      ignorePatterns: [],
      ignoreTypeOnly: false,
      allowEntryExports: true,
      entryFiles: [],
    })
    const filePath = context.getFilePath()

    // Reset global state if we're re-processing a file (new analysis run)
    if (globalExports.has(filePath)) {
      globalExports.clear()
      globalImports.clear()
      importedByTargetFile.clear()
    }

    const ignorePatterns = options.ignorePatterns ?? []
    const ignoreTypeOnly = options.ignoreTypeOnly ?? false
    const allowEntryExports = options.allowEntryExports ?? true
    const entryFiles = options.entryFiles ?? []

    return {
      Program(node: unknown): void {
        const ast = context.getAST() ?? node
        const exports = extractExports(ast, filePath)
        const imports = extractImports(ast, filePath)

        globalExports.set(filePath, exports)
        globalImports.set(filePath, imports)

        // Build reverse index incrementally
        for (const imp of imports) {
          const target = imp.targetFile
          let names = importedByTargetFile.get(target)
          if (names) {
            names.add(imp.name)
          } else {
            importedByTargetFile.set(target, new Set([imp.name]))
          }
        }
      },

      'Program:exit'(): void {
        if (allowEntryExports && isEntryFile(filePath, entryFiles)) {
          return
        }

        const fileExports = globalExports.get(filePath) ?? []
        const usedExports = new Set<string>()
        const targetImports = importedByTargetFile.get(filePath)
        if (targetImports) {
          targetImports.forEach((name) => usedExports.add(name))
        }

        for (const exp of fileExports) {
          if (ignoreTypeOnly && exp.isTypeOnly) {
            continue
          }

          if (shouldIgnoreExport(exp.name, ignorePatterns)) {
            continue
          }

          if (!usedExports.has(exp.name) && !usedExports.has('*')) {
            context.report({
              message: `Export '${exp.name}' is never used in other modules`,
              loc: exp.location,
            })
          }
        }
      },
    }
  },
}

export default noUnusedExportsRule
