import { describe, it, expect, vi } from 'vitest';
import { ProbabilityMap2 } from '../src/core/probability-map-2/index.js';

describe('ProbabilityMap2', () => {
  it('should create an empty map', () => {
    const map = new ProbabilityMap2();
    expect(map.size).toBe(0);
    expect(map.totalWeight()).toBe(0);
  });

  it('should set and get weights', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    expect(map.getWeight('apple')).toBe(10);
    expect(map.getWeight('banana')).toBe(20);
    expect(map.getWeight('cherry')).toBe(30);
    expect(map.getWeight('date')).toBeUndefined();
  });

  it('should calculate probabilities correctly', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    expect(map.get('apple')).toBe(10 / 60);
    expect(map.get('banana')).toBe(20 / 60);
    expect(map.get('cherry')).toBe(30 / 60);
    expect(map.get('date')).toBeUndefined();
  });

  it('should return total weight', () => {
    const map = new ProbabilityMap2();
    expect(map.totalWeight()).toBe(0);

    map.set('a', 5);
    expect(map.totalWeight()).toBe(5);

    map.set('b', 15);
    expect(map.totalWeight()).toBe(20);

    map.set('c', 30);
    expect(map.totalWeight()).toBe(50);
  });

  it('should check if key exists', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);

    expect(map.has('apple')).toBe(true);
    expect(map.has('banana')).toBe(true);
    expect(map.has('cherry')).toBe(false);
  });

  it('should delete keys and update total weight', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    expect(map.size).toBe(3);
    expect(map.totalWeight()).toBe(60);

    expect(map.delete('banana')).toBe(true);
    expect(map.size).toBe(2);
    expect(map.totalWeight()).toBe(40);
    expect(map.has('banana')).toBe(false);
    expect(map.delete('nonexistent')).toBe(false);
  });

  it('should return size', () => {
    const map = new ProbabilityMap2();
    expect(map.size).toBe(0);

    map.set('a', 1);
    expect(map.size).toBe(1);

    map.set('b', 2);
    expect(map.size).toBe(2);

    map.set('c', 3);
    expect(map.size).toBe(3);

    map.delete('b');
    expect(map.size).toBe(2);
  });

  it('should return keys', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    const keys = map.keys();
    expect(keys).toContain('apple');
    expect(keys).toContain('banana');
    expect(keys).toContain('cherry');
    expect(keys.length).toBe(3);
  });

  it('should return entries with weight and probability', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    const entries = map.entries();
    expect(entries.length).toBe(3);

    const appleEntry = entries.find(([key]) => key === 'apple');
    const bananaEntry = entries.find(([key]) => key === 'banana');
    const cherryEntry = entries.find(([key]) => key === 'cherry');

    expect(appleEntry).toBeDefined();
    expect(appleEntry?.[1].weight).toBe(10);
    expect(appleEntry?.[1].probability).toBe(10 / 60);

    expect(bananaEntry).toBeDefined();
    expect(bananaEntry?.[1].weight).toBe(20);
    expect(bananaEntry?.[1].probability).toBe(20 / 60);

    expect(cherryEntry).toBeDefined();
    expect(cherryEntry?.[1].weight).toBe(30);
    expect(cherryEntry?.[1].probability).toBe(30 / 60);
  });

  it('should clear all entries', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    expect(map.size).toBe(3);
    expect(map.totalWeight()).toBe(60);

    map.clear();

    expect(map.size).toBe(0);
    expect(map.totalWeight()).toBe(0);
    expect(map.has('apple')).toBe(false);
    expect(map.has('banana')).toBe(false);
    expect(map.has('cherry')).toBe(false);
  });

  it('should normalize probabilities', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    expect(map.totalWeight()).toBe(60);

    map.normalize();

    expect(map.totalWeight()).toBe(1);
    expect(map.get('apple')).toBe(10 / 60);
    expect(map.get('banana')).toBe(20 / 60);
    expect(map.get('cherry')).toBe(30 / 60);

    expect(map.getWeight('apple')).toBe(10 / 60);
    expect(map.getWeight('banana')).toBe(20 / 60);
    expect(map.getWeight('cherry')).toBe(30 / 60);
  });

  it('should handle zero weight', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 0);
    map.set('banana', 10);

    expect(map.getWeight('apple')).toBe(0);
    expect(map.get('apple')).toBe(0);
  });

  it('should handle single item', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 100);

    expect(map.size).toBe(1);
    expect(map.totalWeight()).toBe(100);
    expect(map.get('apple')).toBe(1);
    expect(map.getWeight('apple')).toBe(100);
  });

  it('should handle empty map', () => {
    const map = new ProbabilityMap2();

    expect(map.size).toBe(0);
    expect(map.totalWeight()).toBe(0);
    expect(map.keys()).toEqual([]);
    expect(map.entries()).toEqual([]);
    expect(map.get('any')).toBeUndefined();
    expect(map.getWeight('any')).toBeUndefined();
    expect(map.has('any')).toBe(false);
    expect(map.delete('any')).toBe(false);
  });

  it('should sample based on probability', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);
    map.set('cherry', 30);

    const mockRandom = vi.spyOn(Math, 'random');
    
    mockRandom.mockReturnValue(0.1);
    expect(map.sample()).toBe('apple');
    
    mockRandom.mockReturnValue(0.4);
    expect(map.sample()).toBe('banana');
    
    mockRandom.mockReturnValue(0.7);
    expect(map.sample()).toBe('cherry');

    mockRandom.mockRestore();
  });

  it('should return undefined when sampling empty map', () => {
    const map = new ProbabilityMap2();
    expect(map.sample()).toBeUndefined();
  });

  it('should update existing key weight', () => {
    const map = new ProbabilityMap2();
    map.set('apple', 10);
    map.set('banana', 20);

    expect(map.getWeight('apple')).toBe(10);
    expect(map.totalWeight()).toBe(30);

    map.set('apple', 15);

    expect(map.getWeight('apple')).toBe(15);
    expect(map.totalWeight()).toBe(35);
  });

  it('should handle normalization of empty map', () => {
    const map = new ProbabilityMap2();
    map.normalize();

    expect(map.size).toBe(0);
    expect(map.totalWeight()).toBe(0);
  });

  it('should get probability of item when total weight is zero', () => {
    const map = new ProbabilityMap2();
    map.set('item', 0);
    
    expect(map.get('item')).toBeUndefined();
  });

  it('should handle clear and re-add', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    map.clear();
    expect(map.size).toBe(0);
    map.set('c', 30);
    expect(map.size).toBe(1);
    expect(map.getWeight('c')).toBe(30);
  });

  it('should handle delete and verify remaining', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    map.delete('a');
    expect(map.has('a')).toBe(false);
    expect(map.totalWeight()).toBe(20);
    expect(map.size).toBe(1);
  });

  it('should handle single item map', () => {
    const map = new ProbabilityMap2();
    map.set('only', 100);
    expect(map.get('only')).toBe(1);
    expect(map.sample()).toBe('only');
  });

  it('should handle entries returning all items', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    const entries = map.entries();
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e[0])).toContain('a');
    expect(entries.map(e => e[0])).toContain('b');
  });

  it('should update weight and recalculate probabilities', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 10);
    expect(map.get('a')).toBe(0.5);
    map.set('a', 30);
    expect(map.get('a')).toBeCloseTo(30 / 40);
    expect(map.get('b')).toBeCloseTo(10 / 40);
  });

  it('should handle normalize then add more items', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    map.normalize();
    expect(map.totalWeight()).toBe(1);
    map.set('c', 0.5);
    expect(map.totalWeight()).toBe(1.5);
    expect(map.get('c')).toBeCloseTo(0.5 / 1.5);
  });

  it('should handle delete then re-add same key', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.delete('a');
    expect(map.has('a')).toBe(false);
    map.set('a', 20);
    expect(map.getWeight('a')).toBe(20);
    expect(map.has('a')).toBe(true);
  });

  it('should handle multiple items with same weight', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 10);
    map.set('c', 10);
    expect(map.get('a')).toBeCloseTo(1 / 3);
    expect(map.get('b')).toBeCloseTo(1 / 3);
    expect(map.get('c')).toBeCloseTo(1 / 3);
    expect(map.totalWeight()).toBe(30);
  });

  it('should handle clear', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    map.clear();
    expect(map.size).toBe(0);
    expect(map.totalWeight()).toBe(0);
  });

  it('should handle keys', () => {
    const map = new ProbabilityMap2();
    map.set('x', 1);
    map.set('y', 2);
    const keys = map.keys();
    expect(keys).toContain('x');
    expect(keys).toContain('y');
  });

  it('should handle single item probability is 1', () => {
    const map = new ProbabilityMap2();
    map.set('only', 42);
    expect(map.get('only')).toBe(1);
  });

  it('should handle getWeight', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    expect(map.getWeight('a')).toBe(10);
    expect(map.getWeight('b')).toBe(20);
    expect(map.getWeight('c')).toBeUndefined();
  });

  it('should handle entries', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    const entries = map.entries();
    expect(entries.length).toBe(2);
    expect(entries.some(([k]) => k === 'a')).toBe(true);
    expect(entries.some(([k]) => k === 'b')).toBe(true);
  });

  it('should handle normalize', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 30);
    map.normalize();
    expect(map.get('a')).toBeCloseTo(0.25, 5);
    expect(map.get('b')).toBeCloseTo(0.75, 5);
  });

  it('should handle delete', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    expect(map.delete('a')).toBe(true);
    expect(map.has('a')).toBe(false);
    expect(map.size).toBe(1);
  });

  it('should handle sample returning valid key', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    const sample = map.sample();
    expect(sample).toBeDefined();
    expect(['a', 'b']).toContain(sample);
  });

  it('should handle keys', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    const keys = map.keys();
    expect(keys).toContain('a');
    expect(keys).toContain('b');
  });

  it('should handle entries', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    const entries = map.entries();
    expect(entries.length).toBe(2);
  });

  it('should handle delete', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    expect(map.delete('a')).toBe(true);
    expect(map.has('a')).toBe(false);
    expect(map.size).toBe(1);
  });

  it('should handle clear', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    map.clear();
    expect(map.size).toBe(0);
  });

  it('should handle normalize', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 30);
    map.normalize();
    const entries = map.entries();
    const totalProb = entries.reduce((sum, e) => sum + e[1].probability, 0);
    expect(totalProb).toBeCloseTo(1, 5);
  });

  it('should handle totalWeight', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 30);
    expect(map.totalWeight()).toBe(40);
  });

  it('should handle keys', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 30);
    expect(map.keys()).toEqual(['a', 'b']);
  });
  it('should handle delete', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    expect(map.delete('a')).toBe(true);
    expect(map.has('a')).toBe(false);
  });
  it('should handle totalWeight', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    expect(map.totalWeight()).toBe(30);
  });
  it('should handle keys', () => {
    const map = new ProbabilityMap2();
    map.set('a', 10);
    map.set('b', 20);
    const keys = map.keys();
    expect(keys).toContain('a');
    expect(keys).toContain('b');
  });
});
