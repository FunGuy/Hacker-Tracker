/* AudioContext singleton via window.getAudioContext() */
(function(window) {
  if (typeof window.AudioContext === 'undefined') {
    if (typeof webkitAudioContext !== 'undefined') 
      AudioContext = webkitAudioContext }

  var audioContext

  window.getAudioContext = function() {
    if (!audioContext) {

      audioContext = new AudioContext() }

    return audioContext} })(window)


var audioContext = getAudioContext()
  console.log(audioContext)


var HackerTracker = {
  sounds : {
    SimpleOscillator : SimpleOscillator(audioContext) } }


var oscSound = new HackerTracker.sounds.SimpleOscillator(audioContext)

oscSound.destinations.push(getAudioContext().destination)

oscSound.play()

/*
  var main_gain

  function init() {
    main_gain = sound.audioContext.createGain();
    main_gain.gain.value = 1.0;
    main_gain.connect(sound.audioContext.destination)
  }
  */
