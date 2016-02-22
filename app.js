var appStatus = document.getElementById("status");
// Getting MIDI

// UDP Connection
var properties = {};
chrome.sockets.udp.create(properties, function(createInfo){
  var socketId = createInfo.socketId;
  appStatus.innerHTML = "socket created";
  chrome.sockets.udp.onReceive.addListener(function(data){
    console.log(data);
  });
  chrome.sockets.udp.bind(socketId, '0.0.0.0', 0, function(r){
    appStatus.innerHTML = "socket " + socketId + " bound to port";
    /*chrome.sockets.udp.send(socketId, arrayBuffer, '127.0.0.1', 1337, function(sendInfo){
      console.log("sending info through udp");
    });*/
  });
});
