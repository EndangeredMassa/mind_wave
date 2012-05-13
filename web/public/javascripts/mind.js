(function() {
  var $, addBar, addLine, buildInterfaceIfReady, charWidth, charts, createBars, createSeries, currentKey, gameOver, getDanger, getDifficulty, getKey, gravity, lastAttentionScore, lastMeditationScore, lineWidth, lines, maxStoryPosition, moveBars, movePlayerHorizontal, movePlayerVertical, moveSpeed, nextBar, parentRender, player, playerAnim, playerSprites, rand, renderLine, runGame, score, stage, stop, story, storyPosition, updateScore;

  moveSpeed = 0;

  nextBar = 800;

  lines = [];

  player = null;

  playerSprites = null;

  playerAnim = null;

  stage = null;

  currentKey = null;

  charWidth = 15;

  lineWidth = 41;

  gravity = 300;

  lastAttentionScore = 0;

  lastMeditationScore = 0;

  score = 0;

  stop = false;

  charts = [];

  story = "\"I admit,\" said he - when I mentioned to him this objection - \"I admit the truth of your critic\'s facts, but I deny his conclusions. It is true that we have really in Flatland a Third unrecognized Dimension called 'height,' just as it is also true that you have really in Spaceland a Fourth unrecognized Dimension, called by no name at present, but which I will call 'extra-height'. But we can no more take cognizance of our 'height' then you can of your 'extra-height'. Even I - who have been in Spaceland, and have had the privilege of understanding for twenty-four hours the meaning of \'height\' - even I cannot now comprehend it, nor realize it by the sense of sight or by any process of reason; I can but apprehend it by faith. \"The reason is obvious. Dimension implies direction, implies measurement, implies the more and the less. Now, all our lines are equally and infinitesimally thick (or high, whichever you like); consequently, there is nothing in them to lead our minds to the conception of that Dimension. No 'delicate micrometer' - as has been suggested by one too hasty Spaceland critic - would in the least avail us; for we should not know what to measure, nor in what direction. When we see a Line, we see something that is long and bright; brightness, as well as length, is necessary to the existence of a Line; if the brightness vanishes, the Line is extinguished. Hence, all my Flatland friends - when I talk to them about the unrecognized Dimension which is somehow visible in a Line - say, 'Ah, you mean brightness': and when I reply, 'No, I mean a real Dimension,' they at once retort 'Then measure it, or tell us in what direction it extends'; and this silences me, for I can do neither. Only yesterday, when the Chief Circle (in other words our High Priest) came to inspect the State Prison and paid me his seventh annual visit, and when for the seventh time he put me the question, 'Was I any better?' I tried to prove to him that he was 'high,' as well as long and broad, although he did not know it. But what was his reply? 'You say I am \"high\"; measure my \"highness\" and I will believe you.' What could I do? How could I meet his challenge? I was crushed; and he left the room triumphant. \"Does this still seem strange to you? Then put yourself in a similar position. Suppose a person of the Fourth Dimension, condescending to visit you, were to say, `Whenever you open your eyes, you see a Plane (which is of Two Dimensions) and you infer a Solid (which is of Three); but in reality you also see (though you do not recognize) a Fourth Dimension, which is not colour nor brightness nor anything of the kind, but a true Dimension, although I cannot point out to you its direction, nor can you possibly measure it.' What would you say to such a visitor? Would not you have him locked up? Well, that is my fate: and it is as natural for us Flatlanders to lock up a Square for preaching the Third Dimension, as it is for you Spacelanders to lock up a Cube for preaching the Fourth. Alas, how strong a family likeness runs through blind and persecuting humanity in all Dimensions! Points, Lines, Squares, Cubes, Extra- Cubes - we are all liable to the same errors, all alike the Slaves of our respective Dimensional prejudices, as one of your Spaceland poets has said - 'One touch of Nature makes all worlds akin'.\"";

  storyPosition = 0;

  maxStoryPosition = story.length - 1;

  $ = function(id) {
    return document.getElementById(id);
  };

  rand = function(min, max) {
    return parseInt(Math.random() * (max - min) + min, 10);
  };

  parentRender = SmoothieChart.prototype.render;

  SmoothieChart.prototype.render = function(canvas, time) {
    var attentionContext;
    parentRender.call(this, canvas, time);
    attentionContext = canvas.getContext('2d');
    attentionContext.save();
    attentionContext.font = '24px bold "Lucida Grande", Helvetica, Arial, sans-serif';
    attentionContext.fillStyle = '#777777';
    attentionContext.fillText(this.title, 250, 100);
    return attentionContext.restore();
  };

  createSeries = function(canvas, title, color) {
    var context, smoothie, ts;
    context = canvas.getContext('2d');
    ts = new TimeSeries();
    smoothie = new SmoothieChart({
      labels: {
        disabled: true
      }
    });
    smoothie.title = title;
    smoothie.streamTo(canvas);
    smoothie.addTimeSeries(ts, {
      strokeStyle: "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0.25)",
      fillStyle: "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0.2)",
      lineWidth: 3
    });
    charts.push(smoothie);
    return ts;
  };

  runGame = function() {
    var canvas, playerSrc;
    playerSrc = new Image();
    playerSrc.src = "/images/crowley.png";
    playerSrc.name = "player1";
    playerSrc.onload = function() {
      var spriteData;
      spriteData = {
        images: [playerSrc],
        frames: {
          width: 32,
          height: 48
        },
        animations: {
          idle: {
            frames: [0, 1, 2, 3],
            frequency: 10
          },
          left: {
            frames: [4, 5, 6, 7],
            frequency: 10
          },
          right: {
            frames: [8, 9, 10, 11],
            frequency: 10
          },
          falling: {
            frames: [12, 13, 14, 15],
            frequency: 10
          }
        }
      };
      playerSprites = new SpriteSheet(spriteData);
      player = new BitmapAnimation(playerSprites);
      return buildInterfaceIfReady();
    };
    canvas = $('game');
    return stage = new Stage(canvas);
  };

  buildInterfaceIfReady = function() {
    if (!player) return;
    player.x = 0;
    player.y = 0;
    player.width = 32;
    player.height = 48;
    stage.addChild(player);
    player.gotoAndPlay('right');
    lines.push(addLine());
    stage.update();
    Ticker.addListener(window);
    Ticker.useRAF = true;
    return Ticker.setInterval(17);
  };

  getDifficulty = function() {
    return lastAttentionScore / 100.0;
  };

  getDanger = function() {
    return 1 - (lastMeditationScore / 100.0);
  };

  addLine = function() {
    var difficulty, gap;
    difficulty = getDifficulty();
    gap = parseInt(difficulty * 8 + 6, 10);
    return renderLine(600, rand(1, 20), gap);
  };

  renderLine = function(y, gapPosition, gapSize) {
    var leftBar, leftWidth, rightBar, rightWidth, rightX;
    leftWidth = gapPosition;
    rightX = (gapPosition + gapSize) * charWidth;
    rightWidth = lineWidth - leftWidth - gapSize;
    leftBar = addBar(0, y, leftWidth);
    rightBar = addBar(rightX, y, rightWidth);
    return [leftBar, rightBar];
  };

  addBar = function(x, y, width) {
    var bar, rect, text;
    text = story.substr(storyPosition, width);
    storyPosition += width;
    if (storyPosition >= maxStoryPosition) storyPosition = 0;
    bar = new Text(text, "30px bold 'Courier New'", "#0F0");
    bar.x = x;
    bar.y = y;
    bar.width = width;
    bar.height = 24;
    stage.addChild(bar);
    rect = new Shape();
    rect.graphics.beginFill(Graphics.getRGB(0, 255, 0));
    rect.graphics.rect(0, 0, bar.getMeasuredWidth(), bar.height + 5);
    rect.alpha = 0.5;
    rect.x = bar.x;
    rect.y = bar.y - bar.height;
    stage.addChild(rect);
    return {
      bar: bar,
      rect: rect
    };
  };

  window.addEventListener('keydown', function(e) {
    return currentKey = e.keyCode;
  });

  gameOver = function() {
    var chart, gameOverText, _i, _len, _results;
    gameOverText = new Text('GAME OVER', '80px bold "Courier New"', '#F00');
    gameOverText.x = 100;
    gameOverText.y = 300;
    stage.addChild(gameOverText);
    gameOverText = new Text("SCORE: " + score, '60px bold "Courier New"', '#F00');
    gameOverText.x = 120;
    gameOverText.y = 400;
    stage.addChild(gameOverText);
    stage.update();
    stop = true;
    Ticker.setPaused(true);
    _results = [];
    for (_i = 0, _len = charts.length; _i < _len; _i++) {
      chart = charts[_i];
      _results.push(chart.stop());
    }
    return _results;
  };

  getKey = function() {
    if (currentKey === 37) return "left";
    if (currentKey === 39) return "right";
  };

  movePlayerVertical = function(leftBar, rightBar) {
    var barTop, diff, holeLeft, holeRight, onBarLevel, playerBottom, playerLeft, playerRight;
    playerBottom = player.y + player.height;
    barTop = leftBar.bar.y - leftBar.bar.height;
    diff = playerBottom - barTop;
    onBarLevel = diff >= 0 && diff <= 14;
    if (onBarLevel) {
      holeLeft = leftBar.bar.x + (leftBar.bar.getMeasuredWidth());
      holeRight = rightBar.bar.x;
      playerLeft = player.x;
      playerRight = player.x + player.width;
      if (playerLeft > holeLeft && playerRight < holeRight) {
        return false;
      } else {
        player.y -= diff;
        if (player.y <= 0) gameOver();
        return true;
      }
    }
    return false;
  };

  movePlayerHorizontal = function(elapsed) {
    var oldX;
    if (getKey() === "left") moveSpeed = -1.0;
    if (getKey() === "right") moveSpeed = 1.0;
    oldX = player.x;
    player.x += moveSpeed * 15.0;
    if (player.x > 600 - player.width) player.x = 600 - player.width;
    if (player.x < 0) player.x = 0;
    if (player.currentAnimation !== 'falling') {
      if (player.x > oldX && player.currentAnimation !== 'right') {
        return player.gotoAndPlay('right');
      } else if (player.x < oldX && player.currentAnimation !== 'left') {
        return player.gotoAndPlay('left');
      } else if (player.x === oldX && player.currentAnimation !== 'idle') {
        return player.gotoAndPlay('idle');
      }
    }
  };

  moveBars = function(elapsed, barVelocity) {
    var blocked, leftBar, line, lowerBound, rightBar, thisBlocked, _i, _len;
    blocked = false;
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      leftBar = line[0], rightBar = line[1];
      leftBar.bar.y -= barVelocity;
      rightBar.bar.y -= barVelocity;
      leftBar.rect.y = leftBar.bar.y - leftBar.bar.height;
      rightBar.rect.y = rightBar.bar.y - rightBar.bar.height;
      thisBlocked = movePlayerVertical(leftBar, rightBar);
      if (thisBlocked) blocked = true;
    }
    if (!blocked) {
      if (player.currentAnimation !== 'falling') player.gotoAndPlay('falling');
      player.y += gravity * elapsed;
    } else {
      if (player.currentAnimation === 'falling') player.gotoAndPlay('idle');
    }
    lowerBound = 570 - player.height;
    if (player.y > lowerBound) return player.y = lowerBound;
  };

  createBars = function(elapsed) {
    nextBar -= elapsed;
    if (nextBar <= 0) {
      nextBar = 800;
      return lines.push(addLine());
    }
  };

  updateScore = function(elapsed) {
    score += parseInt(1000 * elapsed, 10);
    return $('score').innerText = "Score: " + score;
  };

  window.tick = function(elapsedMs) {
    var barVelocity, elapsedSec;
    elapsedSec = elapsedMs / 1000;
    barVelocity = parseInt((getDanger() * 400 + 100) * elapsedSec, 10);
    moveBars(elapsedSec, barVelocity);
    movePlayerHorizontal(elapsedSec);
    createBars(elapsedMs);
    updateScore(elapsedSec);
    return stage.update();
  };

  window.onload = function() {
    var attention, host, meditation, socket;
    attention = createSeries($("attention"), 'Attention', {
      r: 255,
      g: 0,
      b: 0
    });
    meditation = createSeries($("meditation"), 'Meditation', {
      r: 0,
      g: 0,
      b: 255
    });
    host = window.location.host;
    socket = io.connect("http://" + host);
    socket.on("data", function(data) {
      var currentTime;
      if (stop) return;
      lastAttentionScore = data.eSense.attention;
      lastMeditationScore = data.eSense.meditation;
      currentTime = new Date().getTime();
      attention.append(currentTime, data.eSense.attention);
      return meditation.append(currentTime, data.eSense.meditation);
    });
    socket.on("moveSpeed", function(newMoveSpeed) {
      return moveSpeed = parseFloat(newMoveSpeed);
    });
    socket.on("connect", function() {
      return console.log("connected");
    });
    return runGame();
  };

}).call(this);
