(function() {
  var $, addBar, addLine, bg, buildInterfaceIfReady, charWidth, createBars, createSeries, currentKey, getKey, gravity, lines, moveBars, movePlayerHorizontal, movePlayerVertical, moveSpeed, nextBar, player, rand, runGame, stage;

  moveSpeed = 0;

  nextBar = 2500;

  lines = [];

  bg = null;

  player = null;

  stage = null;

  currentKey = null;

  charWidth = 20;

  gravity = 10;

  $ = function(id) {
    return document.getElementById(id);
  };

  rand = function(min, max) {
    return parseInt(Math.random() * max + min, 10);
  };

  createSeries = function(canvas) {
    var b, g, r, smoothie, ts;
    r = rand(0, 255);
    g = rand(0, 255);
    b = rand(0, 255);
    ts = new TimeSeries();
    smoothie = new SmoothieChart();
    smoothie.streamTo(canvas);
    smoothie.addTimeSeries(ts, {
      strokeStyle: "rgb(" + r + ", " + g + ", " + b + ")",
      fillStyle: "rgba(" + r + ", " + g + ", " + b + ", 0.4)",
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
    stage.addChild(bg, player);
    lines.push(addLine(600, 10));
    return stage.update();
  };

  addLine = function(y, gap) {
    var leftBar, rightBar;
    leftBar = addBar(0, y, 15);
    rightBar = addBar(400, y, 10);
    return [leftBar, rightBar];
  };

  addBar = function(x, y, width) {
    var bar, text;
    text = "a8be76ac87b6a897e6ca98e7b628bcdeb".substr(width);
    bar = new Text(text, "30px bold Courier New", "#0F0");
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
    /*
      console.log 'player.y='+player.y
      console.log 'player-height='+player.height
      console.log 'bar.y='+leftBar.y
      console.log 'playerBottom='+playerBottom
    */
    barTop = leftBar.y - leftBar.height;
    diff = playerBottom - barTop;
    onBarLevel = diff <= 10 && diff >= 0;
    if (onBarLevel) {
      holeLeft = leftBar.x + (leftBar.width * charWidth);
      holeRight = rightBar.x;
      playerLeft = player.x;
      playerRight = player.x + player.width;
      /*
          console.log 'x: ' + rightBar.x
          console.log 'width: ' + rightBar.width
      
          console.log 'holeLeft: ' + holeLeft
          console.log 'holeRight:' + holeRight
          console.log 'playerLeft: ' + playerLeft
          console.log 'playerRight: ' + playerRight
      */
      if (playerLeft > holeLeft && playerRight < holeRight) {
        return false;
      } else {
        console.log('adjusting player to bar');
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
    var blocked, leftBar, line, rightBar, thisBlocked, _i, _len;
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
      console.log('falling!');
      return player.y += gravity;
    }
  };

  createBars = function(elapsed) {
    nextBar -= elapsed;
    if (nextBar <= 0) {
      nextBar = 2500;
      return lines.push(addLine(600, 10));
    }
  };

  window.tick = function(elapsed) {
    moveBars();
    movePlayerHorizontal();
    createBars(elapsed);
    return stage.update();
  };

  window.onload = function() {
    var attention, highAlpha, host, lowAlpha, meditation, socket;
    attention = createSeries($("attention"));
    meditation = createSeries($("meditation"));
    lowAlpha = createSeries($("low-alpha"));
    highAlpha = createSeries($("high-alpha"));
    host = window.location.host;
    socket = io.connect("http://" + host);
    socket.on("data", function(data) {
      var currentTime;
      currentTime = new Date().getTime();
      attention.append(currentTime, data.eSense.attention);
      meditation.append(currentTime, data.eSense.meditation);
      lowAlpha.append(currentTime, data.eegPower.lowAlpha);
      return highAlpha.append(currentTime, data.eegPower.highAlpha);
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
