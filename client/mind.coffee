moveSpeed = 0
nextBar = 2500
bars = []
bg = null
player = null
stage = null
currentKey = null

$ = (id) ->
  document.getElementById id

rand = (min, max) ->
  parseInt Math.random() * max + min, 10

createSeries = (canvas) ->
  r = rand(0, 255)
  g = rand(0, 255)
  b = rand(0, 255)
  ts = new TimeSeries()
  smoothie = new SmoothieChart()
  smoothie.streamTo canvas
  smoothie.addTimeSeries ts,
    strokeStyle: "rgb(" + r + ", " + g + ", " + b + ")"
    fillStyle: "rgba(" + r + ", " + g + ", " + b + ", 0.4)"
    lineWidth: 3

  ts

runGame = ->
  canvas = null

  bgSrc = new Image()
  bgSrc.src = "/images/bg.jpg"
  bgSrc.name = "bg"
  bgSrc.onload = ->
    bg = new Bitmap(bgSrc)
    buildInterfaceIfReady()

  playerSrc = new Image()
  playerSrc.src = "/images/player.png"
  playerSrc.name = "player1"
  playerSrc.onload = ->
    player = new Bitmap(playerSrc)
    buildInterfaceIfReady()

  canvas = $("game")
  stage = new Stage(canvas)

  Ticker.addListener window
  Ticker.useRAF = true
  Ticker.setInterval 17

buildInterfaceIfReady = ->
  return if !bg || !player
  player.x = 120
  player.y = 400
  stage.addChild bg, player
  bars.push addBar(0, 600)
  stage.update()

addBar = (x, y) ->
  text = "DFGI2G23DFG34DG2SFD82F2SF2SFEWF223"
  bar = new Text(text, "30px bold Courier New", "#0F0")
  bar.x = x
  bar.y = y
  stage.addChild(bar)
  bar

getKey = ->
  return "left" if currentKey is 37
  "right" if currentKey is 39

window.tick = (elapsed) ->
  i = 0

  for bar in bars
    bar.y -= 2
    playerBottom = player.y + 65
    barTop = bar.y - 22
    onBar = barTop < playerBottom and barTop > player.y
    overHole = false
    player.y -= (playerBottom - barTop)  if onBar and not overHole

  moveSpeed = -1.0 if getKey() is "left"
  moveSpeed = 1.0 if getKey() is "right"

  player.x += (moveSpeed * 15.0)
  player.x = 548 if player.x > 548
  player.x = 0 if player.x < 0

  nextBar -= elapsed
  if nextBar <= 0
    nextBar = 2000
    bars.push(addBar(0, 600))
  stage.update()

window.onload = ->
  attention = createSeries($("attention"))
  meditation = createSeries($("meditation"))
  lowAlpha = createSeries($("low-alpha"))
  highAlpha = createSeries($("high-alpha"))

  socket = io.connect("http://localhost:8080")
  socket.on "data", (data) ->
    currentTime = new Date().getTime()
    attention.append currentTime, data.eSense.attention
    meditation.append currentTime, data.eSense.meditation
    lowAlpha.append currentTime, data.eegPower.lowAlpha
    highAlpha.append currentTime, data.eegPower.highAlpha

  socket.on "moveSpeed", (newMoveSpeed) ->
    moveSpeed = parseFloat(newMoveSpeed)

  socket.on "connect", ->
    console.log "connected"

  runGame()

