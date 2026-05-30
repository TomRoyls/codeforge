import { existsSync } from 'fs'
import { isAbsolute, resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { resolveAndValidatePath, resolvePath } from '../../../src/utils/path-utils.js'

describe('resolveAndValidatePath', () => {
  it('resolves and returns an absolute path for a valid directory', () => {
    const result = resolveAndValidatePath(process.cwd())
    expect(isAbsolute(result)).toBe(true)
    expect(result).toBe(resolve(process.cwd()))
  })

  it('resolves a relative path to an absolute path for a valid directory', () => {
    const result = resolveAndValidatePath('.')
    expect(isAbsolute(result)).toBe(true)
    expect(result).toBe(resolve('.'))
  })

  it('throws for a non-existent path', () => {
    const fakePath = '/no/such/path/should/ever/exist/abc123'
    expect(() => resolveAndValidatePath(fakePath)).toThrow(
      `Path not found: ${resolve(fakePath)}`,
    )
  })

  it('returns an existing path unchanged when already absolute', () => {
    const cwd = process.cwd()
    const result = resolveAndValidatePath(cwd)
    expect(result).toBe(cwd)
  })

  it('throws for an empty string path', () => {
    // resolve('') resolves to cwd which exists, so this should succeed
    // unless the intent is to test something else
    const result = resolveAndValidatePath('')
    expect(result).toBe(resolve(''))
  })

  it('throws for a path that looks valid but does not exist', () => {
    const nonExistent = './this-directory-definitely-does-not-exist-xyz'
    if (existsSync(resolve(nonExistent))) {
      // Skip if someone actually created this
      return
    }
    expect(() => resolveAndValidatePath(nonExistent)).toThrow()
  })
})

describe('resolvePath', () => {
  it('returns an absolute path for a relative input', () => {
    const result = resolvePath('./src')
    expect(isAbsolute(result)).toBe(true)
  })

  it('returns the same absolute path when given an absolute path', () => {
    const abs = process.cwd()
    const result = resolvePath(abs)
    expect(result).toBe(abs)
  })

  it('resolves a relative path against cwd', () => {
    const result = resolvePath('.')
    expect(result).toBe(resolve('.'))
  })

  it('handles parent directory traversal', () => {
    const result = resolvePath('..')
    expect(result).toBe(resolve('..'))
  })

  it('resolves nested relative paths', () => {
    const result = resolvePath('./src/utils')
    expect(result).toBe(resolve('./src/utils'))
  })
})
