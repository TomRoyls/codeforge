import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildBundleVisualization, type BundleVizOptions } from './bundle-visualizer-helpers.js'
import { formatBundleJson, formatBundleTable } from './bundle-visualizer-format-helpers.js'

/**
 * @example
 * codeforge bundle-visualizer --top 10
 */
export default class BundleVisualizer extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Visualize bundle sizes as an ASCII treemap'

  static override examples = [
    { command: '<%= config.bin %> <%= command.id %>', description: 'Visualize current directory' },
    { command: '<%= config.bin %> <%= command.id %> ./src --top 10', description: 'Top 10 files in src/' },
    { command: '<%= config.bin %> <%= command.id %> --format json', description: 'JSON output' },
    { command: '<%= config.bin %> <%= command.id %> --ext .ts,.js', description: 'Only TS/JS files' },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated extensions (e.g., ".ts,.js")',
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
    top: Flags.integer({
      char: 't',
      default: 20,
      description: 'Number of top files to show',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(BundleVisualizer)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

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
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discoveredFiles

    spinner.text = 'Reading file sizes...'

    const contents = new Map<string, string>()
    await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          contents.set(file.path, content)
        } catch {
          contents.set(file.path, '')
        }
      }),
    )

    const filePaths = filteredFiles.map((f) => f.path)
    const options: BundleVizOptions = {
      top: flags.top,
      verbose: flags.verbose,
    }

    const viz = buildBundleVisualization(filePaths, contents, options)

    spinner.succeed(`Analyzed ${viz.stats.fileCount} files (${(viz.stats.totalSize / 1024).toFixed(1)}KB total)`)

    const output = flags.format === 'json'
      ? formatBundleJson(viz)
      : formatBundleTable(viz)

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
