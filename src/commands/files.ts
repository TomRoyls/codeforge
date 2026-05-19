import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { filterFiles, getFileInfo, groupFiles, sortFiles, calculateFileStats, type FilesResult, type GroupBy, type SortBy, type SortOrder } from './files-helpers.js'
import { formatFilesCsv, formatFilesJson, formatFilesTable } from './files-format-helpers.js'

export default class Files extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to list files for',
      required: false,
    }),
  }

  static override description = 'List and filter files in a codebase with metadata'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List all files in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'List files in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts --ext .tsx',
      description: 'Filter to TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sort size --sort-order desc',
      description: 'Sort files by size descending',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --group-by extension',
      description: 'Group files by extension',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --min-size 1024 --max-size 10240',
      description: 'Filter files between 1KB and 10KB',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output files.csv',
      description: 'Export file list to CSV',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --no-lines --verbose',
      description: 'Skip line counting and show detailed output',
    },
  ]

  static override flags = {
    ext: Flags.string({
      char: 'e',
      description: 'Filter by file extension (e.g., ".ts")',
      multiple: true,
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    'group-by': Flags.string({
      default: 'none',
      description: 'Group files by category',
      options: ['directory', 'extension', 'none'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'max-size': Flags.integer({
      description: 'Maximum file size in bytes',
    }),
    'min-size': Flags.integer({
      description: 'Minimum file size in bytes',
    }),
    'modified-after': Flags.string({
      description: 'Filter files modified after this ISO date',
    }),
    'modified-before': Flags.string({
      description: 'Filter files modified before this ISO date',
    }),
    'no-lines': Flags.boolean({
      default: false,
      description: 'Skip line counting for performance',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    'sort-order': Flags.string({
      default: 'asc',
      description: 'Sort direction',
      options: ['asc', 'desc'],
    }),
    sort: Flags.string({
      default: 'name',
      description: 'Sort files by metric',
      options: ['extension', 'lines', 'modified', 'name', 'size'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Files)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const sortBy = flags.sort as SortBy
    const sortOrder = flags['sort-order'] as SortOrder
    const groupBy = flags['group-by'] as GroupBy
    const countLines = !flags['no-lines']

    const ora = await import('ora')
    const spinner = ora.default('Discovering files...').start()

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
        '**/*.xml',
        '**/*.sql',
      ],
    })

    spinner.text = 'Extracting file metadata...'

    const allFiles = discoveredFiles.map((f) => getFileInfo(f.absolutePath, targetPath, countLines))

    const filtered = filterFiles(allFiles, {
      extensions: flags.ext,
      maxSize: flags['max-size'],
      minSize: flags['min-size'],
      modifiedAfter: flags['modified-after'] ? new Date(flags['modified-after']) : undefined,
      modifiedBefore: flags['modified-before'] ? new Date(flags['modified-before']) : undefined,
    })

    const sorted = sortFiles(filtered, sortBy, sortOrder)
    const groups = groupFiles(sorted, groupBy)
    const stats = calculateFileStats(sorted)

    const result: FilesResult = {
      byExtension: stats.byExtension,
      files: sorted,
      groups,
      totalFiles: stats.totalFiles,
      totalLines: stats.totalLines,
      totalSize: stats.totalSize,
    }

    spinner.succeed(`Found ${sorted.length} files (${formatFileSize(stats.totalSize)})`)

    const outputData =
      format === 'json'
        ? formatFilesJson(result)
        : format === 'csv'
          ? formatFilesCsv(result)
          : formatFilesTable(result, groupBy)

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export {
  filterFiles,
  getFileInfo,
  groupFiles,
  sortFiles,
  calculateFileStats,
} from './files-helpers.js'
export type {
  ExtensionBreakdown,
  FileInfo,
  FileGroup,
  FilesResult,
  FilterOptions,
  GroupBy,
  SortBy,
  SortOrder,
} from './files-helpers.js'
export { formatFilesCsv, formatFilesJson, formatFilesTable, formatFileSize, formatDate } from './files-format-helpers.js'
