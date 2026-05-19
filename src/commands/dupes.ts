import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { calculateStats, extractBlocks, findDuplicates } from './dupes-helpers.js'
import { formatDupesCsv, formatDupesJson, formatDupesTable } from './dupes-format-helpers.js'

export default class Dupes extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for duplicate code',
      required: false,
    }),
  }

  static override description = 'Detect duplicate and near-duplicate code blocks'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan current directory for duplicate code',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Scan src directory and output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --min-lines 10',
      description: 'Find duplicates with at least 10 lines',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 0.8',
      description: 'Lower similarity threshold to 80%',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show matched code snippets',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'min-lines': Flags.integer({
      char: 'm',
      default: 5,
      description: 'Minimum lines to consider a block',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    threshold: Flags.string({
      char: 't',
      default: '0.9',
      description: 'Similarity threshold (0-1)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show matched code snippets',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Dupes)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const threshold = parseFloat(flags.threshold as string)
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      this.error('Threshold must be a number between 0 and 1', { exit: 1 })
    }

    const minLines = flags['min-lines']
    if (minLines < 1) {
      this.error('Minimum lines must be at least 1', { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    spinner.text = 'Extracting code blocks...'

    const allBlocks = []
    for (const file of discoveredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const blocks = extractBlocks(content, file.path, minLines)
        allBlocks.push(...blocks)
      } catch {
        // skip files that cannot be read
      }
    }

    spinner.text = 'Detecting duplicates...'

    const groups = findDuplicates(allBlocks, threshold)
    const result = calculateStats(groups, allBlocks.length, discoveredFiles.length)

    spinner.succeed(
      `Analyzed ${discoveredFiles.length} files, found ${groups.length} duplicate groups`,
    )

    const outputData =
      format === 'json'
        ? formatDupesJson(result)
        : format === 'csv'
          ? formatDupesCsv(result)
          : formatDupesTable(result, flags.verbose)

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

export { calculateStats, extractBlocks, findDuplicates } from './dupes-helpers.js'
export type { CodeBlock, DupesResult, DuplicateGroup } from './dupes-helpers.js'
export { formatDupesCsv, formatDupesJson, formatDupesTable } from './dupes-format-helpers.js'
