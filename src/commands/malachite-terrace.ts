import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildMalachiteTerraceResult } from './malachite-terrace-helpers.js'
import type { MalachiteTerraceResult } from './malachite-terrace-helpers.js'
import { formatResultJson, formatResultTable } from './malachite-terrace-format-helpers.js'

export default class MalachiteTerrace extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for malachite terrace metrics',
      required: false,
    }),
  }

  static override description = 'Analyze code for verdant-pattern, gem-clarity, banded-precision, copper-resilience, and mineral-wisdom'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for malachite terrace metrics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory with JSON output',
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
      description: 'Show detailed band breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MalachiteTerrace)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Discovering malachite bands...').start()

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
          const ext = resolve(f.path).substring(resolve(f.path).lastIndexOf('.'))
          return extensions.includes(ext.toLowerCase())
        })
      : discoveredFiles

    spinner.text = 'Analyzing malachite terrace metrics...'

    const files = filteredFiles.map((f) => f.path)
    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: MalachiteTerraceResult = await buildMalachiteTerraceResult(files, contents)

    spinner.succeed(`Analyzed ${files.length} malachite bands across ${result.pillars.length} pillars`)

    const outputData = format === 'json' ? formatResultJson(result) : formatResultTable(result)

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

export { buildMalachiteTerraceResult } from './malachite-terrace-helpers.js'
export type { ArtisanGrade, HardeningMeasure, KnowingMeasure, LayeringMeasure, MalachiteBand, MalachiteCondition, MalachitePillar, MalachiteTerraceResult, PatterningMeasure, PillarCondition, PillarType, RevealingMeasure } from './malachite-terrace-helpers.js'
export { formatResultJson, formatResultTable } from './malachite-terrace-format-helpers.js'
