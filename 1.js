const fs = require('fs')
const got = require('got')
const cookieJar = new (require('tough-cookie')).CookieJar()
const body = new require('form-data')()
var ProgressBar = require('progress')
const { JSDOM } = require('jsdom')
const result = []

// https://github.com/rxaviers/async-pool
const asyncPool = async (poolLimit, array, iteratorFn) => {
  const bar = new ProgressBar(':percent  :elapseds / :etas', {
    total: array.length,
    renderThrottle: 1000,
    clear: true
  })
  const ret = []
  const executing = []
  for (const item of array) {
    bar.tick()
    const p = Promise.resolve().then(() => iteratorFn(item, array))
    ret.push(p)
    const e = p.then(() => executing.splice(executing.indexOf(e), 1))
    executing.push(e)
    if (executing.length >= poolLimit) {
      await Promise.race(executing)
    }
  }
  return Promise.all(ret)
}

const login = async () => {
  let a = await got('https://osu.ppy.sh/home', { cookieJar })
  a = /token" content="(.*)"/.exec(a.body)[1]
  body.append('_token', a)
  body.append('username', 'bilabilax')
  body.append('password', 'osu!dili')
  await got.post('https://osu.ppy.sh/session', { body, cookieJar })
}

const get = async id => {
  let a
  try {
    a = await got('https://osu.ppy.sh/beatmaps/packs/' + id, { cookieJar })
  } catch (e) {
    return
  }
  a = new JSDOM(a.body).window.document
  a = {
    id,
    url: a.querySelector('a.beatmap-pack-download__link').href,
    item: [...a.querySelectorAll('a.beatmap-pack-items__link')].map(i => ({
      artist: i.querySelector('span.beatmap-pack-items__artist').textContent.trim(),
      title: i.querySelector('span.beatmap-pack-items__title').textContent.trim()
    }))
  }
  result.push(a)
}

const range = (a, b = a + 1) => [...Array(b - a).keys()].map(i => i + a)

const m = async () => {
  await login()
  let t = range(1, 1540)
  for (let i = 0; i < 5; ++i) {
    await asyncPool(30, t, get)
    t = t.filter(i => !result.find(j => j.id == i))
    console.log(t)
  }
  fs.writeFileSync('1.json', JSON.stringify(result))
}

m()
