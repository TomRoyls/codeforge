import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildXrayResult, type XrayOptions, type XrayResult } from './xray-helpers.js'
import { formatXrayJSON, formatXrayTable } from './xray-format-helpers.js'

export default class Xray extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to X-ray',
      required: false,
    }),
  }

  static override description = 'X-ray codebase structure and reveal hidden patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'X-ray current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'X-ray src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed X-ray analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'X-ray only TypeScript files',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Xray)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const options: XrayOptions = { verbose: flags.verbose }

    const spinner = ora('Preparing X-ray...').start()

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
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Scanning structure...'

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

    const result: XrayResult = buildXrayResult(files, contents, options)

    spinner.succeed(`X-ray complete — ${result.stats.boneCount} bones, ${result.stats.structuralHealth}% structural health`)

    const outputData = format === 'json' ? formatXrayJSON(result) : formatXrayTable(result)

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

export { buildXrayResult, identifyBones, classifyBone, computeSkeletonStrength, computeJointFlexibility, detectImplicitContracts, detectHiddenDuplication, detectHiddenDependencies, computeStructuralHealth, generateXrayRecommendations } from './xray-helpers.js'
export type { BoneType, ContractType, DuplicationType, HiddenDepType, HiddenDependency, HiddenDuplication, ImplicitContract, RiskLevel, XrayBone, XrayOptions, XrayResult, XrayStats } from './xray-helpers.js'
export { formatXrayJSON, formatXrayTable, formatBoneDiagram, formatContractTable, formatDuplicationHeatmap, formatHiddenDepGraph, formatHealthMeter, formatXrayStats, formatXrayRecommendations, getBoneSymbol, getBoneColor } from './xray-format-helpers.js'
