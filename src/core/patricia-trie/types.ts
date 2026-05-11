export interface Entry<V> {
  key: string;
  value: V;
}

export interface PatriciaTrieNode<V> {
  edge: string;
  children: Map<string, PatriciaTrieNode<V>>;
  value: V | undefined;
  isTerminal: boolean;
}

export interface PatriciaTrieOptions {
  alphabet?: string;
}
