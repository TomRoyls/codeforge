import { Command, Flags, Args } from '@oclif/core'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildClockworkOrreryResult } from './clockwork-orrery-helpers.js'
import { formatClockworkOrreryJson, formatClockworkOrreryTable } from './clockwork-orrery-format-helpers.js'

// ─── Constants ─────────────────────────────────────────────────────────────

const FILE_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
]

// ─── Command ───────────────────────────────────────────────────────────────

/** @example codeforge clockwork-orrery ./src --verbose */
export default class ClockworkOrrery extends Command {
  static override description = 'Analyze code precision, mechanical harmony, and orbital logic like a clockwork orrery'

  static override examples = [
    '<%= config.bin %> <%= command.id %> ./src',
    '<%= config.bin %> <%= command.id %> ./src --verbose',
    '<%= config.bin %> <%= command.id %> ./src --json',
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
      description: 'Show per-file details',
    }),
  }

  static override args = {
    path: Args.string({ description: 'Path to analyze', default: '.' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ClockworkOrrery)
    const spinner = ora('Analyzing clockwork orrery...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discovered = await discoverFiles({ cwd: args.path, ignore, patterns: FILE_PATTERNS })

    const { extname } = await import('node:path')
    const extensions = flags.ext
      ? flags.ext.split(',').map((e: string) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discovered.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discovered

    const files = filteredFiles.map((f) => f.path)
    const contents: string[] = []

    for (const file of files) {
      try {
        const { readFileSync } = await import('fs')
        contents.push(readFileSync(file, 'utf-8'))
      } catch {
        contents.push('')
      }
    }

    const result = buildClockworkOrreryResult(files, contents)

    spinner.stop()

    const format = flags.format as 'json' | 'table'
    const outputData = format === 'json'
      ? formatClockworkOrreryJson(result)
      : formatClockworkOrreryTable(result, flags.verbose)

    if (flags.output) {
      try {
        const { writeFile } = await import('fs/promises')
        await writeFile(flags.output, outputData, 'utf8')
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
