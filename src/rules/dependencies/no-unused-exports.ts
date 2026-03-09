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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractExports(ast: any, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []

  if (!ast || typeof ast !== 'object') {
    return exports
  }

  const body = ast.body ?? ast.program?.body ?? []

  for (const node of body) {
    const nodeExports = extractExportsFromNode(node, filePath)
    exports.push(...nodeExports)
  }

  return exports
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractExportsFromNode(node: any, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []

  if (!node || typeof node !== 'object') {
    return exports
  }

  const location = extractLocation(node)

  switch (node.type) {
    case 'ExportNamedDeclaration':
      if (node.declaration) {
        if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id?.name) {
          exports.push({
            name: node.declaration.id.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: node.exportKind === 'type',
          })
        } else if (node.declaration.type === 'VariableDeclaration') {
          for (const decl of node.declaration.declarations ?? []) {
            if (decl.id?.type === 'Identifier' && decl.id.name) {
              exports.push({
                name: decl.id.name,
                filePath,
                type: 'named',
                location,
                isTypeOnly: node.exportKind === 'type',
              })
            }
          }
        } else if (node.declaration.type === 'ClassDeclaration' && node.declaration.id?.name) {
          exports.push({
            name: node.declaration.id.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: node.exportKind === 'type',
          })
        } else if (
          node.declaration.type === 'TSTypeAliasDeclaration' &&
          node.declaration.id?.name
        ) {
          exports.push({
            name: node.declaration.id.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: true,
          })
        } else if (
          node.declaration.type === 'TSInterfaceDeclaration' &&
          node.declaration.id?.name
        ) {
          exports.push({
            name: node.declaration.id.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: true,
          })
        }
      } else if (node.specifiers) {
        for (const spec of node.specifiers) {
          if (spec.type === 'ExportSpecifier' && spec.exported?.name) {
            exports.push({
              name: spec.exported.name,
              filePath,
              type: 'named',
              location,
              isTypeOnly: spec.exportKind === 'type' || node.exportKind === 'type',
            })
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
        isTypeOnly: node.exportKind === 'type',
      })
      break

    case 'FunctionDeclaration':
      if (node.id?.name) {
        const hasExport = hasExportModifier(node)
        if (hasExport) {
          exports.push({
            name: node.id.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: false,
          })
        }
      }
      break

    case 'ClassDeclaration':
      if (node.id?.name) {
        const hasExport = hasExportModifier(node)
        if (hasExport) {
          exports.push({
            name: node.id.name,
            filePath,
            type: 'named',
            location,
            isTypeOnly: false,
          })
        }
      }
      break

    case 'VariableDeclaration':
      const hasExport = hasExportModifier(node)
      if (hasExport) {
        for (const decl of node.declarations ?? []) {
          if (decl.id?.type === 'Identifier' && decl.id.name) {
            exports.push({
              name: decl.id.name,
              filePath,
              type: 'named',
              location,
              isTypeOnly: false,
            })
          }
        }
      }
      break
  }

  return exports
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasExportModifier(node: any): boolean {
  if (!node.modifiers) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return node.modifiers.some((mod: any) => mod.type === 'TSExportKeyword' || mod.kind === 'export')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImports(ast: any, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []

  if (!ast || typeof ast !== 'object') {
    return imports
  }

  const body = ast.body ?? ast.program?.body ?? []

  for (const node of body) {
    const nodeImports = extractImportsFromNode(node, filePath)
    imports.push(...nodeImports)
  }

  return imports
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImportsFromNode(node: any, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []

  if (!node || typeof node !== 'object') {
    return imports
  }

  switch (node.type) {
    case 'ImportDeclaration':
      const source = node.source?.value
      if (source) {
        if (node.specifiers) {
          for (const spec of node.specifiers) {
            let importedName = ''
            let isTypeOnly = node.importKind === 'type'

            switch (spec.type) {
              case 'ImportDefaultSpecifier':
                importedName = 'default'
                break
              case 'ImportNamespaceSpecifier':
                importedName = '*'
                break
              case 'ImportSpecifier':
                importedName = spec.imported?.name ?? ''
                isTypeOnly = isTypeOnly || spec.importKind === 'type'
                break
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

    case 'CallExpression':
      if (
        node.callee?.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments?.[0]?.type === 'StringLiteral'
      ) {
        const source = node.arguments[0].value
        imports.push({
          name: '*',
          sourceFile: filePath,
          targetFile: source,
          isTypeOnly: false,
        })
      } else if (node.callee?.type === 'Import') {
        const source = node.arguments?.[0]?.value
        if (source) {
          imports.push({
            name: '*',
            sourceFile: filePath,
            targetFile: source,
            isTypeOnly: false,
          })
        }
      }
      break

    case 'TSImportEqualsDeclaration':
      const moduleRef = node.moduleReference
      if (moduleRef?.type === 'TSExternalModuleReference' && moduleRef.expression?.value) {
        imports.push({
          name: node.id?.name ?? '*',
          sourceFile: filePath,
          targetFile: moduleRef.expression.value,
          isTypeOnly: node.isTypeOnly ?? false,
        })
      }
      break
  }

  return imports
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
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
      return regex.test(filePath)
    }
    return filePath.includes(pattern)
  })
}

function shouldIgnoreExport(name: string, patterns: readonly string[]): boolean {
  if (patterns.length === 0) return false

  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      const regex = new RegExp(pattern.slice(1, -1))
      return regex.test(name)
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
    const rawOptions = context.config.options
    const options: UnusedExportsOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as UnusedExportsOptions
    const filePath = context.getFilePath()
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
      },

      'Program:exit'(): void {
        if (allowEntryExports && isEntryFile(filePath, entryFiles)) {
          return
        }

        const fileExports = globalExports.get(filePath) ?? []
        const usedExports = new Set<string>()

        for (const [, imports] of globalImports) {
          for (const imp of imports) {
            const resolvedTarget = imp.targetFile
            if (resolvedTarget === filePath || resolvedTarget.endsWith(filePath)) {
              usedExports.add(imp.name)
            }
          }
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
