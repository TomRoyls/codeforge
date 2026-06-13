export class PromiseUtils2 {
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
    ])
  }

  static retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs = 0): Promise<T> {
    return fn().catch(async (err) => {
      if (maxAttempts <= 1) throw err
      if (delayMs > 0) await PromiseUtils2.delay(delayMs)
      return PromiseUtils2.retry(fn, maxAttempts - 1, delayMs)
    })
  }

  static async allSettled<T>(promises: Promise<T>[]): Promise<{ success: boolean; value?: T; error?: unknown }[]> {
    const results: { success: boolean; value?: T; error?: unknown }[] = []
    for (const p of promises) {
      try { results.push({ success: true, value: await p }) }
      catch (e) { results.push({ success: false, error: e }) }
    }
    return results
  }

  static async map<T, R>(items: T[], fn: (item: T, index: number) => Promise<R>, concurrency = Infinity): Promise<R[]> {
    const results: R[] = new Array(items.length)
    let next = 0
    async function worker() {
      while (next < items.length) {
        const idx = next++
        results[idx] = await fn(items[idx], idx)
      }
    }
    const workers: Promise<void>[] = []
    for (let i = 0; i < Math.min(concurrency, items.length); i++) workers.push(worker())
    await Promise.all(workers)
    return results
  }

  static debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
    let timer: ReturnType<typeof setTimeout> | null = null
    return ((...args: unknown[]) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => fn(...args), ms)
    }) as T
  }

  static throttle<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
    let last = 0
    return ((...args: unknown[]) => {
      const now = Date.now()
      if (now - last >= ms) { last = now; return fn(...args) }
    }) as T
  }

  static fromCallback<T>(fn: (cb: (err: unknown, value?: T) => void) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      fn((err, value) => err ? reject(err) : resolve(value as T))
    })
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): PromiseUtils2 { return new PromiseUtils2() }
  equals(other: unknown): boolean { return other instanceof PromiseUtils2 }
}
