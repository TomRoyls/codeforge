export interface ThreadedNode<K, V> {
  key: K
  value: V | undefined
  left: ThreadedNode<K, V> | null
  right: ThreadedNode<K, V> | null
  leftThread: boolean
  rightThread: boolean
}

export interface ThreadedBinaryTreeOptions<K> {
  comparator?: (a: K, b: K) => number
}

export interface ThreadedBinaryTreeStatistics {
  inserts: number
  deletes: number
  lookups: number
  rotations: number
  threadsUsed: number
}

export const DEFAULT_THREADED_BINARY_TREE_OPTIONS: ThreadedBinaryTreeOptions<unknown> = {}
