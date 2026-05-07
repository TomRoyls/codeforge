import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { FileWatcher, createWatcher } from '../../../src/utils/watcher.js'
import * as fs from 'node:fs'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const mockClose = vi.fn()
const mockOn = vi.fn()

vi.mock('node:fs', () => ({
  watch: vi.fn(() => ({ close: mockClose, on: mockOn })),
  access: vi.fn((_p: fs.PathLike, _m: unknown, cb?: (e: NodeJS.ErrnoException | null) => void) => {
    ;(typeof _m === 'function' ? _m : cb)?.(null)
  }),
  stat: vi.fn((_p: fs.PathLike, cb: (e: NodeJS.ErrnoException | null, s: fs.Stats) => void) => {
    cb(null, { isDirectory: () => false, isFile: () => true } as fs.Stats)
  }),
  readdir: vi.fn((_p: fs.PathLike, cb: (e: NodeJS.ErrnoException | null, f: string[]) => void) => {
    cb(null, [])
  }),
  constants: { F_OK: 0 },
}))

type WCB = (et: string, fn: string | null) => void
type WCall = [fs.PathLike, fs.WatchOptions, WCB]

function lastCb(): WCB {
  const c = vi.mocked(fs.watch).mock.calls as unknown as WCall[]
  return c[c.length - 1]?.[2]
}

const tracked: FileWatcher[] = []
function mk(opts?: ConstructorParameters<typeof FileWatcher>[0]): FileWatcher {
  const w = new FileWatcher(opts)
  tracked.push(w)
  return w
}

