import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildPuzzleResult, type PuzzleResult } from './puzzle-helpers.js'
import { formatJson, formatResult } from './puzzle-format-helpers.js'

export default class Puzzle extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code puzzle difficulty',
      required: false,
    }),
  }

  static override description = 'Analyze code complexity as a puzzle difficulty game'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze puzzle difficulty in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output puzzle analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed per-function breakdown',
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
      options: ['json', 'table'],
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show per-function breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Puzzle)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Analyzing puzzle difficulty...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.json',
        '**/*.css',
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
      ],
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

    spinner.text = `Scoring ${filteredFiles.length} files for puzzle difficulty...`

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result: PuzzleResult = buildPuzzleResult(files, contents, {
      verbose: flags.verbose,
    })

    const avgLabel = result.stats.averageScore >= 70 ? '💀 HARD' : result.stats.averageScore >= 40 ? '🧩 MEDIUM' : '🎮 EASY'
    spinner.succeed(
      `Puzzle analysis: ${avgLabel} — avg score ${result.stats.averageScore}/100 across ${files.length} files`,
    )

    const format = flags.format as 'json' | 'table'
    const outputData = format === 'json' ? formatJson(result) : formatResult(result)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }
  }
}

export { buildPuzzleResult } from './puzzle-helpers.js'
export type { Difficulty, FunctionPuzzle, PuzzleBreakdown, PuzzleResult, PuzzleScore, PuzzleStats } from './puzzle-helpers.js'
export { formatJson, formatResult } from './puzzle-format-helpers.js'
