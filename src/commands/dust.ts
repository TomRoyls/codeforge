import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildDustResult } from './dust-helpers.js'
import { formatDustJson, formatDustOutput } from './dust-format-helpers.js'

export default class Dust extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Detect code dust and cobwebs'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Detect dust in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output dust analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --verbose',
      description: 'Show all dust findings',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
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
      description: 'Show all dust findings',
    }),
  }

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(Dust)
    const targetPath = resolve(args.path ?? '.')

    if (!existsSync(targetPath)) {
      this.error(`Path does not exist: ${targetPath}`)
    }

    const spinner = ora('Scanning for dust...').start()

    try {
      const extensions = flags.ext
        ? flags.ext.split(',').map((e) => e.trim())
        : ['.ts', '.tsx', '.js', '.jsx', '.mjs']

      const files = await discoverFiles({ cwd: targetPath, patterns: extensions.map(e => `**/*${e}`), ignore: flags.ignore ?? [] })

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

      const result = buildDustResult(filePaths, contents, { verbose: flags.verbose })

      spinner.succeed(`Dust scan complete (${result.stats.totalDust} dust items, cleanliness ${result.stats.overallCleanliness}).`)

      const output = flags.format === 'json'
        ? formatDustJson(result)
        : formatDustOutput(result)

      if (flags.output) {
        await fs.writeFile(flags.output, output, 'utf-8')
        this.log(`Output written to ${flags.output}`)
      } else {
        this.log(output)
      }
    } catch (error: unknown) {
      spinner.fail('Dust scan failed.')
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
