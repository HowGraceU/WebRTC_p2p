import {
  log
} from './global.js'

let wsSend
let createWsSend = ws => {
  wsSend = _data => {
    let { method, data } = _data
    log(`send method: ${method} \ndata: ${JSON.stringify(data, null, 2)}`)
    ws.send(JSON.stringify({
      form: 'web',
      method,
      data: { 
        ...data,
        wsId: sessionStorage.getItem('wsId')
      }
    }))
  }
}

export { createWsSend, wsSend }