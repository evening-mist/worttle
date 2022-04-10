/* eslint-disable no-console */
/* eslint-disable node/no-callback-literal */

import socketIO from 'socket.io'

export default (server) => {
  const io = socketIO(server)

  io.on('connection', socket => {
    console.log(`Socket[${socket.id}] is connected.`)

    socket.on('join-room', (roomId, playerIndex, playerName, callback) => {
      const beforeConnectionsCount = io.sockets.adapter.rooms.get(roomId)?.size ?? 0
      const isSuccess = beforeConnectionsCount === playerIndex
      if (isSuccess) {
        socket.join(roomId)

        console.log(`Socket[${socket.id}] joined Room[${roomId}].`)

        socket.to(roomId).emit('after:join-room', playerIndex, playerName)
      } else {
        console.log(`Socket[${socket.id}] could not join Room[${roomId}].`)
      }

      callback({ isSuccess })
    })

    socket.on('accept-room-join', (payload) => {
      console.log(`Socket[${socket.id}] accepted to join Room[${payload.id}].`)

      socket.to(payload.id).emit('after:accept-room-join', payload)
    })

    socket.on('update-room', (roomId, payload) => {
      console.log(`Socket[${socket.id}] updated Room[${roomId}].`)

      socket.to(roomId).emit('after:update-room', payload)
    })

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId)

      console.log(`Socket[${socket.id}] left from Room[${roomId}].`)

      socket.to(roomId).emit('after:leave-room')
    }) 

    socket.on('add-guess', (roomId, payload) => {
      console.log(`Socket[${socket.id}] add guess in Room[${roomId}].`)

      socket.to(roomId).emit('after:add-guess', payload)
    }) 

    socket.on('judge-opponent-guess', (roomId, judges) => {
      console.log(`Socket[${socket.id}] judge opponent guess in Room[${roomId}].`)

      socket.to(roomId).emit('after:judge-opponent-guess', judges)
    }) 

    socket.on('unveil-answer', (roomId, answer) => {
      console.log(`Socket[${socket.id}] unveil answer in Room[${roomId}].`)

      socket.to(roomId).emit('after:unveil-answer', answer)
    }) 

    socket.on('request-game-reset', (roomId, playerIndex) => {
      console.log(`Socket[${socket.id}] request game reset in Room[${roomId}].`)

      socket.to(roomId).emit('after:request-game-reset', playerIndex)
    }) 

    socket.on('reset-game', (roomId) => {
      console.log(`Socket[${socket.id}] reset game in Room[${roomId}].`)

      socket.to(roomId).emit('after:reset-game')
    }) 

    socket.on('disconnecting', (_reason) => {
      console.log(`Socket[${socket.id}] is disconnected.`)

      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit('after:leave-room')
        }
      }
    })
  })
}
