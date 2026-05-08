import { describe, it, expect } from 'vitest'
import { ArchiveStore } from '../../src/core/file-archive/archive-store.js'
import { FileArchive } from '../../src/core/file-archive/file-archive.js'
import { DEFAULT_ARCHIVE_CONFIG } from '../../src/core/file-archive/types.js'
import type { ArchivedFile } from '../../src/core/file-archive/types.js'

function makeFile(overrides: Partial<ArchivedFile> & { path: string; version: number }): ArchivedFile {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    content: overrides.content ?? 'content',
    hash: overrides.hash ?? 'abc123',
    archivedAt: overrides.archivedAt ?? Date.now(),
    metadata: overrides.metadata ?? {},
    tags: overrides.tags ?? [],
    size: overrides.size ?? Buffer.byteLength(overrides.content ?? 'content', 'utf8'),
    ...overrides,
  }
}

describe('ArchiveStore', () => {
  describe('add', () => {
    it('should add a file to the store', () => {
      const store = new ArchiveStore()
      const file = makeFile({ path: 'a.ts', version: 1 })
      store.add(file)
      expect(store.exists('a.ts')).toBe(true)
    })

    it('should add multiple versions of the same path', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 2 }))
      expect(store.getVersions('a.ts')).toEqual([1, 2])
    })

    it('should add files with different paths', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'b.ts', version: 1 }))
      expect(store.exists('a.ts')).toBe(true)
      expect(store.exists('b.ts')).toBe(true)
    })
  })

  describe('get', () => {
    it('should return a file by path and version', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1, content: 'v1' }))
      store.add(makeFile({ path: 'a.ts', version: 2, content: 'v2' }))
      const result = store.get('a.ts', 1)
      expect(result?.version).toBe(1)
      expect(result?.content).toBe('v1')
    })

    it('should return latest version when version not specified', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 3 }))
      store.add(makeFile({ path: 'a.ts', version: 2 }))
      const result = store.get('a.ts')
      expect(result?.version).toBe(3)
    })

    it('should return null for non-existent path', () => {
      const store = new ArchiveStore()
      expect(store.get('missing.ts')).toBeNull()
    })

    it('should return null for non-existent version', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      expect(store.get('a.ts', 99)).toBeNull()
    })
  })

  describe('getLatest', () => {
    it('should return the highest version number', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 5 }))
      store.add(makeFile({ path: 'a.ts', version: 3 }))
      expect(store.getLatest('a.ts')?.version).toBe(5)
    })

    it('should return null for unknown path', () => {
      const store = new ArchiveStore()
      expect(store.getLatest('x.ts')).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should return all versions sorted by version number', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 3 }))
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 2 }))
      const all = store.getAll('a.ts')
      expect(all.map((f) => f.version)).toEqual([1, 2, 3])
    })

    it('should return empty array for unknown path', () => {
      const store = new ArchiveStore()
      expect(store.getAll('x.ts')).toEqual([])
    })
  })

  describe('remove', () => {
    it('should remove a specific version', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 2 }))
      expect(store.remove('a.ts', 1)).toBe(true)
      expect(store.get('a.ts', 1)).toBeNull()
      expect(store.get('a.ts', 2)).not.toBeNull()
    })

    it('should remove all versions when version not specified', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 2 }))
      expect(store.remove('a.ts')).toBe(true)
      expect(store.exists('a.ts')).toBe(false)
    })

    it('should return false for non-existent path', () => {
      const store = new ArchiveStore()
      expect(store.remove('missing.ts')).toBe(false)
    })

    it('should return false for non-existent version', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      expect(store.remove('a.ts', 99)).toBe(false)
    })

    it('should clean up empty path entry after removing last version', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.remove('a.ts', 1)
      expect(store.exists('a.ts')).toBe(false)
    })
  })

  describe('exists', () => {
    it('should return true for existing path', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      expect(store.exists('a.ts')).toBe(true)
    })

    it('should return false for non-existent path', () => {
      const store = new ArchiveStore()
      expect(store.exists('nope.ts')).toBe(false)
    })
  })

  describe('getVersions', () => {
    it('should return sorted version numbers', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 5 }))
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 3 }))
      expect(store.getVersions('a.ts')).toEqual([1, 3, 5])
    })

    it('should return empty array for unknown path', () => {
      const store = new ArchiveStore()
      expect(store.getVersions('x.ts')).toEqual([])
    })
  })

  describe('size', () => {
    it('should return total number of stored files across all paths', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'a.ts', version: 2 }))
      store.add(makeFile({ path: 'b.ts', version: 1 }))
      expect(store.size()).toBe(3)
    })

    it('should return 0 for empty store', () => {
      const store = new ArchiveStore()
      expect(store.size()).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'b.ts', version: 1 }))
      store.clear()
      expect(store.size()).toBe(0)
      expect(store.exists('a.ts')).toBe(false)
    })
  })

  describe('paths', () => {
    it('should return all stored paths', () => {
      const store = new ArchiveStore()
      store.add(makeFile({ path: 'a.ts', version: 1 }))
      store.add(makeFile({ path: 'b.ts', version: 1 }))
      expect(store.paths()).toEqual(['a.ts', 'b.ts'])
    })

    it('should return empty array for empty store', () => {
      const store = new ArchiveStore()
      expect(store.paths()).toEqual([])
    })
  })
})

