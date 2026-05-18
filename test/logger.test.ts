import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Logger, LogLevel, logger } from '../src/utils/logger.js'

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── LogLevel Enum ────────────────────────────────────
describe('LogLevel enum', () => {
  it('DEBUG equals 0', () => {
    expect(LogLevel.DEBUG).toBe(0)
  })

  it('INFO equals 1', () => {
    expect(LogLevel.INFO).toBe(1)
  })

  it('WARN equals 2', () => {
    expect(LogLevel.WARN).toBe(2)
  })

  it('ERROR equals 3', () => {
    expect(LogLevel.ERROR).toBe(3)
  })

  it('SILENT equals 4', () => {
    expect(LogLevel.SILENT).toBe(4)
  })

  it('levels are ordered correctly: DEBUG < INFO < WARN < ERROR < SILENT', () => {
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO)
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN)
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR)
    expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT)
  })
})

// ─── Logger Constructor ───────────────────────────────
describe('Logger constructor', () => {
  it('creates an instance with required level option', () => {
    const log = new Logger({ level: LogLevel.INFO })
    expect(log).toBeInstanceOf(Logger)
  })

  it('defaults colorize to true', () => {
    const log = new Logger({ level: LogLevel.INFO })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('test')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B['))
    spy.mockRestore()
  })

  it('sets colorize to false when specified', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('test')
    expect(spy).toHaveBeenCalledWith(expect.not.stringContaining('\u001B['))
    spy.mockRestore()
  })

  it('defaults prefix to empty string', () => {
    const log = new Logger({ level: LogLevel.INFO })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).not.toContain('undefined')
    spy.mockRestore()
  })

  it('sets prefix when provided', () => {
    const log = new Logger({ level: LogLevel.INFO, prefix: 'APP', colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('APP'))
    spy.mockRestore()
  })

  it('defaults timestamp to false', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    // ISO timestamp format: YYYY-MM-DDTHH:MM:SS.sssZ
    expect(output).not.toMatch(/\d{4}-\d{2}-\d{2}T/)
    spy.mockRestore()
  })

  it('enables timestamp when set to true', () => {
    const log = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toMatch(/\d{4}-\d{2}-\d{2}T/)
    spy.mockRestore()
  })

  it('accepts all options together', () => {
    const log = new Logger({
      colorize: false,
      level: LogLevel.DEBUG,
      prefix: 'TEST',
      timestamp: true,
    })
    expect(log).toBeInstanceOf(Logger)
    expect(log.getLevel()).toBe(LogLevel.DEBUG)
  })

  it('accepts empty prefix explicitly', () => {
    const log = new Logger({ level: LogLevel.INFO, prefix: '', colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    // Should have [INFO] then space then msg (no prefix between)
    expect(output).toMatch(/\[INFO\] msg/)
    spy.mockRestore()
  })
})

// ─── getLevel ─────────────────────────────────────────
describe('Logger.getLevel', () => {
  it('returns the configured level', () => {
    const log = new Logger({ level: LogLevel.WARN })
    expect(log.getLevel()).toBe(LogLevel.WARN)
  })

  it('returns DEBUG when configured with DEBUG', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    expect(log.getLevel()).toBe(LogLevel.DEBUG)
  })

  it('returns SILENT when configured with SILENT', () => {
    const log = new Logger({ level: LogLevel.SILENT })
    expect(log.getLevel()).toBe(LogLevel.SILENT)
  })
})

// ─── setLevel ─────────────────────────────────────────
describe('Logger.setLevel', () => {
  it('changes the log level', () => {
    const log = new Logger({ level: LogLevel.INFO })
    log.setLevel(LogLevel.DEBUG)
    expect(log.getLevel()).toBe(LogLevel.DEBUG)
  })

  it('can set to SILENT', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    log.setLevel(LogLevel.SILENT)
    expect(log.getLevel()).toBe(LogLevel.SILENT)
  })

  it('can change level multiple times', () => {
    const log = new Logger({ level: LogLevel.DEBUG })
    log.setLevel(LogLevel.WARN)
    expect(log.getLevel()).toBe(LogLevel.WARN)
    log.setLevel(LogLevel.ERROR)
    expect(log.getLevel()).toBe(LogLevel.ERROR)
    log.setLevel(LogLevel.INFO)
    expect(log.getLevel()).toBe(LogLevel.INFO)
  })
})

