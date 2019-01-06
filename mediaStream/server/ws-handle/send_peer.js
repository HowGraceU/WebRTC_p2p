const { log } = require('log')

let wsMap = global.WS_MAP
let room = global.ROOM

let send_peer = (_data, connSend, ip) => {
  let { method, roomId, to, ...data } = _data
  let roomCont = room[roomId]

  roomCont.filter(attendData => to === attendData.ip).forEach(attendData => {
    wsMap[attendData.wsId].connSend({
      method,
      data:{
        from: ip,
        roomId,
        data
      }
    })
  })
}

exports.send_peer = send_peer