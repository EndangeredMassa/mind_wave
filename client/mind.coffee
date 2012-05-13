moveSpeed = 0
nextBar = 800
lines = []
player = null
playerSprites = null
playerAnim = null
stage = null
currentKey = null
charWidth = 18
lineWidth = 33
gravity = 300
lastAttentionScore = 0
lastMeditationScore = 0
score = 0
stop = false
charts = []

story = ''
storyPosition = 0
maxStoryPosition = 0


$ = (id) ->
  document.getElementById id

rand = (min, max) ->
  parseInt(Math.random() * (max - min) + min, 10)

parentRender = SmoothieChart.prototype.render
SmoothieChart.prototype.render = (canvas, time) ->
  that = this
  parentRender.call this, canvas, time, () ->
    attentionContext = canvas.getContext('2d')
    attentionContext.save()
    if that.title
      attentionContext.font = '24px bold "Lucida Grande", Helvetica, Arial, sans-serif'
      attentionContext.fillStyle = '#555555'
      attentionContext.fillText(that.title, 210, 100)
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
  charts.push(smoothie)
  ts

runGame = ->
  playerSrc = new Image()
  playerSrc.src = "/images/crowley.png"
  playerSrc.name = "player1"
  playerSrc.onload = ->
    spriteData =
      images: [playerSrc],
      frames: { width: 32, height: 48 },
      animations:
        idle: { frames: [0,1,2,3], frequency: 10 },
        left: { frames: [4,5,6,7], frequency: 10 },
        right:{ frames: [8,9,10,11], frequency: 10 },
        falling:{ frames: [12,13,14,15], frequency: 10 }

    playerSprites = new SpriteSheet(spriteData)
    player = new BitmapAnimation(playerSprites)
    buildInterfaceIfReady()

  canvas = $('game')
  stage = new Stage(canvas)

buildInterfaceIfReady = ->
  return if !player
  player.x = 0
  player.y = 0
  player.width = 32
  player.height = 48
  stage.addChild player

  player.gotoAndPlay('right')
  lines.push(addLine())

  stage.update()
  Ticker.addListener window
  Ticker.useRAF = true
  Ticker.setInterval 17

getDifficulty = ->
  lastAttentionScore / 100.0

getDanger = ->
  danger = (lastMeditationScore / 100.0)
  1 - danger * danger

addLine = ->
  difficulty = getDifficulty()
  gap = parseInt(difficulty * 6 + 4, 10)
  renderLine(600, rand(1,20), gap)

renderLine = (y, gapPosition, gapSize) ->
  leftWidth = gapPosition
  rightX = (gapPosition + gapSize + 1) * charWidth
  rightWidth = lineWidth - leftWidth - gapSize

  leftBar = addBar(0, y, leftWidth)
  rightBar = addBar(rightX, y, rightWidth)

  [leftBar, rightBar]

addBar = (x, y, width) ->
  text = story.substr(storyPosition, width)
  storyPosition += width
  rest = story.substr(storyPosition)
  $('text').innerText = rest
  if storyPosition >= maxStoryPosition
    gameOver('You Win!', '#0F0')
    return


  bar = new Text(text, "30px bold 'Courier New'", "#FFF")
  bar.x = x
  bar.y = y
  bar.width = width
  bar.height = 24

  rect = new Shape()
  rect.graphics.beginFill(Graphics.getRGB(0,0,0))
  rect.graphics.rect(0, 0, bar.getMeasuredWidth(), bar.height + 5)
  rect.x = bar.x
  rect.y = bar.y - bar.height

  stage.addChild(rect)
  stage.addChild(bar)

  { bar: bar, rect: rect }

window.addEventListener 'keydown', (e) ->
  currentKey = e.keyCode

gameOver = (msg, color) ->
  gameOverText = new Text(msg, '80px bold "Courier New"', color)
  gameOverText.x = 90
  gameOverText.y = 280

  rect = new Shape()
  rect.graphics.beginFill(Graphics.getRGB(0,0,0))
  rect.graphics.rect(0, 0, 500, 500)
  rect.alpha = 0.9
  rect.x = 50
  rect.y = 50

  scoreText = new Text("SCORE: #{score}", '60px bold "Courier New"', color)
  scoreText.x = 100
  scoreText.y = 400

  stage.addChild(rect, gameOverText, scoreText)
  stage.update()
  stopGame()

stopGame = ->
  stop = true
  Ticker.setPaused(true)
  for chart in charts
    chart.stop()

getKey = ->
  return "left" if currentKey == 37
  "right" if currentKey == 39

movePlayerVertical = (leftBar, rightBar, oldY) ->
  playerBottom = player.y + player.height

  barTop = leftBar.bar.y - leftBar.bar.height
  onBarLevel = barTop <= playerBottom <= oldY

  if onBarLevel
    holeLeft = leftBar.bar.x + (leftBar.bar.getMeasuredWidth())
    holeRight = rightBar.bar.x
    playerLeft = player.x
    playerRight = player.x + player.width

    if playerLeft > holeLeft && playerRight < holeRight
      return false
    else
      player.y = barTop - player.height
      if player.y <= 0
        gameOver('GAME OVER', '#F00')
      return true
  return false

