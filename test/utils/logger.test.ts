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
})
