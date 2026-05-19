import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTodoListResult, type TodoListOptions } from './todo-list-helpers.js'
import { formatTodoListJson, formatTodoListTable } from './todo-list-format-helpers.js'

/**
 * Parse and manage TODOs from code annotations.
 *
 * @example
 * ```sh
 * codeforge todo-list ./src
 * codeforge todo-list ./src --priority high
 * codeforge todo-list ./src --assignee alice
 * ```
 */
export default class TodoList extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for TODOs',
      required: false,
    }),
  }

  static override description = 'Extract and manage TODO comments from source code'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List all TODOs in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'List TODOs in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --priority high',
      description: 'Show only high-priority TODOs',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --assignee alice',
      description: 'Show TODOs assigned to alice',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sort age',
      description: 'Sort TODOs by age (oldest first)',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
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
    priority: Flags.string({
      char: 'p',
      default: 'all',
      description: 'Filter by priority level',
      options: ['all', 'high', 'medium', 'low'],
    }),
    assignee: Flags.string({
      char: 'a',
      description: 'Filter by assignee username',
    }),
    sort: Flags.string({
      char: 's',
      default: 'priority',
      description: 'Sort order',
      options: ['priority', 'file', 'age'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show context and metadata',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TodoList)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const priority = flags.priority as 'all' | 'high' | 'medium' | 'low'
    const sort = flags.sort as 'priority' | 'file' | 'age'

    const spinner = ora('Scanning for TODOs...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.rs', '**/*.go'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    const options: TodoListOptions = {
      assignee: flags.assignee ?? null,
      contextLines: 2,
      extensions,
      ignorePatterns: ignore,
      priority,
      sort,
    }

    const filePaths = filteredFiles.map((f) => f.absolutePath)
    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result = await buildTodoListResult(filePaths, contentReader, options)

    spinner.succeed(`Found ${result.stats.total} TODO(s) in ${filteredFiles.length} files`)

    const outputData =
      format === 'json'
        ? formatTodoListJson(result)
        : formatTodoListTable(result, flags.verbose)

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
