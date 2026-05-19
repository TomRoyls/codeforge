import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildHotspotResult, type HotspotResult, type FileCommitData } from './hotspot-helpers.js'
import { formatHotspotCsv, formatHotspotJson, formatHotspotResultTable } from './hotspot-format-helpers.js'

export default class Hotspot extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for hotspots',
      required: false,
    }),
  }

  static override description = 'Detect code hotspots — complex and frequently changed files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Detect hotspots in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output hotspots as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 50',
      description: 'Lower threshold to 50 to catch more hotspots',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show function-level breakdown for top hotspots',
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
      options: ['csv', 'json', 'table'],
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
      default: 70,
      description: 'Hotspot score threshold (0-100)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show function-level breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Hotspot)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose, threshold } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = '.' + f.path.split('.').pop()
          return extensions.includes(ext!)
        })
      : discoveredFiles

    spinner.text = 'Analyzing hotspots...'

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

    const commitData = await gatherCommitData(files, targetPath)

    const result: HotspotResult = buildHotspotResult(files, contents, commitData, { threshold, verbose })

    spinner.succeed(`Found ${result.stats.hotspotFiles} hotspots across ${result.stats.totalFiles} files`)

    const outputData =
      format === 'json'
        ? formatHotspotJson(result)
        : format === 'csv'
          ? formatHotspotCsv(result)
          : formatHotspotResultTable(result, verbose)

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

async function gatherCommitData(files: string[], _cwd: string): Promise<FileCommitData[]> {
  const data: FileCommitData[] = []
  try {
    const { execFileSync } = await import('node:child_process')
    for (const file of files) {
      try {
        const output = execFileSync('git', ['log', '--follow', '--format=%H|%ai|%aN', '--', file], {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
        })
        const lines = output.trim().split('\n').filter(Boolean)
        const authors = [...new Set(lines.map((l) => l.split('|')[2]!).filter(Boolean))]
        const lastChanged = lines[0]?.split('|')![1]?.slice(0, 10) ?? ''
        data.push({ file, commitCount: lines.length, lastChanged, authors })
      } catch {
        data.push({ file, commitCount: 0, lastChanged: '', authors: [] })
      }
    }
  } catch {
    // git not available
  }
  return data
}

export { buildHotspotResult, computeFileComplexity, computeFunctionComplexity, computeHotspotScore, classifyRisk, computeDistribution, findTopHotspots, computeHotspotStats, generateHotspotRecommendations } from './hotspot-helpers.js'
export type { HotspotResult, HotspotEntry, FunctionHotspot, HotspotDistribution, HotspotStats, HotspotOptions, FileCommitData } from './hotspot-helpers.js'
export { formatHotspotCsv, formatHotspotJson, formatHotspotResultTable, formatHotspotTable, formatDistributionChart, formatTopHotspotsDetail } from './hotspot-format-helpers.js'
