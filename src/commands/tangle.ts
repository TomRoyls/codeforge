import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTangleResult } from './tangle-helpers.js'
import { formatTangleJson, formatTangleOutput } from './tangle-format-helpers.js'

export default class Tangle extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze code tangling and separation of concerns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze tangling in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output tangling analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --verbose',
      description: 'Show per-file concern breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ignore "**/test/**"',
      description: 'Ignore test directory',
    },
  ]

  static override flags = {
    ext: Flags.string({
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'console',
      description: 'Output format (console, json)',
    }),
    help: Flags.help({ char: 'h' }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed concern breakdown per file',
    }),
  }

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(Tangle)
    const targetPath = resolve(args.path ?? '.')

    if (!existsSync(targetPath)) {
      this.error(`Path does not exist: ${targetPath}`)
    }

    const spinner = ora('Analyzing code tangling...').start()

    try {
      const extensions = flags.ext
        ? flags.ext.split(',').map((e) => e.trim())
        : ['.ts', '.tsx', '.js', '.jsx', '.mjs']

      const files = await discoverFiles(targetPath, {
        extensions,
        ignore: flags.ignore,
      })

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

      const result = buildTangleResult(filePaths, contents, { verbose: flags.verbose })

      spinner.succeed(`Tangle analysis complete (${result.stats.totalFiles} files).`)

      const output = flags.format === 'json'
        ? formatTangleJson(result)
        : formatTangleOutput(result, flags.verbose)

      if (flags.output) {
        await fs.writeFile(flags.output, output, 'utf-8')
        this.log(`Output written to ${flags.output}`)
      } else {
        this.log(output)
      }
    } catch (error: unknown) {
      spinner.fail('Tangle analysis failed.')
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
