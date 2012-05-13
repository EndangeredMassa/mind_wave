(function() {
  var $, addBar, bars, bg, buildInterfaceIfReady, createSeries, currentKey, getKey, moveSpeed, nextBar, player, rand, runGame, stage;

  moveSpeed = 0;

  nextBar = 2500;

  bars = [];

  bg = null;

  player = null;

  stage = null;

  currentKey = null;

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
    canvas = null;
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
    player.x = 120;
    player.y = 400;
    stage.addChild(bg, player);
    bars.push(addBar(0, 600));
    return stage.update();
  };

  addBar = function(x, y) {
    var bar, text;
    text = "DFGI2G23DFG34DG2SFD82F2SF2SFEWF223";
    bar = new Text(text, "30px bold Courier New", "#0F0");
    bar.x = x;
    bar.y = y;
    stage.addChild(bar);
    return bar;
  };

  getKey = function() {
    if (currentKey === 37) return "left";
    if (currentKey === 39) return "right";
  };

  window.tick = function(elapsed) {
    var bar, barTop, i, onBar, overHole, playerBottom, _i, _len;
    i = 0;
    for (_i = 0, _len = bars.length; _i < _len; _i++) {
      bar = bars[_i];
      bar.y -= 2;
      playerBottom = player.y + 65;
      barTop = bar.y - 22;
      onBar = barTop < playerBottom && barTop > player.y;
      overHole = false;
      if (onBar && !overHole) player.y -= playerBottom - barTop;
    }
    if (getKey() === "left") moveSpeed = -1.0;
    if (getKey() === "right") moveSpeed = 1.0;
    player.x += moveSpeed * 15.0;
    if (player.x > 548) player.x = 548;
    if (player.x < 0) player.x = 0;
    nextBar -= elapsed;
    if (nextBar <= 0) {
      nextBar = 2000;
      bars.push(addBar(0, 600));
    }
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
