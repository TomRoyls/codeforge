import { Command } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import fg from 'fast-glob'

import { buildAmberSunriseResult } from './amber-sunrise-helpers.js'
import { formatAmberSunriseTable, formatAmberSunriseJson } from './amber-sunrise-format-helpers.js'

// ─── Constants ─────────────────────────────────────────────────────────────

const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/coverage/**',
]

// ─── Command ───────────────────────────────────────────────────────────────

export default class AmberSunrise extends Command {
  static override description = 'Analyze code warmth, awakening, growth potential, radiance, transformation, and golden quality'

  static override examples = [
    '<%= config.bin %> amber-sunrise ./src',
    '<%= config.bin %> amber-sunrise ./src --json',
    '<%= config.bin %> amber-sunrise ./src --verbose',
  ]

  static override args = [
    {
      name: 'path',
      description: 'Directory or file path to analyze',
      default: '.',
    },
  ]

  static override flags = {
    json: Command.Boolean({ description: 'Output as JSON', default: false }),
    verbose: Command.Boolean({ description: 'Show per-file details', default: false, char: 'v' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AmberSunrise)
    const targetPath = args.path as string
    const spinner = ora('Analyzing amber sunrise...').start()

    try {
      const files = await fg('**/*.{ts,js,tsx,jsx}', {
        cwd: targetPath,
        absolute: true,
        ignore: IGNORE_PATTERNS,
      })

      if (files.length === 0) {
        spinner.warn('No source files found')
        return
      }

      const sortedFiles = Array.from(new Set(files)).sort()
      const contents = sortedFiles.map((f) => {
        try {
          const fs = await import('node:fs')
          return fs.readFileSync(f, 'utf-8')
        } catch {
          return ''
        }
      })

      const result = buildAmberSunriseResult(sortedFiles, contents)

      spinner.succeed(`Analyzed ${result.stats.totalFiles} files`)

      if (flags.json) {
        this.log(formatAmberSunriseJson(result))
      } else {
        this.log(formatAmberSunriseTable(result, flags.verbose))
      }
    } catch (error: unknown) {
      spinner.fail('Analysis failed')
      this.error(chalk.rgb(231, 76, 60)(String(error)))
    }
  }
}
