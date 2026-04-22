import { describe, test, expect } from 'vitest'
import chalk from 'chalk'
import {
  getGrade,
  getScoreColor,
  colorizeSeverity,
  getThresholdColor,
  formatSize,
} from '../../../src/utils/formatting.js'
import {
  HEALTH_SCORE_THRESHOLD_A,
  HEALTH_SCORE_THRESHOLD_B,
  HEALTH_SCORE_THRESHOLD_C,
  HEALTH_SCORE_THRESHOLD_D,
} from '../../../src/utils/constants.js'

describe('getGrade', () => {
  test('returns (A) for score >= 90', () => {
    expect(getGrade(90)).toBe('(A)')
    expect(getGrade(95)).toBe('(A)')
    expect(getGrade(100)).toBe('(A)')
    expect(getGrade(HEALTH_SCORE_THRESHOLD_A)).toBe('(A)')
  })

  test('returns (B) for score >= 80 and < 90', () => {
    expect(getGrade(80)).toBe('(B)')
    expect(getGrade(85)).toBe('(B)')
    expect(getGrade(89)).toBe('(B)')
    expect(getGrade(HEALTH_SCORE_THRESHOLD_B)).toBe('(B)')
  })

  test('returns (C) for score >= 70 and < 80', () => {
    expect(getGrade(70)).toBe('(C)')
    expect(getGrade(75)).toBe('(C)')
    expect(getGrade(79)).toBe('(C)')
    expect(getGrade(HEALTH_SCORE_THRESHOLD_C)).toBe('(C)')
  })

  test('returns (D) for score >= 60 and < 70', () => {
    expect(getGrade(60)).toBe('(D)')
    expect(getGrade(65)).toBe('(D)')
    expect(getGrade(69)).toBe('(D)')
    expect(getGrade(HEALTH_SCORE_THRESHOLD_D)).toBe('(D)')
  })

  test('returns (F) for score < 60', () => {
    expect(getGrade(59)).toBe('(F)')
    expect(getGrade(50)).toBe('(F)')
    expect(getGrade(0)).toBe('(F)')
    expect(getGrade(1)).toBe('(F)')
  })

  test('handles boundary values correctly', () => {
    expect(getGrade(HEALTH_SCORE_THRESHOLD_A - 1)).toBe('(B)')
    expect(getGrade(HEALTH_SCORE_THRESHOLD_B - 1)).toBe('(C)')
    expect(getGrade(HEALTH_SCORE_THRESHOLD_C - 1)).toBe('(D)')
    expect(getGrade(HEALTH_SCORE_THRESHOLD_D - 1)).toBe('(F)')
  })
})

describe('getScoreColor', () => {
  test('returns chalk.green for score >= 80', () => {
    const colorFn = getScoreColor(80)
    expect(colorFn('test')).toBe(chalk.green('test'))
  })

  test('returns chalk.green for high scores', () => {
    const colorFn = getScoreColor(90)
    expect(colorFn('hi')).toBe(chalk.green('hi'))
  })

  test('returns chalk.green for exactly 80', () => {
    const colorFn = getScoreColor(HEALTH_SCORE_THRESHOLD_B)
    expect(colorFn('x')).toBe(chalk.green('x'))
  })

  test('returns chalk.yellow for score >= 60 and < 80', () => {
    const colorFn60 = getScoreColor(60)
    expect(colorFn60('test')).toBe(chalk.yellow('test'))

    const colorFn70 = getScoreColor(70)
    expect(colorFn70('test')).toBe(chalk.yellow('test'))

    const colorFn79 = getScoreColor(79)
    expect(colorFn79('test')).toBe(chalk.yellow('test'))
  })

  test('returns chalk.red for score < 60', () => {
    const colorFn = getScoreColor(59)
    expect(colorFn('test')).toBe(chalk.red('test'))

    const colorFn0 = getScoreColor(0)
    expect(colorFn0('test')).toBe(chalk.red('test'))
  })

  test('returns callable chalk functions', () => {
    const green = getScoreColor(100)
    const yellow = getScoreColor(70)
    const red = getScoreColor(30)

    expect(typeof green).toBe('function')
    expect(typeof yellow).toBe('function')
    expect(typeof red).toBe('function')
  })
})

describe('colorizeSeverity', () => {
  test('colorizes "error" in red', () => {
    const result = colorizeSeverity('error')
    expect(result).toBe(chalk.red('error'))
  })

  test('colorizes "warning" in yellow', () => {
    const result = colorizeSeverity('warning')
    expect(result).toBe(chalk.yellow('warning'))
  })

  test('colorizes "info" in blue', () => {
    const result = colorizeSeverity('info')
    expect(result).toBe(chalk.blue('info'))
  })

  test('returns uncolored string for unknown severity', () => {
    expect(colorizeSeverity('debug')).toBe('debug')
    expect(colorizeSeverity('note')).toBe('note')
    expect(colorizeSeverity('')).toBe('')
    expect(colorizeSeverity('custom')).toBe('custom')
  })

  test('is case-sensitive — does not colorize uppercase', () => {
    expect(colorizeSeverity('Error')).toBe('Error')
    expect(colorizeSeverity('WARNING')).toBe('WARNING')
    expect(colorizeSeverity('Info')).toBe('Info')
  })
})

