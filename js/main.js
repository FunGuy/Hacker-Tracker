
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var ctx,
    c_ctx,
    canvas,
    analyser,
    main_gain,
    uint8_array;

function init() {
  ctx = new AudioContext();

  main_gain = ctx.createGain();
  main_gain.gain.value = 1.0;
  main_gain.connect(ctx.destination);

  analyser = ctx.createAnalyser();
  analyser.connect(main_gain);

  uint8_array = new Uint8Array(analyser.frequencyBinCount);

  initCanvas();
  render();
}

function initCanvas() {
  canvas = document.getElementById('canvas');
  c_ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var gradient = c_ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0.0, '#00ff00');
  gradient.addColorStop(0.35, '#ffff00');
  gradient.addColorStop(0.75, '#ff0000');
  gradient.addColorStop(1.0, '#000000');

  c_ctx.fillStyle = gradient;
}

function render() {
  var ctx = c_ctx;


  ctx.clearRect(0, 0, canvas.width, canvas.height);

  analyser.getByteFrequencyData(uint8_array);

  var deltaX = canvas.width / analyser.frequencyBinCount;
  var w = deltaX * 0.7;

  // For each data in array
  for(var data_n = 0, data_len = uint8_array.length; data_n < data_len; ++data_n) {
    var data = uint8_array[data_n];

    ctx.fillRect(data_n*deltaX, 0, w, data);
  }

  window.requestAnimationFrame(render);
}

function playNote(freq, dur, type) {
  var osc = ctx.createOscillator();
  osc.frequency.value = freq || 440;
  osc.type = type || 'sine';

  dur = dur || 1;

  var n = fadeInNode(dur/2),
      m = fadeOutNode(dur/2,dur/2);

  osc.connect(n);
  n.connect(m);
  m.connect(main_gain);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function fadeInNode(time) {
  var n = ctx.createGain(),
      t = ctx.currentTime;

  n.gain.linearRampToValueAtTime(0, t);
  n.gain.linearRampToValueAtTime(1, t+(time || 1));

  return n;
}
function fadeOutNode(start, dur) {
  var n = ctx.createGain(),
      t = ctx.currentTime;

  start = start || 1;

  n.gain.linearRampToValueAtTime(1, t+start);
  n.gain.linearRampToValueAtTime(0, t+start+(dur || 1));

  return n;
}


init();

playNote();
