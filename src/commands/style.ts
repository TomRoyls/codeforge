import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { analyzeFileStyle, buildStyleResult, type StyleResult } from './style-helpers.js'
import { formatStyleJson, formatStyleTable } from './style-format-helpers.js'

export default class Style extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code style',
      required: false,
    }),
  }

  static override description = 'Analyze code style consistency'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze code style in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze code style in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze style for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file style breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output style.json',
      description: 'Export style analysis to JSON file',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show per-file style details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Style)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
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

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing code style...'

    const fileResults = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          return analyzeFileStyle(content, file.path)
        } catch {
          return analyzeFileStyle('', file.path)
        }
      }),
    )

    const result: StyleResult = buildStyleResult(fileResults)

    spinner.succeed(`Analyzed style across ${filteredFiles.length} files`)

    const outputData = format === 'json' ? formatStyleJson(result) : formatStyleTable(result, verbose)

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

export { analyzeFileStyle, buildStyleResult, computeConsistency, computeDominantStyle, detectBraceStyle, detectIndentation, detectQuotes, detectSemicolons, detectTrailingCommas, stripComments } from './style-helpers.js'
export type { FileStyle, StyleChoice, StyleConsistency, StyleResult } from './style-helpers.js'
export { formatFileStyle, formatStyleJson, formatStyleTable } from './style-format-helpers.js'
