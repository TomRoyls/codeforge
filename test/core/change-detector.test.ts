import { describe, it, expect } from 'vitest'
import { HashComputer } from '../../src/core/change-detector/hash-computer.js'
import { ChangeDetector } from '../../src/core/change-detector/change-detector.js'
import type { FileEntry } from '../../src/core/change-detector/types.js'

describe('HashComputer', () => {
  describe('compute with default algorithm (djb2)', () => {
    it('computes a hash for non-empty content', () => {
      const hasher = new HashComputer()
      const result = hasher.compute('hello')
      expect(result).toBe(hasher.computeDjb2('hello'))
    })

    it('returns a string', () => {
      const hasher = new HashComputer()
      const result = hasher.compute('test')
      expect(typeof result).toBe('string')
    })

    it('returns non-empty hash', () => {
      const hasher = new HashComputer()
      const result = hasher.compute('content')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('computeSimple', () => {
    it('computes sum of char codes as hex', () => {
      const hasher = new HashComputer('simple')
      const result = hasher.computeSimple('ab')
      expect(result).toBe((97 + 98).toString(16))
    })

    it('returns 0 for empty string', () => {
      const hasher = new HashComputer()
      expect(hasher.computeSimple('')).toBe('0')
    })

    it('computes single character', () => {
      const hasher = new HashComputer()
      expect(hasher.computeSimple('A')).toBe((65).toString(16))
    })

    it('handles unicode characters', () => {
      const hasher = new HashComputer()
      const result = hasher.computeSimple('ü')
      expect(result).toBe((252).toString(16))
    })
  })

  describe('computeDjb2', () => {
    it('returns consistent hash for same input', () => {
      const hasher = new HashComputer()
      const first = hasher.computeDjb2('test')
      const second = hasher.computeDjb2('test')
      expect(first).toBe(second)
    })

    it('returns different hash for different input', () => {
      const hasher = new HashComputer()
      const a = hasher.computeDjb2('hello')
      const b = hasher.computeDjb2('world')
      expect(a).not.toBe(b)
    })

    it('returns string for empty content', () => {
      const hasher = new HashComputer()
      const result = hasher.computeDjb2('')
      expect(typeof result).toBe('string')
    })

    it('computes expected value for known input', () => {
      const hasher = new HashComputer()
      let hash = 5381
      for (let i = 0; i < 'a'.length; i++) {
        hash = (hash * 33) + 'a'.charCodeAt(i)
      }
      expect(hasher.computeDjb2('a')).toBe((hash >>> 0).toString(16))
    })
  })

  describe('computeFNV1a', () => {
    it('returns consistent hash for same input', () => {
      const hasher = new HashComputer()
      const first = hasher.computeFNV1a('test')
      const second = hasher.computeFNV1a('test')
      expect(first).toBe(second)
    })

    it('returns different hash for different input', () => {
      const hasher = new HashComputer()
      const a = hasher.computeFNV1a('foo')
      const b = hasher.computeFNV1a('bar')
      expect(a).not.toBe(b)
    })

    it('returns string for empty content', () => {
      const hasher = new HashComputer()
      const result = hasher.computeFNV1a('')
      expect(typeof result).toBe('string')
    })

    it('computes expected value for known input', () => {
      const hasher = new HashComputer()
      let hash = 2166136261
      const prime = 16777619
      hash ^= 'a'.charCodeAt(0)
      hash = Math.imul(hash, prime)
      expect(hasher.computeFNV1a('a')).toBe((hash >>> 0).toString(16))
    })
  })

  describe('empty string', () => {
    it('simple hash for empty string is 0', () => {
      const hasher = new HashComputer()
      expect(hasher.computeSimple('')).toBe('0')
    })

    it('djb2 hash for empty string is initial value', () => {
      const hasher = new HashComputer()
      expect(hasher.computeDjb2('')).toBe((5381 >>> 0).toString(16))
    })

    it('fnv1a hash for empty string is initial offset', () => {
      const hasher = new HashComputer()
      expect(hasher.computeFNV1a('')).toBe((2166136261 >>> 0).toString(16))
    })
  })

  describe('consistent results', () => {
    it('produces same result across multiple calls', () => {
      const hasher = new HashComputer()
      const results = Array.from({ length: 10 }, () => hasher.compute('stable'))
      expect(new Set(results).size).toBe(1)
    })
  })

  describe('different content produces different hash', () => {
    it('simple algorithm differentiates content', () => {
      const hasher = new HashComputer('simple')
      expect(hasher.compute('abc')).not.toBe(hasher.compute('xyz'))
    })

    it('djb2 algorithm differentiates content', () => {
      const hasher = new HashComputer('djb2')
      expect(hasher.compute('abc')).not.toBe(hasher.compute('def'))
    })

    it('fnv1a algorithm differentiates content', () => {
      const hasher = new HashComputer('fnv1a')
      expect(hasher.compute('abc')).not.toBe(hasher.compute('xyz'))
    })
  })

  describe('setAlgorithm', () => {
    it('switches to simple algorithm', () => {
      const hasher = new HashComputer()
      hasher.setAlgorithm('simple')
      expect(hasher.compute('test')).toBe(hasher.computeSimple('test'))
    })

    it('switches to djb2 algorithm', () => {
      const hasher = new HashComputer('simple')
      hasher.setAlgorithm('djb2')
      expect(hasher.compute('test')).toBe(hasher.computeDjb2('test'))
    })

    it('switches to fnv1a algorithm', () => {
      const hasher = new HashComputer()
      hasher.setAlgorithm('fnv1a')
      expect(hasher.compute('test')).toBe(hasher.computeFNV1a('test'))
    })
  })

  describe('getAlgorithm', () => {
    it('returns djb2 by default', () => {
      const hasher = new HashComputer()
      expect(hasher.getAlgorithm()).toBe('djb2')
    })

    it('returns simple when constructed with simple', () => {
      const hasher = new HashComputer('simple')
      expect(hasher.getAlgorithm()).toBe('simple')
    })

    it('returns fnv1a when constructed with fnv1a', () => {
      const hasher = new HashComputer('fnv1a')
      expect(hasher.getAlgorithm()).toBe('fnv1a')
    })

    it('reflects changes after setAlgorithm', () => {
      const hasher = new HashComputer()
      hasher.setAlgorithm('fnv1a')
      expect(hasher.getAlgorithm()).toBe('fnv1a')
    })
  })

  describe('constructor', () => {
    it('defaults to djb2', () => {
      const hasher = new HashComputer()
      expect(hasher.getAlgorithm()).toBe('djb2')
    })

    it('accepts simple algorithm', () => {
      const hasher = new HashComputer('simple')
      expect(hasher.getAlgorithm()).toBe('simple')
    })

    it('accepts fnv1a algorithm', () => {
      const hasher = new HashComputer('fnv1a')
      expect(hasher.getAlgorithm()).toBe('fnv1a')
    })
  })
})

describe('ChangeDetector', () => {
  describe('constructor', () => {
    it('creates instance with default config', () => {
      const detector = new ChangeDetector()
      const config = detector.getConfig()
      expect(config.algorithm).toBe('djb2')
      expect(config.includeUnchanged).toBe(false)
    })

    it('accepts custom config', () => {
      const detector = new ChangeDetector({ algorithm: 'simple' })
      expect(detector.getConfig().algorithm).toBe('simple')
    })

    it('accepts includeUnchanged config', () => {
      const detector = new ChangeDetector({ includeUnchanged: true })
      expect(detector.getConfig().includeUnchanged).toBe(true)
    })

    it('merges partial config with defaults', () => {
      const detector = new ChangeDetector({ includeUnchanged: true })
      const config = detector.getConfig()
      expect(config.algorithm).toBe('djb2')
      expect(config.includeUnchanged).toBe(true)
    })
  })

  describe('setBaseline', () => {
    it('sets baseline entries', () => {
      const detector = new ChangeDetector()
      const baseline = new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'abc123', size: 10, lastModified: 1000 }],
      ])
      detector.setBaseline(baseline)
      expect(detector.getBaseline().get('a.ts')).toBeDefined()
    })

    it('replaces existing baseline', () => {
      const detector = new ChangeDetector()
      const baseline1 = new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'abc', size: 10, lastModified: 1000 }],
      ])
      detector.setBaseline(baseline1)
      const baseline2 = new Map<string, FileEntry>([
        ['b.ts', { path: 'b.ts', hash: 'def', size: 20, lastModified: 2000 }],
      ])
      detector.setBaseline(baseline2)
      expect(detector.getBaseline().has('a.ts')).toBe(false)
      expect(detector.getBaseline().has('b.ts')).toBe(true)
    })

    it('creates a copy of the baseline map', () => {
      const detector = new ChangeDetector()
      const baseline = new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'abc', size: 10, lastModified: 1000 }],
      ])
      detector.setBaseline(baseline)
      baseline.delete('a.ts')
      expect(detector.getBaseline().has('a.ts')).toBe(true)
    })
  })

  describe('detectChanges with additions', () => {
    it('detects new files as added', () => {
      const detector = new ChangeDetector()
      const current = new Map<string, string>([['new.ts', 'content']])
      const report = detector.detectChanges(current)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]?.changeType).toBe('added')
      expect(report.changes[0]?.path).toBe('new.ts')
    })

    it('sets newHash for added files', () => {
      const detector = new ChangeDetector()
      const current = new Map<string, string>([['new.ts', 'hello']])
      const report = detector.detectChanges(current)
      expect(report.changes[0]?.newHash).toBeDefined()
    })

    it('sets newSize for added files', () => {
      const detector = new ChangeDetector()
      const current = new Map<string, string>([['new.ts', 'hello']])
      const report = detector.detectChanges(current)
      expect(report.changes[0]?.newSize).toBe(5)
    })

    it('updates summary for additions', () => {
      const detector = new ChangeDetector()
      const current = new Map<string, string>([['a.ts', 'a'], ['b.ts', 'b']])
      const report = detector.detectChanges(current)
      expect(report.summary.added).toBe(2)
    })
  })

  describe('detectChanges with removals', () => {
    it('detects removed files', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['gone.ts', { path: 'gone.ts', hash: 'abc', size: 10, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map())
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]?.changeType).toBe('removed')
    })

    it('sets oldHash for removed files', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['gone.ts', { path: 'gone.ts', hash: 'abc', size: 10, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map())
      expect(report.changes[0]?.oldHash).toBe('abc')
    })

    it('sets oldSize for removed files', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['gone.ts', { path: 'gone.ts', hash: 'abc', size: 42, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map())
      expect(report.changes[0]?.oldSize).toBe(42)
    })

    it('updates summary for removals', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'a1', size: 1, lastModified: 1 }],
        ['b.ts', { path: 'b.ts', hash: 'b1', size: 2, lastModified: 2 }],
      ]))
      const report = detector.detectChanges(new Map())
      expect(report.summary.removed).toBe(2)
    })
  })

  describe('detectChanges with modifications', () => {
    it('detects modified files', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const originalHash = hasher.compute('original')
      detector.setBaseline(new Map<string, FileEntry>([
        ['mod.ts', { path: 'mod.ts', hash: originalHash, size: 8, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['mod.ts', 'modified']]))
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]?.changeType).toBe('modified')
    })

    it('sets oldHash and newHash for modified files', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const originalHash = hasher.compute('original')
      detector.setBaseline(new Map<string, FileEntry>([
        ['mod.ts', { path: 'mod.ts', hash: originalHash, size: 8, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['mod.ts', 'modified']]))
      const change = report.changes[0]!
      expect(change.oldHash).toBe(originalHash)
      expect(change.newHash).toBe(hasher.compute('modified'))
      expect(change.oldHash).not.toBe(change.newHash)
    })

    it('sets oldSize and newSize for modified files', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const originalHash = hasher.compute('original')
      detector.setBaseline(new Map<string, FileEntry>([
        ['mod.ts', { path: 'mod.ts', hash: originalHash, size: 8, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['mod.ts', 'modified']]))
      expect(report.changes[0]?.oldSize).toBe(8)
      expect(report.changes[0]?.newSize).toBe(8)
    })

    it('updates summary for modifications', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const originalHash = hasher.compute('original')
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: originalHash, size: 8, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['a.ts', 'changed']]))
      expect(report.summary.modified).toBe(1)
    })
  })

  describe('detectChanges with no changes', () => {
    it('detects unchanged files', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const hash = hasher.compute('same')
      detector.setBaseline(new Map<string, FileEntry>([
        ['same.ts', { path: 'same.ts', hash, size: 4, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['same.ts', 'same']]))
      expect(report.changes).toHaveLength(0)
    })

    it('summary counts unchanged files', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const hash = hasher.compute('same')
      detector.setBaseline(new Map<string, FileEntry>([
        ['same.ts', { path: 'same.ts', hash, size: 4, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['same.ts', 'same']]))
      expect(report.summary.unchanged).toBe(1)
    })
  })

  describe('detectChangesFromEntries', () => {
    it('detects changes from FileEntry array', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'old', size: 3, lastModified: 1000 }],
      ]))
      const entries: FileEntry[] = [
        { path: 'a.ts', hash: 'new', size: 4, lastModified: 2000 },
        { path: 'b.ts', hash: 'added', size: 5, lastModified: 2000 },
      ]
      const report = detector.detectChangesFromEntries(entries)
      expect(report.summary.modified).toBe(1)
      expect(report.summary.added).toBe(1)
    })

    it('detects removals from entries', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'abc', size: 3, lastModified: 1000 }],
        ['b.ts', { path: 'b.ts', hash: 'def', size: 3, lastModified: 1000 }],
      ]))
      const entries: FileEntry[] = [
        { path: 'a.ts', hash: 'abc', size: 3, lastModified: 1000 },
      ]
      const report = detector.detectChangesFromEntries(entries)
      expect(report.summary.removed).toBe(1)
      expect(report.summary.unchanged).toBe(1)
    })

    it('handles empty entries array', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'abc', size: 3, lastModified: 1000 }],
      ]))
      const report = detector.detectChangesFromEntries([])
      expect(report.summary.removed).toBe(1)
    })

    it('detects no changes when entries match baseline exactly', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const hash = hasher.compute('hello')
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash, size: 5, lastModified: 1000 }],
      ]))
      const entries: FileEntry[] = [
        { path: 'a.ts', hash, size: 5, lastModified: 2000 },
      ]
      const report = detector.detectChangesFromEntries(entries)
      expect(report.summary.unchanged).toBe(1)
      expect(report.changes).toHaveLength(0)
    })
  })

  describe('hasChanged', () => {
    it('returns true for new file', () => {
      const detector = new ChangeDetector()
      expect(detector.hasChanged('new.ts', 'content')).toBe(true)
    })

    it('returns true for modified file', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const originalHash = hasher.compute('original')
      detector.setBaseline(new Map<string, FileEntry>([
        ['mod.ts', { path: 'mod.ts', hash: originalHash, size: 8, lastModified: 1000 }],
      ]))
      expect(detector.hasChanged('mod.ts', 'changed')).toBe(true)
    })

    it('returns false for unchanged file', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const hash = hasher.compute('same')
      detector.setBaseline(new Map<string, FileEntry>([
        ['same.ts', { path: 'same.ts', hash, size: 4, lastModified: 1000 }],
      ]))
      expect(detector.hasChanged('same.ts', 'same')).toBe(false)
    })
  })

  describe('getEntry', () => {
    it('returns entry from baseline', () => {
      const detector = new ChangeDetector()
      const entry: FileEntry = { path: 'a.ts', hash: 'abc', size: 10, lastModified: 1000 }
      detector.setBaseline(new Map([['a.ts', entry]]))
      expect(detector.getEntry('a.ts')).toEqual(entry)
    })

    it('returns undefined for missing entry', () => {
      const detector = new ChangeDetector()
      expect(detector.getEntry('missing.ts')).toBeUndefined()
    })
  })

  describe('updateBaseline', () => {
    it('adds new entry to baseline', () => {
      const detector = new ChangeDetector()
      detector.updateBaseline('new.ts', 'content')
      const entry = detector.getEntry('new.ts')
      expect(entry).toBeDefined()
      expect(entry!.path).toBe('new.ts')
      expect(entry!.size).toBe(7)
    })

    it('updates existing entry in baseline', () => {
      const detector = new ChangeDetector()
      detector.updateBaseline('a.ts', 'original')
      detector.updateBaseline('a.ts', 'updated content')
      const entry = detector.getEntry('a.ts')
      expect(entry!.size).toBe(15)
    })

    it('computes correct hash', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      detector.updateBaseline('a.ts', 'hello')
      const entry = detector.getEntry('a.ts')
      expect(entry!.hash).toBe(hasher.compute('hello'))
    })

    it('sets lastModified', () => {
      const detector = new ChangeDetector()
      const before = Date.now()
      detector.updateBaseline('a.ts', 'content')
      const after = Date.now()
      const entry = detector.getEntry('a.ts')
      expect(entry!.lastModified).toBeGreaterThanOrEqual(before)
      expect(entry!.lastModified).toBeLessThanOrEqual(after)
    })
  })

  describe('removeFromBaseline', () => {
    it('removes entry from baseline', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'abc', size: 3, lastModified: 1000 }],
      ]))
      const result = detector.removeFromBaseline('a.ts')
      expect(result).toBe(true)
      expect(detector.getEntry('a.ts')).toBeUndefined()
    })

    it('returns false for non-existent entry', () => {
      const detector = new ChangeDetector()
      expect(detector.removeFromBaseline('missing.ts')).toBe(false)
    })
  })

  describe('getBaseline', () => {
    it('returns a copy of the baseline', () => {
      const detector = new ChangeDetector()
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: 'abc', size: 3, lastModified: 1000 }],
      ]))
      const baseline = detector.getBaseline()
      baseline.delete('a.ts')
      expect(detector.getEntry('a.ts')).toBeDefined()
    })

    it('returns empty map when baseline is empty', () => {
      const detector = new ChangeDetector()
      expect(detector.getBaseline().size).toBe(0)
    })
  })

  describe('getConfig', () => {
    it('returns a copy of the config', () => {
      const detector = new ChangeDetector()
      const config1 = detector.getConfig()
      const config2 = detector.getConfig()
      config1.algorithm = 'simple'
      expect(config2.algorithm).toBe('djb2')
    })

    it('returns default config when none provided', () => {
      const detector = new ChangeDetector()
      const config = detector.getConfig()
      expect(config.algorithm).toBe('djb2')
      expect(config.includeUnchanged).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles empty baseline with empty current', () => {
      const detector = new ChangeDetector()
      const report = detector.detectChanges(new Map())
      expect(report.changes).toHaveLength(0)
      expect(report.summary.total).toBe(0)
    })

    it('handles large content hash', () => {
      const hasher = new HashComputer()
      const largeContent = 'x'.repeat(100000)
      const hash = hasher.compute(largeContent)
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('handles mixed changes in one detection', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const sameHash = hasher.compute('same')
      detector.setBaseline(new Map<string, FileEntry>([
        ['same.ts', { path: 'same.ts', hash: sameHash, size: 4, lastModified: 1000 }],
        ['mod.ts', { path: 'mod.ts', hash: 'old', size: 3, lastModified: 1000 }],
        ['gone.ts', { path: 'gone.ts', hash: 'xyz', size: 3, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([
        ['same.ts', 'same'],
        ['mod.ts', 'new content'],
        ['added.ts', 'brand new'],
      ]))
      expect(report.summary.added).toBe(1)
      expect(report.summary.modified).toBe(1)
      expect(report.summary.removed).toBe(1)
      expect(report.summary.unchanged).toBe(1)
      expect(report.summary.total).toBe(4)
    })
  })

  describe('includeUnchanged config', () => {
    it('excludes unchanged by default', () => {
      const detector = new ChangeDetector()
      const hasher = new HashComputer('djb2')
      const hash = hasher.compute('same')
      detector.setBaseline(new Map<string, FileEntry>([
        ['same.ts', { path: 'same.ts', hash, size: 4, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['same.ts', 'same']]))
      const unchangedChanges = report.changes.filter((c) => c.changeType === 'unchanged')
      expect(unchangedChanges).toHaveLength(0)
    })

    it('includes unchanged when configured', () => {
      const detector = new ChangeDetector({ includeUnchanged: true })
      const hasher = new HashComputer('djb2')
      const hash = hasher.compute('same')
      detector.setBaseline(new Map<string, FileEntry>([
        ['same.ts', { path: 'same.ts', hash, size: 4, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['same.ts', 'same']]))
      const unchangedChanges = report.changes.filter((c) => c.changeType === 'unchanged')
      expect(unchangedChanges).toHaveLength(1)
    })

    it('summary still counts unchanged even when excluded from changes', () => {
      const detector = new ChangeDetector({ includeUnchanged: false })
      const hasher = new HashComputer('djb2')
      const hash = hasher.compute('same')
      detector.setBaseline(new Map<string, FileEntry>([
        ['same.ts', { path: 'same.ts', hash, size: 4, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['same.ts', 'same']]))
      expect(report.summary.unchanged).toBe(1)
      expect(report.changes).toHaveLength(0)
    })
  })

  describe('algorithm config', () => {
    it('uses simple algorithm when configured', () => {
      const detector = new ChangeDetector({ algorithm: 'simple' })
      const hasher = new HashComputer('simple')
      const originalHash = hasher.compute('content')
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: originalHash, size: 7, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['a.ts', 'content']]))
      expect(report.summary.unchanged).toBe(1)
    })

    it('uses fnv1a algorithm when configured', () => {
      const detector = new ChangeDetector({ algorithm: 'fnv1a' })
      const hasher = new HashComputer('fnv1a')
      const originalHash = hasher.compute('content')
      detector.setBaseline(new Map<string, FileEntry>([
        ['a.ts', { path: 'a.ts', hash: originalHash, size: 7, lastModified: 1000 }],
      ]))
      const report = detector.detectChanges(new Map([['a.ts', 'content']]))
      expect(report.summary.unchanged).toBe(1)
    })
  })
})
