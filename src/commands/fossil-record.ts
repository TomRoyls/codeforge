import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildFossilRecordResult, type FossilRecordResult } from './fossil-record-helpers.js'
import { formatFossilRecordJSON, formatFossilRecordTable } from './fossil-record-format-helpers.js'

export default class FossilRecord extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze fossil record',
      required: false,
    }),
  }

  static override description = 'Analyze code fossil record — evolutionary history and temporal patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory fossil record',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output fossil record as JSON',
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
      description: 'Show detailed fossil record',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(FossilRecord)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Excavating fossil record...').start()

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

    spinner.text = 'Computing file ages...'

    const now = Date.now()
    const ages = filteredFiles.map((file) => {
      try {
        const output = execSync(
          `git log -1 --format="%at" -- "${file.absolutePath}"`,
          { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
        ).trim()
        const timestamp = parseInt(output, 10)
        if (isNaN(timestamp) || timestamp === 0) return 0
        return Math.floor((now - timestamp * 1000) / (24 * 60 * 60 * 1000))
      } catch {
        return 0
      }
    })

    spinner.text = 'Extracting git history...'

    let gitLog = ''
    try {
      gitLog = execSync(
        'git log --oneline --no-color -50 --format="%h|%ai|%s|1|0|0"',
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
      )
    } catch {
      gitLog = ''
    }

    const result: FossilRecordResult = buildFossilRecordResult(
      filteredFiles.map((f) => f.path),
      contents,
      ages,
      gitLog,
      { verbose: flags.verbose },
    )

    spinner.succeed(`Fossil record: ${result.stats.totalLayers} layers, ${result.stats.extinctCount} extinct patterns, ${result.stats.livingFossilCount} living fossils`)

    const outputData = format === 'json' ? formatFossilRecordJSON(result) : formatFossilRecordTable(result)

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

export { buildFossilRecordResult } from './fossil-record-helpers.js'
export type {
  EvolutionaryStage,
  ExtinctPattern,
  FossilLayer,
  FossilRecordResult,
  FossilRecordStats,
  LivingFossil,
} from './fossil-record-helpers.js'
export { formatFossilRecordJSON, formatFossilRecordTable } from './fossil-record-format-helpers.js'
