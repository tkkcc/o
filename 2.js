const fs = require('fs')
let a = require('./4.json')
const c = fs.readFileSync('2.html').toString()
a.sort((a, b) => b.id - a.id)
const b = a.map(i => `<li><a href="${i.url}" class="link" target="_blank">${i.title}</a><span class='link'>${i.date} by ${i.author}</span></li>`).join('')
fs.writeFileSync('index.html', c.replace('<!-- li -->', b))