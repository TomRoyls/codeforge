import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildLocatorResult, type LocatorResult } from './locator-helpers.js'
import { formatJson, formatResult } from './locator-format-helpers.js'

export default class Locator extends Command {
  static override args = {
    query: Args.string({
      description: 'Name or pattern to search for',
      required: true,
    }),
  }

  static override description = 'Find code elements by name or pattern'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> myFunction',
      description: 'Find all definitions and usages of myFunction',
    },
    {
      command: '<%= config.bin %> <%= command.id %> MyClass --type class',
      description: 'Find MyClass as class only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> "handle*" --format json',
      description: 'Search with glob pattern as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> foo --ext .ts,.tsx',
      description: 'Search only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> processHandler --verbose',
      description: 'Show surrounding context for each match',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to search (e.g., ".ts,.tsx")',
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
    type: Flags.string({
      char: 't',
      default: 'all',
      description: 'Element type to search for',
      options: ['all', 'class', 'export', 'function', 'import', 'variable'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show surrounding code context',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Locator)

    const query = args.query as string

    const targetPath = resolve('.')

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora(`Searching for "${query}"...`).start()

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

    const typeFilter = flags.type as 'function' | 'class' | 'variable' | 'import' | 'export' | 'all'

    const result: LocatorResult = buildLocatorResult(files, contents, query, {
      type: typeFilter,
    })

    spinner.succeed(
      `Found ${result.stats.totalMatches} matches for "${query}" across ${result.stats.filesMatched} files`,
    )

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

export { buildLocatorResult } from './locator-helpers.js'
export type { LocatedElement, LocatorResult, LocatorStats } from './locator-helpers.js'
export { formatJson, formatResult } from './locator-format-helpers.js'
