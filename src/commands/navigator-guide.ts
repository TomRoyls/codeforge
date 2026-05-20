import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildNavigatorGuideResult } from './navigator-guide-helpers.js'
import { formatNavigatorGuideJson, formatNavigatorGuideTable } from './navigator-guide-format-helpers.js'

export default class NavigatorGuide extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to generate navigator guide for',
      required: false,
    }),
  }

  static override description = 'Generate an onboarding navigator guide for the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate navigator guide for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Generate guide as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --output guide.json',
      description: 'Save guide to file',
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
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorGuide)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

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

    spinner.text = 'Reading files...'

    const contents = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    spinner.text = 'Building navigator guide...'

    const files = discoveredFiles.map((f) => f.path)
    const result = buildNavigatorGuideResult(files, contents, {})

    spinner.succeed(`Navigator guide generated: ${result.stats.totalSections} sections, ${result.stats.totalAttractions} attractions`)

    const outputData = format === 'json' ? formatNavigatorGuideJson(result) : formatNavigatorGuideTable(result)

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

export { buildNavigatorGuideResult } from './navigator-guide-helpers.js'
export type { NavigatorGuideResult, GuideSection, Attraction, TourRoute, ConstructionZone, OnboardingScore, NavigatorGuideStats } from './navigator-guide-helpers.js'
export { formatNavigatorGuideJson, formatNavigatorGuideTable } from './navigator-guide-format-helpers.js'