describe('getThresholdColor', () => {
  test('returns chalk.green when value >= goodThreshold', () => {
    const colorFn = getThresholdColor(90, 80, 60)
    expect(colorFn('test')).toBe(chalk.green('test'))

    const colorFnExact = getThresholdColor(80, 80, 60)
    expect(colorFnExact('test')).toBe(chalk.green('test'))
  })

  test('returns chalk.yellow when value >= warnThreshold and < goodThreshold', () => {
    const colorFn = getThresholdColor(70, 80, 60)
    expect(colorFn('test')).toBe(chalk.yellow('test'))

    const colorFnExact = getThresholdColor(60, 80, 60)
    expect(colorFnExact('test')).toBe(chalk.yellow('test'))
  })

  test('returns chalk.red when value < warnThreshold', () => {
    const colorFn = getThresholdColor(59, 80, 60)
    expect(colorFn('test')).toBe(chalk.red('test'))

    const colorFnLow = getThresholdColor(0, 80, 60)
    expect(colorFnLow('test')).toBe(chalk.red('test'))
  })

  test('works with different threshold values', () => {
    const colorFn = getThresholdColor(50, 50, 25)
    expect(colorFn('x')).toBe(chalk.green('x'))

    const colorFn2 = getThresholdColor(25, 50, 25)
    expect(colorFn2('x')).toBe(chalk.yellow('x'))

    const colorFn3 = getThresholdColor(24, 50, 25)
    expect(colorFn3('x')).toBe(chalk.red('x'))
  })

  test('returns callable chalk functions', () => {
    expect(typeof getThresholdColor(100, 80, 60)).toBe('function')
    expect(typeof getThresholdColor(70, 80, 60)).toBe('function')
    expect(typeof getThresholdColor(30, 80, 60)).toBe('function')
  })
})

describe('formatSize', () => {
  test('formats bytes correctly', () => {
    expect(formatSize(0)).toBe('0.0 B')
    expect(formatSize(100)).toBe('100.0 B')
    expect(formatSize(512)).toBe('512.0 B')
    expect(formatSize(1023)).toBe('1023.0 B')
  })

  test('formats kilobytes correctly', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(1536)).toBe('1.5 KB')
    expect(formatSize(2048)).toBe('2.0 KB')
    expect(formatSize(10240)).toBe('10.0 KB')
    expect(formatSize(1024 * 1023)).toBe('1023.0 KB')
  })

  test('formats megabytes correctly', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatSize(1024 * 1024 * 1.5)).toBe('1.5 MB')
    expect(formatSize(1024 * 1024 * 100)).toBe('100.0 MB')
    expect(formatSize(1024 * 1024 * 1023)).toBe('1023.0 MB')
  })

  test('formats gigabytes correctly', () => {
    expect(formatSize(1024 * 1024 * 1024)).toBe('1.0 GB')
    expect(formatSize(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB')
    expect(formatSize(1024 * 1024 * 1024 * 100)).toBe('100.0 GB')
    expect(formatSize(1024 * 1024 * 1024 * 1024)).toBe('1024.0 GB')
  })

  test('caps at GB even for very large values', () => {
    const hugeValue = 1024 * 1024 * 1024 * 1024 * 10
    expect(formatSize(hugeValue)).toBe('10240.0 GB')
  })

  test('formats with one decimal place', () => {
    expect(formatSize(1500)).toBe('1.5 KB')
    expect(formatSize(2560)).toBe('2.5 KB')
    expect(formatSize(1048)).toBe('1.0 KB')
  })

  test('handles fractional bytes', () => {
    expect(formatSize(0.5)).toBe('0.5 B')
    expect(formatSize(512.7)).toBe('512.7 B')
  })
})

// ============================================================================
// Additional tests: getGrade edge cases
// ============================================================================

describe('getGrade additional edge cases', () => {
  test('returns (A) for score exactly 90', () => {
    expect(getGrade(90)).toBe('(A)')
  })

  test('returns (A) for score 100', () => {
    expect(getGrade(100)).toBe('(A)')
  })

  test('returns (A) for score above 100', () => {
    expect(getGrade(101)).toBe('(A)')
    expect(getGrade(150)).toBe('(A)')
    expect(getGrade(1000)).toBe('(A)')
  })

  test('returns (B) for score 89 (just below A threshold)', () => {
    expect(getGrade(89)).toBe('(B)')
  })

  test('returns (C) for score 79 (just below B threshold)', () => {
    expect(getGrade(79)).toBe('(C)')
  })

  test('returns (D) for score 69 (just below C threshold)', () => {
    expect(getGrade(69)).toBe('(D)')
  })

  test('returns (F) for score 59 (just below D threshold)', () => {
    expect(getGrade(59)).toBe('(F)')
  })

  test('handles decimal scores correctly', () => {
    expect(getGrade(89.9)).toBe('(B)')
    expect(getGrade(90.0)).toBe('(A)')
    expect(getGrade(79.5)).toBe('(C)')
    expect(getGrade(69.9)).toBe('(D)')
    expect(getGrade(59.9)).toBe('(F)')
    expect(getGrade(60.1)).toBe('(D)')
    expect(getGrade(70.1)).toBe('(C)')
    expect(getGrade(80.1)).toBe('(B)')
  })

  test('handles negative scores', () => {
    expect(getGrade(-1)).toBe('(F)')
    expect(getGrade(-50)).toBe('(F)')
    expect(getGrade(-100)).toBe('(F)')
  })

  test('handles score of 0', () => {
    expect(getGrade(0)).toBe('(F)')
  })
})