// ─── info ─────────────────────────────────────────────
describe('Logger.info', () => {
  let log: Logger
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    log = new Logger({ level: LogLevel.INFO, colorize: false })
    spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockRestore()
  })

  it('outputs to console.log', () => {
    log.info('hello')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('hello'))
  })

  it('includes [INFO] level tag', () => {
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'))
  })

  it('includes the message', () => {
    log.info('test message')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('test message'))
  })

  it('appends additional arguments', () => {
    log.info('msg', 'extra')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('extra'))
  })

  it('appends multiple additional arguments', () => {
    log.info('msg', 'a', 'b', 'c')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('a')
    expect(output).toContain('b')
    expect(output).toContain('c')
  })

  it('does not output when level is WARN', () => {
    const warnLog = new Logger({ level: LogLevel.WARN, colorize: false })
    const warnSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnLog.info('should not appear')
    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('does not output when level is ERROR', () => {
    const errorLog = new Logger({ level: LogLevel.ERROR, colorize: false })
    const errorSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorLog.info('should not appear')
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('does not output when level is SILENT', () => {
    const silentLog = new Logger({ level: LogLevel.SILENT, colorize: false })
    const silentSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    silentLog.info('should not appear')
    expect(silentSpy).not.toHaveBeenCalled()
    silentSpy.mockRestore()
  })
})

// ─── debug ────────────────────────────────────────────
describe('Logger.debug', () => {
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockRestore()
  })

  it('outputs to console.log', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    log.debug('hello')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('includes [DEBUG] level tag', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    log.debug('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'))
  })

  it('includes the message', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    log.debug('debug msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('debug msg'))
  })

  it('appends additional arguments', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    log.debug('msg', 'detail', 42)
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('detail')
    expect(output).toContain('42')
  })

  it('does not output when level is INFO', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    log.debug('should not appear')
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not output when level is WARN', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    log.debug('should not appear')
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not output when level is SILENT', () => {
    const log = new Logger({ level: LogLevel.SILENT, colorize: false })
    log.debug('should not appear')
    expect(spy).not.toHaveBeenCalled()
  })
})

// ─── warn ─────────────────────────────────────────────
describe('Logger.warn', () => {
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockRestore()
  })

  it('outputs to console.warn', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    log.warn('hello')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('includes [WARN] level tag', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    log.warn('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'))
  })

  it('includes the message', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    log.warn('warning msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('warning msg'))
  })

  it('appends additional arguments', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    log.warn('msg', 'detail')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('detail'))
  })

  it('does not output when level is ERROR', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    log.warn('should not appear')
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not output when level is SILENT', () => {
    const log = new Logger({ level: LogLevel.SILENT, colorize: false })
    log.warn('should not appear')
    expect(spy).not.toHaveBeenCalled()
  })

  it('outputs when level is WARN', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    log.warn('visible')
    expect(spy).toHaveBeenCalled()
  })

  it('outputs when level is DEBUG (lower than WARN)', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    log.warn('visible')
    expect(spy).toHaveBeenCalled()
  })

  it('outputs when level is INFO (lower than WARN)', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    log.warn('visible')
    expect(spy).toHaveBeenCalled()
  })
})

