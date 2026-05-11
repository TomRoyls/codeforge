export type HashFunction = (key: unknown) => number;

export interface HAMTOptions {
  hash?: HashFunction;
}

export interface Entry<K, V> {
  key: K;
  value: V;
}

export interface HAMTNode<K, V> {
  bitmap: number;
  children: Array<HAMTNode<K, V>>;
  isLeaf: boolean;
  entries: Array<[K, V]>;
}

export interface HAMTStats {
  size: number;
  depth: number;
  nodeCount: number;
  leafCount: number;
  collisionCount: number;
}

export interface HAMTOperations {
  inserts: number;
  deletes: number;
  lookups: number;
  depth: number;
  bitmapNodes: number;
  collisionNodes: number;
}

export const DEFAULT_HAMT_OPTIONS: HAMTOptions & { bitsPerLevel: number } = { bitsPerLevel: 5 };
