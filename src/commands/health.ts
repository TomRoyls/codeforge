/**
 * Health command - displays project health score and recommendations.
 *
 * Calculates an overall health score for the codebase based on multiple factors
 * including complexity, correctness, security, documentation, and test coverage.
 *
 * Features:
 * - Multi-dimensional health scoring
 * - Letter grade assignment (A-F)
 * - Category breakdowns
 * - Improvement recommendations
 * - Test coverage estimation
 *
 * @example
 * ```bash
 * codeforge health
 * codeforge health src/
 * codeforge health --json
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import ora from 'ora'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import { MAX_FILES_TO_PROCESS } from '../utils/constants.js'

import {
  analyzeComplexity as analyzeComplexityHelper,
  calculateScores,
  displayReport as displayReportHelper,
  formatScore as formatScoreHelper,
  getGrade as getGradeHelper,
  getRecommendations as getRecommendationsHelper,
  getScoreColor as getScoreColorHelper,
  type HealthReport,
} from './health-helpers.js'

export default class Health extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Display project health score and recommendations'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show health score for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Show health score for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output health score as JSON',
    },
  ]

  static override flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Health)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const report = await this.analyzeHealth(targetPath)

    if (flags.json) {
      this.log(JSON.stringify(report, null, 2))
    } else {
      this.displayReport(report, flags.verbose)
    }
  }

  displayReport(report: HealthReport, verbose: boolean): void {
    for (const line of displayReportHelper(report, verbose)) {
      this.log(line)
    }
  }

  getGrade(score: number): string {
    return getGradeHelper(score)
  }

  getScoreColor(score: number) {
    return getScoreColorHelper(score)
  }

  formatScore(score: number): string {
    return formatScoreHelper(score)
  }

  getRecommendations(
    scores: HealthReport['scores'],
    details: { errors: number; hasTests: boolean; security: number },
  ): string[] {
    return getRecommendationsHelper(scores, details)
  }

  analyzeComplexity(violations: RuleViolation[]): {
    avgComplexity: number
    filesAnalyzed: number
    highComplexityFiles: number
  } {
    return analyzeComplexityHelper(violations)
  }

  private async analyzeHealth(targetPath: string): Promise<HealthReport> {
    const files = await discoverFiles({
      cwd: targetPath,
      ignore: ['node_modules', 'dist', 'coverage', '.git'],
      patterns: [],
    })

    const parser = new Parser()
    await parser.initialize()

    const registry = new RuleRegistry()
    const allRules = await lazyRuleLoader.loadAllRules()
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }

    const allViolations: RuleViolation[] = []
    let totalFunctions = 0
    let documentedFunctions = 0

    const filesToProcess = files.slice(0, MAX_FILES_TO_PROCESS)
    const spinner = ora('Analyzing project health...').start()
    let completedCount = 0
    const totalFiles = filesToProcess.length

    const parseResults = await Promise.all(
      filesToProcess.map(async (file) => {
        try {
          const result = {
            filePath: file.path,
            parseResult: await parser.parseFile(file.absolutePath),
          }
          completedCount++
          spinner.text = `Analyzing project health... (${completedCount}/${totalFiles})`
          return result
        } catch {
          completedCount++
          spinner.text = `Analyzing project health... (${completedCount}/${totalFiles})`
          return null
        }
      }),
    )

    spinner.succeed(`Analyzed ${totalFiles} files`)

    for (const result of parseResults) {
      if (!result) continue

      try {
        const violations = registry.runRules(result.parseResult.sourceFile)
        allViolations.push(
          ...violations.map((v) => ({
            ...v,
            filePath: result.filePath,
          })),
        )
      } catch {
        continue
      }

      const functions = result.parseResult.sourceFile.getFunctions()
      totalFunctions += functions.length
      for (const fn of functions) {
        const docs = fn.getJsDocs()
        if (docs.length > 0) {
          documentedFunctions++
        }
      }
    }

    parser.dispose()

    const calculated = calculateScores(allViolations, totalFunctions, documentedFunctions, files)

    const recommendations = this.getRecommendations(calculated.scores, {
      errors: calculated.errorCount,
      hasTests: calculated.testCoverage.hasTests,
      security: calculated.securityCount,
    })

    return {
      details: {
        complexity: this.analyzeComplexity(allViolations),
        documentation: { documentedFunctions, totalFunctions },
        errors: calculated.errorCount,
        patterns: calculated.patternCount,
        security: calculated.securityCount,
        testCoverage: calculated.testCoverage,
      },
      overall: calculated.overall,
      path: targetPath,
      recommendations,
      scores: {
        complexity: Math.round(calculated.scores.complexity),
        documentation: Math.round(calculated.scores.documentation),
        errors: Math.round(calculated.scores.errors),
        patterns: Math.round(calculated.scores.patterns),
        security: Math.round(calculated.scores.security),
        testCoverage: Math.round(calculated.scores.testCoverage),
      },
    }
  }
}
