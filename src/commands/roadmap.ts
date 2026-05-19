import { Args, Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildRoadmapResult, type RoadmapOptions } from './roadmap-helpers.js'
import { formatRoadmapJson, formatRoadmapTable } from './roadmap-format-helpers.js'

/**
 * @example
 * codeforge roadmap --format json
 */
export default class Roadmap extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Generate feature development roadmap from codebase analysis'

  static override examples = [
    { command: '<%= config.bin %> <%= command.id %>', description: 'Generate roadmap for current directory' },
    { command: '<%= config.bin %> <%= command.id %> ./src --format json', description: 'JSON output for src/' },
    { command: '<%= config.bin %> <%= command.id %> --verbose', description: 'Show detailed item information' },
    { command: '<%= config.bin %> <%= command.id %> --max-effort 8', description: 'Only show items ≤ 8h effort' },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    'max-effort': Flags.integer({
      default: 0,
      description: 'Filter items above this effort (0 = no filter)',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed item information',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Roadmap)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Scanning codebase for roadmap items...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: defaultIgnore,
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

    const sourceFiles = discoveredFiles.filter(
      (f) => ['.ts', '.tsx', '.js', '.jsx'].includes(extname(f.path)),
    )

    spinner.text = 'Reading file contents...'

    const contents = new Map<string, string>()
    await Promise.all(
      sourceFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          contents.set(file.path, content)
        } catch {
          contents.set(file.path, '')
        }
      }),
    )

    const filePaths = sourceFiles.map((f) => f.path)
    const options: RoadmapOptions = {
      maxEffort: flags['max-effort'],
      verbose: flags.verbose,
    }

    const result = buildRoadmapResult(filePaths, contents, options)

    spinner.succeed(`Found ${result.stats.totalItems} roadmap items across ${result.phases.length} phases`)

    const output = flags.format === 'json'
      ? formatRoadmapJson(result)
      : formatRoadmapTable(result)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, output, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(output)
    }
  }
}
