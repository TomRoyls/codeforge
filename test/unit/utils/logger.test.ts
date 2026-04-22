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

  test('has 5 members', () => {
    const values = Object.values(LogLevel).filter((v) => typeof v === 'number')
    expect(values).toHaveLength(5)
  })

  test('values are ordered ascending', () => {
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO)
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN)
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR)
    expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT)
  })

  test('DEBUG is 0', () => {
    expect(LogLevel.DEBUG).toBe(0)
  })

  test('SILENT is highest', () => {
    expect(LogLevel.SILENT).toBeGreaterThan(LogLevel.ERROR)
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

  test('handles objects that cannot be stringified', () => {
    const unstringifiable = {
      get toJSON() {
        throw new Error('Cannot stringify')
      },
    }
    testLogger.info('message', unstringifiable)
    expect(spies[0]).toHaveBeenCalled()
  })

  test('handles deeply nested circular references', () => {
    const obj: Record<string, unknown> = { level1: { level2: {} } }
    ;(obj.level1 as Record<string, unknown>).level2 = obj
    testLogger.info('message', obj)
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

  test('DEBUG level outputs all levels', () => {
    testLogger.setLevel(LogLevel.DEBUG)
    testLogger.debug('d')
    testLogger.info('i')
    testLogger.warn('w')
    testLogger.error('e')
    const total =
      spies[0].mock.calls.length + spies[1].mock.calls.length + spies[2].mock.calls.length
    expect(total).toBe(4)
  })

  test('WARN level filters DEBUG and INFO', () => {
    testLogger.setLevel(LogLevel.WARN)
    testLogger.debug('d')
    testLogger.info('i')
    testLogger.warn('w')
    testLogger.error('e')
    expect(spies[0]).not.toHaveBeenCalled()
    expect(spies[1]).toHaveBeenCalledTimes(1)
    expect(spies[2]).toHaveBeenCalledTimes(1)
  })

  test('ERROR level only shows errors', () => {
    testLogger.setLevel(LogLevel.ERROR)
    testLogger.debug('d')
    testLogger.info('i')
    testLogger.warn('w')
    testLogger.error('e')
    expect(spies[0]).not.toHaveBeenCalled()
    expect(spies[1]).not.toHaveBeenCalled()
    expect(spies[2]).toHaveBeenCalledTimes(1)
  })

  test('debug uses console.log', () => {
    testLogger.debug('msg')
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('info uses console.log', () => {
    testLogger.info('msg')
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('warn uses console.warn', () => {
    testLogger.warn('msg')
    expect(spies[1]).toHaveBeenCalledTimes(1)
  })

  test('error uses console.error', () => {
    testLogger.error('msg')
    expect(spies[2]).toHaveBeenCalledTimes(1)
  })

  test('no colorize omits ANSI codes', () => {
    testLogger = new Logger({ level: LogLevel.INFO, colorize: false })
    testLogger.info('msg')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).not.toContain('\x1b[')
  })

  test('colorize true adds ANSI codes', () => {
    testLogger = new Logger({ level: LogLevel.INFO, colorize: true })
    testLogger.info('msg')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).toMatch(/\x1b\[/)
  })

  test('empty prefix is omitted from output', () => {
    testLogger = new Logger({ level: LogLevel.INFO, prefix: '', colorize: false })
    testLogger.info('msg')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).not.toContain('undefined')
  })

  test('prefix appears before message', () => {
    testLogger = new Logger({ level: LogLevel.INFO, prefix: 'APP', colorize: false })
    testLogger.info('msg')
    const call = spies[0].mock.calls[0][0] as string
    const prefixIdx = call.indexOf('APP')
    const msgIdx = call.indexOf('msg')
    expect(prefixIdx).toBeLessThan(msgIdx)
  })

  test('timestamp appears before level', () => {
    testLogger = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    testLogger.info('msg')
    const call = spies[0].mock.calls[0][0] as string
    const tsIdx = call.search(/\d{4}-/)
    const levelIdx = call.indexOf('[INFO]')
    expect(tsIdx).toBeLessThan(levelIdx)
  })

  test('level tag contains correct level name', () => {
    testLogger = new Logger({ level: LogLevel.DEBUG, colorize: false })
    testLogger.info('msg')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).toContain('[INFO]')
  })

  test('debug level tag says DEBUG', () => {
    testLogger = new Logger({ level: LogLevel.DEBUG, colorize: false })
    testLogger.debug('msg')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).toContain('[DEBUG]')
  })

  test('warn level tag says WARN', () => {
    testLogger = new Logger({ level: LogLevel.DEBUG, colorize: false })
    testLogger.warn('msg')
    const call = spies[1].mock.calls[0][0] as string
    expect(call).toContain('[WARN]')
  })

  test('error level tag says ERROR', () => {
    testLogger = new Logger({ level: LogLevel.DEBUG, colorize: false })
    testLogger.error('msg')
    const call = spies[2].mock.calls[0][0] as string
    expect(call).toContain('[ERROR]')
  })

  test('default options: no timestamp, colorize true', () => {
    const l = new Logger({ level: LogLevel.INFO })
    l.info('msg')
    expect(spies[0]).toHaveBeenCalled()
  })

  test('getLevel returns initial level', () => {
    const l = new Logger({ level: LogLevel.WARN })
    expect(l.getLevel()).toBe(LogLevel.WARN)
  })

  test('setLevel to DEBUG from WARN', () => {
    testLogger.setLevel(LogLevel.WARN)
    expect(testLogger.getLevel()).toBe(LogLevel.WARN)
    testLogger.setLevel(LogLevel.DEBUG)
    expect(testLogger.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('multiple debug calls all output', () => {
    testLogger.debug('a')
    testLogger.debug('b')
    testLogger.debug('c')
    expect(spies[0]).toHaveBeenCalledTimes(3)
  })

  test('multiple info calls all output', () => {
    testLogger.info('a')
    testLogger.info('b')
    expect(spies[0]).toHaveBeenCalledTimes(2)
  })

  test('handles empty message', () => {
    testLogger.info('')
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles very long message', () => {
    const longMsg = 'x'.repeat(10000)
    testLogger.info(longMsg)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles message with special characters', () => {
    testLogger.info('Hello\nWorld\t"quoted"')
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles message with unicode', () => {
    testLogger.info('日本語 🎉 café')
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles message with emoji', () => {
    testLogger.info('🚀 🎉 ✅ ❌')
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('args are appended to message', () => {
    testLogger = new Logger({ level: LogLevel.DEBUG, colorize: false })
    testLogger.info('msg', 'extra')
    const call = spies[0].mock.calls[0][0] as string
    expect(call).toContain('extra')
  })

  test('handles array arguments', () => {
    testLogger.info('msg', [1, 2, 3])
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles nested object arguments', () => {
    testLogger.info('msg', { a: { b: { c: 1 } } })
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles null argument', () => {
    testLogger.info('msg', null)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles undefined argument', () => {
    testLogger.info('msg', undefined)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles number argument', () => {
    testLogger.info('msg', 42)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles boolean argument', () => {
    testLogger.info('msg', true)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles function argument', () => {
    testLogger.info('msg', () => {})
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles Symbol argument', () => {
    testLogger.info('msg', Symbol('test'))
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles BigInt argument', () => {
    testLogger.info('msg', BigInt(9007199254740991))
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles Date argument', () => {
    testLogger.info('msg', new Date())
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles RegExp argument', () => {
    testLogger.info('msg', /test/gi)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles Error argument', () => {
    testLogger.info('msg', new Error('test error'))
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles Map argument', () => {
    testLogger.info('msg', new Map([['a', 1]]))
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles Set argument', () => {
    testLogger.info('msg', new Set([1, 2, 3]))
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles empty array argument', () => {
    testLogger.info('msg', [])
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles empty object argument', () => {
    testLogger.info('msg', {})
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles NaN argument', () => {
    testLogger.info('msg', NaN)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles Infinity argument', () => {
    testLogger.info('msg', Infinity)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles -0 argument', () => {
    testLogger.info('msg', -0)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles multiple mixed arguments', () => {
    testLogger.info('msg', 'str', 123, true, null, { a: 1 }, [1, 2])
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles self-referencing object', () => {
    const obj: Record<string, unknown> = {}
    obj.self = obj
    testLogger.info('msg', obj)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles mutual circular references', () => {
    const a: Record<string, unknown> = { name: 'a' }
    const b: Record<string, unknown> = { name: 'b' }
    a.ref = b
    b.ref = a
    testLogger.info('msg', a)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })

  test('handles array with circular refs', () => {
    const arr: unknown[] = [1, 2]
    arr.push(arr)
    testLogger.info('msg', arr)
    expect(spies[0]).toHaveBeenCalledTimes(1)
  })
})

describe('Logger level transitions', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('can switch from SILENT to DEBUG', () => {
    const l = new Logger({ level: LogLevel.SILENT, colorize: false })
    l.debug('hidden')
    expect(logSpy).not.toHaveBeenCalled()
    l.setLevel(LogLevel.DEBUG)
    l.debug('visible')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('can switch from ERROR to DEBUG', () => {
    const l = new Logger({ level: LogLevel.ERROR, colorize: false })
    l.info('hidden')
    expect(logSpy).not.toHaveBeenCalled()
    l.setLevel(LogLevel.DEBUG)
    l.info('visible')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('can switch from WARN to INFO', () => {
    const l = new Logger({ level: LogLevel.WARN, colorize: false })
    l.info('hidden')
    expect(logSpy).not.toHaveBeenCalled()
    l.setLevel(LogLevel.INFO)
    l.info('visible')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('can switch up to SILENT', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('visible')
    expect(logSpy).toHaveBeenCalledTimes(1)
    l.setLevel(LogLevel.SILENT)
    l.debug('hidden')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('rapid level switching works correctly', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.setLevel(LogLevel.SILENT)
    l.setLevel(LogLevel.DEBUG)
    l.debug('after switch')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })
})

describe('Logger constructor options', () => {
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockRestore()
  })

  test('default colorize is true', () => {
    const l = new Logger({ level: LogLevel.INFO })
    l.info('test')
    const call = spy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[')
  })

  test('default timestamp is false', () => {
    const l = new Logger({ level: LogLevel.INFO })
    l.info('test')
    const call = spy.mock.calls[0][0] as string
    expect(call).not.toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('default prefix is empty', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('test')
    const call = spy.mock.calls[0][0] as string
    const afterLevel = call.indexOf(']') + 1
    const nextChar = call.substring(afterLevel, afterLevel + 1)
    expect(nextChar).toBe(' ')
  })

  test('all options together', () => {
    const l = new Logger({ level: LogLevel.DEBUG, prefix: 'P', timestamp: true, colorize: false })
    l.info('msg')
    const call = spy.mock.calls[0][0] as string
    expect(call).toMatch(/\d{4}-\d{2}-\d{2}T/)
    expect(call).toContain('[INFO]')
    expect(call).toContain('P')
    expect(call).toContain('msg')
  })

  test('prefix with special characters', () => {
    const l = new Logger({ level: LogLevel.INFO, prefix: '[Module::Sub]', colorize: false })
    l.info('msg')
    const call = spy.mock.calls[0][0] as string
    expect(call).toContain('[Module::Sub]')
  })

  test('prefix with unicode', () => {
    const l = new Logger({ level: LogLevel.INFO, prefix: '日本語', colorize: false })
    l.info('msg')
    const call = spy.mock.calls[0][0] as string
    expect(call).toContain('日本語')
  })

  test('long prefix', () => {
    const longPrefix = 'A'.repeat(100)
    const l = new Logger({ level: LogLevel.INFO, prefix: longPrefix, colorize: false })
    l.info('msg')
    const call = spy.mock.calls[0][0] as string
    expect(call).toContain(longPrefix)
  })
})

describe('Logger output format', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('output contains message text', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('Hello World')
    expect(logSpy.mock.calls[0][0]).toContain('Hello World')
  })

  test('output contains level tag in brackets', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg')
    expect(logSpy.mock.calls[0][0]).toContain('[INFO]')
  })

  test('debug output has DEBUG tag', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('msg')
    expect(logSpy.mock.calls[0][0]).toContain('[DEBUG]')
  })

  test('warn output has WARN tag', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('msg')
    expect(warnSpy.mock.calls[0][0]).toContain('[WARN]')
  })

  test('error output has ERROR tag', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('msg')
    expect(errSpy.mock.calls[0][0]).toContain('[ERROR]')
  })

  test('timestamp format is ISO 8601', () => {
    const l = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    const tsMatch = call.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/)
    expect(tsMatch).not.toBeNull()
  })

  test('output order: timestamp, level, prefix, message', () => {
    const l = new Logger({ level: LogLevel.INFO, timestamp: true, prefix: 'PFX', colorize: false })
    l.info('test message')
    const call = logSpy.mock.calls[0][0] as string
    const tsIdx = call.search(/\d{4}-/)
    const lvlIdx = call.indexOf('[INFO]')
    const pfxIdx = call.indexOf('PFX')
    const msgIdx = call.indexOf('test message')
    expect(tsIdx).toBeLessThan(lvlIdx)
    expect(lvlIdx).toBeLessThan(pfxIdx)
    expect(pfxIdx).toBeLessThan(msgIdx)
  })

  test('single call per log statement', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.info('msg')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledTimes(0)
    expect(errSpy).toHaveBeenCalledTimes(0)
  })

  test('warn uses console.warn not console.log', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('msg')
    expect(logSpy).toHaveBeenCalledTimes(0)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  test('error uses console.error not console.log', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('msg')
    expect(logSpy).toHaveBeenCalledTimes(0)
    expect(errSpy).toHaveBeenCalledTimes(1)
  })
})

describe('default logger', () => {
  test('is Logger instance', () => {
    expect(logger).toBeInstanceOf(Logger)
  })

  test('has INFO level', () => {
    expect(logger.getLevel()).toBe(LogLevel.INFO)
  })

  test('can change level', () => {
    const originalLevel = logger.getLevel()
    logger.setLevel(LogLevel.DEBUG)
    expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    logger.setLevel(originalLevel)
  })

  test('has working debug method', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const originalLevel = logger.getLevel()
    logger.setLevel(LogLevel.DEBUG)
    logger.debug('test')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
    logger.setLevel(originalLevel)
  })

  test('has working info method', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('test')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  test('has working warn method', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logger.warn('test')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  test('has working error method', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('test')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('Logger getLevel/setLevel', () => {
  test('getLevel returns set value', () => {
    const l = new Logger({ level: LogLevel.INFO })
    expect(l.getLevel()).toBe(LogLevel.INFO)
  })

  test('setLevel to DEBUG', () => {
    const l = new Logger({ level: LogLevel.INFO })
    l.setLevel(LogLevel.DEBUG)
    expect(l.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('setLevel to SILENT', () => {
    const l = new Logger({ level: LogLevel.INFO })
    l.setLevel(LogLevel.SILENT)
    expect(l.getLevel()).toBe(LogLevel.SILENT)
  })

  test('setLevel multiple times', () => {
    const l = new Logger({ level: LogLevel.DEBUG })
    l.setLevel(LogLevel.INFO)
    expect(l.getLevel()).toBe(LogLevel.INFO)
    l.setLevel(LogLevel.WARN)
    expect(l.getLevel()).toBe(LogLevel.WARN)
    l.setLevel(LogLevel.ERROR)
    expect(l.getLevel()).toBe(LogLevel.ERROR)
    l.setLevel(LogLevel.SILENT)
    expect(l.getLevel()).toBe(LogLevel.SILENT)
  })

  test('setLevel to same value', () => {
    const l = new Logger({ level: LogLevel.INFO })
    l.setLevel(LogLevel.INFO)
    expect(l.getLevel()).toBe(LogLevel.INFO)
  })
})

describe('Logger ANSI color codes per level', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('debug uses cyan color code', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: true })
    l.debug('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[36m')
  })

  test('info uses blue color code', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: true })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[34m')
  })

  test('warn uses yellow color code', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: true })
    l.warn('msg')
    const call = warnSpy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[33m')
  })

  test('error uses red color code', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: true })
    l.error('msg')
    const call = errSpy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[31m')
  })

  test('colorized output contains reset code', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: true })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[0m')
  })

  test('colorized timestamp uses dim code', () => {
    const l = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: true })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[2m')
  })

  test('colorized prefix uses bold code', () => {
    const l = new Logger({ level: LogLevel.INFO, prefix: 'APP', colorize: true })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('\x1b[1m')
  })

  test('non-colorized output has no cyan', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).not.toContain('\x1b[36m')
  })

  test('non-colorized output has no blue', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).not.toContain('\x1b[34m')
  })

  test('non-colorized output has no yellow', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('msg')
    const call = warnSpy.mock.calls[0][0] as string
    expect(call).not.toContain('\x1b[33m')
  })

  test('non-colorized output has no red', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('msg')
    const call = errSpy.mock.calls[0][0] as string
    expect(call).not.toContain('\x1b[31m')
  })

  test('non-colorized output has no bold', () => {
    const l = new Logger({ level: LogLevel.INFO, prefix: 'P', colorize: false })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).not.toContain('\x1b[2m')
    expect(call).not.toContain('\x1b[34m')
  })
})

