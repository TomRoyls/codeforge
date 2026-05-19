import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { formatSuggestionsJson, formatSuggestionsTable } from './suggestions-format-helpers.js'
import { analyzeFile, buildSuggestionsResult } from './suggestions-helpers.js'

export default class Suggestions extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for suggestions',
      required: false,
    }),
  }

  static override description = 'Analyze codebase and generate actionable improvement suggestions'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for improvement suggestions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --category security',
      description: 'Show only security suggestions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --severity high',
      description: 'Show only high-severity suggestions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output with descriptions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output suggestions.json',
      description: 'Export suggestions to JSON file',
    },
  ]

  static override flags = {
    category: Flags.string({
      default: 'all',
      description: 'Filter by category',
      options: ['all', 'maintenance', 'performance', 'quality', 'security', 'style'],
    }),
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
    severity: Flags.string({
      default: 'all',
      description: 'Filter by severity',
      options: ['all', 'high', 'low', 'medium'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Suggestions)

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
      .map((e: string) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext: string) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    const filteredFiles = discoveredFiles.filter((f) => {
      const ext = extname(f.path).toLowerCase()
      return extensions.includes(ext)
    })

    spinner.text = 'Analyzing files...'

    const allSuggestions = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const fileSuggestions = analyzeFile(content, file.path)
        allSuggestions.push(...fileSuggestions)
      } catch {
        // Skip files that can't be read
      }
    }

    const result = buildSuggestionsResult(allSuggestions, {
      category: flags.category,
      severity: flags.severity,
    })

    spinner.succeed(
      `Analyzed ${filteredFiles.length} files — found ${result.totalFound} suggestions`,
    )

    const outputData =
      format === 'json' ? formatSuggestionsJson(result) : formatSuggestionsTable(result, verbose)

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

export { analyzeFile, buildSuggestionsResult } from './suggestions-helpers.js'
export type { BuildSuggestionsOptions, Suggestion, SuggestionCategory, SuggestionsResult, SuggestionSeverity } from './suggestions-helpers.js'
export { formatSuggestionsJson, formatSuggestionsTable } from './suggestions-format-helpers.js'
