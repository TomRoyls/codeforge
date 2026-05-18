import { describe, expect, it } from 'vitest'
import { TableBuilder } from '../../../src/core/markdown-reporter/table-builder.js'

// ─── Constructor ───

describe('TableBuilder', () => {
  it('creates instance with empty state', () => {
    const builder = new TableBuilder()
    expect(builder.build()).toBe('')
  })

  // ─── setHeaders ───

  describe('setHeaders', () => {
    it('sets headers with default left alignment', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Name', 'Value'])
      const result = builder.build()
      expect(result).toContain('| Name | Value |')
      expect(result).toContain(':---')
    })

    it('sets custom alignment', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Left', 'Center', 'Right'], ['left', 'center', 'right'])
      const result = builder.build()
      expect(result).toContain(':---')
      expect(result).toContain(':---:')
      expect(result).toContain('---:')
    })
  })

  // ─── addRow ───

  describe('addRow', () => {
    it('adds a single row', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A', 'B'])
      builder.addRow(['1', '2'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[2]).toBe('| 1 | 2 |')
    })

    it('pads short rows with empty cells', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A', 'B', 'C'])
      builder.addRow(['1'])
      const lines = builder.build().split('\n')
      expect(lines[2]).toBe('| 1 |  |  |')
    })
  })

  // ─── addRows ───

  describe('addRows', () => {
    it('adds multiple rows at once', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['X'])
      builder.addRows([['a'], ['b'], ['c']])
      const lines = builder.build().split('\n')
      expect(lines).toHaveLength(5) // header + separator + 3 rows
    })

    it('handles empty array', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['X'])
      builder.addRows([])
      const lines = builder.build().split('\n')
      expect(lines).toHaveLength(2) // header + separator only
    })
  })

  // ─── build ───

  describe('build', () => {
    it('returns empty string without headers', () => {
      const builder = new TableBuilder()
      builder.addRow(['data'])
      expect(builder.build()).toBe('')
    })

    it('produces valid markdown table structure', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Name', 'Count'])
      builder.addRow(['foo', '10'])
      builder.addRow(['bar', '20'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines).toHaveLength(4)
      expect(lines[0]).toBe('| Name | Count |')
      expect(lines[1]).toContain('|')
      expect(lines[2]).toBe('| foo | 10 |')
      expect(lines[3]).toBe('| bar | 20 |')
    })

    it('handles special characters in cells', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Text'])
      builder.addRow(['hello <world> & "friends"'])
      const lines = builder.build().split('\n')
      expect(lines[2]).toContain('hello <world>')
    })
  })

  // ─── reset ───

  describe('reset', () => {
    it('clears headers and rows', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A'])
      builder.addRow(['x'])
      builder.reset()
      expect(builder.build()).toBe('')
    })

    it('allows rebuilding after reset', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Old'])
      builder.addRow(['old-data'])
      builder.reset()
      builder.setHeaders(['New'])
      builder.addRow(['new-data'])
      const result = builder.build()
      expect(result).toContain('New')
      expect(result).toContain('new-data')
      expect(result).not.toContain('Old')
    })
  })

  // ─── fromConfig ───

  describe('fromConfig', () => {
    it('builds table from config object', () => {
      const result = TableBuilder.fromConfig({
        headers: ['Rule', 'Severity'],
        rows: [['no-eval', 'error'], ['no-debugger', 'warning']],
        alignment: ['left', 'right'],
      })
      expect(result).toContain('| Rule | Severity |')
      expect(result).toContain('---:')
      expect(result).toContain('| no-eval | error |')
    })

    it('handles empty rows', () => {
      const result = TableBuilder.fromConfig({
        headers: ['A'],
        rows: [],
        alignment: ['left'],
      })
      const lines = result.split('\n')
      expect(lines).toHaveLength(2) // header + separator
    })
  })
})
