const { log } = require('log')

let wsMap = global.WS_MAP
let room = global.ROOM
let join = (data, connSend, ip) => {
  let roomId = data.roomId
  if (roomId === '') {
    log('roomId为空')
    connSend({
      err: 1,
      message: '房间号不能为空'
    })
    return
  }

  let attendData = {
    wsId: data.wsId,
    ip: ip
  }

  if (room.hasOwnProperty(roomId)) {
    room[roomId].push(attendData)
  } else {
    room[roomId] = [attendData]
  }

  let roomCont = room[roomId],
    roomPeople = roomCont.map(v => v.ip)

  roomCont.forEach(attendData => {
    wsMap[attendData.wsId].connSend({
      method: 'randerAttendList',
      data:{
        attends: roomPeople
      }
    })
  })
}

exports.join = join