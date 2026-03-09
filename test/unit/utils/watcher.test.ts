import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  FileWatcher,
  createWatcher,
  getDefaultWatcher,
  resetDefaultWatcher,
} from '../../../src/utils/watcher.js'
import * as fs from 'node:fs'

vi.mock('node:fs', () => ({
  watch: vi.fn(() => ({
    close: vi.fn(),
    on: vi.fn(),
  })),
  access: vi.fn((_path, callback) => {
    callback(null)
  }),
  stat: vi.fn((_path, callback) => {
    callback(null, { isDirectory: () => false, isFile: () => true })
  }),
  readdir: vi.fn((_path, callback) => {
    callback(null, [])
  }),
}))

describe('FileWatcher', () => {
  let watcher: FileWatcher

  beforeEach(() => {
    vi.clearAllMocks()
    resetDefaultWatcher()
    watcher = new FileWatcher()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      expect(watcher.isActive()).toBe(false)
    })

    test('should accept custom debounceMs option', () => {
      const customWatcher = new FileWatcher({ debounceMs: 500 })
      expect(customWatcher.isActive()).toBe(false)
    })

    test('should accept extensions option', () => {
      const customWatcher = new FileWatcher({ extensions: ['.ts'] })
      expect(customWatcher.isActive()).toBe(false)
    })

    test('should accept ignorePatterns option', () => {
      const customWatcher = new FileWatcher({ ignorePatterns: ['node_modules'] })
      expect(customWatcher.isActive()).toBe(false)
    })
  })

  describe('watch', () => {
    test('should set isWatching to true', async () => {
      await watcher.watch('test-dir')
      expect(watcher.isActive()).toBe(true)
    })

    test('should call fs.watch with correct options', async () => {
      await watcher.watch('test-dir')
      expect(fs.watch).toHaveBeenCalled()
    })

    test('should resolve without return value', async () => {
      const result = await watcher.watch('test-dir')
      expect(result).toBeUndefined()
    })

    test('should watch with non-recursive mode', async () => {
      await watcher.watch('test-dir')
      expect(fs.watch).toHaveBeenCalledWith(
        expect.stringContaining('test-dir'),
        expect.objectContaining({ recursive: false, persistent: true }),
        expect.any(Function),
      )
    })
  })

  describe('stop', () => {
    test('should handle stop when not watching', async () => {
      await expect(watcher.stop()).resolves.not.toThrow()
      expect(watcher.isActive()).toBe(false)
    })

    test('should close all watchers', async () => {
      await watcher.watch('test-dir')
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
    })

    test('should set isWatching to false', async () => {
      await watcher.watch('test-dir')
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
    })
  })

  describe('isActive', () => {
    test('should return false before watch', () => {
      expect(watcher.isActive()).toBe(false)
    })

    test('should return true after watch', async () => {
      await watcher.watch('test-dir')
      expect(watcher.isActive()).toBe(true)
    })

    test('should return false after stop', async () => {
      await watcher.watch('test-dir')
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
    })
  })

  describe('factory functions', () => {
    test('createWatcher should return new instance', () => {
      const watcher1 = createWatcher()
      const watcher2 = createWatcher()
      expect(watcher1).not.toBe(watcher2)
    })

    test('createWatcher should set default watcher', () => {
      const createdWatcher = createWatcher()
      const defaultWatcher = getDefaultWatcher()
      expect(defaultWatcher).toBe(createdWatcher)
    })

    test('getDefaultWatcher should return null initially after reset', () => {
      resetDefaultWatcher()
      expect(getDefaultWatcher()).toBeNull()
    })

    test('resetDefaultWatcher should clear default watcher', () => {
      createWatcher()
      expect(getDefaultWatcher()).not.toBeNull()
      resetDefaultWatcher()
      // After reset, defaultWatcher is null (asynchronously stopped but immediately set to null)
      expect(getDefaultWatcher()).toBeNull()
    })
  })

  describe('event emitter', () => {
    test('should be an event emitter', () => {
      const handler = vi.fn()
      watcher.on('change', handler)
      watcher.emit('change', { filePath: 'test.ts', type: 'change' })
      expect(handler).toHaveBeenCalled()
    })

    test('should allow removing event listeners', () => {
      const handler = vi.fn()
      watcher.on('change', handler)
      watcher.off('change', handler)
      watcher.emit('change', { filePath: 'test.ts', type: 'change' })
      expect(handler).not.toHaveBeenCalled()
    })
  })
})