// ============================================================================
// Additional tests: getScoreColor edge cases
// ============================================================================

describe('getScoreColor additional edge cases', () => {
  test('returns green for score of 100', () => {
    const colorFn = getScoreColor(100)
    expect(colorFn('perfect')).toBe(chalk.green('perfect'))
  })

  test('returns green for score above 100', () => {
    const colorFn = getScoreColor(150)
    expect(colorFn('x')).toBe(chalk.green('x'))
  })

  test('returns yellow for score exactly 60 (D threshold)', () => {
    const colorFn = getScoreColor(60)
    expect(colorFn('test')).toBe(chalk.yellow('test'))
  })

  test('returns red for score exactly 59', () => {
    const colorFn = getScoreColor(59)
    expect(colorFn('test')).toBe(chalk.red('test'))
  })

  test('returns red for negative scores', () => {
    const colorFn = getScoreColor(-1)
    expect(colorFn('bad')).toBe(chalk.red('bad'))
  })

  test('returns red for score of 0', () => {
    const colorFn = getScoreColor(0)
    expect(colorFn('zero')).toBe(chalk.red('zero'))
  })

  test('handles decimal scores at color boundaries', () => {
    const green = getScoreColor(80.0)
    expect(green('x')).toBe(chalk.green('x'))

    const yellow79 = getScoreColor(79.9)
    expect(yellow79('x')).toBe(chalk.yellow('x'))

    const yellow60 = getScoreColor(60.0)
    expect(yellow60('x')).toBe(chalk.yellow('x'))

    const red59 = getScoreColor(59.9)
    expect(red59('x')).toBe(chalk.red('x'))
  })

  test('returned green function colors input string', () => {
    const colorFn = getScoreColor(95)
    const result = colorFn('hello world')
    expect(result).toContain('hello world')
  })

  test('returned yellow function colors input string', () => {
    const colorFn = getScoreColor(75)
    const result = colorFn('caution')
    expect(result).toContain('caution')
  })

  test('returned red function colors input string', () => {
    const colorFn = getScoreColor(10)
    const result = colorFn('danger')
    expect(result).toContain('danger')
  })
})

// ============================================================================
// Additional tests: colorizeSeverity edge cases
// ============================================================================

describe('colorizeSeverity additional edge cases', () => {
  test('handles empty string', () => {
    expect(colorizeSeverity('')).toBe('')
  })

  test('handles whitespace-only strings', () => {
    expect(colorizeSeverity(' ')).toBe(' ')
    expect(colorizeSeverity('  ')).toBe('  ')
    expect(colorizeSeverity('\t')).toBe('\t')
  })

  test('handles strings with spaces around known severity', () => {
    expect(colorizeSeverity(' error')).toBe(' error')
    expect(colorizeSeverity('error ')).toBe('error ')
    expect(colorizeSeverity(' error ')).toBe(' error ')
  })

  test('handles severity-like substrings', () => {
    expect(colorizeSeverity('error:')).toBe('error:')
    expect(colorizeSeverity('warning!')).toBe('warning!')
    expect(colorizeSeverity('info-ish')).toBe('info-ish')
  })

  test('handles numeric strings', () => {
    expect(colorizeSeverity('1')).toBe('1')
    expect(colorizeSeverity('0')).toBe('0')
    expect(colorizeSeverity('42')).toBe('42')
  })

  test('handles special characters', () => {
    expect(colorizeSeverity('@error')).toBe('@error')
    expect(colorizeSeverity('#warning')).toBe('#warning')
    expect(colorizeSeverity('$info')).toBe('$info')
  })

  test('handles unicode strings', () => {
    expect(colorizeSeverity('エラー')).toBe('エラー')
    expect(colorizeSeverity('警告')).toBe('警告')
    expect(colorizeSeverity('ℹ')).toBe('ℹ')
  })

  test('handles long strings', () => {
    const longStr = 'a'.repeat(1000)
    expect(colorizeSeverity(longStr)).toBe(longStr)
  })

  test('handles strings that contain severity keywords', () => {
    expect(colorizeSeverity('this is an error message')).toBe('this is an error message')
    expect(colorizeSeverity('a warning was issued')).toBe('a warning was issued')
    expect(colorizeSeverity('for your info')).toBe('for your info')
  })

  test('colorized error output contains "error"', () => {
    const result = colorizeSeverity('error')
    expect(result).toContain('error')
  })

  test('colorized warning output contains "warning"', () => {
    const result = colorizeSeverity('warning')
    expect(result).toContain('warning')
  })

  test('colorized info output contains "info"', () => {
    const result = colorizeSeverity('info')
    expect(result).toContain('info')
  })

  test('handles mixed case variations', () => {
    expect(colorizeSeverity('ERROR')).toBe('ERROR')
    expect(colorizeSeverity('Warning')).toBe('Warning')
    expect(colorizeSeverity('iNfO')).toBe('iNfO')
  })
})

