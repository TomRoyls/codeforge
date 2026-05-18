import { describe, expect, it } from 'vitest'
import { TaskQueue } from '../../../src/core/task-runner/task-queue.js'
import type { Task } from '../../../src/core/task-runner/types.js'

// ─── Helpers ───

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    name: overrides.name ?? `task-${overrides.id}`,
    handler: overrides.handler ?? (() => undefined),
    dependencies: overrides.dependencies ?? [],
    priority: overrides.priority ?? 0,
    timeout: overrides.timeout ?? 5000,
    retries: overrides.retries ?? 0,
    retryDelay: overrides.retryDelay ?? 100,
    status: overrides.status ?? 'pending',
    createdAt: overrides.createdAt ?? Date.now(),
    ...overrides,
  }
}

// ─── Construction ───

describe('TaskQueue construction', () => {
  it('starts empty', () => {
    const q = new TaskQueue()
    expect(q.size()).toBe(0)
  })

  it('getAll returns empty array when empty', () => {
    const q = new TaskQueue()
    expect(q.getAll()).toEqual([])
  })

  it('peek returns null when empty', () => {
    const q = new TaskQueue()
    expect(q.peek()).toBeNull()
  })

  it('dequeue returns null when empty', () => {
    const q = new TaskQueue()
    expect(q.dequeue()).toBeNull()
  })
})

// ─── enqueue() ───

describe('TaskQueue enqueue', () => {
  it('adds a task and increases size', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    expect(q.size()).toBe(1)
  })

  it('stores the task accessible by id', () => {
    const q = new TaskQueue()
    const task = makeTask({ id: 'a', name: 'my-task' })
    q.enqueue(task)
    expect(q.get('a')).toBe(task)
  })

  it('maintains insertion order', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.enqueue(makeTask({ id: 'c' }))
    const all = q.getAll()
    expect(all.map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('overwrites task with same id in map but appends to order', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a', name: 'first' }))
    q.enqueue(makeTask({ id: 'a', name: 'second' }))
    expect(q.size()).toBe(2)
    expect(q.get('a')!.name).toBe('second')
  })
})

// ─── dequeue() ───

describe('TaskQueue dequeue', () => {
  it('removes and returns the first task', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    const dequeued = q.dequeue()
    expect(dequeued!.id).toBe('a')
    expect(q.size()).toBe(1)
  })

  it('keeps task accessible by get until explicitly removed', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.dequeue()
    expect(q.get('a')).not.toBeNull()
    expect(q.size()).toBe(0)
  })

  it('maintains FIFO order across multiple dequeues', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.enqueue(makeTask({ id: 'c' }))
    expect(q.dequeue()!.id).toBe('a')
    expect(q.dequeue()!.id).toBe('b')
    expect(q.dequeue()!.id).toBe('c')
    expect(q.dequeue()).toBeNull()
  })
})

// ─── peek() ───

describe('TaskQueue peek', () => {
  it('returns the first task without removing it', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    expect(q.peek()!.id).toBe('a')
    expect(q.size()).toBe(1)
  })

  it('reflects changes after dequeue', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.dequeue()
    expect(q.peek()!.id).toBe('b')
  })
})

// ─── remove() ───

describe('TaskQueue remove', () => {
  it('removes a task by id and returns true', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    expect(q.remove('a')).toBe(true)
    expect(q.size()).toBe(0)
    expect(q.get('a')).toBeNull()
  })

  it('returns false for non-existent id', () => {
    const q = new TaskQueue()
    expect(q.remove('missing')).toBe(false)
  })

  it('removes from middle of queue preserving order', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.enqueue(makeTask({ id: 'c' }))
    q.remove('b')
    expect(q.getAll().map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('removes from front of queue', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.remove('a')
    expect(q.peek()!.id).toBe('b')
  })

  it('removes from end of queue', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.remove('b')
    expect(q.getAll().map((t) => t.id)).toEqual(['a'])
  })
})

// ─── get() ───

describe('TaskQueue get', () => {
  it('returns the task by id', () => {
    const q = new TaskQueue()
    const task = makeTask({ id: 'a', name: 'find-me' })
    q.enqueue(task)
    expect(q.get('a')).toBe(task)
  })

  it('returns null for missing id', () => {
    const q = new TaskQueue()
    expect(q.get('nope')).toBeNull()
  })
})

