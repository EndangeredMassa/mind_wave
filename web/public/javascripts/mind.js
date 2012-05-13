(function() {
  var $, addBar, addLine, bg, buildInterfaceIfReady, charWidth, createBars, createSeries, currentKey, getKey, gravity, lineWidth, lines, moveBars, movePlayerHorizontal, movePlayerVertical, moveSpeed, nextBar, parentRender, player, playerAnim, playerSprites, rand, runGame, stage;

  moveSpeed = 0;

  nextBar = 2500;

  lines = [];

  bg = null;

  player = null;

  playerSprites = null;

  playerAnim = null;

  stage = null;

  currentKey = null;

  charWidth = 15;

  lineWidth = 41;

  gravity = 10;

  $ = function(id) {
    return document.getElementById(id);
  };

  console.log = function() {};

  rand = function(min, max) {
    return parseInt(Math.random() * max + min, 10);
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
    canvas = $("game");
    return stage = new Stage(canvas);
  };

  buildInterfaceIfReady = function() {
    if (!bg || !player) return;
    player.x = 0;
    player.y = 0;
    player.width = 32;
    player.height = 48;
    stage.addChild(player);
    player.gotoAndPlay('right');
    lines.push(addLine(600, rand(1, 20), rand(6, 12)));
    stage.update();
    Ticker.addListener(window);
    Ticker.useRAF = true;
    return Ticker.setInterval(17);
  };

  addLine = function(y, gapPosition, gapSize) {
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

  moveBars = function() {
    var blocked, leftBar, line, lowerBound, rightBar, thisBlocked, _i, _len;
    blocked = false;
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      leftBar = line[0], rightBar = line[1];
      leftBar.y -= 2;
      rightBar.y -= 2;
      thisBlocked = movePlayerVertical(leftBar, rightBar);
      if (thisBlocked) blocked = true;
    }
    if (!blocked) {
      if (player.currentAnimation !== 'falling') player.gotoAndPlay('falling');
      player.y += gravity;
    } else {
      if (player.currentAnimation === 'falling') player.gotoAndPlay('idle');
    }
    lowerBound = 570 - player.height;
    if (player.y > lowerBound) return player.y = lowerBound;
  };

  createBars = function(elapsed) {
    nextBar -= elapsed;
    if (nextBar <= 0) {
      nextBar = 2500;
      return lines.push(addLine(600, rand(1, 20), rand(6, 12)));
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
    /*
      testCtx = $('test').getContext('2d')
      testCtx.fillRect(0, 0, $('test').width, $('test').height)
      testCtx.strokeStyle = '#ffffff'
      testCtx.strokeText('Test', 0, 1)
    */
    host = window.location.host;
    socket = io.connect("http://" + host);
    socket.on("data", function(data) {
      var currentTime;
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
