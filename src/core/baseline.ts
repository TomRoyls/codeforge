import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'

import type { RuleViolation } from '../ast/visitor.js'

/**
 * @stable
 */
export interface BaselineViolation {
  filePath: string
  message: string
  range: {
    end: {
      column: number
      line: number
    }
    start: {
      column: number
      line: number
    }
  }
  ruleId: string
  severity: 'error' | 'info' | 'warning'
}

/**
 * @stable
 */
export interface BaselineSummary {
  errors: number
  info: number
  total: number
  warnings: number
}

/**
 * @stable
 */
export interface BaselineFile {
  summary: BaselineSummary
  timestamp: string
  violations: BaselineViolation[]
}

/**
 * @stable
 */
export interface BaselineResult {
  improvements: RuleViolation[]
  regressions: RuleViolation[]
  unchanged: number
}

const BASELINE_FILE_NAME = '.codeforge-baseline.json'

function getViolationKey(violation: BaselineViolation | RuleViolation): string {
  return `${violation.ruleId}:${violation.filePath}:${violation.range.start.line}`
}

function violationToBaseline(violation: RuleViolation): BaselineViolation {
  return {
    filePath: violation.filePath,
    message: violation.message,
    range: violation.range,
    ruleId: violation.ruleId,
    severity: violation.severity,
  }
}

/**
 * @stable
 */
export async function saveBaseline(
  violations: RuleViolation[],
  outputPath?: string,
): Promise<string> {
  const summary: BaselineSummary = {
    errors: 0,
    info: 0,
    total: violations.length,
    warnings: 0,
  }

  for (const v of violations) {
    if (v.severity === 'error') summary.errors++
    else if (v.severity === 'warning') summary.warnings++
    else summary.info++
  }

  const baseline: BaselineFile = {
    summary,
    timestamp: new Date().toISOString(),
    violations: violations.map((v) => violationToBaseline(v)),
  }

  const baselinePath = outputPath ? resolve(outputPath) : resolve(BASELINE_FILE_NAME)

  await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2), 'utf8')

  return baselinePath
}

/**
 * @stable
 */
export async function loadBaseline(outputPath?: string): Promise<BaselineFile | null> {
  const baselinePath = outputPath ? resolve(outputPath) : resolve(BASELINE_FILE_NAME)

  try {
    const content = await fs.readFile(baselinePath, 'utf8')
    const baseline = JSON.parse(content) as BaselineFile
    return baseline
  } catch {
    return null
  }
}

/**
 * @stable
 */
export function compareWithBaseline(
  currentViolations: RuleViolation[],
  baselineViolations: BaselineViolation[],
): BaselineResult {
  const baselineKeys = new Set(baselineViolations.map((v) => getViolationKey(v)))
  const currentKeys = new Set(currentViolations.map((v) => getViolationKey(v)))

  const regressions: RuleViolation[] = []
  const improvements: RuleViolation[] = []

  for (const violation of currentViolations) {
    const key = getViolationKey(violation)
    if (!baselineKeys.has(key)) {
      regressions.push(violation)
    }
  }

  for (const violation of baselineViolations) {
    const key = getViolationKey(violation)
    if (!currentKeys.has(key)) {
      improvements.push({
        filePath: violation.filePath,
        message: violation.message,
        range: violation.range,
        ruleId: violation.ruleId,
        severity: violation.severity,
      })
    }
  }

  const unchanged = currentViolations.length - regressions.length

  return {
    improvements,
    regressions,
    unchanged,
  }
}
