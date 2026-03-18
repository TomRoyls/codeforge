import { describe, test, expect } from 'vitest'
import { extractRuleOptions } from '../../../src/utils/options-helpers.js'

describe('extractRuleOptions', () => {
  const defaultOptions = {
    enabled: true,
    threshold: 10,
    message: 'default message',
  }

  test('should return default value when rawOptions is undefined', () => {
    const result = extractRuleOptions(undefined, defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when rawOptions is null', () => {
    const result = extractRuleOptions(null, defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when rawOptions is not an array', () => {
    const result = extractRuleOptions({ enabled: false }, defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when rawOptions is empty array', () => {
    const result = extractRuleOptions([], defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when first element is not an object', () => {
    const result = extractRuleOptions(['string'], defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should merge provided options with defaults', () => {
    const result = extractRuleOptions([{ threshold: 20 }], defaultOptions)
    expect(result).toEqual({
      enabled: true,
      threshold: 20,
      message: 'default message',
    })
  })

  test('should override all default options', () => {
    const customOptions = {
      enabled: false,
      threshold: 5,
      message: 'custom message',
    }
    const result = extractRuleOptions([customOptions], defaultOptions)
    expect(result).toEqual(customOptions)
  })

  test('should handle partial options', () => {
    const result = extractRuleOptions([{ enabled: false }], defaultOptions)
    expect(result).toEqual({
      enabled: false,
      threshold: 10,
      message: 'default message',
    })
  })

  test('should add new properties not in defaults', () => {
    const result = extractRuleOptions([{ extraProp: 'value' }], defaultOptions)
    expect(result).toEqual({
      enabled: true,
      threshold: 10,
      message: 'default message',
      extraProp: 'value',
    })
  })
})
