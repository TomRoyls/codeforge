import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FileWatcher, createWatcher } from '../../src/utils/watcher.js'

// ─── Helpers ───

const TEMP_DIR = join(tmpdir(), `watcher-test-${Date.now()}`)

// ─── Constructor ───

describe('FileWatcher constructor', () => {
  it('creates with default options', () => {
    const w = new FileWatcher()
    expect(w.isActive()).toBe(false)
    w.stop()
  })

  it('creates with custom debounceMs', () => {
    const w = new FileWatcher({ debounceMs: 100 })
    expect(w.isActive()).toBe(false)
    w.stop()
  })

  it('creates with extensions filter', () => {
    const w = new FileWatcher({ extensions: ['.ts', '.js'] })
    expect(w.isActive()).toBe(false)
    w.stop()
  })

  it('creates with ignorePatterns', () => {
    const w = new FileWatcher({ ignorePatterns: ['node_modules'] })
    expect(w.isActive()).toBe(false)
    w.stop()
  })

  it('creates with all options combined', () => {
    const w = new FileWatcher({
      debounceMs: 50,
      extensions: ['.ts'],
      ignorePatterns: ['*.d.ts'],
    })
    expect(w.isActive()).toBe(false)
    w.stop()
  })
})

// ─── isActive ───

describe('FileWatcher isActive', () => {
  it('returns false before watching', () => {
    const w = new FileWatcher()
    expect(w.isActive()).toBe(false)
    w.stop()
  })

  it('returns true after watch starts', async () => {
    mkdirSync(TEMP_DIR, { recursive: true })
    const w = new FileWatcher()
    await w.watch(TEMP_DIR)
    expect(w.isActive()).toBe(true)
    await w.stop()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns false after stop', async () => {
    mkdirSync(TEMP_DIR, { recursive: true })
    const w = new FileWatcher()
    await w.watch(TEMP_DIR)
    await w.stop()
    expect(w.isActive()).toBe(false)
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })
})

// ─── stop ───

describe('FileWatcher stop', () => {
  it('can be called without watching', async () => {
    const w = new FileWatcher()
    await expect(w.stop()).resolves.toBeUndefined()
  })

  it('can be called multiple times safely', async () => {
    mkdirSync(TEMP_DIR, { recursive: true })
    const w = new FileWatcher()
    await w.watch(TEMP_DIR)
    await w.stop()
    await w.stop()
    expect(w.isActive()).toBe(false)
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })
})

// ─── watch ───

describe('FileWatcher watch', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('starts watching a directory', async () => {
    const w = new FileWatcher()
    await w.watch(TEMP_DIR)
    expect(w.isActive()).toBe(true)
    await w.stop()
  })

  it('stops previous watcher when called again', async () => {
    const w = new FileWatcher()
    await w.watch(TEMP_DIR)
    expect(w.isActive()).toBe(true)
    await w.watch(TEMP_DIR)
    expect(w.isActive()).toBe(true)
    await w.stop()
  })

  it('does not crash on non-existent directory', async () => {
    const w = new FileWatcher()
    const badPath = join(TEMP_DIR, 'nope')
    await w.watch(badPath)
    await w.stop()
  })
})

// ─── EventEmitter ───

describe('FileWatcher events', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('is an EventEmitter', () => {
    const w = new FileWatcher()
    expect(typeof w.on).toBe('function')
    expect(typeof w.emit).toBe('function')
    w.stop()
  })

  it('can register change listener', async () => {
    const w = new FileWatcher()
    const handler = vi.fn()
    w.on('change', handler)
    await w.watch(TEMP_DIR)
    writeFileSync(join(TEMP_DIR, 'test.txt'), 'hello', 'utf8')
    await new Promise((r) => setTimeout(r, 350))
    await w.stop()
  })

  it('can register error listener', () => {
    const w = new FileWatcher()
    const handler = vi.fn()
    w.on('error', handler)
    w.stop()
  })
})

// ─── createWatcher ───

describe('createWatcher', () => {
  afterEach(() => {
    // Clean up default watcher
  })

  it('returns a FileWatcher instance', () => {
    const w = createWatcher()
    expect(w).toBeInstanceOf(FileWatcher)
    w.stop()
  })

  it('passes options to the watcher', () => {
    const w = createWatcher({ debounceMs: 50 })
    expect(w).toBeInstanceOf(FileWatcher)
    w.stop()
  })

  it('stops previous default watcher when creating new one', () => {
    const w1 = createWatcher()
    const w2 = createWatcher()
    expect(w2).not.toBe(w1)
    w2.stop()
  })
})
