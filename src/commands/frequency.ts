import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildFrequencyResult, type FrequencyResult } from './frequency-helpers.js'
import { formatJson, formatResult } from './frequency-format-helpers.js'

export default class Frequency extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code element frequency',
      required: false,
    }),
  }

  static override description = 'Analyze code element frequency across the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze frequency in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output frequency analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 most frequent elements',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --output report.json',
      description: 'Save frequency report to file',
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
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    top: Flags.integer({
      char: 't',
      default: 20,
      description: 'Number of top frequent elements to show',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Frequency)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Discovering files...').start()

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

    spinner.text = 'Analyzing element frequencies...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of discoveredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result: FrequencyResult = buildFrequencyResult(files, contents, {
      top: flags.top,
    })

    spinner.succeed(`Analyzed ${files.length} files — ${result.stats.totalElements} unique elements, ${result.stats.totalOccurrences} total occurrences`)

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

export { buildFrequencyResult } from './frequency-helpers.js'
export type { ElementFrequency, FrequencyCategory, FrequencyResult, FrequencyStats } from './frequency-helpers.js'
export { formatJson, formatResult } from './frequency-format-helpers.js'
