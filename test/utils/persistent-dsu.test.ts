import { describe, it, expect } from 'vitest';
import { PersistentDSU } from '../../src/utils/persistent-dsu.js';

describe('PersistentDSU', () => {
  it('find returns self for single element', () => {
    const dsu = new PersistentDSU(5);
    expect(dsu.find(0)).toBe(0);
    expect(dsu.find(4)).toBe(4);
  });

  it('union connects two elements', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    expect(dsu.connected(0, 1)).toBe(true);
  });

  it('union returns true when merging', () => {
    const dsu = new PersistentDSU(5);
    expect(dsu.union(0, 1)).toBe(true);
  });

  it('union returns false when already connected', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    expect(dsu.union(0, 1)).toBe(false);
  });

  it('connected returns false for unconnected elements', () => {
    const dsu = new PersistentDSU(5);
    expect(dsu.connected(0, 1)).toBe(false);
  });

  it('connected returns true for connected elements', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    expect(dsu.connected(0, 1)).toBe(true);
  });

  it('getSize returns 1 for single element', () => {
    const dsu = new PersistentDSU(5);
    expect(dsu.getSize(0)).toBe(1);
  });

  it('getSize returns size of connected component', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    dsu.union(1, 2);
    expect(dsu.getSize(0)).toBe(3);
  });

  it('snapshot saves current state', () => {
    const dsu = new PersistentDSU(5);
    const id = dsu.snapshot();
    expect(typeof id).toBe('number');
    expect(id).toBe(0);
  });

  it('rollback restores to snapshot state', () => {
    const dsu = new PersistentDSU(5);
    const id = dsu.snapshot();
    dsu.union(0, 1);
    dsu.rollback(id);
    expect(dsu.connected(0, 1)).toBe(false);
  });

  it('multiple snapshots work independently', () => {
    const dsu = new PersistentDSU(5);
    const id1 = dsu.snapshot();
    dsu.union(0, 1);
    const id2 = dsu.snapshot();
    dsu.union(1, 2);
    dsu.rollback(id1);
    expect(dsu.connected(0, 1)).toBe(false);
  });

  it('rollback to earlier snapshot discards later snapshots', () => {
    const dsu = new PersistentDSU(5);
    const id1 = dsu.snapshot();
    dsu.union(0, 1);
    const id2 = dsu.snapshot();
    dsu.union(1, 2);
    dsu.rollback(id1);
    expect(() => dsu.rollback(id2)).toThrow();
  });

  it('union works after rollback', () => {
    const dsu = new PersistentDSU(5);
    const id = dsu.snapshot();
    dsu.union(0, 1);
    dsu.rollback(id);
    dsu.union(0, 1);
    expect(dsu.connected(0, 1)).toBe(true);
  });

  it('components returns correct count', () => {
    const dsu = new PersistentDSU(5);
    expect(dsu.components).toBe(5);
    dsu.union(0, 1);
    expect(dsu.components).toBe(4);
  });

  it('getComponent returns all members', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    dsu.union(1, 2);
    const comp = dsu.getComponent(0);
    expect(comp.sort()).toEqual([0, 1, 2]);
  });

  it('unionBatch returns number of merges', () => {
    const dsu = new PersistentDSU(5);
    const merged = dsu.unionBatch([
      [0, 1],
      [2, 3],
      [1, 2],
    ]);
    expect(merged).toBe(3);
  });

  it('unionBatch skips already connected', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    const merged = dsu.unionBatch([
      [0, 1],
      [2, 3],
    ]);
    expect(merged).toBe(1);
  });

  it('single element edge case', () => {
    const dsu = new PersistentDSU(1);
    expect(dsu.components).toBe(1);
    expect(dsu.find(0)).toBe(0);
  });

  it('all separate edge case', () => {
    const dsu = new PersistentDSU(5);
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        expect(dsu.connected(i, j)).toBe(false);
      }
    }
  });

  it('all connected edge case', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    dsu.union(1, 2);
    dsu.union(2, 3);
    dsu.union(3, 4);
    expect(dsu.components).toBe(1);
    expect(dsu.getComponent(0).length).toBe(5);
  });

  it('rollback to latest snapshot', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    const id = dsu.snapshot();
    dsu.union(1, 2);
    dsu.rollback(id);
    expect(dsu.connected(0, 1)).toBe(true);
    expect(dsu.connected(1, 2)).toBe(false);
  });

  it('snapshot preserves state', () => {
    const dsu = new PersistentDSU(3);
    dsu.union(0, 1);
    const snap = dsu.snapshot();
    dsu.union(1, 2);
    expect(dsu.connected(0, 2)).toBe(true);
    dsu.rollback(snap);
    expect(dsu.connected(0, 1)).toBe(true);
    expect(dsu.connected(0, 2)).toBe(false);
  });

  it('snapshot and rollback restores state', () => {
    const dsu = new PersistentDSU(3);
    dsu.union(0, 1);
    const snap = dsu.snapshot();
    dsu.union(1, 2);
    expect(dsu.connected(0, 2)).toBe(true);
    dsu.rollback(snap);
    expect(dsu.connected(0, 2)).toBe(false);
  });
});