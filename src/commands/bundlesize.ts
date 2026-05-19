import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildBundleSizeResult, type BundleSizeOptions } from './bundlesize-helpers.js'
import { formatBundleSizeJson, formatBundleSizeTable } from './bundlesize-format-helpers.js'

/**
 * Analyze estimated bundle size impact of source files.
 *
 * @example
 * ```sh
 * codeforge bundlesize ./src
 * codeforge bundlesize ./src --format json
 * codeforge bundlesize ./src --threshold 10240
 * ```
 */
export default class Bundlesize extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Estimate and analyze bundle size of source files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze bundle size of current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze bundle size of src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output bundle analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 10240',
      description: 'Warn if any file exceeds 10KB gzipped',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show heavy imports and detailed info',
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
    threshold: Flags.integer({
      char: 't',
      default: 0,
      description: 'Threshold in bytes — exit 1 if any file exceeds this gzipped size',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show heavy imports and detailed analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Bundlesize)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Analyzing bundle sizes...').start()

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
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    const options: BundleSizeOptions = {
      extensions,
      ignorePatterns: ignore,
      threshold: flags.threshold,
    }

    const filePaths = filteredFiles.map((f) => f.absolutePath)

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result = await buildBundleSizeResult(filePaths, contentReader, options)

    spinner.succeed(`Analyzed ${result.analysis.files.length} files`)

    if (flags.threshold > 0) {
      const overThreshold = result.analysis.files.filter(
        (f) => f.estimatedGzipped > flags.threshold,
      )
      if (overThreshold.length > 0) {
        this.warn(
          `${overThreshold.length} file(s) exceed threshold of ${flags.threshold}B gzipped`,
        )
      }
    }

    const outputData =
      format === 'json'
        ? formatBundleSizeJson(result)
        : formatBundleSizeTable(result, flags.verbose)

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
