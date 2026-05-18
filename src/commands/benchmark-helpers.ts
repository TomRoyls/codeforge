/**
 * Pure helper functions for the benchmark command.
 *
 * Extracted from Benchmark class to enable independent testing and reuse.
 * All functions are stateless — they accept parameters and return results.
 */
import chalk from 'chalk'

import type { RuleDefinition } from '../rules/types.js'

import { RuleRegistry } from '../core/rule-registry.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import {
  BENCHMARK_TABLE_SEPARATOR_WIDTH,
  DECIMAL_PRECISION_TIME,
  METRIC_FIELD_WIDTH,
  PERFORMANCE_SLOW_THRESHOLD_MS,
  PERFORMANCE_VERY_SLOW_THRESHOLD_MS,
  TOTAL_FIELD_WIDTH,
} from '../utils/constants.js'

export interface BenchmarkResult {
  avgTime: number
  maxTime: number
  minTime: number
  ruleId: string
  runCount: number
  totalTime: number
}

export type ParseCache = Map<string, { sourceFile: Parameters<RuleRegistry['runRulesBatched']>[0] }>

export async function benchmarkRule(
  ruleId: string,
  ruleDef: RuleDefinition,
  parseCache: ParseCache,
  iterations: number,
): Promise<BenchmarkResult> {
  const registry = new RuleRegistry()
  registry.register(ruleId, ruleDef, getRuleCategory(ruleId))

  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now()

    for (const [, parseResult] of parseCache) {
      registry.runRulesBatched(parseResult.sourceFile, 50)
    }

    const endTime = performance.now()
    times.push(endTime - startTime)
  }

  let totalTime = 0
  let maxTime = times[0]!
  let minTime = times[0]!
  for (let i = 0; i < times.length; i++) {
    const t = times[i]!
    totalTime += t
    if (t > maxTime) maxTime = t
    if (t < minTime) minTime = t
  }

  return {
    avgTime: totalTime / times.length,
    maxTime,
    minTime,
    ruleId,
    runCount: iterations,
    totalTime,
  }
}

export async function getRulesToBenchmark(
  requestedRules: string[] | undefined,
): Promise<[string, RuleDefinition][]> {
  const allEntries = Object.entries(await lazyRuleLoader.loadAllRules())

  if (!requestedRules || requestedRules.length === 0) {
    return allEntries
  }

  const requestedSet = new Set(requestedRules)
  return allEntries.filter(([ruleId]) => requestedSet.has(ruleId))
}

export function formatResultRow(result: BenchmarkResult): string {
  return (
    result.ruleId.padEnd(40) +
    result.avgTime.toFixed(DECIMAL_PRECISION_TIME).padStart(METRIC_FIELD_WIDTH) +
    result.minTime.toFixed(DECIMAL_PRECISION_TIME).padStart(METRIC_FIELD_WIDTH) +
    result.maxTime.toFixed(DECIMAL_PRECISION_TIME).padStart(METRIC_FIELD_WIDTH) +
    result.totalTime.toFixed(2).padStart(TOTAL_FIELD_WIDTH)
  )
}

export function formatResultsTable(results: BenchmarkResult[], topCount: number): string[] {
  const lines: string[] = []

  lines.push(chalk.bold('Results (sorted by average time):'), '')

  const header =
    'Rule ID'.padEnd(40) +
    'Avg (ms)'.padStart(METRIC_FIELD_WIDTH) +
    'Min (ms)'.padStart(METRIC_FIELD_WIDTH) +
    'Max (ms)'.padStart(METRIC_FIELD_WIDTH) +
    'Total (ms)'.padStart(TOTAL_FIELD_WIDTH)
  lines.push(chalk.gray(header), chalk.gray('-'.repeat(BENCHMARK_TABLE_SEPARATOR_WIDTH)))

  const topResults = results.slice(0, topCount)

  for (const result of topResults) {
    const row = formatResultRow(result)

    if (result.avgTime > PERFORMANCE_VERY_SLOW_THRESHOLD_MS) {
      lines.push(chalk.red(row))
    } else if (result.avgTime > PERFORMANCE_SLOW_THRESHOLD_MS) {
      lines.push(chalk.yellow(row))
    } else {
      lines.push(row)
    }
  }

  return lines
}

export function formatSummary(results: BenchmarkResult[]): string[] {
  const lines: string[] = []

  lines.push(
    '',
    chalk.cyan('Summary:'),
    `  Total rules benchmarked: ${results.length}`,
    `  Total time: ${results.reduce((sum, r) => sum + r.totalTime, 0).toFixed(2)}ms`,
  )

  if (results.length > 0) {
    const slowest = results[0]!
    const fastest = results.at(-1)!
    lines.push(
      `  Slowest rule: ${slowest.ruleId} (${slowest.avgTime.toFixed(DECIMAL_PRECISION_TIME)}ms avg)`,
      `  Fastest rule: ${fastest.ruleId} (${fastest.avgTime.toFixed(DECIMAL_PRECISION_TIME)}ms avg)`,
    )
  }

  return lines
}

export function printResults(results: BenchmarkResult[], topCount: number): string[] {
  return [...formatResultsTable(results, topCount), ...formatSummary(results)]
}

export async function writeResults(results: BenchmarkResult[], outputPath: string): Promise<void> {
  const { writeFile } = await import('node:fs/promises')
  await writeFile(outputPath, JSON.stringify(results, null, 2))
}
