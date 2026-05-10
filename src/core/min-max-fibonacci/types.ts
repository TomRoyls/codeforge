export interface MinMaxFibonacciOptions {
  comparator?: (a: number, b: number) => number;
}

export interface MinMaxFibonacciStatistics {
  inserts: number;
  deleteMins: number;
  deleteMaxs: number;
  consolidateCount: number;
}

export interface FibNode<T> {
  value: T;
  degree: number;
  marked: boolean;
  parent: FibNode<T> | null;
  child: FibNode<T> | null;
  left: FibNode<T>;
  right: FibNode<T>;
}

export const DEFAULT_MIN_MAX_FIBONACCI_OPTIONS: MinMaxFibonacciOptions = {};
