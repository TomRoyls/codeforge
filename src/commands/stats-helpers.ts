import { extname } from 'node:path'

import { MAX_TOP_STATS_FILES } from '../utils/constants.js'
import {
  calculateFileComplexity,
  countCodeStructures,
  
} from './stats-ast-helpers.js'


export interface CodeStructures {
  classes: number
  enums: number
  functions: number
  interfaces: number
  methods: number
  typeAliases: number
}

export interface FileStats {
  blankLines: number
  commentLines: number
  complexity: number
  loc: number
  name: string
  size: number
  structures: CodeStructures
  type: string
}

export interface StatsResult {
  files: FileStats[]
  fileTypes: Record<string, number>
  summary: {
    averageComplexity: number
    averageLoc: number
    blankLines: number
    classes: number
    commentLines: number
    complexity: number
    enums: number
    files: number
    functions: number
    interfaces: number
    loc: number
    methods: number
    typeAliases: number
  }
}

const EMPTY_STRUCTURES: CodeStructures = Object.freeze({
  classes: 0,
  enums: 0,
  functions: 0,
  interfaces: 0,
  methods: 0,
  typeAliases: 0,
})

interface LineCounts {
  blank: number
  comments: number
  loc: number
}

export interface ProcessedFileResult {
  blank: number
  comments: number
  complexity: number
  ext: string
  file: { absolutePath: string; path: string }
  loc: number
  size: number
  structures: CodeStructures
}

interface AggregateResult {
  fileStats: FileStats[]
  fileTypes: Record<string, number>
  totalBlank: number
  totalComments: number
  totalComplexity: number
  totalLoc: number
  totalStructures: CodeStructures
}

interface FileParser {
  parseFile(filePath: string): Promise<{ sourceFile: import('ts-morph').SourceFile }>
  releaseFile(filePath: string): void
}




export function countLines(content: string): LineCounts {
  const lines = content.split('\n')
  let loc = 0
  let comments = 0
  let blank = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) {
      blank++
    } else if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      comments++
    } else {
      loc++
    }
  }

  return { blank, comments, loc }
}

export async function processFileStats(
  file: { absolutePath: string; path: string },
  content: string,
  parser: FileParser | null,
  tsExtensions: Set<string>,
): Promise<ProcessedFileResult> {
  const { blank, comments, loc } = countLines(content)
  const ext = extname(file.path).toLowerCase()

  let complexity = 1
  let structures: CodeStructures = EMPTY_STRUCTURES

  if (parser && tsExtensions.has(ext)) {
    try {
      const parseResult = await parser.parseFile(file.absolutePath)
      complexity = calculateFileComplexity(parseResult.sourceFile)
      structures = countCodeStructures(parseResult.sourceFile)
      parser.releaseFile(file.absolutePath)
    } catch {
      complexity = 1
      structures = EMPTY_STRUCTURES
    }
  }

  return {
    blank,
    comments,
    complexity,
    ext,
    file,
    loc,
    size: content.length,
    structures,
  }
}

export function aggregateStats(
  results: (null | ProcessedFileResult)[],
  verbose: boolean,
): AggregateResult {
  const fileStats: FileStats[] = []
  const fileTypes: Record<string, number> = {}
  let totalLoc = 0
  let totalComments = 0
  let totalBlank = 0
  let totalComplexity = 0
  const totalStructures: CodeStructures = {
    classes: 0,
    enums: 0,
    functions: 0,
    interfaces: 0,
    methods: 0,
    typeAliases: 0,
  }

  for (const result of results) {
    if (!result) continue

    const { blank, comments, complexity, ext, file, loc, size, structures } = result

    fileTypes[ext] = (fileTypes[ext] ?? 0) + 1

    totalLoc += loc
    totalComments += comments
    totalBlank += blank
    totalComplexity += complexity
    totalStructures.classes += structures.classes
    totalStructures.enums += structures.enums
    totalStructures.functions += structures.functions
    totalStructures.interfaces += structures.interfaces
    totalStructures.methods += structures.methods
    totalStructures.typeAliases += structures.typeAliases

    if (verbose) {
      fileStats.push({
        blankLines: blank,
        commentLines: comments,
        complexity,
        loc,
        name: file.path,
        size,
        structures,
        type: ext || 'unknown',
      })
    }
  }

  return {
    fileStats,
    fileTypes,
    totalBlank,
    totalComments,
    totalComplexity,
    totalLoc,
    totalStructures,
  }
}

export function sortFileStats(fileStats: FileStats[], sortBy: string): FileStats[] {
  return fileStats.slice().sort((a, b) => {
    switch (sortBy) {
      case 'complexity': {
        return b.complexity - a.complexity
      }

      case 'loc': {
        return b.loc - a.loc
      }

      case 'name': {
        return a.name.localeCompare(b.name)
      }

      default: {
        return b.size - a.size
      }
    }
  })
}

export function buildStatsResult(
  totalFiles: number,
  fileStats: FileStats[],
  aggregated: AggregateResult,
): StatsResult {
  return {
    files: fileStats.slice(0, MAX_TOP_STATS_FILES),
    fileTypes: aggregated.fileTypes,
    summary: {
      averageComplexity: totalFiles > 0 ? Math.round(aggregated.totalComplexity / totalFiles) : 0,
      averageLoc: totalFiles > 0 ? Math.round(aggregated.totalLoc / totalFiles) : 0,
      blankLines: aggregated.totalBlank,
      classes: aggregated.totalStructures.classes,
      commentLines: aggregated.totalComments,
      complexity: aggregated.totalComplexity,
      enums: aggregated.totalStructures.enums,
      files: totalFiles,
      functions: aggregated.totalStructures.functions,
      interfaces: aggregated.totalStructures.interfaces,
      loc: aggregated.totalLoc,
      methods: aggregated.totalStructures.methods,
      typeAliases: aggregated.totalStructures.typeAliases,
    },
  }
}

export {calculateFileComplexity, countCodeStructures, isLogicalOperator} from './stats-ast-helpers.js'
export {formatCsv, formatOutput, formatTable} from './stats-format-helpers.js'