export interface ElasticBucketOptions {
  chunkSize?: number
}

export interface ElasticBucketStatistics {
  pushes: number
  pops: number
  insertAts: number
  removeAts: number
  resizes: number
  chunks: number
  compactions: number
}

export const DEFAULT_ELASTIC_BUCKET_OPTIONS: Required<ElasticBucketOptions> = {
  chunkSize: 64,
}
