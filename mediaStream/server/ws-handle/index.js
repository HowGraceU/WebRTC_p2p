const { join } = require('./join.js')
const { send_peer } = require('./send_peer.js')
const handleFn = {
  join,
  send_peer
}

let handleMsg = (data, connSend, ip) => {
  let method = data.method

  handleFn[method](data.data, connSend, ip)
}

exports.handleMsg = handleMsg