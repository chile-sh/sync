import nanoid from 'nanoid'
import JSON5 from 'json5'
import WebSocket from 'ws'

import logger from './lib/logger'

interface CustomWS extends WebSocket {
  uuid?: string
  rooms?: Set<string>
}

const clientIdMap: Map<string, CustomWS> = new Map()
const roomsMap: Map<string, Set<string>> = new Map()

const joinRoom = (ws: CustomWS, room?: string) => {
  const exists = room && roomsMap.has(room)
  const roomId = exists ? room : nanoid()

  if (exists) {
    roomsMap.get(room).add(ws.uuid)
  } else {
    roomsMap.set(roomId, new Set([ws.uuid]))
  }

  ws.rooms.add(roomId)
  ws.send(roomId)

  return roomId
}

const leaveRoom = (ws: CustomWS, room: string) => {
  if (roomsMap.has(room)) {
    const _room = roomsMap.get(room)
    _room.delete(ws.uuid)
    ws.rooms.delete(room)

    if (_room.size) return
    roomsMap.delete(room)
  }
}

const send = (room: string, msg: any) => {
  const str = typeof msg === 'object' ? JSON.stringify(msg) : msg
  return roomsMap.get(room).forEach(client => clientIdMap.get(client).send(str))
}

const sendTo = (ws: CustomWS, room: string, msg: any) => {
  if (!ws.rooms.has(room)) {
    return ws.send(
      JSON.stringify({ type: 'error', code: 403, error: 'Forbidden' })
    )
  }

  send(room, msg)
}

const broadcast = (ws: CustomWS, msg: any) =>
  ws.rooms.forEach(room => send(room, msg))

export default async (wss: WebSocket.Server) => {
  wss.on('connection', (ws: CustomWS) => {
    ws.uuid = nanoid()
    ws.rooms = new Set()

    clientIdMap.set(ws.uuid, ws)

    ws.on('message', (message: string) => {
      const [, cmd, ...args] = message.match(/([^\s]+)\s?([^\s]*)\s?(.*)/)

      switch (cmd) {
        case 'sync:join':
          const id = joinRoom(ws, args[0])
          sendTo(ws, id, {
            type: 'event',
            event: 'join',
            room: id,
            who: ws.uuid,
            date: Date.now(),
          })
          return
        case 'sync:leave':
          const roomId = args[0]
          leaveRoom(ws, roomId)
          sendTo(ws, roomId, {
            type: 'event',
            event: 'leave',
            room: roomId,
            who: ws.uuid,
            date: Date.now(),
          })
          return
        case 'sync:send':
          let msg = args[1]
          try {
            msg = JSON5.parse(args[1])
          } catch (err) {}

          return sendTo(ws, args[0], {
            type: 'message',
            msg,
            toRoom: args[0],
            from: ws.uuid,
            date: Date.now(),
          })
        case 'sync:broadcast':
        case 'sync:bc':
          return broadcast(ws, {
            from: ws.uuid,
            type: 'broadcast',
            msg: args[0],
            date: Date.now(),
          })
      }
    })

    ws.on('close', () => {
      clientIdMap.delete(ws.uuid)
      ws.rooms.forEach(room => leaveRoom(ws, room))
    })
  })

  wss.on('error', logger.error)
}