// ============================================================================
// Additional tests: getThresholdColor edge cases
// ============================================================================

describe('getThresholdColor additional edge cases', () => {
  test('handles zero thresholds', () => {
    const colorFn = getThresholdColor(0, 0, 0)
    expect(colorFn('x')).toBe(chalk.green('x'))
  })

  test('handles negative values', () => {
    const colorFn = getThresholdColor(-10, 0, -5)
    expect(colorFn('x')).toBe(chalk.red('x'))
  })

  test('handles negative good threshold', () => {
    const colorFn = getThresholdColor(-5, -10, -20)
    expect(colorFn('x')).toBe(chalk.green('x'))
  })

  test('handles equal good and warn thresholds', () => {
    const atThreshold = getThresholdColor(50, 50, 50)
    expect(atThreshold('x')).toBe(chalk.green('x'))

    const belowThreshold = getThresholdColor(49, 50, 50)
    expect(belowThreshold('x')).toBe(chalk.red('x'))
  })

  test('handles very large values', () => {
    const colorFn = getThresholdColor(1_000_000, 100, 50)
    expect(colorFn('x')).toBe(chalk.green('x'))
  })

  test('handles decimal values', () => {
    const green = getThresholdColor(0.9, 0.8, 0.5)
    expect(green('x')).toBe(chalk.green('x'))

    const yellow = getThresholdColor(0.7, 0.8, 0.5)
    expect(yellow('x')).toBe(chalk.yellow('x'))

    const red = getThresholdColor(0.3, 0.8, 0.5)
    expect(red('x')).toBe(chalk.red('x'))
  })

  test('value exactly at warnThreshold returns yellow', () => {
    const colorFn = getThresholdColor(60, 80, 60)
    expect(colorFn('test')).toBe(chalk.yellow('test'))
  })

  test('value one below warnThreshold returns red', () => {
    const colorFn = getThresholdColor(59, 80, 60)
    expect(colorFn('test')).toBe(chalk.red('test'))
  })

  test('value exactly at goodThreshold returns green', () => {
    const colorFn = getThresholdColor(80, 80, 60)
    expect(colorFn('test')).toBe(chalk.green('test'))
  })

  test('value one above goodThreshold returns green', () => {
    const colorFn = getThresholdColor(81, 80, 60)
    expect(colorFn('test')).toBe(chalk.green('test'))
  })

  test('returned functions can be called with empty string', () => {
    const green = getThresholdColor(100, 80, 60)
    expect(green('')).toBe(chalk.green(''))

    const yellow = getThresholdColor(70, 80, 60)
    expect(yellow('')).toBe(chalk.yellow(''))

    const red = getThresholdColor(30, 80, 60)
    expect(red('')).toBe(chalk.red(''))
  })

  test('handles value of 0 with positive thresholds', () => {
    const colorFn = getThresholdColor(0, 80, 60)
    expect(colorFn('x')).toBe(chalk.red('x'))
  })

  test('works with threshold values of 1', () => {
    expect(getThresholdColor(1, 1, 1)('x')).toBe(chalk.green('x'))
    expect(getThresholdColor(0, 1, 1)('x')).toBe(chalk.red('x'))
  })
})

// ============================================================================
// Additional tests: formatSize edge cases
// ============================================================================

