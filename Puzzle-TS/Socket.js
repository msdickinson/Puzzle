//import * as WebSocket from 'ws';
//const httpServer = "";
//const ws = new WebSocket({ server: httpServer, path: '/' });
//ws.on('connection', onConnection);
//function onConnection(socket, req) {
//    socket.on('message', onMessage);
//    socket.on('close', onClose);
//    socket.on('error', onError);
//    socket.send("Welcome");
//}
//function onMessage(data) {
//    var socket = this;
//    if (!data) return;
//    var command = null;
//    var value = null;
//    if (data.indexOf(":") > -1) {
//        command = data.split(":")[0];
//        value = data.substring(data.indexOf(":") + 1);
//        //try to phase json
//        try {
//            value = JSON.parse(value);
//        } catch (e) { }
//    } else {
//        command = data;
//    }
//    //execute
//    if (command === "setId") {
//        socket.id = value;
//    }
//}
//function onClose(a, b) {
//    var socketId = this.id;
//    console.log('onClose', socketId);
//}
//function onError(error) {
//    console.log('Cannot start server');
//}
//function sendMessage(id, message, value) {
//    var sentCount = 0;
//    ws.clients.forEach(function each(client) {
//        if (client && client.id === id) {
//            client.send(`${message}:${JSON.stringify(value)}`);
//            sentCount += 1;
//        }
//    });
//    return sentCount;
//}
//# sourceMappingURL=Socket.js.map