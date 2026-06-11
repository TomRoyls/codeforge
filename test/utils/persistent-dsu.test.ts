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

  it('single element is connected to itself', () => {
    const dsu = new PersistentDSU(1);
    expect(dsu.connected(0, 0)).toBe(true);
  });

  it('find returns root after path compression', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    dsu.union(1, 2);
    dsu.union(2, 3);
    expect(dsu.connected(0, 3)).toBe(true)
    expect(dsu.find(3)).toBe(dsu.find(0))
  });

  it('getSize after rollback', () => {
    const dsu = new PersistentDSU(5);
    const snap = dsu.snapshot();
    dsu.union(0, 1);
    dsu.union(1, 2);
    expect(dsu.getSize(0)).toBe(3);
    dsu.rollback(snap);
    expect(dsu.getSize(0)).toBe(1);
  });

  it('components after rollback', () => {
    const dsu = new PersistentDSU(5);
    const snap = dsu.snapshot();
    dsu.union(0, 1);
    dsu.union(2, 3);
    expect(dsu.components).toBe(3);
    dsu.rollback(snap);
    expect(dsu.components).toBe(5);
  });

  it('snapshot id increments', () => {
    const dsu = new PersistentDSU(3);
    expect(dsu.snapshot()).toBe(0);
    expect(dsu.snapshot()).toBe(1);
    expect(dsu.snapshot()).toBe(2);
  });

  it('rollback to initial empty snapshot', () => {
    const dsu = new PersistentDSU(3);
    const snap = dsu.snapshot();
    dsu.union(0, 1);
    dsu.union(1, 2);
    dsu.rollback(snap);
    expect(dsu.components).toBe(3);
    expect(dsu.connected(0, 1)).toBe(false);
    expect(dsu.connected(1, 2)).toBe(false);
  });

  it('unionBatch with empty array returns 0', () => {
    const dsu = new PersistentDSU(3);
    expect(dsu.unionBatch([])).toBe(0);
  });

  it('unionBatch all already connected returns 0', () => {
    const dsu = new PersistentDSU(3);
    dsu.union(0, 1);
    dsu.union(1, 2);
    expect(dsu.unionBatch([[0, 1], [1, 2], [0, 2]])).toBe(0);
  });

  it('getComponent for isolated node returns single element', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    expect(dsu.getComponent(3)).toEqual([3]);
  });

  it('getComponent after union returns all connected', () => {
    const dsu = new PersistentDSU(4);
    dsu.union(0, 1);
    dsu.union(2, 3);
    dsu.union(1, 2);
    expect(dsu.getComponent(0).sort()).toEqual([0, 1, 2, 3]);
  });

  it('union is transitive', () => {
    const dsu = new PersistentDSU(4);
    dsu.union(0, 1);
    dsu.union(2, 3);
    dsu.union(1, 2);
    expect(dsu.connected(0, 3)).toBe(true);
  });

  it('rollback invalidates old snapshots', () => {
    const dsu = new PersistentDSU(3);
    dsu.union(0, 1);
    const snap = dsu.snapshot();
    dsu.union(1, 2);
    dsu.rollback(snap);
    expect(dsu.connected(0, 1)).toBe(true);
    expect(dsu.connected(1, 2)).toBe(false);
    dsu.union(1, 2);
    expect(() => dsu.rollback(snap)).toThrow();
  });

  it('large DSU', () => {
    const dsu = new PersistentDSU(100);
    for (let i = 0; i < 99; i++) dsu.union(i, i + 1);
    expect(dsu.components).toBe(1);
    expect(dsu.connected(0, 99)).toBe(true);
    expect(dsu.getSize(0)).toBe(100);
  });

  it('snapshot after multiple unions', () => {
    const dsu = new PersistentDSU(6);
    dsu.union(0, 1);
    dsu.union(2, 3);
    const snap = dsu.snapshot();
    dsu.union(4, 5);
    dsu.union(1, 2);
    expect(dsu.components).toBe(2);
    dsu.rollback(snap);
    expect(dsu.components).toBe(4);
  });

  it('find throws on negative index', () => {
    const dsu = new PersistentDSU(5);
    expect(() => dsu.find(-1)).toThrow('Index out of bounds');
  });

  it('find throws on index >= length', () => {
    const dsu = new PersistentDSU(5);
    expect(() => dsu.find(5)).toThrow('Index out of bounds');
  });

  it('union throws on negative index', () => {
    const dsu = new PersistentDSU(5);
    expect(() => dsu.union(-1, 0)).toThrow('Index out of bounds');
  });

  it('union throws on index >= length', () => {
    const dsu = new PersistentDSU(5);
    expect(() => dsu.union(0, 5)).toThrow('Index out of bounds');
  });

  it('rollback throws on negative id', () => {
    const dsu = new PersistentDSU(3);
    expect(() => dsu.rollback(-1)).toThrow('Invalid snapshot ID');
  });

  it('rollback throws on non-existent id', () => {
    const dsu = new PersistentDSU(3);
    const id = dsu.snapshot();
    expect(() => dsu.rollback(id + 1)).toThrow('Invalid snapshot ID');
  });

  it('find root after multiple unions', () => {
    const dsu = new PersistentDSU(10);
    dsu.union(0, 1);
    dsu.union(2, 3);
    dsu.union(4, 5);
    expect(dsu.find(1)).toBe(dsu.find(0));
    expect(dsu.find(3)).toBe(dsu.find(2));
    expect(dsu.find(5)).toBe(dsu.find(4));
  });

  it('component size after find triggers path compression', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    dsu.union(1, 2);
    dsu.union(2, 3);
    dsu.find(3);
    expect(dsu.getSize(3)).toBe(4);
  });

  it('multiple snapshots do not interfere', () => {
    const dsu = new PersistentDSU(4);
    dsu.union(0, 1);
    const snap1 = dsu.snapshot();
    dsu.union(2, 3);
    const snap2 = dsu.snapshot();
    dsu.rollback(snap1);
    expect(dsu.connected(0, 1)).toBe(true);
    expect(dsu.connected(2, 3)).toBe(false);
    dsu.union(2, 3);
    const snap3 = dsu.snapshot();
    expect(dsu.connected(2, 3)).toBe(true);
  });

  it('getComponent for each element returns same component', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    dsu.union(1, 2);
    const comp0 = dsu.getComponent(0).sort();
    const comp1 = dsu.getComponent(1).sort();
    const comp2 = dsu.getComponent(2).sort();
    expect(comp0).toEqual(comp1);
    expect(comp1).toEqual(comp2);
  });

  it('union skip when already connected', () => {
    const dsu = new PersistentDSU(4);
    dsu.union(0, 1);
    const result1 = dsu.union(0, 1);
    const result2 = dsu.union(1, 0);
    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(dsu.components).toBe(3);
  });

  it('find same element multiple times', () => {
    const dsu = new PersistentDSU(5);
    const root = dsu.find(2);
    expect(dsu.find(2)).toBe(root);
    expect(dsu.find(2)).toBe(root);
    expect(dsu.find(2)).toBe(root);
  });

  it('find throws for out of bounds index', () => {
    const dsu = new PersistentDSU(3);
    expect(() => dsu.find(10)).toThrow();
  });

  it('union throws for out of bounds indices', () => {
    const dsu = new PersistentDSU(3);
    expect(() => dsu.union(0, 10)).toThrow();
    expect(() => dsu.union(10, 0)).toThrow();
  });

  it('rollback throws for invalid snapshot id', () => {
    const dsu = new PersistentDSU(3);
    expect(() => dsu.rollback(5)).toThrow();
    expect(() => dsu.rollback(-1)).toThrow();
  });

  it('getSize returns correct size after multiple unions', () => {
    const dsu = new PersistentDSU(6);
    dsu.union(0, 1);
    dsu.union(2, 3);
    dsu.union(0, 2);
    expect(dsu.getSize(0)).toBe(4);
    expect(dsu.getSize(4)).toBe(1);
  });

  it('getComponent returns all elements in same set', () => {
    const dsu = new PersistentDSU(5);
    dsu.union(0, 1);
    dsu.union(2, 3);
    dsu.union(0, 2);
    const comp = dsu.getComponent(1).sort();
    expect(comp).toEqual([0, 1, 2, 3]);
  });

  it('unionBatch with partial connections', () => {
    const dsu = new PersistentDSU(6);
    dsu.union(0, 1);
    const merged = dsu.unionBatch([[0, 1], [2, 3], [3, 4], [1, 2]]);
    expect(merged).toBe(3);
    expect(dsu.components).toBe(2);
  });

  it('connected throws for out of bounds', () => {
    const dsu = new PersistentDSU(3);
    expect(() => dsu.connected(0, 10)).toThrow();
  });

  it('rollback to snapshot before union disconnects elements', () => {
    const dsu = new PersistentDSU(3);
    dsu.union(0, 1);
    const snap = dsu.snapshot();
    dsu.union(1, 2);
    expect(dsu.connected(0, 2)).toBe(true);
    dsu.rollback(snap);
    expect(dsu.connected(0, 1)).toBe(true);
    expect(dsu.connected(0, 2)).toBe(false);
  });
});