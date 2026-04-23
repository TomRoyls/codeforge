import chalk from 'chalk'

import { type ChalkColorFunction } from '../types/chalk.js'
import {
  HEALTH_SCORE_THRESHOLD_A,
  HEALTH_SCORE_THRESHOLD_B,
  HEALTH_SCORE_THRESHOLD_C,
  HEALTH_SCORE_THRESHOLD_D,
} from './constants.js'

export function getGrade(score: number): string {
  if (score >= HEALTH_SCORE_THRESHOLD_A) return '(A)'
  if (score >= HEALTH_SCORE_THRESHOLD_B) return '(B)'
  if (score >= HEALTH_SCORE_THRESHOLD_C) return '(C)'
  if (score >= HEALTH_SCORE_THRESHOLD_D) return '(D)'
  return '(F)'
}

export function getScoreColor(score: number): ChalkColorFunction {
  if (score >= HEALTH_SCORE_THRESHOLD_B) return chalk.green
  if (score >= HEALTH_SCORE_THRESHOLD_D) return chalk.yellow
  return chalk.red
}

export function colorizeSeverity(severity: string): string {
  if (severity === 'error') return chalk.red(severity)
  if (severity === 'warning') return chalk.yellow(severity)
  if (severity === 'info') return chalk.blue(severity)
  return severity
}

export function getThresholdColor(
  value: number,
  goodThreshold: number,
  warnThreshold: number,
): ChalkColorFunction {
  if (value >= goodThreshold) return chalk.green
  if (value >= warnThreshold) return chalk.yellow
  return chalk.red
}

export function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
