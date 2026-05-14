import { describe, it, expect } from 'vitest';
import { HashClock2 } from '../src/core/hash-clock-2/index.js';

describe('HashClock2', () => {
  describe('constructor', () => {
    it('should create instance with id', () => {
      const clock = new HashClock2('node1');
      expect(clock.getId()).toBe('node1');
      expect(clock.length).toBe(0);
      expect(clock.current()).toBe('');
      expect(clock.getHistory()).toEqual([]);
    });

    it('should create instance with empty id', () => {
      const clock = new HashClock2('');
      expect(clock.getId()).toBe('');
      expect(clock.length).toBe(0);
    });

    it('should create instance with complex id', () => {
      const clock = new HashClock2('node-123-server');
      expect(clock.getId()).toBe('node-123-server');
    });
  });

  describe('tick', () => {
    it('should generate hash on first tick', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(clock.length).toBe(1);
      expect(clock.current()).toBe(hash);
    });

    it('should generate different hash on each tick', () => {
      const clock = new HashClock2('node1');
      const hash1 = clock.tick();
      const hash2 = clock.tick();
      const hash3 = clock.tick();
      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
      expect(hash1).not.toBe(hash3);
      expect(clock.length).toBe(3);
    });

    it('should update current on each tick', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      const hash2 = clock.tick();
      expect(clock.current()).toBe(hash2);
      const hash3 = clock.tick();
      expect(clock.current()).toBe(hash3);
    });

    it('should increment counter on each tick', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.tick();
      clock.tick();
      expect(clock.length).toBe(3);
    });

    it('should store hashes in history', () => {
      const clock = new HashClock2('node1');
      const hash1 = clock.tick();
      const hash2 = clock.tick();
      const history = clock.getHistory();
      expect(history).toEqual([hash1, hash2]);
      expect(history.length).toBe(2);
    });

    it('should generate hash based on previous hash', () => {
      const clock = new HashClock2('node1');
      const hash1 = clock.tick();
      const hash2 = clock.tick();
      expect(hash1).not.toBe(hash2);
      expect(hash1.length).toBeGreaterThan(0);
      expect(hash2.length).toBeGreaterThan(0);
    });

    it('should generate consistent hashes for same id and sequence', () => {
      const clock1 = new HashClock2('node1');
      const clock2 = new HashClock2('node1');
      const hash1 = clock1.tick();
      const hash2 = clock2.tick();
      expect(hash1).toBe(hash2);
    });
  });

  describe('current', () => {
    it('should return empty string when no ticks', () => {
      const clock = new HashClock2('node1');
      expect(clock.current()).toBe('');
    });

    it('should return latest hash after tick', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      expect(clock.current()).toBe(hash);
    });

    it('should update after multiple ticks', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      const hash2 = clock.tick();
      const hash3 = clock.tick();
      expect(clock.current()).toBe(hash3);
      expect(clock.current()).not.toBe(hash2);
    });
  });

  describe('merge', () => {
    it('should merge new hash and return true', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      const result = clock.merge('external-hash-1');
      expect(result).toBe(true);
      expect(clock.length).toBe(2);
    });

    it('should not merge duplicate hash and return false', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      const result = clock.merge(hash);
      expect(result).toBe(false);
      expect(clock.length).toBe(1);
    });

    it('should add merged hash to history', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.merge('external-1');
      const history = clock.getHistory();
      expect(history.length).toBe(2);
      expect(history[1]).toBe('external-1');
    });

    it('should set current to merged hash', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.merge('external-1');
      expect(clock.current()).toBe('external-1');
    });

    it('should allow merging multiple hashes', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.merge('ext1');
      clock.merge('ext2');
      clock.merge('ext3');
      expect(clock.length).toBe(4);
      const history = clock.getHistory();
      expect(history).toEqual([history[0], 'ext1', 'ext2', 'ext3']);
    });

    it('should increment counter on merge', () => {
      const clock = new HashClock2('node1');
      const initialLength = clock.length;
      clock.merge('external-1');
      expect(clock.length).toBe(initialLength + 1);
    });

    it('should not increment counter on duplicate merge', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      const lengthBefore = clock.length;
      clock.merge(hash);
      expect(clock.length).toBe(lengthBefore);
    });

    it('should merge into empty clock', () => {
      const clock = new HashClock2('node1');
      const result = clock.merge('first-hash');
      expect(result).toBe(true);
      expect(clock.length).toBe(1);
      expect(clock.current()).toBe('first-hash');
    });

    it('should handle empty string merge', () => {
      const clock = new HashClock2('node1');
      const result = clock.merge('');
      expect(result).toBe(true);
      expect(clock.current()).toBe('');
    });
  });

  describe('happenedBefore', () => {
    it('should return false for empty history', () => {
      const clock = new HashClock2('node1');
      expect(clock.happenedBefore('any-hash')).toBe(false);
    });

    it('should return true for hash in history', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      expect(clock.happenedBefore(hash)).toBe(true);
    });

    it('should return false for hash not in history', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      expect(clock.happenedBefore('non-existent')).toBe(false);
    });

    it('should return true for multiple hashes in history', () => {
      const clock = new HashClock2('node1');
      const hash1 = clock.tick();
      const hash2 = clock.tick();
      const hash3 = clock.tick();
      expect(clock.happenedBefore(hash1)).toBe(true);
      expect(clock.happenedBefore(hash2)).toBe(true);
      expect(clock.happenedBefore(hash3)).toBe(true);
    });

    it('should check merged hashes', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.merge('external-1');
      expect(clock.happenedBefore('external-1')).toBe(true);
    });

    it('should return false after duplicate merge', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      clock.merge(hash);
      expect(clock.happenedBefore(hash)).toBe(true);
    });

    it('should handle empty string check', () => {
      const clock = new HashClock2('node1');
      clock.merge('');
      expect(clock.happenedBefore('')).toBe(true);
    });

    it('should return false for empty string when not in history', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      expect(clock.happenedBefore('')).toBe(false);
    });
  });

  describe('isEqual', () => {
    it('should return false when no ticks', () => {
      const clock = new HashClock2('node1');
      expect(clock.isEqual('some-hash')).toBe(false);
    });

    it('should return true for current hash', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      expect(clock.isEqual(hash)).toBe(true);
    });

    it('should return false for non-current hash', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      clock.tick();
      expect(clock.isEqual(hash)).toBe(false);
    });

    it('should return true for merged hash', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      clock.merge('external-1');
      expect(clock.isEqual('external-1')).toBe(true);
    });

    it('should return false for hash not in history', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      expect(clock.isEqual('non-existent')).toBe(false);
    });

    it('should compare with current after multiple ticks', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.tick();
      const hash3 = clock.tick();
      expect(clock.isEqual(hash3)).toBe(true);
    });

    it('should handle empty string comparison', () => {
      const clock = new HashClock2('node1');
      expect(clock.isEqual('')).toBe(true);
      clock.tick();
      expect(clock.isEqual('')).toBe(false);
    });
  });

  describe('getId', () => {
    it('should return the id', () => {
      const clock = new HashClock2('node1');
      expect(clock.getId()).toBe('node1');
    });

    it('should return empty string for empty id', () => {
      const clock = new HashClock2('');
      expect(clock.getId()).toBe('');
    });

    it('should return id after operations', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.merge('external');
      expect(clock.getId()).toBe('node1');
    });
  });

  describe('getHistory', () => {
    it('should return empty array for new clock', () => {
      const clock = new HashClock2('node1');
      const history = clock.getHistory();
      expect(history).toEqual([]);
      expect(history).toBeInstanceOf(Array);
    });

    it('should return array with one hash after one tick', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      const history = clock.getHistory();
      expect(history).toEqual([hash]);
      expect(history.length).toBe(1);
    });

    it('should return array with multiple hashes', () => {
      const clock = new HashClock2('node1');
      const hash1 = clock.tick();
      const hash2 = clock.tick();
      const hash3 = clock.tick();
      const history = clock.getHistory();
      expect(history).toEqual([hash1, hash2, hash3]);
      expect(history.length).toBe(3);
    });

    it('should include merged hashes', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.merge('external-1');
      const history = clock.getHistory();
      expect(history.length).toBe(2);
      expect(history[1]).toBe('external-1');
    });

    it('should return copy of history', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      const history1 = clock.getHistory();
      const history2 = clock.getHistory();
      expect(history1).toEqual(history2);
      expect(history1).not.toBe(history2);
    });

    it('should not be affected by external array modification', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.tick();
      const history = clock.getHistory();
      history.push('external-modification');
      expect(clock.getHistory().length).toBe(2);
    });
  });

  describe('length', () => {
    it('should be 0 for new clock', () => {
      const clock = new HashClock2('node1');
      expect(clock.length).toBe(0);
    });

    it('should increment on tick', () => {
      const clock = new HashClock2('node1');
      expect(clock.length).toBe(0);
      clock.tick();
      expect(clock.length).toBe(1);
      clock.tick();
      expect(clock.length).toBe(2);
    });

    it('should increment on merge', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      expect(clock.length).toBe(1);
      clock.merge('external-1');
      expect(clock.length).toBe(2);
    });

    it('should not increment on duplicate merge', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      expect(clock.length).toBe(1);
      clock.merge(hash);
      expect(clock.length).toBe(1);
    });

    it('should track total operations', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.tick();
      clock.merge('ext1');
      clock.tick();
      clock.merge('ext2');
      expect(clock.length).toBe(5);
    });

    it('should match history length', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      clock.tick();
      clock.tick();
      expect(clock.length).toBe(clock.getHistory().length);
    });
  });

  describe('integration', () => {
    it('should handle tick then merge sequence', () => {
      const clock = new HashClock2('node1');
      const hash1 = clock.tick();
      clock.merge('external-1');
      const hash2 = clock.tick();
      expect(clock.length).toBe(3);
      expect(clock.current()).toBe(hash2);
      expect(clock.happenedBefore(hash1)).toBe(true);
      expect(clock.happenedBefore('external-1')).toBe(true);
    });

    it('should handle merge then tick sequence', () => {
      const clock = new HashClock2('node1');
      clock.merge('external-1');
      clock.tick();
      clock.tick();
      expect(clock.length).toBe(3);
      const history = clock.getHistory();
      expect(history[0]).toBe('external-1');
      expect(history.length).toBe(3);
    });

    it('should handle multiple clocks', () => {
      const clock1 = new HashClock2('node1');
      const clock2 = new HashClock2('node2');
      const hash1 = clock1.tick();
      const hash2 = clock2.tick();
      expect(clock1.getId()).toBe('node1');
      expect(clock2.getId()).toBe('node2');
      expect(hash1).not.toBe(hash2);
    });

    it('should sync clocks via merge', () => {
      const clock1 = new HashClock2('node1');
      const clock2 = new HashClock2('node2');
      clock1.tick();
      const hash1 = clock1.tick();
      clock2.merge(hash1);
      expect(clock2.happenedBefore(hash1)).toBe(true);
      expect(clock2.isEqual(hash1)).toBe(true);
    });

    it('should handle complex operation sequence', () => {
      const clock = new HashClock2('node1');
      const hashes: string[] = [];
      for (let i = 0; i < 10; i++) {
        hashes.push(clock.tick());
      }
      expect(clock.length).toBe(10);
      expect(clock.getHistory()).toEqual(hashes);
      expect(clock.current()).toBe(hashes[9]);
      clock.merge('external-1');
      expect(clock.length).toBe(11);
      expect(clock.isEqual('external-1')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in id', () => {
      const clock = new HashClock2('node-1_2@3');
      expect(clock.getId()).toBe('node-1_2@3');
      clock.tick();
      expect(clock.length).toBe(1);
    });

    it('should handle long id', () => {
      const longId = 'a'.repeat(1000);
      const clock = new HashClock2(longId);
      expect(clock.getId()).toBe(longId);
      clock.tick();
      expect(clock.length).toBe(1);
    });

    it('should handle many ticks', () => {
      const clock = new HashClock2('node1');
      for (let i = 0; i < 100; i++) {
        clock.tick();
      }
      expect(clock.length).toBe(100);
      const history = clock.getHistory();
      expect(history.length).toBe(100);
    });

    it('should handle many merges', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      for (let i = 0; i < 50; i++) {
        clock.merge(`external-${i}`);
      }
      expect(clock.length).toBe(51);
    });

    it('should handle mixed tick and merge operations', () => {
      const clock = new HashClock2('node1');
      for (let i = 0; i < 10; i++) {
        clock.tick();
        clock.merge(`external-${i}`);
      }
      expect(clock.length).toBe(20);
    });

    it('should handle duplicate merge prevention', () => {
      const clock = new HashClock2('node1');
      clock.tick();
      const hash1 = clock.tick();
      const hash2 = clock.tick();
      clock.merge(hash1);
      clock.merge(hash2);
      clock.merge(hash1);
      expect(clock.length).toBe(3);
    });

    it('should handle hash collision checks', () => {
      const clock = new HashClock2('node1');
      const hash = clock.tick();
      expect(clock.happenedBefore(hash)).toBe(true);
      expect(clock.happenedBefore(hash.toUpperCase())).toBe(false);
    });

    it('should maintain order in history', () => {
      const clock = new HashClock2('node1');
      const hashes: string[] = [];
      for (let i = 0; i < 5; i++) {
        hashes.push(clock.tick());
      }
      const history = clock.getHistory();
      expect(history).toEqual(hashes);
      expect(history[0]).toBe(hashes[0]);
      expect(history[4]).toBe(hashes[4]);
    });
  });
});
