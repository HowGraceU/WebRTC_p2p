const { log } = require('log')

let createSend = (conn, ip) => {
  return (_data) => {
    let { method, data } = _data
    log(`send to ${ip} \nmethod: ${method} \ndata: ${JSON.stringify(data, null, 2)}`)
    conn.send(JSON.stringify({
      form: 'server',
      method,
      data
    }))
  }
}

exports.createSend = createSend