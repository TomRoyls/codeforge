import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  FileWatcher,
  createWatcher,
  getDefaultWatcher,
  resetDefaultWatcher,
} from '../../../src/utils/watcher.js'

describe('FileWatcher', () => {
  beforeEach(() => {
    resetDefaultWatcher()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const watcher = new FileWatcher()
      expect(watcher.isActive()).toBe(false)
    })

    test('should accept debounceMs option', () => {
      const watcher = new FileWatcher({ debounceMs: 500 })
      expect(watcher.isActive()).toBe(false)
    })

    test('should accept extensions option', () => {
      const watcher = new FileWatcher({ extensions: ['.ts', '.js'] })
      expect(watcher.isActive()).toBe(false)
    })

    test('should accept ignorePatterns option', () => {
      const watcher = new FileWatcher({ ignorePatterns: ['node_modules', '*.test.ts'] })
      expect(watcher.isActive()).toBe(false)
    })

    test('should accept all options combined', () => {
      const watcher = new FileWatcher({
        debounceMs: 1000,
        extensions: ['.ts'],
        ignorePatterns: ['dist'],
      })
      expect(watcher.isActive()).toBe(false)
    })

    test('should handle empty options object', () => {
      const watcher = new FileWatcher({})
      expect(watcher.isActive()).toBe(false)
    })
  })

  describe('isActive', () => {
    test('should return false when not watching', () => {
      const watcher = new FileWatcher()
      expect(watcher.isActive()).toBe(false)
    })
  })

  describe('stop', () => {
    test('should handle stop when not watching', async () => {
      const watcher = new FileWatcher()
      await expect(watcher.stop()).resolves.not.toThrow()
      expect(watcher.isActive()).toBe(false)
    })
  })

  describe('factory functions', () => {
    test('createWatcher should return new instance', () => {
      const watcher1 = createWatcher()
      const watcher2 = createWatcher()

      expect(watcher1).not.toBe(watcher2)
    })

    test('getDefaultWatcher should return current default', () => {
      const watcher = createWatcher()
      const defaultWatcher = getDefaultWatcher()

      expect(defaultWatcher).toBe(watcher)
    })

    test('resetDefaultWatcher should clear default watcher', () => {
      createWatcher()
      expect(getDefaultWatcher()).not.toBeNull()

      resetDefaultWatcher()
      expect(getDefaultWatcher()).toBeNull()
    })

    test('createWatcher should stop previous watcher', async () => {
      const watcher1 = createWatcher()
      const stopSpy = vi.spyOn(watcher1, 'stop')

      createWatcher()

      expect(stopSpy).toHaveBeenCalled()
    })
  })

  describe('event emitter', () => {
    test('should be an event emitter', () => {
      const watcher = new FileWatcher()
      const handler = vi.fn()

      watcher.on('change', handler)
      watcher.emit('change', { filePath: 'test.ts', type: 'change' })

      expect(handler).toHaveBeenCalled()
    })

    test('should allow removing event listeners', () => {
      const watcher = new FileWatcher()
      const handler = vi.fn()

      watcher.on('change', handler)
      watcher.off('change', handler)
      watcher.emit('change', { filePath: 'test.ts', type: 'change' })

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
