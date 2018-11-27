const fs = require('fs')
let a = require('./4.json')
let c = fs.readFileSync('2.html').toString()
a.sort((a, b) => b.id - a.id)
let b = a
  .map(i => {
    const item = JSON.stringify(i.item.map(j => parseInt(j.url.match(/\d+/)[0])))
    if (JSON.parse(item).length !== i.item.length) throw i
    return `<li data-item='${item}'><a href="${i.url}" class="link" target="_blank">${i.title}</a>
<span class='link'>${i.date} by ${i.author}</span></li>`
  })
  .join('')
b = '<ul>' + b + '</ul>'
c = c.replace(/<ul>[\s\S]*<\/ul>/m, b)
let d = new Date().toISOString().slice(0, 10)
d = '<span class="message">update on ' + d + '</span>'
c = c.replace(/<span class="message">.*<\/span>/, d)
fs.writeFileSync('docs/index.html', c)
