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

const ALL_SEVERITIES: Severity[] = ['error', 'warning', 'info']

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

    it('should have exactly 3 keys', () => {
      expect(Object.keys(SEVERITY_ICONS)).toHaveLength(3)
    })

    it('should have keys matching severity type values', () => {
      const keys = Object.keys(SEVERITY_ICONS).sort()
      expect(keys).toEqual(['error', 'info', 'warning'])
    })

    it('should have all string values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_ICONS[key]).toBe('string')
      }
    })

    it('should have all non-empty values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_ICONS[key].length).toBeGreaterThan(0)
      }
    })

    it('should have unique icon values', () => {
      const values = Object.values(SEVERITY_ICONS)
      const unique = new Set(values)
      expect(unique.size).toBe(values.length)
    })

    it('should have single character icons', () => {
      for (const key of ALL_SEVERITIES) {
        expect([...SEVERITY_ICONS[key]].length).toBe(1)
      }
    })

    it('should be a plain object', () => {
      expect(SEVERITY_ICONS).toBeTypeOf('object')
      expect(SEVERITY_ICONS).not.toBeNull()
      expect(Array.isArray(SEVERITY_ICONS)).toBe(false)
    })

    it('should be an object not an array', () => {
      expect(Array.isArray(SEVERITY_ICONS)).toBe(false)
    })

    it('should have enumerable own properties', () => {
      const keys = Object.keys(SEVERITY_ICONS)
      expect(keys).toContain('error')
      expect(keys).toContain('warning')
      expect(keys).toContain('info')
    })

    it('should not have prototype properties', () => {
      const ownKeys = Object.getOwnPropertyNames(SEVERITY_ICONS)
      expect(ownKeys).toHaveLength(3)
    })

    it('should have error icon that is the heavy multiplication x character', () => {
      expect(SEVERITY_ICONS.error).toBe('\u2716')
    })

    it('should have warning icon that is the warning sign character', () => {
      expect(SEVERITY_ICONS.warning).toBe('\u26A0')
    })

    it('should have info icon that is the circled latin small letter i character', () => {
      expect(SEVERITY_ICONS.info).toBe('\u2139')
    })

    it('should not have undefined values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_ICONS[key]).toBeDefined()
      }
    })

    it('should not have null values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_ICONS[key]).not.toBeNull()
      }
    })

    it('should be indexable by each severity', () => {
      for (const severity of ALL_SEVERITIES) {
        const icon: string = SEVERITY_ICONS[severity]
        expect(icon).toBeTruthy()
      }
    })

    it('should return same reference on repeated access', () => {
      const first = SEVERITY_ICONS.error
      const second = SEVERITY_ICONS.error
      expect(first).toBe(second)
    })

    it('should have values that are not numbers', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_ICONS[key]).not.toBe('number')
      }
    })

    it('should have values that are not booleans', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_ICONS[key]).not.toBe('boolean')
      }
    })

    it('should have values that are not objects', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_ICONS[key]).not.toBe('object')
      }
    })

    it('should have distinct error icon from warning icon', () => {
      expect(SEVERITY_ICONS.error).not.toBe(SEVERITY_ICONS.warning)
    })

    it('should have distinct error icon from info icon', () => {
      expect(SEVERITY_ICONS.error).not.toBe(SEVERITY_ICONS.info)
    })

    it('should have distinct warning icon from info icon', () => {
      expect(SEVERITY_ICONS.warning).not.toBe(SEVERITY_ICONS.info)
    })

    it('should be usable in Object.entries iteration', () => {
      const entries = Object.entries(SEVERITY_ICONS)
      expect(entries).toHaveLength(3)
      for (const [key, value] of entries) {
        expect(typeof key).toBe('string')
        expect(typeof value).toBe('string')
      }
    })

    it('should have correct values via Object.values', () => {
      const values = Object.values(SEVERITY_ICONS)
      expect(values).toContain('✖')
      expect(values).toContain('⚠')
      expect(values).toContain('ℹ')
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

    it('should have exactly 3 keys', () => {
      expect(Object.keys(SEVERITY_COLORS)).toHaveLength(3)
    })

    it('should have correct error color', () => {
      expect(SEVERITY_COLORS.error).toBe('#ff6b6b')
    })

    it('should have correct warning color', () => {
      expect(SEVERITY_COLORS.warning).toBe('#ffd93d')
    })

    it('should have correct info color', () => {
      expect(SEVERITY_COLORS.info).toBe('#6bcfff')
    })

    it('should have all string values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_COLORS[key]).toBe('string')
      }
    })

    it('should have all non-empty values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_COLORS[key].length).toBeGreaterThan(0)
      }
    })

    it('should have unique color values', () => {
      const values = Object.values(SEVERITY_COLORS)
      const unique = new Set(values)
      expect(unique.size).toBe(values.length)
    })

    it('should be a plain object', () => {
      expect(SEVERITY_COLORS).toBeTypeOf('object')
      expect(SEVERITY_COLORS).not.toBeNull()
      expect(Array.isArray(SEVERITY_COLORS)).toBe(false)
    })

    it('should have keys matching severity type values', () => {
      const keys = Object.keys(SEVERITY_COLORS).sort()
      expect(keys).toEqual(['error', 'info', 'warning'])
    })

    it('should have all colors starting with hash', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_COLORS[key].startsWith('#')).toBe(true)
      }
    })

    it('should have all colors be 7 characters long', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_COLORS[key]).toHaveLength(7)
      }
    })

    it('should have distinct error color from warning color', () => {
      expect(SEVERITY_COLORS.error).not.toBe(SEVERITY_COLORS.warning)
    })

    it('should have distinct error color from info color', () => {
      expect(SEVERITY_COLORS.error).not.toBe(SEVERITY_COLORS.info)
    })

    it('should have distinct warning color from info color', () => {
      expect(SEVERITY_COLORS.warning).not.toBe(SEVERITY_COLORS.info)
    })

    it('should not have undefined values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_COLORS[key]).toBeDefined()
      }
    })

    it('should not have null values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_COLORS[key]).not.toBeNull()
      }
    })

    it('should be indexable by each severity', () => {
      for (const severity of ALL_SEVERITIES) {
        const color: string = SEVERITY_COLORS[severity]
        expect(color).toBeTruthy()
      }
    })

    it('should have error color with red component dominant', () => {
      const redHex = SEVERITY_COLORS.error.slice(1, 3)
      const red = parseInt(redHex, 16)
      expect(red).toBeGreaterThan(200)
    })

    it('should have warning color with green and red components', () => {
      const redHex = SEVERITY_COLORS.warning.slice(1, 3)
      const greenHex = SEVERITY_COLORS.warning.slice(3, 5)
      const red = parseInt(redHex, 16)
      const green = parseInt(greenHex, 16)
      expect(red).toBeGreaterThan(200)
      expect(green).toBeGreaterThan(200)
    })

    it('should have info color with blue component dominant', () => {
      const blueHex = SEVERITY_COLORS.info.slice(5, 7)
      const blue = parseInt(blueHex, 16)
      expect(blue).toBeGreaterThan(200)
    })

    it('should have colors that are valid hex strings', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_COLORS[key]).toMatch(/^#[0-9a-fA-F]{6}$/)
      }
    })

    it('should return same reference on repeated access', () => {
      const first = SEVERITY_COLORS.error
      const second = SEVERITY_COLORS.error
      expect(first).toBe(second)
    })

    it('should be usable in Object.entries iteration', () => {
      const entries = Object.entries(SEVERITY_COLORS)
      expect(entries).toHaveLength(3)
      for (const [key, value] of entries) {
        expect(typeof key).toBe('string')
        expect(value).toMatch(/^#[0-9a-f]{6}$/i)
      }
    })

    it('should have values that are not numbers', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_COLORS[key]).not.toBe('number')
      }
    })

    it('should have values that are not booleans', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_COLORS[key]).not.toBe('boolean')
      }
    })

    it('should have values that are not objects', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_COLORS[key]).not.toBe('object')
      }
    })

    it('should not have prototype properties', () => {
      const ownKeys = Object.getOwnPropertyNames(SEVERITY_COLORS)
      expect(ownKeys).toHaveLength(3)
    })

    it('should have correct values via Object.values', () => {
      const values = Object.values(SEVERITY_COLORS)
      expect(values).toContain('#ff6b6b')
      expect(values).toContain('#ffd93d')
      expect(values).toContain('#6bcfff')
    })

    it('should have error color lowercased', () => {
      expect(SEVERITY_COLORS.error).toBe(SEVERITY_COLORS.error.toLowerCase())
    })

    it('should have warning color lowercased', () => {
      expect(SEVERITY_COLORS.warning).toBe(SEVERITY_COLORS.warning.toLowerCase())
    })

    it('should have info color lowercased', () => {
      expect(SEVERITY_COLORS.info).toBe(SEVERITY_COLORS.info.toLowerCase())
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

    it('should have exactly 3 keys', () => {
      expect(Object.keys(SEVERITY_PRIORITY)).toHaveLength(3)
    })

    it('should have error priority equal to 3', () => {
      expect(SEVERITY_PRIORITY.error).toBe(3)
    })

    it('should have warning priority equal to 2', () => {
      expect(SEVERITY_PRIORITY.warning).toBe(2)
    })

    it('should have info priority equal to 1', () => {
      expect(SEVERITY_PRIORITY.info).toBe(1)
    })

    it('should have all number values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_PRIORITY[key]).toBe('number')
      }
    })

    it('should have all positive priority values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_PRIORITY[key]).toBeGreaterThan(0)
      }
    })

    it('should have all integer priority values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(Number.isInteger(SEVERITY_PRIORITY[key])).toBe(true)
      }
    })

    it('should have all finite priority values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(Number.isFinite(SEVERITY_PRIORITY[key])).toBe(true)
      }
    })

    it('should have unique priority values', () => {
      const values = Object.values(SEVERITY_PRIORITY)
      const unique = new Set(values)
      expect(unique.size).toBe(values.length)
    })

    it('should be a plain object', () => {
      expect(SEVERITY_PRIORITY).toBeTypeOf('object')
      expect(SEVERITY_PRIORITY).not.toBeNull()
      expect(Array.isArray(SEVERITY_PRIORITY)).toBe(false)
    })

    it('should have keys matching severity type values', () => {
      const keys = Object.keys(SEVERITY_PRIORITY).sort()
      expect(keys).toEqual(['error', 'info', 'warning'])
    })

    it('should not have undefined values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_PRIORITY[key]).toBeDefined()
      }
    })

    it('should not have null values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_PRIORITY[key]).not.toBeNull()
      }
    })

    it('should be indexable by each severity', () => {
      for (const severity of ALL_SEVERITIES) {
        const priority: number = SEVERITY_PRIORITY[severity]
        expect(priority).toBeGreaterThan(0)
      }
    })

    it('should have distinct error priority from warning priority', () => {
      expect(SEVERITY_PRIORITY.error).not.toBe(SEVERITY_PRIORITY.warning)
    })

    it('should have distinct error priority from info priority', () => {
      expect(SEVERITY_PRIORITY.error).not.toBe(SEVERITY_PRIORITY.info)
    })

    it('should have distinct warning priority from info priority', () => {
      expect(SEVERITY_PRIORITY.warning).not.toBe(SEVERITY_PRIORITY.info)
    })

    it('should have priority sum of 6', () => {
      const sum = Object.values(SEVERITY_PRIORITY).reduce((a, b) => a + b, 0)
      expect(sum).toBe(6)
    })

    it('should return same reference on repeated access', () => {
      const first = SEVERITY_PRIORITY.error
      const second = SEVERITY_PRIORITY.error
      expect(first).toBe(second)
    })

    it('should have no NaN values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(Number.isNaN(SEVERITY_PRIORITY[key])).toBe(false)
      }
    })

    it('should have no negative values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_PRIORITY[key]).toBeGreaterThanOrEqual(0)
      }
    })

    it('should have no zero values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_PRIORITY[key]).not.toBe(0)
      }
    })

    it('should have no floating point values', () => {
      for (const key of ALL_SEVERITIES) {
        expect(SEVERITY_PRIORITY[key] % 1).toBe(0)
      }
    })

    it('should be usable in Object.entries iteration', () => {
      const entries = Object.entries(SEVERITY_PRIORITY)
      expect(entries).toHaveLength(3)
      for (const [key, value] of entries) {
        expect(typeof key).toBe('string')
        expect(typeof value).toBe('number')
      }
    })

    it('should have values that are not strings', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_PRIORITY[key]).not.toBe('string')
      }
    })

    it('should have values that are not booleans', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_PRIORITY[key]).not.toBe('boolean')
      }
    })

    it('should have values that are not objects', () => {
      for (const key of ALL_SEVERITIES) {
        expect(typeof SEVERITY_PRIORITY[key]).not.toBe('object')
      }
    })

    it('should have correct values via Object.values', () => {
      const values = Object.values(SEVERITY_PRIORITY)
      expect(values).toContain(3)
      expect(values).toContain(2)
      expect(values).toContain(1)
    })

    it('should not have prototype properties', () => {
      const ownKeys = Object.getOwnPropertyNames(SEVERITY_PRIORITY)
      expect(ownKeys).toHaveLength(3)
    })

    it('should establish total ordering of severities', () => {
      const priorities = ALL_SEVERITIES.map((s) => SEVERITY_PRIORITY[s])
      const sorted = [...priorities].sort((a, b) => b - a)
      expect(sorted[0]).toBe(SEVERITY_PRIORITY.error)
      expect(sorted[1]).toBe(SEVERITY_PRIORITY.warning)
      expect(sorted[2]).toBe(SEVERITY_PRIORITY.info)
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

    it('should return a string for error', () => {
      expect(typeof getSeverityIcon('error')).toBe('string')
    })

    it('should return a string for warning', () => {
      expect(typeof getSeverityIcon('warning')).toBe('string')
    })

    it('should return a string for info', () => {
      expect(typeof getSeverityIcon('info')).toBe('string')
    })

    it('should return a non-empty string for error', () => {
      expect(getSeverityIcon('error').length).toBeGreaterThan(0)
    })

    it('should return a non-empty string for warning', () => {
      expect(getSeverityIcon('warning').length).toBeGreaterThan(0)
    })

    it('should return a non-empty string for info', () => {
      expect(getSeverityIcon('info').length).toBeGreaterThan(0)
    })

    it('should return idempotent results for error', () => {
      expect(getSeverityIcon('error')).toBe(getSeverityIcon('error'))
    })

    it('should return idempotent results for warning', () => {
      expect(getSeverityIcon('warning')).toBe(getSeverityIcon('warning'))
    })

    it('should return idempotent results for info', () => {
      expect(getSeverityIcon('info')).toBe(getSeverityIcon('info'))
    })

    it('should return different icons for error and warning', () => {
      expect(getSeverityIcon('error')).not.toBe(getSeverityIcon('warning'))
    })

    it('should return different icons for error and info', () => {
      expect(getSeverityIcon('error')).not.toBe(getSeverityIcon('info'))
    })

    it('should return different icons for warning and info', () => {
      expect(getSeverityIcon('warning')).not.toBe(getSeverityIcon('info'))
    })

    it('should work for all severities in a loop', () => {
      for (const severity of ALL_SEVERITIES) {
        const icon = getSeverityIcon(severity)
        expect(icon).toBeTruthy()
        expect(typeof icon).toBe('string')
      }
    })

    it('should return single character for each severity', () => {
      for (const severity of ALL_SEVERITIES) {
        const icon = getSeverityIcon(severity)
        expect([...icon].length).toBe(1)
      }
    })

    it('should return results that do not start with #', () => {
      for (const severity of ALL_SEVERITIES) {
        expect(getSeverityIcon(severity).startsWith('#')).toBe(false)
      }
    })

    it('should return results that are not numeric', () => {
      for (const severity of ALL_SEVERITIES) {
        expect(Number.isNaN(Number(getSeverityIcon(severity)))).toBe(true)
      }
    })

    it('should handle variable holding severity value for error', () => {
      const sev: Severity = 'error'
      expect(getSeverityIcon(sev)).toBe('✖')
    })

    it('should handle variable holding severity value for warning', () => {
      const sev: Severity = 'warning'
      expect(getSeverityIcon(sev)).toBe('⚠')
    })

    it('should handle variable holding severity value for info', () => {
      const sev: Severity = 'info'
      expect(getSeverityIcon(sev)).toBe('ℹ')
    })

    it('should return values usable in string concatenation', () => {
      const result = 'Icon: ' + getSeverityIcon('error')
      expect(result).toContain('✖')
    })

    it('should return values usable in template literals', () => {
      const result = `Icon: ${getSeverityIcon('warning')}`
      expect(result).toBe('Icon: ⚠')
    })

    it('should return values usable in array includes check', () => {
      const icons = ALL_SEVERITIES.map(getSeverityIcon)
      expect(icons).toContain('✖')
      expect(icons).toContain('⚠')
      expect(icons).toContain('ℹ')
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

    it('should return a string for error', () => {
      expect(typeof getSeverityColor('error')).toBe('string')
    })

    it('should return a string for warning', () => {
      expect(typeof getSeverityColor('warning')).toBe('string')
    })

    it('should return a string for info', () => {
      expect(typeof getSeverityColor('info')).toBe('string')
    })

    it('should return a non-empty string for error', () => {
      expect(getSeverityColor('error').length).toBeGreaterThan(0)
    })

    it('should return a non-empty string for warning', () => {
      expect(getSeverityColor('warning').length).toBeGreaterThan(0)
    })

    it('should return a non-empty string for info', () => {
      expect(getSeverityColor('info').length).toBeGreaterThan(0)
    })

    it('should return idempotent results for error', () => {
      expect(getSeverityColor('error')).toBe(getSeverityColor('error'))
    })

    it('should return idempotent results for warning', () => {
      expect(getSeverityColor('warning')).toBe(getSeverityColor('warning'))
    })

    it('should return idempotent results for info', () => {
      expect(getSeverityColor('info')).toBe(getSeverityColor('info'))
    })

    it('should return different colors for error and warning', () => {
      expect(getSeverityColor('error')).not.toBe(getSeverityColor('warning'))
    })

    it('should return different colors for error and info', () => {
      expect(getSeverityColor('error')).not.toBe(getSeverityColor('info'))
    })

    it('should return different colors for warning and info', () => {
      expect(getSeverityColor('warning')).not.toBe(getSeverityColor('info'))
    })

    it('should work for all severities in a loop', () => {
      for (const severity of ALL_SEVERITIES) {
        const color = getSeverityColor(severity)
        expect(color).toBeTruthy()
        expect(typeof color).toBe('string')
      }
    })

    it('should return hex format for all severities', () => {
      for (const severity of ALL_SEVERITIES) {
        expect(getSeverityColor(severity)).toMatch(/^#[0-9a-f]{6}$/i)
      }
    })

    it('should return 7 character strings for all severities', () => {
      for (const severity of ALL_SEVERITIES) {
        expect(getSeverityColor(severity)).toHaveLength(7)
      }
    })

    it('should handle variable holding severity value for error', () => {
      const sev: Severity = 'error'
      expect(getSeverityColor(sev)).toBe('#ff6b6b')
    })

    it('should handle variable holding severity value for warning', () => {
      const sev: Severity = 'warning'
      expect(getSeverityColor(sev)).toBe('#ffd93d')
    })

    it('should handle variable holding severity value for info', () => {
      const sev: Severity = 'info'
      expect(getSeverityColor(sev)).toBe('#6bcfff')
    })

    it('should return values usable in string concatenation', () => {
      const result = 'Color: ' + getSeverityColor('error')
      expect(result).toContain('#ff6b6b')
    })

    it('should return values usable in template literals', () => {
      const result = `Color: ${getSeverityColor('warning')}`
      expect(result).toBe('Color: #ffd93d')
    })

    it('should return values usable in array includes check', () => {
      const colors = ALL_SEVERITIES.map(getSeverityColor)
      expect(colors).toContain('#ff6b6b')
      expect(colors).toContain('#ffd93d')
      expect(colors).toContain('#6bcfff')
    })

    it('should return results that start with #', () => {
      for (const severity of ALL_SEVERITIES) {
        expect(getSeverityColor(severity).charAt(0)).toBe('#')
      }
    })

    it('should return results in lowercase hex', () => {
      for (const severity of ALL_SEVERITIES) {
        const color = getSeverityColor(severity)
        expect(color).toBe(color.toLowerCase())
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

    it('should return 0 for error vs error', () => {
      expect(compareSeverity('error', 'error')).toBe(0)
    })

    it('should return negative for error vs warning', () => {
      expect(compareSeverity('error', 'warning')).toBeLessThan(0)
    })

    it('should return negative for error vs info', () => {
      expect(compareSeverity('error', 'info')).toBeLessThan(0)
    })

    it('should return positive for warning vs error', () => {
      expect(compareSeverity('warning', 'error')).toBeGreaterThan(0)
    })

    it('should return 0 for warning vs warning', () => {
      expect(compareSeverity('warning', 'warning')).toBe(0)
    })

    it('should return negative for warning vs info', () => {
      expect(compareSeverity('warning', 'info')).toBeLessThan(0)
    })

    it('should return positive for info vs error', () => {
      expect(compareSeverity('info', 'error')).toBeGreaterThan(0)
    })

    it('should return positive for info vs warning', () => {
      expect(compareSeverity('info', 'warning')).toBeGreaterThan(0)
    })

    it('should return 0 for info vs info', () => {
      expect(compareSeverity('info', 'info')).toBe(0)
    })

    it('should return -1 for error vs warning', () => {
      expect(compareSeverity('error', 'warning')).toBe(-1)
    })

    it('should return -2 for error vs info', () => {
      expect(compareSeverity('error', 'info')).toBe(-2)
    })

    it('should return 1 for warning vs error', () => {
      expect(compareSeverity('warning', 'error')).toBe(1)
    })

    it('should return -1 for warning vs info', () => {
      expect(compareSeverity('warning', 'info')).toBe(-1)
    })

    it('should return 2 for info vs error', () => {
      expect(compareSeverity('info', 'error')).toBe(2)
    })

    it('should return 1 for info vs warning', () => {
      expect(compareSeverity('info', 'warning')).toBe(1)
    })

    it('should satisfy anti-commutativity for error and warning', () => {
      expect(compareSeverity('error', 'warning')).toBe(-compareSeverity('warning', 'error'))
    })

    it('should satisfy anti-commutativity for error and info', () => {
      expect(compareSeverity('error', 'info')).toBe(-compareSeverity('info', 'error'))
    })

    it('should satisfy anti-commutativity for warning and info', () => {
      expect(compareSeverity('warning', 'info')).toBe(-compareSeverity('info', 'warning'))
    })

    it('should return integer values', () => {
      const pairs: [Severity, Severity][] = [
        ['error', 'error'],
        ['error', 'warning'],
        ['error', 'info'],
        ['warning', 'error'],
        ['warning', 'warning'],
        ['warning', 'info'],
        ['info', 'error'],
        ['info', 'warning'],
        ['info', 'info'],
      ]
      for (const [a, b] of pairs) {
        expect(Number.isInteger(compareSeverity(a, b))).toBe(true)
      }
    })

    it('should return consistent results on repeated calls', () => {
      const first = compareSeverity('error', 'warning')
      const second = compareSeverity('error', 'warning')
      expect(first).toBe(second)
    })

    it('should return consistent results for all pairs on repeated calls', () => {
      for (const a of ALL_SEVERITIES) {
        for (const b of ALL_SEVERITIES) {
          expect(compareSeverity(a, b)).toBe(compareSeverity(a, b))
        }
      }
    })

    it('should sort a pre-sorted array without changes', () => {
      const sorted: Severity[] = ['error', 'warning', 'info']
      const result = [...sorted].sort(compareSeverity)
      expect(result).toEqual(sorted)
    })

    it('should sort a reverse-sorted array correctly', () => {
      const reversed: Severity[] = ['info', 'warning', 'error']
      const result = [...reversed].sort(compareSeverity)
      expect(result).toEqual(['error', 'warning', 'info'])
    })

    it('should handle arrays with all same severity', () => {
      const allErrors: Severity[] = ['error', 'error', 'error']
      const result = [...allErrors].sort(compareSeverity)
      expect(result).toEqual(allErrors)
    })

    it('should handle arrays with all same warning severity', () => {
      const allWarnings: Severity[] = ['warning', 'warning', 'warning']
      const result = [...allWarnings].sort(compareSeverity)
      expect(result).toEqual(allWarnings)
    })

    it('should handle arrays with all same info severity', () => {
      const allInfos: Severity[] = ['info', 'info', 'info']
      const result = [...allInfos].sort(compareSeverity)
      expect(result).toEqual(allInfos)
    })

    it('should handle a single element array', () => {
      const single: Severity[] = ['warning']
      const result = [...single].sort(compareSeverity)
      expect(result).toEqual(['warning'])
    })

    it('should handle a two element array already sorted', () => {
      const pair: Severity[] = ['error', 'info']
      const result = [...pair].sort(compareSeverity)
      expect(result).toEqual(['error', 'info'])
    })

    it('should handle a two element array needing sort', () => {
      const pair: Severity[] = ['info', 'error']
      const result = [...pair].sort(compareSeverity)
      expect(result).toEqual(['error', 'info'])
    })

    it('should sort large arrays with many duplicates', () => {
      const arr: Severity[] = [
        'info',
        'error',
        'warning',
        'info',
        'error',
        'warning',
        'info',
        'error',
        'warning',
        'info',
      ]
      const result = [...arr].sort(compareSeverity)
      expect(result).toEqual([
        'error',
        'error',
        'error',
        'warning',
        'warning',
        'warning',
        'info',
        'info',
        'info',
        'info',
      ])
    })

    it('should be deterministic across multiple sorts', () => {
      const arr: Severity[] = ['info', 'error', 'warning', 'info', 'warning']
      const first = [...arr].sort(compareSeverity)
      const second = [...arr].sort(compareSeverity)
      expect(first).toEqual(second)
    })

    it('should return value matching priority difference for error vs warning', () => {
      const expected = SEVERITY_PRIORITY['warning'] - SEVERITY_PRIORITY['error']
      expect(compareSeverity('error', 'warning')).toBe(expected)
    })

    it('should return value matching priority difference for error vs info', () => {
      const expected = SEVERITY_PRIORITY['info'] - SEVERITY_PRIORITY['error']
      expect(compareSeverity('error', 'info')).toBe(expected)
    })

    it('should return value matching priority difference for warning vs info', () => {
      const expected = SEVERITY_PRIORITY['info'] - SEVERITY_PRIORITY['warning']
      expect(compareSeverity('warning', 'info')).toBe(expected)
    })

    it('should satisfy transitivity: if error > warning and warning > info then error > info', () => {
      const ew = compareSeverity('warning', 'error') > 0
      const wi = compareSeverity('info', 'warning') > 0
      const ei = compareSeverity('info', 'error') > 0
      expect(ew).toBe(true)
      expect(wi).toBe(true)
      expect(ei).toBe(true)
    })

    it('should satisfy all 9 equal pairs returning 0', () => {
      for (const s of ALL_SEVERITIES) {
        expect(compareSeverity(s, s)).toBe(0)
      }
    })

    it('should work with severity variables', () => {
      const a: Severity = 'error'
      const b: Severity = 'info'
      expect(compareSeverity(a, b)).toBeLessThan(0)
    })
  })

  describe('cross-function consistency', () => {
    it('should have consistent icons and colors for all severities', () => {
      for (const severity of ALL_SEVERITIES) {
        expect(getSeverityIcon(severity)).toBe(SEVERITY_ICONS[severity])
        expect(getSeverityColor(severity)).toBe(SEVERITY_COLORS[severity])
      }
    })

    it('should have priority values consistent with compareSeverity', () => {
      for (const a of ALL_SEVERITIES) {
        for (const b of ALL_SEVERITIES) {
          const expected = SEVERITY_PRIORITY[b] - SEVERITY_PRIORITY[a]
          expect(compareSeverity(a, b)).toBe(expected)
        }
      }
    })

    it('should have same key sets across all constants', () => {
      const iconKeys = Object.keys(SEVERITY_ICONS).sort()
      const colorKeys = Object.keys(SEVERITY_COLORS).sort()
      const priorityKeys = Object.keys(SEVERITY_PRIORITY).sort()
      expect(iconKeys).toEqual(colorKeys)
      expect(colorKeys).toEqual(priorityKeys)
    })

    it('should sort severities and map to icons in priority order', () => {
      const sorted = [...ALL_SEVERITIES].sort(compareSeverity)
      const icons = sorted.map(getSeverityIcon)
      expect(icons[0]).toBe(SEVERITY_ICONS.error)
      expect(icons[1]).toBe(SEVERITY_ICONS.warning)
      expect(icons[2]).toBe(SEVERITY_ICONS.info)
    })

    it('should sort severities and map to colors in priority order', () => {
      const sorted = [...ALL_SEVERITIES].sort(compareSeverity)
      const colors = sorted.map(getSeverityColor)
      expect(colors[0]).toBe(SEVERITY_COLORS.error)
      expect(colors[1]).toBe(SEVERITY_COLORS.warning)
      expect(colors[2]).toBe(SEVERITY_COLORS.info)
    })

    it('should have all exported constants defined', () => {
      expect(SEVERITY_ICONS).toBeDefined()
      expect(SEVERITY_COLORS).toBeDefined()
      expect(SEVERITY_PRIORITY).toBeDefined()
    })

    it('should have all exported functions defined', () => {
      expect(getSeverityIcon).toBeDefined()
      expect(getSeverityColor).toBeDefined()
      expect(compareSeverity).toBeDefined()
    })

    it('should have all functions be callable', () => {
      expect(typeof getSeverityIcon).toBe('function')
      expect(typeof getSeverityColor).toBe('function')
      expect(typeof compareSeverity).toBe('function')
    })

    it('should map severities through icon and color functions together', () => {
      for (const severity of ALL_SEVERITIES) {
        const icon = getSeverityIcon(severity)
        const color = getSeverityColor(severity)
        expect(icon).toBeTruthy()
        expect(color).toBeTruthy()
        expect(typeof icon).toBe('string')
        expect(typeof color).toBe('string')
      }
    })

    it('should produce stable sorted results when sorted by priority then mapped to icons', () => {
      const first = [...ALL_SEVERITIES].sort(compareSeverity).map(getSeverityIcon)
      const second = [...ALL_SEVERITIES].sort(compareSeverity).map(getSeverityIcon)
      expect(first).toEqual(second)
    })

    it('should produce stable sorted results when sorted by priority then mapped to colors', () => {
      const first = [...ALL_SEVERITIES].sort(compareSeverity).map(getSeverityColor)
      const second = [...ALL_SEVERITIES].sort(compareSeverity).map(getSeverityColor)
      expect(first).toEqual(second)
    })

    it('should have matching severity count across all constants', () => {
      expect(Object.keys(SEVERITY_ICONS).length).toBe(ALL_SEVERITIES.length)
      expect(Object.keys(SEVERITY_COLORS).length).toBe(ALL_SEVERITIES.length)
      expect(Object.keys(SEVERITY_PRIORITY).length).toBe(ALL_SEVERITIES.length)
    })

    it('should allow creating a severity info object with all properties', () => {
      for (const severity of ALL_SEVERITIES) {
        const info = {
          severity,
          icon: getSeverityIcon(severity),
          color: getSeverityColor(severity),
          priority: SEVERITY_PRIORITY[severity],
        }
        expect(info.severity).toBe(severity)
        expect(info.icon).toBe(SEVERITY_ICONS[severity])
        expect(info.color).toBe(SEVERITY_COLORS[severity])
        expect(info.priority).toBe(SEVERITY_PRIORITY[severity])
      }
    })

    it('should allow sorting severity info objects by compareSeverity', () => {
      const items = ALL_SEVERITIES.map((s) => ({
        severity: s,
        icon: getSeverityIcon(s),
        color: getSeverityColor(s),
      }))
      const sorted = [...items].sort((a, b) => compareSeverity(a.severity, b.severity))
      expect(sorted[0].severity).toBe('error')
      expect(sorted[1].severity).toBe('warning')
      expect(sorted[2].severity).toBe('info')
    })

    it('should have consistent number of exports from the module', () => {
      expect(Object.keys(SEVERITY_ICONS)).toHaveLength(3)
      expect(Object.keys(SEVERITY_COLORS)).toHaveLength(3)
      expect(Object.keys(SEVERITY_PRIORITY)).toHaveLength(3)
    })
  })
})
