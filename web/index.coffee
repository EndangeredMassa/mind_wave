express = require('express')
routes = require('./routes')
net = require 'net'
io = require('socket.io').listen(8080)

clients = []
io.sockets.on 'connection', (socket) ->
  console.log 'client connected'
  clients.push(socket)

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


# handle mindwave
port = 13854
host = '127.0.0.1'
config = '{"enableRawOutput": false, "format": "Json"}'

mindwave = net.createConnection(port, host)
console.log('Socket created.')

mindwave.on 'data', (rawData) ->
  data = JSON.parse(rawData.toString())
  return if !data.eSense
  for client in clients
    client.emit 'data', data

mindwave.on 'connect', ->
  console.log 'mindwave connected'
  mindwave.write(config)

mindwave.on 'end', ->
  console.log('DONE')

