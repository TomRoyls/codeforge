import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'
import { type BinaryExpression, Node, type SourceFile } from 'ts-morph'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { MAX_TOP_STATS_FILES } from '../utils/constants.js'

export default class Stats extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Display codebase statistics and metrics'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show statistics for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Show statistics for src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 largest files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output stats.json',
      description: 'Save statistics to JSON file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Show statistics for TypeScript files only',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
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
    'sort-by': Flags.string({
      char: 's',
      default: 'size',
      description: 'Sort files by metric',
      options: ['complexity', 'loc', 'name', 'size'],
    }),
    top: Flags.integer({
      char: 't',
      default: MAX_TOP_STATS_FILES,
      description: 'Number of top files to show',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed file statistics',
    }),
  }

  private parser: null | Parser = null

  private static isLogicalOperator(node: BinaryExpression): boolean {
    const operator = node.getOperatorToken().getKind()
    return operator === 56 || operator === 57
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Stats)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

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

    spinner.text = 'Analyzing files...'

    this.parser = new Parser()
    await this.parser.initialize()

    let stats: StatsResult
    try {
      stats = await this.collectStats(filteredFiles, verbose, flags['sort-by'], format)
    } finally {
      this.parser.dispose()
      this.parser = null
    }

    spinner.succeed(`Analyzed ${filteredFiles.length} files`)

    const outputData =
      format === 'json'
        ? JSON.stringify(stats, null, 2)
        : this.formatOutput(stats, format, flags.top)

    if (flags.output) {
      await fs.writeFile(flags.output, outputData, 'utf8')
      this.log(`Results written to ${flags.output}`)
    } else if (format === 'json') {
      this.log(outputData)
    } else {
      this.log(outputData)
    }
  }

  private calculateFileComplexity(sourceFile: SourceFile): number {
    let complexity = 0

    function visit(node: Node): void {
      if (
        Node.isIfStatement(node) ||
        Node.isForStatement(node) ||
        Node.isForInStatement(node) ||
        Node.isForOfStatement(node) ||
        Node.isWhileStatement(node) ||
        Node.isDoStatement(node) ||
        Node.isCatchClause(node) ||
        Node.isConditionalExpression(node)
      ) {
        complexity += 1
      }

      if (Node.isCaseClause(node)) {
        complexity += 1
      }

      if (Node.isBinaryExpression(node) && Stats.isLogicalOperator(node)) {
        complexity += 1
      }

      node.forEachChild(visit)
    }

    sourceFile.forEachChild(visit)
    return Math.max(complexity, 1)
  }

  private async collectStats(
    files: Array<{ absolutePath: string; path: string }>,
    verbose: boolean,
    sortBy: string,
    format: 'json' | 'table',
  ): Promise<StatsResult> {
    const fileStats: FileStats[] = []
    let totalLoc = 0
    let totalComments = 0
    let totalBlank = 0
    let totalComplexity = 0
    const totalStructures: CodeStructures = {
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    }
    const fileTypes: Record<string, number> = {}
    const tsExtensions = new Set(['.ts', '.tsx'])
    const defaultStructures: CodeStructures = {
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    }

    const results = await Promise.all(
      files.map(async (file) => {
        if (!file) return null

        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          const lines = content.split('\n')
          let loc = 0
          let comments = 0
          let blank = 0
          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.length === 0) {
              blank++
            } else if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
              comments++
            } else {
              loc++
            }
          }

          const ext = extname(file.path).toLowerCase()

          const localDefaultStructures: CodeStructures = {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          }
          let complexity = 1
          let structures = localDefaultStructures

          if (this.parser && tsExtensions.has(ext)) {
            try {
              const parseResult = await this.parser.parseFile(file.absolutePath)
              complexity = this.calculateFileComplexity(parseResult.sourceFile)
              structures = this.countCodeStructures(parseResult.sourceFile)
            } catch {
              complexity = 1
              structures = localDefaultStructures
            }
          }

          return {
            blank,
            comments,
            complexity,
            ext,
            file,
            loc,
            size: content.length,
            structures,
          }
        } catch (error) {
          if (format !== 'json') {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            this.log(`Failed to process file ${file.path}: ${errorMessage}`)
          }

          return {
            blank: 0,
            comments: 0,
            complexity: 1,
            ext: extname(file.path).toLowerCase(),
            file,
            loc: 0,
            size: 0,
            structures: defaultStructures,
          }
        }
      }),
    )

    for (const result of results) {
      if (!result) continue

      const { blank, comments, complexity, ext, file, loc, size, structures } = result

      fileTypes[ext] = (fileTypes[ext] || 0) + 1

      totalLoc += loc
      totalComments += comments
      totalBlank += blank
      totalComplexity += complexity
      totalStructures.classes += structures.classes
      totalStructures.enums += structures.enums
      totalStructures.functions += structures.functions
      totalStructures.interfaces += structures.interfaces
      totalStructures.methods += structures.methods
      totalStructures.typeAliases += structures.typeAliases

      if (verbose) {
        fileStats.push({
          blankLines: blank,
          commentLines: comments,
          complexity,
          loc,
          name: file.path,
          size,
          structures,
          type: ext || 'unknown',
        })
      }
    }

    fileStats.sort((a, b) => {
      switch (sortBy) {
        case 'complexity': {
          return b.complexity - a.complexity
        }

        case 'loc': {
          return b.loc - a.loc
        }

        case 'name': {
          return a.name.localeCompare(b.name)
        }

        default: {
          return b.size - a.size
        }
      }
    })

    return {
      files: fileStats.slice(0, MAX_TOP_STATS_FILES),
      fileTypes,
      summary: {
        averageComplexity: files.length > 0 ? Math.round(totalComplexity / files.length) : 0,
        averageLoc: files.length > 0 ? Math.round(totalLoc / files.length) : 0,
        blankLines: totalBlank,
        classes: totalStructures.classes,
        commentLines: totalComments,
        complexity: totalComplexity,
        enums: totalStructures.enums,
        files: files.length,
        functions: totalStructures.functions,
        interfaces: totalStructures.interfaces,
        loc: totalLoc,
        methods: totalStructures.methods,
        typeAliases: totalStructures.typeAliases,
      },
    }
  }

  private countCodeStructures(sourceFile: SourceFile): CodeStructures {
    const structures: CodeStructures = {
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    }

    function visit(node: Node): void {
      if (Node.isFunctionDeclaration(node)) {
        structures.functions++
      }

      if (Node.isMethodDeclaration(node) || Node.isConstructorDeclaration(node)) {
        structures.methods++
      }

      if (Node.isClassDeclaration(node)) {
        structures.classes++
      }

      if (Node.isInterfaceDeclaration(node)) {
        structures.interfaces++
      }

      if (Node.isTypeAliasDeclaration(node)) {
        structures.typeAliases++
      }

      if (Node.isEnumDeclaration(node)) {
        structures.enums++
      }

      node.forEachChild(visit)
    }

    sourceFile.forEachChild(visit)
    return structures
  }

  private formatCsv(stats: StatsResult): string {
    const headers = ['File', 'LOC', 'Complexity', 'Size (bytes)', 'Type']
    const rows = stats.files.map((f) => [
      f.name,
      f.loc.toString(),
      f.complexity.toString(),
      f.size.toString(),
      f.type,
    ])
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  }

  private formatOutput(stats: StatsResult, format: string, top: number): string {
    if (format === 'csv') {
      return this.formatCsv(stats)
    }

    return this.formatTable(stats, top)
  }

  private formatTable(stats: StatsResult, top: number): string {
    const { summary } = stats

    const lines = [
      chalk.bold('\n📊 Codebase Statistics\n'),
      chalk.dim('Summary:'),
      `  Total files: ${summary.files}`,
      `  Lines of code: ${summary.loc.toLocaleString()}`,
      `  Total complexity: ${summary.complexity.toLocaleString()}`,
      `  Blank lines: ${summary.blankLines.toLocaleString()}`,
      `  Comment lines: ${summary.commentLines.toLocaleString()}`,
      '',
      chalk.dim('Code structures:'),
      `  Classes: ${summary.classes}`,
      `  Functions: ${summary.functions}`,
      `  Methods: ${summary.methods}`,
      `  Interfaces: ${summary.interfaces}`,
      `  Type aliases: ${summary.typeAliases}`,
      `  Enums: ${summary.enums}`,
      '',
      chalk.dim('File Types:'),
      ...Object.entries(stats.fileTypes).map(([ext, count]) => `  ${ext}: ${count}`),
      '',
      chalk.dim(`Top ${top} Largest Files:`),
      ...stats.files
        .slice(0, top)
        .flatMap((file) => [
          `  ${file.name}`,
          `    LOC: ${file.loc}, Complexity: ${file.complexity}, Size: ${file.size} bytes`,
        ]),
    ]

    return lines.join('\n')
  }
}

interface CodeStructures {
  classes: number
  enums: number
  functions: number
  interfaces: number
  methods: number
  typeAliases: number
}

interface FileStats {
  blankLines: number
  commentLines: number
  complexity: number
  loc: number
  name: string
  size: number
  structures: CodeStructures
  type: string
}

interface StatsResult {
  files: FileStats[]
  fileTypes: Record<string, number>
  summary: {
    averageComplexity: number
    averageLoc: number
    blankLines: number
    classes: number
    commentLines: number
    complexity: number
    enums: number
    files: number
    functions: number
    interfaces: number
    loc: number
    methods: number
    typeAliases: number
  }
}
