import type { Severity } from './types.js'

export const SEVERITY_ICONS: Record<Severity, string> = {
  error: '✖',
  info: 'ℹ',
  warning: '⚠',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  error: '#ff6b6b',
  info: '#6bcfff',
  warning: '#ffd93d',
}

export const SEVERITY_PRIORITY: Record<Severity, number> = {
  error: 3,
  info: 1,
  warning: 2,
}

export function getSeverityIcon(severity: Severity): string {
  return SEVERITY_ICONS[severity]
}

export function getSeverityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity]
}

export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_PRIORITY[b] - SEVERITY_PRIORITY[a]
}
