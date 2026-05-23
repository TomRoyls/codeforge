import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { buildStarlitGardenResult } from './starlit-garden-helpers.js'
import { formatStarlitGardenTable, formatStarlitGardenJson } from './starlit-garden-format-helpers.js'

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_IGNORE = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
const DEFAULT_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

// ─── Command ───────────────────────────────────────────────────────────────

export default class StarlitGarden extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Directory or file path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze code wonder — inspiration, constellation mapping, celestial organization, nocturnal beauty, night bloom, guiding light'

  static override examples = [
    '<%= config.bin %> starlit-garden ./src',
    '<%= config.bin %> starlit-garden ./src --format json',
    '<%= config.bin %> starlit-garden ./src --verbose',
    '<%= config.bin %> starlit-garden ./src --ext .ts,.tsx',
    '<%= config.bin %> starlit-garden ./src --ignore "**/test/**"',
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
    const { args, flags } = await this.parse(StarlitGarden)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const spinner = ora('Analyzing starlit garden...').start()

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

    const result = buildStarlitGardenResult(filteredFiles, contents)

    spinner.succeed(`Analyzed ${result.stats.totalFiles} files across ${result.stats.totalPlots} plots`)

    const outputData = format === 'json'
      ? formatStarlitGardenJson(result)
      : formatStarlitGardenTable(result, flags.verbose)

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
