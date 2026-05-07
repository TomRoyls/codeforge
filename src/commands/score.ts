/**
 * Score command - calculates aggregate quality score for a codebase.
 *
 * Analyzes source files and calculates a weighted quality score based on
 * violations across different categories: complexity, correctness, security, and patterns.
 *
 * Features:
 * - Weighted scoring across multiple categories
 * - Category-level breakdowns
 * - Letter grade assignment (A-F)
 * - Top problematic files identification
 * - Improvement suggestions
 *
 * @example
 * ```bash
 * codeforge score
 * codeforge score src/
 * codeforge score --json
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import ora, { type Ora } from 'ora'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import {
  MAX_FILES_TO_PROCESS,
  MAX_TOP_STATS_FILES,
} from '../utils/constants.js'
import {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
} from './score-calculations.js'
import { formatDisplayOutput, generateSuggestions } from './score-formatting.js'
import { type FileScore, type ScoreReport } from './score-helpers.js'

export default class Score extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Calculate aggregate quality score for the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show quality score for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Show quality score for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output score as JSON',
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
    const { args, flags } = await this.parse(Score)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Analyzing codebase...').start()

    const report = await this.analyzeScore(targetPath, spinner)

    spinner.succeed(`Analyzed ${report.summary.filesAnalyzed} files`)

    if (flags.json) {
      this.log(JSON.stringify(report, null, 2))
    } else {
      formatDisplayOutput(report, flags.verbose, (msg) => this.log(msg))
    }
  }

  private async analyzeScore(targetPath: string, spinner: Ora): Promise<ScoreReport> {
    const files = await discoverFiles({
      cwd: targetPath,
      ignore: ['node_modules', 'dist', 'coverage', '.git'],
      patterns: [],
    })

    spinner.text = 'Initializing parser...'

    const parser = new Parser()
    await parser.initialize()

    const registry = new RuleRegistry()
    const allRules = await lazyRuleLoader.loadAllRules()
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }

    spinner.text = 'Processing files...'

    const filesToProcess = files.slice(0, MAX_FILES_TO_PROCESS)
    const fileScores: FileScore[] = []
    const allViolations: RuleViolation[] = []
    let totalFunctions = 0
    let documentedFunctions = 0
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
          spinner.text = `Processing files... (${completedCount}/${totalFiles})`
          return result
        } catch {
          completedCount++
          spinner.text = `Processing files... (${completedCount}/${totalFiles})`
          return null
        }
      }),
    )

    for (const result of parseResults) {
      if (!result) continue

      const violations = registry.runRules(result.parseResult.sourceFile)
      const violationsWithPath = violations.map((v) => ({
        ...v,
        filePath: result.filePath,
      }))
      allViolations.push(...violationsWithPath)

      const functions = result.parseResult.sourceFile.getFunctions()
      totalFunctions += functions.length
      for (const fn of functions) {
        const docs = fn.getJsDocs()
        if (docs.length > 0) {
          documentedFunctions++
        }
      }

      const categoryCounts: Record<string, number> = {}
      for (const violation of violationsWithPath) {
        const category = getRuleCategory(violation.ruleId)
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }

      const fileScore: number = calculateFileScore(violationsWithPath.length)

      fileScores.push({
        categories: categoryCounts,
        filePath: result.filePath,
        score: fileScore,
        violations: violationsWithPath.length,
      })
    }

    parser.dispose()

    fileScores.sort((a, b) => b.violations - a.violations)

    const complexityViolations = allViolations.filter(
      (v) => getRuleCategory(v.ruleId) === 'complexity',
    )
    const correctnessViolations = allViolations.filter(
      (v) => getRuleCategory(v.ruleId) === 'correctness',
    )
    const securityViolations = allViolations.filter((v) => getRuleCategory(v.ruleId) === 'security')
    const patternsViolations = allViolations.filter((v) => getRuleCategory(v.ruleId) === 'patterns')

    const categories = {
      complexity: calculateCategoryScore(complexityViolations.length, 0.3),
      correctness: calculateCorrectnessScore(
        correctnessViolations.length,
        totalFunctions,
        documentedFunctions,
        0.25,
      ),
      patterns: calculateCategoryScore(patternsViolations.length, 0.15),
      security: calculateCategoryScore(securityViolations.length, 0.3),
    }

    const overall = Math.round(
      categories.complexity.score * categories.complexity.weight +
        categories.correctness.score * categories.correctness.weight +
        categories.security.score * categories.security.weight +
        categories.patterns.score * categories.patterns.weight,
    )

    const suggestions = generateSuggestions(categories, allViolations, fileScores)

    return {
      categories: {
        complexity: {
          score: Math.round(categories.complexity.score),
          violations: complexityViolations.length,
          weight: categories.complexity.weight,
        },
        correctness: {
          score: Math.round(categories.correctness.score),
          violations: correctnessViolations.length,
          weight: categories.correctness.weight,
        },
        patterns: {
          score: Math.round(categories.patterns.score),
          violations: patternsViolations.length,
          weight: categories.patterns.weight,
        },
        security: {
          score: Math.round(categories.security.score),
          violations: securityViolations.length,
          weight: categories.security.weight,
        },
      },
      overall,
      path: targetPath,
      suggestions,
      summary: {
        filesAnalyzed: filesToProcess.length,
        totalViolations: allViolations.length,
        violationsPerFile:
          filesToProcess.length > 0 ? allViolations.length / filesToProcess.length : 0,
      },
      topFiles: fileScores.slice(0, MAX_TOP_STATS_FILES),
    }
  }
}
