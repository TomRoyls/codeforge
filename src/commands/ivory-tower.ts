import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { buildIvoryTowerResult } from './ivory-tower-helpers.js'
import { formatIvoryTowerTable, formatIvoryTowerJson } from './ivory-tower-format-helpers.js'

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_IGNORE = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
const DEFAULT_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

// ─── Command ───────────────────────────────────────────────────────────────

export default class IvoryTower extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Directory or file path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze code abstraction — separation, isolation, purity, scholarly depth, elevation, and isolation risk'

  static override examples = [
    '<%= config.bin %> ivory-tower ./src',
    '<%= config.bin %> ivory-tower ./src --format json',
    '<%= config.bin %> ivory-tower ./src --verbose',
    '<%= config.bin %> ivory-tower ./src --ext .ts,.tsx',
    '<%= config.bin %> ivory-tower ./src --ignore "**/test/**"',
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
      description: 'Show per-file details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(IvoryTower)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const spinner = ora('Analyzing ivory tower abstraction...').start()

    const ignore = flags.ignore ? [...DEFAULT_IGNORE, ...flags.ignore] : DEFAULT_IGNORE

    const fg = await import('fast-glob')
    const files = await fg.default(DEFAULT_PATTERNS, {
      cwd: targetPath,
      absolute: true,
      ignore,
    })

    if (files.length === 0) {
      spinner.warn('No source files found')
      return
    }

    const sortedFiles = Array.from(new Set(files)).sort()

    const extensions = flags.ext
      ? flags.ext.split(',').map((e: string) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? sortedFiles.filter((f: string) => {
          const ext = extname(f).toLowerCase()
          return extensions.includes(ext)
        })
      : sortedFiles

    if (filteredFiles.length === 0) {
      spinner.warn('No matching files after extension filter')
      return
    }

    const contents = await Promise.all(
      filteredFiles.map(async (file: string) => {
        try {
          return await fs.readFile(file, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result = buildIvoryTowerResult(filteredFiles, contents)

    spinner.succeed(`Analyzed ${result.stats.totalFiles} files across ${result.stats.totalFloors} floors`)

    const outputData = format === 'json'
      ? formatIvoryTowerJson(result)
      : formatIvoryTowerTable(result, flags.verbose)

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
