export type JitterType = 'full' | 'equal' | 'decorrelating'

export function calculateBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number = 30000,
  jitter: JitterType = 'decorrelating',
): number {
  if (attempt < 0) throw new RangeError(`attempt must be >= 0, got ${attempt}`)
  if (baseDelayMs < 1) throw new RangeError(`baseDelayMs must be >= 1, got ${baseDelayMs}`)
  if (maxDelayMs < baseDelayMs) throw new RangeError(`maxDelayMs must be >= baseDelayMs`)

  const exponentialDelay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)

  switch (jitter) {
    case 'full':
      return Math.random() * exponentialDelay
    case 'equal':
      return (exponentialDelay / 2) + (Math.random() * exponentialDelay / 2)
    case 'decorrelating': {
      const cap = baseDelayMs * Math.pow(2, attempt + 1)
      return Math.min(Math.random() * cap, maxDelayMs)
    }
  }
}

export function calculateUniformBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number = 30000): number {
  const delay = baseDelayMs * Math.pow(2, attempt)
  return Math.min(delay, maxDelayMs)
}
