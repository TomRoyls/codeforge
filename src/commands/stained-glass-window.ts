import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildStainedGlassWindowResult,
  type StainedGlassWindowResult,
} from './stained-glass-window-helpers.js'
import {
  formatStainedGlassWindowCsv,
  formatStainedGlassWindowJson,
  formatStainedGlassWindowTable,
} from './stained-glass-window-format-helpers.js'

export default class StainedGlassWindow extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code transparency',
      required: false,
    }),
  }

  static override description = 'Analyze code transparency like a stained glass window'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file panel details',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show per-file panel details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(StainedGlassWindow)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering glass panels...').start()

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
        '**/*.xml',
        '**/*.sql',
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

    spinner.text = 'Analyzing light transmission...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        files.push(file.path)
        contents.push('')
      }
    }

    const result: StainedGlassWindowResult = buildStainedGlassWindowResult(files, contents, {})

    spinner.succeed(`Analyzed ${files.length} glass panels across ${result.bays.length} window bays`)

    const outputData =
      format === 'json'
        ? formatStainedGlassWindowJson(result)
        : format === 'csv'
          ? formatStainedGlassWindowCsv(result)
          : formatStainedGlassWindowTable(result, verbose)

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

export { buildStainedGlassWindowResult } from './stained-glass-window-helpers.js'
export type { StainedGlassWindowResult, GlassPanel, WindowBay, StainedGlassWindowStats, CathedralMeasure } from './stained-glass-window-helpers.js'
export { formatStainedGlassWindowCsv, formatStainedGlassWindowJson, formatStainedGlassWindowTable } from './stained-glass-window-format-helpers.js'
