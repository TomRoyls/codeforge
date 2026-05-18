import { describe, it, expect, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { FileWatcher, createWatcher } from '../src/utils/watcher.js'

let tmpDir: string

function cleanup() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

// ─── FileWatcher Constructor ──────────────────────────
describe('FileWatcher constructor', () => {
  it('creates with default options', () => {
    const w = new FileWatcher()
    expect(w.isActive()).toBe(false)
  })

  it('creates with custom debounce', () => {
    const w = new FileWatcher({ debounceMs: 500 })
    expect(w).toBeInstanceOf(FileWatcher)
  })

  it('creates with extensions filter', () => {
    const w = new FileWatcher({ extensions: ['.ts', '.js'] })
    expect(w).toBeInstanceOf(FileWatcher)
  })

  it('creates with ignore patterns', () => {
    const w = new FileWatcher({ ignorePatterns: ['node_modules/**'] })
    expect(w).toBeInstanceOf(FileWatcher)
  })
})

// ─── FileWatcher.isActive ─────────────────────────────
describe('FileWatcher.isActive', () => {
  it('returns false before watching', () => {
    const w = new FileWatcher()
    expect(w.isActive()).toBe(false)
  })

  it('returns true after watch starts', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-watch-'))
    const w = new FileWatcher()
    await w.watch(tmpDir)
    expect(w.isActive()).toBe(true)
    await w.stop()
    cleanup()
  })

  it('returns false after stop', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-watch-'))
    const w = new FileWatcher()
    await w.watch(tmpDir)
    await w.stop()
    expect(w.isActive()).toBe(false)
    cleanup()
  })
})

// ─── FileWatcher.stop ─────────────────────────────────
describe('FileWatcher.stop', () => {
  afterEach(cleanup)

  it('can be called when not active', async () => {
    const w = new FileWatcher()
    await expect(w.stop()).resolves.toBeUndefined()
  })

  it('can be called multiple times', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-watch-'))
    const w = new FileWatcher()
    await w.watch(tmpDir)
    await w.stop()
    await w.stop()
    expect(w.isActive()).toBe(false)
  })
})

// ─── FileWatcher.watch ────────────────────────────────
describe('FileWatcher.watch', () => {
  afterEach(cleanup)

  it('starts watching a directory', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-watch-'))
    const w = new FileWatcher()
    await w.watch(tmpDir)
    expect(w.isActive()).toBe(true)
    await w.stop()
  })

  it('can restart after stop', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-watch-'))
    const w = new FileWatcher()
    await w.watch(tmpDir)
    await w.stop()
    await w.watch(tmpDir)
    expect(w.isActive()).toBe(true)
    await w.stop()
  })

  it('handles non-existent directory gracefully', async () => {
    const w = new FileWatcher()
    await expect(w.watch('/nonexistent/path/abc')).resolves.toBeUndefined()
    await w.stop()
  })
})

// ─── FileWatcher events ───────────────────────────────
describe('FileWatcher events', () => {
  afterEach(cleanup)

  it('emits change event on file modification', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-watch-'))
    const filePath = path.join(tmpDir, 'test.txt')
    fs.writeFileSync(filePath, 'initial')
    const w = new FileWatcher({ debounceMs: 50 })
    const changePromise = new Promise<void>((resolve) => {
      w.on('change', (event: { filePath: string; type: string }) => {
        expect(event.filePath).toContain('test.txt')
        expect(['change', 'unlink', 'add']).toContain(event.type)
        resolve()
      })
    })
    await w.watch(tmpDir)
    fs.writeFileSync(filePath, 'modified')
    await changePromise
    await w.stop()
  }, 10000)
})

// ─── createWatcher ────────────────────────────────────
describe('createWatcher', () => {
  it('creates a new FileWatcher', () => {
    const w = createWatcher()
    expect(w).toBeInstanceOf(FileWatcher)
    expect(w.isActive()).toBe(false)
  })

  it('creates with options', () => {
    const w = createWatcher({ debounceMs: 100 })
    expect(w).toBeInstanceOf(FileWatcher)
  })

  it('replaces previous default watcher', () => {
    const w1 = createWatcher()
    const w2 = createWatcher()
    expect(w2).toBeInstanceOf(FileWatcher)
    expect(w1).not.toBe(w2)
  })
})

// ─── FileWatcher extends EventEmitter ─────────────────
describe('FileWatcher EventEmitter', () => {
  it('inherits from EventEmitter', () => {
    const w = new FileWatcher()
    expect(typeof w.on).toBe('function')
    expect(typeof w.emit).toBe('function')
  })
})
