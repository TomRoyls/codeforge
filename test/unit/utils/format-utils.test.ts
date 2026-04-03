import { describe, test, expect } from 'vitest'
import { formatTime, formatPercentage } from '../../../src/utils/format-utils'

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
})
