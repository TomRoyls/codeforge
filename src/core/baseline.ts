import * as fs from 'fs/promises'
import * as path from 'path'

import type { RuleViolation } from '../ast/visitor.js'

export interface BaselineViolation {
  ruleId: string
  filePath: string
  range: {
    start: {
      line: number
      column: number
    }
    end: {
      line: number
      column: number
    }
  }
  severity: 'error' | 'info' | 'warning'
  message: string
}

export interface BaselineSummary {
  errors: number
  warnings: number
  info: number
  total: number
}

export interface BaselineFile {
  timestamp: string
  violations: BaselineViolation[]
  summary: BaselineSummary
}

export interface BaselineResult {
  regressions: RuleViolation[]
  improvements: RuleViolation[]
  unchanged: number
}

const BASELINE_FILE_NAME = '.codeforge-baseline.json'

function getViolationKey(violation: RuleViolation | BaselineViolation): string {
  return `${violation.ruleId}:${violation.filePath}:${violation.range.start.line}`
}

function violationToBaseline(violation: RuleViolation): BaselineViolation {
  return {
    ruleId: violation.ruleId,
    filePath: violation.filePath,
    range: violation.range,
    severity: violation.severity,
    message: violation.message,
  }
}

export async function saveBaseline(
  violations: RuleViolation[],
  outputPath?: string,
): Promise<string> {
  const summary: BaselineSummary = {
    errors: 0,
    warnings: 0,
    info: 0,
    total: violations.length,
  }

  for (const v of violations) {
    if (v.severity === 'error') summary.errors++
    else if (v.severity === 'warning') summary.warnings++
    else summary.info++
  }

  const baseline: BaselineFile = {
    timestamp: new Date().toISOString(),
    violations: violations.map(violationToBaseline),
    summary,
  }

  const baselinePath = outputPath ? path.resolve(outputPath) : path.resolve(BASELINE_FILE_NAME)

  await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2), 'utf-8')

  return baselinePath
}

export async function loadBaseline(outputPath?: string): Promise<BaselineFile | null> {
  const baselinePath = outputPath ? path.resolve(outputPath) : path.resolve(BASELINE_FILE_NAME)

  try {
    const content = await fs.readFile(baselinePath, 'utf-8')
    const baseline = JSON.parse(content) as BaselineFile
    return baseline
  } catch {
    return null
  }
}

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
        ruleId: violation.ruleId,
        filePath: violation.filePath,
        range: violation.range,
        severity: violation.severity,
        message: violation.message,
      })
    }
  }

  const unchanged = currentViolations.length - regressions.length

  return {
    regressions,
    improvements,
    unchanged,
  }
}
