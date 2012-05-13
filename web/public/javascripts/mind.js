
var moveSpeed = 0;
var nextBar = 2500;
var bars = [];

var bg;
var player;
var stage;
var currentKey;

function rand(min, max) {
  return parseInt(Math.random() * max + min, 10);
}

function createSeries(canvas) {
  var r = rand(0, 255);
  var g = rand(0, 255);
  var b = rand(0, 255);
  var ts = new TimeSeries();
  var smoothie = new SmoothieChart();
  smoothie.streamTo(canvas);
  smoothie.addTimeSeries(
    ts,
    {
      strokeStyle: 'rgb('+r+', '+g+', '+b+')',
      fillStyle: 'rgba('+r+', '+g+', '+b+', 0.4)',
      lineWidth: 3 
    }
  );
  return ts;
}

function $(id) {
  return document.getElementById(id);
}

window.onload = function(){
  // smoothie charts

  var attention = createSeries($('attention'));
  var meditation = createSeries($('meditation'));
  var lowAlpha = createSeries($('low-alpha'));
  var highAlpha = createSeries($('high-alpha'));

  // socket.io
  var socket = io.connect('http://localhost:8080');
  socket.on('data', function (data) {
    currentTime = new Date().getTime()
    attention.append(currentTime, data.eSense.attention);
    meditation.append(currentTime, data.eSense.meditation);
    lowAlpha.append(currentTime, data.eegPower.lowAlpha);
    highAlpha.append(currentTime, data.eegPower.highAlpha);
  });
  socket.on('connect', function(){
    console.log('connected');
  });

  runGame();
};

function runGame(){
  var canvas;

  var bgSrc = new Image();
  bgSrc.src = '/images/bg.jpg';
  bgSrc.name = 'bg';
  bgSrc.onload = function(){
    bg = new Bitmap(bgSrc);;
    buildInterfaceIfReady();
  };

  var playerSrc = new Image();
  playerSrc.src = '/images/player.png';
  playerSrc.name = 'player1';
  playerSrc.onload = function(){
    player = new Bitmap(playerSrc);;
    buildInterfaceIfReady();
  };

  canvas = $('game');
  stage = new Stage(canvas);

  window.addEventListener('keydown', function(e){
    currentKey = e.keyCode;
  });

  Ticker.addListener(window);
  Ticker.useRAF = true;
  Ticker.setInterval(17);
}

function buildInterfaceIfReady()
{
  if(!bg || !player) return;

  player.x = 120;
  player.y = 400;

  stage.addChild(bg, player);
  bars.push(addBar(0, 600));
  stage.update();
}

function addBar(x, y) {
  var text = 'DFGI2G23DFG34DG2SFD82F2SF2SFEWF223';
  var bar = new Text(text, '30px bold Courier New', '#0F0');
  bar.x = x;
  bar.y = y;
  stage.addChild(bar);
  return bar;
}


function getKey(){
  if(currentKey == 37) return 'left';
  if(currentKey == 39) return 'right';
}

function tick(elapsed) {
  // board movement
  for(var i=0; i < bars.length; i++) {
    var bar = bars[i];
    bar.y -= 2;

    var playerBottom = player.y + 65;
    //console.log(playerBottom + ' / ' + player.y + ' / ' + bar.y);
    var barTop = bar.y - 22;

    var onBar = barTop < playerBottom && barTop > player.y;
    var overHole = false;

    if(onBar && !overHole)
      player.y -= (playerBottom - barTop);
  }


  // player movement
  if(getKey() == 'left') {
    moveSpeed = -1.0;
  } else if(getKey() == 'right') {
    moveSpeed = 1.0;
  }

  player.x += (moveSpeed * 4.5);
  if (player.x > 548) { player.x = 548; }
  if (player.x < 0) { player.x = 0; }


  // next tick setup
  nextBar -= elapsed;
  if(nextBar<=0) {
    nextBar = 2000;
    bars.push(addBar(0, 600));
  }

  stage.update();
}

