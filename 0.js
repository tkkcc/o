const a = require('./3.json')
for (let i = 0; i < 1600; ++i) {
  if (!a.find(x => x.id == i)) {
    console.log(i)
  }
}
