import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { formatSizeCsv, formatSizeJson, formatSizeTable } from './size-format-helpers.js'
import {
  calculatePercentages,
  groupByDirectory,
  groupByExtension,
  groupByFile,
  type FileSizeInfo,
  type SizeEntry,
} from './size-helpers.js'

export default class Size extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze disk usage',
      required: false,
    }),
  }

  static override description = 'Show disk usage breakdown by directory and extension'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show disk usage for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Show disk usage for src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --by extension',
      description: 'Group disk usage by file extension',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --by file --count 10',
      description: 'Show top 10 largest files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output sizes.csv',
      description: 'Export disk usage to CSV file',
    },
  ]

  static override flags = {
    by: Flags.string({
      default: 'directory',
      description: 'Group results by',
      options: ['directory', 'extension', 'file'],
    }),
    count: Flags.integer({
      char: 'n',
      default: 20,
      description: 'Top N results to show',
    }),
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
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Size)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const groupBy = flags.by as 'directory' | 'extension' | 'file'

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*'],
    })

    spinner.text = 'Calculating sizes...'

    const fileSizes: FileSizeInfo[] = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          const stat = await fs.stat(file.absolutePath)
          return { absolutePath: file.absolutePath, path: file.path, size: stat.size }
        } catch {
          return { absolutePath: file.absolutePath, path: file.path, size: 0 }
        }
      }),
    )

    const nonEmptyFiles = fileSizes.filter((f) => f.size > 0)

    let entries: SizeEntry[]
    if (groupBy === 'extension') {
      entries = groupByExtension(nonEmptyFiles)
    } else if (groupBy === 'file') {
      entries = groupByFile(nonEmptyFiles)
    } else {
      entries = groupByDirectory(nonEmptyFiles)
    }

    const totalSize = nonEmptyFiles.reduce((sum, f) => sum + f.size, 0)
    const totalFiles = nonEmptyFiles.length

    entries = calculatePercentages(entries, totalSize)
    entries = entries.slice(0, flags.count)

    const result = { entries, groupBy, totalFiles, totalSize }

    spinner.succeed(`Analyzed ${totalFiles} files (${formatBytes(totalSize)})`)

    const outputData =
      format === 'json'
        ? formatSizeJson(result)
        : format === 'csv'
          ? formatSizeCsv(result)
          : formatSizeTable(result)

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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0.0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export {
  calculatePercentages,
  formatBytes as _formatBytes,
  groupByDirectory,
  groupByExtension,
  groupByFile,
} from './size-helpers.js'
export type { FileSizeInfo, SizeEntry, SizeResult } from './size-helpers.js'
export { formatSizeCsv, formatSizeJson, formatSizeTable } from './size-format-helpers.js'
