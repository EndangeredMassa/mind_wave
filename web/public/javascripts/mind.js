window.onload = function(){
  // smoothie charts
  var smoothie = new SmoothieChart();
  smoothie.streamTo(document.getElementById("chart"));

  var attention = new TimeSeries();
  smoothie.addTimeSeries(attention);


  // socket.io
  var socket = io.connect('http://localhost:8080');
  socket.on('data', function (data) {
    attention.append(new Date().getTime(), data.eSense.attention);
    console.log(data.eSense.attention);
  });
  socket.on('connect', function(){
    console.log('connected');
  });
};

