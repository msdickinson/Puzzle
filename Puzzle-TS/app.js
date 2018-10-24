"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameLogic_1 = require("./GameLogic");
// x:let = 0;
const application = new GameLogic_1.Application();
let playerOne = application.JoinGame();
let playerOneJoinRoom = application.JoinRoom(playerOne.Key);
let playerTwo = application.JoinGame();
let playerTwoJoinRoom = application.JoinRoom(playerTwo.Key);
let playerThree = application.JoinGame();
let playerThreeJoinRoom = application.JoinRoom(playerThree.Key);
let x = 0;
//const time = process.hrtime();
//for (let i = 0; i < (60 * 180); i++) {
//    game.Tick();
//    game.RequestSwitch(0, 0);
//}
//const nanoseconds: any = process.hrtime(time)[1];
//const seconds: any = nanoseconds / 1e9;
////const seconds: any = nanoseconds * 1000000000;
//console.log(nanoseconds);
//console.log(seconds);
//console.log("Exit");
//# sourceMappingURL=app.js.map