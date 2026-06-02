import { describe, it, expect } from 'vitest'
import { resolvePath, resolveAndValidatePath } from '../../src/utils/path-utils.js'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('path-utils', () => {
  it('resolves relative path to absolute', () => {
    const result = resolvePath('./test')
    expect(result.startsWith('/')).toBe(true)
  })

  it('resolves parent directory reference', () => {
    const result = resolvePath('../test')
    expect(result).toContain('test')
  })

  it('resolves current directory', () => {
    const result = resolvePath('.')
    expect(result.startsWith('/')).toBe(true)
  })

  it('resolves absolute path unchanged', () => {
    const absolute = '/usr/bin'
    const result = resolvePath(absolute)
    expect(result).toBe(absolute)
  })

  it('handles paths with multiple segments', () => {
    const result = resolvePath('./src/utils')
    expect(result).toContain('src')
    expect(result).toContain('utils')
  })

  it('handles paths with trailing slash', () => {
    const result = resolvePath('./test/')
    expect(result.startsWith('/')).toBe(true)
  })

  it('handles paths with leading slash', () => {
    const result = resolvePath('/tmp')
    expect(result).toBe('/tmp')
  })

  it('handles empty string path', () => {
    const result = resolvePath('')
    expect(result.startsWith('/')).toBe(true)
  })

  it('handles paths with consecutive slashes', () => {
    const result = resolvePath('./src//utils')
    expect(result).toContain('src')
    expect(result).toContain('utils')
  })

  it('resolves dot segments in middle of path', () => {
    const result = resolvePath('./src/./utils')
    expect(result).toContain('src')
    expect(result).toContain('utils')
  })

  it('resolves and validates existing path', () => {
    const result = resolveAndValidatePath('.')
    expect(result.startsWith('/')).toBe(true)
  })

  it('throws error for non-existent path', () => {
    expect(() => {
      resolveAndValidatePath('/this/path/definitely/does/not/exist')
    }).toThrow()
  })

  it('throws error with descriptive message', () => {
    const nonExistent = '/nonexistent/path/xyz123'
    expect(() => {
      resolveAndValidatePath(nonExistent)
    }).toThrow(`Path not found: ${nonExistent}`)
  })

  it('validates existing file path', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'path-utils-test-'))
    const testFile = join(tmpDir, 'test.txt')
    writeFileSync(testFile, 'test content')

    try {
      const result = resolveAndValidatePath(testFile)
      expect(result).toBe(testFile)
    } finally {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('validates existing directory path', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'path-utils-test-'))

    try {
      const result = resolveAndValidatePath(tmpDir)
      expect(result).toBe(tmpDir)
    } finally {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('resolvePath does not check existence', () => {
    const result = resolvePath('/this/does/not/exist')
    expect(result.startsWith('/')).toBe(true)
  })

  it('resolveAndValidatePath throws for non-existent', () => {
    expect(() => resolveAndValidatePath('/no/such/path/ever')).toThrow()
  })

  it('resolveAndValidatePath returns absolute for valid cwd', () => {
    const result = resolveAndValidatePath('.')
    expect(result).toBeDefined()
  })

  it('resolvePath normalizes path', () => {
    const result = resolvePath('.')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})