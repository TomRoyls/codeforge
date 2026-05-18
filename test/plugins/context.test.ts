import { describe, it, expect } from 'vitest'
import type { PluginConfig } from '../../src/plugins/types.js'

import {
  createPluginContext,
  createRuleContext,
  createDefaultLogger,
  createSilentLogger,
  type PluginContextOptions,
  type RuleContextOptions,
} from '../../src/plugins/context.js'

function makePluginOptions(overrides: Partial<PluginContextOptions> = {}): PluginContextOptions {
  return {
    config: {} as PluginConfig,
    logger: createSilentLogger(),
    workspaceRoot: '/project',
    ...overrides,
  }
}

function makeRuleOptions(overrides: Partial<RuleContextOptions> = {}): RuleContextOptions {
  return {
    ast: {},
    comments: [],
    config: {} as PluginConfig,
    filePath: 'src/test.ts',
    logger: createSilentLogger(),
    source: 'const x = 1',
    tokens: [],
    workspaceRoot: '/project',
    ...overrides,
  }
}

// ─── createPluginContext ───

describe('createPluginContext', () => {
  it('returns context with config, logger, workspaceRoot', () => {
    const config = { enabled: true } as PluginConfig
    const logger = createSilentLogger()
    const ctx = createPluginContext({ config, logger, workspaceRoot: '/proj' })
    expect(ctx.config).toBe(config)
    expect(ctx.logger).toBe(logger)
    expect(ctx.workspaceRoot).toBe('/proj')
  })
})

// ─── createRuleContext ───

describe('createRuleContext', () => {
  it('returns context with all getters', () => {
    const ctx = createRuleContext(makeRuleOptions())
    expect(ctx.getSource()).toBe('const x = 1')
    expect(ctx.getFilePath()).toBe('src/test.ts')
    expect(ctx.getAST()).toEqual({})
    expect(ctx.getTokens()).toEqual([])
    expect(ctx.getComments()).toEqual([])
  })

  it('collects reports via report()', () => {
    const ctx = createRuleContext(makeRuleOptions())
    ctx.report({ message: 'Test violation', severity: 'warning' })
    expect(ctx.collector.reports).toHaveLength(1)
    expect(ctx.collector.reports[0]!.message).toBe('Test violation')
  })

  it('throws on report without message', () => {
    const ctx = createRuleContext(makeRuleOptions())
    expect(() => ctx.report({ message: '', severity: 'error' })).toThrow(TypeError)
  })

  it('clear clears collected reports', () => {
    const ctx = createRuleContext(makeRuleOptions())
    ctx.report({ message: 'test', severity: 'info' })
    expect(ctx.collector.reports).toHaveLength(1)
    ctx.collector.clear()
    expect(ctx.collector.reports).toHaveLength(0)
  })

  it('collects multiple reports', () => {
    const ctx = createRuleContext(makeRuleOptions())
    ctx.report({ message: 'first', severity: 'error' })
    ctx.report({ message: 'second', severity: 'warning' })
    expect(ctx.collector.reports).toHaveLength(2)
  })
})

// ─── createDefaultLogger ───

describe('createDefaultLogger', () => {
  it('returns logger with all methods', () => {
    const logger = createDefaultLogger()
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
  })
})

// ─── createSilentLogger ───

describe('createSilentLogger', () => {
  it('returns logger with all methods that do not throw', () => {
    const logger = createSilentLogger()
    expect(() => {
      logger.debug('test')
      logger.error('test')
      logger.info('test')
      logger.warn('test')
    }).not.toThrow()
  })
})
