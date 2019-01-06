import {
  log,
  global
} from './global.js'
import {
  wsSend
} from './ws_send.js'
import {
  createPC,
  setLocalDsp,
  setRemoteDsp,
  createAnswer,
  addIceCandidate
} from './pcFn.js'

let handleFn = {
  setSession(data) {
    sessionStorage.setItem(data.key, data.value)
  },

  randerAttendList(data) {
    let attends = data.attends
    let html = []

    attends.forEach(attendData => {
      let attendCloneDom = attendClone.content.children[0].cloneNode(true)
      attendCloneDom.getElementsByClassName('attend_ip')[0].innerText = attendData
      html.push(attendCloneDom.outerHTML)
    });

    attendUl.innerHTML = html.join('')
  },

  async received_offer(data) {
    let roomId = data.roomId
    let offer = data.data.offer

    await setRemoteDsp(offer)

    let answer = await createAnswer()
    setLocalDsp(answer)

    let peerIp = data.from
    global.peerIp = peerIp

    data = {
      method: 'received_answer',
      answer,
      to: peerIp,
      roomId
    }

    wsSend({
      method: 'send_peer',
      data
    })
  },

  async received_answer(data) {
    await setRemoteDsp(data.data.answer)
    log('received answer and set dsp')
  },

  async received_icecandidate(data) {
    await addIceCandidate(data.data.candidate)
    log('received ice and set iceCandidate')
  }
}

export default handleFn