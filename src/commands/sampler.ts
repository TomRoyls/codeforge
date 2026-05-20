import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildSamplerResult, type SamplerResult } from './sampler-helpers.js'
import { formatSamplerJSON, formatSamplerTable } from './sampler-format-helpers.js'

export default class Sampler extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to sample',
      required: false,
    }),
  }

  static override description = 'Statistical sampling and analysis of codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Sample current directory (10 files)',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --sample-size 20',
      description: 'Sample 20 files from src',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output sample results as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx --verbose',
      description: 'Sample TypeScript files with verbose output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sample-size 5 --format json --output sample.json',
      description: 'Save sample to file',
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
    'sample-size': Flags.integer({
      char: 's',
      default: 10,
      description: 'Number of files to sample',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Sampler)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning files...').start()

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

    spinner.text = 'Reading files...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    spinner.text = `Sampling ${flags['sample-size']} of ${files.length} files...`

    const result: SamplerResult = buildSamplerResult(files, contents, {
      method: 'random',
      sampleSize: flags['sample-size'],
      seed: 42,
    })

    spinner.succeed(`Sampled ${result.stats.sampleSize}/${result.stats.populationSize} files (${result.stats.samplingRate}%)`)

    const outputData = format === 'json' ? formatSamplerJSON(result) : formatSamplerTable(result)

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

export { buildSamplerResult } from './sampler-helpers.js'
export type { Measurement, Sample, SamplerResult, SamplerStats, SampleResult } from './sampler-helpers.js'
export { formatSamplerJSON, formatSamplerTable } from './sampler-format-helpers.js'
