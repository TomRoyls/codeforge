import { Node, type SourceFile } from 'ts-morph'

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ExportInfo {
  file: string
  isDefault: boolean
  isExported: boolean
  line: number
  name: string
  signature?: string
  type: 'class' | 'const' | 'function' | 'interface' | 'type'
  usageCount: number
}

export interface TypeSummary {
  class: number
  const: number
  function: number
  interface: number
  type: number
}

export interface AnalysisResult {
  exports: ExportInfo[]
  totalFiles: number
  typeSummary: TypeSummary
  unusedExports: ExportInfo[]
}

export interface FormatOptions {
  format: 'console' | 'json' | 'markdown'
  showUnused: boolean
  totalFiles: number
  typeSummary: TypeSummary
  unusedExports: ExportInfo[]
}

// ============================================================================
// Pure Helper Functions
// ============================================================================

export function extractImports(sourceFile: SourceFile): Map<string, number> {
  const imports = new Map<string, number>()

  for (const importDecl of sourceFile.getImportDeclarations()) {
    for (const namedImport of importDecl.getNamedImports()) {
      const name = namedImport.getName()
      imports.set(name, (imports.get(name) ?? 0) + 1)
    }

    const defaultImport = importDecl.getDefaultImport()
    if (defaultImport) {
      const name = defaultImport.getText()
      imports.set(name, (imports.get(name) ?? 0) + 1)
    }

    const namespaceImport = importDecl.getNamespaceImport()
    if (namespaceImport) {
      const name = namespaceImport.getText()
      imports.set(name, (imports.get(name) ?? 0) + 1)
    }
  }

  return imports
}

export function extractExports(sourceFile: SourceFile, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []

  sourceFile.forEachDescendant((node): false | void => {
    let exportInfo: ExportInfo | null = null

    if (Node.isFunctionDeclaration(node) && node.isExported()) {
      const name = node.getName() || 'anonymous'
      const signature = getFunctionSignature(node)
      exportInfo = {
        file: filePath,
        isDefault: node.isDefaultExport(),
        isExported: true,
        line: node.getStartLineNumber(),
        name,
        signature,
        type: 'function',
        usageCount: 0,
      }
    } else if (Node.isClassDeclaration(node) && node.isExported()) {
      const name = node.getName() || 'anonymous'
      exportInfo = {
        file: filePath,
        isDefault: node.isDefaultExport(),
        isExported: true,
        line: node.getStartLineNumber(),
        name,
        type: 'class',
        usageCount: 0,
      }
    } else if (Node.isInterfaceDeclaration(node) && node.isExported()) {
      exportInfo = {
        file: filePath,
        isDefault: node.isDefaultExport(),
        isExported: true,
        line: node.getStartLineNumber(),
        name: node.getName(),
        type: 'interface',
        usageCount: 0,
      }
    } else if (Node.isTypeAliasDeclaration(node) && node.isExported()) {
      const typeNode = node.getTypeNode()
      const signature = typeNode ? typeNode.getText() : undefined
      exportInfo = {
        file: filePath,
        isDefault: node.isDefaultExport(),
        isExported: true,
        line: node.getStartLineNumber(),
        name: node.getName(),
        signature,
        type: 'type',
        usageCount: 0,
      }
    } else if (Node.isVariableStatement(node) && node.isExported()) {
      const declarations = node.getDeclarations()
      for (const decl of declarations) {
        const name = decl.getName()
        const initializer = decl.getInitializer()
        const signature = initializer ? truncateSignature(initializer.getText()) : undefined

        exports.push({
          file: filePath,
          isDefault: node.isDefaultExport(),
          isExported: true,
          line: node.getStartLineNumber(),
          name,
          signature,
          type: 'const',
          usageCount: 0,
        })
      }

      return false
    }

    if (exportInfo) {
      exports.push(exportInfo)
    }
  })

  return exports
}

export function getFunctionSignature(node: import('ts-morph').FunctionDeclaration): string {
  try {
    const params = node
      .getParameters()
      .map((p) => p.getText())
      .join(', ')
    const returnType = node.getReturnType().getText()
    const isAsync = node.isAsync()

    let signature = `(${params})`
    if (returnType && returnType !== 'void') {
      signature += ` => ${returnType}`
    }

    if (isAsync) {
      signature = `async ${signature}`
    }

    return truncateSignature(signature)
  } catch {
    return ''
  }
}

export function truncateSignature(signature: string, maxLength = 80): string {
  if (signature.length <= maxLength) {
    return signature
  }

  return signature.slice(0, Math.max(0, maxLength - 3)) + '...'
}

export {
  formatConsole,
  formatJson,
  formatMarkdown,
  formatOutput,
  getTypeColor,
} from './exports-format-helpers.js'
