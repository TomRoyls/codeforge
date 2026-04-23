import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange } from '../../ast/visitor.js'

interface PreferDefaultExportOptions extends RuleOptions {
  ignoreExportedTypes?: boolean
  target?: 'all' | 'single'
}

const DEFAULT_OPTIONS: PreferDefaultExportOptions = {
  ignoreExportedTypes: false,
  target: 'single',
}

export const preferDefaultExportRule: RuleDefinition<PreferDefaultExportOptions> = {
  create(options: PreferDefaultExportOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      onComplete: () => violations,
      visitor: {
        visitSourceFile(sourceFile: SourceFile, _context: VisitorContext) {
          const namedExports: Node[] = []
          const defaultExport = sourceFile.getDefaultExportSymbol()

          // Collect all named exports
          const exportDeclarations = sourceFile.getExportDeclarations()
          for (const exportDecl of exportDeclarations) {
            if (!exportDecl.isNamespaceExport()) {
              namedExports.push(exportDecl)
            }
          }

          // Collect exported declarations
          const variableStatements = sourceFile.getVariableStatements()
          for (const stmt of variableStatements) {
            if (stmt.isExported()) {
              for (const decl of stmt.getDeclarations()) {
                namedExports.push(decl)
              }
            }
          }

          const functionDeclarations = sourceFile.getFunctions()
          for (const func of functionDeclarations) {
            if (func.isExported() && !func.isDefaultExport()) {
              namedExports.push(func)
            }
          }

          const classDeclarations = sourceFile.getClasses()
          for (const cls of classDeclarations) {
            if (cls.isExported() && !cls.isDefaultExport()) {
              namedExports.push(cls)
            }
          }

          const interfaceDeclarations = sourceFile.getInterfaces()
          if (!mergedOptions.ignoreExportedTypes) {
            for (const iface of interfaceDeclarations) {
              if (iface.isExported()) {
                namedExports.push(iface)
              }
            }
          }

          const typeAliases = sourceFile.getTypeAliases()
          if (!mergedOptions.ignoreExportedTypes) {
            for (const typeAlias of typeAliases) {
              if (typeAlias.isExported()) {
                namedExports.push(typeAlias)
              }
            }
          }

          const enumDeclarations = sourceFile.getEnums()
          if (!mergedOptions.ignoreExportedTypes) {
            for (const enumDecl of enumDeclarations) {
              if (enumDecl.isExported()) {
                namedExports.push(enumDecl)
              }
            }
          }

          // Check if there's exactly one named export and no default export
          if (
            mergedOptions.target === 'single' &&
            namedExports.length === 1 &&
            !defaultExport
          ) {
            const node = namedExports[0]!
            const range = getNodeRange(node)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: `Module has only one export. Consider using a default export instead.`,
              range,
              ruleId: 'prefer-default-export',
              severity: 'warning',
              suggestion:
                'Convert this to a default export for cleaner imports.',
            })
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description:
      'Enforce using default export when a module only exports one declaration',
    fixable: undefined,
    name: 'prefer-default-export',
    recommended: false,
  },
}

export function analyzePreferDefaultExport(
  sourceFile: SourceFile,
  options: PreferDefaultExportOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: PreferDefaultExportOptions = { ...DEFAULT_OPTIONS, ...options }

  const namedExports: Node[] = []
  const defaultExport = sourceFile.getDefaultExportSymbol()

  // Collect all named exports
  const exportDeclarations = sourceFile.getExportDeclarations()
  for (const exportDecl of exportDeclarations) {
    if (!exportDecl.isNamespaceExport()) {
      namedExports.push(exportDecl)
    }
  }

  // Collect exported declarations
  const variableStatements = sourceFile.getVariableStatements()
  for (const stmt of variableStatements) {
    if (stmt.isExported()) {
      for (const decl of stmt.getDeclarations()) {
        namedExports.push(decl)
      }
    }
  }

  const functionDeclarations = sourceFile.getFunctions()
  for (const func of functionDeclarations) {
    if (func.isExported() && !func.isDefaultExport()) {
      namedExports.push(func)
    }
  }

  const classDeclarations = sourceFile.getClasses()
  for (const cls of classDeclarations) {
    if (cls.isExported() && !cls.isDefaultExport()) {
      namedExports.push(cls)
    }
  }

  const interfaceDeclarations = sourceFile.getInterfaces()
  if (!mergedOptions.ignoreExportedTypes) {
    for (const iface of interfaceDeclarations) {
      if (iface.isExported()) {
        namedExports.push(iface)
      }
    }
  }

  const typeAliases = sourceFile.getTypeAliases()
  if (!mergedOptions.ignoreExportedTypes) {
    for (const typeAlias of typeAliases) {
      if (typeAlias.isExported()) {
        namedExports.push(typeAlias)
      }
    }
  }

  const enumDeclarations = sourceFile.getEnums()
  if (!mergedOptions.ignoreExportedTypes) {
    for (const enumDecl of enumDeclarations) {
      if (enumDecl.isExported()) {
        namedExports.push(enumDecl)
      }
    }
  }

  // Check if there's exactly one named export and no default export
  if (
    mergedOptions.target === 'single' &&
    namedExports.length === 1 &&
    !defaultExport
  ) {
    const node = namedExports[0]!
    const range = getNodeRange(node)
    violations.push({
      filePath: sourceFile.getFilePath(),
      message: `Module has only one export. Consider using a default export instead.`,
      range,
      ruleId: 'prefer-default-export',
      severity: 'warning',
      suggestion: 'Convert this to a default export for cleaner imports.',
    })
  }

  return violations
}
