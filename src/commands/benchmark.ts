import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import pLimit from 'p-limit'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import {
  BENCHMARK_TABLE_SEPARATOR_WIDTH,
  DECIMAL_PRECISION_TIME,
  LINE_CLEAR_WIDTH,
  METRIC_FIELD_WIDTH,
  PERFORMANCE_SLOW_THRESHOLD_MS,
  PERFORMANCE_VERY_SLOW_THRESHOLD_MS,
  TOTAL_FIELD_WIDTH,
} from '../utils/constants.js'

interface BenchmarkResult {
  avgTime: number
  maxTime: number
  minTime: number
  ruleId: string
  runCount: number
  totalTime: number
}

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

    const rulesToBenchmark = this.getRulesToBenchmark(flags.rules)

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
    const results: BenchmarkResult[] = []

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

    results.sort((a, b) => b.avgTime - a.avgTime)

    this.printResults(results, flags.top)

    if (flags.output) {
      await this.writeResults(results, flags.output)
      this.log('')
      this.log(chalk.green(`Results written to: ${flags.output}`))
    }
  }

  private async benchmarkRule(
    ruleId: string,
    ruleDef: (typeof allRules)[string],
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

    const totalTime = times.reduce((sum, t) => sum + t, 0)

    return {
      avgTime: totalTime / times.length,
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
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

  private getRulesToBenchmark(
    requestedRules: string[] | undefined,
  ): [string, (typeof allRules)[string]][] {
    const allEntries = Object.entries(allRules)

    if (!requestedRules || requestedRules.length === 0) {
      return allEntries
    }

    const requestedSet = new Set(requestedRules)
    return allEntries.filter(([ruleId]) => requestedSet.has(ruleId))
  }

  private printResults(results: BenchmarkResult[], topCount: number): void {
    this.log(chalk.bold('Results (sorted by average time):'))
    this.log('')

    const header =
      'Rule ID'.padEnd(40) +
      'Avg (ms)'.padStart(METRIC_FIELD_WIDTH) +
      'Min (ms)'.padStart(METRIC_FIELD_WIDTH) +
      'Max (ms)'.padStart(METRIC_FIELD_WIDTH) +
      'Total (ms)'.padStart(TOTAL_FIELD_WIDTH)
    this.log(chalk.gray(header))
    this.log(chalk.gray('-'.repeat(BENCHMARK_TABLE_SEPARATOR_WIDTH)))

    const topResults = results.slice(0, topCount)

    for (const result of topResults) {
      const row =
        result.ruleId.padEnd(40) +
        result.avgTime.toFixed(DECIMAL_PRECISION_TIME).padStart(METRIC_FIELD_WIDTH) +
        result.minTime.toFixed(DECIMAL_PRECISION_TIME).padStart(METRIC_FIELD_WIDTH) +
        result.maxTime.toFixed(DECIMAL_PRECISION_TIME).padStart(METRIC_FIELD_WIDTH) +
        result.totalTime.toFixed(2).padStart(TOTAL_FIELD_WIDTH)

      if (result.avgTime > PERFORMANCE_VERY_SLOW_THRESHOLD_MS) {
        this.log(chalk.red(row))
      } else if (result.avgTime > PERFORMANCE_SLOW_THRESHOLD_MS) {
        this.log(chalk.yellow(row))
      } else {
        this.log(row)
      }
    }

    this.log('')
    this.log(chalk.cyan('Summary:'))
    this.log(`  Total rules benchmarked: ${results.length}`)
    this.log(`  Total time: ${results.reduce((sum, r) => sum + r.totalTime, 0).toFixed(2)}ms`)

    if (results.length > 0) {
      const slowest = results[0]!
      const fastest = results.at(-1)!
      this.log(
        `  Slowest rule: ${slowest.ruleId} (${slowest.avgTime.toFixed(DECIMAL_PRECISION_TIME)}ms avg)`,
      )
      this.log(
        `  Fastest rule: ${fastest.ruleId} (${fastest.avgTime.toFixed(DECIMAL_PRECISION_TIME)}ms avg)`,
      )
    }
  }

  private async writeResults(results: BenchmarkResult[], outputPath: string): Promise<void> {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(outputPath, JSON.stringify(results, null, 2))
  }
}
