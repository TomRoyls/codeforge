import type { ProfileSession, MemorySnapshot, ProfileReport, ProfileSummary, Hotspot } from './types.js'
import { roundTo } from '../../utils/math-helpers.js'
import { sortedByDesc } from '../../utils/array-helpers.js'

export class ProfilerReport {
  generateReport(session: ProfileSession, snapshots: MemorySnapshot[]): ProfileReport {
    const hotspots = this.findHotspots(session)
    const summary = this.calculateSummary(session)
    const recommendations = this.generateRecommendations(hotspots, summary)
    return {
      session,
      hotspots,
      memorySnapshots: snapshots,
      summary,
      recommendations,
    }
  }

  findHotspots(session: ProfileSession, threshold: number = 0): Hotspot[] {
    const functionMap = new Map<string, { selfTime: number; totalTime: number; callCount: number; file: string; line: number }>()

    for (const sample of session.samples) {
      if (sample.stackTrace.length === 0) continue
      const topFrame = sample.stackTrace[0]!
      const parsed = this.parseFrame(topFrame)
      const key = `${parsed.function}@${parsed.file}:${parsed.line}`

      const existing = functionMap.get(key)
      if (existing) {
        existing.selfTime += sample.duration
        existing.totalTime += sample.duration
        existing.callCount += 1
      } else {
        functionMap.set(key, {
          selfTime: sample.duration,
          totalTime: sample.duration,
          callCount: 1,
          file: parsed.file,
          line: parsed.line,
        })
      }

      for (let i = 1; i < sample.stackTrace.length; i++) {
        const parentFrame = sample.stackTrace[i]!
        const parentParsed = this.parseFrame(parentFrame)
        const parentKey = `${parentParsed.function}@${parentParsed.file}:${parentParsed.line}`
        const parentExisting = functionMap.get(parentKey)
        if (parentExisting) {
          parentExisting.totalTime += sample.duration
        } else {
          functionMap.set(parentKey, {
            selfTime: 0,
            totalTime: sample.duration,
            callCount: 0,
            file: parentParsed.file,
            line: parentParsed.line,
          })
        }
      }
    }

    const totalDuration = session.samples.reduce((sum, s) => sum + s.duration, 0)

    const hotspots: Hotspot[] = []
    for (const [key, data] of functionMap) {
      const atIdx = key.indexOf('@')
      const fnName = key.substring(0, atIdx)
      const percentage = totalDuration > 0 ? (data.selfTime / totalDuration) * 100 : 0
      if (percentage >= threshold) {
        hotspots.push({
          function: fnName,
          file: data.file,
          line: data.line,
          selfTime: data.selfTime,
          totalTime: data.totalTime,
          callCount: data.callCount,
          percentage: roundTo(percentage, 2),
        })
      }
    }

    hotspots.sort((a, b) => b.selfTime - a.selfTime)
    return hotspots
  }

  calculateSummary(session: ProfileSession): ProfileSummary {
    const samples = session.samples
    if (samples.length === 0) {
      return {
        totalTime: session.totalDuration,
        avgSampleDuration: 0,
        maxSampleDuration: 0,
        minSampleDuration: 0,
        totalSamples: 0,
        peakMemory: 0,
        avgMemory: 0,
      }
    }

    let totalDur = 0
    let minDur = samples[0]!.duration
    let maxDur = samples[0]!.duration
    let sumMem = 0
    let peakMem = samples[0]!.memoryUsage
    for (let i = 0; i < samples.length; i++) {
      const d = samples[i]!.duration
      const m = samples[i]!.memoryUsage
      totalDur += d
      sumMem += m
      if (d < minDur) minDur = d
      if (d > maxDur) maxDur = d
      if (m > peakMem) peakMem = m
    }

    return {
      totalTime: session.totalDuration,
      avgSampleDuration: totalDur / samples.length,
      maxSampleDuration: maxDur,
      minSampleDuration: minDur,
      totalSamples: samples.length,
      peakMemory: peakMem,
      avgMemory: sumMem / samples.length,
    }
  }

