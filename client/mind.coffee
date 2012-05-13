moveSpeed = 0
nextBar = 2500
lines = []
bg = null
player = null
stage = null
currentKey = null
charWidth = 20
gravity = 10

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
  player.x = 0
  player.y = 0
  player.width = 64
  player.height = 64
  stage.addChild bg, player
  lines.push(addLine(600, 10))
  stage.update()

addLine = (y, gap) ->
  leftBar = addBar(0, y, 15)
  rightBar = addBar(400, y, 10)

  [leftBar, rightBar]

addBar = (x, y, width) ->
  text = "a8be76ac87b6a897e6ca98e7b628bcdeb".substr(width)
  bar = new Text(text, "30px bold Courier New", "#0F0")
  bar.x = x
  bar.y = y
  bar.width = width
  bar.height = 24
  stage.addChild(bar)
  bar

window.addEventListener 'keydown', (e) ->
  currentKey = e.keyCode

getKey = ->
  return "left" if currentKey == 37
  "right" if currentKey == 39

movePlayerVertical = (leftBar, rightBar) ->
  playerBottom = player.y + player.height

  ###
  console.log 'player.y='+player.y
  console.log 'player-height='+player.height
  console.log 'bar.y='+leftBar.y
  console.log 'playerBottom='+playerBottom
  ###

  barTop = leftBar.y - leftBar.height
  diff = playerBottom - barTop
  onBarLevel = (diff <= 10 && diff >= 0)

  if onBarLevel
    holeLeft = leftBar.x + (leftBar.width * charWidth)
    holeRight = rightBar.x
    playerLeft = player.x
    playerRight = player.x + player.width

    ###
    console.log 'x: ' + rightBar.x
    console.log 'width: ' + rightBar.width

    console.log 'holeLeft: ' + holeLeft
    console.log 'holeRight:' + holeRight
    console.log 'playerLeft: ' + playerLeft
    console.log 'playerRight: ' + playerRight
    ###

    if playerLeft > holeLeft && playerRight < holeRight
      return false
    else
      console.log 'adjusting player to bar'
      player.y -= diff
      return true
  return false

movePlayerHorizontal = ->
  moveSpeed = -1.0 if getKey() == "left"
  moveSpeed = 1.0 if getKey() == "right"

  player.x += (moveSpeed * 15.0)
  player.x = 548 if player.x > 548
  player.x = 0 if player.x < 0

moveBars = ->
  blocked = false
  for line in lines
    [leftBar, rightBar] = line

    leftBar.y -= 2
    rightBar.y -= 2

    thisBlocked = movePlayerVertical(leftBar, rightBar)
    if thisBlocked
      blocked = true

  if !blocked
    console.log 'falling!'
    player.y += gravity

createBars = (elapsed) ->
  nextBar -= elapsed
  if nextBar <= 0
    nextBar = 2500
    lines.push(addLine(600, 10))

window.tick = (elapsed) ->
  moveBars()
  movePlayerHorizontal()
  createBars(elapsed)

  stage.update()

window.onload = ->
  attention = createSeries($("attention"))
  meditation = createSeries($("meditation"))
  lowAlpha = createSeries($("low-alpha"))
  highAlpha = createSeries($("high-alpha"))

  host = window.location.host
  socket = io.connect("http://#{host}")
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

