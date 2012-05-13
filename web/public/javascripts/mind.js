(function() {
  var $, addBar, addLine, bg, buildInterfaceIfReady, charWidth, createBars, createSeries, currentKey, getDanger, getDifficulty, getKey, gravity, lastAttentionScore, lastMeditationScore, lineWidth, lines, moveBars, movePlayerHorizontal, movePlayerVertical, moveSpeed, nextBar, parentRender, player, rand, renderLine, runGame, stage;

  moveSpeed = 0;

  nextBar = 2500;

  lines = [];

  bg = null;

  player = null;

  stage = null;

  currentKey = null;

  charWidth = 15;

  lineWidth = 41;

  gravity = 10;

  lastAttentionScore = 0;

  lastMeditationScore = 0;

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
    return ts;
  };

  runGame = function() {
    var bgSrc, canvas, playerSrc;
    bgSrc = new Image();
    bgSrc.src = "/images/bg.jpg";
    bgSrc.name = "bg";
    bgSrc.onload = function() {
      bg = new Bitmap(bgSrc);
      return buildInterfaceIfReady();
    };
    playerSrc = new Image();
    playerSrc.src = "/images/player.png";
    playerSrc.name = "player1";
    playerSrc.onload = function() {
      player = new Bitmap(playerSrc);
      return buildInterfaceIfReady();
    };
    canvas = $("game");
    stage = new Stage(canvas);
    Ticker.addListener(window);
    Ticker.useRAF = true;
    return Ticker.setInterval(17);
  };

  buildInterfaceIfReady = function() {
    if (!bg || !player) return;
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
        return true;
      }
    }
    return false;
  };

  movePlayerHorizontal = function() {
    if (getKey() === "left") moveSpeed = -1.0;
    if (getKey() === "right") moveSpeed = 1.0;
    player.x += moveSpeed * 15.0;
    if (player.x > 548) player.x = 548;
    if (player.x < 0) return player.x = 0;
  };

  moveBars = function() {
    var barVelocity, blocked, leftBar, line, lowerBound, rightBar, thisBlocked, _i, _len;
    blocked = false;
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      leftBar = line[0], rightBar = line[1];
      barVelocity = parseInt(getDanger() * 5 + 1, 10);
      leftBar.y -= barVelocity;
      rightBar.y -= barVelocity;
      thisBlocked = movePlayerVertical(leftBar, rightBar);
      if (thisBlocked) blocked = true;
    }
    if (!blocked) player.y += gravity;
    lowerBound = 570 - player.height;
    if (player.y > lowerBound) return player.y = lowerBound;
  };

  createBars = function(elapsed) {
    nextBar -= elapsed;
    if (nextBar <= 0) {
      nextBar = 2500;
      return lines.push(addLine());
    }
  };

  window.tick = function(elapsed) {
    moveBars();
    movePlayerHorizontal();
    createBars(elapsed);
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
