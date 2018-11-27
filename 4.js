const fs = require('fs')
const a = require('./1.json')
const b = require('./3.json')
b.forEach(i => {
  const c = a.find(j => j.id == i.id)
  if (!c) throw i
  Object.assign(i, c)
})
fs.writeFileSync('4.json', JSON.stringify(b))
