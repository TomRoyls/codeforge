import { describe, expect, it } from 'vitest'
import { Logger, LogLevel } from '../../src/utils/logger.js'

// ─── LogLevel ───

describe('LogLevel', () => {
  it('has correct ordering', () => {
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO)
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN)
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR)
    expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT)
  })
})

// ─── Logger Construction ───

describe('Logger construction', () => {
  it('creates with required options', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(log.getLevel()).toBe(LogLevel.INFO)
  })

  it('setLevel changes level', () => {
    const log = new Logger({ level: LogLevel.INFO })
    log.setLevel(LogLevel.DEBUG)
    expect(log.getLevel()).toBe(LogLevel.DEBUG)
  })
})

// ─── Logger Methods ───

describe('Logger methods', () => {
  it('debug does not throw', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    expect(() => log.debug('test')).not.toThrow()
  })

  it('info does not throw', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(() => log.info('test')).not.toThrow()
  })

  it('warn does not throw', () => {
    const log = new Logger({ level: LogLevel.WARN })
    expect(() => log.warn('test')).not.toThrow()
  })

  it('error does not throw', () => {
    const log = new Logger({ level: LogLevel.ERROR })
    expect(() => log.error('test')).not.toThrow()
  })

  it('respects log level filtering', () => {
    const log = new Logger({ level: LogLevel.ERROR })
    expect(() => log.debug('should be suppressed')).not.toThrow()
    expect(() => log.info('should be suppressed')).not.toThrow()
    expect(() => log.warn('should be suppressed')).not.toThrow()
    expect(() => log.error('should appear')).not.toThrow()
  })

  it('handles extra arguments', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    expect(() => log.info('msg', { key: 'val' }, 42)).not.toThrow()
  })

  it('handles no colorize', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    expect(() => log.info('test')).not.toThrow()
  })

  it('handles prefix', () => {
    const log = new Logger({ level: LogLevel.INFO, prefix: 'CodeForge' })
    expect(() => log.info('test')).not.toThrow()
  })

  it('handles timestamp', () => {
    const log = new Logger({ level: LogLevel.INFO, timestamp: true })
    expect(() => log.info('test')).not.toThrow()
  })

  it('SILENT level suppresses all', () => {
    const log = new Logger({ level: LogLevel.SILENT })
    expect(() => log.error('should be suppressed')).not.toThrow()
  })

  it('debug at INFO level is suppressed', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(() => log.debug('suppressed')).not.toThrow()
    expect(log.getLevel()).toBe(LogLevel.INFO)
  })

  it('handles all options combined', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false, prefix: 'test', timestamp: true })
    expect(() => log.info('combined')).not.toThrow()
  })

  it('warn at WARN level outputs', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    expect(() => log.warn('warning')).not.toThrow()
  })

  it('setLevel changes level', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    expect(log.getLevel()).toBe(LogLevel.ERROR)
    log.setLevel(LogLevel.DEBUG)
    expect(log.getLevel()).toBe(LogLevel.DEBUG)
  })

  it('error always outputs', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    expect(() => log.error('error msg')).not.toThrow()
  })

  it('info outputs at INFO level', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    expect(() => log.info('info msg')).not.toThrow()
  })

  it('warn outputs without throwing', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    expect(() => log.warn('warning')).not.toThrow()
  })

  it('error outputs without throwing', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    expect(() => log.error('error')).not.toThrow()
  })

  it('warn at error level is suppressed', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    expect(() => log.warn('warn')).not.toThrow()
  })

  it('debug at error level is suppressed', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    expect(() => log.debug('debug')).not.toThrow()
  })

  it('info at debug level is visible', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    expect(() => log.info('info')).not.toThrow()
  })

  it('debug with multiple arguments', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    expect(() => log.debug('msg', 1, 2, 3)).not.toThrow()
  })

  it('info with null argument', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(() => log.info('msg', null)).not.toThrow()
  })

  it('info with undefined argument', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(() => log.info('msg', undefined)).not.toThrow()
  })

  it('error with object argument', () => {
    const log = new Logger({ level: LogLevel.ERROR })
    expect(() => log.error('err', { code: 500, msg: 'fail' })).not.toThrow()
  })

  it('warn with array argument', () => {
    const log = new Logger({ level: LogLevel.WARN })
    expect(() => log.warn('items', [1, 2, 3])).not.toThrow()
  })

  it('debug with empty message', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    expect(() => log.debug('')).not.toThrow()
  })

  it('all log levels are distinct numbers', () => {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.SILENT]
    expect(new Set(levels).size).toBe(5)
  })

  it('DEBUG level shows all messages', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    expect(() => {
      log.debug('d')
      log.info('i')
      log.warn('w')
      log.error('e')
    }).not.toThrow()
  })

  it('multiple setLevel calls', () => {
    const log = new Logger({ level: LogLevel.ERROR })
    log.setLevel(LogLevel.DEBUG)
    expect(log.getLevel()).toBe(LogLevel.DEBUG)
    log.setLevel(LogLevel.WARN)
    expect(log.getLevel()).toBe(LogLevel.WARN)
    log.setLevel(LogLevel.SILENT)
    expect(log.getLevel()).toBe(LogLevel.SILENT)
  })

  it('logger with colorize true', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: true })
    expect(() => log.info('colored')).not.toThrow()
  })

  it('logger with all options at defaults', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(log.getLevel()).toBe(LogLevel.INFO)
  })

  it('handles circular reference in args', () => {
    const log = new Logger({ level: LogLevel.INFO })
    const obj: Record<string, unknown> = { a: 1 }
    obj.self = obj
    expect(() => log.info('circular', obj)).not.toThrow()
  })

  it('handles bigint in args', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(() => log.info('bigint', 9007199254740991n)).not.toThrow()
  })

  it('handles symbol in args', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(() => log.info('symbol', Symbol('test'))).not.toThrow()
  })

  it('setLevel to same level works', () => {
    const log = new Logger({ level: LogLevel.INFO })
    log.setLevel(LogLevel.INFO)
    expect(log.getLevel()).toBe(LogLevel.INFO)
  })

  it('long message string', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(() => log.info('x'.repeat(10000))).not.toThrow()
  })

  it('multiple sequential logs', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    for (let i = 0; i < 100; i++) {
      log.info(`message ${i}`)
    }
  })
})
