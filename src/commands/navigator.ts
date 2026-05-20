import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildNavigatorResult, type NavigatorResult } from './navigator-helpers.js'
import { formatNavigatorJSON, formatNavigatorTable } from './navigator-format-helpers.js'

export default class Navigator extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze navigation complexity',
      required: false,
    }),
  }

  static override description = 'Analyze code navigation — wayfinding and dependency complexity'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze navigation of current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output navigation analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
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
      description: 'Show detailed navigation analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Navigator)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Mapping navigation graph...').start()

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

    spinner.text = 'Reading file contents...'

    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: NavigatorResult = buildNavigatorResult(
      filteredFiles.map((f) => f.path),
      contents,
      { verbose: flags.verbose },
    )

    spinner.succeed(`Navigator: ${result.stats.totalNodes} nodes, complexity ${result.stats.navigationComplexity}/100`)

    const outputData = format === 'json' ? formatNavigatorJSON(result) : formatNavigatorTable(result)

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

export { buildNavigatorResult } from './navigator-helpers.js'
export type {
  NavigationMap,
  NavigationNode,
  NavigationPath,
  NavigatorOptions,
  NavigatorResult,
  NavigatorStats,
  WayfindingScore,
} from './navigator-helpers.js'
export { formatNavigatorJSON, formatNavigatorTable } from './navigator-format-helpers.js'
