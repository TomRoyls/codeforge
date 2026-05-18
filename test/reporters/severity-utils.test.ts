import { describe, it, expect } from 'vitest'
import {
  SEVERITY_ICONS,
  SEVERITY_COLORS,
  SEVERITY_PRIORITY,
  getSeverityIcon,
  getSeverityColor,
  compareSeverity,
} from '../../src/reporters/severity-utils.js'

// ─── Constants ───

describe('SEVERITY constants', () => {
  it('has icons for all severities', () => {
    expect(SEVERITY_ICONS.error).toBe('✖')
    expect(SEVERITY_ICONS.warning).toBe('⚠')
    expect(SEVERITY_ICONS.info).toBe('ℹ')
  })

  it('has colors for all severities', () => {
    expect(SEVERITY_COLORS.error).toBe('#ff6b6b')
    expect(SEVERITY_COLORS.warning).toBe('#ffd93d')
    expect(SEVERITY_COLORS.info).toBe('#6bcfff')
  })

  it('has priority order: error > warning > info', () => {
    expect(SEVERITY_PRIORITY.error).toBeGreaterThan(SEVERITY_PRIORITY.warning)
    expect(SEVERITY_PRIORITY.warning).toBeGreaterThan(SEVERITY_PRIORITY.info)
  })
})

// ─── getSeverityIcon ───

describe('getSeverityIcon', () => {
  it('returns correct icon for each severity', () => {
    expect(getSeverityIcon('error')).toBe('✖')
    expect(getSeverityIcon('warning')).toBe('⚠')
    expect(getSeverityIcon('info')).toBe('ℹ')
  })
})

// ─── getSeverityColor ───

describe('getSeverityColor', () => {
  it('returns correct color for each severity', () => {
    expect(getSeverityColor('error')).toBe('#ff6b6b')
    expect(getSeverityColor('warning')).toBe('#ffd93d')
    expect(getSeverityColor('info')).toBe('#6bcfff')
  })
})

// ─── compareSeverity ───

describe('compareSeverity', () => {
  it('returns positive when a is less severe than b', () => {
    expect(compareSeverity('info', 'error')).toBeGreaterThan(0)
  })

  it('returns negative when a is more severe than b', () => {
    expect(compareSeverity('error', 'info')).toBeLessThan(0)
  })

  it('returns zero for equal severities', () => {
    expect(compareSeverity('error', 'error')).toBe(0)
  })

  it('sorts error > warning > info', () => {
    const sorted = ['info', 'error', 'warning'].sort(compareSeverity)
    expect(sorted).toEqual(['error', 'warning', 'info'])
  })
})
