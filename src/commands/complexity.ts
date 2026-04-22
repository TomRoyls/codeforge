import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { analyzeFileComplexity, type FunctionComplexity } from '../core/complexity.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { DEFAULT_IGNORE_PATTERNS } from '../utils/constants.js'
import {
  buildIgnorePatterns,
  buildJsonOutput,
  filterByThreshold,
  filterFilesByExtension,
  formatOutput as formatOutputHelper,
  parseExtensions,
  sortByField,
} from './complexity-helpers.js'

export default class Complexity extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description =
    'Analyze and report cyclomatic and cognitive complexity metrics for TypeScript files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze complexity for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze complexity for src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 10',
      description: 'Show only functions with complexity above 10',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10 --sort-by complexity',
      description: 'Show top 10 most complex functions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format markdown --output complexity.md',
      description: 'Save complexity report as markdown',
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
      options: ['json', 'markdown', 'table'],
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
    'sort-by': Flags.string({
      char: 's',
      default: 'complexity',
      description: 'Sort results by',
      options: ['complexity', 'file', 'name'],
    }),
    threshold: Flags.integer({
      char: 't',
      default: 0,
      description: 'Only show functions with complexity above threshold',
    }),
    top: Flags.integer({
      char: 'n',
      default: 20,
      description: 'Show only top N most complex functions',
    }),
  }

  private parser: null | Parser = null

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Complexity)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'markdown' | 'table'
    const sortBy = flags['sort-by']
    const { threshold, top } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = [...DEFAULT_IGNORE_PATTERNS]
    const ignorePatterns = buildIgnorePatterns(defaultIgnore, flags.ignore)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: ignorePatterns,
      patterns: ['**/*.ts', '**/*.tsx'],
    })

    const extensions = parseExtensions(flags.ext)
    const filteredFiles = filterFilesByExtension(discoveredFiles, extensions)

    spinner.text = 'Analyzing files...'

    this.parser = new Parser()
    await this.parser.initialize()

    const results: FunctionComplexity[] = []
    try {
      const parseResults = await Promise.all(
        filteredFiles.map(async (file) => {
          try {
            const parseResult = await this.parser!.parseFile(file.absolutePath)
            const fileComplexities = analyzeFileComplexity(parseResult.sourceFile)
            this.parser!.releaseFile(file.absolutePath)
            return fileComplexities
          } catch {
            return []
          }
        }),
      )

      for (const parseResult of parseResults) {
        if (parseResult) {
          results.push(...parseResult)
        }
      }
    } finally {
      this.parser.dispose()
      this.parser = null
    }

    spinner.succeed(`Analyzed ${filteredFiles.length} files`)

    const filtered = sortByField(
      filterByThreshold(results, threshold),
      sortBy as 'complexity' | 'file' | 'name',
    ).slice(0, top)

    const outputData =
      format === 'json' ? buildJsonOutput(filtered) : formatOutputHelper(filtered, format)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else if (format === 'json') {
      this.log(outputData)
    } else {
      this.log(outputData)
    }
  }
}
