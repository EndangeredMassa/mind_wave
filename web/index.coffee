express = require('express')
routes = require('./routes')
net = require 'net'
socketio = require('socket.io')


# setup web server
app = express.createServer()
app.configure ->
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
app.configure 'development', ->
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
app.configure 'production', ->
  app.use(express.errorHandler())
app.get('/', routes.index)
app.listen(3000)

io = socketio.listen(app)

browserClients = []
io.set('log level', 1)
io.sockets.on 'connection', (socket) ->
  console.log 'client connected'
  browserClients.push(socket)

# handle mindwave
port = 13854
host = '127.0.0.1'
config = '{"enableRawOutput": false, "format": "Json"}'

mindwave = net.createConnection(port, host)
mindwave.setEncoding('ascii')


currentChunk = ''
counter = 0
getMindwaveData = ->
  lefts = 0
  rights = 0
  data = null
  counter++
  for char, index in currentChunk
    lefts++ if char == '{'
    rights++ if char == '}'
    if lefts>0 && lefts==rights
      obj = currentChunk.substr(0, index+1)
      currentChunk = currentChunk.substr(index+1)
      data = JSON.parse(obj)

      return data

  return null

mindwave.on 'data', (rawData) ->
  currentChunk += rawData.toString()
  #data = JSON.parse(rawData.toString())

  data = getMindwaveData()

  return if !data || !data.eSense
  for client in browserClients
    client.emit 'data', data

mindwave.on 'connect', ->
  console.log 'mindwave connected'
  mindwave.write(config)

mindwave.on 'end', ->
  console.log('DONE')


# handle ipad
ipad = net.createServer (client) ->
  console.log 'ipad connected!'
  ipadChunk = ''
  data = null
  client.on 'data', (yaw) ->
    ipadChunk+= yaw
    for char, index in ipadChunk
      if char == ';'
        data = ipadChunk.substr(0,index)
        ipadChunk = ipadChunk.substr(index+1)

    if data
      for client in browserClients
        client.emit('moveSpeed', data)

ipad.listen 1337

