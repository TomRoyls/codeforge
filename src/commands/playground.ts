import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildPlaygroundResult, type PlaygroundResult } from './playground-helpers.js'
import { formatPlaygroundJson, formatPlaygroundReport } from './playground-format-helpers.js'

export default class Playground extends Command {
  static override args = {
    file: Args.string({
      description: 'File to analyze',
      required: true,
    }),
  }

  static override description = 'Deep analysis playground for a single file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/commands/count.ts',
      description: 'Deep analyze a single file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> app.ts --format json',
      description: 'Output analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> app.ts --output analysis.json',
      description: 'Save analysis to file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> app.ts --all',
      description: 'Show all analyses including per-function complexity',
    },
  ]

  static override flags = {
    all: Flags.boolean({
      char: 'a',
      default: false,
      description: 'Show all analyses including per-function complexity',
    }),
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
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Playground)

    const targetFile = resolve(args.file as string)

    if (!existsSync(targetFile)) {
      this.error(`File not found: ${targetFile}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora(`Analyzing ${targetFile}...`).start()

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result: PlaygroundResult = await buildPlaygroundResult(targetFile, contentReader, {
      all: flags.all,
      verbose: flags.all,
    })

    const a = result.analysis
    spinner.succeed(
      `${a.fileName}: ${result.score}/100 — ${a.functions.length} functions, ${a.imports.length} imports, ${a.exports.length} exports`,
    )

    const outputData = format === 'json' ? formatPlaygroundJson(result) : formatPlaygroundReport(result)

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

export { analyzeFileIssues, analyzeFileQuality, analyzeFileStructure, analyzeFileStyle, buildPlaygroundResult, computeFileScore, detectLanguage, extractClasses, extractExports, extractFunctions, extractImports, extractInterfaces, extractTypes, generateRefactoringSuggestions } from './playground-helpers.js'
export type { ClassInfo, ContentReader, DeadCodeInfo, ExportInfo, FileAnalysis, FunctionInfo, ImportInfo, InterfaceInfo, IssueInfo, PlaygroundOptions, PlaygroundResult, TypeInfo, TodoInfo } from './playground-helpers.js'
export { buildScoreBar, formatIssues, formatOverview, formatPlaygroundJson, formatPlaygroundReport, formatQuality, formatStructure, formatStyle, formatSuggestions } from './playground-format-helpers.js'