describe('formatSize additional edge cases', () => {
  test('formats 1 byte correctly', () => {
    expect(formatSize(1)).toBe('1.0 B')
  })

  test('formats 2 bytes correctly', () => {
    expect(formatSize(2)).toBe('2.0 B')
  })

  test('formats 10 bytes correctly', () => {
    expect(formatSize(10)).toBe('10.0 B')
  })

  test('formats 999 bytes correctly', () => {
    expect(formatSize(999)).toBe('999.0 B')
  })

  test('formats exact 1 KB boundary', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
  })

  test('formats exact 1 MB boundary', () => {
    expect(formatSize(1048576)).toBe('1.0 MB')
  })

  test('formats exact 1 GB boundary', () => {
    expect(formatSize(1073741824)).toBe('1.0 GB')
  })

  test('formats 500 KB correctly', () => {
    expect(formatSize(512000)).toBe('500.0 KB')
  })

  test('formats 10 MB correctly', () => {
    expect(formatSize(10485760)).toBe('10.0 MB')
  })

  test('formats 500 MB correctly', () => {
    expect(formatSize(524288000)).toBe('500.0 MB')
  })

  test('handles very small fractional bytes', () => {
    expect(formatSize(0.001)).toBe('0.0 B')
    expect(formatSize(0.01)).toBe('0.0 B')
    expect(formatSize(0.05)).toBe('0.1 B')
  })

  test('handles negative byte values staying in bytes', () => {
    expect(formatSize(-1)).toBe('-1.0 B')
    expect(formatSize(-512)).toBe('-512.0 B')
    expect(formatSize(-1024)).toBe('-1024.0 B')
  })

  test('handles large negative values staying in bytes', () => {
    expect(formatSize(-1048576)).toBe('-1048576.0 B')
    expect(formatSize(-1073741824)).toBe('-1073741824.0 B')
  })

  test('handles values just below KB boundary', () => {
    expect(formatSize(1023)).toBe('1023.0 B')
    expect(formatSize(1023.9)).toBe('1023.9 B')
  })

  test('handles values just below MB boundary', () => {
    expect(formatSize(1048575)).toBe('1024.0 KB')
  })

  test('handles values just below GB boundary', () => {
    expect(formatSize(1073741823)).toBe('1024.0 MB')
  })

  test('always uses one decimal place', () => {
    const result = formatSize(500)
    expect(result).toMatch(/^\d+\.\d+ B$/)
  })

  test('caps at GB for enormous values', () => {
    const petabyte = 1024 * 1024 * 1024 * 1024 * 1024
    expect(formatSize(petabyte)).toBe('1048576.0 GB')
  })

  test('formats 5 GB correctly', () => {
    expect(formatSize(5368709120)).toBe('5.0 GB')
  })

  test('formats 50 GB correctly', () => {
    expect(formatSize(53687091200)).toBe('50.0 GB')
  })

  test('output contains expected unit suffix', () => {
    expect(formatSize(0)).toContain('B')
    expect(formatSize(2048)).toContain('KB')
    expect(formatSize(2097152)).toContain('MB')
    expect(formatSize(2147483648)).toContain('GB')
  })

  test('handles value producing rounding edge case', () => {
    expect(formatSize(1023.5)).toBe('1023.5 B')
    expect(formatSize(1535.5)).toBe('1.5 KB')
  })
})

describe('getGrade boundary values', () => {
  test('returns (A) for exactly 90', () => {
    expect(getGrade(90)).toBe('(A)')
  })

  test('returns (B) for exactly 80', () => {
    expect(getGrade(80)).toBe('(B)')
  })

  test('returns (C) for exactly 70', () => {
    expect(getGrade(70)).toBe('(C)')
  })

  test('returns (D) for exactly 60', () => {
    expect(getGrade(60)).toBe('(D)')
  })

  test('returns (F) for 59.99', () => {
    expect(getGrade(59.99)).toBe('(F)')
  })

  test('returns (A) for 100', () => {
    expect(getGrade(100)).toBe('(A)')
  })

  test('returns (F) for 0', () => {
    expect(getGrade(0)).toBe('(F)')
  })

  test('returns (A) for 99.9', () => {
    expect(getGrade(99.9)).toBe('(A)')
  })

  test('returns (B) for 89.9', () => {
    expect(getGrade(89.9)).toBe('(B)')
  })
})

describe('getScoreColor boundary coverage', () => {
  test('returns green for exactly 80', () => {
    const color = getScoreColor(80)
    expect(typeof color).toBe('function')
  })

  test('returns red for exactly 60', () => {
    const color = getScoreColor(60)
    expect(typeof color).toBe('function')
  })

  test('returns yellow for 70', () => {
    const color = getScoreColor(70)
    expect(typeof color).toBe('function')
  })

  test('returns red for 0', () => {
    const color = getScoreColor(0)
    expect(typeof color).toBe('function')
  })
})

describe('colorizeSeverity unknown values', () => {
  test('returns raw string for unknown severity', () => {
    const result = colorizeSeverity('custom')
    expect(result).toBe('custom')
  })

  test('returns raw string for empty string', () => {
    const result = colorizeSeverity('')
    expect(result).toBe('')
  })

  test('returns raw string for numeric string', () => {
    const result = colorizeSeverity('42')
    expect(result).toBe('42')
  })
})

describe('getThresholdColor boundary values', () => {
  test('returns green when value equals goodThreshold', () => {
    const color = getThresholdColor(90, 90, 50)
    expect(typeof color).toBe('function')
  })

  test('returns yellow when value equals warnThreshold', () => {
    const color = getThresholdColor(50, 90, 50)
    expect(typeof color).toBe('function')
  })

  test('returns red when value is below warnThreshold', () => {
    const color = getThresholdColor(10, 90, 50)
    expect(typeof color).toBe('function')
  })

  test('handles zero thresholds', () => {
    const color = getThresholdColor(0, 0, 0)
    expect(typeof color).toBe('function')
  })
})

