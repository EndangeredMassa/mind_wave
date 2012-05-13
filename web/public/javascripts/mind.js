(function() {
  var $, addBar, addLine, buildInterfaceIfReady, charWidth, charts, createBars, createSeries, currentKey, gameOver, getDanger, getDifficulty, getKey, gravity, lastAttentionScore, lastMeditationScore, lineWidth, lines, moveBars, movePlayerHorizontal, movePlayerVertical, moveSpeed, nextBar, parentRender, player, rand, renderLine, runGame, score, stage, stop, updateScore;

  moveSpeed = 0;

  nextBar = 800;

  lines = [];

  player = null;

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
    attentionContext.font = '14px bold "Lucida Grande", Helvetica, Arial, sans-serif';
    attentionContext.fillStyle = '#aaaaaa';
    attentionContext.fillText(this.title, 0, 50);
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
    playerSrc.src = "/images/player.png";
    playerSrc.name = "player1";
    playerSrc.onload = function() {
      player = new Bitmap(playerSrc);
      return buildInterfaceIfReady();
    };
    canvas = $('game');
    stage = new Stage(canvas);
    Ticker.addListener(window);
    Ticker.useRAF = true;
    return Ticker.setInterval(17);
  };

  buildInterfaceIfReady = function() {
    if (!player) return;
    player.x = 0;
    player.y = 0;
    player.width = 64;
    player.height = 64;
    stage.addChild(player);
    lines.push(addLine());
    return stage.update();
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
    gap = parseInt(difficulty * 7 + 6, 10);
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
    var bar, text;
    text = "a8be76ac87b6a897e6ca98e7b628bcdeb".substring(0, width);
    bar = new Text(text, "30px bold 'Courier New'", "#0F0");
    bar.x = x;
    bar.y = y;
    bar.width = width;
    bar.height = 24;
    stage.addChild(bar);
    return bar;
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
    barTop = leftBar.y - leftBar.height;
    diff = playerBottom - barTop;
    onBarLevel = diff >= 0 && diff <= 14;
    if (onBarLevel) {
      holeLeft = leftBar.x + (leftBar.width * charWidth);
      holeRight = rightBar.x;
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
    if (getKey() === "left") moveSpeed = -1.0;
    if (getKey() === "right") moveSpeed = 1.0;
    player.x += (moveSpeed * 600.0) * elapsed;
    if (player.x > 548) player.x = 548;
    if (player.x < 0) return player.x = 0;
  };

  moveBars = function(elapsed, barVelocity) {
    var blocked, leftBar, line, lowerBound, rightBar, thisBlocked, _i, _len;
    blocked = false;
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      leftBar = line[0], rightBar = line[1];
      leftBar.y -= barVelocity;
      rightBar.y -= barVelocity;
      thisBlocked = movePlayerVertical(leftBar, rightBar);
      if (thisBlocked) blocked = true;
    }
    if (!blocked) player.y += gravity * elapsed;
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
    barVelocity = parseInt((getDanger() * 200 + 100) * elapsedSec, 10);
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
