/**
 * Benchmark command - measures rule performance on a codebase.
 *
 * Runs performance analysis on CodeForge rules to identify slow or inefficient
 * rules, helping optimize analysis speed.
 *
 * Features:
 * - Measure rule execution time across multiple iterations
 * - Compare relative performance of different rules
 * - Warmup iterations for accurate measurements
 * - JSON output for further analysis
 *
 * @example
 * ```bash
 * codeforge benchmark
 * codeforge benchmark --top 10
 * codeforge benchmark --iterations 5
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import pLimit from 'p-limit'

import type { RuleDefinition } from '../rules/types.js'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { getRuleCategory } from '../rules/categories.js'
import { DECIMAL_PRECISION_TIME, LINE_CLEAR_WIDTH } from '../utils/constants.js'
import { sortedByDesc } from '../utils/array-helpers.js'
import {
  type BenchmarkResult,
  getRulesToBenchmark as getRulesToBenchmarkHelper,
  printResults,
  writeResults,
} from './benchmark-helpers.js'

export default class Benchmark extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to benchmark (file or directory)',
      required: false,
    }),
  }

  static override description = 'Benchmark rule performance on a codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Benchmark all rules on current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Benchmark on src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 slowest rules',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --iterations 5',
      description: 'Run 5 iterations for more accurate results',
    },
  ]

  static override flags = {
    iterations: Flags.integer({
      char: 'i',
      default: 3,
      description: 'Number of iterations per rule',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file for benchmark results (JSON)',
    }),
    rules: Flags.string({
      char: 'r',
      description: 'Specific rules to benchmark (comma-separated)',
      multiple: true,
    }),
    top: Flags.integer({
      char: 't',
      default: 20,
      description: 'Number of top slowest rules to show',
    }),
    warmup: Flags.boolean({
      default: true,
      description: 'Run warmup iteration before benchmarking',
    }),
  }

  async getRulesToBenchmark(
    requestedRules: string[] | undefined,
  ): Promise<[string, RuleDefinition][]> {
    return getRulesToBenchmarkHelper(requestedRules)
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Benchmark)

    const targetPath = path.resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    this.log(chalk.bold('CodeForge Benchmark'))
    this.log('')

    const files = await this.discoverFiles(targetPath)

    if (files.length === 0) {
      this.log(chalk.yellow('No files found to benchmark'))
      this.exit(0)
    }

    this.log(chalk.cyan('Configuration:'))
    this.log(`  Files: ${files.length}`)
    this.log(`  Iterations: ${flags.iterations}`)
    this.log(`  Warmup: ${flags.warmup ? 'enabled' : 'disabled'}`)
    this.log('')

    const parser = new Parser()
    await parser.initialize()

    const parseCache = new Map<string, Awaited<ReturnType<typeof parser.parseFile>>>()

    this.log(chalk.cyan('Parsing files...'))
    const parseStartTime = performance.now()

    const limit = pLimit(os.cpus().length)
    await Promise.all(
      files.map((file) =>
        limit(async () => {
          const result = await parser.parseFile(file.absolutePath)
          parseCache.set(file.absolutePath, result)
        }),
      ),
    )

    const parseTime = performance.now() - parseStartTime
    this.log(`  Parse time: ${parseTime.toFixed(2)}ms`)
    this.log('')

    const rulesToBenchmark = await this.getRulesToBenchmark(flags.rules)

    if (flags.warmup && rulesToBenchmark.length > 0) {
      this.log(chalk.cyan('Running warmup...'))
      const registry = new RuleRegistry()
      const [ruleId, ruleDef] = rulesToBenchmark[0]!
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))

      const firstFile = parseCache.values().next().value
      if (firstFile) {
        registry.runRules(firstFile.sourceFile)
      }

      this.log('  Warmup complete')
      this.log('')
    }

    this.log(chalk.cyan('Benchmarking rules...'))
    let results: BenchmarkResult[] = []

    const benchmarkPromises = rulesToBenchmark.map(async ([ruleId, ruleDef]) => {
      const result = await this.benchmarkRule(ruleId, ruleDef, parseCache, flags.iterations)
      process.stdout.write(`\r  ${ruleId}: avg ${result.avgTime.toFixed(DECIMAL_PRECISION_TIME)}ms`)
      return result
    })

    for (const result of await Promise.all(benchmarkPromises)) {
      results.push(result)
    }

    this.log('\r' + ' '.repeat(LINE_CLEAR_WIDTH) + '\r')
    this.log('')

    parser.dispose()

    results = sortedByDesc(results, r => r.avgTime)

    for (const line of printResults(results, flags.top)) {
      this.log(line)
    }

    if (flags.output) {
      try {
        await writeResults(results, flags.output)
      } catch (error) {
        this.error(
          `Failed to write benchmark results to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }

      this.log('')
      this.log(chalk.green(`Results written to: ${flags.output}`))
    }
  }

  private async benchmarkRule(
    ruleId: string,
    ruleDef: RuleDefinition,
    parseCache: Map<string, Awaited<ReturnType<Parser['parseFile']>>>,
    iterations: number,
  ): Promise<BenchmarkResult> {
    const registry = new RuleRegistry()
    registry.register(ruleId, ruleDef, getRuleCategory(ruleId))

    const times: number[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()

      for (const [, parseResult] of parseCache) {
        registry.runRules(parseResult.sourceFile)
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

  private async discoverFiles(cwd: string) {
    return discoverFiles({
      cwd,
      ignore: ['node_modules/**', 'dist/**', 'coverage/**', '**/*.d.ts'],
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })
  }
}
