/* AudioContext singleton via window.getAudioContext() */
(function(window) {
  if (typeof window.AudioContext === 'undefined') {
    if (typeof webkitAudioContext !== 'undefined')
      AudioContext = webkitAudioContext;
  }

  var audioContext;

  window.getAudioContext = function() {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    return audioContext;
  };
})(window);


var audioContext = getAudioContext();
console.log(audioContext);


var HackerTracker = {
  sounds : {
    SimpleOscillator : SimpleOscillator(audioContext)
  }
};




(function() {
  var pattern = new Pattern(),
      $elem = $('#pattern_container'),
      $cells = $elem.find('.cell');


  GUI.setController(pattern);
  

  var freqs = [ 262, 294, 330, 350, 392, 440, 494, 523 ];

  $cells.click(function() {
    var $this = $(this),
        row = ($this.parent('.row').attr('data-row') - 1),
        col = ($this.attr('data-col') - 1);

    if(pattern.isPositionOccupied(row, col)) {
      // Clear cell
      pattern.clearSoundAtPosition(row, col);
      $this.html('empty');
      $this.removeClass('occupied');
    }
    else {
      // Occupy cell
      
      var sound = new HackerTracker.sounds.SimpleOscillator();
      sound.frequency = freqs[row];
      sound.duration = pattern.playingDelay / 1000;

      pattern.setSoundAtPosition(sound, row, col);
      $this.html('Sound');
      $this.addClass('occupied');
    }
  });


  pattern.on('columnchange', function(data) {
    $cells.removeClass('playing');
    $elem.find('.cell[data-col="'+(data.columnNumber+1)+'"]').addClass('playing');
  });
  pattern.on('stop', function(data) {
    $cells.removeClass('playing');
  });


  pattern.play();


  // #debug
  window.pattern = pattern;

}());



/*
  var main_gain

  function init() {
    main_gain = sound.audioContext.createGain();
    main_gain.gain.value = 1.0;
    main_gain.connect(sound.audioContext.destination)
  }
  */
