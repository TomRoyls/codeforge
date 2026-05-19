import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTagResult, type TagResult } from './tag-helpers.js'
import { formatTagCsv, formatTagJson, formatTagResultTable } from './tag-format-helpers.js'

export default class Tag extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for code tags',
      required: false,
    }),
  }

  static override description = 'Find and categorize code tags (TODO, FIXME, HACK, BUG, etc.)'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan for all code tags in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --type todo',
      description: 'Show only TODO tags',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type bug',
      description: 'Show only BUG tags',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output tags as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show priority action list and author breakdown',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to scan (e.g., ".ts,.tsx")',
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
    type: Flags.string({
      char: 't',
      default: 'all',
      description: 'Filter by tag type',
      options: ['all', 'todo', 'fixme', 'hack', 'xxx', 'note', 'perf', 'bug', 'optimize', 'deprecated'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show priority action list and author breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Tag)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose, type: tagType } = flags

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
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
        '**/*.md',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = '.' + f.path.split('.').pop()
          return extensions.includes(ext!)
        })
      : discoveredFiles

    spinner.text = 'Scanning for code tags...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result: TagResult = buildTagResult(files, contents, { type: tagType, verbose })

    spinner.succeed(`Found ${result.stats.totalTags} tags across ${files.length} files`)

    const outputData =
      format === 'json'
        ? formatTagJson(result)
        : format === 'csv'
          ? formatTagCsv(result)
          : formatTagResultTable(result, verbose)

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

export { buildTagResult, extractTags, parseTagType, determinePriority, extractContext, summarizeByType, summarizeByAuthor, computeTagStats, prioritizeTags, generateRecommendations } from './tag-helpers.js'
export type { TagResult, CodeTag, TagSummary, TagAuthor, TagStats, TagOptions } from './tag-helpers.js'
export { formatTagCsv, formatTagJson, formatTagResultTable, formatTagTable, formatTagSummary, formatAuthorBreakdown, formatPriorityList, formatDensityMeter, formatStatsLine } from './tag-format-helpers.js'
