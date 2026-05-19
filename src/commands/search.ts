import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  aggregateResults,
  searchFiles,
  type SearchOptions,
} from './search-helpers.js'
import { formatSearchCsv, formatSearchJson, formatSearchText } from './search-format-helpers.js'

export default class Search extends Command {
  static override args = {
    pattern: Args.string({
      description: 'Regex pattern to search for',
      required: true,
    }),
    path: Args.string({
      default: '.',
      description: 'Path to search in',
      required: false,
    }),
  }

  static override description = 'Search across source files using regex patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> "TODO"',
      description: 'Search for TODO comments',
    },
    {
      command: '<%= config.bin %> <%= command.id %> "function\\s+\\w+" ./src',
      description: 'Search for function declarations in src',
    },
    {
      command: '<%= config.bin %> <%= command.id %> "console\\.log" --ext .ts,.tsx',
      description: 'Search for console.log in TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> "import.*from" --format json',
      description: 'Search for import statements as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> "error" --case-sensitive',
      description: 'Case-sensitive search for error',
    },
    {
      command: '<%= config.bin %> <%= command.id %> "TODO" --format csv --output search.csv',
      description: 'Export search results to CSV file',
    },
  ]

  static override flags = {
    'case-sensitive': Flags.boolean({
      default: false,
      description: 'Case sensitive search',
    }),
    context: Flags.integer({
      char: 'c',
      default: 2,
      description: 'Context lines around match',
    }),
    ext: Flags.string({
      char: 'e',
      default: '.ts,.tsx,.js,.jsx',
      description: 'File extensions to search (comma-separated)',
    }),
    format: Flags.string({
      char: 'f',
      default: 'text',
      description: 'Output format',
      options: ['csv', 'json', 'text'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'max-count': Flags.integer({
      char: 'n',
      default: 0,
      description: 'Max matches per file (0 = unlimited)',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    'files-with-matches': Flags.boolean({
      default: false,
      description: 'Only show filenames, not content',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show file stats',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Search)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'text'
    const pattern = args.pattern as string

    const spinner = ora('Searching files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext: string) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    const filteredFiles = extensions.length > 0
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = `Searching ${filteredFiles.length} files...`

    const searchOptions: SearchOptions = {
      caseSensitive: flags['case-sensitive'],
      contextLines: flags.context,
      maxMatches: flags['max-count'],
    }

    const fileResults = await searchFiles(filteredFiles, pattern, searchOptions)
    const result = aggregateResults(fileResults, pattern)

    if (flags.verbose) {
      spinner.succeed(
        `Found ${result.totalMatches} matches in ${result.filesWithMatches} files (searched ${filteredFiles.length} files)`,
      )
    } else {
      spinner.succeed(`Found ${result.totalMatches} matches in ${result.filesWithMatches} files`)
    }

    const outputData =
      format === 'json'
        ? formatSearchJson(result)
        : format === 'csv'
          ? formatSearchCsv(result)
          : formatSearchText(result, { filesWithMatchesOnly: flags['files-with-matches'] })

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

export { aggregateResults, searchFiles, searchInContent, highlightMatch } from './search-helpers.js'
export type { FileResult, SearchMatch, SearchResult } from './search-helpers.js'
export { formatSearchCsv, formatSearchJson, formatSearchText } from './search-format-helpers.js'
