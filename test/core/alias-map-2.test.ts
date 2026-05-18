import { describe, it, expect } from 'vitest';
import { AliasMap2 } from '../../src/core/alias-map-2/index.js';

// ─── Constructor ───

describe('AliasMap2 constructor', () => {
  it('creates an empty map', () => {
    const map = new AliasMap2<string>();
    expect(map.size).toBe(0);
    expect(map.keys()).toEqual([]);
    expect(map.values()).toEqual([]);
  });
});

// ─── set() / get() ───

describe('AliasMap2 set and get', () => {
  it('sets and gets a value', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    expect(map.get('a')).toBe(1);
  });

  it('overwrites existing key', () => {
    const map = new AliasMap2<string>();
    map.set('a', 'first');
    map.set('a', 'second');
    expect(map.get('a')).toBe('second');
  });

  it('returns undefined for missing key', () => {
    const map = new AliasMap2<number>();
    expect(map.get('missing')).toBeUndefined();
  });

  it('handles multiple keys', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    expect(map.get('c')).toBe(3);
  });
});

// ─── has() ───

describe('AliasMap2 has', () => {
  it('returns true for existing key', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    expect(map.has('a')).toBe(true);
  });

  it('returns false for missing key', () => {
    const map = new AliasMap2<number>();
    expect(map.has('a')).toBe(false);
  });

  it('returns true for aliased key', () => {
    const map = new AliasMap2<number>();
    map.set('original', 42);
    map.addAlias('alias', 'original');
    expect(map.has('alias')).toBe(true);
  });
});

// ─── delete() ───

describe('AliasMap2 delete', () => {
  it('deletes a key and returns true', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    expect(map.delete('a')).toBe(true);
    expect(map.has('a')).toBe(false);
  });

  it('returns false when deleting missing key', () => {
    const map = new AliasMap2<number>();
    expect(map.delete('missing')).toBe(false);
  });

  it('deletes associated aliases when deleting a key', () => {
    const map = new AliasMap2<number>();
    map.set('original', 1);
    map.addAlias('a1', 'original');
    map.addAlias('a2', 'original');
    map.delete('original');
    expect(map.has('original')).toBe(false);
    expect(map.getAliases('original')).toEqual([]);
  });

  it('deletes an alias directly', () => {
    const map = new AliasMap2<number>();
    map.set('original', 1);
    map.addAlias('a1', 'original');
    expect(map.delete('a1')).toBe(true);
    expect(map.has('original')).toBe(true);
  });
});

// ─── addAlias() ───

describe('AliasMap2 addAlias', () => {
  it('adds an alias successfully', () => {
    const map = new AliasMap2<number>();
    map.set('original', 1);
    expect(map.addAlias('alias', 'original')).toBe(true);
    expect(map.get('alias')).toBe(1);
  });

  it('rejects alias equal to target', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    expect(map.addAlias('a', 'a')).toBe(false);
  });

  it('rejects alias that is already a key', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.set('b', 2);
    expect(map.addAlias('b', 'a')).toBe(false);
  });

  it('rejects alias that is already an alias', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.addAlias('b', 'a');
    expect(map.addAlias('b', 'a')).toBe(false);
  });

  it('rejects alias for non-existent target', () => {
    const map = new AliasMap2<number>();
    expect(map.addAlias('alias', 'missing')).toBe(false);
  });

  it('allows chaining aliases through resolve', () => {
    const map = new AliasMap2<number>();
    map.set('real', 42);
    map.addAlias('a1', 'real');
    expect(map.get('a1')).toBe(42);
  });
});

// ─── removeAlias() ───

describe('AliasMap2 removeAlias', () => {
  it('removes an existing alias', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.addAlias('b', 'a');
    expect(map.removeAlias('b')).toBe(true);
    expect(map.get('b')).toBeUndefined();
  });

  it('returns false for non-existent alias', () => {
    const map = new AliasMap2<number>();
    expect(map.removeAlias('missing')).toBe(false);
  });
});

// ─── getAliases() ───

describe('AliasMap2 getAliases', () => {
  it('returns aliases for a key', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.addAlias('b', 'a');
    map.addAlias('c', 'a');
    const aliases = map.getAliases('a');
    expect(aliases.sort()).toEqual(['b', 'c']);
  });

  it('returns empty array for key with no aliases', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    expect(map.getAliases('a')).toEqual([]);
  });

  it('returns empty array for missing key', () => {
    const map = new AliasMap2<number>();
    expect(map.getAliases('missing')).toEqual([]);
  });
});

// ─── resolve() ───

describe('AliasMap2 resolve', () => {
  it('returns key itself when no alias', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    expect(map.resolve('a')).toBe('a');
  });

  it('resolves alias to target key', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.addAlias('b', 'a');
    expect(map.resolve('b')).toBe('a');
  });

  it('resolves chain of aliases', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.addAlias('b', 'a');
    map.addAlias('c', 'b');
    expect(map.resolve('c')).toBe('a');
  });
});

// ─── size ───

describe('AliasMap2 size', () => {
  it('tracks size correctly', () => {
    const map = new AliasMap2<number>();
    expect(map.size).toBe(0);
    map.set('a', 1);
    expect(map.size).toBe(1);
    map.set('b', 2);
    expect(map.size).toBe(2);
  });

  it('size decreases on delete', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.delete('a');
    expect(map.size).toBe(0);
  });

  it('aliases do not affect size', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.addAlias('b', 'a');
    expect(map.size).toBe(1);
  });
});

// ─── clear() ───

describe('AliasMap2 clear', () => {
  it('clears all keys and aliases', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.set('b', 2);
    map.addAlias('c', 'a');
    map.clear();
    expect(map.size).toBe(0);
    expect(map.get('a')).toBeUndefined();
    expect(map.get('c')).toBeUndefined();
  });
});

// ─── keys() / values() / entries() ───

describe('AliasMap2 iteration methods', () => {
  it('returns all keys', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.set('b', 2);
    expect(map.keys().sort()).toEqual(['a', 'b']);
  });

  it('returns all values', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.set('b', 2);
    expect(map.values().sort()).toEqual([1, 2]);
  });

  it('returns all entries', () => {
    const map = new AliasMap2<number>();
    map.set('a', 1);
    map.set('b', 2);
    const entries = map.entries().sort((x, y) => x[0].localeCompare(y[0]));
    expect(entries).toEqual([['a', 1], ['b', 2]]);
  });
});