describe('FileArchive', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const archive = new FileArchive()
      expect(archive.getConfig()).toEqual(DEFAULT_ARCHIVE_CONFIG)
    })

    it('should merge partial config with defaults', () => {
      const archive = new FileArchive({ maxVersions: 5 })
      const config = archive.getConfig()
      expect(config.maxVersions).toBe(5)
      expect(config.autoCompress).toBe(DEFAULT_ARCHIVE_CONFIG.autoCompress)
    })

    it('should accept full config override', () => {
      const archive = new FileArchive({ maxVersions: 20, autoCompress: true, hashAlgorithm: 'md5' })
      const config = archive.getConfig()
      expect(config.maxVersions).toBe(20)
      expect(config.autoCompress).toBe(true)
      expect(config.hashAlgorithm).toBe('md5')
    })
  })

  describe('archive', () => {
    it('should archive a file and return it', () => {
      const archive = new FileArchive()
      const result = archive.archive('src/a.ts', 'hello world')
      expect(result.path).toBe('src/a.ts')
      expect(result.content).toBe('hello world')
      expect(result.version).toBe(1)
      expect(result.hash).toBeTruthy()
      expect(result.size).toBe(Buffer.byteLength('hello world', 'utf8'))
    })

    it('should increment version on subsequent archives', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const v2 = archive.archive('a.ts', 'v2')
      expect(v2.version).toBe(2)
    })

    it('should return existing file when content unchanged', () => {
      const archive = new FileArchive()
      const first = archive.archive('a.ts', 'same')
      const second = archive.archive('a.ts', 'same')
      expect(first.id).toBe(second.id)
      expect(first.version).toBe(second.version)
    })

    it('should compute correct hash', () => {
      const archive = new FileArchive()
      const result = archive.archive('a.ts', 'test')
      const expectedHash = require('node:crypto').createHash('sha256').update('test').digest('hex')
      expect(result.hash).toBe(expectedHash)
    })

    it('should accept metadata', () => {
      const archive = new FileArchive()
      const result = archive.archive('a.ts', 'content', { author: 'test', priority: 1 })
      expect(result.metadata).toEqual({ author: 'test', priority: 1 })
    })

    it('should default metadata to empty object', () => {
      const archive = new FileArchive()
      const result = archive.archive('a.ts', 'content')
      expect(result.metadata).toEqual({})
    })

    it('should set archivedAt to current timestamp', () => {
      const archive = new FileArchive()
      const before = Date.now()
      const result = archive.archive('a.ts', 'content')
      const after = Date.now()
      expect(result.archivedAt).toBeGreaterThanOrEqual(before)
      expect(result.archivedAt).toBeLessThanOrEqual(after)
    })

    it('should calculate size in bytes', () => {
      const archive = new FileArchive()
      const content = 'a'.repeat(100)
      const result = archive.archive('a.ts', content)
      expect(result.size).toBe(100)
    })
  })

  describe('archiveMany', () => {
    it('should archive multiple files at once', () => {
      const archive = new FileArchive()
      const results = archive.archiveMany([
        { path: 'a.ts', content: 'file a' },
        { path: 'b.ts', content: 'file b' },
        { path: 'c.ts', content: 'file c' },
      ])
      expect(results).toHaveLength(3)
      expect(results[0]!.path).toBe('a.ts')
      expect(results[1]!.path).toBe('b.ts')
      expect(results[2]!.path).toBe('c.ts')
    })

    it('should pass metadata through', () => {
      const archive = new FileArchive()
      const results = archive.archiveMany([
        { path: 'a.ts', content: 'a', metadata: { tag: 'important' } },
      ])
      expect(results[0]!.metadata).toEqual({ tag: 'important' })
    })

    it('should return empty array for empty input', () => {
      const archive = new FileArchive()
      expect(archive.archiveMany([])).toEqual([])
    })
  })

  describe('restore', () => {
    it('should restore the latest version by default', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      const result = archive.restore('a.ts')
      expect(result.restored).toBe(true)
      expect(result.version).toBe(2)
    })

    it('should restore a specific version', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      const result = archive.restore('a.ts', { version: 1 })
      expect(result.restored).toBe(true)
      expect(result.version).toBe(1)
    })

    it('should return error for non-existent path', () => {
      const archive = new FileArchive()
      const result = archive.restore('missing.ts')
      expect(result.restored).toBe(false)
      expect(result.error).toContain('No archived file found')
    })

    it('should return error for non-existent version', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const result = archive.restore('a.ts', { version: 99 })
      expect(result.restored).toBe(false)
      expect(result.error).toContain('Version 99 not found')
    })

    it('should handle dry run mode', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const result = archive.restore('a.ts', { dryRun: true })
      expect(result.restored).toBe(false)
      expect(result.version).toBe(1)
    })
  })

  describe('restoreMany', () => {
    it('should restore multiple paths', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'a')
      archive.archive('b.ts', 'b')
      const results = archive.restoreMany(['a.ts', 'b.ts'])
      expect(results).toHaveLength(2)
      expect(results[0]!.restored).toBe(true)
      expect(results[1]!.restored).toBe(true)
    })

    it('should handle mix of existing and missing paths', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'a')
      const results = archive.restoreMany(['a.ts', 'missing.ts'])
      expect(results[0]!.restored).toBe(true)
      expect(results[1]!.restored).toBe(false)
    })

    it('should pass options to each restore', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      const results = archive.restoreMany(['a.ts'], { version: 1 })
      expect(results[0]!.version).toBe(1)
    })
  })

  describe('getHistory', () => {
    it('should return version history sorted by version', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      archive.archive('a.ts', 'v3')
      const history = archive.getHistory('a.ts')
      expect(history).toHaveLength(3)
      expect(history.map((f) => f.version)).toEqual([1, 2, 3])
    })

    it('should return empty array for unknown path', () => {
      const archive = new FileArchive()
      expect(archive.getHistory('x.ts')).toEqual([])
    })
  })

  describe('getDiff', () => {
    it('should detect modified files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      const diff = archive.getDiff('a.ts', 1, 2)
      expect(diff.type).toBe('modified')
      expect(diff.oldHash).toBeTruthy()
      expect(diff.newHash).toBeTruthy()
      expect(diff.oldHash).not.toBe(diff.newHash)
    })

    it('should detect unchanged files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'same')
      const v1 = archive.getHistory('a.ts')[0]!
      const diff = archive.getDiff('a.ts', v1.version, v1.version)
      expect(diff.type).toBe('unchanged')
    })

    it('should handle added (from version missing)', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const diff = archive.getDiff('a.ts', 99, 1)
      expect(diff.type).toBe('added')
      expect(diff.newHash).toBeTruthy()
    })

    it('should handle removed (to version missing)', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const diff = archive.getDiff('a.ts', 1, 99)
      expect(diff.type).toBe('removed')
      expect(diff.oldHash).toBeTruthy()
    })

    it('should handle both versions missing', () => {
      const archive = new FileArchive()
      const diff = archive.getDiff('a.ts', 1, 2)
      expect(diff.type).toBe('unchanged')
    })
  })

  describe('diffSnapshots', () => {
    it('should detect added files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const snap1 = archive.createSnapshot('s1')

      archive.archive('b.ts', 'new file')
      const snap2 = archive.createSnapshot('s2')

      const diffs = archive.diffSnapshots(snap1, snap2)
      const added = diffs.find((d) => d.path === 'b.ts')
      expect(added).toBeDefined()
      expect(added!.type).toBe('added')
    })

    it('should detect removed files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('b.ts', 'v1')
      const snap1 = archive.createSnapshot('s1')

      archive.delete('b.ts')
      const snap2 = archive.createSnapshot('s2')

      const diffs = archive.diffSnapshots(snap1, snap2)
      const removed = diffs.find((d) => d.path === 'b.ts')
      expect(removed).toBeDefined()
      expect(removed!.type).toBe('removed')
    })

    it('should detect modified files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const snap1 = archive.createSnapshot('s1')

      archive.archive('a.ts', 'v2 changed')
      const snap2 = archive.createSnapshot('s2')

      const diffs = archive.diffSnapshots(snap1, snap2)
      const modified = diffs.find((d) => d.path === 'a.ts')
      expect(modified).toBeDefined()
      expect(modified!.type).toBe('modified')
    })

    it('should detect unchanged files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const snap1 = archive.createSnapshot('s1')
      const snap2 = archive.createSnapshot('s2')

      const diffs = archive.diffSnapshots(snap1, snap2)
      const unchanged = diffs.find((d) => d.path === 'a.ts')
      expect(unchanged).toBeDefined()
      expect(unchanged!.type).toBe('unchanged')
    })

    it('should return empty diff for identical snapshots', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const snap1 = archive.createSnapshot('s1')
      const snap2 = archive.createSnapshot('s2')
      const diffs = archive.diffSnapshots(snap1, snap2)
      expect(diffs.every((d) => d.type === 'unchanged')).toBe(true)
    })
  })

  describe('createSnapshot', () => {
    it('should create a snapshot with current files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('b.ts', 'v1')
      const snapshot = archive.createSnapshot('test-snap')
      expect(snapshot.name).toBe('test-snap')
      expect(snapshot.files.size).toBe(2)
      expect(snapshot.id).toBeTruthy()
    })

    it('should accept a tag', () => {
      const archive = new FileArchive()
      const snapshot = archive.createSnapshot('snap', 'v1.0.0')
      expect(snapshot.tag).toBe('v1.0.0')
    })

    it('should accept a description', () => {
      const archive = new FileArchive()
      const snapshot = archive.createSnapshot('snap', undefined, 'test description')
      expect(snapshot.description).toBe('test description')
    })

    it('should capture latest version of each file', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      archive.archive('a.ts', 'v3')
      const snapshot = archive.createSnapshot('snap')
      const file = snapshot.files.get('a.ts')
      expect(file?.version).toBe(3)
    })

    it('should create independent copy of files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const snapshot = archive.createSnapshot('snap')
      archive.archive('a.ts', 'v2 changed')
      const snapFile = snapshot.files.get('a.ts')
      expect(snapFile?.content).toBe('v1')
    })

    it('should store the snapshot for later retrieval', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      const snapshot = archive.createSnapshot('snap')
      const results = archive.restoreSnapshot(snapshot.id)
      expect(results).toHaveLength(1)
      expect(results[0]!.restored).toBe(true)
    })
  })

  describe('restoreSnapshot', () => {
    it('should restore all files from a snapshot', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('b.ts', 'v1')
      const snapshot = archive.createSnapshot('snap')
      const results = archive.restoreSnapshot(snapshot.id)
      expect(results).toHaveLength(2)
      expect(results.every((r) => r.restored)).toBe(true)
    })

    it('should return error for non-existent snapshot', () => {
      const archive = new FileArchive()
      const results = archive.restoreSnapshot('nonexistent')
      expect(results).toHaveLength(1)
      expect(results[0]!.restored).toBe(false)
      expect(results[0]!.error).toContain('Snapshot not found')
    })

    it('should return correct path and version info', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      const snapshot = archive.createSnapshot('snap')
      const results = archive.restoreSnapshot(snapshot.id)
      expect(results[0]!.path).toBe('a.ts')
      expect(results[0]!.version).toBe(2)
    })
  })

  describe('delete', () => {
    it('should delete all versions of a file', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      expect(archive.delete('a.ts')).toBe(true)
      expect(archive.getHistory('a.ts')).toEqual([])
    })

    it('should return false for non-existent path', () => {
      const archive = new FileArchive()
      expect(archive.delete('missing.ts')).toBe(false)
    })
  })

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      const archive = new FileArchive({ maxVersions: 5 })
      const config = archive.getConfig()
      config.maxVersions = 999
      expect(archive.getConfig().maxVersions).toBe(5)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty archive', () => {
      const archive = new FileArchive()
      const stats = archive.getStats()
      expect(stats.totalFiles).toBe(0)
      expect(stats.totalVersions).toBe(0)
      expect(stats.totalSize).toBe(0)
    })

    it('should count total files', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('b.ts', 'v1')
      expect(archive.getStats().totalFiles).toBe(2)
    })

    it('should count total versions', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      archive.archive('a.ts', 'v3')
      archive.archive('b.ts', 'v1')
      expect(archive.getStats().totalVersions).toBe(4)
    })

    it('should calculate total size', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', '12345')
      archive.archive('b.ts', 'abc')
      expect(archive.getStats().totalSize).toBe(8)
    })

    it('should not count duplicate content as new version', () => {
      const archive = new FileArchive()
      archive.archive('a.ts', 'same')
      archive.archive('a.ts', 'same')
      expect(archive.getStats().totalVersions).toBe(1)
    })
  })

  describe('maxVersions enforcement', () => {
    it('should enforce maxVersions limit', () => {
      const archive = new FileArchive({ maxVersions: 3 })
      archive.archive('a.ts', 'v1')
      archive.archive('a.ts', 'v2')
      archive.archive('a.ts', 'v3')
      archive.archive('a.ts', 'v4')
      archive.archive('a.ts', 'v5')
      const history = archive.getHistory('a.ts')
      expect(history).toHaveLength(3)
      expect(history.map((f) => f.version)).toEqual([3, 4, 5])
    })

    it('should not affect other files when pruning', () => {
      const archive = new FileArchive({ maxVersions: 2 })
      archive.archive('a.ts', 'v1')
      archive.archive('b.ts', 'v1')
      archive.archive('a.ts', 'v2')
      archive.archive('a.ts', 'v3')
      expect(archive.getHistory('a.ts')).toHaveLength(2)
      expect(archive.getHistory('b.ts')).toHaveLength(1)
    })
  })

  describe('hashAlgorithm config', () => {
    it('should use sha256 by default', () => {
      const archive = new FileArchive()
      const result = archive.archive('a.ts', 'test')
      const expectedHash = require('node:crypto').createHash('sha256').update('test').digest('hex')
      expect(result.hash).toBe(expectedHash)
    })

    it('should support md5', () => {
      const archive = new FileArchive({ hashAlgorithm: 'md5' })
      const result = archive.archive('a.ts', 'test')
      const expectedHash = require('node:crypto').createHash('md5').update('test').digest('hex')
      expect(result.hash).toBe(expectedHash)
    })
  })
})

