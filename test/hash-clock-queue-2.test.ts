import { describe, it, expect } from 'vitest';
import { HashClock2 } from '../src/core/hash-clock-2/index';

describe('HashClock2', () => {
  it('should create a hash clock with given id', async () => {
    const clock = new HashClock2('node1');
    expect(clock.getId()).toBe('node1');
  });

  it('should return empty current before any tick', async () => {
    const clock = new HashClock2('node1');
    expect(clock.current()).toBe('');
  });

  it('should tick and return new hash', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    expect(hash1).toBeTruthy();
    expect(typeof hash1).toBe('string');
  });

  it('should advance clock on each tick', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    const hash2 = clock.tick();
    expect(hash1).not.toBe(hash2);
  });

  it('should return current hash', async () => {
    const clock = new HashClock2('node1');
    clock.tick();
    const hash = clock.tick();
    expect(clock.current()).toBe(hash);
  });

  it('should track length', async () => {
    const clock = new HashClock2('node1');
    expect(clock.length).toBe(0);
    clock.tick();
    expect(clock.length).toBe(1);
    clock.tick();
    clock.tick();
    expect(clock.length).toBe(3);
  });

  it('should return empty history before any tick', async () => {
    const clock = new HashClock2('node1');
    const history = clock.getHistory();
    expect(history).toEqual([]);
  });

  it('should track history of all hashes', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    const hash2 = clock.tick();
    const hash3 = clock.tick();
    const history = clock.getHistory();
    expect(history.length).toBe(3);
    expect(history[0]!).toBe(hash1);
    expect(history[1]!).toBe(hash2);
    expect(history[2]!).toBe(hash3);
  });

  it('should return copy of history', async () => {
    const clock = new HashClock2('node1');
    clock.tick();
    clock.tick();
    const history1 = clock.getHistory();
    clock.tick();
    const history2 = clock.getHistory();
    expect(history1.length).toBe(2);
    expect(history2.length).toBe(3);
  });

  it('should check equality with current hash', async () => {
    const clock = new HashClock2('node1');
    const hash = clock.tick();
    expect(clock.isEqual(hash)).toBe(true);
    expect(clock.isEqual('some-other-hash')).toBe(false);
  });

  it('should return false for equality before any tick', async () => {
    const clock = new HashClock2('node1');
    expect(clock.isEqual('')).toBe(true);
    expect(clock.isEqual('some-hash')).toBe(false);
  });

  it('should check happenedBefore for past hashes', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    clock.tick();
    clock.tick();
    expect(clock.happenedBefore(hash1)).toBe(true);
    expect(clock.happenedBefore('non-existent')).toBe(false);
  });

  it('should return false for happenedBefore before any tick', async () => {
    const clock = new HashClock2('node1');
    expect(clock.happenedBefore('')).toBe(false);
    expect(clock.happenedBefore('some-hash')).toBe(false);
  });

  it('should merge new hash and advance clock', async () => {
    const clock = new HashClock2('node1');
    clock.tick();
    const beforeLength = clock.length;
    const result = clock.merge('external-hash-123');
    expect(result).toBe(true);
    expect(clock.length).toBe(beforeLength + 1);
    expect(clock.current()).toBe('external-hash-123');
  });

  it('should not merge duplicate hash', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    const beforeLength = clock.length;
    const result = clock.merge(hash1);
    expect(result).toBe(false);
    expect(clock.length).toBe(beforeLength);
  });

  it('should handle multiple nodes with different ids', async () => {
    const clock1 = new HashClock2('node1');
    const clock2 = new HashClock2('node2');
    
    const hash1a = clock1.tick();
    const hash2a = clock2.tick();
    const hash1b = clock1.tick();
    const hash2b = clock2.tick();
    
    expect(clock1.getId()).toBe('node1');
    expect(clock2.getId()).toBe('node2');
    expect(hash1a).not.toBe(hash2a);
    expect(hash1b).not.toBe(hash2b);
    expect(clock1.getHistory().length).toBe(2);
    expect(clock2.getHistory().length).toBe(2);
  });

  it('should have deterministic hashes for same node and sequence', async () => {
    const clock1 = new HashClock2('node1');
    const clock2 = new HashClock2('node1');
    
    const hash1a = clock1.tick();
    const hash2a = clock2.tick();
    const hash1b = clock1.tick();
    const hash2b = clock2.tick();
    
    expect(hash1a).toBe(hash2a);
    expect(hash1b).toBe(hash2b);
  });

  it('should handle empty history retrieval', async () => {
    const clock = new HashClock2('node1');
    const history = clock.getHistory();
    expect(history).toEqual([]);
    expect(history.length).toBe(0);
  });

  it('should merge multiple external hashes', async () => {
    const clock = new HashClock2('node1');
    clock.tick();
    
    expect(clock.merge('hash-a')).toBe(true);
    expect(clock.merge('hash-b')).toBe(true);
    expect(clock.merge('hash-c')).toBe(true);
    expect(clock.length).toBe(4);
  });

  it('should track all hashes including merged ones in history', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    clock.merge('external-1');
    const hash2 = clock.tick();
    
    const history = clock.getHistory();
    expect(history.length).toBe(3);
    expect(history[0]!).toBe(hash1);
    expect(history[1]!).toBe('external-1');
    expect(history[2]!).toBe(hash2);
  });

  it('should handle checking happenedBefore on merged hashes', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    clock.merge('external-1');
    
    expect(clock.happenedBefore(hash1)).toBe(true);
    expect(clock.happenedBefore('external-1')).toBe(true);
    expect(clock.happenedBefore('non-existent')).toBe(false);
  });

  it('should have correct current after multiple operations', async () => {
    const clock = new HashClock2('node1');
    clock.tick();
    clock.merge('external-1');
    clock.tick();
    const lastHash = clock.tick();
    
    expect(clock.current()).toBe(lastHash);
  });

  it('should handle isEqual after merge', async () => {
    const clock = new HashClock2('node1');
    clock.tick();
    clock.merge('ext-hash');
    expect(clock.isEqual('ext-hash')).toBe(true);
    const nextTick = clock.tick();
    expect(clock.isEqual(nextTick)).toBe(true);
    expect(clock.isEqual('ext-hash')).toBe(false);
  });

  it('should merge empty string as valid hash', async () => {
    const clock = new HashClock2('node1');
    clock.tick();
    const result = clock.merge('');
    expect(result).toBe(true);
    expect(clock.length).toBe(2);
  });

  it('should handle large number of ticks', async () => {
    const clock = new HashClock2('node1');
    let lastHash = '';
    for (let i = 0; i < 100; i++) {
      lastHash = clock.tick();
    }
    expect(clock.length).toBe(100);
    expect(clock.current()).toBe(lastHash);
    expect(clock.getHistory().length).toBe(100);
  });

  it('should happenBefore includes current hash', async () => {
    const clock = new HashClock2('node1');
    const hash1 = clock.tick();
    const hash2 = clock.tick();
    expect(clock.happenedBefore(hash1)).toBe(true);
    expect(clock.happenedBefore(hash2)).toBe(true);
    expect(clock.happenedBefore('non-existent')).toBe(false);
  });
});
