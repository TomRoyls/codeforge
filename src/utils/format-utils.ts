import { TIME_FORMAT_THRESHOLD_MS } from './constants.js'

export function formatTime(ms: number): string {
  if (ms < TIME_FORMAT_THRESHOLD_MS) return `${ms}ms`
  return `${(ms / TIME_FORMAT_THRESHOLD_MS).toFixed(2)}s`
}

export function formatTimeSeconds(ms: number, decimals = 3): string {
  return (ms / 1000).toFixed(decimals)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export interface SeverityCounts {
  error: number
  info: number
  warning: number
}

export function countSeverities(
  violations: Array<{ severity: 'error' | 'info' | 'warning' }>,
): SeverityCounts {
  const counts: SeverityCounts = { error: 0, info: 0, warning: 0 }
  for (const v of violations) {
    counts[v.severity]++
  }

  return counts
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  const parts = n.toString().split('.')
  parts[0] = parts[0]!.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}
