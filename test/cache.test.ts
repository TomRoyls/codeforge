import { describe, it, expect } from 'vitest'

import Cache from '../src/commands/cache.js'
import { formatSize } from '../src/commands/cache-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Cache command - static metadata', () => {
  it('has a description', () => {
    expect(Cache.description).toBe('Manage the CodeForge cache')
  })

  it('has examples array', () => {
    expect(Array.isArray(Cache.examples)).toBe(true)
    expect(Cache.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has args with action options', () => {
    expect(Cache.args.action).toBeDefined()
    expect(Cache.args.action.options).toEqual(['status', 'clear'])
  })

  it('action arg defaults to status', () => {
    expect(Cache.args.action.default).toBe('status')
  })
})

// ─── Flags ───────────────────────────────────────────────
describe('Cache command - flags', () => {
  it('has clear flag with char c', () => {
    expect(Cache.flags.clear.char).toBe('c')
    expect(Cache.flags.clear.default).toBe(false)
  })

  it('has status flag with char s', () => {
    expect(Cache.flags.status.char).toBe('s')
    expect(Cache.flags.status.default).toBe(false)
  })

  it('has path flag with char p', () => {
    expect(Cache.flags.path.char).toBe('p')
  })

  it('clear and status are exclusive', () => {
    expect(Cache.flags.clear.exclusive).toContain('status')
    expect(Cache.flags.status.exclusive).toContain('clear')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Cache command - class structure', () => {
  it('exports a default class', () => {
    expect(Cache).toBeDefined()
    expect(typeof Cache).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Cache.prototype.run).toBe('function')
  })

  it('has getCacheStats method', () => {
    expect(typeof Cache.prototype.getCacheStats).toBe('function')
  })

  it('has formatSize instance method', () => {
    expect(typeof Cache.prototype.formatSize).toBe('function')
  })
})

// ─── formatSize delegation ───────────────────────────────
describe('Cache command - formatSize delegates to helper', () => {
  it('formatSize from helpers formats bytes correctly', () => {
    expect(formatSize(0)).toBe('0.0 B')
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(1048576)).toBe('1.0 MB')
  })
})
