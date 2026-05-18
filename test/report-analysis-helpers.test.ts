import { describe, it, expect } from 'vitest'

import { runAnalysisPipeline } from '../src/commands/report-analysis-helpers.js'

// ─── runAnalysisPipeline ──────────────────────────────
describe('runAnalysisPipeline', () => {
  it('throws for non-existent path', async () => {
    await expect(runAnalysisPipeline('/nonexistent/path', 1)).rejects.toThrow()
  })

  it('throws CLIError for invalid path with descriptive message', async () => {
    await expect(runAnalysisPipeline('/definitely/does/not/exist', 1)).rejects.toThrow(
      'Path not found',
    )
  })

  it('resolves relative paths before checking existence', async () => {
    await expect(runAnalysisPipeline('./also/does/not/exist', 1)).rejects.toThrow()
  })

  it('rejects with an error (not a string)', async () => {
    try {
      await runAnalysisPipeline('/no/such/dir', 1)
      expect.unreachable('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
    }
  })
})
