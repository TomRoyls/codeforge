export interface Interval<T> {
  lo: number;
  hi: number;
  value: T;
}

export interface Node<T> {
  interval: Interval<T>;
  left: Node<T> | null;
  right: Node<T> | null;
  max: number;
  height: number;
}