// ─── getAll() ───

describe('TaskQueue getAll', () => {
  it('returns all tasks in insertion order', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.enqueue(makeTask({ id: 'c' }))
    const all = q.getAll()
    expect(all).toHaveLength(3)
    expect(all.map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array after clearing all tasks', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.dequeue()
    q.dequeue()
    expect(q.getAll()).toEqual([])
  })
})

// ─── getByStatus() ───

describe('TaskQueue getByStatus', () => {
  it('filters tasks by status', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a', status: 'pending' }))
    q.enqueue(makeTask({ id: 'b', status: 'running' }))
    q.enqueue(makeTask({ id: 'c', status: 'pending' }))
    const pending = q.getByStatus('pending')
    expect(pending).toHaveLength(2)
    expect(pending.map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('returns empty array when no tasks match status', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a', status: 'pending' }))
    expect(q.getByStatus('completed')).toEqual([])
  })

  it('returns empty array when queue is empty', () => {
    const q = new TaskQueue()
    expect(q.getByStatus('pending')).toEqual([])
  })

  it('handles all status types', () => {
    const statuses = ['pending', 'running', 'completed', 'failed', 'skipped', 'timeout'] as const
    const q = new TaskQueue()
    for (const s of statuses) {
      q.enqueue(makeTask({ id: s, status: s }))
    }
    for (const s of statuses) {
      expect(q.getByStatus(s)).toHaveLength(1)
    }
  })
})

// ─── size() ───

describe('TaskQueue size', () => {
  it('returns correct count after operations', () => {
    const q = new TaskQueue()
    expect(q.size()).toBe(0)
    q.enqueue(makeTask({ id: 'a' }))
    expect(q.size()).toBe(1)
    q.enqueue(makeTask({ id: 'b' }))
    expect(q.size()).toBe(2)
    q.dequeue()
    expect(q.size()).toBe(1)
    q.remove('b')
    expect(q.size()).toBe(0)
  })
})

// ─── clear() ───

describe('TaskQueue clear', () => {
  it('removes all tasks', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.enqueue(makeTask({ id: 'b' }))
    q.clear()
    expect(q.size()).toBe(0)
    expect(q.getAll()).toEqual([])
  })

  it('allows enqueue after clear', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.clear()
    q.enqueue(makeTask({ id: 'b' }))
    expect(q.size()).toBe(1)
    expect(q.get('b')!.id).toBe('b')
  })

  it('clears get lookup too', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a' }))
    q.clear()
    expect(q.get('a')).toBeNull()
  })
})

// ─── sortByPriority() ───

describe('TaskQueue sortByPriority', () => {
  it('sorts tasks by priority descending', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a', priority: 1 }))
    q.enqueue(makeTask({ id: 'b', priority: 5 }))
    q.enqueue(makeTask({ id: 'c', priority: 3 }))
    q.sortByPriority()
    expect(q.getAll().map((t) => t.id)).toEqual(['b', 'c', 'a'])
  })

  it('maintains order for equal priorities', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a', priority: 2 }))
    q.enqueue(makeTask({ id: 'b', priority: 2 }))
    q.enqueue(makeTask({ id: 'c', priority: 2 }))
    q.sortByPriority()
    expect(q.getAll().map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('sorts single element without error', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a', priority: 10 }))
    q.sortByPriority()
    expect(q.getAll().map((t) => t.id)).toEqual(['a'])
  })

  it('sorts after partial dequeue', () => {
    const q = new TaskQueue()
    q.enqueue(makeTask({ id: 'a', priority: 1 }))
    q.enqueue(makeTask({ id: 'b', priority: 3 }))
    q.enqueue(makeTask({ id: 'c', priority: 2 }))
    q.dequeue()
    q.sortByPriority()
    expect(q.getAll().map((t) => t.id)).toEqual(['b', 'c'])
  })

  it('sorts empty queue without error', () => {
    const q = new TaskQueue()
    expect(() => q.sortByPriority()).not.toThrow()
    expect(q.size()).toBe(0)
  })
})
