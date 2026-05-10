import { describe, it, expect } from 'vitest'
import { ScoreBoard } from '../../src/core/score-board/score-board.js'

describe('ScoreBoard', () => {
  describe('construction', () => {
    it('creates empty board with no arguments', () => {
      const sb = new ScoreBoard()
      expect(sb.size).toBe(0)
      expect(sb.leaderboard()).toEqual([])
    })

    it('creates board with default descending order', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 50)
      expect(sb.getPlayerAtRank(1)?.player).toBe('b')
      expect(sb.getPlayerAtRank(3)?.player).toBe('c')
    })

    it('creates board with explicit descending order', () => {
      const sb = new ScoreBoard({ orderBy: 'desc' })
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      expect(sb.getPlayerAtRank(1)?.player).toBe('b')
      expect(sb.getPlayerAtRank(2)?.player).toBe('a')
    })

    it('creates board with ascending order', () => {
      const sb = new ScoreBoard({ orderBy: 'asc' })
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 50)
      expect(sb.getPlayerAtRank(1)?.player).toBe('c')
      expect(sb.getPlayerAtRank(3)?.player).toBe('b')
    })

    it('creates board with empty options', () => {
      const sb = new ScoreBoard({})
      sb.addPlayer('x', 10)
      expect(sb.size).toBe(1)
    })
  })

  describe('addPlayer', () => {
    it('adds a single player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 100)
      expect(sb.size).toBe(1)
      expect(sb.getScore('alice')).toBe(100)
    })

    it('adds multiple players in correct order', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 100)
      sb.addPlayer('c', 200)
      expect(sb.leaderboard().map(e => e.player)).toEqual(['a', 'c', 'b'])
    })

    it('ignores duplicate player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 100)
      sb.addPlayer('alice', 200)
      expect(sb.size).toBe(1)
      expect(sb.getScore('alice')).toBe(100)
    })

    it('handles negative scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', -10)
      sb.addPlayer('b', -50)
      sb.addPlayer('c', -5)
      expect(sb.getPlayerAtRank(1)?.player).toBe('c')
      expect(sb.getPlayerAtRank(3)?.player).toBe('b')
    })

    it('handles zero scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 0)
      sb.addPlayer('b', 10)
      sb.addPlayer('c', 0)
      expect(sb.size).toBe(3)
      expect(sb.getPlayerAtRank(1)?.player).toBe('b')
    })

    it('handles floating point scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 1.5)
      sb.addPlayer('b', 2.7)
      sb.addPlayer('c', 1.5)
      expect(sb.getPlayerAtRank(1)?.player).toBe('b')
      expect(sb.getPlayerAtRank(2)?.player).toBe('a')
      expect(sb.getPlayerAtRank(3)?.player).toBe('c')
    })

    it('maintains insertion order for tied scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('first', 100)
      sb.addPlayer('second', 100)
      sb.addPlayer('third', 100)
      expect(sb.getRank('first')).toBe(1)
      expect(sb.getRank('second')).toBe(2)
      expect(sb.getRank('third')).toBe(3)
    })

    it('inserts at correct position in middle', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('c', 300)
      sb.addPlayer('b', 200)
      expect(sb.leaderboard().map(e => e.player)).toEqual(['c', 'b', 'a'])
    })
  })

  describe('updateScore', () => {
    it('increases a player score', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 100)
      sb.updateScore('alice', 50)
      expect(sb.getScore('alice')).toBe(150)
    })

    it('decreases a player score', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 100)
      sb.updateScore('alice', -30)
      expect(sb.getScore('alice')).toBe(70)
    })

    it('returns false for non-existent player', () => {
      const sb = new ScoreBoard()
      expect(sb.updateScore('nobody', 10)).toBe(false)
    })

    it('returns true for existing player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 100)
      expect(sb.updateScore('alice', 50)).toBe(true)
    })

    it('reorders after update', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 300)
      sb.updateScore('a', 250)
      expect(sb.getRank('a')).toBe(1)
      expect(sb.leaderboard().map(e => e.player)).toEqual(['a', 'c', 'b'])
    })

    it('moves player to top after update', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 300)
      sb.updateScore('a', 400)
      expect(sb.getRank('a')).toBe(1)
    })

    it('moves player to bottom after update', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 300)
      sb.updateScore('c', -400)
      expect(sb.getRank('c')).toBe(3)
    })

    it('handles delta of zero', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.updateScore('a', 0)
      expect(sb.getScore('a')).toBe(100)
    })

    it('preserves insertion order when score does not change relative position', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 50)
      sb.updateScore('b', 10)
      expect(sb.getRank('b')).toBe(2)
      expect(sb.getRank('a')).toBe(1)
    })
  })

  describe('setScore', () => {
    it('sets a new score for existing player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 100)
      sb.setScore('alice', 500)
      expect(sb.getScore('alice')).toBe(500)
    })

    it('returns false for non-existent player', () => {
      const sb = new ScoreBoard()
      expect(sb.setScore('nobody', 100)).toBe(false)
    })

    it('returns true for existing player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 100)
      expect(sb.setScore('alice', 200)).toBe(true)
    })

    it('reorders correctly after set', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 300)
      sb.setScore('a', 250)
      expect(sb.leaderboard().map(e => e.player)).toEqual(['c', 'a', 'b'])
    })

    it('handles setting same score', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.setScore('a', 100)
      expect(sb.getScore('a')).toBe(100)
      expect(sb.getRank('a')).toBe(1)
    })

    it('handles negative scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.setScore('a', -50)
      expect(sb.getScore('a')).toBe(-50)
    })
  })

  describe('getScore', () => {
    it('returns score for existing player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('alice', 42)
      expect(sb.getScore('alice')).toBe(42)
    })

    it('returns undefined for non-existent player', () => {
      const sb = new ScoreBoard()
      expect(sb.getScore('nobody')).toBeUndefined()
    })

    it('returns updated score after updateScore', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.updateScore('a', -50)
      expect(sb.getScore('a')).toBe(50)
    })

    it('returns updated score after setScore', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.setScore('a', 999)
      expect(sb.getScore('a')).toBe(999)
    })
  })

  describe('getRank', () => {
    it('returns 1 for top player in descending', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.getRank('a')).toBe(1)
    })

    it('returns correct rank for middle player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.getRank('b')).toBe(2)
    })

    it('returns last rank for bottom player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.getRank('c')).toBe(3)
    })

    it('returns -1 for non-existent player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.getRank('nobody')).toBe(-1)
    })

    it('returns -1 on empty board', () => {
      const sb = new ScoreBoard()
      expect(sb.getRank('a')).toBe(-1)
    })

    it('ranks correctly in ascending order', () => {
      const sb = new ScoreBoard({ orderBy: 'asc' })
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.getRank('c')).toBe(1)
      expect(sb.getRank('b')).toBe(2)
      expect(sb.getRank('a')).toBe(3)
    })

    it('updates rank after score change', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.setScore('a', 300)
      expect(sb.getRank('a')).toBe(1)
      expect(sb.getRank('b')).toBe(2)
    })
  })

  describe('getPlayerAtRank', () => {
    it('returns top player at rank 1', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      expect(sb.getPlayerAtRank(1)).toEqual({ player: 'a', score: 300 })
    })

    it('returns player at specific rank', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.getPlayerAtRank(2)).toEqual({ player: 'b', score: 200 })
    })

    it('returns undefined for rank 0', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.getPlayerAtRank(0)).toBeUndefined()
    })

    it('returns undefined for rank beyond size', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.getPlayerAtRank(2)).toBeUndefined()
    })

    it('returns undefined for negative rank', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.getPlayerAtRank(-1)).toBeUndefined()
    })

    it('returns undefined on empty board', () => {
      const sb = new ScoreBoard()
      expect(sb.getPlayerAtRank(1)).toBeUndefined()
    })
  })

  describe('removePlayer', () => {
    it('removes existing player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      expect(sb.removePlayer('a')).toBe(true)
      expect(sb.size).toBe(1)
      expect(sb.has('a')).toBe(false)
    })

    it('returns false for non-existent player', () => {
      const sb = new ScoreBoard()
      expect(sb.removePlayer('nobody')).toBe(false)
    })

    it('updates ranks after removal', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      sb.removePlayer('a')
      expect(sb.getRank('b')).toBe(1)
      expect(sb.getRank('c')).toBe(2)
    })

    it('can remove all players', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.removePlayer('a')
      sb.removePlayer('b')
      expect(sb.size).toBe(0)
      expect(sb.leaderboard()).toEqual([])
    })

    it('can re-add removed player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.removePlayer('a')
      sb.addPlayer('a', 200)
      expect(sb.size).toBe(1)
      expect(sb.getScore('a')).toBe(200)
    })
  })

  describe('has', () => {
    it('returns true for existing player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.has('a')).toBe(true)
    })

    it('returns false for non-existent player', () => {
      const sb = new ScoreBoard()
      expect(sb.has('a')).toBe(false)
    })

    it('returns false after removal', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.removePlayer('a')
      expect(sb.has('a')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty board', () => {
      const sb = new ScoreBoard()
      expect(sb.size).toBe(0)
    })

    it('returns correct count after additions', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 300)
      expect(sb.size).toBe(3)
    })

    it('returns correct count after removal', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.removePlayer('a')
      expect(sb.size).toBe(1)
    })
  })

  describe('topK', () => {
    it('returns top K players', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      const top = sb.topK(2)
      expect(top).toEqual([
        { player: 'a', score: 300 },
        { player: 'b', score: 200 },
      ])
    })

    it('returns all players if K > size', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      expect(sb.topK(10)).toHaveLength(2)
    })

    it('returns empty array for K = 0', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.topK(0)).toEqual([])
    })

    it('returns empty array on empty board', () => {
      const sb = new ScoreBoard()
      expect(sb.topK(5)).toEqual([])
    })

    it('returns top 1', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      expect(sb.topK(1)).toEqual([{ player: 'a', score: 300 }])
    })

    it('returns all for topK equal to size', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.topK(3)).toHaveLength(3)
    })
  })

  describe('bottomK', () => {
    it('returns bottom K players', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      const bottom = sb.bottomK(2)
      expect(bottom).toEqual([
        { player: 'b', score: 200 },
        { player: 'c', score: 100 },
      ])
    })

    it('returns all players if K > size', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      expect(sb.bottomK(10)).toHaveLength(2)
    })

    it('returns empty array for K = 0', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.bottomK(0)).toEqual([])
    })

    it('returns empty array on empty board', () => {
      const sb = new ScoreBoard()
      expect(sb.bottomK(5)).toEqual([])
    })

    it('returns bottom 1', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      expect(sb.bottomK(1)).toEqual([{ player: 'b', score: 200 }])
    })
  })

  describe('getRankRange', () => {
    it('returns players in rank range', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      sb.addPlayer('d', 50)
      const range = sb.getRankRange(2, 3)
      expect(range).toEqual([
        { player: 'b', score: 200 },
        { player: 'c', score: 100 },
      ])
    })

    it('returns empty for invalid range (from > to)', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.getRankRange(3, 1)).toEqual([])
    })

    it('clamps from to 1', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      const range = sb.getRankRange(-5, 2)
      expect(range).toHaveLength(2)
    })

    it('clamps to to size', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      const range = sb.getRankRange(1, 100)
      expect(range).toHaveLength(2)
    })

    it('returns single player for from == to', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      const range = sb.getRankRange(1, 1)
      expect(range).toEqual([{ player: 'a', score: 300 }])
    })

    it('returns empty on empty board', () => {
      const sb = new ScoreBoard()
      expect(sb.getRankRange(1, 5)).toEqual([])
    })
  })

  describe('scoresAround', () => {
    it('returns players around given player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 500)
      sb.addPlayer('b', 400)
      sb.addPlayer('c', 300)
      sb.addPlayer('d', 200)
      sb.addPlayer('e', 100)
      const around = sb.scoresAround('c', 1)
      expect(around).toEqual([
        { player: 'b', score: 400 },
        { player: 'c', score: 300 },
        { player: 'd', score: 200 },
      ])
    })

    it('returns players around with count 2', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 500)
      sb.addPlayer('b', 400)
      sb.addPlayer('c', 300)
      sb.addPlayer('d', 200)
      sb.addPlayer('e', 100)
      const around = sb.scoresAround('c', 2)
      expect(around).toEqual([
        { player: 'a', score: 500 },
        { player: 'b', score: 400 },
        { player: 'c', score: 300 },
        { player: 'd', score: 200 },
        { player: 'e', score: 100 },
      ])
    })

    it('returns empty for non-existent player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.scoresAround('nobody', 2)).toEqual([])
    })

    it('handles top player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      const around = sb.scoresAround('a', 1)
      expect(around).toEqual([
        { player: 'a', score: 300 },
        { player: 'b', score: 200 },
      ])
    })

    it('handles bottom player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      const around = sb.scoresAround('c', 1)
      expect(around).toEqual([
        { player: 'b', score: 200 },
        { player: 'c', score: 100 },
      ])
    })

    it('handles count 0', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      const around = sb.scoresAround('b', 0)
      expect(around).toEqual([{ player: 'b', score: 200 }])
    })

    it('handles single player board', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      const around = sb.scoresAround('a', 5)
      expect(around).toEqual([{ player: 'a', score: 100 }])
    })
  })

  describe('tieCount', () => {
    it('returns 1 when no ties', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      expect(sb.tieCount('a')).toBe(1)
    })

    it('returns correct count for tied scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 100)
      sb.addPlayer('c', 100)
      expect(sb.tieCount('a')).toBe(3)
    })

    it('returns 0 for non-existent player', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      expect(sb.tieCount('nobody')).toBe(0)
    })

    it('counts only players with exact same score', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 100)
      sb.addPlayer('c', 200)
      expect(sb.tieCount('a')).toBe(2)
      expect(sb.tieCount('c')).toBe(1)
    })

    it('updates after score change', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.setScore('b', 100)
      expect(sb.tieCount('a')).toBe(2)
    })

    it('updates after removal', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 100)
      sb.addPlayer('c', 100)
      sb.removePlayer('b')
      expect(sb.tieCount('a')).toBe(2)
    })
  })

  describe('reset', () => {
    it('resets all scores to 0', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      sb.reset()
      expect(sb.getScore('a')).toBe(0)
      expect(sb.getScore('b')).toBe(0)
      expect(sb.getScore('c')).toBe(0)
    })

    it('preserves players after reset', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.reset()
      expect(sb.size).toBe(2)
      expect(sb.has('a')).toBe(true)
      expect(sb.has('b')).toBe(true)
    })

    it('maintains insertion order after reset (all tied at 0)', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      sb.reset()
      expect(sb.getRank('a')).toBe(1)
      expect(sb.getRank('b')).toBe(2)
      expect(sb.getRank('c')).toBe(3)
    })

    it('can update scores after reset', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 300)
      sb.reset()
      sb.updateScore('a', 100)
      expect(sb.getScore('a')).toBe(100)
    })

    it('reset on empty board does nothing', () => {
      const sb = new ScoreBoard()
      sb.reset()
      expect(sb.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('removes all players', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.clear()
      expect(sb.size).toBe(0)
      expect(sb.leaderboard()).toEqual([])
    })

    it('can add players after clear', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.clear()
      sb.addPlayer('b', 200)
      expect(sb.size).toBe(1)
      expect(sb.getScore('b')).toBe(200)
    })

    it('clear on empty board does nothing', () => {
      const sb = new ScoreBoard()
      sb.clear()
      expect(sb.size).toBe(0)
    })

    it('player removed by clear can be re-added', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.clear()
      sb.addPlayer('a', 500)
      expect(sb.getScore('a')).toBe(500)
    })
  })

  describe('leaderboard', () => {
    it('returns full sorted array', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 300)
      sb.addPlayer('c', 200)
      expect(sb.leaderboard()).toEqual([
        { player: 'b', score: 300 },
        { player: 'c', score: 200 },
        { player: 'a', score: 100 },
      ])
    })

    it('returns empty array for empty board', () => {
      const sb = new ScoreBoard()
      expect(sb.leaderboard()).toEqual([])
    })

    it('returns defensive copy', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      const lb = sb.leaderboard()
      lb[0]!.score = 999
      expect(sb.getScore('a')).toBe(100)
    })

    it('returns ascending order for asc board', () => {
      const sb = new ScoreBoard({ orderBy: 'asc' })
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 300)
      sb.addPlayer('c', 200)
      expect(sb.leaderboard()).toEqual([
        { player: 'a', score: 100 },
        { player: 'c', score: 200 },
        { player: 'b', score: 300 },
      ])
    })
  })

  describe('edge cases', () => {
    it('handles many insertions and removals', () => {
      const sb = new ScoreBoard()
      for (let i = 0; i < 100; i++) {
        sb.addPlayer(`p${i}`, i * 10)
      }
      expect(sb.size).toBe(100)
      expect(sb.getPlayerAtRank(1)?.player).toBe('p99')
      expect(sb.getPlayerAtRank(100)?.player).toBe('p0')
      for (let i = 0; i < 50; i++) {
        sb.removePlayer(`p${i}`)
      }
      expect(sb.size).toBe(50)
    })

    it('handles alternating add/remove', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.removePlayer('a')
      sb.addPlayer('c', 150)
      sb.removePlayer('b')
      sb.addPlayer('a', 300)
      expect(sb.size).toBe(2)
      expect(sb.getRank('a')).toBe(1)
      expect(sb.getRank('c')).toBe(2)
    })

    it('handles very large scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', Number.MAX_SAFE_INTEGER)
      sb.addPlayer('b', Number.MAX_SAFE_INTEGER - 1)
      expect(sb.getPlayerAtRank(1)?.player).toBe('a')
    })

    it('handles very small (negative) scores', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', -Number.MAX_SAFE_INTEGER)
      sb.addPlayer('b', -Number.MAX_SAFE_INTEGER + 1)
      expect(sb.getPlayerAtRank(1)?.player).toBe('b')
      expect(sb.getPlayerAtRank(2)?.player).toBe('a')
    })

    it('handles single player operations', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('only', 42)
      expect(sb.topK(1)).toEqual([{ player: 'only', score: 42 }])
      expect(sb.bottomK(1)).toEqual([{ player: 'only', score: 42 }])
      expect(sb.getRankRange(1, 1)).toEqual([{ player: 'only', score: 42 }])
      expect(sb.scoresAround('only', 5)).toEqual([{ player: 'only', score: 42 }])
      expect(sb.tieCount('only')).toBe(1)
    })

    it('handles player names with special characters', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('player-1', 100)
      sb.addPlayer('player_2', 200)
      sb.addPlayer('player.3', 150)
      expect(sb.size).toBe(3)
      expect(sb.getRank('player_2')).toBe(1)
    })

    it('handles updateScore moving through multiple positions', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 10)
      sb.addPlayer('b', 20)
      sb.addPlayer('c', 30)
      sb.addPlayer('d', 40)
      sb.addPlayer('e', 50)
      sb.updateScore('a', 100)
      expect(sb.getRank('a')).toBe(1)
      expect(sb.getScore('a')).toBe(110)
      sb.updateScore('a', -200)
      expect(sb.getRank('a')).toBe(5)
      expect(sb.getScore('a')).toBe(-90)
    })

    it('getRankRange with out-of-bounds clamping', () => {
      const sb = new ScoreBoard()
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      const range = sb.getRankRange(-10, 100)
      expect(range).toHaveLength(2)
    })
  })

  describe('ascending mode', () => {
    it('topK returns lowest scores', () => {
      const sb = new ScoreBoard({ orderBy: 'asc' })
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.topK(2)).toEqual([
        { player: 'c', score: 100 },
        { player: 'b', score: 200 },
      ])
    })

    it('bottomK returns highest scores', () => {
      const sb = new ScoreBoard({ orderBy: 'asc' })
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 200)
      sb.addPlayer('c', 100)
      expect(sb.bottomK(2)).toEqual([
        { player: 'b', score: 200 },
        { player: 'a', score: 300 },
      ])
    })

    it('updateScore works in ascending mode', () => {
      const sb = new ScoreBoard({ orderBy: 'asc' })
      sb.addPlayer('a', 100)
      sb.addPlayer('b', 200)
      sb.updateScore('b', -150)
      expect(sb.getRank('b')).toBe(1)
      expect(sb.getScore('b')).toBe(50)
    })

    it('reset works in ascending mode', () => {
      const sb = new ScoreBoard({ orderBy: 'asc' })
      sb.addPlayer('a', 300)
      sb.addPlayer('b', 100)
      sb.reset()
      expect(sb.getScore('a')).toBe(0)
      expect(sb.getScore('b')).toBe(0)
      expect(sb.getRank('a')).toBe(1)
      expect(sb.getRank('b')).toBe(2)
    })
  })

  describe('stress', () => {
    it('handles large number of players', () => {
      const sb = new ScoreBoard()
      const n = 1000
      for (let i = 0; i < n; i++) {
        sb.addPlayer(`player_${i}`, Math.floor(Math.random() * 10000))
      }
      expect(sb.size).toBe(n)
      const lb = sb.leaderboard()
      for (let i = 1; i < lb.length; i++) {
        expect(lb[i - 1]!.score).toBeGreaterThanOrEqual(lb[i]!.score)
      }
    })

    it('handles many score updates', () => {
      const sb = new ScoreBoard()
      const n = 100
      for (let i = 0; i < n; i++) {
        sb.addPlayer(`p${i}`, 0)
      }
      for (let round = 0; round < 10; round++) {
        for (let i = 0; i < n; i++) {
          sb.updateScore(`p${i}`, Math.floor(Math.random() * 100))
        }
      }
      const lb = sb.leaderboard()
      for (let i = 1; i < lb.length; i++) {
        expect(lb[i - 1]!.score).toBeGreaterThanOrEqual(lb[i]!.score)
      }
    })

    it('handles interleaved add/remove/update', () => {
      const sb = new ScoreBoard()
      for (let i = 0; i < 200; i++) {
        if (i % 3 === 0) {
          sb.addPlayer(`p${i}`, i)
        } else if (i % 3 === 1 && sb.has(`p${i - 1}`)) {
          sb.updateScore(`p${i - 1}`, 10)
        } else if (i % 3 === 2 && sb.has(`p${i - 2}`)) {
          sb.removePlayer(`p${i - 2}`)
        }
      }
      const lb = sb.leaderboard()
      for (let i = 1; i < lb.length; i++) {
        expect(lb[i - 1]!.score).toBeGreaterThanOrEqual(lb[i]!.score)
      }
    })

    it('correctness: rank consistency after operations', () => {
      const sb = new ScoreBoard()
      for (let i = 0; i < 50; i++) {
        sb.addPlayer(`p${i}`, i * 10)
      }
      for (let i = 0; i < 50; i++) {
        sb.updateScore(`p${i}`, 500 - i * 10)
      }
      for (let rank = 1; rank <= sb.size; rank++) {
        const entry = sb.getPlayerAtRank(rank)!
        expect(sb.getRank(entry.player)).toBe(rank)
      }
    })
  })
})
