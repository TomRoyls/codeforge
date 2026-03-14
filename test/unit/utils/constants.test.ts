import { describe, test, expect } from 'vitest'
import {
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_MAX_LINES,
  DEFAULT_MAX_FILE_SIZE_LINES,
  FILE_COUNT_THRESHOLD,
} from '../../../src/utils/constants.js'

describe('constants', () => {
  describe('DEFAULT_DEBOUNCE_MS', () => {
    test('should be defined', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_DEBOUNCE_MS).toBe('number')
    })

    test('should be 300 milliseconds', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBe(300)
    })

    test('should be positive', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_MAX_LINES', () => {
    test('should be defined', () => {
      expect(DEFAULT_MAX_LINES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_MAX_LINES).toBe('number')
    })

    test('should be 300 lines', () => {
      expect(DEFAULT_MAX_LINES).toBe(300)
    })

    test('should be positive', () => {
      expect(DEFAULT_MAX_LINES).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_MAX_FILE_SIZE_LINES', () => {
    test('should be defined', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_MAX_FILE_SIZE_LINES).toBe('number')
    })

    test('should be 500 lines', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBe(500)
    })

    test('should be greater than DEFAULT_MAX_LINES', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBeGreaterThan(DEFAULT_MAX_LINES)
    })

    test('should be positive', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBeGreaterThan(0)
    })
  })

  describe('FILE_COUNT_THRESHOLD', () => {
    test('should be defined', () => {
      expect(FILE_COUNT_THRESHOLD).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof FILE_COUNT_THRESHOLD).toBe('number')
    })

    test('should be 1000 files', () => {
      expect(FILE_COUNT_THRESHOLD).toBe(1000)
    })

    test('should be positive', () => {
      expect(FILE_COUNT_THRESHOLD).toBeGreaterThan(0)
    })
  })
})
