import { describe, it, expect } from 'vitest';
import { LinkCutTree } from '../../src/utils/link-cut-tree.js';

describe('LinkCutTree', () => {
  it('should initialize with correct number of nodes', () => {
    const lct = new LinkCutTree(5);
    expect(() => lct.setValue(0, 1)).not.toThrow();
    expect(() => lct.setValue(4, 5)).not.toThrow();
  });

  it('should throw error for out of bounds node access', () => {
    const lct = new LinkCutTree(5);
    expect(() => lct.setValue(5, 1)).toThrow('Node index out of bounds');
    expect(() => lct.getValue(-1)).toThrow('Node index out of bounds');
  });

  it('should link two nodes', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    expect(lct.connected(0, 1)).toBe(true);
  });

  it('should throw error when linking node to itself', () => {
    const lct = new LinkCutTree(5);
    expect(() => lct.link(0, 0)).toThrow('Cannot link node to itself');
  });

  it('should throw error when linking already connected nodes', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    expect(() => lct.link(0, 1)).toThrow('Nodes are already connected');
  });

  it('should cut node from its parent', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.cut(0);
    expect(lct.connected(0, 1)).toBe(false);
  });

  it('should find root of a tree', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.findRoot(0)).toBe(2);
  });

  it('should be its own root when not linked', () => {
    const lct = new LinkCutTree(5);
    expect(lct.findRoot(0)).toBe(0);
  });

  it('should check if nodes are connected', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.connected(0, 2)).toBe(true);
    expect(lct.connected(0, 3)).toBe(false);
  });

  it('should return true when checking same node for connection', () => {
    const lct = new LinkCutTree(5);
    expect(lct.connected(0, 0)).toBe(true);
  });

  it('should calculate path sum', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.pathSum(0)).toBe(6);
  });

  it('should find path minimum', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 5);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.pathMin(0)).toBe(2);
  });

  it('should find path maximum', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 5);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.pathMax(0)).toBe(5);
  });

  it('should update path values', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.pathUpdate(0, 10);
    expect(lct.pathSum(0)).toBe(36);
  });

  it('should find lowest common ancestor', () => {
    const lct = new LinkCutTree(6);
    lct.link(0, 2);
    lct.link(1, 2);
    lct.link(2, 3);
    lct.link(3, 4);
    lct.link(3, 5);
    expect(lct.lca(0, 1)).toBe(2);
    expect(lct.lca(0, 4)).toBe(3);
  });

  it('should return -1 for LCA of unconnected nodes', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.link(2, 3);
    expect(lct.lca(0, 2)).toBe(-1);
  });

  it('should return node itself as LCA when nodes are same', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    expect(lct.lca(0, 0)).toBe(0);
  });

  it('should evert node to make it root', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.evert(0);
    expect(lct.findRoot(2)).toBe(0);
  });

  it('should handle single node operations', () => {
    const lct = new LinkCutTree(1);
    lct.setValue(0, 42);
    expect(lct.getValue(0)).toBe(42);
    expect(lct.pathSum(0)).toBe(42);
    expect(lct.pathMin(0)).toBe(42);
    expect(lct.pathMax(0)).toBe(42);
  });

  it('should handle chain graph structure', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.setValue(3, 4);
    lct.setValue(4, 5);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.link(2, 3);
    lct.link(3, 4);
    expect(lct.pathSum(0)).toBe(15);
    expect(lct.findRoot(0)).toBe(4);
  });

  it('should handle star graph structure', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 10);
    lct.setValue(1, 1);
    lct.setValue(2, 2);
    lct.setValue(3, 3);
    lct.setValue(4, 4);
    lct.link(1, 0);
    lct.link(2, 0);
    lct.link(3, 0);
    lct.link(4, 0);
    expect(lct.pathSum(1)).toBe(11);
    expect(lct.pathSum(2)).toBe(12);
    expect(lct.pathSum(3)).toBe(13);
    expect(lct.pathSum(4)).toBe(14);
  });

  it('should set and get node values', () => {
    const lct = new LinkCutTree(3);
    lct.setValue(0, 100);
    lct.setValue(1, 200);
    lct.setValue(2, 300);
    expect(lct.getValue(0)).toBe(100);
    expect(lct.getValue(1)).toBe(200);
    expect(lct.getValue(2)).toBe(300);
  });

  it('should handle cut and relink operations', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.cut(1);
    lct.link(1, 3);
    lct.link(3, 4);
    expect(lct.connected(0, 1)).toBe(false);
    expect(lct.connected(1, 4)).toBe(true);
  });

  it('should handle multiple path updates', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.pathUpdate(0, 5);
    expect(lct.pathSum(0)).toBe(21);
    lct.pathUpdate(1, 10);
    expect(lct.pathSum(1)).toBe(35);
  });
});