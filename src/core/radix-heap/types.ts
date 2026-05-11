export interface RadixHeapOptions<T> {
  keyExtractor?: (value: T) => number
  radix?: number
}

export interface RadixHeapEntry<T> {
  key: number
  value: T
}

export interface RadixHeapNode<T> {
  key: number
  value: T
  bucket: number
  prev: RadixHeapNode<T> | null
  next: RadixHeapNode<T> | null
}

export const DEFAULT_RADIX_HEAP_OPTIONS: Required<RadixHeapOptions<unknown>> & { maxKey: number } = {
  keyExtractor: (v) => v as number,
  radix: 2,
  maxKey: Number.MAX_SAFE_INTEGER,
};