describe('Logger multiple instances', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('two loggers are independent', () => {
    const l1 = new Logger({ level: LogLevel.INFO, colorize: false })
    const l2 = new Logger({ level: LogLevel.WARN, colorize: false })
    l1.info('from l1')
    l2.info('from l2')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('changing level on one logger does not affect another', () => {
    const l1 = new Logger({ level: LogLevel.INFO, colorize: false })
    const l2 = new Logger({ level: LogLevel.INFO, colorize: false })
    l1.setLevel(LogLevel.SILENT)
    l1.info('hidden')
    l2.info('visible')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('different prefixes on different loggers', () => {
    const l1 = new Logger({ level: LogLevel.INFO, prefix: 'A', colorize: false })
    const l2 = new Logger({ level: LogLevel.INFO, prefix: 'B', colorize: false })
    l1.info('msg')
    l2.info('msg')
    expect(logSpy.mock.calls[0][0]).toContain('A')
    expect(logSpy.mock.calls[1][0]).toContain('B')
  })

  test('different timestamp settings on different loggers', () => {
    const l1 = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    const l2 = new Logger({ level: LogLevel.INFO, timestamp: false, colorize: false })
    l1.info('msg')
    l2.info('msg')
    expect(logSpy.mock.calls[0][0] as string).toMatch(/\d{4}-/)
    expect(logSpy.mock.calls[1][0] as string).not.toMatch(/^\d{4}-/)
  })

  test('different colorize settings on different loggers', () => {
    const l1 = new Logger({ level: LogLevel.INFO, colorize: true })
    const l2 = new Logger({ level: LogLevel.INFO, colorize: false })
    l1.info('msg')
    l2.info('msg')
    expect(logSpy.mock.calls[0][0] as string).toContain('\x1b[')
    expect(logSpy.mock.calls[1][0] as string).not.toContain('\x1b[')
  })

  test('three loggers with different levels', () => {
    const l1 = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const l2 = new Logger({ level: LogLevel.WARN, colorize: false })
    const l3 = new Logger({ level: LogLevel.SILENT, colorize: false })
    l1.debug('d')
    l2.warn('w')
    l3.error('e')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(errSpy).toHaveBeenCalledTimes(0)
  })
})

describe('Logger level boundary conditions', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('INFO level does not show DEBUG', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.debug('msg')
    expect(logSpy).not.toHaveBeenCalled()
  })

  test('INFO level shows INFO', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('INFO level shows WARN', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.warn('msg')
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  test('INFO level shows ERROR', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.error('msg')
    expect(errSpy).toHaveBeenCalledTimes(1)
  })

  test('WARN level does not show INFO', () => {
    const l = new Logger({ level: LogLevel.WARN, colorize: false })
    l.info('msg')
    expect(logSpy).not.toHaveBeenCalled()
  })

  test('WARN level shows WARN', () => {
    const l = new Logger({ level: LogLevel.WARN, colorize: false })
    l.warn('msg')
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  test('WARN level shows ERROR', () => {
    const l = new Logger({ level: LogLevel.WARN, colorize: false })
    l.error('msg')
    expect(errSpy).toHaveBeenCalledTimes(1)
  })

  test('ERROR level does not show WARN', () => {
    const l = new Logger({ level: LogLevel.ERROR, colorize: false })
    l.warn('msg')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  test('ERROR level shows ERROR', () => {
    const l = new Logger({ level: LogLevel.ERROR, colorize: false })
    l.error('msg')
    expect(errSpy).toHaveBeenCalledTimes(1)
  })

  test('SILENT level does not show ERROR', () => {
    const l = new Logger({ level: LogLevel.SILENT, colorize: false })
    l.error('msg')
    expect(errSpy).not.toHaveBeenCalled()
  })

  test('DEBUG level shows DEBUG', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('msg')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('DEBUG level shows INFO', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.info('msg')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('DEBUG level shows WARN', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('msg')
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  test('DEBUG level shows ERROR', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('msg')
    expect(errSpy).toHaveBeenCalledTimes(1)
  })
})

describe('Logger with arguments at each level', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('debug with string arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('msg', 'extra')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toContain('extra')
  })

  test('debug with number arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('msg', 42)
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toContain('42')
  })

  test('debug with object arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('msg', { key: 'val' })
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('info with multiple args', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', 'a', 'b', 'c')
    expect(logSpy).toHaveBeenCalledTimes(1)
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('a')
    expect(call).toContain('b')
    expect(call).toContain('c')
  })

  test('warn with string arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('msg', 'warning detail')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('warning detail')
  })

  test('warn with object arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('msg', { code: 500 })
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  test('warn with null arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('msg', null)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  test('error with string arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('msg', 'error detail')
    expect(errSpy).toHaveBeenCalledTimes(1)
    expect(errSpy.mock.calls[0][0]).toContain('error detail')
  })

  test('error with Error object arg', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('msg', new Error('test'))
    expect(errSpy).toHaveBeenCalledTimes(1)
  })

  test('error with multiple args', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('msg', 'detail', 404, { path: '/api' })
    expect(errSpy).toHaveBeenCalledTimes(1)
  })

  test('info with no args outputs just message', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('hello')
    const call = logSpy.mock.calls[0][0] as string
    const afterMsg = call.indexOf('hello')
    expect(afterMsg).toBeGreaterThan(-1)
  })
})

describe('Logger special message content', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('message with only whitespace', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('   ')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('message with tabs', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('\t\t')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('message with newlines', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('line1\nline2\nline3')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('message with null byte', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('before\0after')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('message with HTML tags', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('<div>Hello</div>')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toContain('<div>')
  })

  test('message with JSON string', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('{"key":"value"}')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('message with path separators', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('/usr/local/bin/node')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('message with ANSI escape sequence in message text', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('test\x1b[31mred')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('message with backslashes', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('path\\to\\file')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('single character message', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('x')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })
})

describe('Logger getLevel for all initial levels', () => {
  test('getLevel returns DEBUG', () => {
    const l = new Logger({ level: LogLevel.DEBUG })
    expect(l.getLevel()).toBe(LogLevel.DEBUG)
  })

  test('getLevel returns INFO', () => {
    const l = new Logger({ level: LogLevel.INFO })
    expect(l.getLevel()).toBe(LogLevel.INFO)
  })

  test('getLevel returns WARN', () => {
    const l = new Logger({ level: LogLevel.WARN })
    expect(l.getLevel()).toBe(LogLevel.WARN)
  })

  test('getLevel returns ERROR', () => {
    const l = new Logger({ level: LogLevel.ERROR })
    expect(l.getLevel()).toBe(LogLevel.ERROR)
  })

  test('getLevel returns SILENT', () => {
    const l = new Logger({ level: LogLevel.SILENT })
    expect(l.getLevel()).toBe(LogLevel.SILENT)
  })
})

describe('Logger rapid and repeated calls', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('10 rapid info calls', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    for (let i = 0; i < 10; i++) {
      l.info(`msg ${i}`)
    }
    expect(logSpy).toHaveBeenCalledTimes(10)
  })

  test('50 rapid debug calls', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    for (let i = 0; i < 50; i++) {
      l.debug(`msg ${i}`)
    }
    expect(logSpy).toHaveBeenCalledTimes(50)
  })

  test('interleaved levels count correctly', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    for (let i = 0; i < 5; i++) {
      l.debug('d')
      l.info('i')
      l.warn('w')
      l.error('e')
    }
    expect(logSpy).toHaveBeenCalledTimes(10)
    expect(warnSpy).toHaveBeenCalledTimes(5)
    expect(errSpy).toHaveBeenCalledTimes(5)
  })

  test('log then change level then log again', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('first')
    l.setLevel(LogLevel.SILENT)
    l.debug('hidden')
    l.setLevel(LogLevel.DEBUG)
    l.debug('last')
    expect(logSpy).toHaveBeenCalledTimes(2)
  })

  test('many setLevel calls do not break logging', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    for (let i = 0; i < 20; i++) {
      l.setLevel(LogLevel.SILENT)
      l.setLevel(LogLevel.DEBUG)
    }
    l.info('final')
    expect(logSpy).toHaveBeenCalledTimes(1)
  })
})

