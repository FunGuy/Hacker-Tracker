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


  GUI.setController(pattern);
  

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


// ajaj - asynchronous javascript and json
//
// http://www.w3.org/TR/XMLHttpRequest
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest?redirectlocale=en-US&redirectslug=DOM%2FXMLHttpRequest
// http://stackoverflow.com/questions/3880381/xmlhttprequest-responsetext-while-loading-readystate-3-in-chrome
// http://ajaxpatterns.org/HTTP_Streaming
//
// 0  UNSENT  open()has not been called yet.
// 1  OPENED  send()has not been called yet.
// 2  HEADERS_RECEIVED  send() has been called, and headers and status are
// available.
// 3  LOADING Downloading; responseText holds partial data.
// 4  DONE  The operation is complete.
function ajaj(cfg) {
  // output element
  var el = document.createElement('section')
  document.getElementsByTagName('body')[0].appendChild(el)

  var xhr = new XMLHttpRequest()
  // TODO why won't it work with responseType set to e.g. document
  //xhr.responseType = 'document'
  //xhr.responseType = 'moz-chunked-arraybuffer'
  //xhr.responseType = 'arraybuffer'
  
  xhr.onreadystatechange = function() {
    console.log('xhr state changed', this, arguments, this.readyState)
    if (this.readyState === this.OPENED)
      cfg.opened()
    else if (this.readyState === this.HEADERS_RECEIVED)
      cfg.headers(xhr)
    else if (this.readyState === this.LOADING)
      cfg.loading(xhr)
    else if (this.readyState === this.DONE)
      cfg.done(xhr) }

  xhr.onload = cfg.onload || function() { console.log('onload', arguments) }
  xhr.onerror = cfg.onerror || function() { console.log('onerror', arguments) }
  xhr.onprogress = cfg.onprogress || function() {
    console.log('onprogress', arguments, xhr.responseText)
    el.innerHTML = xhr.responseText }

  xhr.open(cfg.method || "GET", cfg.url, true)
  console.log('my xhr opened', xhr)
  //xhr.setRequestHeader('Content-Type', 'application/json')
  //xhr.setRequestHeader('Content-Type', 'application/octet-stream')
  console.log('my xhr headers set', xhr)
  xhr.send()
  console.log('my xhr sent', xhr)
}
  //xhr.send(JSON.stringify(cfg.data || {} )) }



var listenToThatChangeFeedAiiiit = function() {
  console.log('trying to listen aiit')
  ajaj( {
    method : 'GET',
    //url : 'http://relax.zarac.se/hacker-tracker/_changes?feed=continuous',
    url : 'http://relax.zarac.se/hacker-tracker/_changes?feed=continuous&heartbeat=60000&limit=100',
    //url : 'http://192.168.0.19:5984/hacker-tracker/_changes?feed=continuous',
    //
    gotChunk : function(xhr) {
      console.log('gotChunk !NI!') },

    opened : function(xhr) {
      console.log('state is opened') },

    headers : function(xhr) {
      console.log('state is headers received') },

    loading : function(xhr) {
      console.log('loading...', xhr) },

    done : function(xhr) {
      console.log('done...', xhr) } } ) }

// document / DOM states (or whatever)
// default dummy functions defined here, meant to be overridden
// https://developer.mozilla.org/docs/Web/API/document.readyState
document.onreadystatechange = function(e) {
  console.log('state changed yeahh', document.readyState);
  ({ loading : function() {},
    interactive : function() { console.log('interactiv000z') },

    complete : function() {
      listenToThatChangeFeedAiiiit()
      console.log('completed loading DOM') } })[document.readyState](e) }
