"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const ServerApplication_1 = require("./ServerApplication");
const uuidv1 = require('uuid/v1');
const ClientApplication_1 = require("./ClientApplication");
const log = require('simple-node-logger').createSimpleLogger('project.log');
const application = new ServerApplication_1.ServerApplication();
const playerOne = new ClientApplication_1.ClientApplication();
playerOne.Connector.LoadedPromise.then(() => {
    playerOne.JoinGame();
    playerOne.JoinRoom();
    playerOne.UpdateName("Tom");
});
const playerTwo = new ClientApplication_1.ClientApplication();
playerTwo.Connector.LoadedPromise.then(() => {
    playerTwo.JoinGame("Bob");
    playerTwo.JoinRoom();
    playerTwo.UpdateName("Sam");
});
let z = 0;
//let playerOneJoinGameRequest = new JoinGameRequest();
//SendRequest("JoinGame", playerOneJoinGameRequest);
//let playerOneJoinRoomRequest = new JoinRoomRequest();
//SendRequest("JoinRoom", playerOneJoinRoomRequest);
//let playerOneUpdateNameRequest = new UpdateNameRequest();
//playerOneUpdateNameRequest.Name = "Tom";
//playerOneUpdateNameRequest.RoomId = "";
//application.ConsoleRequest("UpdateName", playerOneUpdateNameRequest);
////Sockets
//var socket = null;
//var socketUrl = 'ws://' + 'localhost:8080';
//function setUpSocket() {
//    if (socket) return;
//    socket = new WebSocket(socketUrl);
//    socket.onopen = function (e) {
//        SendRequest("setId:", { id: 1, efg: 2 });
//    };
//    socket.onmessage = function (e) {
//        onSocketMessage(e.data);
//    };
//    socket.onerror = function (e) {
//        console.log("Socket Error: " + e);
//    };
//}
//function onSocketMessage(data) {
//    var command = null;
//    var value = null;
//}
//function SendRequest(request: string, data:object) {
//    socket.send(request + JSON.stringify(data));
//}
//setUpSocket();
//let playerOneJoinGameRequest = new JoinGameRequest();
//SendRequest("JoinGame", playerOneJoinGameRequest);
//let playerOneJoinRoomRequest = new JoinRoomRequest();
//SendRequest("JoinRoom", playerOneJoinRoomRequest);
//let playerOneUpdateNameRequest = new UpdateNameRequest();
//playerOneUpdateNameRequest.Name = "Tom";
//playerOneUpdateNameRequest.RoomId = "";
//application.ConsoleRequest("UpdateName", playerOneUpdateNameRequest);
//let playerTwoJoinGameRequest = new JoinGameRequest();
//playerTwoJoinGameRequest.Name = "Bob"
//application.ConsoleRequest("JoinGame", playerTwoKey, playerTwoJoinGameRequest);
////let playerTwoJoinRoomRequest = new JoinRoomRequest();
////application.ConsoleRequest("JoinRoom", playerTwoKey, playerTwoJoinRoomRequest);
////let playerTwoUpdateNameRequest = new UpdateNameRequest();
////playerTwoUpdateNameRequest.Name = "Jack";
////playerOneUpdateNameRequest.RoomId = "";
////application.ConsoleRequest("UpdateName", playerTwoKey, playerTwoUpdateNameRequest);
////if (playerOneJoinRoom instanceof JoinRoomResult) {
////    application.UpdateName(playerOneJoinRoom.RoomId, playerOne.Key, "Tom");
////}
////let playerTwo = application.JoinGame();
////let playerTwoJoinRoom = application.JoinRoom(playerTwo.Key);
////if (playerTwoJoinRoom instanceof JoinRoomResult) {
////    application.UpdateName(playerTwoJoinRoom.RoomId, playerTwo.Key, "Sam");
////}
////let playerThree = application.JoinGame("Bob");
////let playerThreeJoinRoom = application.JoinRoom(playerThree.Key);
////if (playerThreeJoinRoom instanceof JoinRoomResult) {
////    application.UpdateName(playerThreeJoinRoom.RoomId, playerThree.Key, "Jack");
////}
//let x = 0;
////const time = process.hrtime();
////for (let i = 0; i < (60 * 180); i++) {
////    game.Tick();
////    game.RequestSwitch(0, 0);
////}
//const nanoseconds: any = process.hrtime(time)[1];
//const seconds: any = nanoseconds / 1e9;
////const seconds: any = nanoseconds * 1000000000;
//console.log(nanoseconds);
//console.log(seconds);
//console.log("Exit");
//socket server
//const port = 3000;
//const app = express();
//app.get('/', (req, res) => res.send('Hello World!'));
//app.listen(port, () => console.log(`Example app listening on port ${port}!`));
//let app = http.createServer((req, res) => {
//    // Set a response type of plain text for the response
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    // Send back a response and end the connection
//    res.end('Hello World!\n');
//});
//// Start the server on port 3000
//app.listen(3000, '127.0.0.1');  
//# sourceMappingURL=app.js.map