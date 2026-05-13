export class ConcurrentQueue3<T> {
  private _items: T[] = [];
  private _dequeueWaiters: ((value: T) => void)[] = [];
  private _enqueueWaiters: (() => void)[] = [];
  private readonly _maxSize?: number;

  constructor(maxSize?: number) {
    this._maxSize = maxSize;
  }

  async enqueue(item: T): Promise<void> {
    while (this._maxSize !== undefined && this._items.length >= this._maxSize) {
      await new Promise<void>(resolve => {
        this._enqueueWaiters.push(resolve);
      });
    }

    if (this._dequeueWaiters.length > 0) {
      const resolve = this._dequeueWaiters.shift()!;
      resolve(item);
      this._resolveEnqueueWaiters();
      return;
    }

    this._items.push(item);
  }

  async dequeue(): Promise<T> {
    if (this._items.length > 0) {
      const item = this._items.shift()!;
      this._resolveEnqueueWaiters();
      return item;
    }

    return new Promise<T>(resolve => {
      this._dequeueWaiters.push(resolve);
    });
  }

  peek(): T | undefined {
    if (this._items.length === 0) {
      return undefined;
    }
    return this._items[0];
  }

  get size(): number {
    return this._items.length;
  }

  isEmpty(): boolean {
    return this._items.length === 0;
  }

  clear(): void {
    this._items = [];
    this._dequeueWaiters = [];
    this._enqueueWaiters = [];
  }

  private _resolveEnqueueWaiters(): void {
    while (this._enqueueWaiters.length > 0) {
      if (this._maxSize !== undefined && this._items.length >= this._maxSize) {
        break;
      }
      const resolve = this._enqueueWaiters.shift()!;
      resolve();
    }
  }
}
