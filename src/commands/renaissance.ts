import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import { discoverFiles } from '../core/file-discovery.js'
import { buildRenaissanceResult } from './renaissance-helpers.js'
import { formatRenaissanceResult, formatRenaissanceJson } from './renaissance-format-helpers.js'

export default class Renaissance extends Command {
  static override description = 'Analyze multi-disciplinary code quality like a Renaissance polymath'
  static override examples = [
    '<%= config.bin %> <%= command.id %> src/',
    '<%= config.bin %> <%= command.id %> . --format json',
    '<%= config.bin %> <%= command.id %> . --ext .ts --verbose',
  ]

  static override flags = {
    format: Flags.string({ default: 'table', description: 'Output format (table or json)', options: ['table', 'json'] }),
    output: Flags.string({ description: 'Output file path' }),
    ignore: Flags.string({ default: 'node_modules,dist,.git', description: 'Comma-separated ignore patterns' }),
    ext: Flags.string({ default: '.ts,.js,.tsx,.jsx', description: 'Comma-separated file extensions' }),
    verbose: Flags.boolean({ default: false, description: 'Show detailed output' }),
  }

  static override args = [{ name: 'path', default: '.', description: 'Path to analyze' }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Renaissance)
    const spinner = ora('Evaluating Renaissance quality...').start()

    try {
      const ignorePatterns = flags.ignore.split(',').map((p: string) => p.trim())
      const extensions = flags.ext.split(',').map((e: string) => e.trim())

      const discovered = await discoverFiles(args.path, { ignore: ignorePatterns, extensions })
      const files = discovered.map((f: { path: string }) => f.path)
      const { readFileSync } = await import('fs')
      const contents = files.map((f: string) => {
        try { return readFileSync(f, 'utf-8') } catch { return '' }
      })

      spinner.text = 'Evaluating disciplines...'

      const result = buildRenaissanceResult(files, contents, flags)

      spinner.succeed(`Renaissance analysis complete — era: ${result.stats.era}, score: ${result.stats.renaissanceScore}`)

      const output = flags.format === 'json'
        ? formatRenaissanceJson(result)
        : formatRenaissanceResult(result)

      if (flags.output) {
        const { writeFileSync } = await import('fs')
        writeFileSync(flags.output, output, 'utf-8')
        this.log(chalk.green(`Results written to ${flags.output}`))
      } else {
        this.log(output)
      }

      if (flags.verbose) {
        this.log(chalk.gray(`\nProcessed ${files.length} files in ${args.path}`))
      }
    } catch (error) {
      spinner.fail('Renaissance analysis failed')
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
