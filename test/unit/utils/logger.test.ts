import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { Logger, LogLevel, logger } from '../../../src/utils/logger'

describe('LogLevel enum', () => {
  test('has correct values', () => {
    expect(LogLevel.DEBUG).toBe(0)
    expect(LogLevel.INFO).toBe(1)
    expect(LogLevel.WARN).toBe(2)
    expect(LogLevel.ERROR).toBe(3)
    expect(LogLevel.SILENT).toBe(4)
  })
})

describe('Logger', () => {
  let testLogger: Logger
  let spies: Array<ReturnType<typeof vi.spyOn>> = []

  beforeEach(() => {
    testLogger = new Logger({ level: LogLevel.DEBUG, colorize: false })
    spies = [
      vi.spyOn(console, 'log').mockImplementation(() => {}),
      vi.spyOn(console, 'warn').mockImplementation(() => {}),
      vi.spyOn(console, 'error').mockImplementation(() => {}),
    ]
  })

  afterEach(() => {
    spies.forEach((spy) => spy.mockRestore())
  })

  test('log level filtering - DEBUG at INFO level', () => {
    testLogger.setLevel(LogLevel.INFO)
    testLogger.debug('debug')
    expect(spies[0]).not.toHaveBeenCalled()
  })

  test('log level filtering - INFO at INFO level', () => {
    testLogger.setLevel(LogLevel.INFO)
    testLogger.info('info')
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('log level filtering - all at DEBUG level', () => {
    testLogger.setLevel(LogLevel.DEBUG)
    testLogger.debug('debug')
    testLogger.info('info')
    testLogger.warn('warn')
    testLogger.error('error')
    expect(spies[0].mock.calls.length).toBeGreaterThan(0)
    expect(spies[1].mock.calls.length).toBeGreaterThan(0)
    expect(spies[2].mock.calls.length).toBeGreaterThan(0)
  })

  test('SILENT level stops all logging', () => {
    testLogger.setLevel(LogLevel.SILENT)
    testLogger.debug('debug')
    testLogger.info('info')
    testLogger.error('error')
    expect(spies.every((s) => s.mock.calls.length === 0)).toBe(true)
  })

  test('includes timestamp when enabled', () => {
    testLogger = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    testLogger.info('message')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('excludes timestamp when disabled', () => {
    testLogger = new Logger({ level: LogLevel.INFO, timestamp: false, colorize: false })
    testLogger.info('message')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).not.toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('includes prefix when set', () => {
    testLogger = new Logger({ level: LogLevel.INFO, prefix: '[TEST]', colorize: false })
    testLogger.info('message')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).toContain('[TEST]')
  })

  test('uses ANSI color codes when colorize enabled', () => {
    testLogger = new Logger({ level: LogLevel.INFO, colorize: true })
    testLogger.info('message')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).toContain('\x1b[')
  })

  test('handles additional arguments', () => {
    testLogger.info('message', 'arg1', 123)
    expect(spies[0]).toHaveBeenCalled()
  })

  test('handles objects', () => {
    testLogger.info('message', { key: 'value' })
    expect(spies[0]).toHaveBeenCalled()
  })

  test('handles circular references', () => {
    const circular: Record<string, unknown> = { name: 'test' }
    circular.self = circular
    testLogger.info('message', circular)
    expect(spies[0]).toHaveBeenCalled()
  })

  test('handles primitive values in args', () => {
    testLogger.info('message', 123, true, null, undefined)
    expect(spies[0]).toHaveBeenCalled()
  })

  test('handles string arguments', () => {
    testLogger.info('message', 'string arg')
    expect(spies[0]).toHaveBeenCalled()
  })

  test('setLevel changes level', () => {
    testLogger.setLevel(LogLevel.WARN)
    expect(testLogger.getLevel()).toBe(LogLevel.WARN)
  })
})

describe('default logger', () => {
  test('is Logger instance', () => {
    expect(logger).toBeInstanceOf(Logger)
  })

  test('has INFO level', () => {
    expect(logger.getLevel()).toBe(LogLevel.INFO)
  })
})
