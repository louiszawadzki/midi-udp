var adress = "192.168.0.13";
var port = 1337;
var appStatus = document.getElementById("status");

// sound from MIDI signal
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

// Getting MIDI
var socketId; //preparing for later storing the value
var onMIDIMessage = function(message){
  var buffer = message.data.buffer;
  MIDIToSound(buffer);
  chrome.sockets.udp.send(socketId, buffer, adress, port, function(sendInfo){
    console.log("sending info through udp" + buffer);
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
  console.log("fail" + e);
};
if (navigator.requestMIDIAccess) {
    console.log("h");
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    console.log("No MIDI support in your browser.");
}

// UDP Connection
var properties = {};
chrome.sockets.udp.create(properties, function(createInfo){
  socketId = createInfo.socketId;
  appStatus.innerHTML = "socket created";
  chrome.sockets.udp.onReceive.addListener(function(data){
    console.log(data);
    MIDIToSound(data.data);
  });
  chrome.sockets.udp.bind(socketId, '0.0.0.0', port, function(r){
    appStatus.innerHTML = "socket " + socketId + " bound to port 1337";
  });
});


