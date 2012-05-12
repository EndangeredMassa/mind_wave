net = require 'net'

port = 13854
host = '127.0.0.1'
config = '{"enableRawOutput": true, "format": "Json"}'

#
# delta == deep sleep
# theta == drowsy, meditative, or sleeping states; creativity; intuition
# alpha == wakeful relaxation with closed eyes; creativity; reduced with open eyes, drowsiness and sleep
# beta  == normal waking consciousness; concentration; alertness
# gamma == unity of conscious perception
#

socket = net.createConnection(port, host)

console.log('Socket created.')

socket.on 'data', (data) ->
  console.log(data.toString())

socket.on 'connect', ->
  socket.write(config)

socket.on 'end', ->
  console.log('DONE')

