import { Command, Flags, Args } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import { discoverFiles } from '../core/file-discovery.js'
import { buildTapestryWeaverResult } from './tapestry-weaver-helpers.js'
import { formatTapestryWeaverResult, formatTapestryWeaverJson } from './tapestry-weaver-format-helpers.js'

export default class TapestryWeaver extends Command {
  static override description = 'Analyze code weaving quality — how well threads are interlaced'
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

  static override args = {
    path: Args.string({ description: 'Path to analyze', default: '.' }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TapestryWeaver)
    const spinner = ora('Analyzing tapestry weave...').start()

    try {
      const ignorePatterns = flags.ignore.split(',').map((p: string) => p.trim())
      const extensions = flags.ext.split(',').map((e: string) => e.trim())

      const discovered = await discoverFiles({ cwd: args.path, patterns: extensions.map((e: string) => `**/*${e}`), ignore: ignorePatterns })
      const files = discovered.map((f: { path: string }) => f.path)
      const { readFileSync } = await import('fs')
      const contents = files.map((f: string) => {
        try { return readFileSync(f, 'utf-8') } catch { return '' }
      })

      spinner.text = 'Inspecting weft quality...'

      const result = buildTapestryWeaverResult(files, contents, flags)

      spinner.succeed(`Tapestry analysis complete — ${result.stats.totalThreads} threads, ${result.stats.overallWeave}`)

      const output = flags.format === 'json'
        ? formatTapestryWeaverJson(result)
        : formatTapestryWeaverResult(result)

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
      spinner.fail('Tapestry analysis failed')
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
