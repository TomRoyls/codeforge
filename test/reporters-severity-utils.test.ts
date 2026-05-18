import { describe, it, expect } from 'vitest'
import {
  SEVERITY_ICONS,
  SEVERITY_COLORS,
  SEVERITY_PRIORITY,
  getSeverityIcon,
  getSeverityColor,
  compareSeverity,
} from '../src/reporters/severity-utils.js'

// ─── SEVERITY_ICONS ───────────────────────────────────
describe('SEVERITY_ICONS', () => {
  it('has icon for error', () => {
    expect(SEVERITY_ICONS.error).toBe('✖')
  })

  it('has icon for warning', () => {
    expect(SEVERITY_ICONS.warning).toBe('⚠')
  })

  it('has icon for info', () => {
    expect(SEVERITY_ICONS.info).toBe('ℹ')
  })

  it('has exactly 3 entries', () => {
    expect(Object.keys(SEVERITY_ICONS)).toHaveLength(3)
  })
})

// ─── SEVERITY_COLORS ──────────────────────────────────
describe('SEVERITY_COLORS', () => {
  it('has color for error', () => {
    expect(SEVERITY_COLORS.error).toBe('#ff6b6b')
  })

  it('has color for warning', () => {
    expect(SEVERITY_COLORS.warning).toBe('#ffd93d')
  })

  it('has color for info', () => {
    expect(SEVERITY_COLORS.info).toBe('#6bcfff')
  })

  it('all colors are valid hex', () => {
    for (const color of Object.values(SEVERITY_COLORS)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})

// ─── SEVERITY_PRIORITY ────────────────────────────────
describe('SEVERITY_PRIORITY', () => {
  it('error has highest priority', () => {
    expect(SEVERITY_PRIORITY.error).toBeGreaterThan(SEVERITY_PRIORITY.warning)
    expect(SEVERITY_PRIORITY.error).toBeGreaterThan(SEVERITY_PRIORITY.info)
  })

  it('warning has medium priority', () => {
    expect(SEVERITY_PRIORITY.warning).toBeGreaterThan(SEVERITY_PRIORITY.info)
  })

  it('info has lowest priority', () => {
    expect(SEVERITY_PRIORITY.info).toBeLessThan(SEVERITY_PRIORITY.warning)
  })

  it('all priorities are distinct', () => {
    const vals = Object.values(SEVERITY_PRIORITY)
    expect(new Set(vals).size).toBe(vals.length)
  })
})

// ─── getSeverityIcon ──────────────────────────────────
describe('getSeverityIcon', () => {
  it('returns error icon', () => {
    expect(getSeverityIcon('error')).toBe('✖')
  })

  it('returns warning icon', () => {
    expect(getSeverityIcon('warning')).toBe('⚠')
  })

  it('returns info icon', () => {
    expect(getSeverityIcon('info')).toBe('ℹ')
  })
})

// ─── getSeverityColor ─────────────────────────────────
describe('getSeverityColor', () => {
  it('returns error color', () => {
    expect(getSeverityColor('error')).toBe('#ff6b6b')
  })

  it('returns warning color', () => {
    expect(getSeverityColor('warning')).toBe('#ffd93d')
  })

  it('returns info color', () => {
    expect(getSeverityColor('info')).toBe('#6bcfff')
  })
})

// ─── compareSeverity ──────────────────────────────────
describe('compareSeverity', () => {
  it('error is less than warning (ascending sort puts error first)', () => {
    expect(compareSeverity('error', 'warning')).toBeLessThan(0)
  })

  it('error is less than info', () => {
    expect(compareSeverity('error', 'info')).toBeLessThan(0)
  })

  it('warning is less than info', () => {
    expect(compareSeverity('warning', 'info')).toBeLessThan(0)
  })

  it('same severity returns 0', () => {
    expect(compareSeverity('error', 'error')).toBe(0)
    expect(compareSeverity('warning', 'warning')).toBe(0)
    expect(compareSeverity('info', 'info')).toBe(0)
  })

  it('sorts array ascending (error first)', () => {
    const arr: Array<'error' | 'info' | 'warning'> = ['info', 'error', 'warning']
    arr.sort(compareSeverity)
    expect(arr).toEqual(['error', 'warning', 'info'])
  })
})
