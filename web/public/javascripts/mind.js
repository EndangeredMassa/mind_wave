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

var bg;
var player;
var stage;

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

  Ticker.addListener(window);
  Ticker.useRAF = true;
  Ticker.setInterval(17);
}

function buildInterfaceIfReady()
{
  if(!bg || !player) return;

  player.x = 120;
  player.y = 200;

  stage.addChild(bg, player);
  stage.update();
}

var moveSpeed = 1.0;
function tick(){
  player.x += (moveSpeed * 4.5);
  stage.update();
}

