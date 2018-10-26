"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
const Client_1 = require("./Client");
let server;
let clientOne;
let clientTwo;
let clients = [];
let promises = [];
//Create Server and Two Clients
let serverApplicationPromise = new Promise(function (resolve) {
    server = new Server_1.Server(resolve);
}.bind(this));
////After Server and Two Clients are loaded
Promise.all([serverApplicationPromise]).then(function (values) {
    for (let i = 0; i < 1000; i++) {
        promises.push(new Promise(function (resolve) {
            CreatePlayerAndConnectToServer(resolve);
        }));
    }
    Promise.all(promises).then(function (values) {
    });
}.bind(this));
function CreatePlayerAndConnectToServer(r) {
    let client = null;
    let p1 = null;
    let p2 = null;
    p1 = new Promise(function (resolve) {
        client = new Client_1.Client("", "", resolve);
    }.bind(this));
    p1.then(() => {
        p2 = new Promise(function (resolve) {
            client.ConnectToServer(client.Players[0], resolve);
        }.bind(this));
        p2.then(() => {
            client.NetworkService.JoinRoom(client.Players[0].Socket);
            clients.push(client);
            r();
        });
    });
}
//# sourceMappingURL=App.js.map