export interface SegmentQueueOptions {
  segmentSize?: number
}

export interface SegmentQueueStatistics {
  enqueued: number
  dequeued: number
  segmentsCreated: number
  segmentsCompleted: number
}

export const DEFAULT_SEGMENT_QUEUE_OPTIONS: Required<SegmentQueueOptions> = {
  segmentSize: 64,
}
