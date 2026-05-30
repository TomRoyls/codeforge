const s1 = '\\\\' + '*'
console.log('String: "\\\\" + "*" =', JSON.stringify(s1))
const regex1 = new RegExp('^' + s1 + '$')
console.log('Regex source:', JSON.stringify(regex1.source))
console.log('Regex matches "*":', regex1.test('*'))
console.log('Regex matches "a":', regex1.test('a'))

console.log('')

const s2 = '\\\\' + '\\' + '*'
console.log('String: "\\\\" + "\\\\" + "*" =', JSON.stringify(s2))
const regex2 = new RegExp('^' + s2 + '$')
console.log('Regex source:', JSON.stringify(regex2.source))
console.log('Regex matches "*":', regex2.test('*'))
console.log('Regex matches "a":', regex2.test('a'))

console.log('')

const r3 = new RegExp('^\\\\\\*$')
console.log('Direct regex literal: /^\\\\\\*$/')
console.log('Regex source:', JSON.stringify(r3.source))
console.log('Regex matches "*":', r3.test('*'))
