/**
 * Exports command - analyzes and lists all exports from TypeScript/JavaScript files.
 *
 * This command helps developers understand their API surface by analyzing
 * all exported functions, classes, interfaces, types, and constants.
 *
 * Features:
 * - List all exports from TypeScript/JavaScript files
 * - Filter by export type (function, class, interface, type, const)
 * - Show export signatures/types
 * - Identify potentially unused exports (--unused flag)
 * - Support multiple output formats (console, json, markdown)
 * - Show usage count for each export
 *
 * @example
 * ```bash
 * codeforge exports
 * codeforge exports src/ --format json
 * codeforge exports --type function
 * codeforge exports --unused
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora, { type Ora } from 'ora'
import { Node, type SourceFile } from 'ts-morph'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'

interface ExportInfo {
  file: string
  isDefault: boolean
  isExported: boolean
  line: number
  name: string
  signature?: string
  type: 'class' | 'const' | 'function' | 'interface' | 'type'
  usageCount: number
}

interface TypeSummary {
  class: number
  const: number
  function: number
  interface: number
  type: number
}

interface AnalysisResult {
  exports: ExportInfo[]
  totalFiles: number
  typeSummary: TypeSummary
  unusedExports: ExportInfo[]
}

interface FormatOptions {
  format: 'console' | 'json' | 'markdown'
  showUnused: boolean
  totalFiles: number
  typeSummary: TypeSummary
  unusedExports: ExportInfo[]
}

export default class Exports extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze (file or directory)',
      required: false,
    }),
  }

  static override description = 'Analyze and list exports from TypeScript/JavaScript files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List all exports in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'List exports in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type function',
      description: 'List only function exports',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output exports as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --unused',
      description: 'Find potentially unused exports',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'console',
      description: 'Output format',
      options: ['console', 'json', 'markdown'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    type: Flags.string({
      char: 't',
      description: 'Filter by export type',
      options: ['class', 'const', 'function', 'interface', 'type'],
    }),
    unused: Flags.boolean({
      char: 'u',
      default: false,
      description: 'Find potentially unused exports',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  private parser: null | Parser = null

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Exports)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'console' | 'json' | 'markdown'
    const typeFilter = flags.type as
      | 'class'
      | 'const'
      | 'function'
      | 'interface'
      | 'type'
      | undefined

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    if (filteredFiles.length === 0) {
      spinner.warn('No files found to analyze')
      this.exit(0)
    }

    spinner.text = 'Analyzing files...'

    this.parser = new Parser()
    await this.parser.initialize()

    let result: AnalysisResult
    try {
      result = await this.collectExports(filteredFiles, spinner, flags.verbose)
    } finally {
      this.parser.dispose()
      this.parser = null
    }

    // Apply type filter if specified
    let filteredExports = result.exports
    if (typeFilter) {
      filteredExports = result.exports.filter((exp) => exp.type === typeFilter)
    }

    // Filter unused if flag is set
    let { unusedExports } = result
    if (typeFilter) {
      unusedExports = result.unusedExports.filter((exp) => exp.type === typeFilter)
    }

    spinner.succeed(
      `Analyzed ${filteredFiles.length} files, found ${filteredExports.length} exports`,
    )

    const outputData = this.formatOutput(filteredExports, {
      format,
      showUnused: flags.unused,
      totalFiles: result.totalFiles,
      typeSummary: result.typeSummary,
      unusedExports,
    })

    if (flags.output) {
      try {
        await writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write exports output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }

    if (flags.unused && unusedExports.length > 0) {
      this.log(chalk.yellow(`\n⚠️  ${unusedExports.length} potentially unused export(s) found`))
    }
  }

  private async collectExports(
    files: Array<{ absolutePath: string; path: string }>,
    spinner: Ora,
    verbose: boolean,
  ): Promise<AnalysisResult> {
    const allExports: ExportInfo[] = []
    const typeSummary: TypeSummary = {
      class: 0,
      const: 0,
      function: 0,
      interface: 0,
      type: 0,
    }
    const allImports = new Map<string, number>()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      if (verbose) {
        spinner.text = `Analyzing ${file.path} (${i + 1}/${files.length})`
      }

      try {
        // eslint-disable-next-line no-await-in-loop -- sequential file processing needed for progress reporting
        const parseResult = await this.parser!.parseFile(file.absolutePath)
        const { sourceFile } = parseResult

        // Collect exports
        const fileExports = this.extractExports(sourceFile, file.path)
        allExports.push(...fileExports)

        // Update type summary
        for (const exp of fileExports) {
          typeSummary[exp.type]++
        }

        // Collect imports for usage tracking
        const imports = this.extractImports(sourceFile)
        for (const [name, count] of imports) {
          allImports.set(name, (allImports.get(name) ?? 0) + count)
        }
      } catch (error) {
        if (verbose) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          this.log(`Failed to analyze ${file.path}: ${errorMessage}`)
        }
      }
    }

    // Calculate usage counts
    for (const exp of allExports) {
      exp.usageCount = allImports.get(exp.name) ?? 0
    }

    // Find unused exports
    const unusedExports = allExports.filter((exp) => exp.usageCount === 0)

    return {
      exports: allExports,
      totalFiles: files.length,
      typeSummary,
      unusedExports,
    }
  }

  private extractExports(sourceFile: SourceFile, filePath: string): ExportInfo[] {
    const exports: ExportInfo[] = []

    // Get all export declarations
    sourceFile.forEachDescendant((node) => {
      let exportInfo: ExportInfo | null = null

      if (Node.isFunctionDeclaration(node) && node.isExported()) {
        const name = node.getName() || 'anonymous'
        const signature = this.getFunctionSignature(node)
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
          const signature = initializer ? this.truncateSignature(initializer.getText()) : undefined

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

        return false // Don't continue traversing this node's children
      }

      if (exportInfo) {
        exports.push(exportInfo)
      }

      return true
    })

    return exports
  }

  private extractImports(sourceFile: SourceFile): Map<string, number> {
    const imports = new Map<string, number>()

    for (const importDecl of sourceFile.getImportDeclarations()) {
      // Named imports
      for (const namedImport of importDecl.getNamedImports()) {
        const name = namedImport.getName()
        imports.set(name, (imports.get(name) ?? 0) + 1)
      }

      // Default import
      const defaultImport = importDecl.getDefaultImport()
      if (defaultImport) {
        const name = defaultImport.getText()
        imports.set(name, (imports.get(name) ?? 0) + 1)
      }

      // Namespace import
      const namespaceImport = importDecl.getNamespaceImport()
      if (namespaceImport) {
        const name = namespaceImport.getText()
        imports.set(name, (imports.get(name) ?? 0) + 1)
      }
    }

    return imports
  }

  private formatConsole(exports: ExportInfo[], options: FormatOptions): string {
    const lines: string[] = []

    lines.push(
      chalk.bold('\n📦 Export Analysis\n'),
      chalk.dim('Summary:'),
      `  Total exports: ${exports.length}`,
      `  Files analyzed: ${options.totalFiles}`,
      '',
      chalk.dim('Export types:'),
      `  Functions: ${options.typeSummary.function}`,
      `  Classes: ${options.typeSummary.class}`,
      `  Interfaces: ${options.typeSummary.interface}`,
      `  Types: ${options.typeSummary.type}`,
      `  Constants: ${options.typeSummary.const}`,
      '',
    )

    if (exports.length > 0) {
      lines.push(chalk.dim('Exports:'))
      for (const exp of exports) {
        const typeColor = this.getTypeColor(exp.type)
        const defaultStr = exp.isDefault ? ' (default)' : ''
        const unusedStr = exp.usageCount === 0 ? chalk.yellow(' ⚠️') : ''

        lines.push(
          `  ${typeColor(exp.type.padEnd(10))} ${exp.name}${defaultStr}${unusedStr}`,
          ...(exp.signature ? [chalk.dim(`    Signature: ${exp.signature}`)] : []),
          chalk.dim(`    File: ${exp.file}:${exp.line}`),
          chalk.dim(`    Usage count: ${exp.usageCount}`),
          '',
        )
      }
    }

    if (options.showUnused && options.unusedExports.length > 0) {
      lines.push(chalk.yellow.bold('⚠️  Potentially Unused Exports:\n'))
      for (const exp of options.unusedExports) {
        lines.push(
          `  ${exp.name} (${exp.type})`,
          chalk.dim(`    File: ${exp.file}:${exp.line}`),
          '',
        )
      }
    }

    return lines.join('\n')
  }

  private formatJson(exports: ExportInfo[], options: FormatOptions): string {
    return JSON.stringify(
      {
        exports,
        summary: {
          exportTypes: options.typeSummary,
          files: options.totalFiles,
          total: exports.length,
          unused: options.unusedExports.length,
        },
        unusedExports: options.unusedExports,
      },
      null,
      2,
    )
  }

  private formatMarkdown(exports: ExportInfo[], options: FormatOptions): string {
    const lines: string[] = []

    lines.push(
      '# Export Analysis\n',
      '## Summary\n',
      `- **Total Exports:** ${exports.length}`,
      `- **Files Analyzed:** ${options.totalFiles}`,
      '',
      '## Export Types\n',
      `- **Functions:** ${options.typeSummary.function}`,
      `- **Classes:** ${options.typeSummary.class}`,
      `- **Interfaces:** ${options.typeSummary.interface}`,
      `- **Types:** ${options.typeSummary.type}`,
      `- **Constants:** ${options.typeSummary.const}`,
      '',
    )

    if (exports.length > 0) {
      lines.push('## All Exports\n')
      for (const exp of exports) {
        const defaultStr = exp.isDefault ? ' (default)' : ''
        lines.push(`### ${exp.name}${defaultStr}\n`, `- **Type:** ${exp.type}`)
        if (exp.signature) {
          lines.push(`- **Signature:** \`${exp.signature}\``)
        }

        lines.push(
          `- **File:** ${exp.file}:${exp.line}`,
          `- **Usage Count:** ${exp.usageCount}`,
          `- **Status:** ${exp.usageCount === 0 ? '⚠️ Potentially Unused' : '✓ Used'}`,
          '',
        )
      }
    }

    if (options.showUnused && options.unusedExports.length > 0) {
      lines.push('## Potentially Unused Exports\n')
      for (const exp of options.unusedExports) {
        lines.push(
          `### ${exp.name}\n`,
          `- **Type:** ${exp.type}`,
          `- **File:** ${exp.file}:${exp.line}`,
          '',
        )
      }
    }

    return lines.join('\n')
  }

  private formatOutput(exports: ExportInfo[], options: FormatOptions): string {
    if (options.format === 'json') {
      return this.formatJson(exports, options)
    }

    if (options.format === 'markdown') {
      return this.formatMarkdown(exports, options)
    }

    return this.formatConsole(exports, options)
  }

  private getFunctionSignature(node: import('ts-morph').FunctionDeclaration): string {
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

      return this.truncateSignature(signature)
    } catch {
      return ''
    }
  }

  private getTypeColor(type: string): (text: string) => string {
    const colors: Record<string, (text: string) => string> = {
      class: chalk.blue,
      const: chalk.cyan,
      function: chalk.green,
      interface: chalk.magenta,
      type: chalk.yellow,
    }
    return colors[type] ?? chalk.white
  }

  private truncateSignature(signature: string, maxLength = 80): string {
    if (signature.length <= maxLength) {
      return signature
    }

    return signature.slice(0, Math.max(0, maxLength - 3)) + '...'
  }
}