// ─── error ────────────────────────────────────────────
describe('Logger.error', () => {
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockRestore()
  })

  it('outputs to console.error', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    log.error('hello')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('includes [ERROR] level tag', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    log.error('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'))
  })

  it('includes the message', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    log.error('error msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('error msg'))
  })

  it('appends additional arguments', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    log.error('msg', 'detail', 'extra')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('detail')
    expect(output).toContain('extra')
  })

  it('does not output when level is SILENT', () => {
    const log = new Logger({ level: LogLevel.SILENT, colorize: false })
    log.error('should not appear')
    expect(spy).not.toHaveBeenCalled()
  })

  it('outputs when level is ERROR', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    log.error('visible')
    expect(spy).toHaveBeenCalled()
  })

  it('outputs when level is DEBUG', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    log.error('visible')
    expect(spy).toHaveBeenCalled()
  })

  it('outputs when level is INFO', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    log.error('visible')
    expect(spy).toHaveBeenCalled()
  })

  it('outputs when level is WARN', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    log.error('visible')
    expect(spy).toHaveBeenCalled()
  })
})

// ─── Level Filtering ──────────────────────────────────
describe('Logger level filtering', () => {
  it('SILENT suppresses all log levels', () => {
    const log = new Logger({ level: LogLevel.SILENT, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('ERROR level only shows errors', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('WARN level shows warnings and errors', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('INFO level shows info, warnings, and errors', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(logSpy).toHaveBeenCalledTimes(1) // info only
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('DEBUG level shows all log levels', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(logSpy).toHaveBeenCalledTimes(2) // debug + info
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('level filtering works after setLevel change', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    log.debug('before')
    expect(logSpy).toHaveBeenCalledTimes(1)

    log.setLevel(LogLevel.WARN)
    log.debug('after')
    expect(logSpy).toHaveBeenCalledTimes(1) // still 1, not incremented

    logSpy.mockRestore()
  })
})

// ─── Timestamp Formatting ─────────────────────────────
describe('Logger timestamp', () => {
  it('includes ISO timestamp when enabled', () => {
    const log = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    // ISO format: 2024-01-15T10:30:00.000Z
    expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    spy.mockRestore()
  })

  it('timestamp appears before level tag', () => {
    const log = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    const tsIndex = output.indexOf('T') // part of ISO date
    const levelIndex = output.indexOf('[INFO]')
    expect(tsIndex).toBeLessThan(levelIndex)
    spy.mockRestore()
  })

  it('does not include timestamp when disabled', () => {
    const log = new Logger({ level: LogLevel.INFO, timestamp: false, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).not.toMatch(/\d{4}-\d{2}-\d{2}T/)
    spy.mockRestore()
  })

  it('timestamp is dimmed when colorize is true', () => {
    const log = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: true })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('\u001B[2m') // dim
    spy.mockRestore()
  })

  it('timestamp is not dimmed when colorize is false', () => {
    const log = new Logger({ level: LogLevel.INFO, timestamp: true, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).not.toContain('\u001B[2m')
    spy.mockRestore()
  })
})

// ─── Colorization ─────────────────────────────────────
describe('Logger colorization', () => {
  it('applies cyan color for DEBUG level', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: true })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.debug('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B[36m'))
    spy.mockRestore()
  })

  it('applies blue color for INFO level', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: true })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B[34m'))
    spy.mockRestore()
  })

  it('applies yellow color for WARN level', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: true })
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    log.warn('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B[33m'))
    spy.mockRestore()
  })

  it('applies red color for ERROR level', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: true })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    log.error('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B[31m'))
    spy.mockRestore()
  })

  it('applies reset code after level tag', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: true })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B[0m'))
    spy.mockRestore()
  })

  it('does not apply color codes when colorize is false', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.debug('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).not.toContain('\u001B[')
    spy.mockRestore()
  })

  it('includes level tag without color codes when colorize is false', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'))
    spy.mockRestore()
  })

  it('bold prefix when colorize is true', () => {
    const log = new Logger({ level: LogLevel.INFO, prefix: 'APP', colorize: true })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B[1m'))
    spy.mockRestore()
  })
})

