import * as WebSocket from 'ws';

class ClientSocket {
    public Socket;
    public URL: string;
    public LoadedPromise: any;
    constructor() {
        this.LoadedPromise = new Promise(function (resolve, reject) {
            this.URL = "ws://localhost:8080";

            if (this.Socket) return;

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
    public SendRequest(request: string, data: object) {
        this.Socket.send(request + ":" + JSON.stringify(data));
    }

}

export { ClientSocket }
