// http://www.w3.org/TR/webaudio/#AudioBuffer
// playBuffer : undefined, // AudioBufferSourceNode
// outputNode : undefined, // AudioNode

var SimpleOscillator = (function(audioContext) {
  // what we'll return
  var SimpleOscillator = function() {
    this.destinations = [];
  };

  SimpleOscillator.prototype = {
    duration : 1,
    playBuffer : undefined,
    outputNode : undefined,
    play : undefined,
    type : 'sine',
    frequencey : 440
  };

  SimpleOscillator.prototype.connect = function(node) {
    this.outputNode.connect(node);
  };

  SimpleOscillator.prototype.play = function() {
    var osc = this.createOscillator();

    for (var i = 0 ; i < this.destinations.length ; i++)
      this.outputNode.connect(this.destinations[i]);
    
    this.playNote(osc);
  };


  SimpleOscillator.prototype.createOscillator = function() {
    var osc = audioContext.createOscillator();
    osc.frequency.value = this.frequency;
    osc.type = this.type;

    var n = fadeInNode(this.duration / 2),
        m = fadeOutNode(this.duration / 2, this.duration / 2);

    osc.connect(n);
    n.connect(m);

    this.outputNode = m;

    return osc;
  };

  SimpleOscillator.prototype.playNote = function(osc) {
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + this.duration);
  };


  // helperz
  function fadeInNode(duration) {
    duration = duration || 1;

    var n = audioContext.createGain(),
        t = audioContext.currentTime;

    n.gain.linearRampToValueAtTime(0, t);
    n.gain.linearRampToValueAtTime(1, t + (duration));

    return n;
  }

  function fadeOutNode(start, duration) {
    duration = duration || 1;
    start = start || 1;

    var n = audioContext.createGain(),
        t = audioContext.currentTime;

    n.gain.linearRampToValueAtTime(1, t + start);
    n.gain.linearRampToValueAtTime(0, t + start + (duration));

    return n;
  }

  return SimpleOscillator;
});
