moveSpeed = 0
nextBar = 800
lines = []
player = null
playerSprites = null
playerAnim = null
stage = null
currentKey = null
charWidth = 15
lineWidth = 41
gravity = 300
lastAttentionScore = 0
lastMeditationScore = 0
score = 0
stop = false
charts = []

story = """
"I admit," said he - when I mentioned to him this objection - "I admit the truth of your critic\'s facts, but I deny his conclusions. It is true that we have really in Flatland a Third unrecognized Dimension called 'height,' just as it is also true that you have really in Spaceland a Fourth unrecognized Dimension, called by no name at present, but which I will call 'extra-height'. But we can no more take cognizance of our 'height' then you can of your 'extra-height'. Even I - who have been in Spaceland, and have had the privilege of understanding for twenty-four hours the meaning of \'height\' - even I cannot now comprehend it, nor realize it by the sense of sight or by any process of reason; I can but apprehend it by faith. "The reason is obvious. Dimension implies direction, implies measurement, implies the more and the less. Now, all our lines are equally and infinitesimally thick (or high, whichever you like); consequently, there is nothing in them to lead our minds to the conception of that Dimension. No 'delicate micrometer' - as has been suggested by one too hasty Spaceland critic - would in the least avail us; for we should not know what to measure, nor in what direction. When we see a Line, we see something that is long and bright; brightness, as well as length, is necessary to the existence of a Line; if the brightness vanishes, the Line is extinguished. Hence, all my Flatland friends - when I talk to them about the unrecognized Dimension which is somehow visible in a Line - say, 'Ah, you mean brightness': and when I reply, 'No, I mean a real Dimension,' they at once retort 'Then measure it, or tell us in what direction it extends'; and this silences me, for I can do neither. Only yesterday, when the Chief Circle (in other words our High Priest) came to inspect the State Prison and paid me his seventh annual visit, and when for the seventh time he put me the question, 'Was I any better?' I tried to prove to him that he was 'high,' as well as long and broad, although he did not know it. But what was his reply? 'You say I am "high"; measure my "highness" and I will believe you.' What could I do? How could I meet his challenge? I was crushed; and he left the room triumphant. "Does this still seem strange to you? Then put yourself in a similar position. Suppose a person of the Fourth Dimension, condescending to visit you, were to say, `Whenever you open your eyes, you see a Plane (which is of Two Dimensions) and you infer a Solid (which is of Three); but in reality you also see (though you do not recognize) a Fourth Dimension, which is not colour nor brightness nor anything of the kind, but a true Dimension, although I cannot point out to you its direction, nor can you possibly measure it.' What would you say to such a visitor? Would not you have him locked up? Well, that is my fate: and it is as natural for us Flatlanders to lock up a Square for preaching the Third Dimension, as it is for you Spacelanders to lock up a Cube for preaching the Fourth. Alas, how strong a family likeness runs through blind and persecuting humanity in all Dimensions! Points, Lines, Squares, Cubes, Extra- Cubes - we are all liable to the same errors, all alike the Slaves of our respective Dimensional prejudices, as one of your Spaceland poets has said - 'One touch of Nature makes all worlds akin'."
"""
storyPosition = 0
maxStoryPosition = storyPosition.length - 1

$ = (id) ->
  document.getElementById id

rand = (min, max) ->
  parseInt(Math.random() * (max - min) + min, 10)

parentRender = SmoothieChart.prototype.render
SmoothieChart.prototype.render = (canvas, time) ->
  parentRender.call(this, canvas, time)
  attentionContext = canvas.getContext('2d')
  attentionContext.save()
  attentionContext.font = '14px bold "Lucida Grande", Helvetica, Arial, sans-serif'
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
#    player = new Bitmap(SpriteSheetUtils.extractFrame(player, 'idle'))
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
  text = story.substr(storyPosition, width)
  storyPosition += width
  if storyPosition >= maxStoryPosition
    storyPosition = 0

  bar = new Text(text, "30px bold 'Courier New'", "#0F0")
  bar.x = x
  bar.y = y
  bar.width = width
  bar.height = 24
  stage.addChild(bar)
  bar

window.addEventListener 'keydown', (e) ->
  currentKey = e.keyCode

gameOver = ->
  gameOverText = new Text('GAME OVER', '80px bold "Courier New"', '#F00')
  gameOverText.x = 100
  gameOverText.y = 300
  stage.addChild(gameOverText)


  gameOverText = new Text("SCORE: #{score}", '60px bold "Courier New"', '#F00')
  gameOverText.x = 120
  gameOverText.y = 400
  stage.addChild(gameOverText)

  stage.update()

  stop = true
  Ticker.setPaused(true)
  for chart in charts
    chart.stop()

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
      if player.y <= 0
        gameOver()
      return true
  return false

movePlayerHorizontal = (elapsed) ->
  moveSpeed = -1.0 if getKey() == "left"
  moveSpeed = 1.0 if getKey() == "right"

  oldX = player.x
  player.x += (moveSpeed * 15.0)
  player.x = 600 - player.width if player.x > 600 - player.width
  player.x = 0 if player.x < 0

  if player.currentAnimation != 'falling'
    if player.x > oldX && player.currentAnimation != 'right'
      player.gotoAndPlay('right')
    else if player.x < oldX && player.currentAnimation != 'left'
      player.gotoAndPlay('left')
    else if player.x == oldX && player.currentAnimation != 'idle'
      player.gotoAndPlay('idle')

moveBars = (elapsed, barVelocity) ->
  blocked = false
  for line in lines
    [leftBar, rightBar] = line

    leftBar.y -= barVelocity
    rightBar.y -= barVelocity

    thisBlocked = movePlayerVertical(leftBar, rightBar)
    if thisBlocked
      blocked = true

  if !blocked
    if player.currentAnimation != 'falling'
      player.gotoAndPlay 'falling'
    player.y += gravity
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
  barVelocity = parseInt((getDanger() * 200 + 100) * elapsedSec, 10)
  moveBars(elapsedSec, barVelocity)
  movePlayerHorizontal(elapsedSec)
  createBars(elapsedMs)
  updateScore(elapsedSec)

  stage.update()

window.onload = ->
  attention = createSeries($("attention"), 'Attention', { r: 255, g: 0, b: 0 })
  meditation = createSeries($("meditation"), 'Meditation', { r: 0, g: 0, b: 255 })

  host = window.location.host
  socket = io.connect("http://#{host}")
  socket.on "data", (data) ->
    return if stop

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
