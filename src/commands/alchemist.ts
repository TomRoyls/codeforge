import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildAlchemistResult } from './alchemist-helpers.js'
import { formatAlchemistJSON, formatAlchemistTable } from './alchemist-format-helpers.js'

export default class Alchemist extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to evaluate code quality',
      required: false,
    }),
  }

  static override description = 'Evaluate code quality and transmutation potential'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Evaluate code quality for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Evaluate src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Evaluate TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed element breakdown',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Alchemist)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Analyzing code purity...').start()

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

    spinner.text = 'Measuring elements...'

    const fileContents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const filePaths = filteredFiles.map((f) => f.path)

    const result = buildAlchemistResult(filePaths, fileContents, {
      maxDepth: verbose ? 100 : 50,
    })

    spinner.succeed(`Evaluated ${filteredFiles.length} files — avg purity ${result.stats.avgPurity}%`)

    const outputData = format === 'json' ? formatAlchemistJSON(result) : formatAlchemistTable(result)

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

export { buildAlchemistResult } from './alchemist-helpers.js'
export type { AlchemistResult, AlchemistStats, Element, Transmutation, TransmutationStep } from './alchemist-helpers.js'
export { formatAlchemistJSON, formatAlchemistTable } from './alchemist-format-helpers.js'
