import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { writeToFile, writeToFileAtomic } from '../../src/utils/file-writer.js'

// ─── writeToFile ───

describe('writeToFile', () => {
  const tmpDir = path.join(os.tmpdir(), 'codeforge-test-file-writer')
  let testFile: string

  afterEach(() => {
    try {
      if (testFile) fs.unlinkSync(testFile)
    } catch { /* ignore */ }
    try { fs.rmSync(tmpDir, { recursive: true }) } catch { /* ignore */ }
  })

  it('writes content to file', () => {
    testFile = path.join(tmpDir, 'test.txt')
    writeToFile(testFile, 'hello world')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('hello world')
  })

  it('creates parent directories', () => {
    testFile = path.join(tmpDir, 'nested', 'dir', 'test.txt')
    writeToFile(testFile, 'nested content')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('nested content')
  })

  it('overwrites existing file', () => {
    testFile = path.join(tmpDir, 'overwrite.txt')
    writeToFile(testFile, 'first')
    writeToFile(testFile, 'second')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('second')
  })
})

// ─── writeToFileAtomic ───

describe('writeToFileAtomic', () => {
  const tmpDir = path.join(os.tmpdir(), 'codeforge-test-atomic')
  let testFile: string

  afterEach(() => {
    try {
      if (testFile) fs.unlinkSync(testFile)
    } catch { /* ignore */ }
    try { fs.rmSync(tmpDir, { recursive: true }) } catch { /* ignore */ }
  })

  it('writes content atomically', () => {
    testFile = path.join(tmpDir, 'atomic.txt')
    writeToFileAtomic(testFile, 'atomic content')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('atomic content')
  })

  it('creates parent directories', () => {
    testFile = path.join(tmpDir, 'deep', 'atomic.txt')
    writeToFileAtomic(testFile, 'deep content')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('deep content')
  })

  it('cleans up temp file on success', () => {
    testFile = path.join(tmpDir, 'cleanup.txt')
    writeToFileAtomic(testFile, 'cleanup test')
    const tmpFiles = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.tmp'))
    expect(tmpFiles.length).toBe(0)
  })

  it('overwrites existing file atomically', () => {
    testFile = path.join(tmpDir, 'overwrite-atomic.txt')
    writeToFileAtomic(testFile, 'first')
    writeToFileAtomic(testFile, 'second')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('second')
  })

  it('handles empty content', () => {
    testFile = path.join(tmpDir, 'empty.txt')
    writeToFile(testFile, '')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('')
  })

  it('handles unicode content', () => {
    testFile = path.join(tmpDir, 'unicode.txt')
    const content = '日本語 🎉 ñ é ü'
    writeToFile(testFile, content)
    expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
  })

  it('throws on invalid path', () => {
    expect(() => writeToFile('/dev/null/impossible/path/file.txt', 'test')).toThrow()
  })

  it('atomic write handles unicode content', () => {
    testFile = path.join(tmpDir, 'unicode-atomic.txt')
    const content = '日本語 🎉 ñ é ü'
    writeToFileAtomic(testFile, content)
    expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
  })

  it('atomic write handles empty content', () => {
    testFile = path.join(tmpDir, 'empty-atomic.txt')
    writeToFileAtomic(testFile, '')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('')
  })

  it('writeToFile handles large content', () => {
    testFile = path.join(tmpDir, 'large.txt')
    const content = 'x'.repeat(100_000)
    writeToFile(testFile, content)
    expect(fs.readFileSync(testFile, 'utf8').length).toBe(100_000)
  })

  it('atomic write handles large content', () => {
    testFile = path.join(tmpDir, 'large-atomic.txt')
    const content = 'a'.repeat(50_000)
    writeToFileAtomic(testFile, content)
    expect(fs.readFileSync(testFile, 'utf8').length).toBe(50_000)
  })

  it('writeToFile handles multi-line content', () => {
    testFile = path.join(tmpDir, 'multiline.txt')
    const content = 'line1\nline2\nline3'
    writeToFile(testFile, content)
    expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
  })

  it('atomic write preserves exact content', () => {
    testFile = path.join(tmpDir, 'exact.txt')
    const content = '{"key": "value", "num": 42}'
    writeToFileAtomic(testFile, content)
    expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
  })

  it('writeToFile overwrites correctly', () => {
    testFile = path.join(tmpDir, 'overwrite2.txt')
    writeToFile(testFile, 'longer content here')
    writeToFile(testFile, 'short')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('short')
  })

  it('writeToFileAtomic writes content', () => {
    const testFile = path.join(tmpDir, 'atomic.txt')
    writeToFileAtomic(testFile, 'atomic content')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('atomic content')
  })

  it('writeToFile overwrites content', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fw-'))
    const testFile = path.join(tmpDir, 'overwrite.txt')
    writeToFile(testFile, 'first')
    writeToFile(testFile, 'second')
    expect(fs.readFileSync(testFile, 'utf8')).toBe('second')
  })

  it('writeToFile creates parent directories', () => {
    const dir = path.join(os.tmpdir(), `fw-test-${Date.now()}`)
    const fp = path.join(dir, 'nested', 'file.txt')
    writeToFile(fp, 'deep')
    expect(fs.readFileSync(fp, 'utf8')).toBe('deep')
    fs.rmSync(dir, { recursive: true })
  })

  it('writeToFileAtomic creates file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fw-'))
    const fp = path.join(dir, 'atomic.txt')
    writeToFileAtomic(fp, 'atomic content')
    expect(fs.readFileSync(fp, 'utf8')).toBe('atomic content')
    fs.rmSync(dir, { recursive: true })
  })

  it('writeToFile creates file with content', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fw-'))
    const fp = path.join(dir, 'test.txt')
    writeToFile(fp, 'hello')
    expect(fs.readFileSync(fp, 'utf8')).toBe('hello')
    fs.rmSync(dir, { recursive: true })
  })

  it('writeToFile handles empty string', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fw-'))
    const fp = path.join(dir, 'empty.txt')
    writeToFile(fp, '')
    expect(fs.readFileSync(fp, 'utf8')).toBe('')
    fs.rmSync(dir, { recursive: true })
  })

  it('writeToFile appends content', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fw-'))
    const fp = path.join(dir, 'out.txt')
    writeToFile(fp, 'hello')
    writeToFile(fp, ' world')
    expect(fs.readFileSync(fp, 'utf8')).toBe(' world')
    fs.rmSync(dir, { recursive: true })
  })
})
