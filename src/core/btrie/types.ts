export interface Entry<V> {
  key: string;
  value: V;
}

export interface BTrieNode<V> {
  children: Map<number, BTrieNode<V>>;
  bucket: Map<string, V> | null;
}

export const BUCKET_THRESHOLD = 32;
