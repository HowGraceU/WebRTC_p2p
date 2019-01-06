import {
  log,
  global
} from './global.js'
import {
  wsSend
} from './ws_send.js'

const asyncPCify = (funName) => {
  return (data) => {
    return new Promise((resolve, reject) => {
      pc[funName](data).then(
        data => {
          resolve(data)
        },
        error => {
          log(`${funName} error: ${error}`);
          reject(error)
        }
      )
    })
  }
}

let pc
let createPC = () => {
  pc = new RTCPeerConnection(null)

  pc.onicecandidate = onicecandidate
  pc.ontrack = ontrack
  pc.onremovestream = () => {
    log(arguments)
  }
  
  let mediaStream = global.mediaStream
  if (mediaStream) {
    mediaStream.getTracks().forEach(
      function (track) {
        pc.addTrack(
          track,
          mediaStream
        );
      }
    );
  }

  return pc
}

let createOffer = asyncPCify('createOffer')

let setLocalDsp = asyncPCify('setLocalDescription')

let setRemoteDsp = asyncPCify('setRemoteDescription')

let createAnswer = asyncPCify('createAnswer')

let addIceCandidate = asyncPCify('addIceCandidate')

let onicecandidate = (e) => {
  if (e.candidate) {
    wsSend({
      method: 'send_peer',
      data: {
        method: 'received_icecandidate',
        candidate: e.candidate,
        to: global.peerIp,
        roomId: global.roomId
      }
    })
  }
}

let ontrack = (e) => {
  log(`received stream ${JSON.stringify(e.streams[0], null, 2)}`)
  peerVideo.srcObject = e.streams[0]
}

export {
  createPC,
  createOffer,
  setLocalDsp,
  setRemoteDsp,
  createAnswer,
  addIceCandidate
}