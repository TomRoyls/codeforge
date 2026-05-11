export interface Entry<V> {
  key: string;
  value: V;
}

export interface TSTNode<V> {
  char: string;
  lo: TSTNode<V> | undefined;
  eq: TSTNode<V> | undefined;
  hi: TSTNode<V> | undefined;
  value: V | undefined;
  isEnd: boolean;
}

export interface TSTOptions {
  comparator?: (a: string, b: string) => number;
}