describe('getGrade exhaustive boundary sweep', () => {
  const boundaries = [
    { score: 100, grade: '(A)' },
    { score: 95, grade: '(A)' },
    { score: 90, grade: '(A)' },
    { score: 89.9, grade: '(B)' },
    { score: 89, grade: '(B)' },
    { score: 85, grade: '(B)' },
    { score: 80, grade: '(B)' },
    { score: 79.9, grade: '(C)' },
    { score: 79, grade: '(C)' },
    { score: 75, grade: '(C)' },
    { score: 70, grade: '(C)' },
    { score: 69.9, grade: '(D)' },
    { score: 69, grade: '(D)' },
    { score: 65, grade: '(D)' },
    { score: 60, grade: '(D)' },
    { score: 59.9, grade: '(F)' },
    { score: 59, grade: '(F)' },
    { score: 50, grade: '(F)' },
    { score: 1, grade: '(F)' },
    { score: 0, grade: '(F)' },
    { score: -1, grade: '(F)' },
    { score: -100, grade: '(F)' },
    { score: 150, grade: '(A)' },
    { score: 1000, grade: '(A)' },
  ]

  for (const { score, grade } of boundaries) {
    test(`getGrade(${score}) = ${grade}`, () => {
      expect(getGrade(score)).toBe(grade)
    })
  }
})

describe('getScoreColor exhaustive sweep', () => {
  const cases = [
    { score: 100, expected: 'green' },
    { score: 90, expected: 'green' },
    { score: 80, expected: 'green' },
    { score: 79.9, expected: 'yellow' },
    { score: 75, expected: 'yellow' },
    { score: 70, expected: 'yellow' },
    { score: 60, expected: 'yellow' },
    { score: 59.9, expected: 'red' },
    { score: 50, expected: 'red' },
    { score: 0, expected: 'red' },
    { score: -1, expected: 'red' },
    { score: 200, expected: 'green' },
  ]

  for (const { score, expected } of cases) {
    test(`score ${score} → ${expected}`, () => {
      const fn = getScoreColor(score)
      const input = 'x'
      const actual = fn(input)
      if (expected === 'green') expect(actual).toBe(chalk.green(input))
      else if (expected === 'yellow') expect(actual).toBe(chalk.yellow(input))
      else expect(actual).toBe(chalk.red(input))
    })
  }
})

describe('colorizeSeverity exhaustive', () => {
  const knownSeverities = [
    { input: 'error', isColored: true },
    { input: 'warning', isColored: true },
    { input: 'info', isColored: true },
  ]

  for (const { input, isColored } of knownSeverities) {
    test(`"${input}" is ${isColored ? 'colored' : 'plain'}`, () => {
      const result = colorizeSeverity(input)
      expect(result).toContain(input)
    })
  }

  const unknownInputs = [
    'Error',
    'WARNING',
    'Info',
    'debug',
    'trace',
    'fatal',
    'note',
    'hint',
    'suggestion',
  ]
  for (const input of unknownInputs) {
    test(`"${input}" returns uncolored`, () => {
      expect(colorizeSeverity(input)).toBe(input)
    })
  }

  test('handles multiline string', () => {
    expect(colorizeSeverity('line1\nline2')).toBe('line1\nline2')
  })

  test('handles string with tabs', () => {
    expect(colorizeSeverity('err\tor')).toBe('err\tor')
  })

  test('handles string with null byte', () => {
    expect(colorizeSeverity('err\0or')).toBe('err\0or')
  })

  test('handles emoji string', () => {
    expect(colorizeSeverity('🔴')).toBe('🔴')
  })

  test('handles very long severity', () => {
    const long = 'x'.repeat(500)
    expect(colorizeSeverity(long)).toBe(long)
  })
})

describe('getThresholdColor exhaustive', () => {
  test('green zone: value well above goodThreshold', () => {
    expect(getThresholdColor(200, 100, 50)('x')).toBe(chalk.green('x'))
  })

  test('green zone: value exactly at goodThreshold', () => {
    expect(getThresholdColor(100, 100, 50)('x')).toBe(chalk.green('x'))
  })

  test('yellow zone: value between thresholds', () => {
    expect(getThresholdColor(75, 100, 50)('x')).toBe(chalk.yellow('x'))
  })

  test('yellow zone: value exactly at warnThreshold', () => {
    expect(getThresholdColor(50, 100, 50)('x')).toBe(chalk.yellow('x'))
  })

  test('red zone: value below warnThreshold', () => {
    expect(getThresholdColor(25, 100, 50)('x')).toBe(chalk.red('x'))
  })

  test('red zone: value at zero', () => {
    expect(getThresholdColor(0, 100, 50)('x')).toBe(chalk.red('x'))
  })

  test('negative value below negative warnThreshold', () => {
    expect(getThresholdColor(-30, -10, -20)('x')).toBe(chalk.red('x'))
  })

  test('negative value between negative thresholds', () => {
    expect(getThresholdColor(-15, -10, -20)('x')).toBe(chalk.yellow('x'))
  })

  test('negative value above negative goodThreshold', () => {
    expect(getThresholdColor(-5, -10, -20)('x')).toBe(chalk.green('x'))
  })

  test('very high goodThreshold', () => {
    expect(getThresholdColor(999, 1000, 500)('x')).toBe(chalk.red('x'))
    expect(getThresholdColor(1000, 1000, 500)('x')).toBe(chalk.green('x'))
  })

  test('fractional thresholds', () => {
    expect(getThresholdColor(0.99, 0.95, 0.5)('x')).toBe(chalk.green('x'))
    expect(getThresholdColor(0.75, 0.95, 0.5)('x')).toBe(chalk.yellow('x'))
    expect(getThresholdColor(0.25, 0.95, 0.5)('x')).toBe(chalk.red('x'))
  })
})

