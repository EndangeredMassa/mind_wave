net = require 'net'

rand = (min, max) ->
  parseInt(Math.random() * max + min, 10)

getData = ->
  {
    "eSense": {
      "attention":rand(0,100),
      "meditation":rand(0,100)
    },
    "eegPower":{
      "delta":rand(0,100),
      "theta":rand(0,100),
      "lowAlpha":rand(0,100),
      "highAlpha":rand(0, 100),
      "lowBeta":rand(0,100),
      "highBeta":rand(0,100),
      "lowGamma":rand(0,100),
      "highGamma":rand(0,100)
    },
    "poorSignalLevel":26
  }

clients = []

server = net.createServer (client) ->
  console.log 'client connected'
  clients.push(client)

server.listen 13854, ->

tick = ->
  data = getData()
  for client in clients
    client.write(JSON.stringify(data))

setInterval(tick, 1000)

