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
      "delta":rand(0,2000000),
      "theta":rand(0,10000),
      "lowAlpha":rand(0,25000),
      "highAlpha":rand(0, 20000),
      "lowBeta":rand(0,20000),
      "highBeta":rand(0,25000),
      "lowGamma":rand(0, 15000),
      "highGamma":rand(0, 10000)
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

