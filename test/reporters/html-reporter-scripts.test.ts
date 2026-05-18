import { describe, expect, it } from 'vitest'

import { getHTMLReporterScripts } from '../../src/reporters/html-reporter-scripts.js'

// ─── getHTMLReporterScripts ───

describe('getHTMLReporterScripts', () => {
  it('returns a non-empty string', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts.length).toBeGreaterThan(0)
  })

  it('contains an IIFE wrapper', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts).toContain('(function()')
    expect(scripts).toContain('})()')
  })

  it('contains filterViolations function', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts).toContain('function filterViolations')
  })

  it('contains filterBy function', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts).toContain('function filterBy')
  })

  it('contains sort logic', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts).toContain('sortSelect')
    expect(scripts).toContain('.sort(')
  })

  it('contains expand/collapse handlers', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts).toContain('expandAllBtn')
    expect(scripts).toContain('collapseAllBtn')
  })

  it('exposes filterBy on window', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts).toContain('window.filterBy = filterBy')
  })

  it('contains severity order mapping', () => {
    const scripts = getHTMLReporterScripts()
    expect(scripts).toContain("error: 0")
    expect(scripts).toContain("warning: 1")
    expect(scripts).toContain("info: 2")
  })
})
