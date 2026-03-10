import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  FileWatcher,
  createWatcher,
  getDefaultWatcher,
  resetDefaultWatcher,
} from '../../../src/utils/watcher.js'
import * as fs from 'node:fs'

const mockClose = vi.fn()
const mockOn = vi.fn()

vi.mock('node:fs', () => ({
  watch: vi.fn(() => ({
    close: mockClose,
    on: mockOn,
  })),
  access: vi.fn((_path, _mode, callback) => {
    if (typeof _mode === 'function') {
      _mode(null)
    } else {
      callback(null)
    }
  }),
  stat: vi.fn((_path, callback) => {
    callback(null, { isDirectory: () => false, isFile: () => true })
  }),
  readdir: vi.fn((_path, callback) => {
    callback(null, [])
  }),
  constants: {
    F_OK: 0,
  },
}))

type WatchCallback = (eventType: string, filename: string | null) => void
type WatchCall = [fs.PathLike, fs.WatchOptions, WatchCallback]

function getWatchCallback(): WatchCallback {
  const calls = vi.mocked(fs.watch).mock.calls as unknown as WatchCall[]
  const lastCall = calls[calls.length - 1]
  return lastCall?.[2]
}

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

  describe('handleChange', () => {
    test('should emit change event for matching extension', async () => {
      const extensionWatcher = new FileWatcher({ extensions: ['.ts'] })
      const changeHandler = vi.fn()
      extensionWatcher.on('change', changeHandler)

      await extensionWatcher.watch('test-dir')

      const watchCallback = getWatchCallback()
      watchCallback('change', 'test.ts')

      await new Promise((resolve) => setTimeout(resolve, 350))

      expect(changeHandler).toHaveBeenCalledWith({
        filePath: expect.stringContaining('test.ts'),
        type: 'change',
      })
    })

    test('should not emit for non-matching extension', async () => {
      const extensionWatcher = new FileWatcher({ extensions: ['.ts'] })
      const changeHandler = vi.fn()
      extensionWatcher.on('change', changeHandler)

      await extensionWatcher.watch('test-dir')

      const watchCallback = getWatchCallback()
      watchCallback('change', 'test.md')

      await new Promise((resolve) => setTimeout(resolve, 350))

      expect(changeHandler).not.toHaveBeenCalled()
    })

    test('should handle null filename gracefully', async () => {
      await watcher.watch('test-dir')

      const watchCallback = getWatchCallback()
      expect(() => watchCallback('change', null)).not.toThrow()
    })

    test('should ignore files matching ignore patterns', async () => {
      const ignoreWatcher = new FileWatcher({ ignorePatterns: ['node_modules'] })
      const changeHandler = vi.fn()
      ignoreWatcher.on('change', changeHandler)

      await ignoreWatcher.watch('test-dir')

      const watchCallback = getWatchCallback()
      watchCallback('change', 'node_modules')

      await new Promise((resolve) => setTimeout(resolve, 350))

      expect(changeHandler).not.toHaveBeenCalled()
    })
  })

  describe('fileExists error handling', () => {
    test('should emit unlink event when file does not exist', async () => {
      vi.mocked(fs.access).mockImplementation(((
        _path: fs.PathLike,
        _mode: unknown,
        callback?: (err: NodeJS.ErrnoException | null) => void,
      ) => {
        const cb = typeof _mode === 'function' ? _mode : callback
        cb?.(new Error('File not found') as NodeJS.ErrnoException)
      }) as typeof fs.access)

      const changeHandler = vi.fn()
      watcher.on('change', changeHandler)

      await watcher.watch('test-dir')

      const watchCallback = getWatchCallback()
      watchCallback('change', 'deleted.ts')

      await new Promise((resolve) => setTimeout(resolve, 350))

      expect(changeHandler).toHaveBeenCalledWith({
        filePath: expect.stringContaining('deleted.ts'),
        type: 'unlink',
      })

      vi.mocked(fs.access).mockImplementation(((
        _path: fs.PathLike,
        _mode: unknown,
        callback?: (err: NodeJS.ErrnoException | null) => void,
      ) => {
        const cb = typeof _mode === 'function' ? _mode : callback
        cb?.(null)
      }) as typeof fs.access)
    })
  })

  describe('watchDirectory error handling', () => {
    test('should handle fs.watch throwing an error', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw new Error('Cannot watch directory')
      })

      await expect(watcher.watch('nonexistent-dir')).resolves.not.toThrow()
    })

    test('should emit error event when watcher errors', async () => {
      const errorHandler = vi.fn()
      watcher.on('error', errorHandler)

      await watcher.watch('test-dir')

      const errorCall = mockOn.mock.calls.find((call) => call[0] === 'error')
      expect(errorCall).toBeDefined()

      const errorCallback = errorCall?.[1] as (error: Error) => void
      const testError = new Error('Watcher error')
      errorCallback(testError)

      expect(errorHandler).toHaveBeenCalledWith(testError)
    })

    test('should recursively watch subdirectories', async () => {
      let readdirCallCount = 0
      vi.mocked(fs.readdir).mockImplementation(((_path, callback) => {
        readdirCallCount++
        if (readdirCallCount === 1) {
          callback(null, ['subdir', 'file.ts'])
        } else {
          callback(null, [])
        }
      }) as typeof fs.readdir)

      let statCallCount = 0
      vi.mocked(fs.stat).mockImplementation(((_path, callback) => {
        statCallCount++
        const isDir = statCallCount === 1
        callback(null, { isDirectory: () => isDir, isFile: () => !isDir } as fs.Stats)
      }) as typeof fs.stat)

      await watcher.watch('test-dir')

      expect(fs.watch).toHaveBeenCalledTimes(2)
    })

    test('should ignore directories matching ignore patterns during recursion', async () => {
      let readdirCallCount = 0
      vi.mocked(fs.readdir).mockImplementation(((_path, callback) => {
        readdirCallCount++
        if (readdirCallCount === 1) {
          callback(null, ['node_modules', 'src'])
        } else {
          callback(null, [])
        }
      }) as typeof fs.readdir)

      vi.mocked(fs.stat).mockImplementation(((_path, callback) => {
        callback(null, { isDirectory: () => true, isFile: () => false } as fs.Stats)
      }) as typeof fs.stat)

      const ignoreWatcher = new FileWatcher({ ignorePatterns: ['node_modules'] })
      await ignoreWatcher.watch('test-dir')

      const watchCalls = vi.mocked(fs.watch).mock.calls
      const watchedPaths = watchCalls.map((call) => call[0].toString())

      expect(watchedPaths.some((p) => p.includes('node_modules'))).toBe(false)
      expect(watchedPaths.some((p) => p.includes('src'))).toBe(true)
    })
  })

  describe('createWatcher error handling', () => {
    test('should handle error when stopping previous watcher', async () => {
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      const firstWatcher = createWatcher()
      await firstWatcher.watch('test-dir')

      mockClose.mockImplementationOnce(() => {
        throw new Error('Stop failed')
      })

      const secondWatcher = createWatcher()
      expect(secondWatcher).not.toBe(firstWatcher)

      consoleDebugSpy.mockRestore()
    })
  })

  describe('resetDefaultWatcher error handling', () => {
    test('should handle error when stopping watcher during reset', async () => {
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      const testWatcher = createWatcher()
      await testWatcher.watch('test-dir')

      mockClose.mockImplementationOnce(() => {
        throw new Error('Stop failed')
      })

      expect(() => resetDefaultWatcher()).not.toThrow()
      expect(getDefaultWatcher()).toBeNull()

      consoleDebugSpy.mockRestore()
    })
  })
})
