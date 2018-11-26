const fs = require('fs')
const a = require('./1.json')
const b = require('./3.json')
a.forEach(i => {
  Object.assign(i, b.find(j => j.id == i.id))
})

fs.writeFileSync('4.json', JSON.stringify(a))
