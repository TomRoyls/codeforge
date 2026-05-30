import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildSymgraphResult } from './symgraph-helpers.js'
import { formatSymgraphJson, formatSymgraphOutput } from './symgraph-format-helpers.js'

export default class Symgraph extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze function call graph and symbol dependencies'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze call graph in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output call graph as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --depth 5',
      description: 'Analyze with max chain depth of 5',
    },
  ]

  static override flags = {
    depth: Flags.integer({
      char: 'd',
      default: 3,
      description: 'Maximum call chain depth to analyze',
    }),
    format: Flags.string({
      char: 'f',
      default: 'console',
      description: 'Output format (console, json)',
    }),
    help: Flags.help({ char: 'h' }),
  }

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(Symgraph)
    const targetPath = resolve(args.path ?? '.')

    if (!existsSync(targetPath)) {
      this.error(`Path does not exist: ${targetPath}`)
    }

    const spinner = ora('Analyzing call graph...').start()

    try {
      const files = await discoverFiles({ cwd: targetPath, patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'], ignore: [] })

      if (files.length === 0) {
        spinner.warn('No source files found.')
        return
      }

      const contents: string[] = []
      const filePaths: string[] = []

      for (const file of files) {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf-8')
          contents.push(content)
          filePaths.push(file.path)
        } catch {
          // skip unreadable files
        }
      }

      const result = buildSymgraphResult(filePaths, contents, { depth: flags.depth })

      spinner.succeed(`Call graph analysis complete (${result.stats.totalFunctions} functions, ${result.stats.totalEdges} edges).`)

      if (flags.format === 'json') {
        this.log(formatSymgraphJson(result))
      } else {
        this.log(formatSymgraphOutput(result, flags.depth))
      }
    } catch (error: unknown) {
      spinner.fail('Call graph analysis failed.')
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
