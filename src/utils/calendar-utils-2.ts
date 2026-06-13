export class CalendarUtils2 {
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  static daysInMonth(year: number, month: number): number {
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (month === 1 && CalendarUtils2.isLeapYear(year)) return 29
    return days[month]
  }

  static dayOfWeek(year: number, month: number, day: number): number {
    const d = new Date(year, month, day)
    return d.getDay()
  }

  static dayOfYear(year: number, month: number, day: number): number {
    let count = 0
    for (let m = 0; m < month; m++) {
      count += CalendarUtils2.daysInMonth(year, m)
    }
    return count + day
  }

  static weekOfYear(year: number, month: number, day: number): number {
    return Math.ceil(CalendarUtils2.dayOfYear(year, month, day) / 7)
  }

  static addDays(year: number, month: number, day: number, n: number): { year: number; month: number; day: number } {
    const date = new Date(year, month, day + n)
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
  }

  static addMonths(year: number, month: number, day: number, n: number): { year: number; month: number; day: number } {
    const date = new Date(year, month + n, day)
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
  }

  static addYears(year: number, month: number, day: number, n: number): { year: number; month: number; day: number } {
    const date = new Date(year + n, month, day)
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
  }

  static quarter(month: number): number {
    return Math.floor(month / 3) + 1
  }

  static isWeekend(year: number, month: number, day: number): boolean {
    const dow = CalendarUtils2.dayOfWeek(year, month, day)
    return dow === 0 || dow === 6
  }

  static isToday(year: number, month: number, day: number): boolean {
    const now = new Date()
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
  }

  static startOfMonth(year: number, month: number): { year: number; month: number; day: number } {
    return { year, month, day: 1 }
  }

  static endOfMonth(year: number, month: number): { year: number; month: number; day: number } {
    return { year, month, day: CalendarUtils2.daysInMonth(year, month) }
  }

  static monthName(month: number): string {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return names[month] || ''
  }

  static monthNameShort(month: number): string {
    return CalendarUtils2.monthName(month).substring(0, 3)
  }

  static dayName(dow: number): string {
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return names[dow] || ''
  }

  static dayNameShort(dow: number): string {
    return CalendarUtils2.dayName(dow).substring(0, 3)
  }

  static daysBetween(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
    const date1 = new Date(y1, m1, d1).getTime()
    const date2 = new Date(y2, m2, d2).getTime()
    return Math.round((date2 - date1) / (1000 * 60 * 60 * 24))
  }

  static range(start: { year: number; month: number; day: number }, end: { year: number; month: number; day: number }): { year: number; month: number; day: number }[] {
    const dates: { year: number; month: number; day: number }[] = []
    let current = start
    const endMs = new Date(end.year, end.month, end.day).getTime()
    while (new Date(current.year, current.month, current.day).getTime() <= endMs) {
      dates.push(current)
      current = CalendarUtils2.addDays(current.year, current.month, current.day, 1)
    }
    return dates
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): CalendarUtils2 { return new CalendarUtils2() }
  equals(other: unknown): boolean { return other instanceof CalendarUtils2 }
}
