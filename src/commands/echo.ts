import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildEchoResult, type EchoResult } from './echo-helpers.js'
import { formatEchoJSON, formatEchoTableFull } from './echo-format-helpers.js'

export default class Echo extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for code echoes',
      required: false,
    }),
  }

  static override description = 'Analyze code echoes — find repeated patterns, duplicates, and boilerplate'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for code echoes',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output echo analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 2',
      description: 'Lower threshold to find patterns appearing 2+ times',
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
      char: 't',
      default: 3,
      description: 'Minimum occurrence count to report as echo',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed echo analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Echo)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Listening for echoes...').start()

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

    spinner.text = 'Analyzing code patterns...'

    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: EchoResult = buildEchoResult(
      filteredFiles.map((f) => f.path),
      contents,
      { threshold: flags.threshold, verbose: flags.verbose },
    )

    spinner.succeed(`Echo analysis complete: ${result.stats.totalEchoes} echoes, ${result.stats.estimatedSavings} lines of potential savings`)

    const outputData = format === 'json' ? formatEchoJSON(result) : formatEchoTableFull(result)

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

export { buildEchoResult } from './echo-helpers.js'
export type { Echo, EchoOccurrence, EchoResult, EchoStats } from './echo-helpers.js'
export { formatEchoJSON, formatEchoTableFull } from './echo-format-helpers.js'
