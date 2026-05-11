export interface RingBufferOptions {
  capacity: number
}

export type RingBufferIteratorResult<T> = {
  done: boolean
  value: T | undefined
}
