import {
  log,
  global
} from './global.js'
import handleFn from './handleFn.js'
import {
  createWsSend,
  wsSend
} from './ws_send.js'
import {
  createPC,
  createOffer,
  setLocalDsp
} from './pcFn.js';
const host = window.location.origin

let ws = new WebSocket(host.replace('http', 'ws'))

createWsSend(ws)

ws.onopen = (e) => {
  log('WebSocket open')
}

ws.onmessage = (e) => {
  let data = JSON.parse(e.data)
  log(`received form ${data.form}`)
  let err = data.err
  if (err === 1) {
    alert(data.message)
    return
  }

  var handleMethod = data.method
  if (handleMethod) {
    log(`received method: ${handleMethod} \ndata : ${JSON.stringify(data, null, 2)}`)
    handleFn[handleMethod](data.data)
  } else {
    log(data.data)
  }
}

let getNavMedia = () => {
  return new Promise((resolve, reject) => {
    navigator.getUserMedia({
      audio: true,
      video: true
    }, (stream) => {
      resolve(stream)
    }, (error) => {
      log(`navigator.getUserMedia error: ${error}`);
      resolve(error)
    })
  })
}

window.onload = async () => {
  join.onclick = () => {
    let roomId = roomid.value
    global.roomId = roomId
    wsSend({
      method: 'join',
      data: {
        roomId
      }
    })
  }

  attendUl.onclick = async (e) => {
    let target = e.target
    if (target.classList.contains('call_peer')) {
      let roomId = global.roomId
      let peerIp = target.parentNode.getElementsByClassName('attend_ip')[0].innerText
      global.peerIp = peerIp

      let offer = await createOffer()

      setLocalDsp(offer)

      let data = {
        method: 'received_offer',
        offer,
        to: peerIp,
        roomId
      }

      log(`send offer to ${peerIp}`)
      wsSend({
        method: 'send_peer',
        data
      })
    }
  }

  let mediaStream = await getNavMedia()
  if (mediaStream.id) {
    global.mediaStream = mediaStream
    myVideo.srcObject = mediaStream
  }

  createPC()
}