export interface BootstrappedHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface BootstrappedHeapNode<T> {
  value: T
  id: number
  tree: Tree<T> | null
}

interface Tree<T> {
  root: BootstrappedHeapNode<T>
  children: InnerHeap<T>
  rank: number
}

interface InnerHeap<T> {
  trees: Tree<T>[]
  size: number
}
