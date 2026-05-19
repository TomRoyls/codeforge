import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import ora from 'ora'

import { buildGitLogArgs, parseGitLog, buildChurnResultFromCommits } from './churn-helpers.js'
import { formatChurnCsv, formatChurnJson, formatChurnTable } from './churn-format-helpers.js'

// ─── Command ──────────────────────────────────────────────────────────────────

export default class ChurnCommand extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to the git repository to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze code churn — files, authors, and trends over time'

  static override examples = [
    {
      command: '<%= config.bin %> churn',
      description: 'Analyze churn for current repository',
    },
    {
      command: '<%= config.bin %> churn --since 2024-01-01',
      description: 'Analyze churn since a specific date',
    },
    {
      command: '<%= config.bin %> churn --by author --top 5',
      description: 'Show top 5 authors by churn',
    },
    {
      command: '<%= config.bin %> churn --format json --output churn.json',
      description: 'Export churn analysis as JSON',
    },
    {
      command: '<%= config.bin %> churn --verbose',
      description: 'Show detailed author breakdown',
    },
  ]

  static override flags = {
    by: Flags.string({
      default: 'file',
      description: 'Group results by: file, author, month',
      options: ['author', 'file', 'month'],
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    since: Flags.string({
      description: 'Start date or commit for analysis',
    }),
    top: Flags.integer({
      default: 20,
      description: 'Number of top results to show',
    }),
    until: Flags.string({
      description: 'End date or commit for analysis',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ChurnCommand)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'

    const spinner = ora('Analyzing code churn...').start()

    try {
      const gitArgs = buildGitLogArgs({
        since: flags.since,
        until: flags.until,
        by: flags.by as 'author' | 'file' | 'month',
        top: flags.top,
      })

      spinner.text = 'Running git log...'

      let gitOutput: string
      try {
        gitOutput = execSync(`git ${gitArgs.join(' ')}`, {
          cwd: targetPath,
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024,
          stdio: ['pipe', 'pipe', 'pipe'],
        })
      } catch {
        spinner.fail('Failed to run git log. Ensure this is a git repository.')
        this.exit(1)
        return
      }

      if (!gitOutput.trim()) {
        spinner.warn('No commits found matching the criteria')
        return
      }

      spinner.text = 'Parsing commit history...'

      const commits = parseGitLog(gitOutput)

      if (commits.length === 0) {
        spinner.warn('No commits parsed from git output')
        return
      }

      spinner.text = 'Computing churn metrics...'

      const result = buildChurnResultFromCommits(commits, {
        since: flags.since,
        until: flags.until,
        by: flags.by as 'author' | 'file' | 'month',
        top: flags.top,
      })

      spinner.succeed(`Analyzed ${result.stats.totalCommits} commits across ${result.stats.totalFilesChanged} files`)

      const outputData =
        format === 'json'
          ? formatChurnJson(result)
          : format === 'csv'
            ? formatChurnCsv(result)
            : formatChurnTable(result, flags.verbose)

      if (flags.output) {
        const { writeFile } = await import('node:fs/promises')
        try {
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

      if (result.hotspots.length > 0) {
        this.log('')
        this.log(`⚠ ${result.hotspots.length} hotspot file(s) detected`)
      }
    } catch (error: unknown) {
      spinner.fail('Churn analysis failed')
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }
  }
}
