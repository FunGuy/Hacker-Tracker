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
  if(!String.prototype.format){
    Object.defineProperty(String.prototype, 'format', {
      value: function(){
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number){
          return (args[number] !== undefined)? args[number] : match;
        });
      },
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
}());


(function() {
  var pattern = new Pattern(),
      $elem = $('#pattern_container'),
      $cells = $elem.find('.cell');


  

  var freqs = [ 262, 294, 330, 350, 392, 440, 494, 523 ].reverse();

  $cells.click(function() {
    var $this = $(this),
        row = ($this.parent('.row').attr('data-row') - 1),
        col = ($this.attr('data-col') - 1);

    if(pattern.isPositionOccupied(row, col)) {
      // Clear cell
      pattern.removeSoundAtPosition(row, col);
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

  pattern.on('sound:add', function(data) {

    // Post to DB
    // var dbData = {
    //   sound: data.sound.toJSON(),
    //   row: data.row,
    //   col: data.col
    // };

    // var patternName;

    // Couch.send({
    //   method: 'POST',
    //   query: 'patterns/{0}/grid/row{1}/col{2}'.format(patternName, data.row, data.col)
    // });

  });
  pattern.on('sound:remove', function(data) {

    // Post to DB
    

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