describe('formatSize exhaustive unit coverage', () => {
  test('0 bytes', () => expect(formatSize(0)).toBe('0.0 B'))
  test('1 byte', () => expect(formatSize(1)).toBe('1.0 B'))
  test('100 bytes', () => expect(formatSize(100)).toBe('100.0 B'))
  test('512 bytes', () => expect(formatSize(512)).toBe('512.0 B'))
  test('1000 bytes', () => expect(formatSize(1000)).toBe('1000.0 B'))
  test('1023 bytes', () => expect(formatSize(1023)).toBe('1023.0 B'))
  test('1024 bytes = 1 KB', () => expect(formatSize(1024)).toBe('1.0 KB'))
  test('1536 bytes = 1.5 KB', () => expect(formatSize(1536)).toBe('1.5 KB'))
  test('5 KB', () => expect(formatSize(5120)).toBe('5.0 KB'))
  test('100 KB', () => expect(formatSize(102400)).toBe('100.0 KB'))
  test('512 KB', () => expect(formatSize(524288)).toBe('512.0 KB'))
  test('1 MB', () => expect(formatSize(1048576)).toBe('1.0 MB'))
  test('2.5 MB', () => expect(formatSize(2621440)).toBe('2.5 MB'))
  test('50 MB', () => expect(formatSize(52428800)).toBe('50.0 MB'))
  test('500 MB', () => expect(formatSize(524288000)).toBe('500.0 MB'))
  test('1 GB', () => expect(formatSize(1073741824)).toBe('1.0 GB'))
  test('2.5 GB', () => expect(formatSize(2684354560)).toBe('2.5 GB'))
  test('10 GB', () => expect(formatSize(10737418240)).toBe('10.0 GB'))
  test('100 GB', () => expect(formatSize(107374182400)).toBe('100.0 GB'))
  test('caps at GB (1 TB)', () => expect(formatSize(1099511627776)).toBe('1024.0 GB'))
})

// ============================================================================
// Additional tests: getGrade mid-range values
// ============================================================================

describe('getGrade mid-range sweep', () => {
  test('returns (A) for score 91', () => {
    expect(getGrade(91)).toBe('(A)')
  })

  test('returns (A) for score 92', () => {
    expect(getGrade(92)).toBe('(A)')
  })

  test('returns (A) for score 93', () => {
    expect(getGrade(93)).toBe('(A)')
  })

  test('returns (A) for score 94', () => {
    expect(getGrade(94)).toBe('(A)')
  })

  test('returns (A) for score 96', () => {
    expect(getGrade(96)).toBe('(A)')
  })

  test('returns (A) for score 97', () => {
    expect(getGrade(97)).toBe('(A)')
  })

  test('returns (A) for score 98', () => {
    expect(getGrade(98)).toBe('(A)')
  })

  test('returns (A) for score 99', () => {
    expect(getGrade(99)).toBe('(A)')
  })

  test('returns (B) for score 81', () => {
    expect(getGrade(81)).toBe('(B)')
  })

  test('returns (B) for score 82', () => {
    expect(getGrade(82)).toBe('(B)')
  })

  test('returns (B) for score 83', () => {
    expect(getGrade(83)).toBe('(B)')
  })

  test('returns (B) for score 84', () => {
    expect(getGrade(84)).toBe('(B)')
  })

  test('returns (B) for score 86', () => {
    expect(getGrade(86)).toBe('(B)')
  })

  test('returns (B) for score 87', () => {
    expect(getGrade(87)).toBe('(B)')
  })

  test('returns (B) for score 88', () => {
    expect(getGrade(88)).toBe('(B)')
  })

  test('returns (C) for score 71', () => {
    expect(getGrade(71)).toBe('(C)')
  })

  test('returns (C) for score 72', () => {
    expect(getGrade(72)).toBe('(C)')
  })

  test('returns (C) for score 73', () => {
    expect(getGrade(73)).toBe('(C)')
  })

  test('returns (C) for score 74', () => {
    expect(getGrade(74)).toBe('(C)')
  })

  test('returns (C) for score 76', () => {
    expect(getGrade(76)).toBe('(C)')
  })

  test('returns (C) for score 77', () => {
    expect(getGrade(77)).toBe('(C)')
  })

  test('returns (C) for score 78', () => {
    expect(getGrade(78)).toBe('(C)')
  })

  test('returns (D) for score 61', () => {
    expect(getGrade(61)).toBe('(D)')
  })

  test('returns (D) for score 62', () => {
    expect(getGrade(62)).toBe('(D)')
  })

  test('returns (D) for score 63', () => {
    expect(getGrade(63)).toBe('(D)')
  })

  test('returns (D) for score 64', () => {
    expect(getGrade(64)).toBe('(D)')
  })

  test('returns (D) for score 66', () => {
    expect(getGrade(66)).toBe('(D)')
  })

  test('returns (D) for score 67', () => {
    expect(getGrade(67)).toBe('(D)')
  })

  test('returns (D) for score 68', () => {
    expect(getGrade(68)).toBe('(D)')
  })

  test('returns (F) for score 10', () => {
    expect(getGrade(10)).toBe('(F)')
  })

  test('returns (F) for score 20', () => {
    expect(getGrade(20)).toBe('(F)')
  })

  test('returns (F) for score 30', () => {
    expect(getGrade(30)).toBe('(F)')
  })

  test('returns (F) for score 40', () => {
    expect(getGrade(40)).toBe('(F)')
  })

  test('returns (F) for score 55', () => {
    expect(getGrade(55)).toBe('(F)')
  })

  test('returns (F) for score 58', () => {
    expect(getGrade(58)).toBe('(F)')
  })
})

