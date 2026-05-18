import { describe, expect, it } from 'vitest'

import {
  DEFAULT_IGNORE,
  DEFAULT_PATTERNS,
  type DiscoveredFile,
  type FileDiscoveryOptions,
} from '../../src/core/file-discovery.js'

// ─── DEFAULT_PATTERNS ───

describe('DEFAULT_PATTERNS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(DEFAULT_PATTERNS)).toBe(true)
    expect(DEFAULT_PATTERNS.length).toBeGreaterThan(0)
  })

  it('includes TypeScript patterns', () => {
    expect(DEFAULT_PATTERNS).toContain('**/*.ts')
    expect(DEFAULT_PATTERNS).toContain('**/*.tsx')
  })

  it('includes JavaScript patterns', () => {
    expect(DEFAULT_PATTERNS).toContain('**/*.js')
    expect(DEFAULT_PATTERNS).toContain('**/*.jsx')
  })

  it('contains exactly 4 patterns', () => {
    expect(DEFAULT_PATTERNS).toHaveLength(4)
  })
})

// ─── DEFAULT_IGNORE ───

describe('DEFAULT_IGNORE', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(DEFAULT_IGNORE)).toBe(true)
    expect(DEFAULT_IGNORE.length).toBeGreaterThan(0)
  })

  it('ignores node_modules', () => {
    expect(DEFAULT_IGNORE).toContain('**/node_modules/**')
  })

  it('ignores dist and build directories', () => {
    expect(DEFAULT_IGNORE).toContain('**/dist/**')
    expect(DEFAULT_IGNORE).toContain('**/build/**')
  })

  it('ignores git directory', () => {
    expect(DEFAULT_IGNORE).toContain('**/.git/**')
  })

  it('ignores coverage directory', () => {
    expect(DEFAULT_IGNORE).toContain('**/coverage/**')
  })

  it('ignores declaration files', () => {
    expect(DEFAULT_IGNORE).toContain('**/*.d.ts')
  })

  it('contains exactly 6 ignore patterns', () => {
    expect(DEFAULT_IGNORE).toHaveLength(6)
  })
})

// ─── Type Exports ───

describe('Type exports', () => {
  it('FileDiscoveryOptions has expected shape', () => {
    const opts: FileDiscoveryOptions = {
      cwd: '/test',
      ignore: [],
      patterns: [],
    }
    expect(opts.cwd).toBe('/test')
    expect(opts.ignore).toEqual([])
    expect(opts.patterns).toEqual([])
  })

  it('FileDiscoveryOptions supports optional onProgress', () => {
    const opts: FileDiscoveryOptions = {
      cwd: '/test',
      ignore: [],
      onProgress: (_count: number) => {},
      patterns: [],
    }
    expect(opts.onProgress).toBeDefined()
    expect(typeof opts.onProgress).toBe('function')
  })

  it('DiscoveredFile has expected shape', () => {
    const file: DiscoveredFile = {
      absolutePath: '/abs/path.ts',
      path: 'path.ts',
    }
    expect(file.absolutePath).toBe('/abs/path.ts')
    expect(file.path).toBe('path.ts')
  })
})
