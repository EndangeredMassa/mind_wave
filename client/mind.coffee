moveSpeed = 0
nextBar = 2500
lines = []
bg = null
player = null
stage = null
currentKey = null
charWidth = 15
lineWidth = 41
gravity = 10
lastAttentionScore = 0
lastMeditationScore = 0

$ = (id) ->
  document.getElementById id

rand = (min, max) ->
  parseInt(Math.random() * (max - min) + min, 10)

parentRender = SmoothieChart.prototype.render
SmoothieChart.prototype.render = (canvas, time) ->
  parentRender.call(this, canvas, time)
  attentionContext = canvas.getContext('2d')
  attentionContext.save()
  attentionContext.font = '14px bold "Lucida Grande", Helvetica, Arial, sans-serif';
  attentionContext.fillStyle = '#aaaaaa'
  attentionContext.fillText(this.title, 0, 50)
  attentionContext.restore()

createSeries = (canvas, title, color) ->
  context = canvas.getContext('2d')
  ts = new TimeSeries()

  smoothie = new SmoothieChart({ labels: {disabled: true}})
  smoothie.title = title
  smoothie.streamTo canvas
  smoothie.addTimeSeries ts,
    strokeStyle: "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0.25)"
    fillStyle: "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0.2)"
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
  stage.addChild player
  lines.push(addLine())
  stage.update()

getDifficulty = ->
  lastAttentionScore / 100.0

getDanger = ->
  1 - (lastMeditationScore / 100.0)

addLine = ->
  difficulty = getDifficulty()
  gap = parseInt(difficulty * 7 + 6, 10)
  renderLine(600, rand(1,20), gap)

renderLine = (y, gapPosition, gapSize) ->
  leftWidth = gapPosition
  rightX = (gapPosition + gapSize) * charWidth
  rightWidth = lineWidth - leftWidth - gapSize

  leftBar = addBar(0, y, leftWidth)
  rightBar = addBar(rightX, y, rightWidth)

  [leftBar, rightBar]

addBar = (x, y, width) ->
  text = "a8be76ac87b6a897e6ca98e7b628bcdeb".substring(0, width)
  bar = new Text(text, "30px bold 'Courier New'", "#0F0")
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

  barTop = leftBar.y - leftBar.height
  diff = playerBottom - barTop
  onBarLevel = diff >= 0 && diff <= 14

  if onBarLevel
    holeLeft = leftBar.x + (leftBar.width * charWidth)
    holeRight = rightBar.x
    playerLeft = player.x
    playerRight = player.x + player.width

    if playerLeft > holeLeft && playerRight < holeRight
      return false
    else
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

    barVelocity = parseInt(getDanger() * 5 + 1, 10)
    leftBar.y -= barVelocity
    rightBar.y -= barVelocity

    thisBlocked = movePlayerVertical(leftBar, rightBar)
    if thisBlocked
      blocked = true

  if !blocked
    player.y += gravity

  lowerBound = (570 - player.height)
  if player.y > lowerBound
    player.y = lowerBound

createBars = (elapsed) ->
  nextBar -= elapsed
  if nextBar <= 0
    nextBar = 2500
    lines.push(addLine())

window.tick = (elapsed) ->
  moveBars()
  movePlayerHorizontal()
  createBars(elapsed)

  stage.update()

window.onload = ->
  attention = createSeries($("attention"), 'Attention', { r: 255, g: 0, b: 0 })
  meditation = createSeries($("meditation"), 'Meditation', { r: 0, g: 0, b: 255 })

  ###
  testCtx = $('test').getContext('2d')
  testCtx.fillRect(0, 0, $('test').width, $('test').height)
  testCtx.strokeStyle = '#ffffff'
  testCtx.strokeText('Test', 0, 1)
  ###

  host = window.location.host
  socket = io.connect("http://#{host}")
  socket.on "data", (data) ->

    lastAttentionScore = data.eSense.attention
    lastMeditationScore = data.eSense.meditation

    currentTime = new Date().getTime()
    attention.append currentTime, data.eSense.attention
    meditation.append currentTime, data.eSense.meditation

  socket.on "moveSpeed", (newMoveSpeed) ->
    moveSpeed = parseFloat(newMoveSpeed)

  socket.on "connect", ->
    console.log "connected"

  runGame()