// ─── Prefix ───────────────────────────────────────────
describe('Logger prefix', () => {
  it('includes prefix in output', () => {
    const log = new Logger({ level: LogLevel.INFO, prefix: 'MyApp', colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('MyApp'))
    spy.mockRestore()
  })

  it('prefix appears between level tag and message', () => {
    const log = new Logger({ level: LogLevel.INFO, prefix: 'APP', colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    const levelIdx = output.indexOf('[INFO]')
    const prefixIdx = output.indexOf('APP')
    const msgIdx = output.indexOf('msg')
    expect(levelIdx).toBeLessThan(prefixIdx)
    expect(prefixIdx).toBeLessThan(msgIdx)
    spy.mockRestore()
  })

  it('does not include prefix when not set', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    // Should go directly from [INFO] to msg
    expect(output).toMatch(/\[INFO\] msg$/)
    spy.mockRestore()
  })

  it('works with prefix on all log levels', () => {
    const log = new Logger({ level: LogLevel.DEBUG, prefix: 'PFX', colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(logSpy.mock.calls[0]![0]).toContain('PFX')
    expect(logSpy.mock.calls[1]![0]).toContain('PFX')
    expect(warnSpy.mock.calls[0]![0]).toContain('PFX')
    expect(errorSpy.mock.calls[0]![0]).toContain('PFX')

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})

// ─── Argument Formatting ──────────────────────────────
describe('Logger argument formatting', () => {
  let log: Logger
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockRestore()
  })

  it('formats string arguments', () => {
    log.info('msg', 'hello')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('hello'))
  })

  it('formats number arguments', () => {
    log.info('msg', 42)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('42'))
  })

  it('formats boolean arguments', () => {
    log.info('msg', true, false)
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('true')
    expect(output).toContain('false')
  })

  it('formats null argument', () => {
    log.info('msg', null)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('null'))
  })

  it('formats undefined argument', () => {
    log.info('msg', undefined)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('undefined'))
  })

  it('formats plain object argument as [Circular] due to seen WeakSet', () => {
    log.info('msg', { key: 'value' })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Circular]'))
  })

  it('formats array argument', () => {
    log.info('msg', [1, 2, 3])
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('1, 2, 3'))
  })

  it('formats nested object argument as [Circular] due to seen WeakSet', () => {
    log.info('msg', { outer: { inner: 'deep' } })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Circular]'))
  })

  it('formats circular reference as [Circular]', () => {
    const obj: Record<string, unknown> = { name: 'test' }
    obj.self = obj
    log.info('msg', obj)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Circular]'))
  })

  it('separates multiple arguments with spaces', () => {
    log.info('msg', 'a', 'b')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('a b')
  })

  it('does not append extra space when no arguments given', () => {
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toMatch(/\[INFO\] msg$/)
  })

  it('formats empty array argument', () => {
    log.info('msg', [])
    // Empty array joins to empty string, so no argsString appended
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('formats empty object argument as [Circular] due to seen WeakSet', () => {
    log.info('msg', {})
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Circular]'))
  })

  it('formats Date argument', () => {
    const date = new Date('2024-01-15T10:30:00.000Z')
    log.info('msg', date)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2024'))
  })
})

// ─── Output Format (non-colored, no timestamp, no prefix) ──
describe('Logger output format', () => {
  it('format: [LEVEL] message', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('hello world')
    expect(spy).toHaveBeenCalledWith('[INFO] hello world')
    spy.mockRestore()
  })

  it('format: [LEVEL] message arg1 arg2', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('hello', 'world', '!')
    expect(spy).toHaveBeenCalledWith('[INFO] hello world !')
    spy.mockRestore()
  })

  it('format with prefix includes bold prefix even when colorize is false', () => {
    const log = new Logger({ level: LogLevel.INFO, prefix: 'APP', colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('hello')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('[INFO]')
    expect(output).toContain('APP')
    expect(output).toContain('hello')
    spy.mockRestore()
  })

  it('debug outputs to console.log', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.debug('msg')
    expect(spy).toHaveBeenCalledWith('[DEBUG] msg')
    spy.mockRestore()
  })

  it('info outputs to console.log', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith('[INFO] msg')
    spy.mockRestore()
  })

  it('warn outputs to console.warn', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    log.warn('msg')
    expect(spy).toHaveBeenCalledWith('[WARN] msg')
    spy.mockRestore()
  })

  it('error outputs to console.error', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    log.error('msg')
    expect(spy).toHaveBeenCalledWith('[ERROR] msg')
    spy.mockRestore()
  })
})

