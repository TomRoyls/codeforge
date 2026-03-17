import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'
import { type BinaryExpression, Node, type SourceFile } from 'ts-morph'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'

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
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'sort-by': Flags.string({
      char: 's',
      default: 'size',
      description: 'Sort files by metric',
      options: ['complexity', 'loc', 'name', 'size'],
    }),
    top: Flags.integer({
      char: 't',
      default: 10,
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

    spinner.text = 'Analyzing files...'

    this.parser = new Parser()
    await this.parser.initialize()

    let stats: StatsResult
    try {
      stats = await this.collectStats(discoveredFiles, verbose, flags['sort-by'], format)
    } finally {
      this.parser.dispose()
      this.parser = null
    }

    spinner.succeed(`Analyzed ${discoveredFiles.length} files`)

    if (format === 'json') {
      this.log(JSON.stringify(stats, null, 2))
    } else {
      this.displayTable(stats, flags.top)
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
            content,
            ext,
            file,
            loc,
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
            content: '',
            ext: extname(file.path).toLowerCase(),
            file,
            loc: 0,
            structures: defaultStructures,
          }
        }
      }),
    )

    for (const result of results) {
      if (!result) continue

      const { blank, comments, complexity, content, ext, file, loc, structures } = result

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
          size: content.length,
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
      files: fileStats.slice(0, 10),
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

  private displayTable(stats: StatsResult, topN: number): void {
    const { files, fileTypes, summary } = stats

    this.log('')
    this.log(chalk.bold('Codebase Statistics'))
    this.log('')

    this.log(chalk.bold('Summary:'))
    this.log(chalk.gray(`  Total files: ${summary.files.toLocaleString()}`))
    this.log(chalk.gray(`  Lines of code: ${summary.loc.toLocaleString()}`))
    this.log(chalk.gray(`  Comment lines: ${summary.commentLines.toLocaleString()}`))
    this.log(chalk.gray(`  Blank lines: ${summary.blankLines.toLocaleString()}`))
    this.log(chalk.gray(`  Average LOC/file: ${summary.averageLoc}`))
    this.log('')

    this.log(chalk.bold('Complexity:'))
    this.log(chalk.gray(`  Total complexity: ${summary.complexity.toLocaleString()}`))
    this.log(chalk.gray(`  Average complexity/file: ${summary.averageComplexity}`))
    this.log('')

    this.log(chalk.bold('Code Structures:'))
    this.log(chalk.gray(`  Functions: ${summary.functions.toLocaleString()}`))
    this.log(chalk.gray(`  Methods: ${summary.methods.toLocaleString()}`))
    this.log(chalk.gray(`  Classes: ${summary.classes.toLocaleString()}`))
    this.log(chalk.gray(`  Interfaces: ${summary.interfaces.toLocaleString()}`))
    this.log(chalk.gray(`  Type Aliases: ${summary.typeAliases.toLocaleString()}`))
    this.log(chalk.gray(`  Enums: ${summary.enums.toLocaleString()}`))
    this.log('')

    if (Object.keys(fileTypes).length > 0) {
      this.log(chalk.bold('File Types:'))
      const sortedTypes = Object.entries(fileTypes).sort((a, b) => b[1] - a[1])
      for (const [ext, count] of sortedTypes) {
        this.log(chalk.gray(`  ${ext || 'no ext'}: ${count} files`))
      }

      this.log('')
    }

    if (files.length > 0) {
      this.log(chalk.bold(`Top ${Math.min(topN, files.length)} Largest Files:`))
      for (const file of files.slice(0, topN)) {
        this.log(
          chalk.gray(
            `  ${file.name} (${(file.size / 1024).toFixed(1)}KB, ${file.loc} LOC, complexity: ${file.complexity})`,
          ),
        )
      }
    }
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
