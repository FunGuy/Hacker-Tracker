var Pattern = (function() {

  var Pattern = function() {
    this.grid = [];

    this.numRows = 8;
    this.numCols = 8;

    this.playingCol = -1;
    this.playingDelay = 500;

    this.interval = null;

    this.initGrid();

    var audioContext = getAudioContext();
    this.destination = audioContext.createGain();
    this.destination.gain.value = 1;
    this.destination.connect(audioContext.destination);

    _.bindAll(this, 'nextColumn');
  };


  Pattern.prototype.initGrid = function() {
    this.grid = new Array(this.numRows);
    for (var row = 0; row < this.numRows; row++) {
      this.grid[row] = new Array(this.numCols);

      for (var col = 0; col < this.numCols; col++) {
        // Set default to null
        this.grid[row][col] = null;
      }
    }

    this.playingCol = -1;
  };

  Pattern.prototype.play = function() {
    this.interval = setInterval(this.nextColumn, this.playingDelay);
    this.trigger('play');
  };
  Pattern.prototype.stop = function() {
    clearInterval(this.interval);
    this.trigger('stop');
  };


  Pattern.prototype.playColumn = function() {

    for (var row = 0; row < this.numRows; row++) {
      var sound = this.grid[row][this.playingCol];

      if(sound) {
        sound.play();
      }
    }

  };
  Pattern.prototype.nextColumn = function() {
    this.playingCol = ++this.playingCol % this.numCols;
    this.playColumn();
    
    this.trigger('play:column', { columnNumber: this.playingCol });
  };


  Pattern.prototype.setSoundAtPosition = function(sound, row, col) {
    // Check if sound is valid?
    if(typeof sound !== 'object')
      return false;

    if(!this.isPositionValid(row, col))
      return false;

    sound.destinations.push(this.destination);
    this.grid[row][col] = sound;

    this.trigger('sound:add', {
      sound: sound,
      row: row,
      col: col
    });
  };
  Pattern.prototype.removeSoundAtPosition = function(row, col) {
    if(!this.isPositionValid(row, col)) {
      return false;
    }

    this.grid[row][col] = null;
    this.trigger('sound:remove', {
      row: row,
      col: col
    });
  };
  Pattern.prototype.isPositionValid = function(row, col) {
    return (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols);
  };
  Pattern.prototype.isPositionOccupied = function(row, col) {
    return this.isPositionValid(row, col) && this.grid[row][col] !== null;
  };


  // Use Event-system from Backbone
  _.extend(Pattern.prototype, Events);

  return Pattern;

}());