const ws = require('ws')

let createWSS = server => {
  return new ws.Server({
    server
  })
}

exports.createWSS = createWSS