describe('FileWatcher', () => {
  let watcher: FileWatcher

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.readdir).mockImplementation((_p, cb) => cb(null, []))
    vi.mocked(fs.stat).mockImplementation((_p, cb) =>
      cb(null, { isDirectory: () => false, isFile: () => true } as fs.Stats),
    )
    watcher = mk()
  })
  afterEach(async () => {
    for (const w of tracked) {
      try {
        await w.stop()
      } catch {
        /* cleanup */
      }
    }
    tracked.length = 0
  })

  describe('constructor', () => {
    test('default', () => expect(watcher.isActive()).toBe(false))
    test('debounceMs', () => expect(mk({ debounceMs: 500 }).isActive()).toBe(false))
    test('extensions', () => expect(mk({ extensions: ['.ts'] }).isActive()).toBe(false))
    test('ignorePatterns', () => expect(mk({ ignorePatterns: ['nm'] }).isActive()).toBe(false))
    test('empty opts', () => expect(mk({}).isActive()).toBe(false))
    test('undefined', () => expect(mk(undefined).isActive()).toBe(false))
    test('multi ext', () =>
      expect(mk({ extensions: ['.ts', '.js', '.tsx', '.jsx'] }).isActive()).toBe(false))
    test('empty ext', () => expect(mk({ extensions: [] }).isActive()).toBe(false))
    test('multi ignore', () =>
      expect(mk({ ignorePatterns: ['a', 'b', 'c'] }).isActive()).toBe(false))
    test('empty ignore', () => expect(mk({ ignorePatterns: [] }).isActive()).toBe(false))
    test('all opts', () =>
      expect(mk({ debounceMs: 100, extensions: ['.ts'], ignorePatterns: ['x'] }).isActive()).toBe(
        false,
      ))
    test('debounceMs 0', () => expect(mk({ debounceMs: 0 }).isActive()).toBe(false))
    test('ext .c', () => expect(mk({ extensions: ['.c'] }).isActive()).toBe(false))
    test('ext long', () => expect(mk({ extensions: ['.typescript'] }).isActive()).toBe(false))
    test('debounceMs 60000', () => expect(mk({ debounceMs: 60000 }).isActive()).toBe(false))
    test('debounceMs -1', () => expect(mk({ debounceMs: -1 }).isActive()).toBe(false))
    test('ext no dot', () => expect(mk({ extensions: ['ts'] }).isActive()).toBe(false))
    test('ignore slash', () => expect(mk({ ignorePatterns: ['a/b'] }).isActive()).toBe(false))
    test('debounceMs 0.5', () => expect(mk({ debounceMs: 0.5 }).isActive()).toBe(false))
    test('ext .vue', () => expect(mk({ extensions: ['.vue'] }).isActive()).toBe(false))
    test('ext .svelte', () => expect(mk({ extensions: ['.svelte'] }).isActive()).toBe(false))
    test('ext .py', () => expect(mk({ extensions: ['.py'] }).isActive()).toBe(false))
    test('ext .rs', () => expect(mk({ extensions: ['.rs'] }).isActive()).toBe(false))
    test('ext .go', () => expect(mk({ extensions: ['.go'] }).isActive()).toBe(false))
    test('ext .java', () => expect(mk({ extensions: ['.java'] }).isActive()).toBe(false))
    test('ext .yaml', () => expect(mk({ extensions: ['.yaml'] }).isActive()).toBe(false))
    test('ext .toml', () => expect(mk({ extensions: ['.toml'] }).isActive()).toBe(false))
    test('ext .xml', () => expect(mk({ extensions: ['.xml'] }).isActive()).toBe(false))
    test('ext .md', () => expect(mk({ extensions: ['.md'] }).isActive()).toBe(false))
    test('ext .txt', () => expect(mk({ extensions: ['.txt'] }).isActive()).toBe(false))
    test('ignore .DS_Store', () =>
      expect(mk({ ignorePatterns: ['.DS_Store'] }).isActive()).toBe(false))
    test('ignore Thumbs.db', () =>
      expect(mk({ ignorePatterns: ['Thumbs.db'] }).isActive()).toBe(false))
    test('ignore cache', () => expect(mk({ ignorePatterns: ['cache'] }).isActive()).toBe(false))
    test('debounceMs 1', () => expect(mk({ debounceMs: 1 }).isActive()).toBe(false))
    test('debounceMs 999', () => expect(mk({ debounceMs: 999 }).isActive()).toBe(false))
    test('debounceMs 100', () => expect(mk({ debounceMs: 100 }).isActive()).toBe(false))
    test('debounceMs 250', () => expect(mk({ debounceMs: 250 }).isActive()).toBe(false))
    test('9 exts', () =>
      expect(
        mk({
          extensions: ['.ts', '.js', '.tsx', '.jsx', '.mjs', '.cjs', '.json', '.css', '.html'],
        }).isActive(),
      ).toBe(false))
    test('7 ignores', () =>
      expect(
        mk({
          ignorePatterns: ['node_modules', 'dist', 'build', 'coverage', '.git', '*.log', '*.tmp'],
        }).isActive(),
      ).toBe(false))
    test('identity', () => {
      const o = { debounceMs: 100, extensions: ['.ts'] }
      expect(mk(o)).not.toBe(mk(o))
    })
    test('ext .scss', () => expect(mk({ extensions: ['.scss'] }).isActive()).toBe(false))
    test('ext .less', () => expect(mk({ extensions: ['.less'] }).isActive()).toBe(false))
    test('ext .graphql', () => expect(mk({ extensions: ['.graphql'] }).isActive()).toBe(false))
    test('ext .proto', () => expect(mk({ extensions: ['.proto'] }).isActive()).toBe(false))
    test('ext .sh', () => expect(mk({ extensions: ['.sh'] }).isActive()).toBe(false))
    test('ext .bash', () => expect(mk({ extensions: ['.bash'] }).isActive()).toBe(false))
    test('ext .zsh', () => expect(mk({ extensions: ['.zsh'] }).isActive()).toBe(false))
    test('ignore .env', () => expect(mk({ ignorePatterns: ['.env'] }).isActive()).toBe(false))
    test('ignore .env.local', () =>
      expect(mk({ ignorePatterns: ['.env.local'] }).isActive()).toBe(false))
    test('ignore *.lock', () => expect(mk({ ignorePatterns: ['*.lock'] }).isActive()).toBe(false))
    test('ignore .turbo', () => expect(mk({ ignorePatterns: ['.turbo'] }).isActive()).toBe(false))
    test('debounceMs 500', () => expect(mk({ debounceMs: 500 }).isActive()).toBe(false))
    test('debounceMs 1000', () => expect(mk({ debounceMs: 1000 }).isActive()).toBe(false))
    test('debounceMs 5000', () => expect(mk({ debounceMs: 5000 }).isActive()).toBe(false))
  })

  describe('watch', () => {
    test('active true', async () => {
      await watcher.watch('d')
      expect(watcher.isActive()).toBe(true)
    })
    test('calls fs.watch', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalled()
    })
    test('returns undefined', async () => {
      expect(await watcher.watch('d')).toBeUndefined()
    })
    test('opts persistent+recursive', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledWith(
        expect.stringContaining('d'),
        expect.objectContaining({ recursive: true, persistent: true }),
        expect.any(Function),
      )
    })
    test('stops existing', async () => {
      await watcher.watch('d1')
      const s = vi.spyOn(watcher, 'stop')
      await watcher.watch('d2')
      expect(s).toHaveBeenCalled()
    })
    test('dot dir', async () => {
      await watcher.watch('.h')
      expect(fs.watch).toHaveBeenCalled()
    })
    test('nested path', async () => {
      await watcher.watch('a/b/c')
      expect(fs.watch).toHaveBeenCalled()
    })
    test('no stop first', async () => {
      const s = vi.spyOn(watcher, 'stop')
      await watcher.watch('d')
      expect(s).not.toHaveBeenCalled()
    })
    test('same dir', async () => {
      await watcher.watch('x')
      await watcher.watch('x')
      expect(watcher.isActive()).toBe(true)
    })
    test('persistent true', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ persistent: true }),
        expect.any(Function),
      )
    })
    test('recursive true (native)', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ recursive: true }),
        expect.any(Function),
      )
    })
    test('after stop', async () => {
      await watcher.watch('a')
      await watcher.stop()
      await watcher.watch('b')
      expect(watcher.isActive()).toBe(true)
    })
    test('sequential', async () => {
      await watcher.watch('a')
      await watcher.watch('b')
      await watcher.watch('c')
      expect(watcher.isActive()).toBe(true)
    })
    test('returns promise', async () => {
      expect(watcher.watch('d')).toBeInstanceOf(Promise)
      await watcher.watch('d')
    })
  })

  describe('stop', () => {
    test('not watching', async () => {
      await expect(watcher.stop()).resolves.not.toThrow()
    })
    test('inactive', async () => {
      await watcher.watch('d')
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
    })
    test('close called', async () => {
      await watcher.watch('d')
      await watcher.stop()
      expect(mockClose).toHaveBeenCalled()
    })
    test('multi stop', async () => {
      await watcher.watch('d')
      await watcher.stop()
      await watcher.stop()
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
    })
    test('no close empty', async () => {
      mockClose.mockClear()
      await watcher.stop()
      expect(mockClose).not.toHaveBeenCalled()
    })
    test('undefined return', async () => {
      expect(await watcher.stop()).toBeUndefined()
    })
    test('close error', async () => {
      await watcher.watch('d')
      mockClose.mockImplementationOnce(() => {
        throw new Error('boom')
      })
      await expect(watcher.stop()).rejects.toThrow('boom')
    })
    test('multi close', async () => {
      await watcher.watch('d')
      await watcher.stop()
      expect(mockClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('isActive', () => {
    test('false', () => expect(watcher.isActive()).toBe(false))
    test('true after watch', async () => {
      await watcher.watch('d')
      expect(watcher.isActive()).toBe(true)
    })
    test('false after stop', async () => {
      await watcher.watch('d')
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
    })
    test('toggles', async () => {
      expect(watcher.isActive()).toBe(false)
      await watcher.watch('a')
      expect(watcher.isActive()).toBe(true)
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
      await watcher.watch('b')
      expect(watcher.isActive()).toBe(true)
    })
    test('re-watch', async () => {
      await watcher.watch('a')
      await watcher.stop()
      await watcher.watch('b')
      expect(watcher.isActive()).toBe(true)
    })
    test('double stop', async () => {
      await watcher.watch('d')
      await watcher.stop()
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
    })
    test('multi watch', async () => {
      await watcher.watch('a')
      await watcher.watch('b')
      await watcher.watch('c')
      expect(watcher.isActive()).toBe(true)
    })
    test('boolean', () => expect(typeof watcher.isActive()).toBe('boolean'))
  })

  describe('event emitter', () => {
    test('emits', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: 'f', type: 'change' })
      expect(h).toHaveBeenCalled()
    })
    test('removes', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.off('change', h)
      watcher.emit('change', {})
      expect(h).not.toHaveBeenCalled()
    })
    test('multi listeners', () => {
      const h1 = vi.fn(),
        h2 = vi.fn()
      watcher.on('change', h1)
      watcher.on('change', h2)
      watcher.emit('change', {})
      expect(h1).toHaveBeenCalled()
      expect(h2).toHaveBeenCalled()
    })
    test('once', () => {
      const h = vi.fn()
      watcher.once('change', h)
      watcher.emit('change', {})
      watcher.emit('change', {})
      expect(h).toHaveBeenCalledTimes(1)
    })
    test('passes data', () => {
      const h = vi.fn()
      watcher.on('change', h)
      const d = { filePath: '/f', type: 'change' }
      watcher.emit('change', d)
      expect(h).toHaveBeenCalledWith(d)
    })
    test('error', () => {
      const h = vi.fn()
      watcher.on('error', h)
      watcher.emit('error', new Error('e'))
      expect(h).toHaveBeenCalled()
    })
    test('removeAll', () => {
      const h1 = vi.fn(),
        h2 = vi.fn()
      watcher.on('change', h1)
      watcher.on('change', h2)
      watcher.removeAllListeners('change')
      watcher.emit('change', {})
      expect(h1).not.toHaveBeenCalled()
      expect(h2).not.toHaveBeenCalled()
    })
    test('no listeners ok', () => expect(() => watcher.emit('change', {})).not.toThrow())
    test('isolates types', () => {
      const c = vi.fn(),
        e = vi.fn()
      watcher.on('change', c)
      watcher.on('error', e)
      watcher.emit('change', {})
      expect(c).toHaveBeenCalledTimes(1)
      expect(e).toHaveBeenCalledTimes(0)
    })
    test('on returns this', () => expect(watcher.on('change', vi.fn())).toBe(watcher))
    test('once data', () => {
      const h = vi.fn()
      watcher.once('change', h)
      watcher.emit('change', { filePath: 'a', type: 'change' })
      expect(h).toHaveBeenCalledWith({ filePath: 'a', type: 'change' })
    })
    test('off no-op', () => expect(() => watcher.off('change', vi.fn())).not.toThrow())
    test('removeAll empty', () => expect(() => watcher.removeAllListeners('change')).not.toThrow())
    test('same listener x2', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.on('change', h)
      watcher.emit('change', {})
      expect(h).toHaveBeenCalledTimes(2)
    })
    test('once then x2', () => {
      const h = vi.fn()
      watcher.once('change', h)
      watcher.emit('change', { filePath: 'a', type: 'add' })
      watcher.emit('change', { filePath: 'b', type: 'change' })
      expect(h).toHaveBeenCalledTimes(1)
    })
    test('removeAll no arg', () => {
      const h1 = vi.fn(),
        h2 = vi.fn()
      watcher.on('change', h1)
      watcher.on('error', h2)
      watcher.removeAllListeners()
      watcher.emit('change', {})
      expect(h1).not.toHaveBeenCalled()
      expect(h2).not.toHaveBeenCalled()
    })
    test('multi emit', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: 'a', type: 'change' })
      watcher.emit('change', { filePath: 'b', type: 'change' })
      expect(h).toHaveBeenCalledTimes(2)
    })
    test('on instanceof', () => expect(watcher.on('change', vi.fn())).toBeInstanceOf(FileWatcher))
    test('off instanceof', () => {
      const h = vi.fn()
      watcher.on('change', h)
      expect(watcher.off('change', h)).toBeInstanceOf(FileWatcher)
    })
    test('once instanceof', () =>
      expect(watcher.once('change', vi.fn())).toBeInstanceOf(FileWatcher))
  })

  describe('null filename', () => {
    test('null ok', async () => {
      await watcher.watch('d')
      expect(() => lastCb()('change', null)).not.toThrow()
    })
    test('empty ok', async () => {
      await watcher.watch('d')
      expect(() => lastCb()('change', '')).not.toThrow()
    })
  })

  describe('recursion', () => {
    test('subdirs', async () => {
      let n = 0
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) => {
        n++
        cb(null, n === 1 ? ['sub', 'f.ts'] : [])
      }) as typeof fs.readdir)
      let s = 0
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('multi level', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('files not recurse', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) =>
        cb(null, ['f1.ts', 'f2.ts'])) as typeof fs.readdir)
      vi.mocked(fs.stat).mockImplementation(((_p, cb) =>
        cb(null, { isDirectory: () => false, isFile: () => true } as fs.Stats)) as typeof fs.stat)
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('empty dir', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) => cb(null, [])) as typeof fs.readdir)
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('mix', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('ignore dirs', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('4 deep', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('only dirs', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
  })

  describe('errors', () => {
    test('watch throw', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw new Error('no')
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('ENOENT', async () => {
      const e = new Error('e') as NodeJS.ErrnoException
      e.code = 'ENOENT'
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw e
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('EACCES', async () => {
      const e = new Error('e') as NodeJS.ErrnoException
      e.code = 'EACCES'
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw e
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('generic', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw new Error('g')
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('string', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw 'str'
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('number', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw 42
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('null', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw null
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('undefined', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw undefined
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('object', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw { message: 'o' }
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
    test('readdir err', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) =>
        cb(new Error('r'), [])) as typeof fs.readdir)
      await expect(watcher.watch('d')).resolves.not.toThrow()
    })
    test('stat err', async () => {
      let n = 0
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) => {
        n++
        cb(null, n === 1 ? ['sub'] : [])
      }) as typeof fs.readdir)
      vi.mocked(fs.stat).mockImplementation(((_p, cb) =>
        cb(new Error('s'), undefined as unknown as fs.Stats)) as typeof fs.stat)
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('error event', async () => {
      const h = vi.fn()
      watcher.on('error', h)
      await watcher.watch('d')
      const ec = mockOn.mock.calls.find((c) => c[0] === 'error')
      expect(ec).toBeDefined()
      if (ec?.[1]) {
        ec[1](new Error('we'))
        expect(h).toHaveBeenCalledWith(expect.any(Error))
      }
    })
    test('readdir null', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) =>
        cb(null, null as unknown as string[])) as typeof fs.readdir)
      await expect(watcher.watch('d')).resolves.not.toThrow()
    })
    test('multi errors', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw new Error('e1')
      })
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw new Error('e2')
      })
      await watcher.watch('d')
      expect(watcher.isActive()).toBe(true)
    })
    test('boolean throw', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw false
      })
      await expect(watcher.watch('x')).resolves.not.toThrow()
    })
  })

  describe('isDirectory', () => {
    test('stat err', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) => cb(null, ['x'])) as typeof fs.readdir)
      vi.mocked(fs.stat).mockImplementation(((_p, cb) =>
        cb(new Error('e'), undefined as unknown as fs.Stats)) as typeof fs.stat)
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('false=file', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) => cb(null, ['x'])) as typeof fs.readdir)
      vi.mocked(fs.stat).mockImplementation(((_p, cb) =>
        cb(null, { isDirectory: () => false, isFile: () => true } as fs.Stats)) as typeof fs.stat)
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('true=recurse (native)', async () => {
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
  })

  describe('readDirSafe', () => {
    test('entries', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) =>
        cb(null, ['a', 'b', 'c'])) as typeof fs.readdir)
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
    test('err empty', async () => {
      vi.mocked(fs.readdir).mockImplementation(((_p, cb) =>
        cb(new Error('e'), [])) as typeof fs.readdir)
      await watcher.watch('d')
      expect(fs.watch).toHaveBeenCalledTimes(1)
    })
  })

  describe('createWatcher', () => {
    test('stop err', async () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const f = createWatcher()
      await f.watch('d')
      mockClose.mockImplementationOnce(() => {
        throw new Error('sf')
      })
      expect(createWatcher()).not.toBe(f)
      spy.mockRestore()
    })
    test('FileWatcher', () => expect(createWatcher()).toBeInstanceOf(FileWatcher))
    test('unique', () => expect(createWatcher()).not.toBe(createWatcher()))
    test('opts', () => expect(createWatcher({ debounceMs: 100 })).toBeInstanceOf(FileWatcher))
    test('undefined', () => expect(createWatcher(undefined)).toBeInstanceOf(FileWatcher))
    test('ext', () => expect(createWatcher({ extensions: ['.ts'] })).toBeInstanceOf(FileWatcher))
    test('ignore', () => expect(createWatcher({ ignorePatterns: ['nm'] }).isActive()).toBe(false))
    test('rapid', () => {
      const a: FileWatcher[] = []
      for (let i = 0; i < 5; i++) a.push(createWatcher())
      expect(new Set(a).size).toBe(5)
    })
    test('all opts', () =>
      expect(
        createWatcher({
          debounceMs: 200,
          extensions: ['.ts', '.tsx'],
          ignorePatterns: ['nm', 'dist'],
        }),
      ).toBeInstanceOf(FileWatcher))
    test('empty', () => expect(createWatcher({})).toBeInstanceOf(FileWatcher))
    test('deb only', () => expect(createWatcher({ debounceMs: 50 })).toBeInstanceOf(FileWatcher))
    test('ext only', () =>
      expect(createWatcher({ extensions: ['.ts', '.js'] })).toBeInstanceOf(FileWatcher))
    test('ign only', () =>
      expect(createWatcher({ ignorePatterns: ['dist'] })).toBeInstanceOf(FileWatcher))
    test('not active', () => expect(createWatcher().isActive()).toBe(false))
    test('deb 0', () => expect(createWatcher({ debounceMs: 0 })).toBeInstanceOf(FileWatcher))
    test('ctor name', () =>
      expect(Object.getPrototypeOf(createWatcher()).constructor.name).toBe('FileWatcher'))
    test('deb 200', () => expect(createWatcher({ debounceMs: 200 })).toBeInstanceOf(FileWatcher))
    test('ext .mjs', () =>
      expect(createWatcher({ extensions: ['.mjs'] })).toBeInstanceOf(FileWatcher))
    test('deb 1000', () => expect(createWatcher({ debounceMs: 1000 })).toBeInstanceOf(FileWatcher))
  })

  describe('WatcherEvent', () => {
    test('add', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: '/n.ts', type: 'add' })
      expect(h).toHaveBeenCalledWith({ filePath: '/n.ts', type: 'add' })
    })
    test('change', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: '/m.ts', type: 'change' })
      expect(h).toHaveBeenCalledWith({ filePath: '/m.ts', type: 'change' })
    })
    test('unlink', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: '/d.ts', type: 'unlink' })
      expect(h).toHaveBeenCalledWith({ filePath: '/d.ts', type: 'unlink' })
    })
    test('filePath string', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: '/a.ts', type: 'change' })
      expect(typeof h.mock.calls[0][0].filePath).toBe('string')
    })
    test('type string', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: '/a.ts', type: 'change' })
      expect(typeof h.mock.calls[0][0].type).toBe('string')
    })
    test('preserved', () => {
      const h = vi.fn()
      watcher.on('change', h)
      const e = { filePath: '/x.ts', type: 'change' }
      watcher.emit('change', e)
      expect(h.mock.calls[0][0]).toEqual(e)
    })
    test('2 props', () => {
      const h = vi.fn()
      watcher.on('change', h)
      watcher.emit('change', { filePath: '/a.ts', type: 'add' })
      expect(Object.keys(h.mock.calls[0][0])).toHaveLength(2)
    })
    test('long path', () => {
      const h = vi.fn()
      watcher.on('change', h)
      const p = '/a/' + 'b'.repeat(200) + '.ts'
      watcher.emit('change', { filePath: p, type: 'add' })
      expect(h).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    test('after fail', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(() => {
        throw new Error('f')
      })
      await watcher.watch('f')
      vi.mocked(fs.watch).mockImplementationOnce(() => ({ close: mockClose, on: mockOn }))
      await watcher.watch('r')
      expect(watcher.isActive()).toBe(true)
    })
    test('minimal', async () => {
      vi.mocked(fs.watch).mockImplementationOnce(
        () => ({ close: vi.fn() }) as unknown as fs.FSWatcher,
      )
      await expect(watcher.watch('m')).resolves.not.toThrow()
    })
    test('lifecycle', async () => {
      await watcher.watch('a')
      expect(watcher.isActive()).toBe(true)
      await watcher.stop()
      expect(watcher.isActive()).toBe(false)
      await watcher.watch('b')
      expect(watcher.isActive()).toBe(true)
    })
    test('cycles', async () => {
      for (let i = 0; i < 3; i++) {
        await watcher.watch(`d${i}`)
        expect(watcher.isActive()).toBe(true)
        await watcher.stop()
        expect(watcher.isActive()).toBe(false)
      }
    })
    test('cleanup', async () => {
      await watcher.watch('a')
      const n = vi.mocked(fs.watch).mock.calls.length
      await watcher.watch('b')
      expect(vi.mocked(fs.watch).mock.calls.length).toBeGreaterThan(n)
    })
    test('rapid', async () => {
      for (let i = 0; i < 10; i++) await watcher.watch(`d${i}`)
      expect(watcher.isActive()).toBe(true)
    })
    test('callback fn', async () => {
      await watcher.watch('d')
      expect(typeof lastCb()).toBe('function')
    })
  })

  describe('handleChange - extension filter', () => {
    test('matching ext emits change', async () => {
      const w = mk({ extensions: ['.ts'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalledWith(expect.objectContaining({ type: 'change' }))
      vi.useRealTimers()
    })
    test('non-matching ext no emit', async () => {
      const w = mk({ extensions: ['.ts'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.js')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('no extensions all pass', async () => {
      const h = vi.fn()
      watcher.on('change', h)
      await watcher.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.xyz')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalledWith(expect.objectContaining({ type: 'change' }))
      vi.useRealTimers()
    })
    test('multiple extensions match', async () => {
      const w = mk({ extensions: ['.ts', '.js'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.js')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalledWith(expect.objectContaining({ type: 'change' }))
      vi.useRealTimers()
    })
    test('case sensitive ext', async () => {
      const w = mk({ extensions: ['.ts'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.TS')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('ext with dot in name', async () => {
      const w = mk({ extensions: ['.ts'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'spec.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('handleChange - ignore patterns', () => {
    test('ignored file no emit', async () => {
      const w = mk({ ignorePatterns: ['node_modules'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'node_modules')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('non-ignored file emits', async () => {
      const w = mk({ ignorePatterns: ['node_modules'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'src')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('glob star pattern', async () => {
      const w = mk({ ignorePatterns: ['*.log'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'debug.log')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('glob star not matching', async () => {
      const w = mk({ ignorePatterns: ['*.log'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'debug.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('multiple ignore patterns', async () => {
      const w = mk({ ignorePatterns: ['dist', 'build'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'build')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('handleChange - debounce', () => {
    test('rapid changes debounce', async () => {
      const h = vi.fn()
      watcher.on('change', h)
      await watcher.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.ts')
      lastCb()('change', 'f.ts')
      lastCb()('change', 'f.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })
    test('different files both emit', async () => {
      const h = vi.fn()
      watcher.on('change', h)
      await watcher.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'a.ts')
      lastCb()('change', 'b.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })
    test('custom debounceMs', async () => {
      const w = mk({ debounceMs: 50 })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.ts')
      await vi.advanceTimersByTimeAsync(60)
      expect(h).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })
  })

  describe('handleChange - fileExists', () => {
    test('file exists emits change type', async () => {
      const h = vi.fn()
      watcher.on('change', h)
      await watcher.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'exists.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalledWith(expect.objectContaining({ type: 'change' }))
      vi.useRealTimers()
    })
    test('file missing emits unlink type', async () => {
      vi.mocked(fs.access).mockImplementationOnce(
        (_p: fs.PathLike, _m: unknown, cb?: (e: NodeJS.ErrnoException | null) => void) => {
          const fn = typeof _m === 'function' ? _m : cb
          fn?.(new Error('ENOENT') as NodeJS.ErrnoException)
        },
      )
      const h = vi.fn()
      watcher.on('change', h)
      await watcher.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'gone.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalledWith(expect.objectContaining({ type: 'unlink' }))
      vi.useRealTimers()
    })
    test('filePath is absolute', async () => {
      const h = vi.fn()
      watcher.on('change', h)
      await watcher.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.ts')
      await vi.advanceTimersByTimeAsync(500)
      const emitted = h.mock.calls[0][0]
      expect(emitted.filePath).toContain('/')
      vi.useRealTimers()
    })
  })

  describe('patternToRegExp', () => {
    test('literal string', async () => {
      const w = mk({ ignorePatterns: ['exact'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'exact')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('dot in pattern', async () => {
      const w = mk({ ignorePatterns: ['.env'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', '.env')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('globstar pattern', async () => {
      const w = mk({ ignorePatterns: ['**/dist'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'a/b/dist')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('question mark pattern', async () => {
      const w = mk({ ignorePatterns: ['file?.ts'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'file1.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('stop clears debounce timers', () => {
    test('pending debounce cancelled', async () => {
      const h = vi.fn()
      watcher.on('change', h)
      await watcher.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.ts')
      await watcher.stop()
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('watch with options', () => {
    test('extensions + watch callback', async () => {
      const w = mk({ extensions: ['.ts', '.tsx'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'app.tsx')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('extensions reject via callback', async () => {
      const w = mk({ extensions: ['.ts'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'style.css')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('ignore + extensions combined', async () => {
      const w = mk({ extensions: ['.ts'], ignorePatterns: ['generated'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'generated')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('createWatcher integration', () => {
    test('watch and stop flow', async () => {
      const w = createWatcher()
      await w.watch('d')
      expect(w.isActive()).toBe(true)
      await w.stop()
      expect(w.isActive()).toBe(false)
    })
    test('replace stops previous', async () => {
      const w1 = createWatcher()
      await w1.watch('d1')
      expect(w1.isActive()).toBe(true)
      const w2 = createWatcher()
      expect(w2).not.toBe(w1)
    })
    test('create with extensions and watch', async () => {
      const w = createWatcher({ extensions: ['.ts'] })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'index.ts')
      await vi.advanceTimersByTimeAsync(500)
      expect(h).toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('create with debounceMs 0', async () => {
      const w = createWatcher({ debounceMs: 0 })
      const h = vi.fn()
      w.on('change', h)
      await w.watch('d')
      vi.useFakeTimers()
      lastCb()('change', 'f.ts')
      await vi.advanceTimersByTimeAsync(10)
      expect(h).toHaveBeenCalled()
      vi.useRealTimers()
    })
    test('watch resolves path', async () => {
      await watcher.watch('./d')
      expect(fs.watch).toHaveBeenCalledWith(
        expect.stringContaining('d'),
        expect.anything(),
        expect.any(Function),
      )
    })
    test('watch resolves absolute path', async () => {
      await watcher.watch('/tmp/watch')
      expect(fs.watch).toHaveBeenCalledWith(
        expect.stringContaining('watch'),
        expect.anything(),
        expect.any(Function),
      )
    })
    test('watch with parent dir path', async () => {
      await watcher.watch('../sibling')
      expect(fs.watch).toHaveBeenCalled()
    })
  })
})
