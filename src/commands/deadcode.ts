import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildDeadCodeResult, type DeadCodeResult } from './deadcode-helpers.js'
import { formatDeadCodeJson, formatDeadCodeTable } from './deadcode-format-helpers.js'

/**
 * Detect potentially dead (unreachable) code in TypeScript/JavaScript files.
 *
 * @example
 * ```sh
 * codeforge deadcode
 * codeforge deadcode ./src --format json
 * codeforge deadcode ./src --threshold 80 --verbose
 * ```
 */
export default class DeadCode extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for dead code',
      required: false,
    }),
  }

  static override description = 'Detect potentially dead (unreachable) code'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for dead code',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory and output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 80',
      description: 'Only show high-confidence issues (≥80)',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show context snippets for each issue',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Export dead code report to JSON file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
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
    threshold: Flags.integer({
      default: 50,
      description: 'Confidence threshold (0-100)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed analysis with context snippets',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DeadCode)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { threshold, verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**', '**/*.d.ts']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    const filteredFiles = discoveredFiles.filter((f) => {
      const ext = extname(f.path).toLowerCase()
      return extensions.includes(ext)
    })

    spinner.text = `Analyzing ${filteredFiles.length} files for dead code...`

    const result: DeadCodeResult = await buildDeadCodeResult(
      filteredFiles.map((f) => f.path),
      async (filePath) => {
        const file = filteredFiles.find((f) => f.path === filePath)
        if (!file) throw new Error(`File not found: ${filePath}`)
        return fs.readFile(file.absolutePath, 'utf8')
      },
      { threshold },
    )

    spinner.succeed(`Analyzed ${filteredFiles.length} files — found ${result.stats.totalIssues} potential dead code issues`)

    const outputData = format === 'json' ? formatDeadCodeJson(result) : formatDeadCodeTable(result, verbose)

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

export { buildDeadCodeResult } from './deadcode-helpers.js'
export type { DeadCodeItem, DeadCodeOptions, DeadCodeResult, DeadCodeStats } from './deadcode-helpers.js'
export { formatDeadCodeJson, formatDeadCodeTable, getConfidenceColor, getDeadCodeIcon } from './deadcode-format-helpers.js'
