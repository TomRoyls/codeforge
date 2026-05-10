export type LockFreeStackOptions = {
  maxRetries?: number;
};

export type LockFreeStackStatistics = {
  pushes: number;
  pops: number;
  contentionRetries: number;
  totalOperations: number;
};

export type StackNode<T> = {
  value: T;
  next: StackNode<T> | null;
};

export const DEFAULT_LOCK_FREE_STACK_OPTIONS: Required<LockFreeStackOptions> = {
  maxRetries: 100,
};
