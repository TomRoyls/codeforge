import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildHerbariumPressResult,
  type HerbariumPressResult,
} from './herbarium-press-helpers.js'
import {
  formatHerbariumPressCsv,
  formatHerbariumPressJson,
  formatHerbariumPressTable,
} from './herbarium-press-format-helpers.js'

export default class HerbariumPress extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code preservation and classification',
      required: false,
    }),
  }

  static override description = 'Analyze code preservation and classification like a herbarium'

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
      description: 'Show per-file herbarium sheet details',
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
      description: 'Show per-file herbarium sheet details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(HerbariumPress)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Pressing specimens...').start()

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

    spinner.text = 'Classifying specimens...'

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

    const result: HerbariumPressResult = buildHerbariumPressResult(files, contents, {})

    spinner.succeed(`Catalogued ${files.length} specimens across ${result.drawers.length} drawers`)

    const outputData =
      format === 'json'
        ? formatHerbariumPressJson(result)
        : format === 'csv'
          ? formatHerbariumPressCsv(result)
          : formatHerbariumPressTable(result, verbose)

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

export { buildHerbariumPressResult } from './herbarium-press-helpers.js'
export type { HerbariumPressResult, HerbariumSheet, CabinetDrawer, HerbariumPressStats, HerbariumMuseum } from './herbarium-press-helpers.js'
export { formatHerbariumPressCsv, formatHerbariumPressJson, formatHerbariumPressTable } from './herbarium-press-format-helpers.js'
