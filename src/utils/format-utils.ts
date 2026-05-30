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
  return n.toLocaleString('en-US')
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) {
    return decimals === 0 ? '0 B' : `0.${'0'.repeat(decimals)} B`
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const divisor = 1024
  let size = bytes
  let unitIndex = 0
  while (size >= divisor && unitIndex < units.length - 1) {
    size /= divisor
    unitIndex++
  }
  return `${size.toFixed(decimals)} ${units[unitIndex]}`
}

export function formatBytesCompact(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

export function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}
