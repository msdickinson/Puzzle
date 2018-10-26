"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class ClientSocket {
    constructor() {
        this.LoadedPromise = new Promise(function (resolve, reject) {
            this.URL = "ws://localhost:8080";
            if (this.Socket)
                return;
            this.Socket = new WebSocket(this.URL);
            this.Socket.onopen = function (e) {
                resolve();
            }.bind(this);
            this.Socket.onerror = function (e) {
                console.log("Socket Error: " + e);
            };
        }.bind(this));
        //this.URL = "ws://localhost:8080";
        //if (this.Socket) return;
        //this.Socket = new WebSocket(this.URL);
        //this.Socket.onopen = function (e) {
        //    resolver(this);
        //}.bind(this);
        //this.Socket.onSocketMessage = function (e) {
        //this.Socket.onerror = function (e) {
        //    console.log("Socket Error: " + e);
        //};
    }
    SendRequest(request, data) {
        this.Socket.send(request + ":" + JSON.stringify(data));
    }
}
exports.ClientSocket = ClientSocket;
//# sourceMappingURL=ClientSocket.js.map