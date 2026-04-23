/**
 * @file Unused exports detection rule for CodeForge
 * Finds exports that are never imported by any other file
 * @module rules/dependencies/no-unused-exports
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface ExportInfo {
  readonly filePath: string
  readonly isTypeOnly: boolean
  readonly location: SourceLocation
  readonly name: string
  readonly type: 'default' | 'named' | 'namespace'
}

interface ImportInfo {
  readonly isTypeOnly: boolean
  readonly name: string
  readonly sourceFile: string
  readonly targetFile: string
}

interface UnusedExportsOptions {
  readonly allowEntryExports?: boolean
  readonly entryFiles?: readonly string[]
  readonly ignorePatterns?: readonly string[]
  readonly ignoreTypeOnly?: boolean
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

function makeExport(
  filePath: string,
  name: string,
  type: ExportInfo['type'],
  isTypeOnly: boolean,
  location: SourceLocation,
): ExportInfo {
  return { filePath, isTypeOnly, location, name, type }
}

function extractVariableDeclExports(
  declaration: Record<string, unknown>,
  filePath: string,
  isTypeOnly: boolean,
  location: SourceLocation,
): ExportInfo[] {
  const results: ExportInfo[] = []
  const { declarations } = declaration
  if (Array.isArray(declarations)) {
    for (const decl of declarations) {
      if (!decl || typeof decl !== 'object') continue
      const declNode = decl as Record<string, unknown>
      const id = declNode.id as Record<string, unknown> | undefined
      if (id?.type === 'Identifier' && typeof id.name === 'string') {
        results.push(makeExport(filePath, id.name, 'named', isTypeOnly, location))
      }
    }
  }

  return results
}

function extractExportSpecifiers(
  n: Record<string, unknown>,
  filePath: string,
  location: SourceLocation,
): ExportInfo[] {
  const results: ExportInfo[] = []
  const { specifiers } = n
  if (Array.isArray(specifiers)) {
    for (const spec of specifiers) {
      if (!spec || typeof spec !== 'object') continue
      const specNode = spec as Record<string, unknown>
      if (specNode.type === 'ExportSpecifier') {
        const exported = specNode.exported as Record<string, unknown> | undefined
        if (exported?.name && typeof exported.name === 'string') {
          results.push(
            makeExport(
              filePath,
              exported.name,
              'named',
              specNode.exportKind === 'type' || n.exportKind === 'type',
              location,
            ),
          )
        }
      }
    }
  }

  return results
}

function extractExportsFromNode(node: unknown, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []

  if (!node || typeof node !== 'object') {
    return exports
  }

  const location = extractLocation(node)
  const n = node as Record<string, unknown>

  switch (n.type) {
    case 'ClassDeclaration': {
      const classId = n.id as Record<string, unknown> | undefined
      if (classId?.name && typeof classId.name === 'string' && hasExportModifier(n)) {
        exports.push(makeExport(filePath, classId.name, 'named', false, location))
      }

      break
    }

    case 'ExportAllDeclaration': {
      exports.push(makeExport(filePath, '*', 'namespace', n.exportKind === 'type', location))
      break
    }

    case 'ExportDefaultDeclaration': {
      exports.push(makeExport(filePath, 'default', 'default', false, location))
      break
    }

    case 'ExportNamedDeclaration': {
      const declaration = n.declaration as Record<string, unknown> | undefined
      if (declaration) {
        const declType = declaration.type as string | undefined
        const isTypeOnly = n.exportKind === 'type'
        const name = getDeclName(declaration)
        if (name) {
          const typeIsTypeOnly =
            declType === 'TSInterfaceDeclaration' || declType === 'TSTypeAliasDeclaration'
          exports.push(makeExport(filePath, name, 'named', typeIsTypeOnly || isTypeOnly, location))
        } else if (declType === 'VariableDeclaration') {
          exports.push(...extractVariableDeclExports(declaration, filePath, isTypeOnly, location))
        }
      } else {
        exports.push(...extractExportSpecifiers(n, filePath, location))
      }

      break
    }

    case 'FunctionDeclaration': {
      const funcId = n.id as Record<string, unknown> | undefined
      if (funcId?.name && typeof funcId.name === 'string' && hasExportModifier(n)) {
        exports.push(makeExport(filePath, funcId.name, 'named', false, location))
      }

      break
    }

    case 'VariableDeclaration': {
      if (hasExportModifier(n)) {
        exports.push(...extractVariableDeclExports(n, filePath, false, location))
      }

      break
    }
  }

  return exports
}

function getDeclName(declaration: Record<string, unknown>): null | string {
  const id = declaration.id as Record<string, unknown> | undefined
  return id?.name && typeof id.name === 'string' ? id.name : null
}

function hasExportModifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  const { modifiers } = n
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
    case 'CallExpression': {
      const callee = n.callee as Record<string, unknown> | undefined
      const arguments_ = n.arguments as undefined | unknown[]
      if (
        callee?.type === 'Identifier' &&
        callee.name === 'require' &&
        Array.isArray(arguments_) &&
        arguments_.length > 0
      ) {
        const arg0 = arguments_[0] as Record<string, unknown> | undefined
        if (
          (arg0?.type === 'Literal' || arg0?.type === 'StringLiteral') &&
          typeof arg0.value === 'string'
        ) {
          imports.push({
            isTypeOnly: false,
            name: '*',
            sourceFile: filePath,
            targetFile: arg0.value,
          })
        }
      } else if (callee?.type === 'Import' && Array.isArray(arguments_) && arguments_.length > 0) {
        const arg0 = arguments_[0] as Record<string, unknown> | undefined
        if (arg0?.value && typeof arg0.value === 'string') {
          imports.push({
            isTypeOnly: false,
            name: '*',
            sourceFile: filePath,
            targetFile: arg0.value,
          })
        }
      }

      break
    }

    case 'ImportDeclaration': {
      const sourceNode = n.source as Record<string, unknown> | undefined
      const source = sourceNode?.value
      if (typeof source === 'string') {
        const { specifiers } = n
        if (Array.isArray(specifiers)) {
          for (const spec of specifiers) {
            if (!spec || typeof spec !== 'object') continue
            const specNode = spec as Record<string, unknown>
            let importedName = ''
            let isTypeOnly = n.importKind === 'type'

            switch (specNode.type) {
              case 'ImportDefaultSpecifier': {
                importedName = 'default'
                break
              }

              case 'ImportNamespaceSpecifier': {
                importedName = '*'
                break
              }

              case 'ImportSpecifier': {
                const imported = specNode.imported as Record<string, unknown> | undefined
                importedName = imported?.name ? (imported.name as string) : ''
                isTypeOnly = isTypeOnly || specNode.importKind === 'type'
                break
              }
            }

            if (importedName) {
              imports.push({
                isTypeOnly,
                name: importedName,
                sourceFile: filePath,
                targetFile: source,
              })
            }
          }
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
            isTypeOnly: n.isTypeOnly === true,
            name: id?.name ? (id.name as string) : '*',
            sourceFile: filePath,
            targetFile: expression.value,
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

  const regex = new RegExp(`^${pattern.replaceAll('*', '.*').replaceAll('?', '.')}$`)
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
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<UnusedExportsOptions>(context.config.options, {
      allowEntryExports: true,
      entryFiles: [],
      ignorePatterns: [],
      ignoreTypeOnly: false,
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
          const names = importedByTargetFile.get(target)
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
          for (const name of targetImports) usedExports.add(name)
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
              loc: exp.location,
              message: `Export '${exp.name}' is never used in other modules`,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description:
        'Disallow exports that are never imported by other modules. Unused exports indicate dead code or missing documentation.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-exports',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowEntryExports: {
            default: true,
            type: 'boolean',
          },
          entryFiles: {
            items: { type: 'string' },
            type: 'array',
          },
          ignorePatterns: {
            items: { type: 'string' },
            type: 'array',
          },
          ignoreTypeOnly: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnusedExportsRule
