import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import {
  calculateFileComplexity,
  countCodeStructures as countStructures,
  isLogicalOperator,
  type CodeStructures,
} from './stats-ast-helpers.js'
import { formatOutput } from './stats-format-helpers.js'

interface FileInfo {
  name: string
  loc: number
  complexity: number
  size: number
  type: string
  blankLines: number
  commentLines: number
  structures: CodeStructures
}

interface StatsSummary {
  files: number
  loc: number
  commentLines: number
  blankLines: number
  averageLoc: number
  complexity: number
  averageComplexity: number
  classes: number
  functions: number
  interfaces: number
  methods: number
  typeAliases: number
  enums: number
}

interface StatsOutput {
  summary: StatsSummary
  files: FileInfo[]
  fileTypes: Record<string, number>
}

const EMPTY_STRUCTURES: CodeStructures = {
  classes: 0,
  enums: 0,
  functions: 0,
  interfaces: 0,
  methods: 0,
  typeAliases: 0,
}

const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.git/**',
]

const DISCOVERY_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

/**
 * @example
 * codeforge stats
 * codeforge stats ./src --format json
 * codeforge stats --top 10
 * codeforge stats --format json --output stats.json
 * codeforge stats --ext .ts,.tsx
 */
export default class Stats extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Display codebase statistics and metrics'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show statistics for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Show statistics for src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 largest files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output stats.json',
      description: 'Save statistics to JSON file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Show statistics for TypeScript files only',
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
    'sort-by': Flags.string({
      char: 's',
      default: 'size',
      description: 'Sort files by metric',
      options: ['complexity', 'loc', 'name', 'size'],
    }),
    top: Flags.integer({
      char: 't',
      default: 10,
      description: 'Number of top files to show',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed file statistics',
    }),
  }

  static isLogicalOperator = isLogicalOperator

  countCodeStructures = countStructures

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Stats)

    const targetPath = resolve(args.path as string)
    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const sortBy = flags['sort-by'] as 'complexity' | 'loc' | 'name' | 'size'
    const { ext, ignore, output: outputFlag, top, verbose } = flags

    const allIgnore = ignore
      ? [...DEFAULT_IGNORE_PATTERNS, ...ignore]
      : DEFAULT_IGNORE_PATTERNS

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: allIgnore,
      patterns: DISCOVERY_PATTERNS,
    })

    const extensions = ext
      ? ext
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0)
      : null

    const filteredFiles = extensions === null
      ? discoveredFiles
      : discoveredFiles.filter((f) =>
          extensions.includes(extname(f.path).toLowerCase()),
        )

    const fileInfos: FileInfo[] = []
    const fileTypesCount: Record<string, number> = {}
    const errors: Array<{ name: string; error: string }> = []

    const parser = new Parser()
    await parser.initialize()

    try {
      for (const file of filteredFiles) {
        const filePath = file.path
        const extLower = extname(filePath).toLowerCase()
        const type = extLower || 'unknown'

        fileTypesCount[type] = (fileTypesCount[type] || 0) + 1

        let content = ''
        let readError: string | null = null
        try {
          content = await fs.readFile(file.absolutePath, 'utf8')
        } catch (e) {
          readError = e instanceof Error ? e.message : 'Unknown error'
        }

        if (readError !== null) {
          if (format !== 'json') {
            errors.push({ name: filePath, error: readError })
          }
          fileInfos.push({
            name: filePath,
            loc: 0,
            complexity: 1,
            size: 0,
            type,
            blankLines: 0,
            commentLines: 0,
            structures: { ...EMPTY_STRUCTURES },
          })
          continue
        }

        const { loc, blankLines, commentLines } = countLines(content)
        const size = Buffer.byteLength(content, 'utf8')

        let complexity = 1
        let structures: CodeStructures = { ...EMPTY_STRUCTURES }
        if (extLower === '.ts' || extLower === '.tsx') {
          try {
            const parseResult = await parser.parseFile(file.absolutePath)
            const sourceFile = parseResult.sourceFile
            complexity = calculateFileComplexity(sourceFile)
            structures = countStructures(sourceFile)
          } catch {
            complexity = 1
            structures = { ...EMPTY_STRUCTURES }
          }
        }

        fileInfos.push({
          name: filePath,
          loc,
          complexity,
          size,
          type,
          blankLines,
          commentLines,
          structures,
        })
      }
    } finally {
      await parser.dispose()
    }

    const sortedFiles = sortFiles(fileInfos, sortBy)

    const totalFiles = fileInfos.length
    const totalLoc = sumBy(fileInfos, (f) => f.loc)
    const totalBlank = sumBy(fileInfos, (f) => f.blankLines)
    const totalComment = sumBy(fileInfos, (f) => f.commentLines)
    const totalComplexity = sumBy(fileInfos, (f) => f.complexity)
    const totalClasses = sumBy(fileInfos, (f) => f.structures.classes)
    const totalFunctions = sumBy(fileInfos, (f) => f.structures.functions)
    const totalInterfaces = sumBy(fileInfos, (f) => f.structures.interfaces)
    const totalMethods = sumBy(fileInfos, (f) => f.structures.methods)
    const totalTypeAliases = sumBy(fileInfos, (f) => f.structures.typeAliases)
    const totalEnums = sumBy(fileInfos, (f) => f.structures.enums)

    const statsOutput: StatsOutput = {
      summary: {
        files: totalFiles,
        loc: totalLoc,
        commentLines: totalComment,
        blankLines: totalBlank,
        averageLoc: totalFiles > 0 ? Math.round(totalLoc / totalFiles) : 0,
        complexity: totalComplexity,
        averageComplexity: totalFiles > 0 ? Math.round(totalComplexity / totalFiles) : 0,
        classes: totalClasses,
        functions: totalFunctions,
        interfaces: totalInterfaces,
        methods: totalMethods,
        typeAliases: totalTypeAliases,
        enums: totalEnums,
      },
      files: verbose ? sortedFiles : [],
      fileTypes: fileTypesCount,
    }

    let outputStr: string
    if (format === 'json') {
      outputStr = JSON.stringify(statsOutput, null, 2)
    } else {
      outputStr = formatOutput(statsOutput, format, top)
    }

    if (format !== 'json') {
      for (const err of errors) {
        this.log(`Failed to process file ${err.name}: ${err.error}`)
      }
    }

    if (outputFlag) {
      try {
        await fs.writeFile(outputFlag, outputStr, 'utf8')
        this.log(`Results written to ${outputFlag}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${outputFlag}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputStr)
    }
  }
}

function countLines(content: string): { loc: number; blankLines: number; commentLines: number } {
  if (content.length === 0) {
    return { loc: 0, blankLines: 0, commentLines: 0 }
  }
  let loc = 0
  let blankLines = 0
  let commentLines = 0
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0) {
      blankLines++
    } else if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*')
    ) {
      commentLines++
    } else {
      loc++
    }
  }
  return { loc, blankLines, commentLines }
}

function sumBy<T>(arr: T[], fn: (x: T) => number): number {
  let total = 0
  for (const item of arr) {
    total += fn(item)
  }
  return total
}

function sortFiles(
  files: FileInfo[],
  sortBy: 'complexity' | 'loc' | 'name' | 'size',
): FileInfo[] {
  const sorted = [...files]
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'complexity':
        return b.complexity - a.complexity
      case 'loc':
        return b.loc - a.loc
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
      default:
        return b.size - a.size
    }
  })
  return sorted
}

export { buildStatsResult } from './stats-helpers.js'
export type { FileStats, LanguageStats, MaintainabilityIndex, StatsResult } from './stats-helpers.js'
export { formatStatsJson, formatStatsTable } from './stats-format-helpers.js'