movePlayerHorizontal = (elapsed) ->
  moveSpeed = -1.0 if getKey() == "left"
  moveSpeed = 1.0 if getKey() == "right"

  oldX = player.x
  player.x += parseInt(moveSpeed * 15.0, 10)
  player.x = 600 - player.width if player.x > 600 - player.width
  player.x = 0 if player.x < 0

  if player.currentAnimation != 'falling'
    if player.x > oldX && player.currentAnimation != 'right'
      player.gotoAndPlay('right')
    else if player.x < oldX && player.currentAnimation != 'left'
      player.gotoAndPlay('left')
    else if player.x == oldX && player.currentAnimation != 'idle'
      player.gotoAndPlay('idle')

moveBars = (elapsed, barVelocity, oldY) ->
  blocked = false
  length = lines.length
  i = 0
  while i < length
    line = lines[i]
    [leftBar, rightBar] = line
    if leftBar.bar.y < 0
      lines.splice(i, 1)
      stage.removeChild(leftBar.bar, rightBar.bar, leftBar.rect, rightBar.rect)
      length--
      continue

    oldY = leftBar.bar.y
    leftBar.bar.y -= barVelocity
    rightBar.bar.y -= barVelocity
    leftBar.rect.y = leftBar.bar.y - leftBar.bar.height
    rightBar.rect.y = rightBar.bar.y - rightBar.bar.height

    if !blocked
      thisBlocked = movePlayerVertical(leftBar, rightBar, oldY)
      if thisBlocked
        blocked = true
    i++

  if !blocked
    if player.currentAnimation != 'falling'
      player.gotoAndPlay 'falling'
    player.y += parseInt(gravity * elapsed, 10)
  else
    if player.currentAnimation == 'falling'
      player.gotoAndPlay 'idle'


  lowerBound = (570 - player.height)
  if player.y > lowerBound
    player.y = lowerBound

createBars = (elapsed) ->
  nextBar -= elapsed
  if nextBar <= 0
    nextBar = 800
    lines.push(addLine())

updateScore = (elapsed) ->
  score += parseInt(1000 * elapsed, 10)
  $('score').innerText = "Score: #{score}"

window.tick = (elapsedMs) ->
  elapsedSec = elapsedMs / 1000
  barVelocity = parseInt((getDanger() * 400 + 100) * elapsedSec, 10)
  moveBars(elapsedSec, barVelocity)
  movePlayerHorizontal(elapsedSec)
  createBars(elapsedMs)
  updateScore(elapsedSec)

  stage.update()

prepareForIPad = ->
    # Positioning for iPad
    body = document.getElementsByTagName('body')[0]
    table = document.getElementsByTagName('table')[0]
    $('header').style.width = '1024px'
    $('header').style.padding = '0'
    attentionCanvas = $('attention')
    attentionCanvas.parentElement.removeChild(attentionCanvas)
    attentionCanvas.style.float = 'right'
    attentionCanvas.width = '412'
    attentionCanvas.style.position = 'absolute'
    attentionCanvas.style.left = '613px'
    attentionCanvas.style.top = '35px'

    meditationCanvas = $('meditation')
    meditationCanvas.parentElement.removeChild(meditationCanvas)
    meditationCanvas.style.float = 'right'
    meditationCanvas.width = '412'
    meditationCanvas.style.position = 'absolute'
    meditationCanvas.style.left = '613px'
    meditationCanvas.style.top = '235px'
    gameCanvas = $('game')
    text = $('text')
    body.removeChild(table)
    body.appendChild(gameCanvas)
    body.appendChild(attentionCanvas)
    body.appendChild(meditationCanvas)
    body.appendChild(text)

window.onload = ->
  story = $('text').innerText
  maxStoryPosition = story.length - 1
  iPad = navigator.platform == 'iPad'
  if iPad
    prepareForIPad()
  attention = createSeries($('attention'), 'Attention', { r: 255, g: 0, b: 0 })
  meditation = createSeries($('meditation'), 'Meditation', { r: 0, g: 0, b: 255 })
  if !iPad
    highAlpha = createSeries($("alpha"), null, { r: 125, g: 125, b: 125 })
    highGamma = createSeries($("gamma"), null, { r: 125, g: 125, b: 125 })
    highBeta = createSeries($("beta"), null, { r: 125, g: 125, b: 125 })
    delta = createSeries($("delta-theta"), null, { r: 125, g: 125, b: 125 })

  host = window.location.host
  socket = io.connect("http://#{host}")
  socket.on "data", (data) ->
    return if stop

    lastAttentionScore = data.eSense.attention
    lastMeditationScore = data.eSense.meditation

    currentTime = new Date().getTime()
    attention.append currentTime, data.eSense.attention
    meditation.append currentTime, data.eSense.meditation
    if !iPad
      highAlpha.append currentTime, data.eegPower.highAlpha
      highGamma.append currentTime, data.eegPower.highGamma
      highBeta.append currentTime, data.eegPower.highBeta
      delta.append currentTime, data.eegPower.delta

  socket.on "moveSpeed", (newMoveSpeed) ->
    moveSpeed = parseFloat(newMoveSpeed)

  socket.on "connect", ->
    console.log "connected"

  runGame()
