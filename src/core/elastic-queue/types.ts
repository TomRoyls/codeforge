export interface ElasticQueueOptions {
  initialCapacity: number
  growthFactor: number
}

export const DEFAULT_ELASTIC_QUEUE_OPTIONS: ElasticQueueOptions = {
  initialCapacity: 16,
  growthFactor: 2,
}
