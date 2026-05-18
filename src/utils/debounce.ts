export interface DebouncedFn<T extends (...args: unknown[]) => void> {
  (...args: Parameters<T>): void
  cancel(): void
  flush(): void
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = null
      const current = lastArgs
      lastArgs = null
      if (current !== null) {
        fn(...current)
      }
    }, delayMs)
  }

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
      lastArgs = null
    }
  }

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
      const current = lastArgs
      lastArgs = null
      if (current !== null) {
        fn(...current)
      }
    }
  }

  return debounced
}

export interface ThrottledFn<T extends (...args: unknown[]) => void> {
  (...args: Parameters<T>): void
  cancel(): void
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  intervalMs: number,
): ThrottledFn<T> {
  let lastCall = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now()
    const elapsed = now - lastCall

    if (elapsed >= intervalMs) {
      lastCall = now
      fn(...args)
    } else if (timer === null) {
      timer = setTimeout(() => {
        timer = null
        lastCall = Date.now()
        fn(...args)
      }, intervalMs - elapsed)
    }
  }

  throttled.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  return throttled
}