describe('Logger safeStringify edge cases via API', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  test('object with toString method', () => {
    const obj = {
      toString() {
        return 'custom-string'
      },
    }
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', obj)
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('object with valueOf method', () => {
    const obj = {
      valueOf() {
        return 42
      },
    }
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', obj)
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('class instance as argument', () => {
    class MyClass {
      name = 'test'
    }
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', new MyClass())
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('WeakMap as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', new WeakMap())
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('WeakSet as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', new WeakSet())
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('Promise as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', Promise.resolve(42))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('ArrayBuffer as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', new ArrayBuffer(8))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('Int32Array as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', new Int32Array([1, 2, 3]))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('Float64Array as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', new Float64Array([1.1, 2.2]))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('DataView as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', new DataView(new ArrayBuffer(16)))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('nested arrays as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', [
      [1, 2],
      [3, 4],
    ])
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('object with numeric keys as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', { 1: 'a', 2: 'b' })
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('object with Symbol key value as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    const sym = Symbol('key')
    l.info('msg', { [sym]: 'value' })
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('frozen object as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', Object.freeze({ a: 1 }))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('sealed object as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', Object.seal({ a: 1 }))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  test('object with null prototype as argument', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', Object.create(null))
    expect(logSpy).toHaveBeenCalledTimes(1)
  })
})

describe('Logger output content verification', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
  })

  test('output starts with timestamp when enabled and no color', () => {
    const l = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('output contains level tag without color', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('[INFO]')
    expect(call).not.toContain('\x1b[')
  })

  test('debug message text is preserved', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('my debug message')
    expect(logSpy.mock.calls[0][0]).toContain('my debug message')
  })

  test('warn message text is preserved', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.warn('my warning')
    expect(warnSpy.mock.calls[0][0]).toContain('my warning')
  })

  test('error message text is preserved', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.error('my error')
    expect(errSpy.mock.calls[0][0]).toContain('my error')
  })

  test('prefix with spaces is preserved', () => {
    const l = new Logger({ level: LogLevel.INFO, prefix: 'My App', colorize: false })
    l.info('msg')
    expect(logSpy.mock.calls[0][0]).toContain('My App')
  })

  test('prefix with brackets is preserved', () => {
    const l = new Logger({ level: LogLevel.INFO, prefix: '[module]', colorize: false })
    l.info('msg')
    expect(logSpy.mock.calls[0][0]).toContain('[module]')
  })

  test('no prefix section when prefix is empty', () => {
    const l = new Logger({ level: LogLevel.INFO, prefix: '', colorize: false })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('[INFO]')
    expect(call).toContain('msg')
  })

  test('level tag has correct format with brackets', () => {
    const l = new Logger({ level: LogLevel.DEBUG, colorize: false })
    l.debug('msg')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('[DEBUG]')
  })

  test('timestamp is ISO format with Z suffix', () => {
    const l = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    l.info('msg')
    const call = logSpy.mock.calls[0][0] as string
    const match = call.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    expect(match).not.toBeNull()
  })

  test('number arg is included in output', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', 123)
    expect(logSpy.mock.calls[0][0]).toContain('123')
  })

  test('boolean arg true is included in output', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', true)
    expect(logSpy.mock.calls[0][0]).toContain('true')
  })

  test('boolean arg false is included in output', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', false)
    expect(logSpy.mock.calls[0][0]).toContain('false')
  })

  test('null arg renders as null string', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', null)
    expect(logSpy.mock.calls[0][0]).toContain('null')
  })

  test('undefined arg renders as undefined string', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', undefined)
    expect(logSpy.mock.calls[0][0]).toContain('undefined')
  })

  test('string arg is appended with space separator', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', 'extra')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('msg extra')
  })

  test('multiple string args separated by spaces', () => {
    const l = new Logger({ level: LogLevel.INFO, colorize: false })
    l.info('msg', 'a', 'b')
    const call = logSpy.mock.calls[0][0] as string
    expect(call).toContain('a b')
  })
})
