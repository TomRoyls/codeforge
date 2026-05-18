import { describe, it, expect } from 'vitest';
import { RunLengthQueue2 } from '../../src/core/run-length-queue-2/index.js';

// ─── Constructor ───

describe('RunLengthQueue2 – Constructor', () => {
  it('starts empty', () => {
    const q = new RunLengthQueue2<number>();
    expect(q.isEmpty).toBe(true);
    expect(q.size).toBe(0);
    expect(q.totalRuns).toBe(0);
  });

  it('has undefined peek when empty', () => {
    const q = new RunLengthQueue2<number>();
    expect(q.peek).toBeUndefined();
  });
});

// ─── enqueue / dequeue ───

describe('RunLengthQueue2 – enqueue & dequeue', () => {
  it('enqueues and dequeues a single item', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    expect(q.dequeue()).toBe(1);
    expect(q.isEmpty).toBe(true);
  });

  it('maintains FIFO order', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.dequeue()).toBe(1);
    expect(q.dequeue()).toBe(2);
    expect(q.dequeue()).toBe(3);
  });

  it('returns undefined on dequeue from empty queue', () => {
    const q = new RunLengthQueue2<number>();
    expect(q.dequeue()).toBeUndefined();
  });

  it('compresses consecutive duplicates into a single run', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(5);
    q.enqueue(5);
    q.enqueue(5);
    expect(q.totalRuns).toBe(1);
    expect(q.size).toBe(3);
  });

  it('creates separate runs for different values', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(2);
    expect(q.totalRuns).toBe(2);
    expect(q.size).toBe(4);
  });

  it('does not merge non-consecutive same values', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(1);
    expect(q.totalRuns).toBe(3);
  });
});

// ─── peek ───

describe('RunLengthQueue2 – peek', () => {
  it('returns front item without removing it', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(10);
    expect(q.peek).toBe(10);
    expect(q.size).toBe(1);
  });

  it('updates after dequeue', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.dequeue();
    expect(q.peek).toBe(2);
  });
});

// ─── size / isEmpty ───

describe('RunLengthQueue2 – size & isEmpty', () => {
  it('tracks total element count, not run count', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(1);
    q.enqueue(1);
    expect(q.size).toBe(3);
    expect(q.totalRuns).toBe(1);
  });

  it('isEmpty becomes true after draining all items', () => {
    const q = new RunLengthQueue2<string>();
    q.enqueue('a');
    q.enqueue('a');
    q.dequeue();
    q.dequeue();
    expect(q.isEmpty).toBe(true);
  });
});

// ─── enqueueRun / dequeueRun ───

describe('RunLengthQueue2 – enqueueRun & dequeueRun', () => {
  it('enqueues a run of multiple identical items', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueueRun(7, 5);
    expect(q.size).toBe(5);
    expect(q.totalRuns).toBe(1);
  });

  it('merges with last run if same value', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(3);
    q.enqueueRun(3, 4);
    expect(q.totalRuns).toBe(1);
    expect(q.size).toBe(5);
  });

  it('does not merge if different value', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueueRun(2, 3);
    expect(q.totalRuns).toBe(2);
  });

  it('ignores count <= 0', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueueRun(1, 0);
    q.enqueueRun(1, -1);
    expect(q.size).toBe(0);
    expect(q.totalRuns).toBe(0);
  });

  it('dequeueRun returns the full run', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueueRun(9, 4);
    const run = q.dequeueRun();
    expect(run).toEqual({ value: 9, count: 4 });
    expect(q.isEmpty).toBe(true);
  });

  it('dequeueRun returns undefined on empty queue', () => {
    const q = new RunLengthQueue2<number>();
    expect(q.dequeueRun()).toBeUndefined();
  });
});

// ─── toArray ───

describe('RunLengthQueue2 – toArray', () => {
  it('expands runs into a flat array', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(1);
    q.enqueue(2);
    expect(q.toArray()).toEqual([1, 1, 2]);
  });

  it('returns empty array for empty queue', () => {
    const q = new RunLengthQueue2<number>();
    expect(q.toArray()).toEqual([]);
  });

  it('preserves order for multiple runs', () => {
    const q = new RunLengthQueue2<string>();
    q.enqueue('a');
    q.enqueue('a');
    q.enqueue('b');
    q.enqueue('b');
    q.enqueue('b');
    expect(q.toArray()).toEqual(['a', 'a', 'b', 'b', 'b']);
  });
});

// ─── uniqueValues ───

describe('RunLengthQueue2 – uniqueValues', () => {
  it('returns one entry per run', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    q.enqueue(3);
    expect(q.uniqueValues).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty queue', () => {
    const q = new RunLengthQueue2<number>();
    expect(q.uniqueValues).toEqual([]);
  });
});

// ─── clear ───

describe('RunLengthQueue2 – clear', () => {
  it('removes all entries', () => {
    const q = new RunLengthQueue2<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.clear();
    expect(q.isEmpty).toBe(true);
    expect(q.size).toBe(0);
    expect(q.totalRuns).toBe(0);
  });
});
