(function() {
  var $, addBar, addLine, buildInterfaceIfReady, charWidth, charts, createBars, createSeries, currentKey, gameOver, getDanger, getDifficulty, getKey, gravity, lastAttentionScore, lastMeditationScore, lineWidth, lines, maxStoryPosition, moveBars, movePlayerHorizontal, movePlayerVertical, moveSpeed, nextBar, parentRender, player, playerAnim, playerSprites, prepareForIPad, rand, renderLine, runGame, score, stage, stop, stopGame, story, storyPosition, updateScore;

  moveSpeed = 0;

  nextBar = 800;

  lines = [];

  player = null;

  playerSprites = null;

  playerAnim = null;

  stage = null;

  currentKey = null;

  charWidth = 18;

  lineWidth = 33;

  gravity = 300;

  lastAttentionScore = 0;

  lastMeditationScore = 0;

  score = 0;

  stop = false;

  charts = [];

  story = '';

  storyPosition = 0;

  maxStoryPosition = 0;

  $ = function(id) {
    return document.getElementById(id);
  };

  rand = function(min, max) {
    return parseInt(Math.random() * (max - min) + min, 10);
  };

  parentRender = SmoothieChart.prototype.render;

  SmoothieChart.prototype.render = function(canvas, time) {
    var that;
    that = this;
    return parentRender.call(this, canvas, time, function() {
      var attentionContext;
      attentionContext = canvas.getContext('2d');
      attentionContext.save();
      if (that.title) {
        attentionContext.font = '24px bold "Lucida Grande", Helvetica, Arial, sans-serif';
        attentionContext.fillStyle = '#555555';
        attentionContext.fillText(that.title, 210, 100);
        return attentionContext.restore();
      }
    });
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
    var danger;
    danger = lastMeditationScore / 100.0;
    return 1 - danger * danger;
  };

  addLine = function() {
    var difficulty, gap;
    difficulty = getDifficulty();
    gap = parseInt(difficulty * 6 + 4, 10);
    return renderLine(600, rand(1, 20), gap);
  };

  renderLine = function(y, gapPosition, gapSize) {
    var leftBar, leftWidth, rightBar, rightWidth, rightX;
    leftWidth = gapPosition;
    rightX = (gapPosition + gapSize + 1) * charWidth;
    rightWidth = lineWidth - leftWidth - gapSize;
    leftBar = addBar(0, y, leftWidth);
    rightBar = addBar(rightX, y, rightWidth);
    return [leftBar, rightBar];
  };

  addBar = function(x, y, width) {
    var bar, rect, rest, text;
    text = story.substr(storyPosition, width);
    storyPosition += width;
    rest = story.substr(storyPosition);
    $('text').innerText = rest;
    if (storyPosition >= maxStoryPosition) {
      gameOver('You Win!', '#0F0');
      return;
    }
    bar = new Text(text, "30px bold 'Courier New'", "#FFF");
    bar.x = x;
    bar.y = y;
    bar.width = width;
    bar.height = 24;
    rect = new Shape();
    rect.graphics.beginFill(Graphics.getRGB(0, 0, 0));
    rect.graphics.rect(0, 0, bar.getMeasuredWidth(), bar.height + 5);
    rect.x = bar.x;
    rect.y = bar.y - bar.height;
    stage.addChild(rect);
    stage.addChild(bar);
    return {
      bar: bar,
      rect: rect
    };
  };

  window.addEventListener('keydown', function(e) {
    return currentKey = e.keyCode;
  });

  gameOver = function(msg, color) {
    var gameOverText, rect, scoreText;
    gameOverText = new Text(msg, '80px bold "Courier New"', color);
    gameOverText.x = 90;
    gameOverText.y = 280;
    rect = new Shape();
    rect.graphics.beginFill(Graphics.getRGB(0, 0, 0));
    rect.graphics.rect(0, 0, 500, 500);
    rect.alpha = 0.9;
    rect.x = 50;
    rect.y = 50;
    scoreText = new Text("SCORE: " + score, '60px bold "Courier New"', color);
    scoreText.x = 100;
    scoreText.y = 400;
    stage.addChild(rect, gameOverText, scoreText);
    stage.update();
    return stopGame();
  };

  stopGame = function() {
    var chart, _i, _len, _results;
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

  movePlayerVertical = function(leftBar, rightBar, oldY) {
    var barTop, holeLeft, holeRight, onBarLevel, playerBottom, playerLeft, playerRight;
    playerBottom = player.y + player.height;
    barTop = leftBar.bar.y - leftBar.bar.height;
    onBarLevel = (barTop <= playerBottom && playerBottom <= oldY);
    if (onBarLevel) {
      holeLeft = leftBar.bar.x + (leftBar.bar.getMeasuredWidth());
      holeRight = rightBar.bar.x;
      playerLeft = player.x;
      playerRight = player.x + player.width;
      if (playerLeft > holeLeft && playerRight < holeRight) {
        return false;
      } else {
        player.y = barTop - player.height;
        if (player.y <= 0) gameOver('GAME OVER', '#F00');
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
    player.x += parseInt(moveSpeed * 15.0, 10);
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

  moveBars = function(elapsed, barVelocity, oldY) {
    var blocked, i, leftBar, length, line, lowerBound, rightBar, thisBlocked;
    blocked = false;
    length = lines.length;
    i = 0;
    while (i < length) {
      line = lines[i];
      leftBar = line[0], rightBar = line[1];
      if (leftBar.bar.y < 0) {
        lines.splice(i, 1);
        stage.removeChild(leftBar.bar, rightBar.bar, leftBar.rect, rightBar.rect);
        length--;
        continue;
      }
      oldY = leftBar.bar.y;
      leftBar.bar.y -= barVelocity;
      rightBar.bar.y -= barVelocity;
      leftBar.rect.y = leftBar.bar.y - leftBar.bar.height;
      rightBar.rect.y = rightBar.bar.y - rightBar.bar.height;
      if (!blocked) {
        thisBlocked = movePlayerVertical(leftBar, rightBar, oldY);
        if (thisBlocked) blocked = true;
      }
      i++;
    }
    if (!blocked) {
      if (player.currentAnimation !== 'falling') player.gotoAndPlay('falling');
      player.y += parseInt(gravity * elapsed, 10);
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

  prepareForIPad = function() {
    var attentionCanvas, body, gameCanvas, meditationCanvas, table, text;
    body = document.getElementsByTagName('body')[0];
    table = document.getElementsByTagName('table')[0];
    $('header').style.width = '1024px';
    $('header').style.padding = '0';
    attentionCanvas = $('attention');
    attentionCanvas.parentElement.removeChild(attentionCanvas);
    attentionCanvas.style.float = 'right';
    attentionCanvas.width = '412';
    attentionCanvas.style.position = 'absolute';
    attentionCanvas.style.left = '613px';
    attentionCanvas.style.top = '35px';
    meditationCanvas = $('meditation');
    meditationCanvas.parentElement.removeChild(meditationCanvas);
    meditationCanvas.style.float = 'right';
    meditationCanvas.width = '412';
    meditationCanvas.style.position = 'absolute';
    meditationCanvas.style.left = '613px';
    meditationCanvas.style.top = '235px';
    gameCanvas = $('game');
    text = $('text');
    body.removeChild(table);
    body.appendChild(gameCanvas);
    body.appendChild(attentionCanvas);
    body.appendChild(meditationCanvas);
    return body.appendChild(text);
  };

  window.onload = function() {
    var attention, delta, highAlpha, highBeta, highGamma, host, iPad, meditation, socket;
    story = $('text').innerText;
    maxStoryPosition = story.length - 1;
    iPad = navigator.platform === 'iPad';
    if (iPad) prepareForIPad();
    attention = createSeries($('attention'), 'Attention', {
      r: 255,
      g: 0,
      b: 0
    });
    meditation = createSeries($('meditation'), 'Meditation', {
      r: 0,
      g: 0,
      b: 255
    });
    if (!iPad) {
      highAlpha = createSeries($("alpha"), null, {
        r: 125,
        g: 125,
        b: 125
      });
      highGamma = createSeries($("gamma"), null, {
        r: 125,
        g: 125,
        b: 125
      });
      highBeta = createSeries($("beta"), null, {
        r: 125,
        g: 125,
        b: 125
      });
      delta = createSeries($("delta-theta"), null, {
        r: 125,
        g: 125,
        b: 125
      });
    }
    host = window.location.host;
    socket = io.connect("http://" + host);
    socket.on("data", function(data) {
      var currentTime;
      if (stop) return;
      lastAttentionScore = data.eSense.attention;
      lastMeditationScore = data.eSense.meditation;
      currentTime = new Date().getTime();
      attention.append(currentTime, data.eSense.attention);
      meditation.append(currentTime, data.eSense.meditation);
      if (!iPad) {
        highAlpha.append(currentTime, data.eegPower.highAlpha);
        highGamma.append(currentTime, data.eegPower.highGamma);
        highBeta.append(currentTime, data.eegPower.highBeta);
        return delta.append(currentTime, data.eegPower.delta);
      }
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
