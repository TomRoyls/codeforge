import { describe, it, expect, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { writeToFile, writeToFileAtomic } from '../src/utils/file-writer.js'
import { SystemError } from '../src/utils/errors.js'

let tmpDir: string

function cleanup() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

// ─── writeToFile ──────────────────────────────────────
describe('writeToFile', () => {
  afterEach(cleanup)

  it('writes content to file', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'test.txt')
    writeToFile(filePath, 'hello world')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('hello world')
  })

  it('creates parent directories', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'sub', 'dir', 'test.txt')
    writeToFile(filePath, 'nested')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('nested')
  })

  it('overwrites existing file', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'test.txt')
    writeToFile(filePath, 'first')
    writeToFile(filePath, 'second')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('second')
  })

  it('writes empty string', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'empty.txt')
    writeToFile(filePath, '')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('')
  })

  it('writes unicode content', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'unicode.txt')
    writeToFile(filePath, 'こんにちは 🌍')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('こんにちは 🌍')
  })

  it('throws SystemError for invalid path', () => {
    expect(() => writeToFile('/dev/null/impossible/path', 'test')).toThrow(SystemError)
  })
})

// ─── writeToFileAtomic ────────────────────────────────
describe('writeToFileAtomic', () => {
  afterEach(cleanup)

  it('writes content atomically', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'atomic.txt')
    writeToFileAtomic(filePath, 'atomic content')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('atomic content')
  })

  it('creates parent directories', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'deep', 'atomic.txt')
    writeToFileAtomic(filePath, 'deep')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('deep')
  })

  it('overwrites existing file', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'atomic.txt')
    writeToFileAtomic(filePath, 'v1')
    writeToFileAtomic(filePath, 'v2')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('v2')
  })

  it('does not leave temp files on success', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'))
    const filePath = path.join(tmpDir, 'clean.txt')
    writeToFileAtomic(filePath, 'clean')
    const files = fs.readdirSync(tmpDir)
    expect(files).toEqual(['clean.txt'])
  })

  it('throws SystemError for invalid path', () => {
    expect(() => writeToFileAtomic('/dev/null/impossible', 'test')).toThrow(SystemError)
  })
})
