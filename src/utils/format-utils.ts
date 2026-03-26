import { TIME_FORMAT_THRESHOLD_MS } from './constants.js'

export function formatTime(ms: number): string {
  if (ms < TIME_FORMAT_THRESHOLD_MS) return `${ms}ms`
  return `${(ms / TIME_FORMAT_THRESHOLD_MS).toFixed(2)}s`
}

export function formatTimeSeconds(ms: number, decimals = 3): string {
  return (ms / 1000).toFixed(decimals)
}

export function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}
