import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  aggregateTodos,
  scanFileForTodos,
  sortTodos,
  type TodoResult,
} from './todos-helpers.js'
import { formatTodoOutput } from './todos-format-helpers.js'

export default class Todos extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for TODO comments',
      required: false,
    }),
  }

  static override description = 'Scan source files for TODO, FIXME, and other action comments'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan current directory for TODO comments',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Scan src directory and output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --types TODO,FIXME',
      description: 'Scan only for TODO and FIXME comments',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output todos.csv',
      description: 'Save TODO comments to CSV file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --author --sort-by severity',
      description: 'Show TODOs with author info sorted by severity',
    },
  ]

  static override flags = {
    author: Flags.boolean({
      default: false,
      description: 'Extract author from TODO comments (e.g., TODO(john))',
    }),
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to scan',
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
    'sort-by': Flags.string({
      char: 's',
      default: 'file',
      description: 'Sort results by',
      options: ['file', 'severity', 'type'],
    }),
    types: Flags.string({
      char: 't',
      default: 'TODO,FIXME,HACK,XXX,BUG,NOTE,OPTIMIZE',
      description: 'Comment types to scan for (comma-separated)',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Todos)

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
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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

    spinner.text = 'Scanning files...'

    const types = flags.types.split(',').map((t) => t.trim().toUpperCase())
    const extractAuthor = flags.author

    const allComments = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          return scanFileForTodos(content, file.path, types, extractAuthor)
        } catch {
          return []
        }
      }),
    )

    const flatComments = allComments.flat()
    const aggregated = aggregateTodos(flatComments)
    const sorted = sortTodos(aggregated, flags['sort-by'])

    spinner.succeed(`Scanned ${filteredFiles.length} files, found ${sorted.summary.total} comments`)

    const format = flags.format as 'csv' | 'json' | 'table'
    const outputData =
      format === 'json' ? JSON.stringify(sorted, null, 2) : formatTodoOutput(sorted, format)

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

export { aggregateTodos, scanFileForTodos, sortTodos, type TodoResult } from './todos-helpers.js'
export { formatTodoOutput, formatTodoTable, formatTodoCsv } from './todos-format-helpers.js'
