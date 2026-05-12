export type HashFunction<T> = (value: T) => string

export type Comparator<T> = (a: T, b: T) => number

export interface ConcurrentSetOptions<T> {
  hash?: HashFunction<T>
  compare?: Comparator<T>
}

export type LockState = 'unlocked' | 'locked'
