import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import {
  HEALTH_SCORE_MAX,
  HEALTH_SCORE_THRESHOLD_A,
  HEALTH_SCORE_THRESHOLD_B,
  HEALTH_SCORE_THRESHOLD_C,
  HEALTH_SCORE_THRESHOLD_D,
  MAX_FILES_TO_PROCESS,
  MAX_RECOMMENDATIONS,
  SCORE_FIELD_WIDTH,
} from '../utils/constants.js'

interface HealthReport {
  details: {
    complexity: { avgComplexity: number; filesAnalyzed: number; highComplexityFiles: number }
    documentation: { documentedFunctions: number; totalFunctions: number }
    errors: number
    patterns: number
    security: number
    testCoverage: { estimated: number; hasTests: boolean }
  }
  overall: number
  path: string
  recommendations: string[]
  scores: {
    complexity: number
    documentation: number
    errors: number
    patterns: number
    security: number
    testCoverage: number
  }
}

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

  private analyzeComplexity(violations: RuleViolation[]): {
    avgComplexity: number
    filesAnalyzed: number
    highComplexityFiles: number
  } {
    const complexityViolations = violations.filter((v) => v.ruleId.includes('complexity'))
    const filesWithViolations = new Set(complexityViolations.map((v) => v.filePath))

    return {
      avgComplexity:
        complexityViolations.length > 0
          ? complexityViolations.length / filesWithViolations.size
          : 0,
      filesAnalyzed: filesWithViolations.size,
      highComplexityFiles: complexityViolations.filter((v) => v.message.includes('high')).length,
    }
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
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }

    const allViolations: RuleViolation[] = []
    let totalFunctions = 0
    let documentedFunctions = 0

    const filesToProcess = files.slice(0, MAX_FILES_TO_PROCESS)
    const parseResults = await Promise.all(
      filesToProcess.map(async (file) => {
        try {
          return {
            filePath: file.path,
            parseResult: await parser.parseFile(file.absolutePath),
          }
        } catch {
          return null
        }
      }),
    )

    for (const result of parseResults) {
      if (!result) continue

      const violations = registry.runRules(result.parseResult.sourceFile)
      allViolations.push(
        ...violations.map((v) => ({
          ...v,
          filePath: result.filePath,
        })),
      )

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

    const errors = allViolations.filter((v) => v.severity === 'error')
    const security = allViolations.filter((v) => getRuleCategory(v.ruleId) === 'security')
    const patterns = allViolations.filter((v) => getRuleCategory(v.ruleId) === 'patterns')

    const hasTests = files.some((f) => f.path.includes('test') || f.path.includes('spec'))
    const testFiles = files.filter((f) => f.path.includes('test') || f.path.includes('spec'))
    const estimatedCoverage = hasTests
      ? Math.min(100, (testFiles.length / (files.length - testFiles.length || 1)) * 100)
      : 0

    const scores = {
      complexity: Math.max(
        0,
        100 - errors.filter((e) => e.ruleId.includes('complexity')).length * 5,
      ),
      documentation: totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 50,
      errors: Math.max(0, 100 - errors.length * 2),
      patterns: Math.max(0, 100 - patterns.length),
      security: Math.max(0, 100 - security.length * 10),
      testCoverage: estimatedCoverage,
    }

    const weights = {
      complexity: 0.2,
      documentation: 0.15,
      errors: 0.25,
      patterns: 0.1,
      security: 0.2,
      testCoverage: 0.1,
    }

    const overall = Math.round(
      scores.complexity * weights.complexity +
        scores.documentation * weights.documentation +
        scores.errors * weights.errors +
        scores.security * weights.security +
        scores.patterns * weights.patterns +
        scores.testCoverage * weights.testCoverage,
    )

    const recommendations = this.getRecommendations(scores, {
      errors: errors.length,
      hasTests,
      security: security.length,
    })

    return {
      details: {
        complexity: this.analyzeComplexity(allViolations),
        documentation: { documentedFunctions, totalFunctions },
        errors: errors.length,
        patterns: patterns.length,
        security: security.length,
        testCoverage: { estimated: Math.round(estimatedCoverage), hasTests },
      },
      overall,
      path: targetPath,
      recommendations,
      scores: {
        complexity: Math.round(scores.complexity),
        documentation: Math.round(scores.documentation),
        errors: Math.round(scores.errors),
        patterns: Math.round(scores.patterns),
        security: Math.round(scores.security),
        testCoverage: Math.round(scores.testCoverage),
      },
    }
  }

  private displayReport(report: HealthReport, verbose: boolean): void {
    const score = report.overall
    const grade = this.getGrade(score)
    const colorFn = this.getScoreColor(score)

    this.log('')
    this.log(chalk.bold('  Project Health Score'))
    this.log('')
    this.log(
      `  ${colorFn(`  ${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX}`)}  ${chalk.gray(grade)}`,
    )
    this.log('')

    if (verbose) {
      this.log(chalk.gray('  Category Breakdown:'))
      this.log(`    Complexity:    ${this.formatScore(report.scores.complexity)}`)
      this.log(`    Documentation: ${this.formatScore(report.scores.documentation)}`)
      this.log(`    Error Count:   ${this.formatScore(report.scores.errors)}`)
      this.log(`    Security:      ${this.formatScore(report.scores.security)}`)
      this.log(`    Patterns:      ${this.formatScore(report.scores.patterns)}`)
      this.log(`    Test Coverage: ${this.formatScore(report.scores.testCoverage)}`)
      this.log('')

      this.log(chalk.gray('  Details:'))
      this.log(`    Files analyzed: ${report.details.complexity.filesAnalyzed}`)
      this.log(`    Errors: ${report.details.errors}`)
      this.log(`    Security issues: ${report.details.security}`)
      this.log(`    Pattern issues: ${report.details.patterns}`)
      this.log(`    Tests present: ${report.details.testCoverage.hasTests ? 'Yes' : 'No'}`)
      this.log('')
    }

    if (report.recommendations.length > 0) {
      this.log(chalk.gray('  Recommendations:'))
      for (const rec of report.recommendations) {
        this.log(`    ${chalk.yellow('•')} ${rec}`)
      }

      this.log('')
    }
  }

  private formatScore(score: number): string {
    const colorFn = this.getScoreColor(score)
    return colorFn(`${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX}`)
  }

  private getGrade(score: number): string {
    if (score >= HEALTH_SCORE_THRESHOLD_A) return '(A)'
    if (score >= HEALTH_SCORE_THRESHOLD_B) return '(B)'
    if (score >= HEALTH_SCORE_THRESHOLD_C) return '(C)'
    if (score >= HEALTH_SCORE_THRESHOLD_D) return '(D)'
    return '(F)'
  }

  private getRecommendations(
    scores: HealthReport['scores'],
    details: { errors: number; hasTests: boolean; security: number },
  ): string[] {
    const recommendations: string[] = []

    if (scores.errors < HEALTH_SCORE_THRESHOLD_B) {
      recommendations.push(`Fix ${details.errors} error-level violations`)
    }

    if (scores.security < HEALTH_SCORE_THRESHOLD_A) {
      recommendations.push(`Address ${details.security} security issues`)
    }

    if (scores.documentation < 50) {
      recommendations.push('Add JSDoc comments to public functions')
    }

    if (!details.hasTests) {
      recommendations.push('Add unit tests to improve code quality')
    }

    if (scores.complexity < HEALTH_SCORE_THRESHOLD_C) {
      recommendations.push('Reduce code complexity by breaking down large functions')
    }

    return recommendations.slice(0, MAX_RECOMMENDATIONS)
  }

  private getScoreColor(score: number) {
    if (score >= HEALTH_SCORE_THRESHOLD_B) return chalk.green
    if (score >= HEALTH_SCORE_THRESHOLD_D) return chalk.yellow
    return chalk.red
  }
}