describe('DEFAULT_ARCHIVE_CONFIG', () => {
  it('should have correct defaults', () => {
    expect(DEFAULT_ARCHIVE_CONFIG.maxVersions).toBe(10)
    expect(DEFAULT_ARCHIVE_CONFIG.autoCompress).toBe(false)
    expect(DEFAULT_ARCHIVE_CONFIG.hashAlgorithm).toBe('sha256')
  })
})

describe('Edge cases', () => {
  it('should handle empty content', () => {
    const archive = new FileArchive()
    const result = archive.archive('empty.ts', '')
    expect(result.size).toBe(0)
    expect(result.content).toBe('')
  })

  it('should handle unicode content', () => {
    const archive = new FileArchive()
    const content = 'hello 世界 🌍'
    const result = archive.archive('unicode.ts', content)
    expect(result.content).toBe(content)
    expect(result.size).toBeGreaterThan(0)
  })

  it('should handle deeply nested paths', () => {
    const archive = new FileArchive()
    const path = 'src/core/deep/nested/module/file.ts'
    const result = archive.archive(path, 'deep')
    expect(result.path).toBe(path)
  })

  it('should handle large number of versions', () => {
    const archive = new FileArchive({ maxVersions: 100 })
    for (let i = 0; i < 50; i++) {
      archive.archive('a.ts', `version ${i}`)
    }
    expect(archive.getHistory('a.ts')).toHaveLength(50)
    expect(archive.getStats().totalVersions).toBe(50)
  })

  it('should handle archiving many files at once', () => {
    const archive = new FileArchive()
    const files = Array.from({ length: 100 }, (_, i) => ({
      path: `file${i}.ts`,
      content: `content ${i}`,
    }))
    const results = archive.archiveMany(files)
    expect(results).toHaveLength(100)
    expect(archive.getStats().totalFiles).toBe(100)
  })

  it('should produce unique ids for each archived file', () => {
    const archive = new FileArchive()
    archive.archive('a.ts', 'v1')
    archive.archive('a.ts', 'v2')
    const history = archive.getHistory('a.ts')
    expect(history[0]!.id).not.toBe(history[1]!.id)
  })

  it('should handle snapshot of empty archive', () => {
    const archive = new FileArchive()
    const snapshot = archive.createSnapshot('empty')
    expect(snapshot.files.size).toBe(0)
  })

  it('should handle diff between empty snapshots', () => {
    const archive = new FileArchive()
    const snap1 = archive.createSnapshot('s1')
    const snap2 = archive.createSnapshot('s2')
    expect(archive.diffSnapshots(snap1, snap2)).toEqual([])
  })

  it('should handle concurrent path and version operations', () => {
    const store = new ArchiveStore()
    store.add(makeFile({ path: 'a.ts', version: 1 }))
    store.add(makeFile({ path: 'b.ts', version: 1 }))
    store.add(makeFile({ path: 'a.ts', version: 2 }))
    store.remove('a.ts', 1)
    expect(store.getLatest('a.ts')?.version).toBe(2)
    expect(store.getLatest('b.ts')?.version).toBe(1)
    expect(store.size()).toBe(2)
  })
})
