const r1 = new RegExp('^\\*\\.$')
console.log('Regex: /^\\*\\.$/')
console.log('Regex source:', r1.source)
console.log('Matches "*." :', r1.test('*.'))
console.log('Matches "a." :', r1.test('a.'))
console.log('Matches "*a" :', r1.test('*a'))

console.log('')

const s = '\\*' + '\\.'
console.log('String: "\\\\*" + "\\." =', JSON.stringify(s))
const r2 = new RegExp('^' + s + '$')
console.log('Regex from string: /^' + s + '$/')
console.log('Regex source:', r2.source)
console.log('Matches "*." :', r2.test('*.'))
console.log('Matches "a." :', r2.test('a.'))