  generateRecommendations(hotspots: Hotspot[], summary: ProfileSummary): string[] {
    const recommendations: string[] = []

    if (hotspots.length > 0) {
      const topHotspot = hotspots[0]!
      if (topHotspot.percentage > 50) {
        recommendations.push(
          `Function "${topHotspot.function}" consumes ${topHotspot.percentage}% of execution time. Consider optimizing or caching.`,
        )
      }
      if (topHotspot.callCount > 100) {
        recommendations.push(
          `Function "${topHotspot.function}" is called ${topHotspot.callCount} times. Consider batching or memoization.`,
        )
      }
    }

    if (summary.peakMemory > 100 * 1024 * 1024) {
      recommendations.push('Peak memory usage exceeds 100MB. Consider streaming or chunked processing.')
    }

    if (summary.maxSampleDuration > 1000) {
      recommendations.push('Some samples take over 1 second. Investigate long-running operations.')
    }

    if (summary.totalSamples > 10000) {
      recommendations.push('High sample count detected. Consider reducing profiling granularity.')
    }

    if (recommendations.length === 0) {
      recommendations.push('No significant performance issues detected.')
    }

    return recommendations
  }

  formatReport(report: ProfileReport): string {
    const lines: string[] = []
    lines.push('=== Profile Report ===')
    lines.push('')
    lines.push(`Session: ${report.session.name} (${report.session.id})`)
    lines.push(`Duration: ${report.session.totalDuration}ms`)
    lines.push(`Samples: ${report.summary.totalSamples}`)
    lines.push('')

    if (report.hotspots.length > 0) {
      lines.push('--- Hotspots ---')
      for (const hs of report.hotspots) {
        lines.push(
          `  ${hs.function} (${hs.file}:${hs.line}) - ${hs.percentage}% self, ${hs.callCount} calls, ${hs.selfTime}ms`,
        )
      }
      lines.push('')
    }

    if (report.recommendations.length > 0) {
      lines.push('--- Recommendations ---')
      for (const rec of report.recommendations) {
        lines.push(`  - ${rec}`)
      }
      lines.push('')
    }

    lines.push('--- Summary ---')
    lines.push(`  Total Time: ${report.summary.totalTime}ms`)
    lines.push(`  Avg Sample Duration: ${report.summary.avgSampleDuration.toFixed(2)}ms`)
    lines.push(`  Max Sample Duration: ${report.summary.maxSampleDuration}ms`)
    lines.push(`  Min Sample Duration: ${report.summary.minSampleDuration}ms`)
    lines.push(`  Peak Memory: ${report.summary.peakMemory} bytes`)

    return lines.join('\n')
  }

  toJSON(report: ProfileReport): string {
    return JSON.stringify(report, null, 2)
  }

  getTopFunctions(hotspots: Hotspot[], count: number): Hotspot[] {
    const sorted = sortedByDesc(hotspots, h => h.selfTime)
    return sorted.slice(0, count)
  }

  private parseFrame(frame: string): { function: string; file: string; line: number } {
    const match = frame.match(/^(.+?)\s*\((.+?):(\d+)\)$/)
    if (match) {
      return {
        function: match[1]!,
        file: match[2]!,
        line: parseInt(match[3]!, 10),
      }
    }
    const colonIdx = frame.lastIndexOf(':')
    if (colonIdx > 0) {
      const lineStr = frame.substring(colonIdx + 1)
      const lineNum = parseInt(lineStr, 10)
      if (!isNaN(lineNum)) {
        const rest = frame.substring(0, colonIdx)
        const parenIdx = rest.lastIndexOf('(')
        if (parenIdx >= 0) {
          return {
            function: rest.substring(0, parenIdx).trim(),
            file: rest.substring(parenIdx + 1),
            line: lineNum,
          }
        }
        return { function: rest, file: '', line: lineNum }
      }
    }
    return { function: frame, file: '', line: 0 }
  }
}