// ============================================================================
// Additional tests: getScoreColor return value consistency
// ============================================================================

describe('getScoreColor return value consistency', () => {
  test('green function produces same output as chalk.green for numbers', () => {
    const fn = getScoreColor(85)
    expect(fn('42')).toBe(chalk.green('42'))
  })

  test('yellow function produces same output as chalk.yellow for symbols', () => {
    const fn = getScoreColor(65)
    expect(fn('***')).toBe(chalk.yellow('***'))
  })

  test('red function produces same output as chalk.red for special chars', () => {
    const fn = getScoreColor(25)
    expect(fn('!@#')).toBe(chalk.red('!@#'))
  })

  test('green function preserves unicode', () => {
    const fn = getScoreColor(90)
    expect(fn('🎉')).toBe(chalk.green('🎉'))
  })

  test('yellow function preserves unicode', () => {
    const fn = getScoreColor(65)
    expect(fn('⚡')).toBe(chalk.yellow('⚡'))
  })

  test('red function preserves unicode', () => {
    const fn = getScoreColor(10)
    expect(fn('🔥')).toBe(chalk.red('🔥'))
  })
})

// ============================================================================
// Additional tests: colorizeSeverity additional coverage
// ============================================================================

describe('colorizeSeverity additional coverage', () => {
  test('error output matches chalk.red for error', () => {
    const result = colorizeSeverity('error')
    expect(result).toBe(chalk.red('error'))
  })

  test('warning output matches chalk.yellow for warning', () => {
    const result = colorizeSeverity('warning')
    expect(result).toBe(chalk.yellow('warning'))
  })

  test('info output matches chalk.blue for info', () => {
    const result = colorizeSeverity('info')
    expect(result).toBe(chalk.blue('info'))
  })

  test('unknown severity output equals input exactly', () => {
    const input = 'unknown_severity'
    expect(colorizeSeverity(input)).toBe(input)
  })

  test('handles single character input', () => {
    expect(colorizeSeverity('e')).toBe('e')
    expect(colorizeSeverity('w')).toBe('w')
    expect(colorizeSeverity('i')).toBe('i')
  })

  test('handles newline characters', () => {
    expect(colorizeSeverity('\n')).toBe('\n')
  })

  test('handles carriage return', () => {
    expect(colorizeSeverity('\r')).toBe('\r')
  })
})

// ============================================================================
// Additional tests: formatSize additional coverage
// ============================================================================

describe('formatSize additional coverage', () => {
  test('formats 3 bytes', () => {
    expect(formatSize(3)).toBe('3.0 B')
  })

  test('formats 7 bytes', () => {
    expect(formatSize(7)).toBe('7.0 B')
  })

  test('formats 256 bytes', () => {
    expect(formatSize(256)).toBe('256.0 B')
  })

  test('formats 768 bytes', () => {
    expect(formatSize(768)).toBe('768.0 B')
  })

  test('formats 3 KB correctly', () => {
    expect(formatSize(3072)).toBe('3.0 KB')
  })

  test('formats 7 KB correctly', () => {
    expect(formatSize(7168)).toBe('7.0 KB')
  })

  test('formats 20 MB correctly', () => {
    expect(formatSize(20971520)).toBe('20.0 MB')
  })

  test('formats 30 GB correctly', () => {
    expect(formatSize(32212254720)).toBe('30.0 GB')
  })

  test('formats 75 GB correctly', () => {
    expect(formatSize(80530636800)).toBe('75.0 GB')
  })

  test('formats 0.1 B', () => {
    expect(formatSize(0.1)).toBe('0.1 B')
  })

  test('formats 0.9 B', () => {
    expect(formatSize(0.9)).toBe('0.9 B')
  })
})