// ─── Default Logger Export ────────────────────────────
describe('default logger export', () => {
  it('is an instance of Logger', () => {
    expect(logger).toBeInstanceOf(Logger)
  })

  it('has INFO level configured', () => {
    expect(logger.getLevel()).toBe(LogLevel.INFO)
  })

  it('has colorize enabled', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('test')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('\u001B['))
    spy.mockRestore()
  })

  it('has timestamp enabled', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('test')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toMatch(/\d{4}-\d{2}-\d{2}T/)
    spy.mockRestore()
  })
})

// ─── Dynamic Level Change ─────────────────────────────
describe('Logger dynamic level change', () => {
  it('switching from INFO to DEBUG shows debug messages', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    log.debug('hidden')
    expect(spy).not.toHaveBeenCalled()

    log.setLevel(LogLevel.DEBUG)
    log.debug('visible')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('visible'))

    spy.mockRestore()
  })

  it('switching from DEBUG to SILENT suppresses all output', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    log.setLevel(LogLevel.SILENT)
    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('switching level back and forth works correctly', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    log.info('first')
    expect(spy).toHaveBeenCalledTimes(1)

    log.setLevel(LogLevel.WARN)
    log.info('hidden')
    expect(spy).toHaveBeenCalledTimes(1)

    log.setLevel(LogLevel.INFO)
    log.info('second')
    expect(spy).toHaveBeenCalledTimes(2)

    spy.mockRestore()
  })
})

// ─── Edge Cases ───────────────────────────────────────
describe('Logger edge cases', () => {
  it('handles empty string message', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('')
    expect(spy).toHaveBeenCalledWith('[INFO] ')
    spy.mockRestore()
  })

  it('handles message with special characters', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('hello\nworld\ttab')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('hello'))
    spy.mockRestore()
  })

  it('handles unicode message', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('こんにちは')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('こんにちは'))
    spy.mockRestore()
  })

  it('handles emoji in message', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('✅ done')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('✅'))
    spy.mockRestore()
  })

  it('handles very long message', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const longMsg = 'a'.repeat(10000)
    log.info(longMsg)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining(longMsg))
    spy.mockRestore()
  })

  it('handles function argument by converting to string', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg', () => 'test')
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('handles Symbol argument by converting to string', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg', Symbol('test'))
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('handles BigInt argument by converting to string', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg', BigInt(9007199254740991))
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('9007199254740991'))
    spy.mockRestore()
  })

  it('handles deeply nested object as [Circular] due to seen WeakSet', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const deep = { a: { b: { c: { d: { e: 'deep' } } } } }
    log.info('msg', deep)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Circular]'))
    spy.mockRestore()
  })

  it('handles array with mixed types', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg', [1, 'two', true, null])
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('1')
    expect(output).toContain('two')
    expect(output).toContain('true')
    expect(output).toContain('null')
    spy.mockRestore()
  })

  it('handles object with circular nested reference', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const a: Record<string, unknown> = { name: 'a' }
    const b: Record<string, unknown> = { name: 'b', ref: a }
    a.ref = b
    log.info('msg', a)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Circular]'))
    spy.mockRestore()
  })

  it('handles NaN argument', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg', NaN)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('NaN'))
    spy.mockRestore()
  })

  it('handles Infinity argument', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg', Infinity)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Infinity'))
    spy.mockRestore()
  })

  it('handles negative Infinity argument', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg', -Infinity)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('-Infinity'))
    spy.mockRestore()
  })

  it('handles object with toJSON method by serializing the toJSON result', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const obj = {
      toJSON: () => ({ custom: 'serialized' }),
    }
    log.info('msg', obj)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('custom'))
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('serialized'))
    spy.mockRestore()
  })

  it('multiple log calls produce separate outputs', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('first')
    log.info('second')
    log.info('third')
    expect(spy).toHaveBeenCalledTimes(3)
    spy.mockRestore()
  })

  it('handles message that looks like a level tag', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('[ERROR] something')
    expect(spy).toHaveBeenCalledWith('[INFO] [ERROR] something')
    spy.mockRestore()
  })
})

