const fs = require('fs')
const got = require('got')
const ProgressBar = require('progress')
const { JSDOM } = require('jsdom')
const result = []

// https://github.com/rxaviers/async-pool
const asyncPool = async (poolLimit, array, iteratorFn) => {
  const bar = new ProgressBar('[:bar] :percent  :elapseds / :etas', {
    total: array.length,
    renderThrottle: 1000,
    clear: true,
  })
  const ret = []
  const executing = []
  for (const item of array) {
    bar.tick()
    const p = Promise.resolve().then(() => iteratorFn(item))
    ret.push(p)
    const e = p.then(() => executing.splice(executing.indexOf(e), 1))
    executing.push(e)
    if (executing.length >= poolLimit) {
      await Promise.race(executing)
    }
  }
  return Promise.all(ret)
}

const get = async ({ type, page }) => {
  let a
  try {
    a = await got(`https://osu.ppy.sh/beatmaps/packs?type=${type}&page=${page}`)
  } catch (e) {
    return
  }
  a = [...new JSDOM(a.body).window.document.querySelectorAll('div[data-pack-id]')]
  a = a.map(i => ({
    id: i.getAttribute('data-pack-id'),
    title: i.querySelector('.beatmap-pack__name').textContent,
    date: i.querySelector('.beatmap-pack__date').textContent,
    author: i.querySelector('.beatmap-pack__author--bold').textContent
  }))
  result.push(...a)
}

const range = (a, b = a + 1) => [...Array(b - a).keys()].map(i => i + a)

const m = async () => {
  let c = ['standard', 'chart', 'theme', 'artist']
  c = await Promise.all(
    c.map(async type => {
      let a = await got(`https://osu.ppy.sh/beatmaps/packs?type=${type}`)
      a = /(\d+)">»/.exec(a.body)[1]
      return {
        type,
        max: parseInt(a)
      }
    })
  )
  for (let i of c) {
    const a = range(1, i.max + 1).map(page => ({
      type: i.type,
      page
    }))
    await asyncPool(4, a, get)
  }
  fs.writeFileSync('3.json', JSON.stringify(result))
}
m()
