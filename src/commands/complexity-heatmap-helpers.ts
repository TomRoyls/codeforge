import { extractFunctions } from './complexity-helpers.js'

// ─── Interfaces ──────────────────────────────────────────

export type HeatmapRiskLevel = 'critical' | 'high' | 'low' | 'medium'

export interface FileHeatmapInfo {
  filePath: string
  totalComplexity: number
  functionCount: number
  maxFunctionComplexity: number
  riskLevel: HeatmapRiskLevel
}

export interface HeatmapResult {
  files: FileHeatmapInfo[]
  totalFiles: number
  totalComplexity: number
  averageComplexity: number
  maxFileComplexity: number
  riskDistribution: { level: HeatmapRiskLevel; count: number }[]
}

// ─── Risk level mapping ─────────────────────────────────

/**
 * Maps a per-function RiskLevel to a per-file HeatmapRiskLevel based on file-level aggregates.
 * Uses the max function complexity in the file to determine file risk.
 *
 * @param maxComplexity - The highest function complexity in the file
 * @returns The file-level heatmap risk level
 *
 * @example
 * getFileRiskLevel(3)   // 'low'
 * getFileRiskLevel(12)  // 'high'
 * getFileRiskLevel(30)  // 'critical'
 */
export function getFileRiskLevel(maxComplexity: number): HeatmapRiskLevel {
  if (maxComplexity <= 5) return 'low'
  if (maxComplexity <= 10) return 'medium'
  if (maxComplexity <= 20) return 'high'
  return 'critical'
}

// ─── File analysis ──────────────────────────────────────

/**
 * Analyzes a single file's complexity for heatmap display.
 * Counts decision points (if, else, for, while, case, catch, &&, ||, ?, ??)
 * across the entire file and extracts per-function metrics.
 *
 * @param content - The source code content
 * @param filePath - The file path for reporting
 * @returns FileHeatmapInfo with total complexity, function count, and risk level
 *
 * @example
 * analyzeFileHeatmap('function foo() { if (x && y) return 1; }', 'test.ts')
 * // { filePath: 'test.ts', totalComplexity: 3, functionCount: 1, ... }
 */
export function analyzeFileHeatmap(content: string, filePath: string): FileHeatmapInfo {
  const functions = extractFunctions(content, filePath)
  const functionCount = functions.length

  const totalComplexity = functions.reduce((sum, fn) => sum + fn.complexity, 0)
  const maxFunctionComplexity = functions.length > 0
    ? Math.max(...functions.map((fn) => fn.complexity))
    : 0

  const riskLevel = getFileRiskLevel(maxFunctionComplexity)

  return {
    filePath,
    functionCount,
    maxFunctionComplexity,
    riskLevel,
    totalComplexity,
  }
}

// ─── Result building ────────────────────────────────────

/**
 * Builds a complete HeatmapResult from multiple file analyses.
 *
 * @param fileResults - Array of FileHeatmapInfo results
 * @returns Aggregated HeatmapResult with totals and risk distribution
 *
 * @example
 * buildHeatmapResult([analyzeFileHeatmap(code, 'test.ts')])
 * // { totalFiles: 1, totalComplexity: 3, riskDistribution: [...], ... }
 */
export function buildHeatmapResult(fileResults: FileHeatmapInfo[]): HeatmapResult {
  const sorted = [...fileResults].sort((a, b) => b.totalComplexity - a.totalComplexity)

  const totalFiles = sorted.length
  const totalComplexity = sorted.reduce((sum, f) => sum + f.totalComplexity, 0)
  const averageComplexity = totalFiles > 0 ? totalComplexity / totalFiles : 0
  const maxFileComplexity = sorted.length > 0 ? sorted[0]!.totalComplexity : 0

  const riskCounts = new Map<HeatmapRiskLevel, number>()
  riskCounts.set('low', 0)
  riskCounts.set('medium', 0)
  riskCounts.set('high', 0)
  riskCounts.set('critical', 0)

  for (const file of sorted) {
    riskCounts.set(file.riskLevel, (riskCounts.get(file.riskLevel) ?? 0) + 1)
  }

  const riskDistribution = Array.from(riskCounts.entries()).map(([level, count]) => ({
    count,
    level,
  }))

  return {
    averageComplexity,
    files: sorted,
    maxFileComplexity,
    riskDistribution,
    totalComplexity,
    totalFiles,
  }
}

// ─── Filtering ──────────────────────────────────────────

/**
 * Filters file results to only those with total complexity at or above the threshold.
 *
 * @param files - Array of FileHeatmapInfo to filter
 * @param minComplexity - Minimum total complexity to include
 * @returns Filtered array
 *
 * @example
 * filterByMinComplexity(files, 5)  // only files with total complexity >= 5
 */
export function filterByMinComplexity(files: FileHeatmapInfo[], minComplexity: number): FileHeatmapInfo[] {
  return files.filter((f) => f.totalComplexity >= minComplexity)
}

/**
 * Returns only the top N files by complexity.
 *
 * @param files - Array of FileHeatmapInfo (should be pre-sorted by complexity desc)
 * @param n - Maximum number of files to return
 * @returns Top N files
 *
 * @example
 * takeTopFiles(files, 20)  // top 20 most complex files
 */
export function takeTopFiles(files: FileHeatmapInfo[], n: number): FileHeatmapInfo[] {
  return files.slice(0, n)
}
