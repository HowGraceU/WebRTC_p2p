global.WS_MAP = {}
global.ROOM = {}

const https = require('https')
const url = require('url')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { log } = require('log')
const wsServer = require('./ws-server')
const wsSend = require('./ws-send.js')
const wsHandle = require('./ws-handle')
const __path = path.resolve(__dirname, '..')

let IPs = Object.assign({}, os.networkInterfaces());
let ip = '';
for (var key in IPs) {
  let ipArr = IPs[key]
  ipArr.some((ipJson) => {
    if (ipJson.family === 'IPv4' && ipJson.address.indexOf('127.') !== 0 &&　ipJson.address.indexOf('192.') !== 0) {
      ip = ipJson.address;
    }
  })
}

let httpsOptions = {
  key: fs.readFileSync(path.resolve(__path, '..') + '/private.pem'),
  cert: fs.readFileSync(path.resolve(__path, '..') + '/file.crt')
};
const logJSON = json => {
  log(JSON.stringify(json, null, 2))
}

const readFile = dir => {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const contentType = pathname => {
  let pointIndex = pathname.lastIndexOf('.')
  let ext = pointIndex !== -1 && pathname.slice(pointIndex + 1)

  switch (ext) {
    case 'js':
      return 'application/javascript'
    case 'css':
      return 'text/css'
    case 'txt':
      return 'text/plain'
    default:
      return 'text/html'
  }
}

let server = https.createServer(httpsOptions, async (req, res) => {
  let urlData = url.parse(req.url, true)
  logJSON(urlData)
  let pathname = urlData.pathname

  log("Request for " + __path + pathname)

  let file = await readFile(__path + pathname)

  res.writeHead(200, {
    'Content-Type': contentType(pathname)
  })
  res.write(file)
  res.end()
}).listen(8002, () => {
  log("Server started on port 8002")
  ip && log("open https://" + ip + ":8002/peerStream.html")
})

let wssServer = wsServer.createWSS(server)
let wsMap = global.WS_MAP

wssServer.on('connection', (conn, req, res) => {
  const ip = req.connection.remoteAddress.slice(7);
  log('webSocket connection:' + ip)

  const connSend = wsSend.createSend(conn, ip)

  let session = Math.floor(Math.random() * 10000).toString()
  wsMap[session] = {
    ip,
    connSend
  }
  connSend({
    method: 'setSession',
    data:{
      key: 'wsId',
      value: session
    }
  })

  conn.on('message', (data) => {
    data = JSON.parse(data)
    log('received form ' + data.form + ':' + ip)
    if (data.method) {
      log(data.method + ':' + JSON.stringify(data.data, null, 2))
      wsHandle.handleMsg(data, connSend, ip)
    } else {
      log(data.data)
    }
  })

  conn.on('close', () => {
    delete wsMap[session]
  })

  connSend({data: 'webSocket send'})
})