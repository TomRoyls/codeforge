import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildClassificationResult, type ClassifyOptions } from './classify-helpers.js'
import { formatClassifyJson, formatClassifyTable } from './classify-format-helpers.js'

/**
 * @example
 * codeforge classify --format json
 */
export default class Classify extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to classify',
      required: false,
    }),
  }

  static override description = 'Classify files by role and generate project taxonomy'

  static override examples = [
    { command: '<%= config.bin %> <%= command.id %>', description: 'Classify current directory' },
    { command: '<%= config.bin %> <%= command.id %> ./src --format json', description: 'JSON output' },
    { command: '<%= config.bin %> <%= command.id %> --ext .ts,.js', description: 'Only TS/JS files' },
    { command: '<%= config.bin %> <%= command.id %> --verbose', description: 'Show file listing' },
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed file listing',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Classify)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Discovering files...').start()

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
        '**/*.scss',
        '**/*.less',
        '**/*.html',
        '**/*.md',
        '**/*.txt',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
        '**/*.xml',
        '**/*.svg',
        '**/*.png',
        '**/*.jpg',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discoveredFiles

    spinner.text = 'Classifying files...'

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
    const options: ClassifyOptions = { verbose: flags.verbose }
    const result = buildClassificationResult(filePaths, contents, options)

    spinner.succeed(`Classified ${result.stats.totalFiles} files into ${result.categories.length} categories`)

    const output = flags.format === 'json'
      ? formatClassifyJson(result)
      : formatClassifyTable(result)

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
