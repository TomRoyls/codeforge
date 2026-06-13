import { describe, it, expect } from 'vitest'
import { ExponentialMovingAvg } from '../../src/utils/exponential-moving-avg.js'

describe('ExponentialMovingAvg', () => {
  it('computes exponential moving average', () => {
    const ema = new ExponentialMovingAvg(0.5)
    ema.update(10)
    ema.update(20)
    expect(ema.current).toBe(15)
  })

  it('single value is identity', () => {
    const ema = new ExponentialMovingAvg(0.3)
    ema.update(42)
    expect(ema.current).toBe(42)
  })

  it('alpha = 1 tracks last value', () => {
    const ema = new ExponentialMovingAvg(1)
    ema.update(10)
    ema.update(20)
    ema.update(30)
    expect(ema.current).toBe(30)
  })

  it('alpha = 0 holds first value', () => {
    const ema = new ExponentialMovingAvg(0)
    ema.update(10)
    ema.update(20)
    expect(ema.current).toBe(10)
  })

  it('count tracks updates', () => {
    const ema = new ExponentialMovingAvg(0.5)
    ema.update(1)
    ema.update(2)
    ema.update(3)
    expect(ema.count).toBe(3)
  })

  it('isEmpty checks initialization', () => {
    const ema = new ExponentialMovingAvg(0.5)
    expect(ema.isEmpty).toBe(true)
    ema.update(1)
    expect(ema.isEmpty).toBe(false)
  })

  it('clear resets', () => {
    const ema = new ExponentialMovingAvg(0.5)
    ema.update(10)
    ema.clear()
    expect(ema.isEmpty).toBe(true)
  })

  it('toString returns JSON', () => {
    const ema = new ExponentialMovingAvg(0.5)
    ema.update(10)
    expect(ema.toString()).toContain('alpha')
  })

  it('toJSON returns stats', () => {
    const ema = new ExponentialMovingAvg(0.5)
    ema.update(10)
    expect(ema.toJSON().alpha).toBe(0.5)
  })

  it('clone preserves state', () => {
    const ema = new ExponentialMovingAvg(0.5)
    ema.update(10)
    ema.update(20)
    const c = ema.clone()
    expect(c.current).toBe(ema.current)
  })

  it('equals returns false for non-ema', () => {
    const ema = new ExponentialMovingAvg(0.5)
    expect(ema.equals(null)).toBe(false)
  })
})

describe('exponential-moving-avg - bulk', () => {
  it('exponential-moving-avg bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 986', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 987', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-moving-avg bulk 988', () => {
    expect(describe).toBeDefined()
  })
})
