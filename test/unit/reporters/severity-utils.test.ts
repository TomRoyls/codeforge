import { describe, it, expect } from 'vitest'
import {
  SEVERITY_ICONS,
  SEVERITY_COLORS,
  SEVERITY_PRIORITY,
  getSeverityIcon,
  getSeverityColor,
  compareSeverity,
} from '../../../src/reporters/severity-utils.js'
import type { Severity } from '../../../src/reporters/types.js'

describe('severity-utils', () => {
  describe('SEVERITY_ICONS', () => {
    it('should have icons for all severity levels', () => {
      expect(SEVERITY_ICONS).toHaveProperty('error')
      expect(SEVERITY_ICONS).toHaveProperty('warning')
      expect(SEVERITY_ICONS).toHaveProperty('info')
    })

    it('should have correct error icon', () => {
      expect(SEVERITY_ICONS.error).toBe('✖')
    })

    it('should have correct warning icon', () => {
      expect(SEVERITY_ICONS.warning).toBe('⚠')
    })

    it('should have correct info icon', () => {
      expect(SEVERITY_ICONS.info).toBe('ℹ')
    })
  })

  describe('SEVERITY_COLORS', () => {
    it('should have colors for all severity levels', () => {
      expect(SEVERITY_COLORS).toHaveProperty('error')
      expect(SEVERITY_COLORS).toHaveProperty('warning')
      expect(SEVERITY_COLORS).toHaveProperty('info')
    })

    it('should have hex color format for error', () => {
      expect(SEVERITY_COLORS.error).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('should have hex color format for warning', () => {
      expect(SEVERITY_COLORS.warning).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('should have hex color format for info', () => {
      expect(SEVERITY_COLORS.info).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('SEVERITY_PRIORITY', () => {
    it('should have priority for all severity levels', () => {
      expect(SEVERITY_PRIORITY).toHaveProperty('error')
      expect(SEVERITY_PRIORITY).toHaveProperty('warning')
      expect(SEVERITY_PRIORITY).toHaveProperty('info')
    })

    it('should have error as highest priority', () => {
      expect(SEVERITY_PRIORITY.error).toBeGreaterThan(SEVERITY_PRIORITY.warning)
      expect(SEVERITY_PRIORITY.error).toBeGreaterThan(SEVERITY_PRIORITY.info)
    })

    it('should have warning as medium priority', () => {
      expect(SEVERITY_PRIORITY.warning).toBeGreaterThan(SEVERITY_PRIORITY.info)
      expect(SEVERITY_PRIORITY.warning).toBeLessThan(SEVERITY_PRIORITY.error)
    })

    it('should have info as lowest priority', () => {
      expect(SEVERITY_PRIORITY.info).toBeLessThan(SEVERITY_PRIORITY.warning)
      expect(SEVERITY_PRIORITY.info).toBeLessThan(SEVERITY_PRIORITY.error)
    })
  })

  describe('getSeverityIcon', () => {
    it('should return correct icon for error', () => {
      expect(getSeverityIcon('error')).toBe('✖')
    })

    it('should return correct icon for warning', () => {
      expect(getSeverityIcon('warning')).toBe('⚠')
    })

    it('should return correct icon for info', () => {
      expect(getSeverityIcon('info')).toBe('ℹ')
    })

    it('should return same value as SEVERITY_ICONS lookup', () => {
      const severities: Severity[] = ['error', 'warning', 'info']
      for (const severity of severities) {
        expect(getSeverityIcon(severity)).toBe(SEVERITY_ICONS[severity])
      }
    })
  })

  describe('getSeverityColor', () => {
    it('should return correct color for error', () => {
      expect(getSeverityColor('error')).toBe('#ff6b6b')
    })

    it('should return correct color for warning', () => {
      expect(getSeverityColor('warning')).toBe('#ffd93d')
    })

    it('should return correct color for info', () => {
      expect(getSeverityColor('info')).toBe('#6bcfff')
    })

    it('should return same value as SEVERITY_COLORS lookup', () => {
      const severities: Severity[] = ['error', 'warning', 'info']
      for (const severity of severities) {
        expect(getSeverityColor(severity)).toBe(SEVERITY_COLORS[severity])
      }
    })
  })

  describe('compareSeverity', () => {
    it('should return positive when b has higher priority than a', () => {
      // error (3) vs info (1): 1 - 3 = -2 (b is higher)
      expect(compareSeverity('info', 'error')).toBeGreaterThan(0)
    })

    it('should return negative when a has higher priority than b', () => {
      // error (3) vs info (1): 1 - 3 = -2
      expect(compareSeverity('error', 'info')).toBeLessThan(0)
    })

    it('should return zero when severities are equal', () => {
      expect(compareSeverity('error', 'error')).toBe(0)
      expect(compareSeverity('warning', 'warning')).toBe(0)
      expect(compareSeverity('info', 'info')).toBe(0)
    })

    it('should correctly order: error > warning > info', () => {
      // Sorting [info, error, warning] should give [error, warning, info]
      const severities: Severity[] = ['info', 'error', 'warning']
      const sorted = [...severities].sort(compareSeverity)
      expect(sorted).toEqual(['error', 'warning', 'info'])
    })

    it('should be usable for descending sort by priority', () => {
      const severities: Severity[] = ['info', 'warning', 'error', 'warning', 'info']
      const sorted = [...severities].sort(compareSeverity)
      expect(sorted).toEqual(['error', 'warning', 'warning', 'info', 'info'])
    })
  })
})
