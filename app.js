var appStatus = document.getElementById("status");

// Getting MIDI
var socketId;

var onMIDIMessage = function(message){
  var buffer = message.data.buffer;
  chrome.sockets.udp.send(socketId, buffer, '192.168.0.14', 1337, function(sendInfo){
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
  });
  chrome.sockets.udp.bind(socketId, '0.0.0.0', 1338, function(r){
    appStatus.innerHTML = "socket " + socketId + " bound to port";
  });
});

