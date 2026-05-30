import { describe, expect, it } from 'vitest'
import { HashUtil } from '../../../src/core/hash-util/hash-util.js'

describe('HashUtil', () => {
  const hashUtil = new HashUtil()

  it('computes hash for empty string', () => {
    const result = hashUtil.hash('')
    expect(result).toBe('1505')
  })

  it('computes hash for known input', () => {
    const result = hashUtil.hash('hello world')
    expect(result).toBe('3551c8c1')
  })

  it('computes hash for unicode string', () => {
    const result = hashUtil.hash('test 🚀')
    expect(result).toBe('d93a10c2')
  })

  it('computes hash for long string', () => {
    const longString = 'a'.repeat(1000)
    const result = hashUtil.hash(longString)
    expect(result).toBe('d13cc66d')
  })

  it('returns same hash for same input', () => {
    const input = 'consistent input'
    const hash1 = hashUtil.hash(input)
    const hash2 = hashUtil.hash(input)
    expect(hash1).toBe(hash2)
  })

  it('returns different hashes for different inputs', () => {
    const hash1 = hashUtil.hash('input1')
    const hash2 = hashUtil.hash('input2')
    expect(hash1).not.toBe(hash2)
  })

  it('verifies correct hash', () => {
    const data = 'test data'
    const expectedHash = hashUtil.hash(data)
    const result = hashUtil.verify(data, expectedHash)
    expect(result).toBe(true)
  })

  it('fails verification for incorrect hash', () => {
    const data = 'test data'
    const wrongHash = 'wronghash'
    const result = hashUtil.verify(data, wrongHash)
    expect(result).toBe(false)
  })

  it('compares matching hashes', () => {
    const hash1 = 'abc123'
    const hash2 = 'abc123'
    const result = hashUtil.compare(hash1, hash2)
    expect(result.match).toBe(true)
    expect(result.hash1).toBe(hash1)
    expect(result.hash2).toBe(hash2)
  })

  it('compares non-matching hashes', () => {
    const hash1 = 'abc123'
    const hash2 = 'def456'
    const result = hashUtil.compare(hash1, hash2)
    expect(result.match).toBe(false)
    expect(result.hash1).toBe(hash1)
    expect(result.hash2).toBe(hash2)
  })

  it('deduplicates empty map', () => {
    const items = new Map<string, string>()
    const result = hashUtil.deduplicate(items)
    expect(result.totalItems).toBe(0)
    expect(result.uniqueCount).toBe(0)
    expect(result.duplicateCount).toBe(0)
    expect(result.savedBytes).toBe(0)
  })

  it('deduplicates map with no duplicates', () => {
    const items = new Map([
      ['file1', 'content1'],
      ['file2', 'content2'],
      ['file3', 'content3'],
    ])
    const result = hashUtil.deduplicate(items)
    expect(result.totalItems).toBe(3)
    expect(result.uniqueCount).toBe(3)
    expect(result.duplicateCount).toBe(0)
    expect(result.savedBytes).toBe(0)
  })

  it('deduplicates map with duplicates', () => {
    const items = new Map([
      ['file1', 'same content'],
      ['file2', 'same content'],
      ['file3', 'different'],
    ])
    const result = hashUtil.deduplicate(items)
    expect(result.totalItems).toBe(3)
    expect(result.uniqueCount).toBe(2)
    expect(result.duplicateCount).toBe(1)
    expect(result.savedBytes).toBeGreaterThan(0)
  })

  it('deduplicates map with all duplicates', () => {
    const items = new Map([
      ['file1', 'content'],
      ['file2', 'content'],
      ['file3', 'content'],
    ])
    const result = hashUtil.deduplicate(items)
    expect(result.totalItems).toBe(3)
    expect(result.uniqueCount).toBe(1)
    expect(result.duplicateCount).toBe(2)
    expect(result.savedBytes).toBe(14)
  })

  it('deduplicates map with multiple duplicate groups', () => {
    const items = new Map([
      ['file1', 'contentA'],
      ['file2', 'contentA'],
      ['file3', 'contentB'],
      ['file4', 'contentB'],
      ['file5', 'contentC'],
    ])
    const result = hashUtil.deduplicate(items)
    expect(result.totalItems).toBe(5)
    expect(result.uniqueCount).toBe(3)
    expect(result.duplicateCount).toBe(2)
  })

  it('checks integrity of empty entries', () => {
    const entries = new Map()
    const result = hashUtil.checkIntegrity(entries)
    expect(result).toEqual([])
  })

  it('checks integrity with valid entries', () => {
    const entries = new Map([
      ['key1', { content: 'data1', expectedHash: hashUtil.hash('data1') }],
      ['key2', { content: 'data2', expectedHash: hashUtil.hash('data2') }],
    ])
    const result = hashUtil.checkIntegrity(entries)
    expect(result.length).toBe(2)
    expect(result[0].valid).toBe(true)
    expect(result[1].valid).toBe(true)
  })

  it('checks integrity with invalid entries', () => {
    const entries = new Map([
      ['key1', { content: 'data1', expectedHash: 'wronghash' }],
    ])
    const result = hashUtil.checkIntegrity(entries)
    expect(result.length).toBe(1)
    expect(result[0].valid).toBe(false)
  })

  it('checks integrity with mixed valid and invalid entries', () => {
    const entries = new Map([
      ['key1', { content: 'data1', expectedHash: hashUtil.hash('data1') }],
      ['key2', { content: 'data2', expectedHash: 'wronghash' }],
      ['key3', { content: 'data3', expectedHash: hashUtil.hash('data3') }],
    ])
    const result = hashUtil.checkIntegrity(entries)
    expect(result.length).toBe(3)
    expect(result[0].valid).toBe(true)
    expect(result[1].valid).toBe(false)
    expect(result[2].valid).toBe(true)
  })

  it('gets default algorithm', () => {
    const result = hashUtil.getAlgorithm()
    expect(result).toBe('djb2')
  })

  it('sets algorithm', () => {
    hashUtil.setAlgorithm('fnv1a')
    expect(hashUtil.getAlgorithm()).toBe('fnv1a')
  })

  it('computes hash with changed algorithm', () => {
    const input = 'test'
    const hash1 = hashUtil.hash(input)
    hashUtil.setAlgorithm('simple')
    const hash2 = hashUtil.hash(input)
    expect(hash1).not.toBe(hash2)
  })

  it('compares hashes with algorithm in result', () => {
    hashUtil.setAlgorithm('simple')
    const result = hashUtil.compare('hash1', 'hash2')
    expect(result.algorithm).toBe('simple')
  })

  it('checks integrity with algorithm in result', () => {
    const entries = new Map([['key1', { content: 'data1', expectedHash: hashUtil.hash('data1') }]])
    const result = hashUtil.checkIntegrity(entries)
    expect(result[0].algorithm).toBe(hashUtil.getAlgorithm())
  })

  it('deduplicates maps containing special characters', () => {
    const items = new Map([
      ['file1', 'content with spaces'],
      ['file2', 'content with spaces'],
      ['file3', 'content\nwith\nnewlines'],
    ])
    const result = hashUtil.deduplicate(items)
    expect(result.totalItems).toBe(3)
    expect(result.uniqueCount).toBe(2)
  })
})