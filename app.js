var appStatus = document.getElementById("status");

/*
 * sound from MIDI signal
 */

var audioContext = new AudioContext();
var gain = audioContext.createGain();
var oscillator = audioContext.createOscillator();
gain.gain.value = 0;
oscillator.connect(gain);
gain.connect(audioContext.destination);
oscillator.start();

var noteToFrequency = function(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

var MIDIToSound = function(buffer){
  var data = new Uint8Array(buffer);
  var cmd = data[0] >> 4;
  var channel = data[0] & 0xf;
  var type = data[0] & 0xf0;
  var note = data[1];
  var velocity = data[2];
  console.log(noteToFrequency(note));
  console.log(note);
  switch(type) {
    case 176:
      if (note != 11) {
        oscillator.frequency.value = noteToFrequency(note);
      }
      gain.gain.value = 1;
      break;
    case 144:
      if (note != 11) {
        oscillator.frequency.value = noteToFrequency(note);
      }
      gain.gain.value = 0;
      break;
  }
}



/*
 * Getting MIDI
 */

var socketId; //preparing for later storing the value
onMIDIMessage = function(message){
  var address = document.getElementById("address").value;
  var buffer = message.data.buffer;
  MIDIToSound(buffer);
  chrome.sockets.udp.send(socketId, buffer, address, 1337, function(sendInfo){
    //console.log("sending info through udp" + buffer);
  });
};
var onMIDISuccess = function(midiAccess){
  var inputs = midiAccess.inputs.values();
  for (var input = inputs.next(); input && !input.done; input= inputs.next()){
    console.log("new input " + input);
    input.value.onmidimessage = onMIDIMessage;
  };
};
var onMIDIFailure = function(e){
    appStatus.innerHTML = "MIDI failed :" + e;
};
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    appStatus.innerHTML = "No MIDI support in your browser.";
}



/*
 * UDP Connection
 */

var properties = {};
chrome.sockets.udp.create(properties, function(createInfo){
  socketId = createInfo.socketId;
  appStatus.innerHTML = "socket created";
  chrome.sockets.udp.onReceive.addListener(function(data){
    console.log(data);
    MIDIToSound(data.data);
  });
  chrome.sockets.udp.bind(socketId, '0.0.0.0', 1337, function(r){
    appStatus.innerHTML = "using port 1337";
  });
});

