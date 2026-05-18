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
})
