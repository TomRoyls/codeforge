import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'

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
    top: Flags.integer({
      char: 't',
      default: 10,
      description: 'Number of top files to show by size',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed file statistics',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Stats)

    const targetPath = resolve(args.path as string)
    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**'],
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    spinner.text = 'Analyzing files...'

    const stats = await this.collectStats(discoveredFiles, verbose)

    spinner.succeed(`Analyzed ${discoveredFiles.length} files`)

    if (format === 'json') {
      this.log(JSON.stringify(stats, null, 2))
    } else {
      this.displayTable(stats, flags.top)
    }
  }

  private async collectStats(
    files: Array<{ absolutePath: string; path: string }>,
    verbose: boolean,
  ): Promise<StatsResult> {
    const fileStats: FileStats[] = []
    let totalLoc = 0
    let totalComments = 0
    let totalBlank = 0
    const fileTypes: Record<string, number> = {}

    const results = await Promise.all(
      files.map(async (file) => {
        if (!file) return null

        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          const lines = content.split('\n')
          const loc = lines.filter(
            (line) => line.trim().length > 0 && !line.trim().startsWith('//'),
          ).length
          const comments = lines.filter(
            (line) => line.trim().startsWith('//') || line.trim().startsWith('/*'),
          ).length
          const blank = lines.filter((line) => line.trim().length === 0).length

          const ext = extname(file.path).toLowerCase()

          return {
            blank,
            comments,
            content,
            ext,
            file,
            loc,
          }
        } catch {
          return null
        }
      }),
    )

    for (const result of results) {
      if (!result) continue

      const { blank, comments, content, ext, file, loc } = result

      fileTypes[ext] = (fileTypes[ext] || 0) + 1

      totalLoc += loc
      totalComments += comments
      totalBlank += blank

      if (verbose) {
        fileStats.push({
          blankLines: blank,
          commentLines: comments,
          loc,
          name: file.path,
          size: content.length,
          type: ext || 'unknown',
        })
      }
    }

    fileStats.sort((a, b) => b.size - a.size)

    return {
      files: fileStats.slice(0, 10),
      fileTypes,
      summary: {
        averageLoc: files.length > 0 ? Math.round(totalLoc / files.length) : 0,
        blankLines: totalBlank,
        commentLines: totalComments,
        files: files.length,
        loc: totalLoc,
      },
    }
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
        this.log(chalk.gray(`  ${file.name} (${(file.size / 1024).toFixed(1)}KB, ${file.loc} LOC)`))
      }
    }
  }
}

interface FileStats {
  blankLines: number
  commentLines: number
  loc: number
  name: string
  size: number
  type: string
}

interface StatsResult {
  files: FileStats[]
  fileTypes: Record<string, number>
  summary: {
    averageLoc: number
    blankLines: number
    commentLines: number
    files: number
    loc: number
  }
}
