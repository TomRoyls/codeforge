import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildReadmeResult, type ReadmeResult } from './readme-generator-helpers.js'
import { formatReadmeJson, formatReadmeMarkdown, formatReadmePreview } from './readme-generator-format-helpers.js'

export default class ReadmeGenerator extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for README generation',
      required: false,
    }),
  }

  static override description = 'Generate README content from codebase analysis'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate README for current project',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --template minimal',
      description: 'Generate minimal README',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output README data as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format readme --output README_GEN.md',
      description: 'Write generated README to file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --template commands',
      description: 'Generate commands-only README section',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'readme', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    template: Flags.string({
      char: 't',
      default: 'full',
      description: 'README template type',
      options: ['commands', 'full', 'minimal'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ReadmeGenerator)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'readme' | 'table'
    const template = flags.template as 'commands' | 'full' | 'minimal'

    const spinner = ora('Analyzing codebase for README generation...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: defaultIgnore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const commandFiles = discoveredFiles
      .filter((f) => f.path.includes('commands/') || f.path.includes('commands\\'))
      .map((f) => f.absolutePath)

    const contents: Record<string, string> = {}
    for (const f of discoveredFiles.slice(0, 200)) {
      try {
        contents[f.absolutePath] = await fs.readFile(f.absolutePath, 'utf8')
      } catch {
        continue
      }
    }

    const packageReader = async (cwd: string) => {
      try {
        const pkgPath = resolve(cwd, 'package.json')
        const raw = await fs.readFile(pkgPath, 'utf8')
        return JSON.parse(raw) as Record<string, unknown>
      } catch {
        return null
      }
    }

    const result: ReadmeResult = await buildReadmeResult(
      targetPath,
      commandFiles,
      contents,
      packageReader,
      { template, verbose: flags.verbose },
    )

    spinner.succeed(
      `Generated README with ${result.data.commands.length} commands, ${result.data.features.length} features`,
    )

    const outputData =
      format === 'json'
        ? formatReadmeJson(result)
        : format === 'readme'
          ? formatReadmeMarkdown(result)
          : formatReadmePreview(result)

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

export { assembleReadme, buildReadmeResult, detectFeatures, detectTechStack, extractCommands, extractProjectInfo, generateBadges, generateCommandsSection, generateFeaturesSection, generateInstallationSection, generateUsageSection } from './readme-generator-helpers.js'
export type { ContentReader, FileLister, PackageJsonReader, ReadmeCommand, ReadmeData, ReadmeOptions, ReadmeResult, ReadmeSection } from './readme-generator-helpers.js'
export { formatReadmeJson, formatReadmeMarkdown, formatReadmePreview } from './readme-generator-format-helpers.js'
