import { describe, it, expect, beforeEach } from 'vitest';
import { RobinHoodHash2 } from '../src/core/robin-hood-hash-2/index.js';

describe('RobinHoodHash2', () => {
  let hash: RobinHoodHash2<string, string>;

  beforeEach(() => {
    hash = new RobinHoodHash2<string, string>();
  });

  it.skip('should create empty hash table', () => {
    expect(hash.size).toBe(0);
    expect(hash.capacity()).toBe(16);
  });

  it('should set and get value', () => {
    hash.set('key1', 'value1');
    expect(hash.get('key1')).toBe('value1');
  });

  it('should set multiple values', () => {
    hash.set('key1', 'value1');
    hash.set('key2', 'value2');
    hash.set('key3', 'value3');
    expect(hash.get('key1')).toBe('value1');
    expect(hash.get('key2')).toBe('value2');
    expect(hash.get('key3')).toBe('value3');
  });

  it('should overwrite existing key', () => {
    hash.set('key1', 'value1');
    hash.set('key1', 'value2');
    expect(hash.get('key1')).toBe('value2');
    expect(hash.size).toBe(1);
  });

  it('should return undefined for non-existent key', () => {
    expect(hash.get('nonexistent')).toBeUndefined();
  });

  it('should check if key exists', () => {
    hash.set('key1', 'value1');
    expect(hash.has('key1')).toBe(true);
    expect(hash.has('nonexistent')).toBe(false);
  });

  it('should delete existing key', () => {
    hash.set('key1', 'value1');
    expect(hash.delete('key1')).toBe(true);
    expect(hash.has('key1')).toBe(false);
    expect(hash.size).toBe(0);
  });

  it('should not delete non-existent key', () => {
    expect(hash.delete('nonexistent')).toBe(false);
  });

  it('should track size correctly', () => {
    expect(hash.size).toBe(0);
    hash.set('key1', 'value1');
    expect(hash.size).toBe(1);
    hash.set('key2', 'value2');
    expect(hash.size).toBe(2);
    hash.delete('key1');
    expect(hash.size).toBe(1);
  });

  it('should clear all entries', () => {
    hash.set('key1', 'value1');
    hash.set('key2', 'value2');
    hash.set('key3', 'value3');
    hash.clear();
    expect(hash.size).toBe(0);
    expect(hash.has('key1')).toBe(false);
    expect(hash.has('key2')).toBe(false);
    expect(hash.has('key3')).toBe(false);
  });

  it('should return capacity', () => {
    expect(hash.capacity()).toBe(16);
    const hash2 = new RobinHoodHash2<string, string>(32);
    expect(hash2.capacity()).toBe(32);
  });

  it('should track max probe length', () => {
    hash.set('key1', 'value1');
    const maxProbe = hash.maxProbeLength();
    expect(typeof maxProbe).toBe('number');
    expect(maxProbe).toBeGreaterThanOrEqual(0);
  });

  it('should resize when load factor exceeds threshold', () => {
    const hash2 = new RobinHoodHash2<string, string>(4, 0.75);
    expect(hash2.capacity()).toBe(4);
    hash2.set('key1', 'value1');
    hash2.set('key2', 'value2');
    hash2.set('key3', 'value3');
    expect(hash2.capacity()).toBe(4);
    hash2.set('key4', 'value4');
    expect(hash2.capacity()).toBe(8);
  });

  it('should handle many insertions', () => {
    for (let i = 0; i < 100; i++) {
      hash.set(`key${i}`, `value${i}`);
    }
    expect(hash.size).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(hash.get(`key${i}`)).toBe(`value${i}`);
    }
  });

  it('should handle large dataset', () => {
    for (let i = 0; i < 500; i++) {
      hash.set(`key${i}`, `value${i}`);
    }
    expect(hash.size).toBe(500);
    expect(hash.get('key250')).toBe('value250');
    expect(hash.get('key499')).toBe('value499');
  });

  it('should handle numeric keys', () => {
    const hashNum = new RobinHoodHash2<number, number>();
    hashNum.set(1, 100);
    hashNum.set(2, 200);
    expect(hashNum.get(1)).toBe(100);
    expect(hashNum.get(2)).toBe(200);
  });

  it('should work with default capacity', () => {
    const hash2 = new RobinHoodHash2<string, string>();
    hash2.set('key1', 'value1');
    expect(hash2.get('key1')).toBe('value1');
  });

  it('should work with custom capacity', () => {
    const hash2 = new RobinHoodHash2<string, string>(64);
    expect(hash2.capacity()).toBe(64);
  });

  it('should work with custom load factor', () => {
    const hash2 = new RobinHoodHash2<string, string>(8, 0.5);
    hash2.set('key1', 'value1');
    hash2.set('key2', 'value2');
    hash2.set('key3', 'value3');
    hash2.set('key4', 'value4');
    expect(hash2.capacity()).toBe(8);
  });

  it('should handle key collision', () => {
    hash.set('ab', 'value1');
    hash.set('ba', 'value2');
    expect(hash.get('ab')).toBe('value1');
    expect(hash.get('ba')).toBe('value2');
  });

  it('should handle delete and reinsert', () => {
    hash.set('key1', 'value1');
    hash.delete('key1');
    hash.set('key1', 'value2');
    expect(hash.get('key1')).toBe('value2');
  });

  it('should maintain values after resize', () => {
    const hash2 = new RobinHoodHash2<string, string>(4, 0.75);
    hash2.set('key1', 'value1');
    hash2.set('key2', 'value2');
    hash2.set('key3', 'value3');
    hash2.set('key4', 'value4');
    expect(hash2.get('key1')).toBe('value1');
    expect(hash2.get('key2')).toBe('value2');
    expect(hash2.get('key3')).toBe('value3');
    expect(hash2.get('key4')).toBe('value4');
  });

  it('should reset max probe length on clear', () => {
    hash.set('key1', 'value1');
    hash.set('key2', 'value2');
    hash.clear();
    expect(hash.maxProbeLength()).toBe(0);
  });

  it('should handle empty string key', () => {
    hash.set('', 'emptyKey');
    expect(hash.get('')).toBe('emptyKey');
  });

  it('should handle special characters in key', () => {
    hash.set('key!@#$', 'special');
    expect(hash.get('key!@#$')).toBe('special');
  });

  it('should handle mixed key types', () => {
    const hashMixed = new RobinHoodHash2<string | number, string>();
    hashMixed.set(1, 'num');
    hashMixed.set('str', 'string');
    expect(hashMixed.get(1)).toBe('num');
    expect(hashMixed.get('str')).toBe('string');
  });
});
