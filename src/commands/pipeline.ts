import { Args, Command, Flags } from '@oclif/core'
import { existsSync, statSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildPipelineResult, computePipelineStats, type PipelineConfig } from './pipeline-helpers.js'
import { formatPipelineJson, formatPipelineTable } from './pipeline-format-helpers.js'

export default class Pipeline extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for CI/CD pipeline configs',
      required: false,
    }),
  }

  static override description = 'Analyze CI/CD pipeline configurations'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze CI/CD pipelines in current project',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze pipelines in specific directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output pipeline analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed job information',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Pipeline)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for CI/CD pipeline configs...').start()

    const pipelineFiles = await findPipelineFiles(targetPath)

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const config: PipelineConfig = await buildPipelineResult(pipelineFiles, contentReader, {
      verbose: flags.verbose,
    })

    const stats = computePipelineStats(config.jobs)

    spinner.succeed(
      `Found ${config.platform} pipeline with ${config.jobs.length} jobs, ${config.issues.length} issues`,
    )

    const outputData = format === 'json'
      ? formatPipelineJson(config, stats)
      : formatPipelineTable(config, stats)

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

async function findPipelineFiles(cwd: string): Promise<string[]> {
  const files: string[] = []

  const candidates = [
    '.github/workflows',
    '.gitlab-ci.yml',
    '.travis.yml',
    'Jenkinsfile',
    '.circleci/config.yml',
  ]

  for (const candidate of candidates) {
    const fullPath = resolve(cwd, candidate)
    if (!existsSync(fullPath)) continue

    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      try {
        const entries = await fs.readdir(fullPath, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml'))) {
            files.push(resolve(fullPath, entry.name))
          }
        }
      } catch {
        continue
      }
    } else {
      files.push(fullPath)
    }
  }

  return files
}

export { buildPipelineResult, computePipelineStats, detectCIPlatform, detectPipelineIssues, generatePipelineSuggestions, parseGitLabCI, parseGitHubActions, parseTravisCI } from './pipeline-helpers.js'
export type { PipelineConfig, PipelineIssue, PipelineJob, PipelineOptions, PipelineStage, PipelineStats } from './pipeline-helpers.js'
export { formatPipelineIssues, formatPipelineJobs, formatPipelineJson, formatPipelineStats, formatPipelineTable, severityLabel } from './pipeline-format-helpers.js'
