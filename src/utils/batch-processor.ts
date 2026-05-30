import { ok, err, type Result } from './result.js'

export interface BatchProcessorOptions {
  concurrency?: number
  continueOnError?: boolean
  onProgress?: (completed: number, total: number) => void
}

export interface BatchResult<T> {
  successful: T[]
  failed: Array<{ input: number; error: unknown }>
  total: number
  durationMs: number
}

export async function processBatch<T, R>(
  items: readonly T[],
  handler: (item: T, index: number) => Promise<R>,
  options: BatchProcessorOptions = {},
): Promise<Result<BatchResult<R>, unknown>> {
  const concurrency = options.concurrency ?? 4
  const continueOnError = options.continueOnError ?? true
  const { onProgress } = options

  const successful: R[] = []
  const failed: Array<{ input: number; error: unknown }> = []
  let completed = 0

  const start = performance.now()

  const queue = [...items.entries()]
  let queueIdx = 0
  let aborted = false
  const workers: Promise<void>[] = []

  for (let w = 0; w < Math.min(concurrency, items.length); w++) {
    workers.push(
      (async () => {
        while (!aborted && queueIdx < queue.length) {
          const entry = queue[queueIdx]!
          queueIdx++

          const [index, item] = entry
          try {
            const result = await handler(item, index)
            successful.push(result)
          } catch (error: unknown) {
            failed.push({ input: index, error })
            if (!continueOnError) {
              aborted = true
              return
            }
          } finally {
            completed++
            if (onProgress) {
              onProgress(completed, items.length)
            }
          }
        }
      })(),
    )
  }

  await Promise.all(workers)

  const durationMs = performance.now() - start

  if (failed.length > 0 && !continueOnError) {
    return err(failed[0]?.error)
  }

  return ok({ successful, failed, total: items.length, durationMs })
}

export async function processBatchSequential<T, R>(
  items: readonly T[],
  handler: (item: T, index: number) => Promise<R>,
  continueOnError: boolean = true,
): Promise<BatchResult<R>> {
  const successful: R[] = []
  const failed: Array<{ input: number; error: unknown }> = []

  const start = performance.now()

  for (let i = 0; i < items.length; i++) {
    try {
      successful.push(await handler(items[i]!, i))
    } catch (error: unknown) {
      failed.push({ input: i, error })
      if (!continueOnError) break
    }
  }

  return {
    successful,
    failed,
    total: items.length,
    durationMs: performance.now() - start,
  }
}
