import type { ProfileSample, ProfileSession } from './types.js'

let sessionCounter = 0

export class CPUProfiler {
  private sessions: Map<string, ProfileSession> = new Map()
  private currentSessionId: string | null = null

  startSession(name: string): string {
    const id = `session_${++sessionCounter}_${Date.now()}`
    const session: ProfileSession = {
      id,
      name,
      startTime: Date.now(),
      endTime: 0,
      samples: [],
      totalDuration: 0,
      peakMemory: 0,
    }
    this.sessions.set(id, session)
    this.currentSessionId = id
    return id
  }

  endSession(sessionId: string): ProfileSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }
    session.endTime = Date.now()
    session.totalDuration = session.endTime - session.startTime
    if (session.samples.length > 0) {
      session.peakMemory = Math.max(...session.samples.map((s) => s.memoryUsage))
    }
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null
    }
    return session
  }

  sample(label: string, stackTrace: string[], duration?: number): void {
    if (!this.currentSessionId) {
      throw new Error('No active profiling session')
    }
    const session = this.sessions.get(this.currentSessionId)
    if (!session) {
      throw new Error('Current session not found')
    }
    const sample: ProfileSample = {
      timestamp: Date.now(),
      stackTrace,
      duration: duration ?? 0,
      memoryUsage: 0,
      label,
    }
    session.samples.push(sample)
  }

  getSession(id: string): ProfileSession | null {
    return this.sessions.get(id) ?? null
  }

  getAllSessions(): ProfileSession[] {
    return Array.from(this.sessions.values())
  }

  getCurrentSession(): ProfileSession | null {
    if (!this.currentSessionId) return null
    return this.sessions.get(this.currentSessionId) ?? null
  }

  isProfiling(): boolean {
    return this.currentSessionId !== null
  }
}
