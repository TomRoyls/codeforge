import { describe, expect, it } from 'vitest'

import { SEVERITY_COLORS, getHTMLReporterStyles } from '../../src/reporters/html-reporter-styles.js'

// ─── SEVERITY_COLORS ───

describe('SEVERITY_COLORS', () => {
  it('has error color', () => {
    expect(SEVERITY_COLORS.error).toBe('#ff6b6b')
  })

  it('has warning color', () => {
    expect(SEVERITY_COLORS.warning).toBe('#ffd93d')
  })

  it('has info color', () => {
    expect(SEVERITY_COLORS.info).toBe('#6bcfff')
  })

  it('has exactly 3 entries', () => {
    expect(Object.keys(SEVERITY_COLORS)).toHaveLength(3)
  })
})

// ─── getHTMLReporterStyles ───

describe('getHTMLReporterStyles', () => {
  it('returns a non-empty string', () => {
    const styles = getHTMLReporterStyles()
    expect(styles.length).toBeGreaterThan(0)
  })

  it('contains CSS root variables', () => {
    const styles = getHTMLReporterStyles()
    expect(styles).toContain(':root')
    expect(styles).toContain('--bg-primary')
    expect(styles).toContain('--text-primary')
  })

  it('contains severity color references', () => {
    const styles = getHTMLReporterStyles()
    expect(styles).toContain(SEVERITY_COLORS.error)
    expect(styles).toContain(SEVERITY_COLORS.warning)
    expect(styles).toContain(SEVERITY_COLORS.info)
  })

  it('contains key CSS classes', () => {
    const styles = getHTMLReporterStyles()
    expect(styles).toContain('.container')
    expect(styles).toContain('.header')
    expect(styles).toContain('.summary-card')
    expect(styles).toContain('.violation')
    expect(styles).toContain('.file-section')
  })

  it('contains box-sizing reset', () => {
    const styles = getHTMLReporterStyles()
    expect(styles).toContain('box-sizing: border-box')
  })

  it('contains hidden utility class', () => {
    const styles = getHTMLReporterStyles()
    expect(styles).toContain('.hidden')
    expect(styles).toContain('display: none')
  })
})