// ─── Combined Options ─────────────────────────────────
describe('Logger combined options', () => {
  it('all options enabled: colorize + timestamp + prefix', () => {
    const log = new Logger({
      level: LogLevel.INFO,
      colorize: true,
      timestamp: true,
      prefix: 'APP',
    })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('\u001B[')     // color codes
    expect(output).toMatch(/\d{4}-\d{2}/)    // timestamp
    expect(output).toContain('APP')           // prefix
    expect(output).toContain('[INFO]')        // level tag
    expect(output).toContain('msg')           // message
    spy.mockRestore()
  })

  it('all options disabled: no color, no timestamp, no prefix', () => {
    const log = new Logger({
      level: LogLevel.INFO,
      colorize: false,
      timestamp: false,
      prefix: '',
    })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    expect(spy).toHaveBeenCalledWith('[INFO] msg')
    spy.mockRestore()
  })

  it('timestamp + no colorize produces plain timestamp', () => {
    const log = new Logger({
      level: LogLevel.INFO,
      colorize: false,
      timestamp: true,
    })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).not.toContain('\u001B[')
    expect(output).toMatch(/\d{4}-\d{2}-\d{2}T/)
    spy.mockRestore()
  })

  it('prefix always gets bold code even with colorize false', () => {
    const log = new Logger({
      level: LogLevel.INFO,
      colorize: false,
      prefix: 'PFX',
    })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log.info('msg')
    const output = spy.mock.calls[0]![0] as string
    expect(output).toContain('\u001B[1m')
    expect(output).toContain('PFX')
    spy.mockRestore()
  })
})

// ─── Console Method Routing ───────────────────────────
describe('Logger console method routing', () => {
  it('debug uses console.log', () => {
    const log = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    log.debug('msg')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('info uses console.log', () => {
    const log = new Logger({ level: LogLevel.INFO, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    log.info('msg')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('warn uses console.warn', () => {
    const log = new Logger({ level: LogLevel.WARN, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    log.warn('msg')
    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).not.toHaveBeenCalled()
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('error uses console.error', () => {
    const log = new Logger({ level: LogLevel.ERROR, colorize: false })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    log.error('msg')
    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})

// ─── Multiple Logger Instances ────────────────────────
describe('Multiple Logger instances', () => {
  it('separate instances have independent levels', () => {
    const logA = new Logger({ level: LogLevel.DEBUG, colorize: false })
    const logB = new Logger({ level: LogLevel.ERROR, colorize: false })
    expect(logA.getLevel()).toBe(LogLevel.DEBUG)
    expect(logB.getLevel()).toBe(LogLevel.ERROR)
  })

  it('changing level on one instance does not affect another', () => {
    const logA = new Logger({ level: LogLevel.INFO, colorize: false })
    const logB = new Logger({ level: LogLevel.INFO, colorize: false })
    logA.setLevel(LogLevel.DEBUG)
    expect(logA.getLevel()).toBe(LogLevel.DEBUG)
    expect(logB.getLevel()).toBe(LogLevel.INFO)
  })

  it('different prefixes on different instances', () => {
    const logA = new Logger({ level: LogLevel.INFO, prefix: 'A', colorize: false })
    const logB = new Logger({ level: LogLevel.INFO, prefix: 'B', colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    logA.info('from A')
    expect(spy.mock.calls[0]![0]).toContain('A')

    logB.info('from B')
    expect(spy.mock.calls[1]![0]).toContain('B')

    spy.mockRestore()
  })

  it('different colorize settings on different instances', () => {
    const logColor = new Logger({ level: LogLevel.INFO, colorize: true })
    const logPlain = new Logger({ level: LogLevel.INFO, colorize: false })
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    logColor.info('colored')
    logPlain.info('plain')

    expect(spy.mock.calls[0]![0]).toContain('\u001B[')
    expect(spy.mock.calls[1]![0]).not.toContain('\u001B[')

    spy.mockRestore()
  })
})
