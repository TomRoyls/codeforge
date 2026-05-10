export interface PocketQueueOptions<T> {
  capacity: number
  autoFlush?: boolean
  onFlush?: (items: T[]) => void
}
