import { describe, test, expect } from 'vitest'
import {
  formatTime,
  formatNumber,
  formatPercentage,
  pluralize,
} from '../../../src/utils/format-utils'

describe('format-utils', () => {
  describe('formatTime', () => {
    test('should format milliseconds less than 1000', () => {
      expect(formatTime(0)).toBe('0ms')
      expect(formatTime(100)).toBe('100ms')
      expect(formatTime(500)).toBe('500ms')
      expect(formatTime(999)).toBe('999ms')
    })

    test('should format milliseconds as seconds when >= 1000', () => {
      expect(formatTime(1000)).toBe('1.00s')
      expect(formatTime(1500)).toBe('1.50s')
      expect(formatTime(1234)).toBe('1.23s')
      expect(formatTime(60000)).toBe('60.00s')
    })
  })

  describe('formatNumber', () => {
    test('should format numbers with locale separators', () => {
      const result = formatNumber(1000)
      expect(result).toMatch(/1[,.]000/)
    })

    test('should handle small numbers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(100)).toBe('100')
    })

    test('should handle large numbers', () => {
      const result = formatNumber(1000000)
      expect(result).toMatch(/1[,.]000[,.]000/)
    })
  })

  describe('formatPercentage', () => {
    test('should format percentage with default decimals', () => {
      expect(formatPercentage(50)).toBe('50.0%')
      expect(formatPercentage(33.333)).toBe('33.3%')
      expect(formatPercentage(100)).toBe('100.0%')
    })

    test('should format percentage with custom decimals', () => {
      expect(formatPercentage(33.333, 2)).toBe('33.33%')
      expect(formatPercentage(50, 0)).toBe('50%')
      expect(formatPercentage(99.999, 3)).toBe('99.999%')
    })
  })

  describe('pluralize', () => {
    test('should return singular for count of 1', () => {
      expect(pluralize(1, 'file')).toBe('file')
      expect(pluralize(1, 'error')).toBe('error')
    })

    test('should return plural for count other than 1', () => {
      expect(pluralize(0, 'file')).toBe('files')
      expect(pluralize(2, 'file')).toBe('files')
      expect(pluralize(10, 'file')).toBe('files')
    })

    test('should use custom plural form when provided', () => {
      expect(pluralize(2, 'person', 'people')).toBe('people')
      expect(pluralize(2, 'child', 'children')).toBe('children')
      expect(pluralize(1, 'person', 'people')).toBe('person')
    })
  })
})
