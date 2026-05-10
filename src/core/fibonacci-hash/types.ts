export interface FibonacciHashOptions {
  capacity?: number;
  loadFactor?: number;
  probingStrategy?: "linear" | "quadratic" | "double";
}

export interface FibonacciHashStatistics {
  collisions: number;
  resizes: number;
  tombstones: number;
  maxProbeLength: number;
  totalProbes: number;
}

export interface HashEntry<K, V> {
  key: K;
  value: V;
  isDeleted: boolean;
}

export const DEFAULT_FIBONACCI_HASH_OPTIONS: Required<FibonacciHashOptions> = {
  capacity: 16,
  loadFactor: 0.75,
  probingStrategy: "linear",
};
